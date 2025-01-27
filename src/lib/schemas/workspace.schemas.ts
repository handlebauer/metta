import { z } from 'zod'

import { type Json, type Tables, type TablesInsert } from '@/lib/supabase/types'

// A reusable Zod schema for any valid JSON type
const jsonSchema: z.ZodType<Json> = z.lazy(() =>
    z.union([
        z.string(),
        z.number(),
        z.boolean(),
        z.null(),
        z.array(jsonSchema),
        z.record(jsonSchema),
    ]),
)

// 1) Runtime validation schema for an existing workspace
//    - Satisfies the shape returned by Supabase (Tables<'workspaces'>).
//    - Here, "settings" must be of type Json (no undefined allowed), so we
//      do not mark it optional.
export const workspaceSchema = z.object({
    id: z.string(),
    created_at: z.string().nullable(),
    updated_at: z.string().nullable(),
    name: z.string().min(1),
    slug: z.string().regex(/^[a-z0-9-]+$/),
    logo_url: z.string().url().nullable(),
    settings: jsonSchema, // must be valid JSON (not undefined)
}) satisfies z.ZodType<Tables<'workspaces'>>

// 2) Schema for creating a new workspace
//    - Satisfies the shape you insert into DB (TablesInsert<'workspaces'>).
//    - We allow "settings" to be optional in user input, but default to {}
//      so that after validation it will be valid JSON (not undefined).
export const createWorkspaceSchema = workspaceSchema
    .omit({
        id: true,
        created_at: true,
        updated_at: true,
    })
    .extend({
        // Make settings optional on input, but always produce a valid JSON object
        settings: jsonSchema.optional().default({}),
        logo_url: z.string().url().optional(),
    }) satisfies z.ZodType<TablesInsert<'workspaces'>>

// 3) Input validation for updating a workspace
//    - We partially allow any field from createWorkspaceSchema to be omitted.
//    - Again, ensure "settings" is still valid JSON (not undefined) after validation:
export const updateWorkspaceSchema = createWorkspaceSchema.partial().extend({
    settings: jsonSchema.optional().default({}),
})
