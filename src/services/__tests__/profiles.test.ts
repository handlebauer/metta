import { createClient } from '@supabase/supabase-js'
import { expect, mock, test } from 'bun:test'
import dotenv from 'dotenv'

import { ProfileService } from '../profile.services'

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

const service = new ProfileService()

// Create a test user and profile for testing
let testUser: { id: string } | null = null
let testProfile: {
    id: string
    user_id: string
    full_name: string | null
    avatar_url: string | null
    bio: string | null
    role: 'customer' | 'agent'
} | null = null

test('setup test data', async () => {
    // Create a test user
    const { data: user, error: userError } = await supabaseAdmin
        .from('users')
        .insert({
            email: 'test_profile@example.com',
            is_active: true,
        })
        .select()
        .single()

    if (userError) throw userError
    expect(user).toBeDefined()
    testUser = user

    // Create a test profile
    const { data: profile, error: profileError } = await supabaseAdmin
        .from('profiles')
        .insert({
            user_id: user.id,
            full_name: 'Test Profile',
            bio: 'Test Bio',
            role: 'customer',
            avatar_url: 'https://example.com/test-avatar.jpg',
        })
        .select()
        .single()

    if (profileError) throw profileError
    expect(profile).toBeDefined()
    testProfile = profile
})

test('findById - should return a profile by id', async () => {
    expect(testProfile).toBeDefined()
    const result = await service.findById(testProfile!.id)

    expect(result).toBeDefined()
    expect(result?.id).toBe(testProfile!.id)
    expect(result?.full_name).toBe(testProfile!.full_name)
    expect(result?.avatar_url).toBe(testProfile!.avatar_url)
    expect(result?.bio).toBe(testProfile!.bio)
    expect(result?.role).toBe(testProfile!.role)
    expect(result?.user_id).toBe(testProfile!.user_id)
})

test('findByUserId - should return a profile by user id', async () => {
    expect(testUser).toBeDefined()
    const profile = await service.findByUserId(testUser!.id)

    expect(profile).toBeDefined()
    expect(profile?.user_id).toBe(testUser!.id)
    expect(profile?.role).toBe('customer')
})

test('create and update - should create and update a profile', async () => {
    // Create a new test user for this test
    const { data: user, error: userError } = await supabaseAdmin
        .from('users')
        .insert({
            email: 'test_profile_crud@example.com',
            is_active: true,
        })
        .select()
        .single()

    if (userError) throw userError
    expect(user).toBeDefined()

    // Create a new profile
    const newProfile = await service.create({
        user_id: user.id,
        full_name: 'Test User',
        bio: 'This is a test profile',
        role: 'customer',
        avatar_url: 'https://example.com/avatar.jpg',
    })

    expect(newProfile).toBeDefined()
    expect(newProfile.user_id).toBe(user.id)
    expect(newProfile.full_name).toBe('Test User')
    expect(newProfile.bio).toBe('This is a test profile')
    expect(newProfile.role).toBe('customer')

    // Update the profile
    const updatedProfile = await service.update(newProfile.id, {
        id: newProfile.id,
        full_name: 'Updated Test User',
        bio: 'This is an updated test profile',
    })

    expect(updatedProfile).toBeDefined()
    expect(updatedProfile.id).toBe(newProfile.id)
    expect(updatedProfile.full_name).toBe('Updated Test User')
    expect(updatedProfile.bio).toBe('This is an updated test profile')
    expect(updatedProfile.role).toBe('customer')

    // Clean up
    await supabaseAdmin.from('profiles').delete().eq('id', newProfile.id)
    await supabaseAdmin.from('users').delete().eq('id', user.id)
})

test('cleanup test data', async () => {
    // Clean up test profile and user
    if (testProfile) {
        await supabaseAdmin.from('profiles').delete().eq('id', testProfile.id)
    }
    if (testUser) {
        await supabaseAdmin.from('users').delete().eq('id', testUser.id)
    }
})
