import { Geist_Mono, Inter, Outfit } from 'next/font/google'

import { Toaster } from '@/components/ui/toaster'

import type { Metadata } from 'next'

import './globals.css'

const outfit = Outfit({
    subsets: ['latin'],
    variable: '--font-outfit',
})

const inter = Inter({
    subsets: ['latin'],
    variable: '--font-inter',
})

const geistMono = Geist_Mono({
    variable: '--font-geist-mono',
    subsets: ['latin'],
})

export const metadata: Metadata = {
    title: 'Metta',
    description:
        'Metta is an AI-powered Customer Relationship Management system designed to minimize manual support workload by leveraging generative AI to handle customer interactions and support tickets ',
}

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode
}>) {
    return (
        <html lang="en">
            <body
                className={`${outfit.variable} ${geistMono.variable} ${inter.variable} font-inter antialiased`}
            >
                {children}
                <Toaster />
            </body>
        </html>
    )
}
