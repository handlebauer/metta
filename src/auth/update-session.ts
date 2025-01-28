import { NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'

import { Database } from '@/lib/supabase/types'

import type { NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
    let supabaseResponse = NextResponse.next({ request })

    const supabase = createServerClient<Database>(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll()
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value }) =>
                        request.cookies.set(name, value),
                    )
                    supabaseResponse = NextResponse.next({
                        request,
                    })
                    cookiesToSet.forEach(({ name, value, options }) =>
                        supabaseResponse.cookies.set(name, value, options),
                    )
                },
            },
        },
    )

    // IMPORTANT: Avoid writing any logic between createServerClient and
    // supabase.auth.getUser(). A simple mistake could make it very hard to debug
    // issues with users being randomly logged out.

    const {
        data: { user },
    } = await supabase.auth.getUser()

    const pathname = request.nextUrl.pathname

    /**
     * If user is not signed in and tries to access auth routes, redirect to login
     */
    if (
        !user &&
        !pathname.startsWith('/login') &&
        !pathname.startsWith('/auth') &&
        !pathname.match(/^\/tickets\/[^/]+\/[^/]+$/) // Allow public ticket access via /tickets/[id]/[token]
    ) {
        const url = request.nextUrl.clone()
        url.pathname = '/login'
        return NextResponse.redirect(url)
    }

    /**
     * If user is signed in and tries to access auth routes, redirect to dashboard
     */
    if (user) {
        // Only handle OAuth redirects, password sign-in is handled client-side
        if (pathname.startsWith('/auth/callback')) {
            // Let the callback route handle the redirect
            return supabaseResponse
        }

        if (pathname.startsWith('/login')) {
            const url = request.nextUrl.clone()
            url.pathname = '/dashboard'
            return NextResponse.redirect(url)
        }

        // If user is trying to access root, redirect to dashboard
        if (pathname === '/') {
            const url = request.nextUrl.clone()
            url.pathname = '/dashboard'
            return NextResponse.redirect(url)
        }
    }

    return supabaseResponse
}
