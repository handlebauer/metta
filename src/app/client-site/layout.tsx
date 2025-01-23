import Link from 'next/link'

import type { Metadata } from 'next'
// Import styles at root level
import '../globals.css'

export const metadata: Metadata = {
    title: 'DemoHost - Premium Hosting Solutions',
    description: 'High-performance hosting solutions for demanding users',
}

interface LayoutProps {
    children: React.ReactNode
}

export default function Layout({ children }: LayoutProps) {
    return (
        <div className="flex min-h-screen flex-col bg-white">
            <header className="border-b">
                <nav className="container mx-auto flex h-16 items-center justify-between px-4">
                    <Link
                        href="/"
                        className="text-xl font-bold hover:text-blue-600"
                    >
                        DemoHost
                    </Link>
                    <div className="space-x-6">
                        <Link
                            href="/"
                            className="font-medium hover:text-blue-600"
                        >
                            Home
                        </Link>
                        <Link
                            href="/support"
                            className="font-medium hover:text-blue-600"
                        >
                            Support
                        </Link>
                    </div>
                </nav>
            </header>
            <main className="flex-grow">{children}</main>
            <footer className="mt-20 border-t bg-gray-50">
                <div className="container mx-auto px-4 py-8">
                    <div className="text-center text-gray-600">
                        <p>© 2024 DemoHost. All rights reserved.</p>
                    </div>
                </div>
            </footer>
        </div>
    )
}
