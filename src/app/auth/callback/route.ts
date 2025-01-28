import { NextResponse } from 'next/server'

import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
    const requestUrl = new URL(request.url)
    const code = requestUrl.searchParams.get('code')

    if (code) {
        try {
            const supabase = await createClient()

            // Exchange code for session
            await supabase.auth.exchangeCodeForSession(code)

            // Check if user has any workspaces
            const { data: workspaces } = await supabase
                .from('workspaces')
                .select('id')
                .limit(1)

            // Redirect to onboarding if no workspaces, otherwise to dashboard
            const hasWorkspaces = workspaces && workspaces.length > 0
            const targetPath = hasWorkspaces ? '/dashboard' : '/onboarding'

            return NextResponse.redirect(new URL(targetPath, requestUrl.origin))
        } catch (error) {
            console.error('[GET auth/callback] error:', error)
            return NextResponse.redirect(new URL('/login', requestUrl.origin))
        }
    }

    return NextResponse.redirect(new URL('/login', requestUrl.origin))
}
