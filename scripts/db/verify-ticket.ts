import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

// Load environment variables from .env.local
dotenv.config({ path: '.env.local' })

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
)

async function verifyTicket(ticketId: string) {
    try {
        console.log('Verifying ticket ID:', ticketId)

        const { data: ticket, error } = await supabase
            .from('tickets')
            .select('*')
            .eq('id', ticketId)
            .single()

        if (error) {
            console.error('❌ Error:', error.message)
            return
        }

        if (!ticket) {
            console.error('❌ Ticket not found')
            return
        }

        console.log('✅ Ticket found:', {
            id: ticket.id,
            subject: ticket.subject,
            status: ticket.status,
            priority: ticket.priority,
            created_at: ticket.created_at,
        })
    } catch (error) {
        console.error('❌ Error:', error)
    }
}

// Get ticket ID from command line argument
const ticketId = process.argv[2]
if (!ticketId) {
    console.error('❌ Please provide a ticket ID')
    console.log('Usage: bun run verify-ticket <ticket_id>')
    process.exit(1)
}

verifyTicket(ticketId)
