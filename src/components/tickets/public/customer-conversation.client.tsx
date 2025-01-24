'use client'

import { useCallback, useOptimistic, useState, useTransition } from 'react'

import { createMessage } from '@/actions/message.actions'

import { MessageList } from '../conversation/message-list'
import { TicketEditor } from '../conversation/ticket-editor.client'

import type { MessageWithUser } from '@/lib/schemas/message.schemas'

interface CustomerConversationProps {
    ticketId: string
    customer: {
        id: string
        email: string
        full_name: string | null
    }
    initialMessages: MessageWithUser[]
    status?: 'new' | 'open' | 'closed'
    token: string
}

export function CustomerConversation({
    ticketId,
    customer,
    initialMessages,
    status = 'new',
    token,
}: CustomerConversationProps) {
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
            user_id: customer.id,
            role: 'customer',
            html_content: content,
            user: {
                email: customer.email,
                profile: {
                    full_name: customer.full_name || 'Unknown Customer',
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

                // Make server request with customer ID for token-based access
                const result = await createMessage(
                    ticketId,
                    content,
                    customer.id,
                    token,
                )

                if (result.error) {
                    setError(result.error)
                }
            } catch (error) {
                console.error('[CustomerConversation.handleSend]', error)
                setError('Failed to send message')
            } finally {
                setIsSending(false)
            }
        },
        [ticketId, addOptimisticMessage, customer.id, token],
    )

    return (
        <div className="flex h-full flex-col">
            {error && (
                <div className="flex-none px-6 py-4">
                    <div className="rounded-lg bg-destructive/10 p-4 text-sm text-destructive">
                        {error}
                    </div>
                </div>
            )}

            <MessageList
                messages={optimisticMessages}
                currentUserId={customer.id}
            />
            <div className="flex-none px-6 pb-4">
                <TicketEditor
                    onSend={handleSend}
                    isSending={isSending || isPending}
                    disabled={status === 'closed'}
                />
            </div>
        </div>
    )
}
