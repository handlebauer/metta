import { createClient } from '@/lib/supabase/server'
import { DatabaseError } from '@/lib/errors'
import {
    ticketSchema,
    ticketInsertSchema,
    ticketUpdateSchema,
    type TicketRow,
    type TicketWithCustomer,
} from '@/lib/schemas/tickets'
import type { Tables } from '@/lib/supabase/types'
import { z } from 'zod'

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

            return ticketSchema.parse(data)
        } catch (error) {
            console.error('[TicketService.create]', error)
            throw error
        }
    }

    async update(
        id: string,
        input: z.infer<typeof ticketUpdateSchema>,
    ): Promise<TicketRow> {
        try {
            const validated = ticketUpdateSchema.parse(input)
            const db = await createClient()
            const { data, error } = await db
                .from('tickets')
                .update(validated)
                .eq('id', id)
                .select()
                .single()

            if (error) throw new DatabaseError(error.message)
            if (!data) throw new DatabaseError('Ticket not found')

            return ticketSchema.parse(data)
        } catch (error) {
            console.error('[TicketService.update]', error)
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
                countData?.filter(t => t.status === 'open').length || 0

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
}
