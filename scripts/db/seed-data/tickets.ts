import { createClient } from '@supabase/supabase-js'

import type { Database } from '@/lib/supabase/types'

export interface SeedTicket {
    subject: string
    description: string
    status: 'new' | 'open' | 'closed'
    customer_index: number // -1 for demo user, 0-1 for customers
    agent_index?: number // 2-3 for agents
}

export const SEED_TICKETS: SeedTicket[] = [
    // Demo user tickets
    {
        subject: 'Need help with API integration',
        description:
            'Looking to integrate your REST API with our existing system. Can you provide documentation?',
        status: 'new',
        customer_index: -1, // Demo User
    },
    {
        subject: 'Billing cycle question',
        description:
            'When does the billing cycle start? I was charged on an unexpected date.',
        status: 'open',
        customer_index: -1, // Demo User
        agent_index: 2, // agent1
    },
    {
        subject: 'Password reset not working',
        description:
            'The password reset link in my email is not working. Can you help?',
        status: 'closed',
        customer_index: -1, // Demo User
        agent_index: 3, // agent2
    },
    {
        subject: 'Feature suggestion: Teams',
        description:
            'It would be great to have team management features for enterprise accounts.',
        status: 'open',
        customer_index: -1, // Demo User
        agent_index: 2, // agent1
    },
    {
        subject: 'Urgent: Service downtime',
        description:
            'Getting 503 errors when trying to access the dashboard. Is there an outage?',
        status: 'new',
        customer_index: -1, // Demo User
    },

    // Customer 1 tickets
    {
        subject: 'Need help with login',
        description:
            'I am unable to log in to my account. It keeps saying my password is incorrect.',
        status: 'open',
        customer_index: 0, // customer1
        agent_index: 2, // agent1
    },
    {
        subject: 'Bug in export functionality',
        description: 'When I try to export my data, the CSV file is empty.',
        status: 'open',
        customer_index: 0, // customer1
        agent_index: 3, // agent2
    },
    {
        subject: 'Integration with Slack',
        description:
            'Looking to integrate your service with our Slack workspace. Is this possible?',
        status: 'new',
        customer_index: 0, // customer1
    },
    {
        subject: 'Billing issue',
        description: 'I was charged twice for my subscription.',
        status: 'closed',
        customer_index: 0, // customer1
        agent_index: 3, // agent2
    },

    // Customer 2 tickets
    {
        subject: 'Feature request: Dark mode',
        description: 'Would love to see a dark mode option in the dashboard.',
        status: 'open',
        customer_index: 1, // customer2
        agent_index: 2, // agent1
    },
    {
        subject: 'Thank you for the quick support',
        description:
            'Just wanted to say thanks for helping me with my integration issue.',
        status: 'closed',
        customer_index: 1, // customer2
        agent_index: 2, // agent1
    },
    {
        subject: 'Mobile app suggestion',
        description:
            'Have you considered creating a mobile app? It would be really helpful.',
        status: 'new',
        customer_index: 1, // customer2
    },
]

export async function seedTickets(
    supabase: ReturnType<typeof createClient<Database>>,
) {
    console.log('🎫 Creating seed tickets...')

    // Get demo user and test users
    const { data: demoUser } = await supabase
        .from('users')
        .select('id')
        .eq('email', 'demo@example.com')
        .single()

    const { data: customers } = await supabase
        .from('users')
        .select('id')
        .in('email', ['customer1@example.com', 'customer2@example.com'])

    const { data: agents } = await supabase
        .from('users')
        .select('id')
        .in('email', ['agent1@example.com', 'agent2@example.com'])

    if (!demoUser || !customers || !agents) {
        throw new Error('Failed to find seed users')
    }

    const tickets = SEED_TICKETS.map(ticket => ({
        subject: ticket.subject,
        description: ticket.description,
        status: ticket.status,
        customer_id:
            ticket.customer_index === -1
                ? demoUser.id
                : customers[ticket.customer_index].id,
        agent_id:
            ticket.agent_index !== undefined
                ? agents[ticket.agent_index - 2].id
                : null,
    }))

    const { error } = await supabase.from('tickets').insert(tickets)

    if (error) throw error
    console.log('✅ Seed tickets created successfully')
}
