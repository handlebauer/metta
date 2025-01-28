import { PostgrestError } from '@supabase/supabase-js'
import { z } from 'zod'

import { DatabaseError } from '@/lib/errors'
import {
    createWorkspaceSchema,
    updateWorkspaceSchema,
    workspaceSchema,
} from '@/lib/schemas/workspace.schemas'
import { createClient } from '@/lib/supabase/server'

import type { Tables } from '@/lib/supabase/types'

type Workspace = Tables<'workspaces'>

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

    async create(
        input: Parameters<(typeof createWorkspaceSchema)['parse']>[0],
    ): Promise<Workspace> {
        const supabase = await createClient()

        // Get the current user
        const {
            data: { user },
            error: userError,
        } = await supabase.auth.getUser()
        if (userError || !user) {
            throw new DatabaseError('Not authenticated')
        }

        // Validate input
        const validated = createWorkspaceSchema.parse(input)

        // Use the create_workspace_with_admin function
        const { data: workspace, error } = (await supabase.rpc(
            'create_workspace_with_admin',
            {
                workspace_name: validated.name,
                workspace_slug: validated.slug,
                creator_id: user.id,
            },
        )) as { data: Workspace | null; error: PostgrestError | null }

        if (error) throw new DatabaseError(error.message)
        if (!workspace) throw new DatabaseError('Failed to create workspace')

        // If we have settings, update them separately
        if (validated.settings && Object.keys(validated.settings).length > 0) {
            const { error: updateError } = await supabase
                .from('workspaces')
                .update({ settings: validated.settings })
                .eq('id', workspace.id)
                .single()

            if (updateError) throw new DatabaseError(updateError.message)
        }

        return workspace
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
