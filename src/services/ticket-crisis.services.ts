import { z } from 'zod'

import { DatabaseError } from '@/lib/errors'
import { ticketSchema } from '@/lib/schemas/ticket.schemas'
import { createServiceClient } from '@/lib/supabase/service'

import type { TicketRow } from '@/lib/schemas/ticket.schemas'

// Schema for crisis-related updates
const ticketCrisisUpdateSchema = z.object({
    parent_ticket_id: z.string().optional(),
    crisis_keywords: z.array(z.string()).optional(),
    chaos_score: z.number().min(0).max(100).optional(),
})

// Schema for ticket search
const _ticketSearchSchema = z.object({
    timeframe: z
        .object({
            start: z.string().optional(),
            end: z.string().optional(),
        })
        .optional(),
    status: z.enum(['new', 'open', 'closed']).optional(),
    priority: z.enum(['low', 'medium', 'high', 'urgent']).optional(),
    search_term: z.string().optional(),
})

export class TicketCrisisService {
    /**
     * Find tickets by their IDs and validate them
     */
    async findTicketsByIds(ids: string[]): Promise<TicketRow[]> {
        try {
            const db = createServiceClient()
            const { data, error } = await db
                .from('tickets')
                .select('*')
                .in('id', ids)

            if (error) throw new DatabaseError(error.message)
            return data ? z.array(ticketSchema).parse(data) : []
        } catch (error) {
            console.error('[TicketCrisisService.findTicketsByIds]', error)
            throw error
        }
    }

    /**
     * Update crisis-related metadata for a ticket
     */
    async updateCrisisMetadata(
        ticketId: string,
        updates: z.infer<typeof ticketCrisisUpdateSchema>,
    ): Promise<TicketRow> {
        try {
            const validated = ticketCrisisUpdateSchema.parse(updates)
            const db = createServiceClient()

            const { data, error } = await db
                .from('tickets')
                .update(validated)
                .eq('id', ticketId)
                .select()
                .single()

            if (error) throw new DatabaseError(error.message)
            if (!data) throw new DatabaseError('Failed to update ticket')

            return ticketSchema.parse(data)
        } catch (error) {
            console.error('[TicketCrisisService.updateCrisisMetadata]', error)
            throw error
        }
    }

    /**
     * Find all tickets that are part of a crisis cluster
     */
    async findCrisisCluster(parentTicketId: string): Promise<TicketRow[]> {
        try {
            const db = createServiceClient()
            const { data, error } = await db
                .from('tickets')
                .select('*')
                .eq('parent_ticket_id', parentTicketId)
                .order('created_at', { ascending: false })

            if (error) throw new DatabaseError(error.message)
            return data ? z.array(ticketSchema).parse(data) : []
        } catch (error) {
            console.error('[TicketCrisisService.findCrisisCluster]', error)
            throw error
        }
    }

    /**
     * Find tickets with specific crisis keywords
     */
    async findByKeywords(keywords: string[]): Promise<TicketRow[]> {
        try {
            const db = createServiceClient()
            const { data, error } = await db
                .from('tickets')
                .select('*')
                .overlaps('crisis_keywords', keywords)
                .order('chaos_score', { ascending: false })

            if (error) throw new DatabaseError(error.message)
            return data ? z.array(ticketSchema).parse(data) : []
        } catch (error) {
            console.error('[TicketCrisisService.findByKeywords]', error)
            throw error
        }
    }

    /**
     * Search for tickets based on various criteria
     * This is used by the Firebreak agent to find potential crisis clusters
     */
    async searchTickets(
        params: z.infer<typeof _ticketSearchSchema>,
    ): Promise<TicketRow[]> {
        try {
            const db = createServiceClient()
            let query = db.from('tickets').select('*')

            // Apply time-based filters
            if (params.timeframe?.start) {
                query = query.gte('created_at', params.timeframe.start)
            }
            if (params.timeframe?.end) {
                query = query.lte('created_at', params.timeframe.end)
            }

            // Apply status filter
            if (params.status) {
                query = query.eq('status', params.status)
            }

            // Apply priority filter
            if (params.priority) {
                query = query.eq('priority', params.priority)
            }

            // Apply full-text search if term provided
            if (params.search_term) {
                query = query.or(
                    `subject.ilike.%${params.search_term}%,description.ilike.%${params.search_term}%`,
                )
            }

            // Order by most recent first
            query = query.order('created_at', { ascending: false })

            const { data, error } = await query

            if (error) throw new DatabaseError(error.message)
            return data ? z.array(ticketSchema).parse(data) : []
        } catch (error) {
            console.error('[TicketCrisisService.searchTickets]', error)
            throw error
        }
    }

    /**
     * Find recent tickets that might be part of a crisis
     * This is a specialized search for the Firebreak agent
     */
    async findPotentialCrisisTickets(
        options: { hoursBack?: number } = {},
    ): Promise<TicketRow[]> {
        try {
            const hoursBack = options.hoursBack || 2 // Default to 2 hours
            const db = createServiceClient()

            // Calculate time window from now
            const now = new Date()
            const startTime = new Date(
                now.getTime() - hoursBack * 60 * 60 * 1000,
            )

            const { data, error } = await db
                .from('tickets')
                .select('*')
                .gte('created_at', startTime.toISOString())
                .in('status', ['new', 'open'] as const)
                .order('created_at', { ascending: false })

            if (error) {
                console.error('Database error:', error)
                throw new DatabaseError(error.message)
            }

            return data ? z.array(ticketSchema).parse(data) : []
        } catch (error) {
            console.error(
                '[TicketCrisisService.findPotentialCrisisTickets]',
                error,
            )
            throw error
        }
    }
}
