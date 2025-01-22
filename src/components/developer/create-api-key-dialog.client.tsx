'use client'

import { useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'

import { Button } from '@/components/ui/button'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog'
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { CreateApiKeySchema } from '@/lib/schemas/api-key.schemas'
import { createApiKeyAction } from '@/actions/api-key.actions'
import { useToast } from '@/hooks/use-toast'

import type { CreateApiKeySchema as CreateApiKeySchemaType } from '@/lib/schemas/api-key.schemas'

interface CreateApiKeyDialogProps {
    children: React.ReactNode
}

export function CreateApiKeyDialog({ children }: CreateApiKeyDialogProps) {
    const [open, setOpen] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const { toast } = useToast()

    const form = useForm<CreateApiKeySchemaType>({
        resolver: zodResolver(CreateApiKeySchema),
        defaultValues: {
            name: '',
        },
    })

    async function onSubmit(data: CreateApiKeySchemaType) {
        setIsLoading(true)
        try {
            const result = await createApiKeyAction(data)
            if (result.error) {
                toast({
                    variant: 'destructive',
                    title: 'Error',
                    description: result.error,
                })
                return
            }

            // Show the API key to the user
            toast({
                title: 'API Key Generated',
                description: (
                    <div className="mt-2 rounded-lg bg-muted p-4">
                        <p className="mb-2 font-medium">
                            Please copy your API key now. You won&apos;t be able
                            to see it again.
                        </p>
                        <code className="break-all font-mono text-sm">
                            {result.data?.api_key}
                        </code>
                    </div>
                ),
                duration: 0, // Don't auto-dismiss
            })
            setOpen(false)
            form.reset()
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>{children}</DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Generate New API Key</DialogTitle>
                    <DialogDescription>
                        Create a new API key for integrating with external
                        services.
                    </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form
                        onSubmit={form.handleSubmit(onSubmit)}
                        className="space-y-4"
                    >
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Key Name</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="e.g., Production API Key"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <DialogFooter>
                            <Button
                                variant="outline"
                                type="button"
                                onClick={() => setOpen(false)}
                            >
                                Cancel
                            </Button>
                            <Button type="submit" disabled={isLoading}>
                                {isLoading ? 'Generating...' : 'Generate Key'}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}
