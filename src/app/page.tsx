import Link from 'next/link'

import { Brand } from '@/components/ui/brand'
import { UserNav } from '@/components/dashboard/user-nav'
import { createClient } from '@/lib/supabase/server'

export default async function HomePage() {
    const supabase = await createClient()
    const {
        data: { user },
    } = await supabase.auth.getUser()

    return (
        <div className="h-screen flex flex-col">
            <header className="border-b flex-none">
                <div className="flex h-16 items-center px-4 gap-4">
                    <Brand>Metta</Brand>
                    <div className="ml-auto flex items-center gap-4">
                        {user ? (
                            <UserNav user={user} />
                        ) : (
                            <Link
                                href="/login"
                                className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
                            >
                                Login
                            </Link>
                        )}
                    </div>
                </div>
            </header>

            <main className="flex-1 flex flex-col items-center justify-center p-4">
                <div className="max-w-2xl text-center space-y-4">
                    <h1 className="text-4xl font-bold">Welcome to Metta</h1>
                    <p className="text-muted-foreground text-lg">
                        AI-powered Customer Relationship Management system
                        designed to minimize manual support workload
                    </p>
                </div>
            </main>
        </div>
    )
}
