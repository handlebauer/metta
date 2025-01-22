import { messageInsertSchema } from '@/lib/schemas/message.schemas'
import { ticketSchema } from '@/lib/schemas/ticket.schemas'
import { SendGridInboundPayload } from '@/lib/sendgrid'
import { createServiceClient } from '@/lib/supabase/service'
import { MessageService } from '@/services/message.services'

import type { MessageInsert } from '@/lib/schemas/message.schemas'

const messageService = new MessageService()
const supabase = createServiceClient()

export async function POST(request: Request) {
    try {
        const userAgent = request.headers.get('user-agent')
        if (userAgent !== 'Sendgrid/1.0') {
            console.error('Invalid User-Agent:', userAgent)
            return new Response('Invalid User-Agent', { status: 403 })
        }

        const formData = await request.formData()
        // Cast to unknown first to satisfy TypeScript
        const payload = Object.fromEntries(
            formData.entries(),
        ) as unknown as SendGridInboundPayload

        console.log('[SendGrid] Inbound webhook payload:', {
            from: payload.from,
            subject: payload.subject,
            attachment_count: payload.attachment_count,
        })

        // Extract ticket ID from email subject
        // Format: "Re: [Metta] Original Subject (#ticket_id)"
        const ticketIdMatch = payload.subject.match(/\(#([a-zA-Z0-9]+)\)/)
        if (!ticketIdMatch) {
            console.error('No ticket ID found in subject:', payload.subject)
            return new Response('Invalid ticket reference', { status: 400 })
        }

        const ticketId = ticketIdMatch[1]
        console.log('Extracted ticket ID:', ticketId)

        // Verify ticket exists
        const { data: rawTicket, error: ticketError } = await supabase
            .from('tickets')
            .select('*')
            .eq('id', ticketId)
            .single()

        if (ticketError || !rawTicket) {
            console.error('Ticket not found:', ticketId)
            return new Response('Ticket not found', { status: 404 })
        }

        // Validate ticket data against schema
        const ticket = ticketSchema.parse(rawTicket)

        // Get customer from email
        const { data: user, error: userError } = await supabase
            .from('users')
            .select('id')
            .eq('email', payload.from)
            .single()

        if (userError || !user) {
            console.error('User not found for email:', payload.from)
            return new Response('User not found', { status: 404 })
        }

        // Create message using text content
        const messageContent = payload.text
        const messageHtml = payload.html || messageContent

        // Validate message data against schema
        const messageData: MessageInsert = messageInsertSchema.parse({
            ticket_id: ticket.id,
            user_id: user.id,
            role: 'customer',
            content: messageContent,
            html_content: messageHtml,
        })

        await messageService.create(messageData)

        // Always return 200 for successfully processed webhooks
        return new Response(null, { status: 200 })
    } catch (error) {
        console.error('[SendGrid Webhook]', error)
        return new Response('Internal server error', { status: 500 })
    }
}
