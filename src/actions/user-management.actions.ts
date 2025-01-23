'use server'

import { revalidatePath } from 'next/cache'

import { DatabaseError } from '@/lib/errors'
import { UserWithProfileService } from '@/services/user-with-profile.services'

const userWithProfile = new UserWithProfileService()

export async function toggleUserActive(userId: string, isActive: boolean) {
    try {
        const data = await userWithProfile.update(userId, {
            is_active: isActive,
        })
        revalidatePath('/dashboard/users')
        return { data, error: null }
    } catch (error) {
        console.error('[toggleUserActive]', error)
        return {
            data: null,
            error:
                error instanceof DatabaseError
                    ? error.message
                    : 'Failed to toggle user status',
        }
    }
}

export async function updateUserRole(
    userId: string,
    role: 'customer' | 'agent' | 'admin',
) {
    try {
        // Get the current user to preserve other profile fields
        const user = await userWithProfile.findById(userId)
        if (!user) throw new Error('User not found')

        const data = await userWithProfile.update(userId, {
            profile: {
                ...user.profile,
                role,
            },
        })
        revalidatePath('/dashboard/users')
        return { data, error: null }
    } catch (error) {
        console.error('[updateUserRole]', error)
        return {
            data: null,
            error:
                error instanceof DatabaseError
                    ? error.message
                    : 'Failed to update user role',
        }
    }
}

export async function deleteUser(userId: string) {
    try {
        await userWithProfile.delete(userId)
        revalidatePath('/dashboard/users')
        return { error: null }
    } catch (error) {
        console.error('[deleteUser]', error)
        return {
            error:
                error instanceof DatabaseError
                    ? error.message
                    : 'Failed to delete user',
        }
    }
}
