import { z } from 'zod'

import {
    type Tables,
    type TablesInsert,
    type TablesUpdate,
} from '@/lib/supabase/types'

// Database types
export type TicketRow = Tables<'tickets'>
export type TicketInsert = TablesInsert<'tickets'>
export type TicketUpdate = TablesUpdate<'tickets'>
export type TicketInternalNoteRow = Tables<'ticket_internal_notes'>
export type TicketInternalNoteInsert = TablesInsert<'ticket_internal_notes'>

// Schema enums
export const ticketPriorityEnum = z.enum(['low', 'medium', 'high', 'urgent'])
export type TicketPriority = z.infer<typeof ticketPriorityEnum>

// Extended type for tickets with customer info
export interface TicketWithCustomer extends TicketRow {
    customer: {
        email: string
        full_name: string | null
    }
}

// Extended type for tickets with internal notes
export interface TicketWithInternalNotes extends TicketRow {
    internal_notes: TicketInternalNoteRow[]
}

// Base schema for internal notes
export const ticketInternalNoteSchema = z.object({
    id: z.string(),
    created_at: z.string().nullable(),
    content: z.string().min(1),
    created_by: z.string(),
    ticket_id: z.string(),
}) satisfies z.ZodType<TicketInternalNoteRow>

// Insert schema for internal notes
export const ticketInternalNoteInsertSchema = ticketInternalNoteSchema.omit({
    id: true,
    created_at: true,
}) satisfies z.ZodType<TicketInternalNoteInsert>

// Base schema matching database exactly
export const ticketSchema = z.object({
    id: z.string(),
    created_at: z.string().nullable(),
    updated_at: z.string().nullable(),
    subject: z.string().min(1, 'Please enter a subject'),
    description: z.string().min(1, 'Please provide a description'),
    status: z.enum(['new', 'open', 'closed']),
    priority: ticketPriorityEnum,
    customer_id: z.string().min(1, 'Please select a requester'),
    agent_id: z.string().nullable(),
    parent_ticket_id: z.string().nullable(),
    crisis_keywords: z.array(z.string()).nullable(),
    chaos_score: z.number().min(0).max(100).nullable(),
}) satisfies z.ZodType<TicketRow>

// Insert schema for customers creating tickets
export const ticketInsertSchema = ticketSchema
    .omit({
        id: true,
        created_at: true,
        updated_at: true,
        status: true,
    })
    .extend({
        priority: ticketPriorityEnum.optional().default('medium'),
    }) satisfies z.ZodType<TicketInsert>

// Update schema for agents (status, priority, and assignment)
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

// Ticket Status History schema
export const ticketStatusHistorySchema = z.object({
    id: z.string(),
    created_at: z.string().nullable(),
    ticket_id: z.string(),
    old_status: z.enum(['new', 'open', 'closed']).nullable(),
    new_status: z.enum(['new', 'open', 'closed']),
    changed_by: z.string(),
    changed_by_email: z.string(),
    changed_by_name: z.string(),
}) satisfies z.ZodType<
    Tables<'ticket_status_history'> & {
        changed_by_email: string
        changed_by_name: string
    }
>

export type TicketStatusHistoryRow = z.infer<typeof ticketStatusHistorySchema>

// Ticket Priority History schema
export const ticketPriorityHistorySchema = z.object({
    id: z.string(),
    created_at: z.string().nullable(),
    ticket_id: z.string(),
    old_priority: ticketPriorityEnum.nullable(),
    new_priority: ticketPriorityEnum,
    changed_by: z.string(),
    changed_by_email: z.string(),
    changed_by_name: z.string(),
}) satisfies z.ZodType<
    Tables<'ticket_priority_history'> & {
        changed_by_email: string
        changed_by_name: string
    }
>

export type TicketPriorityHistoryRow = z.infer<
    typeof ticketPriorityHistorySchema
>
