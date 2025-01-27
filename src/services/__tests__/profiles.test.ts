import { createClient } from '@supabase/supabase-js'
import { expect, mock, test } from 'bun:test'
import dotenv from 'dotenv'

import { UserWithProfileService } from '../user-with-profile.services'

import type { UserWithProfile } from '@/lib/schemas/user-with-profile.schemas'
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

const service = new UserWithProfileService()

// Create a test user and profile for testing
let testUser: UserWithProfile | null = null

test('setup test data', async () => {
    // Create a test user with profile
    const result = await service.create({
        email: 'test_profile@example.com',
        is_active: true,
        profile: {
            full_name: 'Test Profile',
            bio: 'Test Bio',
            role: 'customer',
            avatar_url: 'https://example.com/test-avatar.jpg',
        },
    })

    expect(result).toBeDefined()
    testUser = result
})

test('findById - should return a user with profile by id', async () => {
    expect(testUser).toBeDefined()
    const result = await service.findById(testUser!.id)

    expect(result).toBeDefined()
    expect(result?.id).toBe(testUser!.id)
    expect(result?.profile.full_name).toBe(testUser!.profile.full_name)
    expect(result?.profile.avatar_url).toBe(testUser!.profile.avatar_url)
    expect(result?.profile.bio).toBe(testUser!.profile.bio)
    expect(result?.profile.role).toBe(testUser!.profile.role)
})

test('findByEmail - should return a user with profile by email', async () => {
    expect(testUser).toBeDefined()
    const user = await service.findByEmail(testUser!.email)

    expect(user).toBeDefined()
    expect(user?.id).toBe(testUser!.id)
    expect(user?.profile.role).toBe('customer')
})

test('create and update - should create and update a user with profile', async () => {
    // Create a new user with profile
    const newUser = await service.create({
        email: 'test_profile_crud@example.com',
        is_active: true,
        profile: {
            full_name: 'Test User',
            bio: 'This is a test profile',
            role: 'customer',
            avatar_url: 'https://example.com/avatar.jpg',
        },
    })

    expect(newUser).toBeDefined()
    expect(newUser.email).toBe('test_profile_crud@example.com')
    expect(newUser.profile.full_name).toBe('Test User')
    expect(newUser.profile.bio).toBe('This is a test profile')
    expect(newUser.profile.role).toBe('customer')

    // Update the user with profile
    const updatedUser = await service.update(newUser.id, {
        profile: {
            full_name: 'Updated Test User',
            bio: 'This is an updated test profile',
            role: 'customer',
            avatar_url: 'https://example.com/avatar.jpg',
            id: newUser.profile.id,
        },
    })

    expect(updatedUser).toBeDefined()
    expect(updatedUser.id).toBe(newUser.id)
    expect(updatedUser.profile.full_name).toBe('Updated Test User')
    expect(updatedUser.profile.bio).toBe('This is an updated test profile')
    expect(updatedUser.profile.role).toBe('customer')

    // Clean up
    await service.delete(newUser.id)
})

test('cleanup test data', async () => {
    // Clean up test user (which will cascade delete the profile)
    if (testUser) {
        await service.delete(testUser.id)
    }
})
