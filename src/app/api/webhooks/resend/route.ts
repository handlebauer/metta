import { Webhook } from 'svix'

import { createClient } from '@/lib/supabase/server'
import { MessageService } from '@/services/message.services'
import { TicketService } from '@/services/ticket.services'

const messageService = new MessageService()
const ticketService = new TicketService()

type EmailType =
    | 'email.sent'
    | 'email.delivered'
    | 'email.delivery_delayed'
    | 'email.complained'
    | 'email.bounced'
    | 'email.opened'
    | 'email.clicked'

interface WebhookEvent {
    created_at: string
    data: {
        created_at: string
        email_id: string
        from: string
        subject: string
        to: string[]
    }
    type: EmailType
}

// Get the webhook secret from environment variable
const WEBHOOK_SECRET = process.env.RESEND_WEBHOOK_SECRET
if (!WEBHOOK_SECRET) {
    throw new Error('RESEND_WEBHOOK_SECRET is not set')
}

export async function POST(request: Request) {
    const payload = (await request.json()) as WebhookEvent

    try {
        // Verify webhook signature
        const svix_id = request.headers.get('svix-id')
        const svix_timestamp = request.headers.get('svix-timestamp')
        const svix_signature = request.headers.get('svix-signature')

        // Validate required headers
        if (!svix_id || !svix_timestamp || !svix_signature) {
            console.error('Missing svix headers')
            return new Response('Missing svix headers', { status: 400 })
        }

        // Create Webhook instance for verification
        const wh = new Webhook(WEBHOOK_SECRET!)

        try {
            wh.verify(JSON.stringify(payload), {
                'svix-id': svix_id,
                'svix-timestamp': svix_timestamp,
                'svix-signature': svix_signature,
            })
        } catch (err) {
            console.error('Webhook verification failed:', err)
            return new Response('Webhook verification failed', { status: 400 })
        }

        // Extract ticket ID from email subject
        // Assuming subject format: "Re: Ticket #[ticket_id] - Original Subject"
        const ticketIdMatch = payload.data.subject.match(
            /Ticket #([a-zA-Z0-9]+)/,
        )
        if (!ticketIdMatch) {
            console.error(
                'No ticket ID found in subject:',
                payload.data.subject,
            )
            return new Response('Invalid ticket reference', { status: 400 })
        }

        const ticketId = ticketIdMatch[1]

        // Verify ticket exists
        const ticket = await ticketService.findById(ticketId)
        if (!ticket) {
            console.error('Ticket not found:', ticketId)
            return new Response('Ticket not found', { status: 404 })
        }

        // Get customer from email
        const db = await createClient()
        const { data: user } = await db
            .from('users')
            .select('id')
            .eq('email', payload.data.from)
            .single()

        if (!user) {
            console.error('User not found for email:', payload.data.from)
            return new Response('User not found', { status: 404 })
        }

        // Create message
        await messageService.create({
            ticket_id: ticketId,
            user_id: user.id,
            role: 'customer',
            content: payload.data.subject, // Note: Resend doesn't provide the email body in webhooks
            html_content: payload.data.subject,
        })

        return new Response(null, { status: 200 })
    } catch (error) {
        console.error('[Resend Webhook]', error)
        return new Response('Internal server error', { status: 500 })
    }
}
