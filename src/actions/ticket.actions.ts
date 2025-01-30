'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'

import { DatabaseError } from '@/lib/errors'
import {
    ticketInsertSchema,
    ticketInternalNoteInsertSchema,
    ticketUpdateSchema,
} from '@/lib/schemas/ticket.schemas'
import { createClient } from '@/lib/supabase/server'
import { getTicketHistoryWithToken } from '@/services/ticket-access.services'
import { TicketService } from '@/services/ticket.services'

import type {
    TicketInternalNoteRow,
    TicketPriority,
    TicketRow,
    TicketWithCustomer,
    TicketWithInternalNotes,
} from '@/lib/schemas/ticket.schemas'
import type { Database, Tables } from '@/lib/supabase/types'
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

type StatusHistoryWithRelations =
    Database['public']['Tables']['ticket_status_history']['Row'] & {
        users: Pick<Database['public']['Tables']['users']['Row'], 'email'> & {
            profiles: Pick<
                Database['public']['Tables']['profiles']['Row'],
                'full_name'
            >
        }
    }

type PriorityHistoryWithRelations =
    Database['public']['Tables']['ticket_priority_history']['Row'] & {
        users: Pick<Database['public']['Tables']['users']['Row'], 'email'> & {
            profiles: Pick<
                Database['public']['Tables']['profiles']['Row'],
                'full_name'
            >
        }
    }

export async function getTicketHistory(ticketId: string) {
    try {
        const supabase = await createClient()

        // Get status history
        const { data: statusHistory, error: statusError } = await supabase
            .from('ticket_status_history')
            .select(
                'id, created_at, ticket_id, old_status, new_status, changed_by, users!inner(email, profiles!inner(full_name))',
            )
            .eq('ticket_id', ticketId)
            .order('created_at', { ascending: false })
            .returns<StatusHistoryWithRelations[]>()

        if (statusError) {
            console.error('Error getting status history:', statusError)
            return { data: null, error: statusError.message }
        }

        // Get priority history
        const { data: priorityHistory, error: priorityError } = await supabase
            .from('ticket_priority_history')
            .select(
                'id, created_at, ticket_id, old_priority, new_priority, changed_by, users!inner(email, profiles!inner(full_name))',
            )
            .eq('ticket_id', ticketId)
            .order('created_at', { ascending: false })
            .returns<PriorityHistoryWithRelations[]>()

        if (priorityError) {
            console.error('Error getting priority history:', priorityError)
            return { data: null, error: priorityError.message }
        }

        // Combine and sort both histories
        const combinedHistory = [
            ...statusHistory.map(item => ({
                ...item,
                changed_by_name:
                    item.users.profiles.full_name || 'Unknown User',
                changed_by_email: item.users.email,
            })),
            ...priorityHistory.map(item => ({
                ...item,
                changed_by_name:
                    item.users.profiles.full_name || 'Unknown User',
                changed_by_email: item.users.email,
            })),
        ].sort((a, b) => {
            const dateA = new Date(a.created_at || 0)
            const dateB = new Date(b.created_at || 0)
            return dateB.getTime() - dateA.getTime()
        })

        return { data: combinedHistory, error: null }
    } catch (error) {
        console.error('Error getting ticket history:', error)
        return {
            data: null,
            error:
                error instanceof Error
                    ? error.message
                    : 'An error occurred while fetching ticket history',
        }
    }
}

export async function getPublicTicketHistory(ticketId: string, token: string) {
    try {
        const history = await getTicketHistoryWithToken(ticketId, token)
        return { data: history, error: null }
    } catch (error) {
        console.error('[getPublicTicketHistory]', error)
        return {
            data: null,
            error:
                error instanceof Error
                    ? error.message
                    : 'Failed to load history',
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
                      priority:
                          (input.get('priority') as TicketPriority) || 'medium',
                      parent_ticket_id: null,
                      chaos_score: null,
                      crisis_keywords: null,
                  }
                : input

        const data = await service.create(ticketData)

        // Revalidate relevant paths
        revalidatePath('/tickets')
        if (ticketData.customer_id) {
            revalidatePath(`/customers/${ticketData.customer_id}/tickets`)
        }

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
    input: FormData | Omit<z.infer<typeof ticketUpdateSchema>, 'id'>,
    reason?: string,
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
            reason,
        )

        // Revalidate relevant paths
        revalidatePath('/tickets')
        revalidatePath(`/tickets/${id}`)
        revalidatePath(`/tickets/${id}/[token]`)
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
        revalidatePath(`/tickets/${ticketId}/[token]`, 'page')
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
