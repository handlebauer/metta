'use client'

import { useMemo } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { AlertOctagon, Bot, Clock, Loader2, Server } from 'lucide-react'

import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
} from '@/components/ui/sheet'

import type { FirebreakResponseType } from '@/app/api/ai/firebreak/schemas'

interface FirebreakAnalysisSheetProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    data: FirebreakResponseType
    isLoading?: boolean
}

export function FirebreakAnalysisSheet({
    open,
    onOpenChange,
    data,
    isLoading,
}: FirebreakAnalysisSheetProps) {
    const params = useParams()
    const workspaceSlug = params.slug as string

    const pattern = useMemo(() => {
        if (!data?.identified_patterns?.length) return null
        return data.identified_patterns[0]
    }, [data])

    const incident = useMemo(() => {
        if (!data?.created_incidents?.length) return null
        return data.created_incidents[0]
    }, [data])

    const analysisState = useMemo(() => {
        if (!data?.analysis_state) return null
        return data.analysis_state
    }, [data])

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent className="flex w-full flex-col gap-6 overflow-y-auto sm:max-w-xl">
                <SheetHeader className="space-y-3">
                    <div className="flex items-center gap-2">
                        <Badge
                            variant="destructive"
                            className="px-2 py-0.5 text-[11px] font-medium uppercase leading-none"
                        >
                            urgent
                        </Badge>
                        <SheetTitle>Incident Analysis</SheetTitle>
                        <Badge
                            variant="outline"
                            className="flex items-center gap-1 border-none bg-background/50 px-1.5 py-0.5 text-[11px] font-normal leading-none backdrop-blur-sm"
                        >
                            <Bot className="h-3 w-3" aria-hidden="true" />
                            AI Generated
                        </Badge>
                    </div>
                    {analysisState && (
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <div className="flex items-center gap-1.5">
                                <Clock className="h-3.5 w-3.5" />
                                <span>Last {analysisState.time_window}</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <AlertOctagon className="h-3.5 w-3.5" />
                                <span>
                                    {analysisState.total_tickets} tickets
                                    analyzed
                                </span>
                            </div>
                        </div>
                    )}
                    <SheetDescription className="text-base">
                        {incident?.description ||
                            'Analyzing potential system-wide issues...'}
                    </SheetDescription>
                </SheetHeader>

                {isLoading ? (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Analyzing tickets...
                    </div>
                ) : (
                    <>
                        {pattern && (
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-sm font-semibold">
                                        Identified Pattern
                                    </h3>
                                    <Badge
                                        variant={
                                            pattern.severity === 'high'
                                                ? 'destructive'
                                                : pattern.severity === 'medium'
                                                  ? 'default'
                                                  : 'secondary'
                                        }
                                        className="px-2 py-0.5"
                                    >
                                        {pattern.severity} severity
                                    </Badge>
                                </div>
                                <div className="rounded-lg border bg-muted/40 p-4">
                                    <div className="mb-4">
                                        <h4 className="font-medium">
                                            {pattern.name}
                                        </h4>
                                        <p className="mt-1 text-sm text-muted-foreground">
                                            {pattern.description}
                                        </p>
                                    </div>
                                    {pattern.affected_systems.length > 0 && (
                                        <div className="space-y-2">
                                            <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                                                <Server className="h-3.5 w-3.5" />
                                                <span>Affected Systems</span>
                                            </div>
                                            <div className="flex flex-wrap gap-1">
                                                {pattern.affected_systems.map(
                                                    system => (
                                                        <Badge
                                                            key={system}
                                                            variant="outline"
                                                            className="bg-background/50"
                                                        >
                                                            {system}
                                                        </Badge>
                                                    ),
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {data?.found_tickets?.length > 0 && (
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-sm font-semibold">
                                        Related Tickets
                                    </h3>
                                    <Badge
                                        variant="outline"
                                        className="px-2 py-0.5"
                                    >
                                        {data.found_tickets.length} tickets
                                    </Badge>
                                </div>
                                <div className="space-y-2">
                                    {data.found_tickets.map(ticket => (
                                        <Link
                                            key={ticket.id}
                                            href={`/${workspaceSlug}/tickets/${ticket.id}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="block transition-colors hover:bg-muted/50"
                                        >
                                            <div className="flex items-start gap-3 rounded-lg border bg-card p-3">
                                                <AlertOctagon className="mt-0.5 h-4 w-4 flex-shrink-0 text-muted-foreground" />
                                                <div className="min-w-0 flex-1">
                                                    <div className="flex items-center justify-between gap-2">
                                                        <p className="truncate text-sm font-medium">
                                                            {ticket.subject}
                                                        </p>
                                                        <Badge
                                                            variant="outline"
                                                            className={cn(
                                                                'flex-shrink-0',
                                                                ticket.status ===
                                                                    'closed' &&
                                                                    'bg-muted',
                                                            )}
                                                        >
                                                            {ticket.status}
                                                        </Badge>
                                                    </div>
                                                    <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                                                        {ticket.description}
                                                    </p>
                                                </div>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        )}
                    </>
                )}
            </SheetContent>
        </Sheet>
    )
}
