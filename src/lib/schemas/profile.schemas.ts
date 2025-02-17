import { z } from 'zod'

import {
    type Tables,
    type TablesInsert,
    type TablesUpdate,
} from '@/lib/supabase/types'

// Database types
export type ProfileRow = Tables<'profiles'>
export type ProfileInsert = TablesInsert<'profiles'>
export type ProfileUpdate = TablesUpdate<'profiles'>

// Base schema matching database exactly
export const profileSchema = z.object({
    id: z.string(),
    user_id: z.string(),
    created_at: z.string().transform(str => new Date(str).toISOString()),
    updated_at: z.string().transform(str => new Date(str).toISOString()),
    full_name: z.string().nullable(),
    avatar_url: z.string().url().nullable(),
    bio: z.string().nullable(),
    role: z.enum(['customer', 'agent', 'admin']),
}) satisfies z.ZodType<ProfileRow>

// Insert schema (omitting generated fields)
export const profileInsertSchema = profileSchema.omit({
    id: true,
    created_at: true,
    updated_at: true,
}) satisfies z.ZodType<ProfileInsert>

// Update schema (all fields optional except id)
export const profileUpdateSchema = profileSchema
    .omit({
        created_at: true,
        updated_at: true,
    })
    .partial()
    .required({ id: true }) satisfies z.ZodType<ProfileUpdate>
