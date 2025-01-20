'use client'

import { useCallback } from 'react'
import { useRouter } from 'next/navigation'

import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/client'

export function SignOutButton() {
    const router = useRouter()

    const handleSignOut = useCallback(async () => {
        const supabase = await createClient()
        await supabase.auth.signOut()
        router.push('/login')
    }, [router])

    return (
        <Button
            onClick={handleSignOut}
            className="px-4 py-2 border transition-colors"
        >
            Sign out
        </Button>
    )
}
