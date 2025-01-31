'use client'

import { useCallback, useState } from 'react'
import { Loader2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { AIIncidentNotification } from '@/components/notifications/ai-incident-notification.client'
import { toast } from '@/hooks/use-toast'

import type { FirebreakResponseType } from '@/app/api/ai/firebreak/schemas'

export default function DetectTestPage() {
    const [isLoading, setIsLoading] = useState(false)

    const runDetection = useCallback(async () => {
        try {
            setIsLoading(true)
            const response = await fetch('/api/ai/firebreak/detect', {
                method: 'POST',
            })

            // No incidents found (normal case)
            if (response.status === 204) {
                toast({
                    title: 'No Incidents',
                    description: 'No patterns or incidents were detected.',
                })
                return
            }

            // Error case
            if (!response.ok) {
                const error = await response.json()
                throw new Error(error.error || 'Detection failed')
            }

            // Success case - show incident notification
            const data = (await response.json()) as FirebreakResponseType
            const incident = data.created_incidents[0]

            toast({
                description: (
                    <AIIncidentNotification
                        id={`incident-${incident.id}`}
                        incidentId={incident.id}
                        numRelatedTickets={data.found_tickets.length}
                        description={incident.pattern_name}
                        onOpenChange={() => {
                            const toastEl = document.getElementById(
                                `incident-${incident.id}`,
                            )
                            if (toastEl?.parentElement) {
                                toastEl.parentElement.remove()
                            }
                        }}
                    />
                ),
                className: 'p-0',
                duration: 24 * 60 * 60 * 1000, // 24 hours
            })
        } catch (error) {
            console.error('Detection failed:', error)
            toast({
                title: 'Error',
                description:
                    error instanceof Error ? error.message : 'Detection failed',
                variant: 'destructive',
            })
        } finally {
            setIsLoading(false)
        }
    }, [])

    return (
        <div className="container max-w-2xl py-8">
            <div className="mb-8">
                <h1 className="text-2xl font-bold">Firebreak Detection Test</h1>
                <p className="mt-2 text-sm text-muted-foreground">
                    Test the new detection endpoint that waits for agent
                    completion before showing notifications.
                </p>
            </div>

            <Card className="p-6">
                <div className="flex flex-col gap-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-sm font-medium">
                                Run Detection
                            </h2>
                            <p className="text-xs text-muted-foreground">
                                Analyze tickets from the last 2 hours and show a
                                notification if patterns are found.
                            </p>
                        </div>
                        <Button
                            onClick={runDetection}
                            disabled={isLoading}
                            className="gap-2"
                        >
                            {isLoading && (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            )}
                            {isLoading ? 'Running...' : 'Run Now'}
                        </Button>
                    </div>

                    <div className="rounded-lg border bg-muted/40 p-4">
                        <h3 className="mb-2 text-xs font-medium">
                            How it works
                        </h3>
                        <ul className="list-inside list-disc space-y-1 text-xs text-muted-foreground">
                            <li>Runs the agent to completion (no streaming)</li>
                            <li>
                                Shows notification only if patterns are found
                            </li>
                            <li>
                                Clicking &quot;View Analysis&quot; opens the
                                analysis sheet
                            </li>
                            <li>
                                Notification is dismissed when viewing analysis
                            </li>
                        </ul>
                    </div>
                </div>
            </Card>
        </div>
    )
}
