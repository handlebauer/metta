'use client'

import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { AlertOctagon, X } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useIncidentQueue } from '@/hooks/use-incident-queue'

import { FirebreakAnalysisSheet } from './firebreak-analysis-sheet'

import type { FirebreakResponseType } from '@/app/api/ai/firebreak/schemas'

export function IncidentFAB() {
    const { queue, removeFromQueue } = useIncidentQueue()
    const [isAnalysisOpen, setIsAnalysisOpen] = useState(false)
    const [, setSelectedAnalysisId] = useState<string | null>(null)
    const [analysisData, setAnalysisData] =
        useState<FirebreakResponseType | null>(null)
    const [isLoading, setIsLoading] = useState(false)

    // View analysis for a specific incident
    const handleViewAnalysis = async (analysisId: string) => {
        try {
            setIsLoading(true)
            setSelectedAnalysisId(analysisId)
            setIsAnalysisOpen(true)

            const response = await fetch(
                `/api/ai/firebreak/analysis/${analysisId}`,
            )
            if (!response.ok) throw new Error('Failed to fetch analysis')

            const data = await response.json()
            setAnalysisData(data)
        } catch (error) {
            console.error('Failed to load analysis:', error)
        } finally {
            setIsLoading(false)
        }
    }

    const handleSheetOpenChange = (open: boolean) => {
        setIsAnalysisOpen(open)
        if (!open) {
            setAnalysisData(null)
            setSelectedAnalysisId(null)
        }
    }

    if (queue.length === 0) return null

    return (
        <>
            <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="relative flex items-center"
            >
                <Popover>
                    <PopoverTrigger asChild>
                        <Button
                            variant="outline"
                            className="relative h-8 gap-2 border-muted-foreground/40 px-4 shadow-none hover:bg-muted/80"
                        >
                            <AlertOctagon className="h-4 w-4 text-destructive/80" />
                            <span className="absolute -right-[6px] -top-[6px] flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] font-medium text-destructive-foreground">
                                {queue.length}
                            </span>
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent
                        align="end"
                        alignOffset={-20}
                        className="w-80 p-0"
                        sideOffset={8}
                    >
                        <div className="flex items-center justify-between border-b px-3 py-2">
                            <h3 className="font-medium text-destructive">
                                Active Incidents
                            </h3>
                            <span className="text-xs text-muted-foreground">
                                {queue.length} incident
                                {queue.length !== 1 && 's'}
                            </span>
                        </div>
                        <ScrollArea className="max-h-[300px]">
                            <div className="space-y-1 p-2">
                                <AnimatePresence mode="popLayout">
                                    {queue.map(incident => (
                                        <motion.div
                                            key={incident.id}
                                            layout
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, x: -20 }}
                                            className="group relative rounded-lg border bg-card p-3 shadow-sm transition-colors hover:bg-muted/50"
                                        >
                                            <Button
                                                size="icon"
                                                variant="ghost"
                                                className="absolute right-2 top-2 h-6 w-6 opacity-0 transition-opacity group-hover:opacity-100"
                                                onClick={() =>
                                                    removeFromQueue(incident.id)
                                                }
                                            >
                                                <X className="h-3 w-3" />
                                            </Button>
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-2">
                                                    <AlertOctagon className="h-4 w-4 text-destructive/80" />
                                                    <span className="text-sm font-medium">
                                                        {
                                                            incident.numRelatedTickets
                                                        }{' '}
                                                        related tickets
                                                    </span>
                                                </div>
                                                <p className="line-clamp-2 text-xs text-muted-foreground">
                                                    {incident.description}
                                                </p>
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    className="w-full text-xs"
                                                    onClick={() =>
                                                        handleViewAnalysis(
                                                            incident.analysisId,
                                                        )
                                                    }
                                                >
                                                    View Analysis
                                                </Button>
                                            </div>
                                        </motion.div>
                                    ))}
                                </AnimatePresence>
                            </div>
                        </ScrollArea>
                    </PopoverContent>
                </Popover>
            </motion.div>

            <FirebreakAnalysisSheet
                open={isAnalysisOpen}
                onOpenChange={handleSheetOpenChange}
                data={analysisData ?? ({} as FirebreakResponseType)}
                isLoading={isLoading}
            />
        </>
    )
}
