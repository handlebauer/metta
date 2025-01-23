import { useEffect, useLayoutEffect, useRef, useState } from 'react'

import { cn } from '@/lib/utils'

import { MessageItem } from './message-item'

import type { MessageWithUser } from '@/lib/schemas/message.schemas'

interface MessageListProps {
    messages: MessageWithUser[]
    currentUserId: string
}

export function MessageList({ messages, currentUserId }: MessageListProps) {
    const scrollRef = useRef<HTMLDivElement>(null)
    const isFirstRender = useRef(true)
    const [isVisible, setIsVisible] = useState(false)
    const [showScrollbar, setShowScrollbar] = useState(false)

    // Initial scroll on mount (before paint)
    useLayoutEffect(() => {
        if (isFirstRender.current && scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight
            isFirstRender.current = false
            // Show messages after scroll position is set
            requestAnimationFrame(() => {
                setShowScrollbar(true)
                // Wait a frame to ensure scrollbar is rendered before fading in
                requestAnimationFrame(() => {
                    setIsVisible(true)
                })
            })
        }
    }, [])

    // Scroll on new messages
    useEffect(() => {
        if (!isFirstRender.current && scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight
        }
    }, [messages])

    return (
        <div
            ref={scrollRef}
            className={cn(
                'flex-1',
                showScrollbar ? 'overflow-y-auto' : 'overflow-hidden',
            )}
        >
            <div
                className={cn(
                    'space-y-4 px-6 py-4 transition-opacity duration-200',
                    isVisible ? 'opacity-100' : 'opacity-0',
                )}
            >
                {messages.length === 0 ? (
                    <div className="py-8 text-center text-muted-foreground">
                        No messages yet
                    </div>
                ) : (
                    messages.map(message => (
                        <MessageItem
                            key={message.id}
                            message={message}
                            currentUserId={currentUserId}
                        />
                    ))
                )}
            </div>
        </div>
    )
}
