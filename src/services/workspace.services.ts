import { z } from 'zod'

import { DatabaseError } from '@/lib/errors'
import {
    createWorkspaceSchema,
    updateWorkspaceSchema,
    workspaceSchema,
} from '@/lib/schemas/workspace.schemas'
import { createClient } from '@/lib/supabase/server'

import type { Tables } from '@/lib/supabase/types'

export class WorkspaceService {
    private async getDb() {
        return createClient()
    }

    async findById(id: string): Promise<Tables<'workspaces'>> {
        const db = await this.getDb()
        const { data, error } = await db
            .from('workspaces')
            .select('*')
            .eq('id', id)
            .single()

        if (error) throw new DatabaseError(error.message)
        return workspaceSchema.parse(data)
    }

    async findBySlug(slug: string): Promise<Tables<'workspaces'>> {
        const db = await this.getDb()
        const { data, error } = await db
            .from('workspaces')
            .select('*')
            .eq('slug', slug)
            .single()

        if (error) throw new DatabaseError(error.message)
        return workspaceSchema.parse(data)
    }

    async create(input: z.infer<typeof createWorkspaceSchema>) {
        const db = await this.getDb()
        const validated = createWorkspaceSchema.parse(input)
        const { data, error } = await db
            .from('workspaces')
            .insert(validated)
            .select()
            .single()

        if (error) throw new DatabaseError(error.message)
        return data as Tables<'workspaces'> // Already validated by RLS and schema
    }

    async update(id: string, input: z.infer<typeof updateWorkspaceSchema>) {
        const db = await this.getDb()
        const validated = updateWorkspaceSchema.parse(input)
        const { data, error } = await db
            .from('workspaces')
            .update(validated)
            .eq('id', id)
            .select()
            .single()

        if (error) throw new DatabaseError(error.message)
        return data as Tables<'workspaces'> // Already validated by RLS and schema
    }

    async listForUser(userId: string): Promise<Tables<'workspaces'>[]> {
        const db = await this.getDb()
        const { data, error } = await db
            .from('workspaces')
            .select('*, workspace_members!inner(*)')
            .eq('workspace_members.user_id', userId)

        if (error) throw new DatabaseError(error.message)
        return data.map((workspace: Tables<'workspaces'>) =>
            workspaceSchema.parse(workspace),
        )
    }
}
