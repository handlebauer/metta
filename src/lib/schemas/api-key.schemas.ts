import { z } from 'zod'

export const ApiKeyStatus = z.enum(['active', 'revoked', 'expired'])
export type ApiKeyStatus = z.infer<typeof ApiKeyStatus>

// Helper for Supabase timestamp fields
const timestamp = z.string().transform(str => new Date(str).toISOString())

export const ApiKey = z.object({
    id: z.string(),
    name: z.string().min(1),
    key_id: z.string().uuid(),
    user_id: z.string().uuid(),
    status: ApiKeyStatus,
    last_used_at: timestamp.nullable(),
    expires_at: timestamp.nullable(),
    created_at: timestamp,
    updated_at: timestamp,
})
export type ApiKey = z.infer<typeof ApiKey>

export const CreateApiKeySchema = z.object({
    name: z.string().min(1),
})
export type CreateApiKeySchema = z.infer<typeof CreateApiKeySchema>

export const ApiKeyResponseSchema = z.object({
    api_key_id: z.string(),
    api_key: z.string(),
})
export type ApiKeyResponse = z.infer<typeof ApiKeyResponseSchema>

export const DecryptedApiKeySchema = ApiKey.extend({
    key: z.string(),
})
export type DecryptedApiKey = z.infer<typeof DecryptedApiKeySchema>
