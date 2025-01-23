import type { SupabaseClient } from '@supabase/supabase-js'

interface StatusHistoryEntry {
    ticket_index: number // Maps to the index in SEED_TICKETS
    changes: Array<{
        old_status: 'new' | 'open' | 'closed' | null
        new_status: 'new' | 'open' | 'closed'
        agent_index: number // -1 for demo agent, 2-3 for other agents
        minutes_ago: number
    }>
}

const STATUS_HISTORY: StatusHistoryEntry[] = [
    // Index 0: API integration ticket (new)
    // No history needed as it's still new

    // Index 1: Billing cycle question (open)
    {
        ticket_index: 1,
        changes: [
            {
                old_status: 'new',
                new_status: 'open',
                agent_index: -1,
                minutes_ago: 60,
            },
        ],
    },

    // Index 2: Password reset ticket (closed)
    {
        ticket_index: 2,
        changes: [
            {
                old_status: 'new',
                new_status: 'open',
                agent_index: -1,
                minutes_ago: 240,
            },
            {
                old_status: 'open',
                new_status: 'closed',
                agent_index: -1,
                minutes_ago: 180,
            },
        ],
    },

    // Index 3: Feature suggestion: Teams (open)
    {
        ticket_index: 3,
        changes: [
            {
                old_status: 'new',
                new_status: 'open',
                agent_index: -1,
                minutes_ago: 1440,
            }, // 24 hours ago
        ],
    },

    // Index 4: Service downtime (new)
    // No history needed as it's still new

    // Index 5: Login help (open)
    {
        ticket_index: 5,
        changes: [
            {
                old_status: 'new',
                new_status: 'open',
                agent_index: 2,
                minutes_ago: 120,
            },
        ],
    },

    // Index 6: Bug in export functionality (open)
    {
        ticket_index: 6,
        changes: [
            {
                old_status: 'new',
                new_status: 'open',
                agent_index: 3,
                minutes_ago: 90,
            },
        ],
    },

    // Index 7: Integration with Slack (new)
    // No history needed as it's still new

    // Index 8: Billing issue (closed)
    {
        ticket_index: 8,
        changes: [
            {
                old_status: 'new',
                new_status: 'open',
                agent_index: 3,
                minutes_ago: 360,
            },
            {
                old_status: 'open',
                new_status: 'closed',
                agent_index: 3,
                minutes_ago: 300,
            },
        ],
    },

    // Index 9: Feature request: Dark mode (open)
    {
        ticket_index: 9,
        changes: [
            {
                old_status: 'new',
                new_status: 'open',
                agent_index: 2,
                minutes_ago: 180,
            },
        ],
    },

    // Index 10: Thank you note (closed)
    {
        ticket_index: 10,
        changes: [
            {
                old_status: 'new',
                new_status: 'open',
                agent_index: 2,
                minutes_ago: 240,
            },
            {
                old_status: 'open',
                new_status: 'closed',
                agent_index: 2,
                minutes_ago: 200,
            },
        ],
    },

    // Index 11: Mobile app suggestion (new)
    // No history needed as it's still new
]

export async function seedStatusHistory(
    supabase: SupabaseClient,
    ticketMap: Record<number, string>,
    agentMap: Record<number, string>,
) {
    console.log('📝 Creating ticket status history...')

    // Create history entries
    for (const entry of STATUS_HISTORY) {
        const ticketId = ticketMap[entry.ticket_index]
        if (!ticketId) {
            console.warn(`⚠️ No ticket found for index ${entry.ticket_index}`)
            continue
        }

        for (const change of entry.changes) {
            const agentId = agentMap[change.agent_index]
            if (!agentId) {
                console.warn(
                    `⚠️ No agent found for index ${change.agent_index}`,
                )
                continue
            }

            const timestamp = new Date(
                Date.now() - change.minutes_ago * 60 * 1000,
            )

            await supabase
                .from('ticket_status_history')
                .insert({
                    ticket_id: ticketId,
                    old_status: change.old_status,
                    new_status: change.new_status,
                    changed_by: agentId,
                    created_at: timestamp.toISOString(),
                })
                .throwOnError()
        }
    }

    console.log('✅ Ticket status history created')
}
