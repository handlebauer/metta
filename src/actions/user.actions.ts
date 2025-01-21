'use server'

import { revalidatePath } from 'next/cache'

import { DatabaseError } from '@/lib/errors'
import { userInsertSchema } from '@/lib/schemas/user.schemas'
import { ProfileService } from '@/services/profile.services'
import { UserService } from '@/services/user.services'

import type { ProfileRow } from '@/lib/schemas/profile.schemas'
import type {
    UserInsert,
    UserRow,
    UserUpdate,
} from '@/lib/schemas/user.schemas'

const userService = new UserService()
const profileService = new ProfileService()

export async function getUser(id: string): Promise<{
    data: UserRow | null
    error: string | null
}> {
    try {
        const data = await userService.findById(id)
        return { data, error: null }
    } catch (error) {
        console.error('[getUser]', error)
        return {
            data: null,
            error:
                error instanceof DatabaseError
                    ? error.message
                    : 'Failed to fetch user',
        }
    }
}

export async function getUserByEmail(email: string): Promise<{
    data: UserRow | null
    error: string | null
}> {
    try {
        const data = await userService.findByEmail(email)
        return { data, error: null }
    } catch (error) {
        console.error('[getUserByEmail]', error)
        return {
            data: null,
            error:
                error instanceof DatabaseError
                    ? error.message
                    : 'Failed to fetch user by email',
        }
    }
}

export async function getAllActiveUsersExcept(excludeId: string): Promise<{
    data: (UserRow & {
        profile: { full_name: string | null; role: 'customer' | 'agent' }
    })[]
    error: string | null
}> {
    try {
        const data = await userService.findAllActiveExcept(excludeId)
        return { data, error: null }
    } catch (error) {
        console.error('[getAllActiveUsersExcept]', error)
        return {
            data: [],
            error:
                error instanceof DatabaseError
                    ? error.message
                    : 'Failed to fetch users',
        }
    }
}

export async function createUser(input: UserInsert): Promise<{
    data: UserRow | null
    error: string | null
}> {
    try {
        const validated = userInsertSchema.parse(input)
        const data = await userService.create(validated)
        revalidatePath('/users')
        return { data, error: null }
    } catch (error) {
        console.error('[createUser]', error)
        return {
            data: null,
            error:
                error instanceof DatabaseError
                    ? error.message
                    : 'Failed to create user',
        }
    }
}

export async function updateUser(
    id: string,
    input: Partial<UserUpdate>,
): Promise<{
    data: UserRow | null
    error: string | null
}> {
    try {
        const data = await userService.update(id, input)
        revalidatePath('/users')
        revalidatePath(`/users/${id}`)
        return { data, error: null }
    } catch (error) {
        console.error('[updateUser]', error)
        return {
            data: null,
            error:
                error instanceof DatabaseError
                    ? error.message
                    : 'Failed to update user',
        }
    }
}

export async function updateUserLastSignIn(id: string): Promise<{
    error: string | null
}> {
    try {
        await userService.updateLastSignIn(id)
        revalidatePath('/users')
        revalidatePath(`/users/${id}`)
        return { error: null }
    } catch (error) {
        console.error('[updateUserLastSignIn]', error)
        return {
            error:
                error instanceof DatabaseError
                    ? error.message
                    : 'Failed to update user last sign in',
        }
    }
}

export async function getProfile(userId: string): Promise<{
    data: ProfileRow | null
    error: string | null
}> {
    try {
        const data = await profileService.findByUserId(userId)
        return { data, error: null }
    } catch (error) {
        console.error('[getProfile]', error)
        return {
            data: null,
            error:
                error instanceof DatabaseError
                    ? error.message
                    : 'Failed to fetch user profile',
        }
    }
}
