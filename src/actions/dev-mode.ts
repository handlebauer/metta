'use server'

import { cookies } from 'next/headers'

const DEV_MODE_COOKIE = 'metta-dev-mode'

export async function toggleDevMode() {
    const cookieStore = await cookies()
    const current = cookieStore.get(DEV_MODE_COOKIE)?.value === 'true'

    if (current) {
        cookieStore.delete(DEV_MODE_COOKIE)
    } else {
        cookieStore.set(DEV_MODE_COOKIE, 'true', {
            path: '/',
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
        })
    }
}
