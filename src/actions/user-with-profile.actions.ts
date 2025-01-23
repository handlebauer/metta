'use server'

import { revalidatePath } from 'next/cache'

import { DatabaseError } from '@/lib/errors'
import { UserWithProfileService } from '@/services/user-with-profile.services'

import type {
    UserWithProfile,
    UserWithProfileInsert,
    UserWithProfileUpdate,
} from '@/lib/schemas/user-with-profile.schemas'

const service = new UserWithProfileService()

export async function getUserWithProfile(id: string): Promise<{
    data: UserWithProfile | null
    error: string | null
}> {
    try {
        const data = await service.findById(id)
        return { data, error: null }
    } catch (error) {
        console.error('[getUserWithProfile]', error)
        return {
            data: null,
            error:
                error instanceof DatabaseError
                    ? error.message
                    : 'Failed to fetch user with profile',
        }
    }
}

export async function getUserWithProfileByEmail(email: string): Promise<{
    data: UserWithProfile | null
    error: string | null
}> {
    try {
        const data = await service.findByEmail(email)
        return { data, error: null }
    } catch (error) {
        console.error('[getUserWithProfileByEmail]', error)
        return {
            data: null,
            error:
                error instanceof DatabaseError
                    ? error.message
                    : 'Failed to fetch user with profile by email',
        }
    }
}

export async function createUserWithProfile(
    input: UserWithProfileInsert,
): Promise<{
    data: UserWithProfile | null
    error: string | null
}> {
    try {
        const data = await service.create(input)
        revalidatePath('/users')
        return { data, error: null }
    } catch (error) {
        console.error('[createUserWithProfile]', error)
        return {
            data: null,
            error:
                error instanceof DatabaseError
                    ? error.message
                    : 'Failed to create user with profile',
        }
    }
}

export async function updateUserWithProfile(
    id: string,
    input: Omit<UserWithProfileUpdate, 'id'>,
): Promise<{
    data: UserWithProfile | null
    error: string | null
}> {
    try {
        const data = await service.update(id, input)
        revalidatePath('/users')
        revalidatePath(`/users/${id}`)
        return { data, error: null }
    } catch (error) {
        console.error('[updateUserWithProfile]', error)
        return {
            data: null,
            error:
                error instanceof DatabaseError
                    ? error.message
                    : 'Failed to update user with profile',
        }
    }
}

export async function deleteUserWithProfile(id: string): Promise<{
    error: string | null
}> {
    try {
        await service.delete(id)
        revalidatePath('/users')
        return { error: null }
    } catch (error) {
        console.error('[deleteUserWithProfile]', error)
        return {
            error:
                error instanceof DatabaseError
                    ? error.message
                    : 'Failed to delete user with profile',
        }
    }
}

export async function getAuthenticatedUserWithProfile(): Promise<{
    data: UserWithProfile | null
    error: string | null
}> {
    try {
        const data = await service.getAuthenticatedUser()
        return { data, error: null }
    } catch (error) {
        console.error('[getAuthenticatedUserWithProfile]', error)
        return {
            data: null,
            error:
                error instanceof DatabaseError
                    ? error.message
                    : 'Failed to fetch authenticated user',
        }
    }
}

/**
 * Get all active users except the specified user ID
 */
export async function getAllActiveUsersExcept(userId: string): Promise<{
    data: UserWithProfile[]
    error: string | null
}> {
    try {
        const data = await service.findAllActiveExcept(userId)
        return { data, error: null }
    } catch (error) {
        console.error('[getAllActiveUsersExcept]', error)
        return {
            data: [],
            error:
                error instanceof DatabaseError
                    ? error.message
                    : 'Failed to fetch active users',
        }
    }
}
