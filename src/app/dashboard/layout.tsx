import { createClient } from '@/lib/supabase/server'
import { UserNav } from '@/components/dashboard/user-nav'
import { Brand } from '@/components/ui/brand'
import { redirect } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { PlusCircle, Inbox, Clock, CheckCircle2 } from 'lucide-react'
import Link from 'next/link'

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

    return (
        <div className="flex min-h-screen flex-col">
            {/* Top Navigation */}
            <header className="border-b">
                <div className="flex h-16 items-center px-4 gap-4">
                    <Brand href="/dashboard">Metta</Brand>
                    <div className="ml-auto flex items-center gap-4">
                        <UserNav user={user} />
                    </div>
                </div>
            </header>

            <div className="flex-1 flex">
                {/* Sidebar Navigation */}
                <aside className="w-64 border-r bg-muted/30">
                    <nav className="flex flex-col gap-2 p-4">
                        <Button
                            asChild
                            variant="ghost"
                            className="justify-start"
                        >
                            <Link href="/dashboard/tickets/new">
                                <PlusCircle className="mr-2 h-4 w-4" />
                                New Ticket
                            </Link>
                        </Button>
                        <Button
                            asChild
                            variant="ghost"
                            className="justify-start"
                        >
                            <Link href="/dashboard/tickets">
                                <Inbox className="mr-2 h-4 w-4" />
                                All Tickets
                            </Link>
                        </Button>
                        <Button
                            asChild
                            variant="ghost"
                            className="justify-start"
                        >
                            <Link href="/dashboard/tickets?status=open">
                                <Clock className="mr-2 h-4 w-4" />
                                Open Tickets
                            </Link>
                        </Button>
                        <Button
                            asChild
                            variant="ghost"
                            className="justify-start"
                        >
                            <Link href="/dashboard/tickets?status=closed">
                                <CheckCircle2 className="mr-2 h-4 w-4" />
                                Closed Tickets
                            </Link>
                        </Button>
                    </nav>
                </aside>

                {/* Main Content */}
                <main className="flex-1">{children}</main>
            </div>
        </div>
    )
}
