import { createClient } from '@supabase/supabase-js'

import type { Database } from '@/lib/supabase/types'

export interface SeedInternalNote {
    content: string
    ticket_subject: string // Used to match with the ticket
    agent_index: number // -1 for demo agent, 2-3 for other agents
}

export const SEED_INTERNAL_NOTES: SeedInternalNote[] = [
    {
        content:
            'Customer has been charged twice, refund initiated through Stripe.',
        ticket_subject: 'Billing cycle question',
        agent_index: -1,
    },
    {
        content: 'Escalated to engineering team for investigation.',
        ticket_subject: 'Urgent: Service downtime',
        agent_index: -1,
    },
    {
        content:
            'Previous similar issues were resolved by clearing browser cache.',
        ticket_subject: 'Need help with login',
        agent_index: 2,
    },
    {
        content:
            'Confirmed bug in export service. Engineering team is working on a fix.',
        ticket_subject: 'Bug in export functionality',
        agent_index: 3,
    },
    {
        content:
            'Refund processed successfully. Added courtesy credit for inconvenience.',
        ticket_subject: 'Billing issue',
        agent_index: 3,
    },
]

export async function seedInternalNotes(
    supabase: ReturnType<typeof createClient<Database>>,
) {
    console.log('📝 Creating seed internal notes...')

    // Get all required users and tickets
    const { data: demoAgent } = await supabase
        .from('users')
        .select('id')
        .eq('email', 'demo@example.com')
        .single()

    const { data: agents } = await supabase
        .from('users')
        .select('id')
        .in('email', ['agent1@example.com', 'agent2@example.com'])

    const { data: tickets } = await supabase
        .from('tickets')
        .select('id, subject')

    if (!demoAgent || !agents || !tickets) {
        throw new Error('Failed to find seed users or tickets')
    }

    const notes = SEED_INTERNAL_NOTES.map(note => {
        const ticket = tickets.find(t => t.subject === note.ticket_subject)
        if (!ticket) {
            throw new Error(
                `Failed to find ticket with subject: ${note.ticket_subject}`,
            )
        }

        return {
            content: note.content,
            ticket_id: ticket.id,
            created_by:
                note.agent_index === -1
                    ? demoAgent.id
                    : agents[note.agent_index - 2].id,
        }
    })

    const { error } = await supabase.from('ticket_internal_notes').insert(notes)

    if (error) throw error
    console.log('✅ Seed internal notes created successfully')
}
