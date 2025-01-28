import Image from 'next/image'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { Building2 } from 'lucide-react'

import { Card, CardContent } from '@/components/ui/card'
import { listUserWorkspaces } from '@/actions/workspace.actions'

export default async function WorkspacesPage() {
    const { data: workspaces, error } = await listUserWorkspaces()

    if (error) {
        redirect('/login')
    }

    if (!workspaces?.length) {
        redirect('/onboarding')
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold">Workspaces</h1>
                <p className="text-muted-foreground">
                    Select a workspace to manage
                </p>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {workspaces.map(workspace => (
                    <Link key={workspace.id} href={`/${workspace.slug}`}>
                        <Card className="transition-colors hover:bg-muted/50">
                            <CardContent className="flex items-center gap-4 p-6">
                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md border bg-background">
                                    {workspace.logo_url ? (
                                        <Image
                                            src={workspace.logo_url}
                                            alt={workspace.name}
                                            width={24}
                                            height={24}
                                            className="rounded"
                                            unoptimized
                                        />
                                    ) : (
                                        <Building2 className="h-5 w-5 text-muted-foreground" />
                                    )}
                                </div>
                                <div>
                                    <h2 className="font-semibold">
                                        {workspace.name}
                                    </h2>
                                    <p className="text-sm text-muted-foreground">
                                        {workspace.slug}
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    </Link>
                ))}
            </div>
        </div>
    )
}
