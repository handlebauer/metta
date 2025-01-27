'use server'

import { revalidatePath } from 'next/cache'

import { createClient } from '@/lib/supabase/server'
import { WorkspaceService } from '@/services/workspace.services'

const service = new WorkspaceService()

export async function getWorkspaceBySlug(slug: string) {
    try {
        const workspace = await service.findBySlug(slug)
        return { data: workspace, error: null }
    } catch (error) {
        console.error('[getWorkspaceBySlug]', error)
        return {
            data: null,
            error:
                error instanceof Error
                    ? error.message
                    : 'Failed to get workspace',
        }
    }
}

export async function listUserWorkspaces() {
    try {
        const supabase = await createClient()
        const {
            data: { user },
        } = await supabase.auth.getUser()

        if (!user?.id) {
            throw new Error('Not authenticated')
        }

        const workspaces = await service.listForUser(user.id)
        return { data: workspaces, error: null }
    } catch (error) {
        console.error('[listUserWorkspaces]', error)
        return {
            data: null,
            error:
                error instanceof Error
                    ? error.message
                    : 'Failed to list workspaces',
        }
    }
}

export async function updateWorkspace(
    id: string,
    data: Parameters<typeof service.update>[1],
) {
    try {
        const workspace = await service.update(id, data)
        revalidatePath('/[slug]', 'layout')
        return { data: workspace, error: null }
    } catch (error) {
        console.error('[updateWorkspace]', error)
        return {
            data: null,
            error:
                error instanceof Error
                    ? error.message
                    : 'Failed to update workspace',
        }
    }
}

export async function createWorkspace(
    data: Parameters<typeof service.create>[0],
) {
    try {
        const workspace = await service.create(data)
        revalidatePath('/dashboard/workspaces')
        return { data: workspace, error: null }
    } catch (error) {
        console.error('[createWorkspace]', error)
        return {
            data: null,
            error:
                error instanceof Error
                    ? error.message
                    : 'Failed to create workspace',
        }
    }
}
