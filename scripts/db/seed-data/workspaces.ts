import { createClient } from '@supabase/supabase-js'

import { createWorkspaceMemberSchema } from '@/lib/schemas/workspace-member.schemas'
import { createWorkspaceSchema } from '@/lib/schemas/workspace.schemas'

import type { Database } from '@/lib/supabase/types'
import type { z } from 'zod'

export const DEMO_WORKSPACE: z.infer<typeof createWorkspaceSchema> = {
    name: 'DemoHost',
    slug: 'demohost',
    logo_url: 'https://api.dicebear.com/7.x/shapes/svg?seed=demohost',
    settings: {},
}

export async function seedWorkspaces(
    supabase: ReturnType<typeof createClient<Database>>,
    {
        userMap,
        agentMap,
    }: { userMap: Record<number, string>; agentMap: Record<number, string> },
) {
    console.log('🏢 Creating demo workspace...')

    // Create the demo workspace
    const { data: workspace, error: workspaceError } = await supabase
        .from('workspaces')
        .upsert(DEMO_WORKSPACE, { onConflict: 'slug' })
        .select()
        .single()

    if (workspaceError) throw workspaceError
    console.log('✅ Demo workspace created')

    // Add all users to the workspace with their respective roles
    const memberInserts: z.infer<typeof createWorkspaceMemberSchema>[] = []

    // Add demo admin
    if (agentMap[-1]) {
        memberInserts.push({
            workspace_id: workspace.id,
            user_id: agentMap[-1],
            role: 'admin',
        })
    }

    // Add agents
    for (const agentId of Object.values(agentMap)) {
        if (agentId !== agentMap[-1]) {
            // Skip demo admin as they're already added
            memberInserts.push({
                workspace_id: workspace.id,
                user_id: agentId,
                role: 'agent',
            })
        }
    }

    // Add customers
    for (const customerId of Object.values(userMap)) {
        memberInserts.push({
            workspace_id: workspace.id,
            user_id: customerId,
            role: 'customer',
        })
    }

    // Add all members
    const { error: membersError } = await supabase
        .from('workspace_members')
        .upsert(memberInserts, { onConflict: 'workspace_id,user_id' })

    if (membersError) throw membersError
    console.log('✅ Workspace members added')

    return { workspaceId: workspace.id }
}
