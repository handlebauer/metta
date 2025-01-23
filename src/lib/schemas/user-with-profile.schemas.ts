import { z } from 'zod'

import { profileSchema } from './profile.schemas'
import { userSchema } from './user.schemas'

import type { TablesInsert } from '@/lib/supabase/types'
import type { ProfileRow } from './profile.schemas'
import type { UserRow } from './user.schemas'

// Combined type for a user with their profile
export type UserWithProfile = UserRow & {
    profile: Omit<ProfileRow, 'user_id'>
}

// Base schema that combines user and profile
export const userWithProfileSchema = userSchema.extend({
    profile: profileSchema.omit({ user_id: true }),
}) as z.ZodType<UserWithProfile>

// Schema for creating a new user with profile
export type UserWithProfileInsert = TablesInsert<'users'> & {
    profile: Omit<TablesInsert<'profiles'>, 'user_id'>
}

export const userWithProfileInsertSchema = z.object({
    // User fields
    email: z.string().email(),
    is_active: z.boolean().default(true),
    // Profile fields
    profile: profileSchema
        .omit({
            id: true,
            user_id: true,
            created_at: true,
            updated_at: true,
        })
        .extend({
            role: z.enum(['customer', 'agent', 'admin']).default('customer'),
        }),
}) satisfies z.ZodType<UserWithProfileInsert>

// Schema for updating a user with profile
export type UserWithProfileUpdate = {
    id: string
    email?: string
    is_active?: boolean
    last_sign_in_at?: string | null
    profile?: {
        full_name: string | null
        avatar_url: string | null
        bio: string | null
        role: 'customer' | 'agent' | 'admin'
        id: string
    }
}

export const userWithProfileUpdateSchema = z.object({
    id: z.string(),
    email: z.string().email().optional(),
    is_active: z.boolean().optional(),
    last_sign_in_at: z.string().nullable().optional(),
    profile: z
        .object({
            full_name: z.string().nullable(),
            avatar_url: z.string().nullable(),
            bio: z.string().nullable(),
            role: z.enum(['customer', 'agent', 'admin']),
            id: z.string(),
        })
        .optional(),
}) satisfies z.ZodType<UserWithProfileUpdate>
