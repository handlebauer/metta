'use client'

import { Suspense } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'

import { Button } from '@/components/ui/button'

function NotFoundContent() {
    const searchParams = useSearchParams()
    const from = searchParams.get('from')

    return (
        <div className="flex h-screen flex-col items-center justify-center">
            <div className="space-y-4 text-center">
                <h1 className="text-4xl font-bold tracking-tight">
                    Page Not Found
                </h1>
                <p className="text-lg text-muted-foreground">
                    The page you&apos;re looking for doesn&apos;t exist.
                </p>
                <Button asChild>
                    <Link href={from || '/'}>
                        {from ? 'Go Back' : 'Return Home'}
                    </Link>
                </Button>
            </div>
        </div>
    )
}

export default function NotFound() {
    return (
        <Suspense>
            <NotFoundContent />
        </Suspense>
    )
}
