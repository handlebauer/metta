import { NextResponse } from 'next/server'

import { createServiceClient } from '@/lib/supabase/service'

import type { TicketPriority } from '@/lib/schemas/ticket.schemas'

interface TestTicket {
    subject: string
    description: string
    status: 'new' | 'open' | 'closed'
    priority: TicketPriority
    customer_email: string
}

const TEST_TICKETS: TestTicket[] = [
    // Performance/Slowness Issues Cluster (6 tickets)
    {
        subject: 'Dashboard extremely slow to load',
        description:
            'The analytics dashboard is taking over 30 seconds to load data. This is impacting our daily operations.',
        status: 'new',
        priority: 'high',
        customer_email: 'customer1@example.com',
    },
    {
        subject: 'API response times degraded significantly',
        description:
            'Our API calls are taking 5-10x longer than usual. This started about 30 minutes ago.',
        status: 'new',
        priority: 'urgent',
        customer_email: 'customer2@example.com',
    },
    {
        subject: 'Slow page load times across app',
        description:
            'All pages in the application are loading very slowly. Users are reporting 15-20 second load times.',
        status: 'new',
        priority: 'high',
        customer_email: 'testcustomer@example.com',
    },
    {
        subject: 'Database queries timing out',
        description:
            'Getting timeout errors on complex database queries. This is affecting multiple features in the platform.',
        status: 'new',
        priority: 'urgent',
        customer_email: 'customer1@example.com',
    },
    {
        subject: 'Chart rendering performance degraded',
        description:
            'Interactive charts are very sluggish. Updating chart data takes 15-20 seconds instead of being instant.',
        status: 'new',
        priority: 'high',
        customer_email: 'customer2@example.com',
    },
    {
        subject: 'Batch processing extremely slow',
        description:
            'Batch operations that usually take minutes are now taking hours to complete. This is causing major delays.',
        status: 'new',
        priority: 'high',
        customer_email: 'testcustomer@example.com',
    },

    // Unrelated Tickets (4 tickets with different concerns)
    {
        subject: 'Need help with API authentication',
        description:
            'Having trouble setting up API keys for our integration. Documentation seems outdated.',
        status: 'new',
        priority: 'medium',
        customer_email: 'customer1@example.com',
    },
    {
        subject: 'Billing cycle question',
        description:
            'Our subscription renewed on an unexpected date. Can you help clarify our billing cycle?',
        status: 'new',
        priority: 'low',
        customer_email: 'customer2@example.com',
    },
    {
        subject: 'Feature request: Dark mode',
        description:
            'Would love to see a dark mode option added to the dashboard. This would help reduce eye strain.',
        status: 'new',
        priority: 'low',
        customer_email: 'testcustomer@example.com',
    },
    {
        subject: 'Team member cant access workspace',
        description:
            'New team member getting permission denied errors when trying to access our workspace.',
        status: 'new',
        priority: 'high',
        customer_email: 'customer1@example.com',
    },
]

export async function POST() {
    try {
        const supabase = createServiceClient()

        // Get all customers we need
        const { data: customers } = await supabase
            .from('users')
            .select('id, email')
            .in('email', [
                'testcustomer@example.com',
                'customer1@example.com',
                'customer2@example.com',
            ])
            .throwOnError()

        if (!customers?.length) {
            console.error('No customers found in database')
            return NextResponse.json(
                { error: 'No customers found' },
                { status: 500 },
            )
        }

        console.log('Found customers:', customers)

        // Create a map of email to customer id for easy lookup
        const customerMap = new Map(
            customers.map(customer => [customer.email, customer.id]),
        )

        // Use current time (not future dates)
        const now = new Date()
        const twoHoursAgo = new Date(now.getTime() - 2 * 60 * 60 * 1000)

        const createdTickets = []

        // Insert all tickets with timestamps spread across last 2 hours
        for (const [index, ticket] of TEST_TICKETS.entries()) {
            const customerId = customerMap.get(ticket.customer_email)
            if (!customerId) {
                console.warn(
                    `Customer not found for email: ${ticket.customer_email}`,
                )
                continue
            }

            // Calculate a timestamp between now and 2 hours ago
            const progress = index / (TEST_TICKETS.length - 1) // 0 to 1
            const timestamp = new Date(
                twoHoursAgo.getTime() +
                    progress * (now.getTime() - twoHoursAgo.getTime()),
            )

            const { customer_email, ...ticketData } = ticket
            const { data, error } = await supabase
                .from('tickets')
                .insert({
                    ...ticketData,
                    customer_id: customerId,
                    created_at: timestamp.toISOString(),
                })
                .select()
                .single()

            if (error) {
                console.error('Failed to insert ticket:', error)
                continue
            }

            createdTickets.push(data)
            console.log('Created ticket:', {
                id: data.id,
                subject: data.subject,
                priority: data.priority,
                status: data.status,
                created_at: data.created_at,
            })
        }

        console.log(`Successfully created ${createdTickets.length} tickets`)
        return NextResponse.json({
            success: true,
            created: createdTickets.length,
            tickets: createdTickets.map(t => ({
                id: t.id,
                subject: t.subject,
                priority: t.priority,
                status: t.status,
                created_at: t.created_at,
            })),
        })
    } catch (error) {
        console.error('Failed to insert test tickets:', error)
        return NextResponse.json(
            { error: 'Failed to insert test tickets' },
            { status: 500 },
        )
    }
}
