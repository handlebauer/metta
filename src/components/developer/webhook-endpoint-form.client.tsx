'use client'

import { useEffect, useRef, useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { Plus, Trash2 } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

import { WebhookEvent } from '@/lib/schemas/webhook.schemas'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import {
    createWebhookEndpointAction,
    deleteWebhookEndpointAction,
    updateWebhookEndpointAction,
} from '@/actions/webhook.actions'

import type { WebhookEndpointRow } from '@/lib/schemas/webhook.schemas'

const webhookFormSchema = z.object({
    name: z.string().min(1, 'Name is required'),
    url: z.string().url('Must be a valid URL'),
    events: z.array(z.string()).min(1, 'Select at least one event'),
    active: z.boolean().default(true),
})

type WebhookFormValues = z.infer<typeof webhookFormSchema>

interface WebhookEndpointFormProps {
    initialWebhooks: WebhookEndpointRow[]
}

export function WebhookEndpointForm({
    initialWebhooks,
}: WebhookEndpointFormProps) {
    const formRef = useRef<HTMLFormElement>(null)
    const [endpoints, setEndpoints] =
        useState<WebhookEndpointRow[]>(initialWebhooks)
    const [isAddingEndpoint, setIsAddingEndpoint] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const form = useForm<WebhookFormValues>({
        resolver: zodResolver(webhookFormSchema),
        defaultValues: {
            active: true,
            events: [],
        },
    })

    // Auto-focus and scroll when form appears
    useEffect(() => {
        if (isAddingEndpoint) {
            // Focus first, then scroll after a delay to ensure the form is rendered
            form.setFocus('name')

            // Scroll the form into view after a short delay
            setTimeout(() => {
                formRef.current?.scrollIntoView({
                    behavior: 'smooth',
                    block: 'center',
                })
            }, 100)
        }
    }, [isAddingEndpoint, form])

    async function onSubmit(data: WebhookFormValues) {
        try {
            setIsLoading(true)
            setError(null)

            const result = await createWebhookEndpointAction(data)
            if (result.error) {
                setError(result.error)
            } else if (result.data) {
                setEndpoints(prev => [result.data, ...prev])
                setIsAddingEndpoint(false)
                form.reset()
            }
        } catch (_err) {
            setError('Failed to create webhook endpoint. Please try again.')
        } finally {
            setIsLoading(false)
        }
    }

    async function onToggleActive(id: string, active: boolean) {
        try {
            setIsLoading(true)
            setError(null)

            const result = await updateWebhookEndpointAction(id, { active })
            if (result.error) {
                setError(result.error)
            } else if (result.data) {
                setEndpoints(prev =>
                    prev.map(e => (e.id === id ? result.data : e)),
                )
            }
        } catch (_err) {
            setError('Failed to update webhook endpoint. Please try again.')
        } finally {
            setIsLoading(false)
        }
    }

    async function onDelete(id: string) {
        try {
            setIsLoading(true)
            setError(null)

            const result = await deleteWebhookEndpointAction(id)
            if (result.error) {
                setError(result.error)
            } else {
                setEndpoints(prev => prev.filter(e => e.id !== id))
            }
        } catch (_err) {
            setError('Failed to delete webhook endpoint. Please try again.')
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-end">
                <Button
                    onClick={() => setIsAddingEndpoint(true)}
                    disabled={isAddingEndpoint || isLoading}
                >
                    <Plus className="mr-2 h-4 w-4" />
                    Add Endpoint
                </Button>
            </div>

            {error && (
                <p className="text-sm text-destructive" role="alert">
                    {error}
                </p>
            )}

            {isAddingEndpoint && (
                <Form {...form}>
                    <form
                        ref={formRef}
                        onSubmit={form.handleSubmit(onSubmit)}
                        className="relative -mx-6 space-y-4 rounded-lg border bg-background p-6 shadow-lg"
                    >
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Name</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="Production Webhook"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormDescription>
                                        A descriptive name for this webhook
                                        endpoint
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="url"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Payload URL</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="https://api.example.com/webhooks/metta"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormDescription>
                                        The URL where we&apos;ll send webhook
                                        events
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="events"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Events</FormLabel>
                                    <div className="space-y-2">
                                        {Object.values(WebhookEvent.enum).map(
                                            event => (
                                                <div
                                                    key={event}
                                                    className="flex items-center space-x-2"
                                                >
                                                    <Checkbox
                                                        id={`event-${event}`}
                                                        checked={field.value?.includes(
                                                            event,
                                                        )}
                                                        onCheckedChange={(
                                                            checked: boolean,
                                                        ) => {
                                                            const events =
                                                                field.value ||
                                                                []
                                                            if (checked) {
                                                                field.onChange([
                                                                    ...events,
                                                                    event,
                                                                ])
                                                            } else {
                                                                field.onChange(
                                                                    events.filter(
                                                                        e =>
                                                                            e !==
                                                                            event,
                                                                    ),
                                                                )
                                                            }
                                                        }}
                                                    />
                                                    <label
                                                        htmlFor={`event-${event}`}
                                                        className="cursor-pointer select-none text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                                    >
                                                        {event
                                                            .split('.')
                                                            .map(
                                                                word =>
                                                                    word
                                                                        .charAt(
                                                                            0,
                                                                        )
                                                                        .toUpperCase() +
                                                                    word.slice(
                                                                        1,
                                                                    ),
                                                            )
                                                            .join(' ')}
                                                    </label>
                                                </div>
                                            ),
                                        )}
                                    </div>
                                    <FormDescription>
                                        Choose which events will trigger this
                                        webhook
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="active"
                            render={({ field }) => (
                                <FormItem className="flex items-center justify-between rounded-lg border p-4">
                                    <div className="space-y-0.5">
                                        <FormLabel>Active</FormLabel>
                                        <FormDescription>
                                            Receive events for this webhook
                                            endpoint
                                        </FormDescription>
                                    </div>
                                    <FormControl>
                                        <Switch
                                            checked={field.value}
                                            onCheckedChange={field.onChange}
                                        />
                                    </FormControl>
                                </FormItem>
                            )}
                        />

                        <div className="flex justify-end space-x-4">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => {
                                    setIsAddingEndpoint(false)
                                    form.reset()
                                }}
                                disabled={isLoading}
                            >
                                Cancel
                            </Button>
                            <Button type="submit" disabled={isLoading}>
                                Save Endpoint
                            </Button>
                        </div>
                    </form>
                </Form>
            )}

            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>NAME</TableHead>
                            <TableHead>URL</TableHead>
                            <TableHead>EVENTS</TableHead>
                            <TableHead>STATUS</TableHead>
                            <TableHead className="w-[100px]"></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {!endpoints.length ? (
                            <TableRow>
                                <TableCell
                                    colSpan={5}
                                    className="h-24 text-center"
                                >
                                    No webhook endpoints configured
                                </TableCell>
                            </TableRow>
                        ) : (
                            endpoints.map(endpoint => (
                                <TableRow key={endpoint.id}>
                                    <TableCell>{endpoint.name}</TableCell>
                                    <TableCell className="font-mono">
                                        {endpoint.url}
                                    </TableCell>
                                    <TableCell>
                                        {endpoint.events
                                            .map(event =>
                                                event
                                                    .split('.')
                                                    .map(
                                                        word =>
                                                            word
                                                                .charAt(0)
                                                                .toUpperCase() +
                                                            word.slice(1),
                                                    )
                                                    .join(' '),
                                            )
                                            .join(', ')}
                                    </TableCell>
                                    <TableCell>
                                        <Switch
                                            checked={endpoint.active}
                                            onCheckedChange={active =>
                                                onToggleActive(
                                                    endpoint.id,
                                                    active,
                                                )
                                            }
                                            disabled={isLoading}
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="h-8 w-8 p-0"
                                            onClick={() =>
                                                onDelete(endpoint.id)
                                            }
                                            disabled={isLoading}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}
