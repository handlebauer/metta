import { redirect } from 'next/navigation'

import { Brand } from '@/components/ui/brand'
import { SidebarNav } from '@/components/dashboard/sidebar-nav.client'
import { UserNav } from '@/components/dashboard/user-nav'
import { createClient } from '@/lib/supabase/server'
import { getProfile } from '@/actions/user.actions'

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const supabase = await createClient()
    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    // Get user profile to check role
    const { data: profile } = await getProfile(user.id)

    if (!profile) {
        throw new Error('User profile not found')
    }

    return (
        <div className="h-screen flex flex-col">
            {/* Top Navigation */}
            <header className="border-b flex-none">
                <div className="flex h-16 items-center px-4 gap-4">
                    <Brand href="/dashboard">metta</Brand>
                    <div className="ml-auto flex items-center gap-4">
                        <UserNav user={user} />
                    </div>
                </div>
            </header>

            <div className="flex-1 flex min-h-0">
                {/* Sidebar Navigation */}
                <aside className="w-64 border-r bg-muted/30 flex-none">
                    <nav className="flex flex-col gap-2 p-4">
                        <SidebarNav userRole={profile.role} />
                    </nav>
                </aside>

                {/* Main Content */}
                <main className="flex-1 overflow-auto p-2">{children}</main>
            </div>
        </div>
    )
}
