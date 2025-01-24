import { Plus } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import { CreateApiKeyDialog } from '@/components/developer/create-api-key-dialog.client'
import { ApiKeyTableRow } from '@/components/developer/key-table-row.client'
import { WebhookEndpointForm } from '@/components/developer/webhook-endpoint-form.client'
import {
    getDecryptedApiKeyAction,
    listApiKeysAction,
} from '@/actions/api-key.actions'
import { listWebhookEndpointsAction } from '@/actions/webhook.actions'

export default async function DeveloperSettingsPage() {
    const { data: apiKeys, error: apiKeyError } = await listApiKeysAction()
    const { data: webhooks, error: webhookError } =
        await listWebhookEndpointsAction()

    // Pre-fetch decrypted keys for active keys
    const decryptedKeys = new Map<string, string>()
    if (apiKeys) {
        await Promise.all(
            apiKeys
                .filter(key => key.status === 'active')
                .map(async key => {
                    const result = await getDecryptedApiKeyAction(key.id)
                    if (result.data?.key) {
                        decryptedKeys.set(key.id, result.data.key)
                    }
                }),
        )
    }

    return (
        <div className="container mx-auto space-y-8 py-6">
            <div>
                <h1 className="text-2xl font-semibold tracking-tight">
                    Developer Settings
                </h1>
                <p className="text-muted-foreground">
                    Manage your API keys and developer resources
                </p>
            </div>

            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle>API Keys</CardTitle>
                            <CardDescription>
                                Manage your API keys for webhook integrations
                            </CardDescription>
                        </div>
                        <CreateApiKeyDialog>
                            <Button>
                                <Plus className="mr-2 h-4 w-4" />
                                Generate New Key
                            </Button>
                        </CreateApiKeyDialog>
                    </div>
                </CardHeader>
                <CardContent>
                    {apiKeyError ? (
                        <p className="text-sm text-destructive">
                            {apiKeyError}
                        </p>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>NAME</TableHead>
                                    <TableHead>USAGE</TableHead>
                                    <TableHead>KEY</TableHead>
                                    <TableHead className="text-right">
                                        OPTIONS
                                    </TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {!apiKeys?.length ? (
                                    <TableRow>
                                        <TableCell
                                            colSpan={4}
                                            className="text-center italic text-muted-foreground"
                                        >
                                            No API keys generated yet
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    apiKeys.map(key => (
                                        <ApiKeyTableRow
                                            key={key.id}
                                            apiKey={key}
                                            decryptedKey={decryptedKeys.get(
                                                key.id,
                                            )}
                                        />
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Webhook Settings</CardTitle>
                    <CardDescription>
                        <p>
                            Configure webhook endpoints to receive real-time
                            notifications for ticket events and other CRM
                            updates.
                        </p>
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {webhookError ? (
                        <p className="text-sm text-destructive">
                            {webhookError}
                        </p>
                    ) : (
                        <WebhookEndpointForm initialWebhooks={webhooks || []} />
                    )}
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>API Documentation</CardTitle>
                    <CardDescription>
                        Access API documentation and resources
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-muted-foreground">
                        API documentation will be available soon.
                    </p>
                </CardContent>
            </Card>
        </div>
    )
}
