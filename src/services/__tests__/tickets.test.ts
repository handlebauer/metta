import { createClient } from '@supabase/supabase-js'
import { expect, mock, test } from 'bun:test'
import dotenv from 'dotenv'

import { TicketService } from '../tickets'

import type { Database } from '@/lib/supabase/types'

dotenv.config({ path: '.env.local' })

// Create a Supabase client with service role for testing
const supabaseAdmin = createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
        auth: {
            autoRefreshToken: false,
            persistSession: false,
        },
    },
)

// Mock the server createClient to use our admin client
mock.module('@/lib/supabase/server', () => ({
    createClient: () => supabaseAdmin,
}))

const service = new TicketService()

test('findById - should return a ticket by id', async () => {
    // Get a known ticket from seed data
    const { data: tickets } = await supabaseAdmin
        .from('tickets')
        .select('id')
        .limit(1)
        .single()

    expect(tickets).toBeDefined()

    const ticket = await service.findById(tickets!.id)

    expect(ticket).toBeDefined()
    expect(ticket?.id).toBe(tickets!.id)
    expect(ticket?.subject).toBeDefined()
    expect(ticket?.description).toBeDefined()
    expect(ticket?.status).toBeDefined()
    expect(ticket?.customer_id).toBeDefined()
})

test('findByCustomerId - should return tickets for a customer', async () => {
    // Get customer1 from seed data
    const { data: customer } = await supabaseAdmin
        .from('users')
        .select('id')
        .eq('email', 'customer1@example.com')
        .single()

    expect(customer).toBeDefined()

    const tickets = await service.findByCustomerId(customer!.id)

    expect(Array.isArray(tickets)).toBe(true)
    expect(tickets.length).toBeGreaterThan(0)
    tickets.forEach(ticket => {
        expect(ticket.customer_id).toBe(customer!.id)
    })
})

test('findByAgentId - should return tickets for an agent', async () => {
    // Get agent1 from seed data
    const { data: agent } = await supabaseAdmin
        .from('users')
        .select('id')
        .eq('email', 'agent1@example.com')
        .single()

    expect(agent).toBeDefined()

    const tickets = await service.findByAgentId(agent!.id)

    expect(Array.isArray(tickets)).toBe(true)
    tickets.forEach(ticket => {
        expect(ticket.agent_id).toBe(agent!.id)
    })
})

test('findAll - should return all tickets with optional filters', async () => {
    // Test without filters
    const allTickets = await service.findAll()
    expect(Array.isArray(allTickets)).toBe(true)
    expect(allTickets.length).toBeGreaterThan(0)

    // Test with status filter
    const newTickets = await service.findAll({ status: 'new' })
    expect(Array.isArray(newTickets)).toBe(true)
    newTickets.forEach(ticket => {
        expect(ticket.status).toBe('new')
    })

    // Test with limit
    const limitedTickets = await service.findAll({ limit: 2 })
    expect(Array.isArray(limitedTickets)).toBe(true)
    expect(limitedTickets.length).toBeLessThanOrEqual(2)
})

test('getStats - should return ticket statistics', async () => {
    const stats = await service.getStats()

    expect(stats).toBeDefined()
    expect(typeof stats.total).toBe('number')
    expect(typeof stats.open).toBe('number')
    expect(typeof stats.closedToday).toBe('number')
    expect(stats.total).toBeGreaterThan(0)
})

test('create and update - should create and update a ticket', async () => {
    // Get customer1 from seed data for creating ticket
    const { data: customer } = await supabaseAdmin
        .from('users')
        .select('id')
        .eq('email', 'customer1@example.com')
        .single()

    expect(customer).toBeDefined()

    // Create a new ticket
    const newTicket = await service.create({
        subject: 'Test Ticket',
        description: 'This is a test ticket',
        customer_id: customer!.id,
        agent_id: null,
    })

    expect(newTicket).toBeDefined()
    expect(newTicket.subject).toBe('Test Ticket')
    expect(newTicket.description).toBe('This is a test ticket')
    expect(newTicket.customer_id).toBe(customer!.id)
    expect(newTicket.status).toBe('new')

    // Get agent1 from seed data for updating ticket
    const { data: agent } = await supabaseAdmin
        .from('users')
        .select('id')
        .eq('email', 'agent1@example.com')
        .single()

    expect(agent).toBeDefined()

    // Update the ticket
    const updatedTicket = await service.update(newTicket.id, {
        id: newTicket.id,
        status: 'open',
        agent_id: agent!.id,
    })

    expect(updatedTicket).toBeDefined()
    expect(updatedTicket.id).toBe(newTicket.id)
    expect(updatedTicket.status).toBe('open')
    expect(updatedTicket.agent_id).toBe(agent!.id)

    // Clean up
    await supabaseAdmin.from('tickets').delete().eq('id', newTicket.id)
})
