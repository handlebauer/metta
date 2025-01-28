'use client'

import { useSearchParams } from 'next/navigation'
import { Code } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { toggleDevMode } from '@/actions/dev-mode'

export function DevModeButton() {
    const searchParams = useSearchParams()
    const isDev = searchParams.get('dev') === 'true'

    return (
        <Button
            variant="ghost"
            size="icon"
            onClick={() => toggleDevMode()}
            className={`fixed bottom-4 right-4 z-50 ${
                isDev ? 'bg-primary text-primary-foreground' : ''
            }`}
        >
            <Code className="h-4 w-4" />
        </Button>
    )
}
