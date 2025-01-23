'use client'

import { useMemo } from 'react'

import { Avatar, AvatarFallback } from '@/components/ui/avatar'

import type { Tables } from '@/lib/supabase/types'

interface CustomerDetailsProps {
    customerProfile: {
        data: Tables<'profiles'> | null
        error: string | null
    }
    customerUser: {
        data: { email?: string } | null
        error: string | null
    }
    createdAt: string | null
}

export function CustomerDetails({
    customerProfile,
    customerUser,
}: CustomerDetailsProps) {
    // Get customer initials for avatar fallback
    const customerName = customerProfile.data?.full_name || 'Unknown'
    const initials = useMemo(
        () =>
            customerName
                .split(' ')
                .map(n => n[0])
                .join('')
                .toUpperCase()
                .slice(0, 2),
        [customerName],
    )

    return (
        <div className="border-b pb-4">
            <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
                    <AvatarFallback className="bg-primary/10 text-primary text-sm">
                        {initials}
                    </AvatarFallback>
                </Avatar>
                <div className="space-y-1">
                    <p className="font-medium text-sm">
                        {customerProfile.data?.full_name || 'Unknown Customer'}
                    </p>
                    <p className="text-xs text-muted-foreground">
                        {customerUser.data?.email || 'No email available'}
                    </p>
                </div>
            </div>
        </div>
    )
}
