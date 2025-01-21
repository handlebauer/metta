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
        <div className="min-h-screen flex flex-col bg-white">
            <header className="border-b">
                <nav className="container mx-auto px-4 h-16 flex items-center justify-between">
                    <Link
                        href="/"
                        className="font-bold text-xl hover:text-blue-600"
                    >
                        DemoHost
                    </Link>
                    <div className="space-x-6">
                        <Link
                            href="/"
                            className="hover:text-blue-600 font-medium"
                        >
                            Home
                        </Link>
                        <Link
                            href="/support"
                            className="hover:text-blue-600 font-medium"
                        >
                            Support
                        </Link>
                    </div>
                </nav>
            </header>
            <main className="flex-grow">{children}</main>
            <footer className="bg-gray-50 border-t mt-20">
                <div className="container mx-auto px-4 py-8">
                    <div className="text-center text-gray-600">
                        <p>© 2024 DemoHost. All rights reserved.</p>
                    </div>
                </div>
            </footer>
        </div>
    )
}
