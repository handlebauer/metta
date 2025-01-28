'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { Code } from 'lucide-react'

import { cn } from '@/lib/utils'
import { Switch } from '@/components/ui/switch'
import { toggleDevMode } from '@/actions/dev-mode'

export function DevModeButton() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const isDev = searchParams.get('dev') === 'true'

    async function handleToggle() {
        // Toggle the cookie
        await toggleDevMode()

        // Update the URL query parameter
        const params = new URLSearchParams(searchParams)
        if (isDev) {
            params.delete('dev')
        } else {
            params.set('dev', 'true')
        }
        router.replace(`${window.location.pathname}?${params.toString()}`)
    }

    return (
        <div className="fixed bottom-4 right-4 z-50 flex items-center gap-2 rounded-lg bg-background/80 p-2 shadow-lg backdrop-blur">
            <Code
                className={cn(
                    'h-4 w-4',
                    isDev ? 'text-primary' : 'text-muted-foreground',
                )}
            />
            <Switch
                checked={isDev}
                onCheckedChange={handleToggle}
                className="data-[state=checked]:bg-primary"
            />
        </div>
    )
}
