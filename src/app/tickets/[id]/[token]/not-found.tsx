import Link from 'next/link'

import { Button } from '@/components/ui/button'

export default function TicketNotFound() {
    return (
        <div className="flex h-screen flex-col items-center justify-center">
            <div className="space-y-4 text-center">
                <h1 className="text-4xl font-bold tracking-tight">
                    Ticket Not Found
                </h1>
                <p className="text-lg text-muted-foreground">
                    The ticket you&apos;re looking for doesn&apos;t exist or
                    your access link has expired.
                </p>
                <Button asChild>
                    <Link href="/">Return Home</Link>
                </Button>
            </div>
        </div>
    )
}
