'use client'

import { useEffect, useRef, useState } from 'react'
import { CheckCircle2, Loader2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

import type { StreamingMessageState } from '@/lib/schemas/streaming.schemas'

function Message({ message }: { message: StreamingMessageState }) {
    return (
        <div className="mt-1 whitespace-pre-wrap">
            {message.toolState && (
                <div className="mb-2 flex items-center gap-2 text-sm">
                    {message.type === 'result' ? (
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                    ) : (
                        <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
                    )}
                    <span>{message.toolState.description}</span>
                </div>
            )}
            {message.content && <div className="mt-2">{message.content}</div>}
        </div>
    )
}

function transformMessage(msg: {
    type?: string
    content?: string
    tool_calls?: Array<{
        function: { name: string; arguments: string }
    }>
    name?: string
}) {
    const content = msg.content || ''
    if (!content.trim() && !msg.tool_calls?.length) {
        return { content: null }
    }

    // For tool calls, provide a friendly message
    if (msg.tool_calls?.length) {
        const tool = msg.tool_calls[0]
        return {
            content: null,
            toolState: {
                name: tool.function.name,
                description: getToolDescription(tool.function.name),
                startTime: Date.now(),
                isComplete: false,
            },
        }
    }

    // For results or reflections, just show the content
    return {
        content: content.trim(),
        toolState:
            msg.type === 'result'
                ? {
                      name: msg.name || 'unknown',
                      description: getToolDescription(msg.name || 'unknown'),
                      startTime: Date.now(),
                      isComplete: true,
                  }
                : undefined,
    }
}

function getToolDescription(toolName: string): string {
    switch (toolName) {
        case 'getRecentTickets':
            return 'Getting recent tickets to analyze...'
        case 'reviewAnalysis':
            return 'Validating pattern analysis and clustering decisions...'
        case 'createIncidentTicket':
            return 'Creating an incident ticket...'
        case 'linkTickets':
            return 'Linking related tickets...'
        default:
            return `Using tool: ${toolName}...`
    }
}

export default function FirebreakTestPage() {
    const [messages, setMessages] = useState<StreamingMessageState[]>([])
    const [isRunning, setIsRunning] = useState(false)
    const [currentTime, setCurrentTime] = useState<string>('')
    const messagesEndRef = useRef<HTMLDivElement>(null)

    // Update time every second
    useEffect(() => {
        // Set initial time
        setCurrentTime(new Date().toLocaleTimeString())

        // Update time every second
        const interval = setInterval(() => {
            setCurrentTime(new Date().toLocaleTimeString())
        }, 1000)

        return () => clearInterval(interval)
    }, [])

    // Auto scroll to bottom when new messages arrive
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [messages])

    const runAgent = async () => {
        setIsRunning(true)
        setMessages([])

        try {
            const response = await fetch('/api/ai/firebreak', {
                method: 'POST',
            })

            if (!response.ok)
                throw new Error(`HTTP error! status: ${response.status}`)

            const reader = response.body?.getReader()
            if (!reader) throw new Error('No reader available')

            const decoder = new TextDecoder()
            let buffer = ''

            while (true) {
                const { done, value } = await reader.read()
                if (done) break

                buffer += decoder.decode(value, { stream: true })
                const lines = buffer.split('\n')
                buffer = lines.pop() || ''

                for (const line of lines) {
                    if (!line.trim() || !line.startsWith('data: ')) continue

                    const data = line.replace('data: ', '').trim()
                    if (data === '[DONE]') {
                        setIsRunning(false)
                        return
                    }

                    try {
                        const parsed = JSON.parse(data)
                        const transformed = transformMessage(parsed)

                        if (
                            transformed.content !== null ||
                            transformed.toolState
                        ) {
                            setMessages(prev => {
                                // If this is a result, mark the corresponding tool call as complete
                                if (parsed.type === 'result' && parsed.name) {
                                    return prev.map(msg => {
                                        if (
                                            msg.toolState?.name === parsed.name
                                        ) {
                                            return {
                                                ...msg,
                                                type: 'result',
                                                isComplete: true,
                                            }
                                        }
                                        return msg
                                    })
                                }

                                // Add the new message
                                return [
                                    ...prev,
                                    {
                                        id: crypto.randomUUID(),
                                        type: parsed.type,
                                        content: transformed.content || '',
                                        timestamp: new Date().toISOString(),
                                        isComplete: parsed.type === 'result',
                                        toolState: transformed.toolState,
                                    },
                                ]
                            })
                        }
                    } catch (e) {
                        console.error('Error parsing message:', e)
                    }
                }
            }
        } catch (error) {
            console.error('Failed to run agent:', error)
        } finally {
            setIsRunning(false)
        }
    }

    return (
        <div className="container max-w-4xl py-8">
            <div className="mb-8 flex items-center justify-between">
                <h1 className="text-2xl font-bold">Firebreak Dev Console</h1>
                <div className="space-x-4">
                    <Button
                        onClick={runAgent}
                        disabled={isRunning}
                        variant="default"
                    >
                        {isRunning ? 'Running...' : 'Run Agent Now'}
                    </Button>
                    <Button onClick={() => setMessages([])} variant="outline">
                        Clear Logs
                    </Button>
                </div>
            </div>

            <Card className="h-[600px] overflow-y-auto p-4">
                <div className="flex flex-col space-y-2 rounded-lg bg-accent p-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                            <span className="text-sm font-bold">
                                AI Assistant
                            </span>
                            {currentTime && (
                                <span className="text-xs text-muted-foreground">
                                    {currentTime}
                                </span>
                            )}
                        </div>
                    </div>
                    <div className="space-y-4">
                        {messages.length === 0 ? (
                            isRunning ? (
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
                                    <span>
                                        Getting recent tickets to analyze...
                                    </span>
                                </div>
                            ) : (
                                <div className="text-sm text-muted-foreground">
                                    Click &quot;Run Agent Now&quot; to start.
                                </div>
                            )
                        ) : (
                            <>
                                {messages.map(msg => (
                                    <Message key={msg.id} message={msg} />
                                ))}
                                {isRunning && (
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                        <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
                                        <span>Processing...</span>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>
                <div ref={messagesEndRef} />
            </Card>

            <div className="mt-4 text-sm text-muted-foreground">
                <h2 className="font-semibold">About this console</h2>
                <p>
                    This development console allows you to manually trigger and
                    monitor the Firebreak agent. The agent will:
                </p>
                <ul className="mt-2 list-disc pl-5">
                    <li>Scan tickets from the last 2 hours</li>
                    <li>Look for patterns indicating potential issues</li>
                    <li>Create incident tickets when patterns are found</li>
                    <li>Link related tickets to the incidents</li>
                </ul>
            </div>
        </div>
    )
}
