import { z } from 'zod'

import { DatabaseError } from '@/lib/errors'
import {
    ticketInsertSchema,
    ticketInternalNoteInsertSchema,
    ticketInternalNoteSchema,
    ticketSchema,
    ticketStatusHistorySchema,
    ticketUpdateSchema,
} from '@/lib/schemas/ticket.schemas'
import { createClient } from '@/lib/supabase/server'

import { EmailService } from './email.services'
import { UserWithProfileService } from './user-with-profile.services'

import type {
    TicketInternalNoteRow,
    TicketRow,
    TicketWithCustomer,
    TicketWithInternalNotes,
} from '@/lib/schemas/ticket.schemas'
import type { Tables } from '@/lib/supabase/types'

export interface TicketStats {
    total: number
    open: number
    closedToday: number
}

export class TicketService {
    async findById(id: string): Promise<TicketRow | null> {
        try {
            const db = await createClient()
            const { data, error } = await db
                .from('tickets')
                .select('*')
                .eq('id', id)
                .single()

            if (error) throw new DatabaseError(error.message)
            return data ? ticketSchema.parse(data) : null
        } catch (error) {
            console.error('[TicketService.findById]', error)
            throw error
        }
    }

    async findByIdWithInternalNotes(
        id: string,
    ): Promise<TicketWithInternalNotes | null> {
        try {
            const db = await createClient()
            const { data, error } = await db
                .from('tickets')
                .select(
                    `
                    *,
                    internal_notes:ticket_internal_notes(*)
                `,
                )
                .eq('id', id)
                .single()

            if (error) throw new DatabaseError(error.message)
            if (!data) return null

            const ticket = ticketSchema.parse(data)
            const internalNotes = z
                .array(ticketInternalNoteSchema)
                .parse(data.internal_notes)

            return {
                ...ticket,
                internal_notes: internalNotes,
            }
        } catch (error) {
            console.error('[TicketService.findByIdWithInternalNotes]', error)
            throw error
        }
    }

    async findByCustomerId(customerId: string): Promise<TicketRow[]> {
        try {
            const db = await createClient()
            const { data, error } = await db
                .from('tickets')
                .select('*')
                .eq('customer_id', customerId)
                .order('created_at', { ascending: false })

            if (error) throw new DatabaseError(error.message)
            return data ? z.array(ticketSchema).parse(data) : []
        } catch (error) {
            console.error('[TicketService.findByCustomerId]', error)
            throw error
        }
    }

    async findByAgentId(agentId: string): Promise<TicketRow[]> {
        try {
            const db = await createClient()
            const { data, error } = await db
                .from('tickets')
                .select('*')
                .eq('agent_id', agentId)
                .order('updated_at', { ascending: false })

            if (error) throw new DatabaseError(error.message)
            return data ? z.array(ticketSchema).parse(data) : []
        } catch (error) {
            console.error('[TicketService.findByAgentId]', error)
            throw error
        }
    }

    async findAll(options?: {
        status?: Tables<'tickets'>['status']
        priority?: Tables<'tickets'>['priority']
        limit?: number
        offset?: number
    }): Promise<TicketWithCustomer[]> {
        try {
            const db = await createClient()

            type JoinedTicket = TicketRow & {
                users: {
                    email: string
                    profiles: {
                        full_name: string | null
                    } | null
                }
            }

            let query = db.from('tickets').select(`
                    *,
                    users!customer_id (
                        email,
                        profiles (
                            full_name
                        )
                    )
                `)

            if (options?.status) {
                query = query.eq('status', options.status)
            }

            if (options?.priority) {
                query = query.eq('priority', options.priority)
            }

            if (options?.limit) {
                query = query.limit(options.limit)
            }

            if (options?.offset) {
                query = query.range(
                    options.offset,
                    options.offset + (options.limit || 10) - 1,
                )
            }

            const { data, error } = await query.order('created_at', {
                ascending: false,
            })

            if (error) throw new DatabaseError(error.message)

            // Transform the nested data structure to match our expected format
            const tickets =
                (data as JoinedTicket[])?.map(({ users, ...ticket }) => ({
                    ...ticket,
                    customer: {
                        email: users.email,
                        full_name: users.profiles?.full_name ?? null,
                    },
                })) || []

            return tickets
        } catch (error) {
            console.error('[TicketService.findAll]', error)
            throw error
        }
    }

    async create(
        input: z.infer<typeof ticketInsertSchema>,
    ): Promise<TicketRow> {
        try {
            const validated = ticketInsertSchema.parse(input)
            const db = await createClient()
            const { data, error } = await db
                .from('tickets')
                .insert(validated)
                .select()
                .single()

            if (error) throw new DatabaseError(error.message)
            if (!data) throw new DatabaseError('Failed to create ticket')

            const ticket = ticketSchema.parse(data)

            // If an agent is assigned, send them an email notification
            if (ticket.agent_id) {
                const { data: agent } = await db
                    .from('users')
                    .select('*')
                    .eq('id', ticket.agent_id)
                    .single()

                if (agent) {
                    await EmailService.sendNewTicketNotification(ticket, agent)
                } else {
                    console.error('Agent not found')
                }
            }

            return ticket
        } catch (error) {
            console.error('[TicketService.create]', error)
            throw error
        }
    }

    async update(
        id: string,
        input: z.infer<typeof ticketUpdateSchema>,
        reopenReason?: string,
    ): Promise<TicketRow> {
        try {
            const validated = ticketUpdateSchema.parse(input)
            const db = await createClient()

            // Get the current ticket to check its status
            const { data: currentTicket } = await db
                .from('tickets')
                .select()
                .eq('id', id)
                .single()

            if (!currentTicket) throw new DatabaseError('Ticket not found')

            // Update the ticket
            const { data, error } = await db
                .from('tickets')
                .update(validated)
                .eq('id', id)
                .select()
                .single()

            if (error) throw new DatabaseError(error.message)
            if (!data) throw new DatabaseError('Ticket not found')

            const ticket = ticketSchema.parse(data)
            const userService = new UserWithProfileService()

            // Send appropriate notification based on status change
            if (validated.status === 'closed') {
                const customer = await userService.findById(ticket.customer_id)
                if (customer) {
                    await EmailService.sendTicketResolutionNotification(
                        ticket,
                        customer,
                    )
                } else {
                    console.error('Customer not found')
                }
            } else if (
                currentTicket.status === 'closed' &&
                validated.status === 'open'
            ) {
                // Ticket is being reopened
                const customer = await userService.findById(ticket.customer_id)
                if (customer) {
                    await EmailService.sendTicketReopenedNotification(
                        ticket,
                        customer,
                        reopenReason || 'No reason provided',
                    )
                } else {
                    console.error('Customer not found')
                }
            }

            return ticket
        } catch (error) {
            console.error('[TicketService.update]', error)
            throw error
        }
    }

    async addInternalNote(
        input: z.infer<typeof ticketInternalNoteInsertSchema>,
    ): Promise<TicketInternalNoteRow> {
        try {
            const validated = ticketInternalNoteInsertSchema.parse(input)
            const db = await createClient()
            const { data, error } = await db
                .from('ticket_internal_notes')
                .insert(validated)
                .select()
                .single()

            if (error) throw new DatabaseError(error.message)
            if (!data) throw new DatabaseError('Failed to create internal note')

            return ticketInternalNoteSchema.parse(data)
        } catch (error) {
            console.error('[TicketService.addInternalNote]', error)
            throw error
        }
    }

    async findInternalNotes(
        ticketId: string,
    ): Promise<TicketInternalNoteRow[]> {
        try {
            const db = await createClient()
            const { data, error } = await db
                .from('ticket_internal_notes')
                .select('*')
                .eq('ticket_id', ticketId)
                .order('created_at', { ascending: false })

            if (error) throw new DatabaseError(error.message)
            return data ? z.array(ticketInternalNoteSchema).parse(data) : []
        } catch (error) {
            console.error('[TicketService.findInternalNotes]', error)
            throw error
        }
    }

    async getStats(): Promise<TicketStats> {
        try {
            const db = await createClient()

            // Get total and open tickets
            const { data: countData, error: countError } = await db
                .from('tickets')
                .select('status', { count: 'exact' })

            if (countError) throw new DatabaseError(countError.message)

            // Get tickets closed in the last 24 hours
            const yesterday = new Date()
            yesterday.setDate(yesterday.getDate() - 1)

            const { data: closedToday, error: closedError } = await db
                .from('tickets')
                .select('id', { count: 'exact' })
                .eq('status', 'closed')
                .gte('updated_at', yesterday.toISOString())

            if (closedError) throw new DatabaseError(closedError.message)

            const openTickets =
                countData?.filter(ticket => ticket.status === 'open').length ||
                0

            return {
                total: countData?.length || 0,
                open: openTickets,
                closedToday: closedToday?.length || 0,
            }
        } catch (error) {
            console.error('[TicketService.getStats]', error)
            throw error
        }
    }

    async findStatusHistory(ticketId: string) {
        try {
            const db = await createClient()
            const { data, error } = await db
                .from('ticket_status_history')
                .select(
                    `
                    *,
                    users!changed_by (
                        email,
                        profiles (
                            full_name
                        )
                    )
                `,
                )
                .eq('ticket_id', ticketId)
                .order('created_at', { ascending: false })
                .limit(5)

            if (error) throw new DatabaseError(error.message)

            // Transform the data to include user details
            const history =
                data?.map(({ users, ...event }) => ({
                    ...event,
                    changed_by_email: users.email,
                    changed_by_name: users.profiles?.full_name || users.email,
                })) || []

            return z.array(ticketStatusHistorySchema).parse(history)
        } catch (error) {
            console.error('[TicketService.findStatusHistory]', error)
            throw error
        }
    }
}
