'use client'

import { useCallback, useState } from 'react'
import { AlertOctagon, Bot, ExternalLink } from 'lucide-react'

import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Toast, ToastClose } from '@/components/ui/toast'
import { FirebreakAnalysisSheet } from '@/components/ai/firebreak-analysis-sheet'

import type { FirebreakResponseType } from '@/app/api/ai/firebreak/schemas'

interface AIIncidentNotificationProps {
    id: string
    incidentId: string
    numRelatedTickets: number
    description: string
    className?: string
    onOpenChange?: (open: boolean) => void
}

export function AIIncidentNotification({
    id,
    incidentId,
    numRelatedTickets,
    description,
    className,
    onOpenChange,
}: AIIncidentNotificationProps) {
    const [isAnalysisOpen, setIsAnalysisOpen] = useState(false)
    const [analysisData, setAnalysisData] =
        useState<FirebreakResponseType | null>(null)
    const [isLoading, setIsLoading] = useState(false)

    const handleViewIncident = useCallback(async () => {
        try {
            setIsLoading(true)
            setIsAnalysisOpen(true)

            // Dismiss the notification
            onOpenChange?.(false)

            const response = await fetch(
                `/api/ai/firebreak/analysis/${incidentId}`,
            )
            if (!response.ok) throw new Error('Failed to fetch analysis')

            const data = await response.json()
            setAnalysisData(data)
        } catch (error) {
            console.error('Failed to load analysis:', error)
            // Could add error toast here
        } finally {
            setIsLoading(false)
        }
    }, [incidentId, onOpenChange])

    const handleSheetOpenChange = useCallback((open: boolean) => {
        setIsAnalysisOpen(open)
        if (!open) {
            setAnalysisData(null)
        }
    }, [])

    return (
        <>
            <Toast
                id={id}
                className={cn(
                    'group relative flex w-full flex-col gap-3 overflow-hidden bg-background p-6',
                    'border-l-4 border-l-destructive shadow-lg',
                    className,
                )}
                onOpenChange={onOpenChange}
                aria-label="AI Incident Alert"
            >
                <div className="flex items-start gap-4">
                    <div
                        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-destructive/10 text-destructive shadow-sm"
                        aria-hidden="true"
                    >
                        <AlertOctagon className="h-4 w-4" />
                    </div>
                    <div className="flex min-w-0 flex-1 flex-col gap-2">
                        <div className="flex flex-wrap items-center gap-2">
                            <Badge
                                variant="destructive"
                                className="px-2 py-0.5 text-[11px] font-semibold uppercase leading-none tracking-wide"
                            >
                                urgent
                            </Badge>
                            <span className="text-sm font-semibold tracking-tight text-foreground">
                                Incident Detected
                            </span>
                            <Badge
                                variant="secondary"
                                className="flex items-center gap-1 px-1.5 py-0.5 text-[11px] font-medium leading-none"
                            >
                                <Bot className="h-3 w-3" aria-hidden="true" />
                                AI Generated
                            </Badge>
                        </div>
                        <div className="space-y-2">
                            <p className="text-xs font-medium text-muted-foreground">
                                <span className="font-semibold text-destructive">
                                    {numRelatedTickets} related tickets
                                </span>{' '}
                                may indicate a broader issue
                            </p>
                            <p className="text-sm leading-relaxed text-foreground/90">
                                {description}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="flex items-center pt-1">
                    <Button
                        variant="destructive"
                        size="sm"
                        onClick={handleViewIncident}
                        className="h-9 gap-1.5 px-4 text-xs font-medium shadow-sm"
                    >
                        View Analysis
                        <ExternalLink className="h-3.5 w-3.5" />
                    </Button>
                </div>

                <ToastClose
                    className="absolute right-2 top-2 rounded-md p-2 text-foreground/50 opacity-100 ring-offset-background transition-colors hover:bg-muted hover:text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none"
                    aria-label="Close notification"
                />
            </Toast>

            <FirebreakAnalysisSheet
                open={isAnalysisOpen}
                onOpenChange={handleSheetOpenChange}
                data={analysisData ?? ({} as FirebreakResponseType)}
                isLoading={isLoading}
            />
        </>
    )
}
