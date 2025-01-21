'use client'

import { useCallback, useOptimistic, useState, useTransition } from 'react'

import { createMessage } from '@/actions/messages'

import { MessageList } from './message-list'
import { TicketEditor } from './ticket-editor.client'

import type { MessageWithUser } from '@/lib/schemas/messages'

interface TicketConversationProps {
    ticketId: string
    user: { id: string; name: string; email: string; role?: string }
    initialMessages: MessageWithUser[]
}

export function TicketConversation({
    ticketId,
    user,
    initialMessages,
}: TicketConversationProps) {
    const [isSending, setIsSending] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [isPending, startTransition] = useTransition()

    const [optimisticMessages, addOptimisticMessage] = useOptimistic<
        MessageWithUser[],
        string
    >(initialMessages, (state, content) => [
        ...state,
        {
            id: Math.random().toString(),
            content,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            ticket_id: ticketId,
            user_id: user.id,
            role: user.role || 'customer',
            html_content: content,
            user: {
                email: user.email,
                profile: {
                    full_name: user.name,
                    avatar_url: null,
                },
            },
        } as MessageWithUser,
    ])

    const handleSend = useCallback(
        async (content: string) => {
            try {
                setIsSending(true)

                // Add optimistic update inside transition
                startTransition(() => {
                    addOptimisticMessage(content)
                })

                // Make server request
                const result = await createMessage(ticketId, content)

                if (result.error) {
                    setError(result.error)
                }
            } catch (error) {
                console.error('[TicketConversation.handleSend]', error)
                setError('Failed to send message')
            } finally {
                setIsSending(false)
            }
        },
        [ticketId, addOptimisticMessage],
    )

    return (
        <div className="flex flex-col h-full">
            {error && (
                <div className="px-6 py-4">
                    <div className="p-4 text-sm text-destructive bg-destructive/10 rounded-lg">
                        {error}
                    </div>
                </div>
            )}

            <MessageList
                messages={optimisticMessages}
                currentUserId={user.id}
            />
            <TicketEditor
                onSend={handleSend}
                isSending={isSending || isPending}
            />
        </div>
    )
}
