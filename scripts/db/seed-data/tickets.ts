import { type SupabaseClient } from '@supabase/supabase-js'

import type { TicketPriority } from '@/lib/schemas/ticket.schemas'

export interface SeedTicket {
    subject: string
    description: string
    status: 'new' | 'open' | 'closed'
    priority: TicketPriority
    customer_index: number // -2 for test customer, 0-1 for other customers
    agent_index?: number // -1 for demo agent, 2-3 for other agents
}

export const SEED_TICKETS: SeedTicket[] = [
    // Test customer tickets (previously demo user tickets)
    {
        subject: 'Need help with API integration',
        description:
            'Looking to integrate your REST API with our existing system. Can you provide documentation?',
        status: 'new',
        priority: 'medium',
        customer_index: -2, // Test Customer
    },
    {
        subject: 'Billing cycle question',
        description:
            'When does the billing cycle start? I was charged on an unexpected date.',
        status: 'open',
        priority: 'high', // Money-related issues are high priority
        customer_index: -2, // Test Customer
        agent_index: -1, // Demo Agent
    },
    {
        subject: 'Password reset not working',
        description:
            'The password reset link in my email is not working. Can you help?',
        status: 'closed',
        priority: 'high', // Account access issues are high priority
        customer_index: -2, // Test Customer
        agent_index: -1, // Demo Agent
    },
    {
        subject: 'Feature suggestion: Teams',
        description:
            'It would be great to have team management features for enterprise accounts.',
        status: 'open',
        priority: 'low', // Feature requests are typically low priority
        customer_index: -2, // Test Customer
        agent_index: -1, // Demo Agent
    },
    {
        subject: 'Urgent: Service downtime',
        description:
            'Getting 503 errors when trying to access the dashboard. Is there an outage?',
        status: 'new',
        priority: 'urgent', // Service outages are urgent priority
        customer_index: -2, // Test Customer
    },

    // Customer 1 tickets
    {
        subject: 'Need help with login',
        description:
            'I am unable to log in to my account. It keeps saying my password is incorrect.',
        status: 'open',
        priority: 'high', // Account access issues are high priority
        customer_index: 0, // customer1
        agent_index: 2, // agent1
    },
    {
        subject: 'Bug in export functionality',
        description: 'When I try to export my data, the CSV file is empty.',
        status: 'open',
        priority: 'medium', // Functional issues are medium priority
        customer_index: 0, // customer1
        agent_index: 3, // agent2
    },
    {
        subject: 'Integration with Slack',
        description:
            'Looking to integrate your service with our Slack workspace. Is this possible?',
        status: 'new',
        priority: 'low', // Integration inquiries are low priority
        customer_index: 0, // customer1
    },
    {
        subject: 'Billing issue',
        description: 'I was charged twice for my subscription.',
        status: 'closed',
        priority: 'urgent', // Double charging is urgent priority
        customer_index: 0, // customer1
        agent_index: 3, // agent2
    },

    // Customer 2 tickets
    {
        subject: 'Feature request: Dark mode',
        description: 'Would love to see a dark mode option in the dashboard.',
        status: 'open',
        priority: 'low', // Feature requests are low priority
        customer_index: 1, // customer2
        agent_index: 2, // agent1
    },
    {
        subject: 'Thank you for the quick support',
        description:
            'Just wanted to say thanks for helping me with my integration issue.',
        status: 'closed',
        priority: 'low', // Thank you notes are low priority
        customer_index: 1, // customer2
        agent_index: 2, // agent1
    },
    {
        subject: 'Mobile app suggestion',
        description:
            'Have you considered creating a mobile app? It would be really helpful.',
        status: 'new',
        priority: 'low', // Feature suggestions are low priority
        customer_index: 1, // customer2
    },
]

export async function seedTickets(supabase: SupabaseClient) {
    console.log('🎫 Creating tickets...')

    const ticketMap: Record<number, string> = {}

    // Create tickets
    for (const [index, ticket] of SEED_TICKETS.entries()) {
        const { data: users } = await supabase
            .from('users')
            .select('id, profiles(role)')
            .eq('profiles.role', 'customer')
            .limit(1)
            .throwOnError()

        if (!users?.length) {
            console.warn('⚠️ No customers found for ticket creation')
            continue
        }

        const customerId = users[0].id

        // Get agent if needed
        let agentId = null
        if (ticket.agent_index !== undefined) {
            const { data: agents } = await supabase
                .from('users')
                .select('id, profiles(role)')
                .eq('profiles.role', 'agent')
                .limit(1)
                .throwOnError()

            if (agents?.length) {
                agentId = agents[0].id
            }
        }

        const { data, error } = await supabase
            .from('tickets')
            .insert({
                subject: ticket.subject,
                description: ticket.description,
                status: ticket.status,
                priority: ticket.priority,
                customer_id: customerId,
                agent_id: agentId,
            })
            .select()
            .single()

        if (error) {
            console.error(`Failed to create ticket ${ticket.subject}:`, error)
            continue
        }

        ticketMap[index] = data.id
    }

    console.log('✅ Tickets created')
    return ticketMap
}
