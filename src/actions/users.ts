'use server'

import { revalidatePath } from 'next/cache'
import {
    userInsertSchema,
    type UserRow,
    type UserInsert,
    type UserUpdate,
} from '@/lib/schemas/user'
import { UserService } from '@/services/users'
import { DatabaseError } from '@/lib/errors'

const service = new UserService()

export async function getUser(id: string): Promise<{
    data: UserRow | null
    error: string | null
}> {
    try {
        const data = await service.findById(id)
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
        const data = await service.findByEmail(email)
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

export async function createUser(input: UserInsert): Promise<{
    data: UserRow | null
    error: string | null
}> {
    try {
        const validated = userInsertSchema.parse(input)
        const data = await service.create(validated)
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
        const data = await service.update(id, input)
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
        await service.updateLastSignIn(id)
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
