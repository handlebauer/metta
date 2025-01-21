import { createClient } from '@supabase/supabase-js'

import type { Database } from '@/lib/supabase/types'

export interface SeedUser {
    email: string
    password: string
    name: string | null
    bio: string | null
    role: 'customer' | 'agent'
}

export const DEMO_USER: SeedUser = {
    email: 'demo@example.com',
    password: 'demo123',
    name: 'Demo Agent',
    bio: 'This is a demo agent account for testing support agent functionality.',
    role: 'agent',
}

export const TEST_USERS: SeedUser[] = [
    {
        email: 'testcustomer@example.com',
        password: 'test123',
        name: 'Test Customer',
        bio: 'Primary test customer account for demo interactions',
        role: 'customer',
    },
    {
        email: 'customer1@example.com',
        password: 'customer1',
        name: 'Alice Johnson',
        bio: 'Customer 1 bio',
        role: 'customer',
    },
    {
        email: 'customer2@example.com',
        password: 'customer2',
        name: 'Bob Smith',
        bio: 'Customer 2 bio',
        role: 'customer',
    },
    {
        email: 'agent1@example.com',
        password: 'agent1',
        name: 'Charlie Brown',
        bio: 'Agent 1 bio',
        role: 'agent',
    },
    {
        email: 'agent2@example.com',
        password: 'agent2',
        name: 'Diana Prince',
        bio: 'Agent 2 bio',
        role: 'agent',
    },
]

export async function seedUsers(
    supabase: ReturnType<typeof createClient<Database>>,
) {
    console.log('👥 Ensuring users exist...')

    // Get all existing users in one call
    const { data: existingUsers } = await supabase.auth.admin.listUsers()
    const createdUsers = []

    const allUsers = [DEMO_USER, ...TEST_USERS]
    for (const userData of allUsers) {
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

        // Upsert app user
        const { data: user, error: userError } = await supabase
            .from('users')
            .upsert(
                {
                    id: authUser.id,
                    email: userData.email,
                    is_active: true,
                },
                { onConflict: 'id' },
            )
            .select()
            .single()

        if (userError) throw userError

        // Upsert profile
        const { error: profileError } = await supabase.from('profiles').upsert(
            {
                user_id: user.id,
                full_name: userData.name,
                bio: userData.bio,
                role: userData.role,
                avatar_url: `https://api.dicebear.com/7.x/avataaars/svg?seed=${userData.email}`,
            },
            { onConflict: 'user_id' },
        )

        if (profileError) throw profileError
        createdUsers.push(user)
    }

    return createdUsers
}
