'use client'

import { LogOut } from 'lucide-react'

import { DropdownMenuItem } from '@/components/ui/dropdown-menu'
import { createClient } from '@/lib/supabase/client'

export function SignOutItem() {
    const handleSignOut = async () => {
        const supabase = await createClient()
        await supabase.auth.signOut()
        window.location.href = '/login'
    }

    return (
        <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer">
            <LogOut className="mr-2 h-4 w-4" />
            Sign out
        </DropdownMenuItem>
    )
}
