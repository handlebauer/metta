import { redirect } from 'next/navigation'
import { DevModeButton } from '@/components/dev-mode-button.client'
import { Header } from '@/components/header'

import { createClient } from '@/lib/supabase/server'

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
        <div className="relative min-h-screen">
            <Header user={user} />
            {process.env.NODE_ENV === 'development' && <DevModeButton />}
            {children}
        </div>
    )
}
