'use client'

import { Button } from '@/components/ui/button'
import { showTestIncidentNotification } from '@/hooks/use-incident-listener'

export default function NotificationsTestPage() {
    return (
        <div className="container mx-auto p-8">
            <h1 className="mb-8 text-2xl font-semibold">
                Notification Testing
            </h1>

            <div className="space-y-4">
                <div className="rounded-lg border p-4">
                    <h2 className="mb-4 text-lg font-medium">
                        Incident Notifications
                    </h2>
                    <Button
                        variant="default"
                        onClick={() => showTestIncidentNotification()}
                    >
                        Show Test Incident
                    </Button>
                </div>
            </div>
        </div>
    )
}
