'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'

import { DatabaseError } from '@/lib/errors'
import {
    ticketInsertSchema,
    ticketInternalNoteInsertSchema,
    ticketUpdateSchema,
} from '@/lib/schemas/ticket.schemas'
import { TicketService } from '@/services/ticket.services'

import type {
    TicketInternalNoteRow,
    TicketRow,
    TicketWithCustomer,
    TicketWithInternalNotes,
} from '@/lib/schemas/ticket.schemas'
import type { Tables } from '@/lib/supabase/types'
import type { TicketStats } from '@/services/ticket.services'

const service = new TicketService()

// Read operations (for use in RSCs)
export async function getTicket(id: string): Promise<{
    data: TicketRow | null
    error: string | null
}> {
    try {
        const data = await service.findById(id)
        return { data, error: null }
    } catch (error) {
        console.error('[getTicket]', error)
        return {
            data: null,
            error:
                error instanceof DatabaseError
                    ? error.message
                    : 'Failed to fetch ticket',
        }
    }
}

export async function getTicketWithNotes(id: string): Promise<{
    data: TicketWithInternalNotes | null
    error: string | null
}> {
    try {
        const data = await service.findByIdWithInternalNotes(id)
        return { data, error: null }
    } catch (error) {
        console.error('[getTicketWithNotes]', error)
        return {
            data: null,
            error:
                error instanceof DatabaseError
                    ? error.message
                    : 'Failed to fetch ticket with notes',
        }
    }
}

export async function getTicketInternalNotes(ticketId: string): Promise<{
    data: TicketInternalNoteRow[]
    error: string | null
}> {
    try {
        const data = await service.findInternalNotes(ticketId)
        return { data, error: null }
    } catch (error) {
        console.error('[getTicketInternalNotes]', error)
        return {
            data: [],
            error:
                error instanceof DatabaseError
                    ? error.message
                    : 'Failed to fetch internal notes',
        }
    }
}

export async function getCustomerTickets(customerId: string): Promise<{
    data: TicketRow[]
    error: string | null
}> {
    try {
        const data = await service.findByCustomerId(customerId)
        return { data, error: null }
    } catch (error) {
        console.error('[getCustomerTickets]', error)
        return {
            data: [],
            error:
                error instanceof DatabaseError
                    ? error.message
                    : 'Failed to fetch customer tickets',
        }
    }
}

export async function getAgentTickets(agentId: string): Promise<{
    data: TicketRow[]
    error: string | null
}> {
    try {
        const data = await service.findByAgentId(agentId)
        return { data, error: null }
    } catch (error) {
        console.error('[getAgentTickets]', error)
        return {
            data: [],
            error:
                error instanceof DatabaseError
                    ? error.message
                    : 'Failed to fetch agent tickets',
        }
    }
}

export async function getTickets(options?: {
    status?: Tables<'tickets'>['status']
    priority?: Tables<'tickets'>['priority']
    limit?: number
    offset?: number
}): Promise<{
    data: TicketWithCustomer[]
    error: string | null
}> {
    try {
        const data = await service.findAll(options)
        return { data, error: null }
    } catch (error) {
        console.error('[getTickets]', error)
        return {
            data: [],
            error:
                error instanceof DatabaseError
                    ? error.message
                    : 'Failed to fetch tickets',
        }
    }
}

export async function getTicketStats(): Promise<{
    data: TicketStats | null
    error: string | null
}> {
    try {
        const data = await service.getStats()
        return { data, error: null }
    } catch (error) {
        console.error('[getTicketStats]', error)
        return {
            data: null,
            error:
                error instanceof DatabaseError
                    ? error.message
                    : 'Failed to fetch ticket statistics',
        }
    }
}

// Mutation operations (for forms and client components)
export async function createTicket(
    input: FormData | z.infer<typeof ticketInsertSchema>,
): Promise<{
    data: TicketRow | null
    error: string | null
}> {
    try {
        // Handle both FormData and direct object input
        const ticketData =
            input instanceof FormData
                ? {
                      subject: input.get('subject') as string,
                      description: input.get('description') as string,
                      customer_id: input.get('customer_id') as string,
                      agent_id: input.get('agent_id') as string,
                  }
                : input

        const data = await service.create(ticketData)

        // Revalidate relevant paths
        revalidatePath('/tickets')
        revalidatePath(`/customers/${ticketData.customer_id}/tickets`)

        return { data, error: null }
    } catch (error) {
        console.error('[createTicket]', error)
        return {
            data: null,
            error:
                error instanceof DatabaseError
                    ? error.message
                    : 'Failed to create ticket',
        }
    }
}

export async function updateTicket(
    id: string,
    input: FormData | z.infer<typeof ticketUpdateSchema>,
): Promise<{
    data: TicketRow | null
    error: string | null
}> {
    try {
        // Handle both FormData and direct object input
        const ticketData =
            input instanceof FormData
                ? {
                      id,
                      ...(input.get('status') && {
                          status: input.get('status') as
                              | Tables<'tickets'>['status']
                              | undefined,
                      }),
                      ...(input.get('priority') && {
                          priority: input.get('priority') as
                              | Tables<'tickets'>['priority']
                              | undefined,
                      }),
                      ...(input.get('agent_id') && {
                          agent_id: input.get('agent_id') || undefined,
                      }),
                  }
                : { ...input, id }

        const data = await service.update(
            id,
            ticketUpdateSchema.parse(ticketData),
        )

        // Revalidate relevant paths
        revalidatePath('/tickets')
        revalidatePath(`/tickets/${id}`)
        if (data.agent_id) {
            revalidatePath(`/agents/${data.agent_id}/tickets`)
        }
        revalidatePath(`/customers/${data.customer_id}/tickets`)

        return { data, error: null }
    } catch (error) {
        console.error('[updateTicket]', error)
        return {
            data: null,
            error:
                error instanceof DatabaseError
                    ? error.message
                    : 'Failed to update ticket',
        }
    }
}

export async function addInternalNote(
    input: FormData | z.infer<typeof ticketInternalNoteInsertSchema>,
): Promise<{
    data: TicketInternalNoteRow | null
    error: string | null
}> {
    try {
        // Handle both FormData and direct object input
        const noteData =
            input instanceof FormData
                ? {
                      content: input.get('content') as string,
                      ticket_id: input.get('ticket_id') as string,
                      created_by: input.get('created_by') as string,
                  }
                : input

        const data = await service.addInternalNote(noteData)

        // Revalidate relevant paths
        revalidatePath(`/tickets/${noteData.ticket_id}`)

        return { data, error: null }
    } catch (error) {
        console.error('[addInternalNote]', error)
        return {
            data: null,
            error:
                error instanceof DatabaseError
                    ? error.message
                    : 'Failed to add internal note',
        }
    }
}

// Helper action for agents to claim tickets
export async function claimTicket(
    ticketId: string,
    agentId: string,
): Promise<{
    data: TicketRow | null
    error: string | null
}> {
    try {
        const data = await service.update(ticketId, {
            id: ticketId,
            agent_id: agentId,
            status: 'open',
        })

        // Revalidate relevant paths
        revalidatePath('/tickets')
        revalidatePath(`/tickets/${ticketId}`)
        revalidatePath(`/agents/${agentId}/tickets`)
        revalidatePath(`/customers/${data.customer_id}/tickets`)

        return { data, error: null }
    } catch (error) {
        console.error('[claimTicket]', error)
        return {
            data: null,
            error:
                error instanceof DatabaseError
                    ? error.message
                    : 'Failed to claim ticket',
        }
    }
}
