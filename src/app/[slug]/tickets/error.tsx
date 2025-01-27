'use client'

import { TicketsErrorBoundary } from '@/components/tickets/tickets-error-boundary'

export default function TicketsError({
    error,
    reset,
}: {
    error: Error & { digest?: string }
    reset: () => void
}) {
    return <TicketsErrorBoundary error={error} reset={reset} />
}
