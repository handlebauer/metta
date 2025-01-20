import { createClient } from '@/lib/supabase/server'
import { UserNav } from '@/components/dashboard/user-nav'
import { Brand } from '@/components/ui/brand'
import { redirect } from 'next/navigation'

export default async function DashboardPage() {
    const supabase = await createClient()
    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    return (
        <main className="flex min-h-screen flex-col p-6">
            <nav className="flex justify-between items-center w-full">
                <Brand href="/dashboard">My App</Brand>
                <UserNav user={user} />
            </nav>
            <div className="flex-1 flex flex-col items-center justify-center space-y-6">
                <h2 className="text-4xl font-bold">
                    Welcome to your Dashboard
                </h2>
                <p className="text-muted-foreground">
                    You are signed in as {user.email}
                </p>
            </div>
        </main>
    )
}
