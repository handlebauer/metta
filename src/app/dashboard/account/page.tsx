import { redirect } from 'next/navigation'

import { createClient } from '@/lib/supabase/server'
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card'
import { DeleteAccount } from '@/components/dashboard/delete-account.client'

export default async function AccountPage() {
    const supabase = await createClient()

    // Get current user
    const {
        data: { user: authUser },
    } = await supabase.auth.getUser()

    if (!authUser) {
        redirect('/login')
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold">Account</h1>
                <p className="text-muted-foreground">
                    Manage your account settings
                </p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Delete Account</CardTitle>
                    <CardDescription>
                        Permanently delete your account and all associated data
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <DeleteAccount />
                </CardContent>
            </Card>
        </div>
    )
}
