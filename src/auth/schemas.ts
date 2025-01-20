import { z } from 'zod'

// Identity data schema for OAuth providers
export const oauthIdentityDataSchema = z.object({
    avatar_url: z.string().url().optional(),
    email: z.string().email().optional(),
    email_verified: z.boolean().optional(),
    full_name: z.string().optional(),
    iss: z.string().optional(),
    name: z.string().optional(),
    picture: z.string().url().optional(),
    provider_id: z.string(),
    sub: z.string().optional(),
    user_name: z.string().optional(),
})

// User metadata schema
export const userMetadataSchema = z.object({
    avatar_url: z.string().url(),
    custom_claims: z.record(z.string()).optional(),
    email: z.string().email(),
    email_verified: z.boolean(),
    full_name: z.string(),
    iss: z.string(),
    name: z.string(),
    phone_verified: z.boolean().optional(),
    picture: z.string().url(),
    provider_id: z.string(),
    sub: z.string(),
})

// App metadata schema
export const appMetadataSchema = z.object({
    provider: z.string(),
    providers: z.array(z.string()),
})

// Identity schema
export const identitySchema = z.object({
    identity_id: z.string().uuid(),
    id: z.string(),
    user_id: z.string().uuid(),
    identity_data: oauthIdentityDataSchema,
    provider: z.enum(['discord', 'github']),
    last_sign_in_at: z.string().datetime(),
    created_at: z.string().datetime(),
    updated_at: z.string().datetime(),
    email: z.string().email(),
})

export type OAuthIdentityData = z.infer<typeof oauthIdentityDataSchema>
export type OAuthUserMetadata = z.infer<typeof userMetadataSchema>
export type OAuthAppMetadata = z.infer<typeof appMetadataSchema>
export type OAuthIdentity = z.infer<typeof identitySchema>

// Main OAuth provider schema (full Supabase auth user)
export const oauthProviderSchema = z.object({
    id: z.string().uuid(),
    aud: z.string(),
    role: z.string(),
    email: z.string().email(),
    email_confirmed_at: z.string().datetime(),
    phone: z.string().optional(),
    confirmed_at: z.string().datetime(),
    last_sign_in_at: z.string().datetime(),
    app_metadata: appMetadataSchema,
    user_metadata: userMetadataSchema,
    identities: z.array(identitySchema),
    created_at: z.string().datetime(),
    updated_at: z.string().datetime(),
    is_anonymous: z.boolean(),
})

export type OAuthProvider = z.infer<typeof oauthProviderSchema>

// Validation helper
export function validateOAuthProvider(data: unknown): OAuthProvider {
    return oauthProviderSchema.parse(data)
}
