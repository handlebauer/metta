import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'

export default function GeneralSettingsPage() {
    return (
        <div className="container mx-auto space-y-8 py-6">
            <div>
                <h1 className="text-2xl font-semibold tracking-tight">
                    General Settings
                </h1>
                <p className="text-muted-foreground">
                    Manage your general application preferences
                </p>
            </div>

            <div className="grid gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Notifications</CardTitle>
                        <CardDescription>
                            Configure how you receive notifications
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-between">
                            <Label htmlFor="email-notifications">
                                Email Notifications
                            </Label>
                            <Switch id="email-notifications" disabled />
                        </div>
                        <div className="flex items-center justify-between">
                            <Label htmlFor="browser-notifications">
                                Browser Notifications
                            </Label>
                            <Switch id="browser-notifications" disabled />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Display</CardTitle>
                        <CardDescription>
                            Customize your viewing experience
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-between">
                            <Label htmlFor="dark-mode">Dark Mode</Label>
                            <Switch id="dark-mode" disabled />
                        </div>
                        <div className="flex items-center justify-between">
                            <Label htmlFor="compact-view">Compact View</Label>
                            <Switch id="compact-view" disabled />
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
