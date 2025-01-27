'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { signInAsDemoUser } from '@/auth'
import { Briefcase, Rocket } from 'lucide-react'

import { Button } from '@/components/ui/button'

export interface DemoButtonProps {
    onStateChange: (loading: boolean) => void
}

export function DemoButton({ onStateChange }: DemoButtonProps) {
    const [demoLoading, setDemoLoading] = useState(false)
    const router = useRouter()

    async function handleDemoSignIn(
        type: 'default' | 'no-workspace' = 'default',
    ) {
        try {
            setDemoLoading(true)
            onStateChange(true)
            await signInAsDemoUser(type)
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
            <div className="grid gap-2">
                <Button
                    variant="outline"
                    className="border-blue-200 font-medium text-blue-700 hover:bg-accent/80 hover:text-blue-800 dark:border-blue-800 dark:bg-blue-950 dark:text-blue-300 dark:hover:bg-blue-900 dark:hover:text-blue-200"
                    onClick={() => handleDemoSignIn('no-workspace')}
                    disabled={demoLoading}
                >
                    <Rocket className="mr-2 h-4 w-4" />
                    {demoLoading ? '...' : 'Fresh Account'}
                </Button>
                <Button
                    variant="outline"
                    className="border-emerald-200 font-medium text-emerald-700 hover:bg-accent/80 hover:text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 dark:hover:bg-emerald-900 dark:hover:text-emerald-200"
                    onClick={() => handleDemoSignIn('default')}
                    disabled={demoLoading}
                >
                    <Briefcase className="mr-2 h-4 w-4" />
                    {demoLoading ? '...' : 'Pre-Configured'}
                </Button>
            </div>
        </div>
    )
}
