import { messageInsertSchema } from '@/lib/schemas/message.schemas'
import { ticketSchema } from '@/lib/schemas/ticket.schemas'
import { SendGridInboundPayload } from '@/lib/sendgrid'
import { createServiceClient } from '@/lib/supabase/service'
import { EmailService } from '@/services/email.services'

import type { MessageInsert } from '@/lib/schemas/message.schemas'
import type { TicketRow } from '@/lib/schemas/ticket.schemas'
import type { UserRow } from '@/lib/schemas/user.schemas'

const supabase = createServiceClient()

/**
 * Extract the actual reply content from an email body by removing thread history
 */
function extractReplyContent(text: string): string {
    const patterns = [
        /On .+? wrote:[\s\S]*$/i, // SendGrid/Gmail style
        /\s*[-_]{2,}[\s\S]*Forwarded message[\s\S]*$/i, // General style
        /From:[\s\S]*Sent:[\s\S]*To:[\s\S]*Subject:[\s\S]*$/i, // Outlook
        /\s*>[^\n]*$/gm, // Quote markers
        /\n+$/, // Extra newlines
    ]

    return (
        patterns.reduce(
            (text, pattern) => text.replace(pattern, ''),
            text.trim(),
        ) || text.trim()
    )
}

/**
 * Check if an email is one of our test emails in development mode
 */
function isTestEmail(email: string): false | 'agent' | 'customer' {
    if (process.env.NODE_ENV !== 'development') return false
    if (email === process.env.SENDGRID_TEST_EMAIL_AGENT) return 'agent'
    if (email === process.env.SENDGRID_TEST_EMAIL) return 'customer'
    return false
}

/**
 * Extract ticket ID from email subject
 * Format: "Re: [Metta] Original Subject (#ticket_id)"
 */
function extractTicketId(subject: string): string {
    const match = subject.match(/\(#([a-zA-Z0-9]+)\)/)
    if (!match) throw new Error('No ticket ID found in subject')
    return match[1]
}

/**
 * Find a ticket by ID and validate it
 */
async function findTicket(id: string): Promise<TicketRow> {
    const { data, error } = await supabase
        .from('tickets')
        .select('*')
        .eq('id', id)
        .single()

    if (error || !data) throw new Error('Ticket not found')
    return ticketSchema.parse(data)
}

/**
 * Find a user by email
 */
async function findUser(email: string): Promise<UserRow> {
    const { data, error } = await supabase
        .from('users')
        .select('*, profiles(*)')
        .eq('email', email)
        .single()

    if (error || !data) throw new Error('User not found')
    return data
}

/**
 * Create a message in the database
 */
async function createMessage(data: MessageInsert): Promise<void> {
    const { error } = await supabase.from('messages').insert(data)
    if (error) throw new Error('Failed to create message')
}

/**
 * Send notification to the appropriate recipient
 */
async function sendNotification(params: {
    ticket: TicketRow
    sender: UserRow
    isAgent: boolean
    messageContent: string
}): Promise<void> {
    const { ticket, sender, isAgent, messageContent } = params

    if (isAgent) {
        // Agent replied - notify customer
        const { data: customer } = await supabase
            .from('users')
            .select('*')
            .eq('id', ticket.customer_id)
            .single()

        if (customer) {
            console.log('[SendGrid] Notifying customer:', customer.email)
            await EmailService.sendAgentReplyNotification(
                ticket,
                customer,
                messageContent,
            )
        }
    } else if (ticket.agent_id) {
        // Customer replied - notify agent if assigned
        const { data: agent } = await supabase
            .from('users')
            .select('*')
            .eq('id', ticket.agent_id)
            .single()

        if (agent) {
            console.log('[SendGrid] Notifying agent:', agent.email)
            await EmailService.sendCustomerReplyNotification(
                ticket,
                agent,
                sender,
                messageContent,
            )
        }
    } else {
        console.log('[SendGrid] No agent assigned to notify')
    }
}

export async function POST(request: Request) {
    try {
        const formData = await request.formData()
        const payload = Object.fromEntries(
            formData.entries(),
        ) as unknown as SendGridInboundPayload

        console.log('[SendGrid] Processing email:', {
            from: payload.from,
            subject: payload.subject,
        })

        // Get ticket and validate it exists
        const ticketId = extractTicketId(payload.subject)
        const ticket = await findTicket(ticketId)

        // Get sender, using test user in development if needed
        let sender: UserRow
        let isTestUser = false
        const testEmailType = isTestEmail(payload.from)

        if (testEmailType !== false) {
            const testUser = await EmailService.getTestUser(testEmailType)
            if (!testUser) throw new Error('Test user not found')

            sender = testUser
            isTestUser = true
            console.log('[SendGrid] Development mode: Using proxy user:', {
                role: testEmailType,
                email: sender.email,
            })
        } else {
            sender = await findUser(payload.from)
        }

        // Clean and prepare message content
        const messageContent = extractReplyContent(payload.text)
        const messageHtml = payload.html
            ? extractReplyContent(payload.html)
            : messageContent

        // Determine sender role
        const isAgent = isTestUser
            ? testEmailType === 'agent'
            : Boolean(ticket.agent_id && sender.id === ticket.agent_id)
        const role = isAgent ? 'agent' : 'customer'

        console.log('[SendGrid] Creating message:', {
            ticket_id: ticket.id,
            sender_id: sender.id,
            role,
            is_test: isTestUser,
            test_type: testEmailType,
        })

        // Create the message
        const messageData = messageInsertSchema.parse({
            ticket_id: ticket.id,
            user_id: sender.id,
            role,
            content: messageContent,
            html_content: messageHtml,
        })
        await createMessage(messageData)

        // Send notification to the other party
        await sendNotification({ ticket, sender, isAgent, messageContent })

        return new Response(null, { status: 200 })
    } catch (error) {
        console.error('[SendGrid Webhook] Error:', error)
        const message =
            error instanceof Error ? error.message : 'Internal server error'
        const status = message.includes('not found') ? 404 : 500
        return new Response(message, { status })
    }
}
