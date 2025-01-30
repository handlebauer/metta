import { createClient } from '@supabase/supabase-js'

import type { ProfileInsert } from '@/lib/schemas/profile.schemas'
import type { UserInsert } from '@/lib/schemas/user.schemas'
import type { Database } from '@/lib/supabase/types'

export interface SeedUser {
    email: string
    password: string
    profile: Omit<ProfileInsert, 'user_id'>
}

export const SYSTEM_USER: SeedUser = {
    email: 'ai.sysadmin@metta.now',
    password: crypto.randomUUID(),
    profile: {
        full_name: 'Metta AI System',
        bio: 'System account for AI operations',
        role: 'admin',
        avatar_url: 'https://api.dicebear.com/7.x/bottts/svg?seed=metta-ai',
    },
}

export const DEMO_USER: SeedUser = {
    email: 'demo@metta.now',
    password: 'demo123',
    profile: {
        full_name: 'Demo Admin',
        bio: 'This is a demo admin account with full system access.',
        role: 'admin',
        avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=demo',
    },
}

export const DEMO_USER_NO_WORKSPACE: SeedUser = {
    email: 'demo.new@metta.now',
    password: 'demo123',
    profile: {
        full_name: 'Demo New Admin',
        bio: 'This is a demo admin account for testing the onboarding flow.',
        role: 'admin',
        avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=demo_new',
    },
}

export const TEST_USERS: SeedUser[] = [
    {
        email: 'testcustomer@example.com',
        password: 'test123',
        profile: {
            full_name: 'Test Customer',
            bio: 'Primary test customer account for demo interactions',
            role: 'customer',
            avatar_url: `https://api.dicebear.com/7.x/avataaars/svg?seed=testcustomer@example.com`,
        },
    },
    {
        email: 'customer1@example.com',
        password: 'customer1',
        profile: {
            full_name: 'Alice Johnson',
            bio: 'Customer 1 bio',
            role: 'customer',
            avatar_url: `https://api.dicebear.com/7.x/avataaars/svg?seed=customer1@example.com`,
        },
    },
    {
        email: 'customer2@example.com',
        password: 'customer2',
        profile: {
            full_name: 'Bob Smith',
            bio: 'Customer 2 bio',
            role: 'customer',
            avatar_url: `https://api.dicebear.com/7.x/avataaars/svg?seed=customer2@example.com`,
        },
    },
    {
        email: 'agent1@example.com',
        password: 'agent1',
        profile: {
            full_name: 'Charlie Brown',
            bio: 'Agent 1 bio',
            role: 'agent',
            avatar_url: `https://api.dicebear.com/7.x/avataaars/svg?seed=agent1@example.com`,
        },
    },
    {
        email: 'agent2@example.com',
        password: 'agent2',
        profile: {
            full_name: 'Diana Prince',
            bio: 'Agent 2 bio',
            role: 'agent',
            avatar_url: `https://api.dicebear.com/7.x/avataaars/svg?seed=agent2@example.com`,
        },
    },
]

export async function seedUsers(
    supabase: ReturnType<typeof createClient<Database>>,
) {
    console.log('👥 Ensuring users exist...')

    // Get all existing users in one call
    const { data: existingUsers } = await supabase.auth.admin.listUsers()
    const createdUsers = []

    const userMap: Record<number, string> = {}
    const agentMap: Record<number, string> = {}
    let systemUserId: string | undefined

    const allUsers = [
        SYSTEM_USER,
        DEMO_USER,
        DEMO_USER_NO_WORKSPACE,
        ...TEST_USERS,
    ]
    for (const [_index, userData] of allUsers.entries()) {
        const existingUser = existingUsers?.users.find(
            u => u.email === userData.email,
        )

        let authUser
        if (!existingUser) {
            // Create auth user if doesn't exist
            const { data: newAuthUser, error: authError } =
                await supabase.auth.admin.createUser({
                    email: userData.email,
                    password: userData.password,
                    email_confirm: true,
                })

            if (authError) throw authError
            authUser = newAuthUser.user
            console.log(`✅ Created auth user: ${userData.email}`)
        } else {
            authUser = existingUser
            console.log(`✅ Using existing auth user: ${userData.email}`)
        }

        // Prepare user insert data
        const userInsert: UserInsert = {
            id: authUser.id,
            email: userData.email,
            is_active: true,
        }

        // Upsert app user
        const { data: user, error: userError } = await supabase
            .from('users')
            .upsert(userInsert, { onConflict: 'id' })
            .select()
            .single()

        if (userError) throw userError

        // Store the system user ID if this is the system user
        if (userData.email === SYSTEM_USER.email) {
            systemUserId = user.id
        }

        // Store the user ID in the appropriate map
        if (
            userData.profile.role === 'agent' ||
            userData.profile.role === 'admin'
        ) {
            // Map agent/admin emails to their indices
            switch (userData.email) {
                case 'demo@metta.now':
                    agentMap[-1] = user.id // Demo admin is -1
                    break
                case 'agent1@example.com':
                    agentMap[2] = user.id // First regular agent is 2
                    break
                case 'agent2@example.com':
                    agentMap[3] = user.id // Second regular agent is 3
                    break
            }
        } else if (userData.profile.role === 'customer') {
            // Map customer emails to their indices
            switch (userData.email) {
                case 'testcustomer@example.com':
                    userMap[-2] = user.id // Test customer is -2
                    break
                case 'customer1@example.com':
                    userMap[0] = user.id // First regular customer is 0
                    break
                case 'customer2@example.com':
                    userMap[1] = user.id // Second regular customer is 1
                    break
            }
        }

        // Prepare profile insert data
        const profileInsert: ProfileInsert = {
            user_id: user.id,
            ...userData.profile,
        }

        // Upsert profile
        const { error: profileError } = await supabase
            .from('profiles')
            .upsert(profileInsert, { onConflict: 'user_id' })

        if (profileError) throw profileError
        createdUsers.push(user)
    }

    if (!systemUserId) {
        throw new Error('Failed to create or find system user')
    }

    console.log('✅ Users created')
    return { userMap, agentMap, systemUserId }
}
