'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'

import { Button } from '@/components/ui/button'
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { ticketInsertSchema } from '@/lib/schemas/tickets'
import { createTicket } from '@/actions/tickets'

import type { UserRow } from '@/lib/schemas/user'

interface NewTicketFormProps {
    customerId: string
    userRole: 'customer' | 'agent'
    users: (UserRow & {
        profile: { full_name: string | null; role: 'customer' | 'agent' }
    })[]
}

type FormData = z.infer<typeof ticketInsertSchema>

export function NewTicketForm({
    customerId,
    userRole,
    users,
}: NewTicketFormProps) {
    const router = useRouter()
    const [isSubmitting, setIsSubmitting] = useState(false)

    const form = useForm<FormData>({
        resolver: zodResolver(ticketInsertSchema),
        defaultValues: {
            subject: '',
            description: '',
            customer_id: userRole === 'customer' ? customerId : '',
        },
    })

    async function onSubmit(data: FormData) {
        try {
            setIsSubmitting(true)
            const result = await createTicket(data)

            if (result.error) {
                toast.error(result.error)
                return
            }

            toast.success('Ticket created successfully')
            router.push('/dashboard/tickets')
        } catch (error) {
            toast.error('Something went wrong')
            console.error(error)
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {userRole === 'agent' && (
                    <FormField
                        control={form.control}
                        name="customer_id"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>User</FormLabel>
                                <Select
                                    onValueChange={field.onChange}
                                    defaultValue={field.value}
                                >
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select a user" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {users
                                            .sort(
                                                (a, b) =>
                                                    (a.profile.role ===
                                                    'customer'
                                                        ? -1
                                                        : 1) -
                                                    (b.profile.role ===
                                                    'customer'
                                                        ? -1
                                                        : 1),
                                            )
                                            .map(user => (
                                                <SelectItem
                                                    key={user.id}
                                                    value={user.id}
                                                >
                                                    {user.profile.full_name ||
                                                        user.email}{' '}
                                                    ({user.profile.role})
                                                </SelectItem>
                                            ))}
                                    </SelectContent>
                                </Select>
                                <FormDescription>
                                    Select the user this ticket is for
                                </FormDescription>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                )}

                <FormField
                    control={form.control}
                    name="subject"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Subject</FormLabel>
                            <FormControl>
                                <Input
                                    placeholder="Brief description of your issue"
                                    {...field}
                                />
                            </FormControl>
                            <FormDescription>
                                Keep it short and descriptive
                            </FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Description</FormLabel>
                            <FormControl>
                                <Textarea
                                    placeholder="Provide detailed information about your issue"
                                    className="min-h-[150px] resize-y"
                                    {...field}
                                />
                            </FormControl>
                            <FormDescription>
                                Include any relevant details that might help us
                                assist you
                            </FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <div className="flex justify-end gap-4">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => router.back()}
                        disabled={isSubmitting}
                    >
                        Cancel
                    </Button>
                    <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting ? 'Creating...' : 'Create Ticket'}
                    </Button>
                </div>
            </form>
        </Form>
    )
}
