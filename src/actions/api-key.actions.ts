'use server'

import { revalidatePath } from 'next/cache'

import {
    createApiKey,
    getDecryptedApiKey,
    listApiKeys,
    revokeApiKey,
} from '@/services/api-key.services'

import type {
    ApiKey,
    ApiKeyResponse,
    CreateApiKeySchema,
    DecryptedApiKey,
} from '@/lib/schemas/api-key.schemas'

/**
 * Create a new API key
 */
export async function createApiKeyAction(
    data: CreateApiKeySchema,
): Promise<{ data: ApiKeyResponse | null; error: string | null }> {
    try {
        const apiKey = await createApiKey(data)
        revalidatePath('/dashboard/settings/developer')
        return { data: apiKey, error: null }
    } catch (error) {
        return {
            data: null,
            error:
                error instanceof Error
                    ? error.message
                    : 'Failed to create API key',
        }
    }
}

/**
 * List all API keys for the current user
 */
export async function listApiKeysAction(): Promise<{
    data: ApiKey[] | null
    error: string | null
}> {
    try {
        const apiKeys = await listApiKeys()
        return { data: apiKeys, error: null }
    } catch (error) {
        return {
            data: null,
            error:
                error instanceof Error
                    ? error.message
                    : 'Failed to list API keys',
        }
    }
}

/**
 * Get a decrypted API key by ID
 * Note: This should only be used in secure server contexts
 */
export async function getDecryptedApiKeyAction(
    id: string,
): Promise<{ data: DecryptedApiKey | null; error: string | null }> {
    try {
        const apiKey = await getDecryptedApiKey(id)
        return { data: apiKey, error: null }
    } catch (error) {
        return {
            data: null,
            error:
                error instanceof Error
                    ? error.message
                    : 'Failed to get API key',
        }
    }
}

/**
 * Revoke an API key
 */
export async function revokeApiKeyAction(
    id: string,
): Promise<{ error: string | null }> {
    try {
        await revokeApiKey(id)
        revalidatePath('/dashboard/settings/developer')
        return { error: null }
    } catch (error) {
        return {
            error:
                error instanceof Error
                    ? error.message
                    : 'Failed to revoke API key',
        }
    }
}
