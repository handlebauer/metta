import { IBM_Plex_Mono, Inter, Outfit } from 'next/font/google'
import { DevModeButton } from '@/components/dev-mode-button.client'

import { cn } from '@/lib/utils'
import { Toaster } from '@/components/ui/toaster'

import './globals.css'

import type { Metadata } from 'next'

const outfit = Outfit({
    subsets: ['latin'],
    variable: '--font-outfit',
})

const inter = Inter({
    subsets: ['latin'],
    variable: '--font-inter',
})

const ibmPlexMono = IBM_Plex_Mono({
    subsets: ['latin'],
    weight: ['400', '500'],
    variable: '--font-ibm-plex-mono',
})

export const metadata: Metadata = {
    title: 'Metta',
    description:
        'Metta is an AI-powered Customer Relationship Management system designed to minimize manual support workload by leveraging generative AI to handle customer interactions and support tickets ',
}

export default function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <html lang="en" suppressHydrationWarning>
            <head />
            <body
                className={cn(
                    'min-h-screen bg-background font-inter antialiased',
                    outfit.variable,
                    inter.variable,
                    ibmPlexMono.variable,
                )}
            >
                {children}
                <Toaster />
                {process.env.NODE_ENV === 'development' && <DevModeButton />}
            </body>
        </html>
    )
}
