'use client'

import { Suspense, useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Code, Loader2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
} from '@/components/ui/sheet'
import { Switch } from '@/components/ui/switch'
import { toast } from '@/hooks/use-toast'

interface DemoWrapperProps {
    children: React.ReactNode
}

interface DemoAction {
    id: string
    title: string
    description: string
    buttonText: string
    onClick: () => Promise<void>
}

function DemoContent({ children }: DemoWrapperProps) {
    const router = useRouter()
    const searchParams = useSearchParams()
    const [isDemoEnabled, setIsDemoEnabled] = useState(false)
    const [isInitialized, setIsInitialized] = useState(false)
    const [loadingActions, setLoadingActions] = useState<Set<string>>(new Set())

    // Sync with URL params only on initial load
    useEffect(() => {
        if (!isInitialized) {
            setIsDemoEnabled(searchParams.get('demo') === 'true')
            setIsInitialized(true)
        }
    }, [searchParams, isInitialized])

    // Update URL and state
    const updateDemoState = (enabled: boolean) => {
        setIsDemoEnabled(enabled)
        const currentUrl = new URL(window.location.href)
        if (enabled) {
            currentUrl.searchParams.set('demo', 'true')
        } else {
            currentUrl.searchParams.delete('demo')
        }
        router.replace(currentUrl.pathname + currentUrl.search)
    }

    // Handle sheet closing via ESC or clicking outside
    const handleSheetOpenChange = (open: boolean) => {
        if (!open && isDemoEnabled) {
            updateDemoState(false)
        }
    }

    const demoActions: DemoAction[] = [
        {
            id: 'test-tickets',
            title: 'Test Data Generation',
            description: 'Create 10 test tickets',
            buttonText: 'Insert Test Tickets',
            onClick: async () => {
                // First clean existing test data
                await fetch('/api/demo/delete-test-tickets', {
                    method: 'POST',
                })

                // Then insert new test data
                const response = await fetch('/api/demo/insert-test-tickets', {
                    method: 'POST',
                })
                if (!response.ok) {
                    throw new Error('Failed to insert test tickets')
                }
            },
        },
        {
            id: 'firebreak',
            title: 'Firebreak Analysis',
            description: 'Analyze tickets for patterns and potential issues',
            buttonText: 'Run Analysis',
            onClick: async () => {
                const response = await fetch('/api/ai/firebreak/detect', {
                    method: 'POST',
                })
                if (!response.ok) {
                    throw new Error('Failed to run firebreak analysis')
                }
            },
        },
    ]

    const handleAction = async (action: DemoAction) => {
        setLoadingActions(prev => new Set([...prev, action.id]))
        try {
            await action.onClick()
        } catch (error) {
            console.error(`Failed to execute ${action.id}:`, error)
            toast({
                title: 'Error',
                description: `Failed to execute ${action.title.toLowerCase()}.`,
                variant: 'destructive',
            })
        } finally {
            setLoadingActions(prev => {
                const next = new Set(prev)
                next.delete(action.id)
                return next
            })
        }
    }

    return (
        <>
            {children}

            {/* Always visible toggle switch */}
            <div className="fixed bottom-4 left-4 z-50 flex items-center gap-2 rounded-full border bg-background/80 px-4 py-2 shadow-lg backdrop-blur">
                <Code className="h-4 w-4 text-muted-foreground" />
                <Switch
                    checked={isDemoEnabled}
                    onCheckedChange={updateDemoState}
                    className="data-[state=checked]:bg-purple-500"
                />
            </div>

            <Sheet
                open={isDemoEnabled}
                onOpenChange={handleSheetOpenChange}
                modal={false}
            >
                <SheetContent
                    side="right"
                    className="w-[400px] border-l border-l-muted/20 bg-background/80 backdrop-blur-xl sm:w-[540px]"
                >
                    <SheetHeader className="space-y-1">
                        <div className="flex items-center justify-between">
                            <SheetTitle className="text-lg font-light tracking-tight">
                                Demo Controls
                            </SheetTitle>
                        </div>
                        <p className="text-sm font-light text-muted-foreground">
                            Test and demo Metta&apos;s features
                        </p>
                    </SheetHeader>

                    <div className="mt-8 space-y-6">
                        {demoActions.map(action => (
                            <Card
                                key={action.id}
                                className="border-none bg-muted/40 p-6 shadow-none"
                            >
                                <h3 className="mb-2 text-sm font-medium">
                                    {action.title}
                                </h3>
                                <p className="mb-4 text-xs text-muted-foreground">
                                    {action.description}
                                </p>
                                <Button
                                    onClick={() => handleAction(action)}
                                    variant="secondary"
                                    size="sm"
                                    className="w-full justify-center"
                                    disabled={loadingActions.has(action.id)}
                                >
                                    {loadingActions.has(action.id) && (
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    )}
                                    {loadingActions.has(action.id)
                                        ? 'Processing...'
                                        : action.buttonText}
                                </Button>
                            </Card>
                        ))}
                    </div>
                </SheetContent>
            </Sheet>
        </>
    )
}

export function DemoWrapper(props: DemoWrapperProps) {
    return (
        <Suspense>
            <DemoContent {...props} />
        </Suspense>
    )
}
