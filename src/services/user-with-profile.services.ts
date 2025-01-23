import { DatabaseError } from '@/lib/errors'
import { userWithProfileSchema } from '@/lib/schemas/user-with-profile.schemas'
import { createClient } from '@/lib/supabase/server'

import type {
    UserWithProfile,
    UserWithProfileInsert,
    UserWithProfileUpdate,
} from '@/lib/schemas/user-with-profile.schemas'

export class UserWithProfileService {
    async findById(id: string): Promise<UserWithProfile | null> {
        try {
            const db = await createClient()
            const { data, error } = await db
                .from('users')
                .select(
                    `
                    *,
                    profile:profiles (
                        id,
                        created_at,
                        updated_at,
                        full_name,
                        avatar_url,
                        bio,
                        role
                    )
                `,
                )
                .eq('id', id)
                .single()

            if (error) throw new DatabaseError(error.message)
            return data ? userWithProfileSchema.parse(data) : null
        } catch (error) {
            console.error('[UserWithProfileService.findById]', error)
            throw error
        }
    }

    async findByEmail(email: string): Promise<UserWithProfile | null> {
        try {
            const db = await createClient()
            const { data, error } = await db
                .from('users')
                .select(
                    `
                    *,
                    profile:profiles (
                        id,
                        created_at,
                        updated_at,
                        full_name,
                        avatar_url,
                        bio,
                        role
                    )
                `,
                )
                .eq('email', email)
                .single()

            if (error) throw new DatabaseError(error.message)
            return data ? userWithProfileSchema.parse(data) : null
        } catch (error) {
            console.error('[UserWithProfileService.findByEmail]', error)
            throw error
        }
    }

    async findAllActiveExcept(userId: string): Promise<UserWithProfile[]> {
        try {
            const db = await createClient()
            const { data, error } = await db
                .from('users')
                .select(
                    `
                    *,
                    profile:profiles (
                        id,
                        created_at,
                        updated_at,
                        full_name,
                        avatar_url,
                        bio,
                        role
                    )
                `,
                )
                .eq('is_active', true)
                .neq('id', userId)
                .order('email')

            if (error) throw new DatabaseError(error.message)
            return data ? userWithProfileSchema.array().parse(data) : []
        } catch (error) {
            console.error('[UserWithProfileService.findAllActiveExcept]', error)
            throw error
        }
    }

    async create(input: UserWithProfileInsert): Promise<UserWithProfile> {
        const db = await createClient()

        try {
            // Start a transaction
            const { data: user, error: userError } = await db
                .from('users')
                .insert({
                    email: input.email,
                    is_active: input.is_active,
                })
                .select()
                .single()

            if (userError) throw new DatabaseError(userError.message)
            if (!user) throw new DatabaseError('Failed to create user')

            // Create the profile
            const { data: profile, error: profileError } = await db
                .from('profiles')
                .insert({
                    user_id: user.id,
                    ...input.profile,
                })
                .select()
                .single()

            if (profileError) {
                // If profile creation fails, clean up the user
                await db.from('users').delete().eq('id', user.id)
                throw new DatabaseError(profileError.message)
            }

            if (!profile) {
                await db.from('users').delete().eq('id', user.id)
                throw new DatabaseError('Failed to create profile')
            }

            return {
                ...user,
                profile: {
                    ...profile,
                },
            }
        } catch (error) {
            console.error('[UserWithProfileService.create]', error)
            throw error
        }
    }

    async update(
        id: string,
        input: Omit<UserWithProfileUpdate, 'id'>,
    ): Promise<UserWithProfile> {
        const db = await createClient()

        try {
            // Start with user update if there are user fields
            const userFields = {
                email: input.email,
                is_active: input.is_active,
                last_sign_in_at: input.last_sign_in_at,
            }

            const hasUserUpdates = Object.values(userFields).some(
                v => v !== undefined,
            )

            if (hasUserUpdates) {
                const { error: userError } = await db
                    .from('users')
                    .update(userFields)
                    .eq('id', id)

                if (userError) throw new DatabaseError(userError.message)
            }

            // Then update profile if there are profile fields
            if (input.profile) {
                const { error: profileError } = await db
                    .from('profiles')
                    .update(input.profile)
                    .eq('user_id', id)

                if (profileError) throw new DatabaseError(profileError.message)
            }

            // Fetch the updated user with profile
            const updated = await this.findById(id)
            if (!updated) throw new DatabaseError('User not found after update')

            return updated
        } catch (error) {
            console.error('[UserWithProfileService.update]', error)
            throw error
        }
    }

    async delete(id: string): Promise<void> {
        try {
            const db = await createClient()
            const { error } = await db.from('users').delete().eq('id', id)

            if (error) throw new DatabaseError(error.message)
        } catch (error) {
            console.error('[UserWithProfileService.delete]', error)
            throw error
        }
    }

    /**
     * Gets the currently authenticated user with their profile
     * @returns The authenticated user with their profile, or null if not authenticated
     */
    async getAuthenticatedUser(): Promise<UserWithProfile | null> {
        try {
            const db = await createClient()
            const {
                data: { user: authUser },
                error: authError,
            } = await db.auth.getUser()

            if (authError) throw new DatabaseError(authError.message)
            if (!authUser) return null

            return this.findById(authUser.id)
        } catch (error) {
            console.error(
                '[UserWithProfileService.getAuthenticatedUser]',
                error,
            )
            throw error
        }
    }
}
