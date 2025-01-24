'use server'

import { revalidatePath } from 'next/cache'

import {
    webhookEndpointInsertSchema,
    webhookEndpointUpdateSchema,
} from '@/lib/schemas/webhook.schemas'
import { createClient } from '@/lib/supabase/server'

import type { WebhookEndpointRow } from '@/lib/schemas/webhook.schemas'

export async function listWebhookEndpointsAction() {
    try {
        const supabase = await createClient()

        const { data: webhooks, error } = await supabase
            .from('webhook_endpoints')
            .select('*')
            .order('created_at', { ascending: false })

        if (error) {
            throw error
        }

        return { data: webhooks as WebhookEndpointRow[], error: null }
    } catch (error) {
        console.error('Failed to list webhook endpoints:', error)
        return {
            data: null,
            error: 'Failed to load webhook endpoints. Please try again.',
        }
    }
}

export async function createWebhookEndpointAction(data: {
    name: string
    url: string
    events: string[]
    active: boolean
}) {
    try {
        const supabase = await createClient()

        // Get the current user
        const {
            data: { user },
            error: userError,
        } = await supabase.auth.getUser()

        if (userError || !user) {
            throw new Error('Unauthorized')
        }

        // Validate the input
        const validatedData = webhookEndpointInsertSchema.parse({
            ...data,
            user_id: user.id,
        })

        // Create the webhook endpoint
        const { data: webhook, error } = await supabase
            .rpc('create_webhook_endpoint', {
                p_name: validatedData.name,
                p_url: validatedData.url,
                p_events: validatedData.events,
                p_active: validatedData.active,
            })
            .single()

        if (error) {
            throw error
        }

        revalidatePath('/dashboard/settings/developer')
        return { data: webhook as WebhookEndpointRow, error: null }
    } catch (error) {
        console.error('Failed to create webhook endpoint:', error)
        return {
            data: null,
            error: 'Failed to create webhook endpoint. Please try again.',
        }
    }
}

export async function updateWebhookEndpointAction(
    id: string,
    data: Partial<{
        name: string
        url: string
        events: string[]
        active: boolean
    }>,
) {
    try {
        const supabase = await createClient()

        // Validate the input
        const validatedData = webhookEndpointUpdateSchema.parse({
            id,
            ...data,
        })

        const { data: webhook, error } = await supabase
            .from('webhook_endpoints')
            .update(validatedData)
            .eq('id', id)
            .select()
            .single()

        if (error) {
            throw error
        }

        revalidatePath('/dashboard/settings/developer')
        return { data: webhook as WebhookEndpointRow, error: null }
    } catch (error) {
        console.error('Failed to update webhook endpoint:', error)
        return {
            data: null,
            error: 'Failed to update webhook endpoint. Please try again.',
        }
    }
}

export async function deleteWebhookEndpointAction(id: string) {
    try {
        const supabase = await createClient()

        const { error } = await supabase
            .from('webhook_endpoints')
            .delete()
            .eq('id', id)

        if (error) {
            throw error
        }

        revalidatePath('/dashboard/settings/developer')
        return { error: null }
    } catch (error) {
        console.error('Failed to delete webhook endpoint:', error)
        return {
            error: 'Failed to delete webhook endpoint. Please try again.',
        }
    }
}
