import { NextResponse } from 'next/server'

import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
    const requestUrl = new URL(request.url)
    const code = requestUrl.searchParams.get('code')

    if (code) {
        try {
            const supabase = await createClient()
            await supabase.auth.exchangeCodeForSession(code)

            const dashboard = new URL('/dashboard', requestUrl.origin)
            return NextResponse.redirect(dashboard)
        } catch (error) {
            console.error('[GET auth/callback] error:', error)
            const login = new URL('/login', requestUrl.origin)
            return NextResponse.redirect(login)
        }
    }

    const login = new URL('/login', requestUrl.origin)
    return NextResponse.redirect(login)
}
