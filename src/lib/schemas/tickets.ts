import {
    type Tables,
    type TablesInsert,
    type TablesUpdate,
} from '@/lib/supabase/types'
import { z } from 'zod'

// Database types
export type TicketRow = Tables<'tickets'>
export type TicketInsert = TablesInsert<'tickets'>
export type TicketUpdate = TablesUpdate<'tickets'>

// Extended type for tickets with customer info
export interface TicketWithCustomer extends TicketRow {
    customer: {
        email: string
        full_name: string | null
    }
}

// Base schema matching database exactly
export const ticketSchema = z.object({
    id: z.string(),
    created_at: z.string().nullable(),
    updated_at: z.string().nullable(),
    subject: z.string().min(1),
    description: z.string(),
    status: z.enum(['new', 'open', 'closed']),
    customer_id: z.string(),
    agent_id: z.string().nullable(),
}) satisfies z.ZodType<TicketRow>

// Insert schema for customers creating tickets
export const ticketInsertSchema = ticketSchema.omit({
    id: true,
    created_at: true,
    updated_at: true,
    status: true,
    agent_id: true,
}) satisfies z.ZodType<TicketInsert>

// Update schema for agents (status and assignment)
export const ticketUpdateSchema = ticketSchema
    .omit({
        created_at: true,
        updated_at: true,
        subject: true,
        description: true,
        customer_id: true,
    })
    .partial()
    .required({ id: true }) satisfies z.ZodType<TicketUpdate>
