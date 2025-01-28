import { redirect } from 'next/navigation'

import { createClient } from '@/lib/supabase/server'
import { Brand } from '@/components/ui/brand'
import { UserNav } from '@/components/dashboard/user-nav'

import type { UserWithProfile } from '@/lib/schemas/user-with-profile.schemas'

interface OnboardingLayoutProps {
    children: React.ReactNode
}

export default async function OnboardingLayout({
    children,
}: OnboardingLayoutProps) {
    const supabase = await createClient()

    // Get current user
    const {
        data: { user: authUser },
    } = await supabase.auth.getUser()

    if (!authUser) {
        redirect('/login')
    }

    // Get user data with profile
    const { data: userData } = await supabase
        .from('users')
        .select(
            `
            *,
            profile:profiles (
                *
            )
        `,
        )
        .eq('id', authUser.id)
        .single()

    if (!userData?.profile) {
        redirect('/login')
    }

    const user: UserWithProfile = {
        id: userData.id,
        email: userData.email,
        created_at: userData.created_at,
        updated_at: userData.updated_at,
        is_active: userData.is_active,
        last_sign_in_at: userData.last_sign_in_at,
        profile: {
            id: userData.profile.id,
            full_name: userData.profile.full_name,
            avatar_url: userData.profile.avatar_url,
            bio: userData.profile.bio,
            role: userData.profile.role,
            created_at: userData.profile.created_at,
            updated_at: userData.profile.updated_at,
        },
    }

    return (
        <div className="flex h-screen flex-col">
            <header className="flex-none border-b">
                <div className="flex h-16 items-center gap-4 px-4 font-outfit">
                    <Brand>metta</Brand>
                    <div className="ml-auto flex items-center gap-4">
                        <UserNav user={user} />
                    </div>
                </div>
            </header>
            <main className="flex-1">{children}</main>
        </div>
    )
}
