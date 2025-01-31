'use client'

import { useMemo } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import {
    AlertOctagon,
    Bot,
    Clock,
    Loader2,
    Server,
    Terminal,
    Wand2,
} from 'lucide-react'

import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from '@/components/ui/collapsible'
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
} from '@/components/ui/sheet'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

import type { FirebreakResponseType } from '@/app/api/ai/firebreak/schemas'

interface AgentStep {
    timestamp: string
    type: 'action' | 'reflection' | 'result'
    content: string
    tool_calls?: Array<{
        id: string
        type: string
        function: {
            name: string
            arguments: string
        }
    }>
    name?: string
    tool_call_id?: string
}

interface FirebreakAnalysisSheetProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    data: FirebreakResponseType & { agent_steps?: AgentStep[] }
    isLoading?: boolean
}

function AgentStepIcon({ type }: { type: AgentStep['type'] }) {
    switch (type) {
        case 'action':
            return <Terminal className="h-4 w-4 text-blue-500" />
        case 'result':
            return <Server className="h-4 w-4 text-green-500" />
        case 'reflection':
            return <Wand2 className="h-4 w-4 text-purple-500" />
        default:
            return null
    }
}

function AgentStepTimeline({ steps }: { steps: AgentStep[] }) {
    // Group steps by tool call to ensure reflections appear before their actions
    const groupedSteps = useMemo(() => {
        if (!steps?.length) return []

        const groups: AgentStep[][] = []
        let currentGroup: AgentStep[] = []

        steps.forEach(step => {
            if (step.type === 'reflection') {
                // Start a new group with the reflection
                if (currentGroup.length > 0) {
                    groups.push(currentGroup)
                }
                currentGroup = [step]
            } else {
                // Add action/result to current group
                currentGroup.push(step)
                if (step.type === 'result') {
                    // End group after result
                    groups.push(currentGroup)
                    currentGroup = []
                }
            }
        })

        // Add any remaining steps
        if (currentGroup.length > 0) {
            groups.push(currentGroup)
        }

        return groups.flat()
    }, [steps])

    if (!steps?.length) {
        console.log('[AgentStepTimeline] No steps provided:', steps)
        return (
            <div className="text-sm text-muted-foreground">
                No agent steps available.
            </div>
        )
    }

    console.log('[AgentStepTimeline] Rendering grouped steps:', groupedSteps)
    return (
        <div className="relative space-y-3">
            {groupedSteps.map((step, i) => (
                <Collapsible key={i}>
                    <CollapsibleTrigger className="flex w-full items-center gap-2 rounded-lg border bg-card p-3 text-left hover:bg-muted/50">
                        <AgentStepIcon type={step.type} />
                        <div className="min-w-0 flex-1">
                            <div className="flex items-center justify-between gap-2">
                                <p className="truncate text-sm font-medium">
                                    {step.type === 'action'
                                        ? `Using ${step.tool_calls?.[0]?.function.name}`
                                        : step.type === 'result'
                                          ? `Result from ${step.name}`
                                          : 'Thinking...'}
                                </p>
                                <Badge
                                    variant="outline"
                                    className="flex-shrink-0 capitalize"
                                >
                                    {step.type}
                                </Badge>
                            </div>
                            <p className="mt-1 line-clamp-1 text-xs text-muted-foreground">
                                {step.content}
                            </p>
                        </div>
                    </CollapsibleTrigger>
                    <CollapsibleContent className="mt-2 space-y-2 pl-9">
                        {step.type === 'action' && step.tool_calls?.[0] && (
                            <div className="space-y-1.5 rounded-md bg-muted p-3 text-xs">
                                <p className="font-medium">
                                    {step.tool_calls[0].function.name}
                                </p>
                                <pre className="whitespace-pre-wrap font-mono text-muted-foreground">
                                    {step.tool_calls[0].function.arguments}
                                </pre>
                            </div>
                        )}
                        {step.type !== 'action' && (
                            <div className="rounded-md bg-muted p-3 text-xs">
                                <pre className="whitespace-pre-wrap font-mono">
                                    {step.content}
                                </pre>
                            </div>
                        )}
                    </CollapsibleContent>
                </Collapsible>
            ))}
        </div>
    )
}

export function FirebreakAnalysisSheet({
    open,
    onOpenChange,
    data,
    isLoading,
}: FirebreakAnalysisSheetProps) {
    const params = useParams()
    const workspaceSlug = params.slug as string

    // Add logging for the data prop
    console.log('[FirebreakAnalysisSheet] Data:', {
        hasAgentSteps: !!data?.agent_steps,
        stepsLength: data?.agent_steps?.length,
        firstStep: data?.agent_steps?.[0],
    })

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
                    <Tabs defaultValue="analysis" className="flex-1">
                        <TabsList>
                            <TabsTrigger value="analysis">Analysis</TabsTrigger>
                            <TabsTrigger
                                value="process"
                                className="flex items-center gap-1.5"
                            >
                                Agent
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent
                            value="analysis"
                            className="mt-6 space-y-6"
                        >
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
                                                    : pattern.severity ===
                                                        'medium'
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
                                        {pattern.affected_systems.length >
                                            0 && (
                                            <div className="space-y-2">
                                                <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                                                    <Server className="h-3.5 w-3.5" />
                                                    <span>
                                                        Affected Systems
                                                    </span>
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
                        </TabsContent>

                        <TabsContent value="process" className="mt-6">
                            <AgentStepTimeline steps={data.agent_steps || []} />
                        </TabsContent>
                    </Tabs>
                )}
            </SheetContent>
        </Sheet>
    )
}
