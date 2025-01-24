import { messageInsertSchema } from '@/lib/schemas/message.schemas'
import { ticketSchema } from '@/lib/schemas/ticket.schemas'
import { SendGridInboundPayload } from '@/lib/sendgrid'
import { createServiceClient } from '@/lib/supabase/service'
import { EmailService } from '@/services/email.services'
import { generateTicketAccessToken } from '@/services/ticket-access.services'

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
 * Check if an email matches our test emails
 */
function isTestEmail(email: string): false | 'agent' | 'customer' {
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
async function _findUser(email: string): Promise<UserRow> {
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
        const { data: customer, error } = await supabase
            .from('users')
            .select('*')
            .eq('id', ticket.customer_id)
            .single()

        if (error || !customer) {
            console.error('[SendGrid] Failed to find customer:', error)
            throw new Error('Customer not found for notification')
        }

        console.log('[SendGrid] Agent reply - notifying customer:', {
            agent_email: sender.email,
            customer_email: customer.email,
            ticket_id: ticket.id,
        })

        // Generate access token for customer to view ticket
        const accessToken = await generateTicketAccessToken(
            ticket.id,
            '7 days',
            sender.id,
        )

        await EmailService.sendAgentReplyNotification(
            ticket,
            customer,
            messageContent,
            accessToken,
        )
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

/**
 * Extract email address from a From field
 * Handles formats like "Name <email@example.com>" or just "email@example.com"
 */
function extractEmailAddress(from: string): string {
    const match = from.match(/<(.+?)>/) // Match anything between < and >
    return match ? match[1] : from.trim() // If no match, assume the whole string is an email
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

        // Get sender, always checking for test emails
        let sender: UserRow
        let isTestUser = false
        const senderEmail = extractEmailAddress(payload.from)
        const testEmailType = isTestEmail(senderEmail)

        if (testEmailType !== false) {
            if (testEmailType === 'customer') {
                // For customer messages, use the actual ticket customer
                const { data: customer } = await supabase
                    .from('users')
                    .select('*, profiles(*)')
                    .eq('id', ticket.customer_id)
                    .single()

                if (!customer) throw new Error('Customer not found')
                sender = customer
            } else {
                // For agent messages, use the test agent user
                const testUser = await EmailService.getTestUser(testEmailType)
                if (!testUser) throw new Error('Test user not found')
                sender = testUser
            }
            isTestUser = true
            console.log('[SendGrid] Using proxy user:', {
                role: testEmailType,
                email: sender.email,
                is_actual_customer: testEmailType === 'customer',
            })
        } else {
            // If not a test email, try to find the actual user first
            console.log('[SendGrid] Looking up user by email:', senderEmail)
            const { data: actualUser } = await supabase
                .from('users')
                .select('*, profiles(*)')
                .eq('email', senderEmail)
                .single()

            if (actualUser) {
                console.log('[SendGrid] Found actual user:', actualUser.email)
                sender = actualUser
                isTestUser = false
            } else {
                // Fall back to test agent if user not found
                console.log(
                    '[SendGrid] User not found, falling back to test agent',
                )
                const testUser = await EmailService.getTestUser('agent')
                if (!testUser) {
                    console.error('[SendGrid] Failed to get test agent user')
                    throw new Error(
                        'Could not find actual user or test user for: ' +
                            senderEmail,
                    )
                }
                sender = testUser
                isTestUser = true
            }
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
