import { z } from 'zod'

import { type Tables, type TablesInsert } from '@/lib/supabase/types'

// Enum for user roles
export const userRoleEnum = z.enum(['customer', 'agent', 'admin'])
export type UserRole = z.infer<typeof userRoleEnum>

// Runtime validation schema for workspace members
export const workspaceMemberSchema = z.object({
    id: z.string(),
    workspace_id: z.string(),
    user_id: z.string(),
    role: userRoleEnum,
    created_at: z.string().datetime(),
    updated_at: z.string().datetime(),
}) satisfies z.ZodType<Tables<'workspace_members'>>

// Input validation schema for creating workspace members
export const createWorkspaceMemberSchema = workspaceMemberSchema.omit({
    id: true,
    created_at: true,
    updated_at: true,
}) satisfies z.ZodType<TablesInsert<'workspace_members'>>

// Input validation schema for updating workspace members
export const updateWorkspaceMemberSchema = z.object({
    role: userRoleEnum,
})
