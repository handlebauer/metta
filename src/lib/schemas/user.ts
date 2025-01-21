import { z } from 'zod'

import {
    type Tables,
    type TablesInsert,
    type TablesUpdate,
} from '@/lib/supabase/types'

// Database types
export type UserRow = Tables<'users'>
export type UserInsert = TablesInsert<'users'>
export type UserUpdate = TablesUpdate<'users'>

// Base schema matching database exactly
export const userSchema = z.object({
    id: z.string(),
    created_at: z.string().nullable(),
    updated_at: z.string().nullable(),
    email: z.string().email(),
    is_active: z.boolean(),
    last_sign_in_at: z.string().nullable(),
}) satisfies z.ZodType<UserRow>

// Insert schema (omitting generated fields)
export const userInsertSchema = userSchema.omit({
    id: true,
    created_at: true,
    updated_at: true,
    last_sign_in_at: true,
}) satisfies z.ZodType<UserInsert>

// Update schema (all fields optional except id)
export const userUpdateSchema = userSchema
    .omit({
        created_at: true,
        updated_at: true,
    })
    .partial()
    .required({ id: true }) satisfies z.ZodType<UserUpdate>
