import Link from 'next/link'

import { Button } from '@/components/ui/button'

export default function TicketNotFound() {
    return (
        <div className="flex h-[calc(100vh-65px)] flex-col items-center justify-center gap-6">
            <div className="space-y-2 text-center">
                <h1 className="text-4xl font-bold tracking-tighter">
                    Ticket Not Found
                </h1>
                <p className="text-lg text-muted-foreground">
                    The ticket you&apos;re looking for doesn&apos;t exist or has
                    been deleted.
                </p>
            </div>
            <Button asChild>
                <Link href="/dashboard/tickets">Return to Tickets</Link>
            </Button>
        </div>
    )
}
