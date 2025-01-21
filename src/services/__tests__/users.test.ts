import { createClient } from '@supabase/supabase-js'
import { expect, mock, test } from 'bun:test'
import dotenv from 'dotenv'

import { UserService } from '../user.services'

import type { Database } from '@/lib/supabase/types'

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

test('findAllActiveExcept - should return all active users except the excluded one', async () => {
    // Get demo user to exclude (first user created in seed data)
    const { data: demoUser } = await supabaseAdmin
        .from('users')
        .select('id')
        .eq('email', 'demo@example.com')
        .single()

    expect(demoUser).toBeDefined()

    // Get all users except demo user
    const users = await service.findAllActiveExcept(demoUser!.id)

    // Log the results for debugging
    console.log('Found users:', users)

    // Assertions
    expect(users).toBeDefined()
    expect(Array.isArray(users)).toBe(true)
    expect(users.length).toBeGreaterThan(0)

    // Verify demo user is excluded
    const demoUserInResults = users.find(u => u.email === 'demo@example.com')
    expect(demoUserInResults).toBeUndefined()

    // Verify a known test user is included
    const testUser = users.find(u => u.email === 'customer1@example.com')
    expect(testUser).toBeDefined()
    expect(testUser?.is_active).toBe(true)
    expect(testUser?.profile).toBeDefined()
    expect(testUser?.profile.role).toBe('customer')
    expect(testUser?.profile.full_name).toBe('Alice Johnson')
})

test('findAllActiveExcept - should handle non-existent excludeId', async () => {
    const users = await service.findAllActiveExcept('non-existent-id')

    // Log the results for debugging
    console.log('Found users with non-existent excludeId:', users)

    // Assertions
    expect(users).toBeDefined()
    expect(Array.isArray(users)).toBe(true)
    expect(users.length).toBeGreaterThan(0)

    // Verify known seed users are present
    const demoUser = users.find(u => u.email === 'demo@example.com')
    expect(demoUser).toBeDefined()
    expect(demoUser?.profile.role).toBe('agent')
    expect(demoUser?.profile.full_name).toBe('Demo User')

    const customer = users.find(u => u.email === 'customer1@example.com')
    expect(customer).toBeDefined()
    expect(customer?.profile.role).toBe('customer')
    expect(customer?.profile.full_name).toBe('Alice Johnson')
})
