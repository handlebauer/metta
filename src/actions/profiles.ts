'use server'

import { revalidatePath } from 'next/cache'

import { DatabaseError } from '@/lib/errors'
import { profileInsertSchema } from '@/lib/schemas/profile'
import { ProfileService } from '@/services/profiles'

import type {
    ProfileInsert,
    ProfileRow,
    ProfileUpdate,
} from '@/lib/schemas/profile'

const service = new ProfileService()

export async function getProfile(id: string): Promise<{
    data: ProfileRow | null
    error: string | null
}> {
    try {
        const data = await service.findById(id)
        return { data, error: null }
    } catch (error) {
        console.error('[getProfile]', error)
        return {
            data: null,
            error:
                error instanceof DatabaseError
                    ? error.message
                    : 'Failed to fetch profile',
        }
    }
}

export async function getProfileByUserId(userId: string): Promise<{
    data: ProfileRow | null
    error: string | null
}> {
    try {
        const data = await service.findByUserId(userId)
        return { data, error: null }
    } catch (error) {
        console.error('[getProfileByUserId]', error)
        return {
            data: null,
            error:
                error instanceof DatabaseError
                    ? error.message
                    : 'Failed to fetch profile by user ID',
        }
    }
}

export async function createProfile(input: ProfileInsert): Promise<{
    data: ProfileRow | null
    error: string | null
}> {
    try {
        const validated = profileInsertSchema.parse(input)
        const data = await service.create(validated)
        revalidatePath('/profiles')
        return { data, error: null }
    } catch (error) {
        console.error('[createProfile]', error)
        return {
            data: null,
            error:
                error instanceof DatabaseError
                    ? error.message
                    : 'Failed to create profile',
        }
    }
}

export async function updateProfile(
    id: string,
    input: Partial<ProfileUpdate>,
): Promise<{
    data: ProfileRow | null
    error: string | null
}> {
    try {
        const data = await service.update(id, input)
        revalidatePath('/profiles')
        revalidatePath(`/profiles/${id}`)
        return { data, error: null }
    } catch (error) {
        console.error('[updateProfile]', error)
        return {
            data: null,
            error:
                error instanceof DatabaseError
                    ? error.message
                    : 'Failed to update profile',
        }
    }
}
