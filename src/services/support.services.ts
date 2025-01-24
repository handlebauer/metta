import { z } from 'zod'

import { UserWithProfile } from '@/lib/schemas/user-with-profile.schemas'
import { createServiceClient } from '@/lib/supabase/service'

const _supportTicketSchema = z.object({
    name: z.string().min(1, 'Please provide your name'),
    email: z.string().email(),
    subject: z.string().min(1),
    description: z.string().min(1),
})

export class SupportService {
    async findOrCreateCustomer(
        email: string,
        name: string,
    ): Promise<UserWithProfile> {
        const supabase = createServiceClient()

        // Try to find existing user
        const { data: userData, error: userError } = await supabase
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
            .eq('is_active', true)
            .single()

        if (!userError && userData) {
            const user = userData as UserWithProfile

            // Update name if not set
            if (!user.profile?.full_name) {
                const { error: updateError } = await supabase
                    .from('profiles')
                    .update({ full_name: name })
                    .eq('user_id', user.id)

                if (updateError) throw updateError
            }

            return user
        }

        if (userError && userError.code !== 'PGRST116') {
            throw userError
        }

        // Create new user
        const password = Math.random().toString(36).slice(-12)
        const { data: authData, error: authError } =
            await supabase.auth.admin.createUser({
                email,
                password,
                email_confirm: true,
            })

        if (authError) throw authError
        if (!authData.user) throw new Error('Failed to create user')

        // Create database user
        const { error: dbUserError } = await supabase.from('users').insert({
            id: authData.user.id,
            email,
            is_active: true,
        })

        if (dbUserError) throw dbUserError

        // Create the profile
        const { error: profileError } = await supabase
            .from('profiles')
            .insert({
                user_id: authData.user.id,
                full_name: name,
                role: 'customer',
            })
            .select()
            .single()

        if (profileError) throw profileError

        // Get the complete user with profile
        const { data: newUser, error: fetchError } = await supabase
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
            .eq('id', authData.user.id)
            .single()

        if (fetchError || !newUser) {
            throw new Error('Failed to fetch new user profile')
        }

        return newUser as UserWithProfile
    }

    async createTicket(input: z.infer<typeof _supportTicketSchema>) {
        const supabase = createServiceClient()

        // First find or create the customer
        const user = await this.findOrCreateCustomer(input.email, input.name)

        // Create the ticket
        const { data: ticket, error: ticketError } = await supabase
            .from('tickets')
            .insert({
                subject: input.subject,
                description: input.description,
                customer_id: user.id,
                agent_id: null,
                status: 'new',
            })
            .select()
            .single()

        if (ticketError) throw ticketError
        if (!ticket) throw new Error('Failed to create ticket')

        return ticket
    }
}
