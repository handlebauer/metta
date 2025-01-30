'use client'

import { useSSE } from '@/hooks/use-sse'

interface SSEProviderProps {
    children: React.ReactNode
}

export function SSEProvider({ children }: SSEProviderProps) {
    useSSE()
    return <>{children}</>
}
