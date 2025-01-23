'use client'

import { useEffect } from 'react'

import { Button } from '@/components/ui/button'
import {
    Card,
    CardContent,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/components/ui/card'

interface TicketsErrorBoundaryProps {
    error: Error & { digest?: string }
    reset: () => void
}

export function TicketsErrorBoundary({
    error,
    reset,
}: TicketsErrorBoundaryProps) {
    useEffect(() => {
        // Log the error to an error reporting service
        console.error('Tickets Error:', error)
    }, [error])

    return (
        <div className="container flex min-h-[400px] items-center justify-center p-4">
            <Card className="w-full max-w-md">
                <CardHeader>
                    <CardTitle>Something went wrong</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-muted-foreground">
                        {error.message ||
                            'An error occurred while loading tickets.'}
                    </p>
                    {process.env.NODE_ENV === 'development' && (
                        <p className="text-sm text-muted-foreground">
                            Did you commit recently?
                        </p>
                    )}
                </CardContent>
                <CardFooter>
                    <Button onClick={reset} variant="outline">
                        Try again
                    </Button>
                </CardFooter>
            </Card>
        </div>
    )
}
