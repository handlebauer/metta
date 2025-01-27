import { createClient } from '@supabase/supabase-js'

import type { TicketInternalNoteInsert } from '@/lib/schemas/ticket.schemas'
import type { Database } from '@/lib/supabase/types'

export interface SeedInternalNote {
    content: string
    ticket_index: number
    agent_index: number // -1 for demo agent, 2-3 for other agents
}

export const SEED_INTERNAL_NOTES: SeedInternalNote[] = [
    {
        content:
            'Customer has been charged twice, refund initiated through Stripe.',
        ticket_index: 0,
        agent_index: -1,
    },
    {
        content: 'Escalated to engineering team for investigation.',
        ticket_index: 1,
        agent_index: -1,
    },
    {
        content:
            'Previous similar issues were resolved by clearing browser cache.',
        ticket_index: 2,
        agent_index: 2,
    },
    {
        content:
            'Confirmed bug in export service. Engineering team is working on a fix.',
        ticket_index: 3,
        agent_index: 3,
    },
    {
        content:
            'Refund processed successfully. Added courtesy credit for inconvenience.',
        ticket_index: 4,
        agent_index: 3,
    },
]

export async function seedInternalNotes(
    supabase: ReturnType<typeof createClient<Database>>,
) {
    console.log('📝 Creating seed internal notes...')

    // Get all required agents
    const { data: demoAgent } = await supabase
        .from('users')
        .select('id')
        .eq('email', 'demo@metta.now')
        .single()

    const { data: agents } = await supabase
        .from('users')
        .select('id')
        .in('email', ['agent1@example.com', 'agent2@example.com'])

    if (!demoAgent || !agents) {
        throw new Error('Failed to find agents')
    }

    // Get all tickets
    const { data: tickets } = await supabase.from('tickets').select('id')
    if (!tickets) {
        throw new Error('Failed to find tickets')
    }

    const notes: TicketInternalNoteInsert[] = SEED_INTERNAL_NOTES.map(note => ({
        content: note.content,
        ticket_id: tickets[note.ticket_index].id,
        created_by:
            note.agent_index === -1
                ? demoAgent.id
                : agents[note.agent_index - 2].id,
    }))

    const { error } = await supabase.from('ticket_internal_notes').insert(notes)

    if (error) throw error
    console.log('✅ Seed internal notes created successfully')
}
