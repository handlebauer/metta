'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { motion } from 'framer-motion'
import { useForm } from 'react-hook-form'
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
    getAuthenticatedUserWithProfile,
    updateUserWithProfile,
} from '@/actions/user-with-profile.actions'

// Profile form schema
const profileFormSchema = z.object({
    full_name: z.string().min(1, 'Please enter your name'),
    bio: z.string().optional(),
})

type ProfileFormValues = z.infer<typeof profileFormSchema>

interface ProfileSetupFormProps {
    onSubmit?: (data: ProfileFormValues) => void
}

export function ProfileSetupForm({
    onSubmit: onSubmitCallback,
}: ProfileSetupFormProps) {
    const form = useForm<ProfileFormValues>({
        resolver: zodResolver(profileFormSchema),
        defaultValues: {
            full_name: '',
            bio: '',
        },
    })

    async function onSubmit(data: ProfileFormValues) {
        try {
            // Get the current user's profile
            const { data: user, error: userError } =
                await getAuthenticatedUserWithProfile()
            if (userError || !user) {
                throw new Error(userError || 'Failed to get user profile')
            }

            // Update the profile
            const { error } = await updateUserWithProfile(user.id, {
                profile: {
                    ...user.profile,
                    full_name: data.full_name,
                    bio: data.bio || null,
                },
            })

            if (error) {
                throw new Error(error)
            }

            // Call the callback if provided with the form data
            onSubmitCallback?.(data)
        } catch (error) {
            console.error('Failed to update profile:', error)
            // In a real app, we'd show this error to the user
        }
    }

    return (
        <Form {...form}>
            <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="mx-auto w-full max-w-[500px]"
            >
                <div className="space-y-4">
                    <FormField
                        control={form.control}
                        name="full_name"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Full Name</FormLabel>
                                <FormControl>
                                    <Input
                                        placeholder="Enter your full name"
                                        {...field}
                                        autoFocus
                                        className="bg-card"
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="bio"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Bio (Optional)</FormLabel>
                                <FormControl>
                                    <Input
                                        placeholder="Tell us a bit about yourself"
                                        {...field}
                                        className="bg-card"
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>
                <div className="mt-6 flex items-center justify-between">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="flex items-center gap-2 text-xs text-muted-foreground"
                    >
                        <span>Press</span>
                        <kbd className="rounded border border-border bg-muted px-2 py-1 font-mono">
                            <span className="text-[10px] tracking-widest">
                                ⏎
                            </span>{' '}
                            Enter
                        </kbd>
                        <span>to continue</span>
                    </motion.div>
                    <Button type="submit" className="hidden">
                        Continue to Workspace Setup
                    </Button>
                </div>
            </form>
        </Form>
    )
}
