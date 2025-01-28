import { createClient } from '@/lib/supabase/client'

import {
    DEMO_USER,
    DEMO_USER_NO_WORKSPACE,
} from '../../scripts/db/seed-data/users'

// Helper function to check workspaces and redirect
async function handlePostSignIn() {
    const supabase = createClient()

    // Check if user has any workspaces
    const { data: workspaces } = await supabase
        .from('workspaces')
        .select('id')
        .limit(1)

    // Redirect to onboarding if no workspaces, otherwise to dashboard
    const hasWorkspaces = workspaces && workspaces.length > 0
    const targetPath = hasWorkspaces ? '/dashboard' : '/onboarding'
    window.location.href = targetPath
}

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

    // For password sign-in, we need to handle the redirect ourselves
    await handlePostSignIn()
}

export async function signOut() {
    const supabase = createClient()
    const { error } = await supabase.auth.signOut()

    if (error) {
        throw error
    }
}
