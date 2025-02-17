import { NextResponse } from 'next/server'

import { updateSession } from './auth/update-session'

import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
    await updateSession(request)

    // Only process onboarding routes
    if (!request.nextUrl.pathname.startsWith('/onboarding')) {
        return NextResponse.next()
    }

    // Check for dev cookie
    const isDevMode = request.cookies.get('metta-dev-mode')?.value === 'true'

    // If dev cookie is set but URL doesn't have dev param, redirect with it
    if (isDevMode && !request.nextUrl.searchParams.has('dev')) {
        const url = request.nextUrl.clone()
        url.searchParams.set('dev', 'true')
        return NextResponse.redirect(url)
    }

    return NextResponse.next()
}

export const config = {
    matcher: '/onboarding/:path*',
}
