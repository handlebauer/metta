'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { signInAsDemoUser } from '@/auth'
import { IconUserCircle } from '@tabler/icons-react'

import { Button } from '@/components/ui/button'

export interface DemoButtonProps {
    onStateChange: (loading: boolean) => void
}

export function DemoButton({ onStateChange }: DemoButtonProps) {
    const [demoLoading, setDemoLoading] = useState(false)
    const router = useRouter()

    async function handleDemoSignIn() {
        try {
            setDemoLoading(true)
            onStateChange(true)
            await signInAsDemoUser()
            router.push('/dashboard')
        } catch (error) {
            console.error('Demo login error:', error)
            setDemoLoading(false)
            onStateChange(false)
        }
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-4">
                <div className="h-px flex-1 bg-border"></div>
                <span className="text-xs uppercase text-muted-foreground">
                    Or try demo account
                </span>
                <div className="h-px flex-1 bg-border"></div>
            </div>
            {/* DEMO USER BUTTON - Remove this component in production */}
            <Button
                variant="outline"
                className="w-full bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950 dark:hover:bg-emerald-900 border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 hover:text-emerald-800 dark:hover:text-emerald-200 font-medium"
                onClick={handleDemoSignIn}
                disabled={demoLoading}
            >
                <IconUserCircle className="mr-2 h-4 w-4" />
                {demoLoading ? '...' : 'Try Demo Account'}
            </Button>
        </div>
    )
}
