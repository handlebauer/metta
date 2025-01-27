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

            // Redirect to dashboard first, then they can select a workspace
            return NextResponse.redirect(
                new URL('/dashboard', requestUrl.origin),
            )
        } catch (error) {
            console.error('[GET auth/callback] error:', error)
            return NextResponse.redirect(new URL('/login', requestUrl.origin))
        }
    }

    return NextResponse.redirect(new URL('/login', requestUrl.origin))
}
