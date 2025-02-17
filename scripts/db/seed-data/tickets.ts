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
    // Access Token Test Ticket (Test Customer)
    {
        subject: '[Test] Access Token Test Ticket',
        description:
            'This is a dedicated ticket for testing public access tokens.',
        status: 'open',
        priority: 'medium',
        customer_index: -2, // Test Customer
        agent_index: -1, // Demo Agent
    },
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
        subject: 'Integration with ChatGenius',
        description:
            'Looking to push notifications to our ChatGenius workspace. Is this possible?',
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

    // Additional varied tickets
    {
        subject: 'API Rate Limiting Issue',
        description:
            'We are hitting the API rate limits frequently. Can we increase our quota?',
        status: 'closed',
        priority: 'high',
        customer_index: 0, // customer1
        agent_index: 2, // agent1
    },
    {
        subject: 'Custom Dashboard Setup',
        description:
            'Need help configuring our custom dashboard with the new metrics.',
        status: 'open',
        priority: 'medium',
        customer_index: 1, // customer2
        agent_index: 3, // agent2
    },
    {
        subject: 'Security Audit Results',
        description:
            'Sharing results from our recent security audit. A few items need attention.',
        status: 'new',
        priority: 'urgent',
        customer_index: 1, // customer2
    },
    {
        subject: 'Data Migration Support',
        description:
            'Planning to migrate from a competitor. Need guidance on the process.',
        status: 'closed',
        priority: 'medium',
        customer_index: 0, // customer1
        agent_index: 2, // agent1
    },
    {
        subject: 'Account Upgrade Request',
        description:
            'Current plan is insufficient. Looking to upgrade to enterprise.',
        status: 'open',
        priority: 'high',
        customer_index: 1, // customer2
        agent_index: 3, // agent2
    },
]

export async function seedTickets(supabase: SupabaseClient) {
    console.log('🎫 Creating tickets...')

    const ticketMap: Record<number, string> = {}

    // Get all customers first
    const { data: customers } = await supabase
        .from('users')
        .select('id, email, profiles(role)')
        .eq('profiles.role', 'customer')
        .throwOnError()

    if (!customers?.length) {
        throw new Error('No customers found for ticket creation')
    }

    // Get all agents first
    const { data: agents } = await supabase
        .from('users')
        .select('id, email, profiles(role)')
        .eq('profiles.role', 'agent')
        .throwOnError()

    if (!agents?.length) {
        throw new Error('No agents found for ticket creation')
    }

    // Create tickets with deterministic dates
    for (const [index, ticket] of SEED_TICKETS.entries()) {
        // Find the right customer based on index
        let customerId: string | null = null
        let customerEmail = ''

        if (ticket.customer_index === 0) {
            customerEmail = 'customer1@example.com'
        } else if (ticket.customer_index === 1) {
            customerEmail = 'customer2@example.com'
        } else if (ticket.customer_index === -2) {
            customerEmail = 'testcustomer@example.com'
        }

        const customer = customers.find(c => c.email === customerEmail)
        if (customer) customerId = customer.id

        if (!customerId) {
            throw new Error(`No customer found with email ${customerEmail}`)
        }

        // Get agent if needed
        let agentId = null
        if (ticket.agent_index !== undefined) {
            let agentEmail = ''
            if (ticket.agent_index === -1) {
                agentEmail = 'demo@metta.now'
            } else if (ticket.agent_index === 2) {
                agentEmail = 'agent1@example.com'
            } else if (ticket.agent_index === 3) {
                agentEmail = 'agent2@example.com'
            }

            const agent = agents.find(a => a.email === agentEmail)
            if (agent) agentId = agent.id
        }

        // Calculate creation date based on index to spread tickets across weeks
        const now = new Date()
        const baseOffset = 0.5 // Ensure all tickets start at least 0.5 days ago
        const daysAgo = baseOffset + Math.floor(index * 2.5) // Spread tickets every 2-3 days
        const createdAt = new Date(now)
        createdAt.setDate(now.getDate() - daysAgo)
        createdAt.setHours(10, 0, 0, 0) // Set to 10 AM for consistency

        const { data, error } = await supabase
            .from('tickets')
            .insert({
                subject: ticket.subject,
                description: ticket.description,
                status: ticket.status,
                priority: ticket.priority,
                customer_id: customerId,
                agent_id: agentId,
                created_at: createdAt.toISOString(),
            })
            .select()
            .single()

        if (error) {
            throw new Error(
                `Failed to create ticket ${ticket.subject}: ${error.message}`,
            )
        }

        ticketMap[index] = data.id
    }

    console.log('✅ Tickets created')
    return ticketMap
}
