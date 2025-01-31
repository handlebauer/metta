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
import { FirebreakAnalysisSheet } from '@/components/ai/firebreak-analysis-sheet'
import { AIIncidentNotification } from '@/components/notifications/ai-incident-notification.client'
import { toast } from '@/hooks/use-toast'

import type { FirebreakResponseType } from '@/app/api/ai/firebreak/schemas'

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
    const [isAnalysisSheetOpen, setIsAnalysisSheetOpen] = useState(false)
    const [analysisData, setAnalysisData] =
        useState<FirebreakResponseType | null>(null)

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
            id: 'test-notification',
            title: 'Test AI Incident Alert',
            description:
                'Show a sample AI incident notification to test the UI and interaction.',
            buttonText: 'Show Notification',
            onClick: async () => {
                const toastId = `toast-${Date.now()}`
                toast({
                    description: (
                        <AIIncidentNotification
                            id={toastId}
                            incidentId="test-123"
                            numRelatedTickets={3}
                            description="Multiple users reporting slow response times and timeouts in the checkout flow."
                            onOpenChange={() => {
                                const toastEl = document.getElementById(toastId)
                                if (toastEl?.parentElement) {
                                    toastEl.parentElement.remove()
                                }
                            }}
                            analysisId={null}
                        />
                    ),
                    className: 'p-0 bg-background border',
                    duration: Infinity,
                })
            },
        },
        {
            id: 'test-tickets',
            title: 'Test Data Generation',
            description:
                'Create 10 test tickets (6 performance-related, 4 unrelated) spread across multiple customers.',
            buttonText: 'Insert Test Tickets',
            onClick: async () => {
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
            description:
                'Analyze tickets for patterns and potential issues that need immediate attention.',
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
        {
            id: 'view-seed-analysis',
            title: 'View Seeded Analysis',
            description:
                'View the seeded firebreak analysis showing performance issues across systems.',
            buttonText: 'View Analysis',
            onClick: async () => {
                const response = await fetch('/api/demo/seed-analysis')
                if (!response.ok) {
                    throw new Error('Failed to fetch seeded analysis')
                }
                const data = await response.json()
                setAnalysisData(data)
                setIsAnalysisSheetOpen(true)
            },
        },
        {
            id: 'delete-test-data',
            title: 'Clean Test Data',
            description:
                'Delete all test tickets and incidents from the last 2 hours.',
            buttonText: 'Delete Test Data',
            onClick: async () => {
                const response = await fetch('/api/demo/delete-test-tickets', {
                    method: 'POST',
                })
                if (!response.ok) {
                    throw new Error('Failed to delete test data')
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

            <FirebreakAnalysisSheet
                open={isAnalysisSheetOpen}
                onOpenChange={setIsAnalysisSheetOpen}
                data={analysisData ?? ({} as FirebreakResponseType)}
                isLoading={false}
            />
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
