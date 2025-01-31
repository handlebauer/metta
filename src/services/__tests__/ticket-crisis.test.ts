import './setup'

import { afterAll, beforeAll, describe, expect, mock, test } from 'bun:test'
import dotenv from 'dotenv'

import { createServiceClient } from '@/lib/supabase/service'

import { SystemService } from '../system.services'
import { TicketCrisisService } from '../ticket-crisis.services'
import { TicketService } from '../ticket.services'

// Set required environment variables before any imports
process.env.SENDGRID_API_KEY = 'test-api-key'

// Mock both SendGrid modules
mock.module('@sendgrid/mail', () => ({
    setApiKey: () => {},
    send: () => Promise.resolve(),
    default: {
        setApiKey: () => {},
        send: () => Promise.resolve(),
    },
}))

mock.module('@/lib/sendgrid/index', () => ({
    default: {
        setApiKey: () => {},
        send: () => Promise.resolve(),
    },
}))

// Load environment variables
dotenv.config({ path: '.env.local' })

// Create a Supabase client with service role for testing
const supabaseAdmin = createServiceClient()

// Mock the server createClient to use our admin client
mock.module('@/lib/supabase/server', () => ({
    createClient: () => supabaseAdmin,
}))

const service = new TicketCrisisService()
const ticketService = new TicketService()
const systemService = SystemService.getInstance()

describe('TicketCrisisService - Firebreak Agent Methods', () => {
    let testTickets: Array<{ id: string }> = []
    let sysUserId: string

    beforeAll(async () => {
        // Clean up all existing tickets
        await supabaseAdmin.from('tickets').delete().neq('id', '')

        sysUserId = await systemService.getSystemUserId()

        // Create test tickets with varying priorities and timestamps
        const tickets = await Promise.all([
            ticketService.create({
                subject: 'Test High Priority Ticket',
                description: 'Recent high priority issue',
                priority: 'high',
                customer_id: sysUserId,
                agent_id: null,
                parent_ticket_id: null,
                crisis_keywords: [],
                chaos_score: null,
            }),
            ticketService.create({
                subject: 'Test Urgent Priority Ticket',
                description: 'Recent urgent priority issue',
                priority: 'urgent',
                customer_id: sysUserId,
                agent_id: null,
                parent_ticket_id: null,
                crisis_keywords: [],
                chaos_score: null,
            }),
            ticketService.create({
                subject: 'Test Old Ticket',
                description:
                    'Old issue that should not appear in recent results',
                priority: 'low',
                customer_id: sysUserId,
                agent_id: null,
                parent_ticket_id: null,
                crisis_keywords: [],
                chaos_score: null,
            }),
        ])

        testTickets = tickets.map(t => ({ id: t.id }))

        // Update the status of the old ticket to closed
        await supabaseAdmin
            .from('tickets')
            .update({ status: 'closed' })
            .eq('id', testTickets[2].id)

        // Set the created_at time for the old ticket
        await supabaseAdmin
            .from('tickets')
            .update({
                created_at: new Date(Date.now() - 3 * 3600000).toISOString(),
            })
            .eq('id', testTickets[2].id)
    })

    afterAll(async () => {
        // Clean up all tickets
        await supabaseAdmin.from('tickets').delete().neq('id', '')
    })

    test('findPotentialCrisisTickets - should find recent high priority tickets', async () => {
        const tickets = await service.findPotentialCrisisTickets({
            hoursBack: 2,
        })

        expect(tickets.length).toBe(2)
        expect(tickets.every(t => t.status === 'new')).toBe(true)
        expect(
            tickets.every(t => ['high', 'urgent'].includes(t.priority!)),
        ).toBe(true)
        expect(
            tickets.every(
                t =>
                    new Date(t.created_at!) >
                    new Date(Date.now() - 2 * 3600000),
            ),
        ).toBe(true)
    })

    test('findTicketsByIds - should return full ticket details', async () => {
        const tickets = await service.findTicketsByIds(
            testTickets.map(t => t.id),
        )

        expect(tickets).toHaveLength(3)
        expect(new Set(tickets.map(t => t.priority))).toEqual(
            new Set(['high', 'urgent', 'low']),
        )
    })

    test('updateCrisisMetadata - should update parent ticket relationship', async () => {
        // Create a parent incident ticket
        const incident = await ticketService.create({
            subject: 'Test Parent',
            description: 'Parent incident for testing',
            priority: 'high',
            customer_id: sysUserId,
            agent_id: null,
            parent_ticket_id: null,
            crisis_keywords: [],
            chaos_score: null,
        })

        // Update a test ticket to link to the incident
        const testTicket = testTickets[0]
        const updatedTicket = await service.updateCrisisMetadata(
            testTicket.id,
            {
                parent_ticket_id: incident.id,
            },
        )

        expect(updatedTicket.parent_ticket_id).toBe(incident.id)

        // Clean up incident ticket
        await supabaseAdmin.from('tickets').delete().eq('id', incident.id)
    })
})
