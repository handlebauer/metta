import { z } from 'zod'

import {
    type Tables,
    type TablesInsert,
    type TablesUpdate,
} from '@/lib/supabase/types'

// Database types
export type WebhookEndpointRow = Tables<'webhook_endpoints'>
export type WebhookEndpointInsert = TablesInsert<'webhook_endpoints'>
export type WebhookEndpointUpdate = TablesUpdate<'webhook_endpoints'>
export type WebhookDeliveryAttemptRow = Tables<'webhook_delivery_attempts'>

// Webhook event enum
export const WebhookEvent = z.enum([
    'ticket.created',
    'ticket.updated',
    'ticket.closed',
    'message.created',
])
export type WebhookEvent = z.infer<typeof WebhookEvent>

// Base schema matching database exactly
export const webhookEndpointSchema = z.object({
    id: z.string(),
    created_at: z.string(),
    updated_at: z.string(),
    user_id: z.string(),
    name: z.string().min(1, 'Name is required'),
    url: z.string().url('Must be a valid URL'),
    events: z.array(WebhookEvent).min(1, 'Select at least one event'),
    active: z.boolean(),
    secret: z.string(),
})

// Insert schema (omitting generated fields)
export const webhookEndpointInsertSchema = webhookEndpointSchema
    .omit({
        id: true,
        created_at: true,
        updated_at: true,
        secret: true,
    })
    .strict()

// Update schema (all fields optional except id)
export const webhookEndpointUpdateSchema = webhookEndpointSchema
    .omit({
        created_at: true,
        updated_at: true,
        secret: true,
    })
    .partial()
    .required({ id: true })
    .strict()

// Webhook delivery attempt schema
export const webhookDeliveryAttemptSchema = z.object({
    id: z.string(),
    created_at: z.string(),
    webhook_id: z.string(),
    event: WebhookEvent,
    payload: z.record(z.unknown()),
    response_status: z.number().nullable(),
    response_body: z.string().nullable(),
    error: z.string().nullable(),
})

// Schema for webhook event payloads
export const webhookPayloadSchema = z.object({
    id: z.string(),
    event: WebhookEvent,
    created_at: z.string(),
    data: z.record(z.unknown()),
})
