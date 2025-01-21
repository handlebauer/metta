'use server'

import { revalidatePath } from 'next/cache'

import { DatabaseError } from '@/lib/errors'
import { ProfileService } from '@/services/profile.services'
import { UserService } from '@/services/user.services'

import type { ProfileRow } from '@/lib/schemas/profile.schemas'

const userService = new UserService()
const profileService = new ProfileService()

export async function toggleUserActive(userId: string, isActive: boolean) {
    try {
        const data = await userService.update(userId, { is_active: isActive })
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

export async function updateUserRole(userId: string, role: ProfileRow['role']) {
    try {
        const profile = await profileService.findByUserId(userId)
        if (!profile) {
            throw new Error('Profile not found')
        }

        const data = await profileService.update(profile.id, { role })
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
        // Note: This will cascade delete the profile due to foreign key constraints
        await userService.delete(userId)
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
