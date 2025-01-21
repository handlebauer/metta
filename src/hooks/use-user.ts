'use client'

import { useEffect, useState } from 'react'

import { createClient } from '@/lib/supabase/client'

import type { User } from '@supabase/supabase-js'

export function useUser() {
    const [user, setUser] = useState<User | null>(null)
    const supabase = createClient()

    useEffect(() => {
        const getUser = async () => {
            const {
                data: { user },
            } = await supabase.auth.getUser()
            setUser(user)
        }

        getUser()

        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null)
        })

        return () => {
            subscription.unsubscribe()
        }
    }, [supabase.auth])

    return { user }
}
