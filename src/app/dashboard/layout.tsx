import { redirect } from 'next/navigation'

import { Brand } from '@/components/ui/brand'
import { SidebarNav } from '@/components/dashboard/sidebar-nav.client'
import { UserNav } from '@/components/dashboard/user-nav'
import { getAuthenticatedUserWithProfile } from '@/actions/user-with-profile.actions'

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const { data: user, error } = await getAuthenticatedUserWithProfile()

    if (error || !user) {
        redirect('/login')
    }

    return (
        <div className="flex h-screen flex-col">
            {/* Top Navigation */}
            <header className="flex-none border-b">
                <div className="flex h-16 items-center gap-4 px-4 font-outfit">
                    <Brand href="/dashboard">DemoHost</Brand>
                    <div className="ml-auto flex items-center gap-4">
                        <UserNav user={user} />
                    </div>
                </div>
            </header>

            <div className="flex min-h-0 flex-1">
                {/* Sidebar Navigation */}
                <aside className="w-64 flex-none border-r bg-muted/30">
                    <nav className="flex flex-col gap-2 p-4">
                        <SidebarNav user={user} />
                    </nav>
                </aside>

                {/* Main Content */}
                <main className="flex-1 overflow-auto p-2">{children}</main>
            </div>
        </div>
    )
}
