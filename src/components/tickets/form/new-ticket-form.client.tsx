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
import {
    ticketInsertSchema,
    ticketPriorityEnum,
} from '@/lib/schemas/ticket.schemas'
import { createTicket } from '@/actions/ticket.actions'

import type { UserRow } from '@/lib/schemas/user.schemas'

interface NewTicketFormProps {
    /**
     * The ID of the current user (can be either a customer or an agent)
     * - For customers: This ID will be used as the customer_id
     * - For agents: This ID will be used to identify "Assign to me" in the assignee dropdown
     */
    customerId: string
    /**
     * The role of the current user
     * - 'customer': Shows a simplified form without requester/assignee fields
     * - 'agent': Shows full form with ability to select requester and assignee
     */
    userRole: 'customer' | 'agent'
    /**
     * List of all users (both customers and agents)
     * Used to populate the requester and assignee dropdowns when the current user is an agent
     */
    users: (UserRow & {
        profile: { full_name: string | null; role: 'customer' | 'agent' }
    })[]
    /**
     * The complete current user object including profile data
     */
    currentUser: UserRow & {
        profile: { full_name: string | null; role: 'customer' | 'agent' }
    }
}

type FormData = z.infer<typeof ticketInsertSchema>

export function NewTicketForm({
    customerId, // Despite the name, this is the current user's ID (either customer or agent)
    userRole,
    users,
    currentUser,
}: NewTicketFormProps) {
    const router = useRouter()
    const [isSubmitting, setIsSubmitting] = useState(false)

    const form = useForm<FormData>({
        resolver: zodResolver(ticketInsertSchema),
        defaultValues: {
            subject: '',
            description: '',
            priority: 'medium',
            // If current user is a customer, they can only create tickets for themselves
            // If current user is an agent, they need to select a customer
            customer_id: userRole === 'customer' ? customerId : '',
            agent_id: null,
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

    // Filter and sort agents - current agent first, then alphabetically
    const agents = users
        .filter(user => user.profile.role === 'agent')
        .sort((a, b) => {
            // Current agent (customerId) should be first in the list
            if (a.id === customerId) return -1
            if (b.id === customerId) return 1
            return (a.profile.full_name || a.email).localeCompare(
                b.profile.full_name || b.email,
            )
        })

    const priorities = ticketPriorityEnum.options

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                {/* Agent-only fields */}
                {userRole === 'agent' && (
                    <div className="grid grid-cols-2 gap-4">
                        <FormField
                            control={form.control}
                            name="customer_id"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Requester</FormLabel>
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
                                                .filter(
                                                    user =>
                                                        user.profile.role ===
                                                        'customer',
                                                )
                                                .map(user => (
                                                    <SelectItem
                                                        key={user.id}
                                                        value={user.id}
                                                    >
                                                        {user.profile
                                                            .full_name ||
                                                            user.email}
                                                    </SelectItem>
                                                ))}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="agent_id"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Assignee</FormLabel>
                                    <Select
                                        onValueChange={val =>
                                            field.onChange(
                                                val === 'unassigned'
                                                    ? null
                                                    : val,
                                            )
                                        }
                                        value={field.value ?? 'unassigned'}
                                    >
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select an agent" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem
                                                value="unassigned"
                                                className="text-muted-foreground"
                                            >
                                                Leave unassigned
                                            </SelectItem>
                                            <SelectItem value={customerId}>
                                                {currentUser.profile
                                                    .full_name ||
                                                    currentUser.email}{' '}
                                                (me)
                                            </SelectItem>
                                            {agents
                                                .filter(
                                                    a => a.id !== customerId,
                                                )
                                                .map(agent => (
                                                    <SelectItem
                                                        key={agent.id}
                                                        value={agent.id}
                                                    >
                                                        {agent.profile
                                                            .full_name ||
                                                            'Other agent'}
                                                    </SelectItem>
                                                ))}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                )}

                {/* Main ticket fields */}
                <div className="grid grid-cols-[1fr,auto] gap-4">
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
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="priority"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Priority</FormLabel>
                                <Select
                                    onValueChange={field.onChange}
                                    defaultValue={field.value}
                                >
                                    <FormControl>
                                        <SelectTrigger className="w-[120px]">
                                            <SelectValue placeholder="Priority" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {priorities.map(priority => (
                                            <SelectItem
                                                key={priority}
                                                value={priority}
                                            >
                                                {priority
                                                    .charAt(0)
                                                    .toUpperCase() +
                                                    priority.slice(1)}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Description</FormLabel>
                            <FormControl>
                                <Textarea
                                    placeholder="Provide detailed information about your issue"
                                    className="min-h-[120px] resize-y"
                                    {...field}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <div className="flex justify-end gap-4 pt-2">
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
