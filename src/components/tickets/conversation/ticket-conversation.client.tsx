'use client'

import { useCallback, useOptimistic, useState, useTransition } from 'react'

import { createMessage } from '@/actions/message.actions'

import { MessageList } from './message-list'
import { TicketEditor } from './ticket-editor.client'

import type { MessageWithUser } from '@/lib/schemas/message.schemas'
import type { UserWithProfile } from '@/lib/schemas/user-with-profile.schemas'

interface TicketConversationProps {
    ticketId: string
    user: UserWithProfile
    initialMessages: MessageWithUser[]
    status?: 'new' | 'open' | 'closed'
}

export function TicketConversation({
    ticketId,
    user,
    initialMessages,
    status = 'new',
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
            role: user.profile.role,
            html_content: content,
            user: {
                email: user.email,
                profile: {
                    full_name: user.profile.full_name,
                    avatar_url: user.profile.avatar_url,
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
        <div className="flex h-full flex-col">
            {error && (
                <div className="px-6 py-4">
                    <div className="rounded-lg bg-destructive/10 p-4 text-sm text-destructive">
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
                disabled={status === 'new' || status === 'closed'}
            />
        </div>
    )
}
