import { DatabaseError } from '@/lib/errors'
import {
    userInsertSchema,
    userSchema,
    userUpdateSchema,
} from '@/lib/schemas/user.schemas'
import { createClient } from '@/lib/supabase/server'

import type {
    UserInsert,
    UserRow,
    UserUpdate,
} from '@/lib/schemas/user.schemas'

export class UserService {
    async findById(id: string): Promise<UserRow | null> {
        try {
            const db = await createClient()
            const { data, error } = await db
                .from('users')
                .select('*')
                .eq('id', id)
                .single()

            if (error) throw new DatabaseError(error.message)
            return data ? userSchema.parse(data) : null
        } catch (error) {
            console.error('[UserService.findById]', error)
            throw error
        }
    }

    async findByEmail(email: string): Promise<UserRow | null> {
        try {
            const db = await createClient()
            const { data, error } = await db
                .from('users')
                .select('*')
                .eq('email', email)
                .single()

            if (error) throw new DatabaseError(error.message)
            return data ? userSchema.parse(data) : null
        } catch (error) {
            console.error('[UserService.findByEmail]', error)
            throw error
        }
    }

    async findAllActiveExcept(excludeId: string): Promise<
        (UserRow & {
            profile: {
                full_name: string | null
                role: 'customer' | 'agent' | 'admin'
            }
        })[]
    > {
        try {
            const db = await createClient()
            const { data, error } = await db
                .from('users')
                .select(
                    `
                    *,
                    profiles (
                        full_name,
                        role
                    )
                `,
                )
                .eq('is_active', true)
                .neq('id', excludeId)

            if (error) throw new DatabaseError(error.message)

            // Filter out users without profiles or roles
            const usersWithProfiles =
                data?.filter(
                    (
                        user,
                    ): user is UserRow & {
                        profiles: {
                            full_name: string | null
                            role: 'customer' | 'agent' | 'admin'
                        }
                    } => user.profiles?.role != null,
                ) || []

            return usersWithProfiles.map(user => ({
                ...user,
                profile: user.profiles,
            }))
        } catch (error) {
            console.error('[UserService.findAllActiveExcept]', error)
            throw error
        }
    }

    async create(input: UserInsert): Promise<UserRow> {
        try {
            const validated = userInsertSchema.parse(input)
            const db = await createClient()
            const { data, error } = await db
                .from('users')
                .insert(validated)
                .select()
                .single()

            if (error) throw new DatabaseError(error.message)
            if (!data) throw new DatabaseError('Failed to create user')

            return userSchema.parse(data)
        } catch (error) {
            console.error('[UserService.create]', error)
            throw error
        }
    }

    async update(id: string, input: Partial<UserUpdate>): Promise<UserRow> {
        try {
            const validated = userUpdateSchema.partial().parse({ ...input, id })
            const db = await createClient()
            const { data, error } = await db
                .from('users')
                .update(validated)
                .eq('id', id)
                .select()
                .single()

            if (error) throw new DatabaseError(error.message)
            if (!data) throw new DatabaseError('User not found')

            return userSchema.parse(data)
        } catch (error) {
            console.error('[UserService.update]', error)
            throw error
        }
    }

    async updateLastSignIn(id: string): Promise<void> {
        try {
            const db = await createClient()
            const { error } = await db
                .from('users')
                .update({ last_sign_in_at: new Date().toISOString() })
                .eq('id', id)

            if (error) throw new DatabaseError(error.message)
        } catch (error) {
            console.error('[UserService.updateLastSignIn]', error)
            throw error
        }
    }
}
