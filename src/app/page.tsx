import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { UserNav } from '@/components/dashboard/user-nav'
import { Brand } from '@/components/ui/brand'

export default async function HomePage() {
    const supabase = await createClient()
    const {
        data: { user },
    } = await supabase.auth.getUser()

    return (
        <main className="flex min-h-screen flex-col p-6">
            <nav className="flex justify-between items-center w-full">
                <Brand>My App</Brand>
                <div>
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
            </nav>
            <div className="flex-1 flex flex-col items-center justify-center space-y-6">
                <h2 className="text-4xl font-bold">Welcome to My App</h2>
                <p className="text-muted-foreground">
                    Get started by logging in
                </p>
            </div>
        </main>
    )
}
