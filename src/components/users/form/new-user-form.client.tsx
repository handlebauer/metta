'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2, ShieldAlert, ShieldCheck, User } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'

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
import { Textarea } from '@/components/ui/textarea'
import { userWithProfileInsertSchema } from '@/lib/schemas/user-with-profile.schemas'
import { createUserWithProfile } from '@/actions/user-with-profile.actions'

import type {
    UserWithProfile,
    UserWithProfileInsert,
} from '@/lib/schemas/user-with-profile.schemas'

const ROLE_ICONS = {
    admin: ShieldAlert,
    agent: ShieldCheck,
    customer: User,
} as const

interface NewUserFormProps {
    /**
     * The current user (should be admin)
     */
    currentUser: UserWithProfile
}

export function NewUserForm({ currentUser }: NewUserFormProps) {
    const router = useRouter()
    const searchParams = useSearchParams()
    const [isSubmitting, setIsSubmitting] = useState(false)

    // Get the user type from the URL
    const userType = searchParams.get('type') as 'admin' | 'agent' | 'customer'

    const form = useForm<UserWithProfileInsert>({
        resolver: zodResolver(userWithProfileInsertSchema),
        defaultValues: {
            email: '',
            is_active: true,
            profile: {
                full_name: '',
                bio: '',
                role: userType || 'customer',
            },
        },
    })

    // Redirect if not admin
    if (currentUser.profile.role !== 'admin') {
        router.push('/dashboard')
        return null
    }

    const ROLE_DESCRIPTIONS = {
        admin: 'Add System Administrator',
        agent: 'Add Support Agent',
        customer: 'Add Customer Account',
    } as const

    async function onSubmit(data: UserWithProfileInsert) {
        try {
            setIsSubmitting(true)
            const result = await createUserWithProfile(data)

            if (result.error) {
                toast.error(result.error)
                return
            }

            toast.success('User created successfully')
            router.push('/dashboard/users?type=' + data.profile.role)
        } catch (error) {
            toast.error('Something went wrong')
            console.error(error)
        } finally {
            setIsSubmitting(false)
        }
    }

    const title = userType ? ROLE_DESCRIPTIONS[userType] : 'Add New User'
    const RoleIcon = userType ? ROLE_ICONS[userType] : User

    return (
        <div className="mx-auto max-w-2xl space-y-8">
            <div>
                <h2 className="text-2xl font-bold tracking-tight">{title}</h2>
                <p className="text-muted-foreground">
                    {userType === 'admin'
                        ? 'Full system access and user management'
                        : userType === 'agent'
                          ? 'Can manage tickets and assist customers'
                          : userType === 'customer'
                            ? 'Can create and manage their own tickets'
                            : 'Create a new user account'}
                </p>
            </div>

            <Form {...form}>
                <form
                    onSubmit={form.handleSubmit(onSubmit)}
                    className="space-y-4"
                >
                    <div className="rounded-lg border bg-muted/50 p-3 text-muted-foreground">
                        <div className="flex items-center gap-2">
                            <RoleIcon className="h-4 w-4" />
                            <span>
                                Creating a new{' '}
                                <strong className="text-foreground">
                                    {userType || 'user'}
                                </strong>
                            </span>
                        </div>
                    </div>

                    <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Email</FormLabel>
                                <FormControl>
                                    <Input
                                        placeholder="user@example.com"
                                        type="email"
                                        {...field}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="profile.full_name"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Full Name</FormLabel>
                                <FormControl>
                                    <Input
                                        placeholder="John Doe"
                                        {...field}
                                        value={field.value || ''}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="profile.bio"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Bio</FormLabel>
                                <FormControl>
                                    <Textarea
                                        placeholder="A brief description about the user"
                                        className="resize-none"
                                        {...field}
                                        value={field.value || ''}
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
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    Creating...
                                </>
                            ) : (
                                'Create User'
                            )}
                        </Button>
                    </div>
                </form>
            </Form>
        </div>
    )
}
