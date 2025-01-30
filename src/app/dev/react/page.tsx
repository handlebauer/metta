'use client'

import { useEffect, useRef, useState } from 'react'

import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'

interface ToolCall {
    id: string
    type: string
    name?: string
    function?: {
        name: string
        arguments: Record<string, unknown>
    }
}

interface Message {
    type: string
    content: string
    tool_calls?: ToolCall[]
    timestamp?: string
}

export default function ReactAgentTestPage() {
    const [prompt, setPrompt] = useState('')
    const [messages, setMessages] = useState<Message[]>([])
    const [error, setError] = useState<string | null>(null)
    const [isLoading, setIsLoading] = useState(false)
    const messagesEndRef = useRef<HTMLDivElement>(null)
    const lastMessageRef = useRef<string>('')

    // Auto scroll to bottom when new messages arrive
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [messages])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!prompt.trim() || isLoading) return

        setIsLoading(true)
        setMessages([])
        setError(null)
        lastMessageRef.current = ''

        try {
            const eventSource = new EventSource(
                `/api/ai/react?prompt=${encodeURIComponent(prompt)}`,
            )

            eventSource.onmessage = event => {
                // Handle [DONE] message
                if (event.data === '[DONE]') {
                    eventSource.close()
                    setIsLoading(false)
                    return
                }

                try {
                    const data = JSON.parse(event.data)
                    if (data.error) {
                        setError(data.error)
                        eventSource.close()
                        setIsLoading(false)
                        return
                    }

                    // Create a message key for deduplication
                    const messageKey = `${data.type}-${data.content}-${JSON.stringify(data.tool_calls)}`

                    // Only add if it's different from the last message
                    if (messageKey !== lastMessageRef.current) {
                        setMessages(prev => [
                            ...prev,
                            { ...data, timestamp: new Date().toISOString() },
                        ])
                        lastMessageRef.current = messageKey
                    }
                } catch (error) {
                    console.error('Error parsing message:', error)
                    setError('Error parsing server response')
                    eventSource.close()
                    setIsLoading(false)
                }
            }

            eventSource.onerror = error => {
                console.error('EventSource error:', error)
                setError('Connection error. Please try again.')
                eventSource.close()
                setIsLoading(false)
            }
        } catch (error) {
            console.error('Failed to send prompt:', error)
            setError('Failed to send prompt. Please try again.')
            setIsLoading(false)
        }
    }

    const clearLogs = () => {
        setMessages([])
        setError(null)
    }

    const getMessageColor = (type: string) => {
        switch (type.toLowerCase()) {
            case 'ai':
                return 'text-blue-500'
            case 'human':
                return 'text-green-500'
            case 'tool':
                return 'text-purple-500'
            default:
                return 'text-gray-500'
        }
    }

    return (
        <div className="container max-w-4xl py-8">
            <div className="mb-8 flex items-center justify-between">
                <h1 className="text-2xl font-bold">ReAct Agent Console</h1>
                <Button onClick={clearLogs} variant="outline">
                    Clear Logs
                </Button>
            </div>

            {error && (
                <Alert variant="destructive" className="mb-4">
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}

            {/* Messages Display */}
            <Card className="mb-4 h-[500px] overflow-y-auto p-4">
                {messages.length === 0 && !isLoading ? (
                    <div className="text-center text-muted-foreground">
                        No messages yet. Try asking about the weather!
                    </div>
                ) : (
                    messages.map((msg, idx) => (
                        <div key={idx} className="mb-4">
                            <div
                                className={`text-sm font-semibold ${getMessageColor(
                                    msg.type,
                                )}`}
                            >
                                {msg.type}{' '}
                                {msg.timestamp && (
                                    <span className="text-xs text-muted-foreground">
                                        at{' '}
                                        {new Date(
                                            msg.timestamp,
                                        ).toLocaleTimeString()}
                                    </span>
                                )}
                            </div>
                            <div className="mt-1 whitespace-pre-wrap">
                                {msg.content}
                            </div>
                            {msg.tool_calls?.map((tool, toolIdx) => (
                                <div
                                    key={toolIdx}
                                    className="mt-2 rounded-md bg-muted p-2"
                                >
                                    <div className="font-mono text-sm">
                                        <span className="font-semibold">
                                            Tool:
                                        </span>{' '}
                                        {tool.function?.name}
                                    </div>
                                    <div className="font-mono text-sm">
                                        <span className="font-semibold">
                                            Args:
                                        </span>{' '}
                                        {JSON.stringify(
                                            tool.function?.arguments,
                                            null,
                                            2,
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ))
                )}
                <div ref={messagesEndRef} />
                {isLoading && (
                    <div className="animate-pulse text-muted-foreground">
                        Thinking...
                    </div>
                )}
            </Card>

            {/* Input Form */}
            <form onSubmit={handleSubmit} className="flex gap-2">
                <Input
                    value={prompt}
                    onChange={e => setPrompt(e.target.value)}
                    placeholder="Ask about the weather..."
                    disabled={isLoading}
                    className="flex-1"
                />
                <Button type="submit" disabled={isLoading}>
                    {isLoading ? 'Processing...' : 'Send'}
                </Button>
            </form>

            {/* Example Prompts */}
            <div className="mt-4 text-sm text-muted-foreground">
                <h2 className="font-semibold">Try asking:</h2>
                <ul className="mt-2 list-disc pl-5">
                    <li>
                        &quot;What&apos;s the weather in San Francisco?&quot;
                    </li>
                    <li>
                        &quot;How does the weather in Boston compare to San
                        Francisco?&quot;
                    </li>
                    <li>&quot;Should I bring an umbrella to Boston?&quot;</li>
                </ul>
            </div>
        </div>
    )
}
