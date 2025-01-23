import { useMemo } from 'react'

import { cn } from '@/lib/utils'
import { formatTimeAgo } from '@/lib/utils/dates'

import type { MessageWithUser } from '@/lib/schemas/message.schemas'

interface MessageItemProps {
    message: MessageWithUser
    currentUserId: string
}

export function MessageItem({ message, currentUserId }: MessageItemProps) {
    const formattedTime = useMemo(
        () => formatTimeAgo(message.created_at),
        [message.created_at],
    )

    const isCurrentUser = message.user_id === currentUserId
    const messageClass = cn(
        'flex flex-col space-y-2 p-4 rounded-lg',
        isCurrentUser ? 'bg-primary/10 ml-16' : 'bg-accent mr-16',
    )

    return (
        <div className={messageClass}>
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                    <span className="text-sm font-bold">
                        {message.user.profile?.full_name || message.user.email}
                    </span>
                    <span className="text-xs text-muted-foreground">
                        {message.role}
                    </span>
                </div>
                <span className="text-xs text-muted-foreground">
                    {formattedTime}
                </span>
            </div>
            <p className="whitespace-pre-wrap text-sm">{message.content}</p>
        </div>
    )
}
