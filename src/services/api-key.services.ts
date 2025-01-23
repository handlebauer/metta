import { SupabaseClient } from '@supabase/supabase-js'

import {
    ApiKey,
    ApiKeyResponseSchema,
    CreateApiKeySchema,
    DecryptedApiKeySchema,
} from '@/lib/schemas/api-key.schemas'
import { createClient } from '@/lib/supabase/server'
import { UserWithProfileService } from '@/services/user-with-profile.services'

import type { Database } from '@/lib/supabase/types'

type ApiKeysFilter = {
    status?: 'active' | 'revoked' | 'expired'
}

/**
 * Get a single API key by ID
 */
export async function getApiKey(id: string): Promise<ApiKey | null> {
    const supabase = await createClient()

    const { data: apiKey, error } = await supabase
        .from('api_keys')
        .select('*')
        .eq('id', id)
        .single()

    if (error) {
        if (error.code === 'PGRST116') {
            return null
        }
        throw new Error(`Failed to get API key: ${error.message}`)
    }

    return ApiKey.parse(apiKey)
}

/**
 * List API keys with optional filters
 */
export async function listApiKeys(filter?: ApiKeysFilter): Promise<ApiKey[]> {
    const supabase = await createClient()

    let query = supabase.from('api_keys').select('*')

    if (filter?.status) {
        query = query.eq('status', filter.status)
    }

    const { data: apiKeys, error } = await query.order('created_at', {
        ascending: false,
    })

    if (error) {
        throw new Error(`Failed to list API keys: ${error.message}`)
    }

    return ApiKey.array().parse(apiKeys || [])
}

/**
 * Create a new API key
 */
export async function createApiKey(
    data: CreateApiKeySchema,
): Promise<{ api_key_id: string; api_key: string }> {
    const userService = new UserWithProfileService()
    const user = await userService.getAuthenticatedUser()

    if (!user) {
        throw new Error('Unauthorized')
    }

    const supabase = await createClient()
    const { data: response, error } = await supabase.rpc('generate_api_key', {
        key_name: data.name,
        user_id: user.id,
    })

    if (error) {
        throw new Error(`Failed to create API key: ${error.message}`)
    }

    const result = ApiKeyResponseSchema.parse(response)
    return {
        api_key_id: result.api_key_id,
        api_key: result.api_key,
    }
}

/**
 * Get a decrypted API key by ID
 * Note: This should only be used in secure server contexts
 */
export async function getDecryptedApiKey(id: string) {
    const supabase = await createClient()

    const { data: apiKey, error } = await supabase
        .from('decrypted_api_keys')
        .select('*')
        .eq('id', id)
        .single()

    if (error) {
        if (error.code === 'PGRST116') {
            return null
        }
        throw new Error(`Failed to get decrypted API key: ${error.message}`)
    }

    return DecryptedApiKeySchema.parse(apiKey)
}

/**
 * Revoke an API key
 */
export async function revokeApiKey(id: string): Promise<void> {
    const supabase = await createClient()

    const { error } = await supabase.rpc('revoke_api_key', {
        api_key_id: id,
    })

    if (error) {
        throw new Error(`Failed to revoke API key: ${error.message}`)
    }
}

/**
 * Update the last used timestamp for an API key
 * This is called when the key is used for authentication
 */
export async function updateApiKeyUsage(
    id: string,
    client: SupabaseClient<Database>,
): Promise<void> {
    const { error } = await client
        .from('api_keys')
        .update({ last_used_at: new Date().toISOString() })
        .eq('id', id)

    if (error) {
        // Log but don't throw - this is a non-critical update
        console.error(`Failed to update API key usage: ${error.message}`)
    }
}

/**
 * Delete an API key permanently
 */
export async function deleteApiKey(id: string): Promise<void> {
    const supabase = await createClient()

    const { error } = await supabase.from('api_keys').delete().eq('id', id)

    if (error) {
        throw new Error(`Failed to delete API key: ${error.message}`)
    }
}
