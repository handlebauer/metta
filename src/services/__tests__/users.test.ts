import { expect, test, beforeAll, afterAll, mock } from 'bun:test'
import { UserService } from '../users'
import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/lib/supabase/types'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

// Create a Supabase client with service role for testing
const supabaseAdmin = createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
        auth: {
            autoRefreshToken: false,
            persistSession: false,
        },
    },
)

// Mock the server createClient to use our admin client
mock.module('@/lib/supabase/server', () => ({
    createClient: () => supabaseAdmin,
}))

const service = new UserService()

type UserRole = Database['public']['Enums']['user_role']

// Test data
const TEST_USERS = [
    {
        email: 'test1@example.com',
        password: 'test123456',
        name: 'Test User 1',
        role: 'customer' as UserRole,
        bio: 'Test user 1',
    },
    {
        email: 'test2@example.com',
        password: 'test123456',
        name: 'Test User 2',
        role: 'agent' as UserRole,
        bio: 'Test user 2',
    },
]

const createdUsers: { id: string }[] = []

beforeAll(async () => {
    // Create test users
    for (const userData of TEST_USERS) {
        // Create auth user
        const { data: authUser, error: authError } =
            await supabaseAdmin.auth.admin.createUser({
                email: userData.email,
                password: userData.password,
                email_confirm: true,
            })

        if (authError) throw authError

        // Create app user
        const { data: user, error: userError } = await supabaseAdmin
            .from('users')
            .upsert(
                {
                    id: authUser.user.id,
                    email: userData.email,
                    is_active: true,
                },
                { onConflict: 'id' },
            )
            .select()
            .single()

        if (userError) throw userError

        // Create profile
        const { error: profileError } = await supabaseAdmin
            .from('profiles')
            .upsert({
                id: user.id,
                user_id: user.id,
                full_name: userData.name,
                bio: userData.bio,
                role: userData.role,
                avatar_url: `https://api.dicebear.com/7.x/avataaars/svg?seed=${userData.email}`,
            })

        if (profileError) throw profileError
        createdUsers.push({ id: user.id })
    }
})

afterAll(async () => {
    // Clean up test users
    for (const user of createdUsers) {
        // Delete in correct order due to foreign key constraints
        await supabaseAdmin.from('profiles').delete().eq('user_id', user.id)
        await supabaseAdmin.from('users').delete().eq('id', user.id)
        await supabaseAdmin.auth.admin.deleteUser(user.id)
    }
})

test('findAllActiveExcept - should return all active users except the excluded one', async () => {
    // Get first test user to exclude
    const excludeUserId = createdUsers[0].id

    // Get all users except the first one
    const users = await service.findAllActiveExcept(excludeUserId)

    // Log the results for debugging
    console.log('Found users:', users)

    // Assertions
    expect(users).toBeDefined()
    expect(Array.isArray(users)).toBe(true)

    // Find our test user in the results
    const testUser = users.find(u => u.email === TEST_USERS[1].email)
    expect(testUser).toBeDefined()
    expect(testUser?.id).not.toBe(excludeUserId)
    expect(testUser?.is_active).toBe(true)
    expect(testUser?.profile).toBeDefined()
    expect(testUser?.profile.role).toBe(TEST_USERS[1].role)
    expect(testUser?.profile.full_name).toBe(TEST_USERS[1].name)
})

test('findAllActiveExcept - should handle non-existent excludeId', async () => {
    const users = await service.findAllActiveExcept('non-existent-id')

    // Log the results for debugging
    console.log('Found users with non-existent excludeId:', users)

    // Assertions
    expect(users).toBeDefined()
    expect(Array.isArray(users)).toBe(true)

    // Find our test users in the results
    const testEmails = TEST_USERS.map(u => u.email)
    const foundTestUsers = users.filter(u => testEmails.includes(u.email))
    expect(foundTestUsers.length).toBe(2) // Should find both our test users

    // Verify our test users have correct data
    foundTestUsers.forEach(user => {
        const testUser = TEST_USERS.find(t => t.email === user.email)!
        expect(user.is_active).toBe(true)
        expect(user.profile).toBeDefined()
        expect(user.profile.role).toBe(testUser.role)
        expect(user.profile.full_name).toBe(testUser.name)
    })
})
