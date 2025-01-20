import { DatabaseError } from '@/lib/errors'
import {
    profileInsertSchema,
    profileSchema,
    profileUpdateSchema,
} from '@/lib/schemas/profile'
import { createClient } from '@/lib/supabase/server'

import type {
    ProfileInsert,
    ProfileRow,
    ProfileUpdate,
} from '@/lib/schemas/profile'

export class ProfileService {
    async findById(id: string): Promise<ProfileRow | null> {
        try {
            const db = await createClient()
            const { data, error } = await db
                .from('profiles')
                .select('*')
                .eq('id', id)
                .single()

            if (error) throw new DatabaseError(error.message)
            return data ? profileSchema.parse(data) : null
        } catch (error) {
            console.error('[ProfileService.findById]', error)
            throw error
        }
    }

    async findByUserId(userId: string): Promise<ProfileRow | null> {
        try {
            const db = await createClient()
            const { data, error } = await db
                .from('profiles')
                .select('*')
                .eq('user_id', userId)
                .single()

            if (error) throw new DatabaseError(error.message)
            return data ? profileSchema.parse(data) : null
        } catch (error) {
            console.error('[ProfileService.findByUserId]', error)
            throw error
        }
    }

    async create(input: ProfileInsert): Promise<ProfileRow> {
        try {
            const validated = profileInsertSchema.parse(input)
            const db = await createClient()
            const { data, error } = await db
                .from('profiles')
                .insert(validated)
                .select()
                .single()

            if (error) throw new DatabaseError(error.message)
            if (!data) throw new DatabaseError('Failed to create profile')

            return profileSchema.parse(data)
        } catch (error) {
            console.error('[ProfileService.create]', error)
            throw error
        }
    }

    async update(
        id: string,
        input: Partial<ProfileUpdate>,
    ): Promise<ProfileRow> {
        try {
            const validated = profileUpdateSchema
                .partial()
                .parse({ ...input, id })
            const db = await createClient()
            const { data, error } = await db
                .from('profiles')
                .update(validated)
                .eq('id', id)
                .select()
                .single()

            if (error) throw new DatabaseError(error.message)
            if (!data) throw new DatabaseError('Profile not found')

            return profileSchema.parse(data)
        } catch (error) {
            console.error('[ProfileService.update]', error)
            throw error
        }
    }
}
