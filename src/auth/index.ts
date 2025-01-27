import { createClient } from '@/lib/supabase/client'

import {
    DEMO_USER,
    DEMO_USER_NO_WORKSPACE,
} from '../../scripts/db/seed-data/users'

export async function signInWithGitHub() {
    const supabase = createClient()
    const { error } = await supabase.auth.signInWithOAuth({
        provider: 'github',
        options: {
            redirectTo: `${window.location.origin}/auth/callback`,
        },
    })

    console.log('[Auth] Signing in with GitHub')

    if (error) {
        throw error
    }
}

export async function signInWithDiscord() {
    const supabase = createClient()
    const { error } = await supabase.auth.signInWithOAuth({
        provider: 'discord',
        options: {
            redirectTo: `${window.location.origin}/auth/callback`,
        },
    })

    console.log('[Auth] Signing in with Discord')

    if (error) {
        throw error
    }
}

export async function signInWithMagicLink(email: string) {
    const supabase = createClient()
    const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
            emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
    })

    if (error) {
        throw error
    }

    return { success: 'Check your email for the magic link' }
}

export async function signInAsDemoUser(
    type: 'default' | 'no-workspace' = 'default',
) {
    const supabase = createClient()
    const demoUser = type === 'default' ? DEMO_USER : DEMO_USER_NO_WORKSPACE

    const { error } = await supabase.auth.signInWithPassword({
        email: demoUser.email,
        password: demoUser.password,
    })

    console.log(`[Auth] Signing in as demo user (${type})`)

    if (error) {
        throw new Error('The database may not be seeded yet')
    }
}

export async function signOut() {
    const supabase = createClient()
    const { error } = await supabase.auth.signOut()

    if (error) {
        throw error
    }
}
