import { useCallback, useState } from 'react'

import type { StreamingMessageState } from '@/lib/schemas/streaming.schemas'

export function useMessageQueue(messages: StreamingMessageState[]) {
    const [activeId, setActiveId] = useState<string | null>(null)
    const [completed] = useState(new Set<string>())

    const onMessageComplete = useCallback(
        (messageId: string) => {
            completed.add(messageId)
            // Find next message that isn't completed
            const nextMessage = messages.find(
                msg => !completed.has(msg.id) && msg.id !== messageId,
            )
            setActiveId(nextMessage?.id || null)
        },
        [messages, completed],
    )

    // Set first message as active if nothing is active
    if (!activeId && messages.length > 0) {
        const firstIncomplete = messages.find(msg => !completed.has(msg.id))
        if (firstIncomplete) {
            setActiveId(firstIncomplete.id)
        }
    }

    return {
        activeMessageId: activeId,
        isMessageComplete: useCallback(
            (messageId: string) => completed.has(messageId),
            [completed],
        ),
        onMessageComplete,
    }
}
