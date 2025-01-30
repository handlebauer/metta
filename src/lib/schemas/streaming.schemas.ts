export interface StreamingMessageState {
    id: string
    type: string
    content: string
    timestamp: string
    isComplete: boolean
    toolState?: {
        name: string
        description: string
        startTime: number
        isComplete: boolean
    }
}

export interface UseMessageQueueResult {
    activeMessageId: string | null
    isMessageComplete: (messageId: string) => boolean
    onMessageComplete: (messageId: string) => void
    getController: () => AbortController
}

export interface UseTextStreamOptions {
    speed?: number
    onComplete?: () => void
    paused?: boolean
}

export interface UseTextStreamResult {
    displayedText: string
    isComplete: boolean
    isPaused: boolean
    progress: number
}
