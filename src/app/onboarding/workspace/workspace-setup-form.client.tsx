'use client'

import { useCallback, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { zodResolver } from '@hookform/resolvers/zod'
import { AnimatePresence, motion } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

import { cleanUrl, ensureFullyQualifiedUrl } from '@/lib/utils/url'
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
import { useAIAssistant } from '@/components/ai/use-ai-assistant'
import { createWorkspace } from '@/actions/workspace.actions'

// Workspace form schema
const websiteFormSchema = z.object({
    website: z.string().min(1, 'Please enter your website URL'),
})

const workspaceFormSchema = z.object({
    name: z.string().min(1, 'Please enter a workspace name'),
    slug: z
        .string()
        .min(1, 'Please enter a workspace slug')
        .regex(
            /^[a-z0-9-]+$/,
            'Only lowercase letters, numbers, and hyphens are allowed',
        )
        .transform(val => val.toLowerCase()),
})

type WebsiteFormValues = z.infer<typeof websiteFormSchema>
type WorkspaceFormValues = z.infer<typeof workspaceFormSchema>

// Helper function to generate slug from text
function generateSlug(text: string): string {
    return text
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
}

interface DomainInfo {
    domainPart: string
    suggestedName: string
}

// Helper function to extract domain info
function extractDomainInfo(url: string): DomainInfo {
    try {
        // Clean the input
        const cleanWebsite = url
            .replace(/^https?:\/\//, '')
            .replace(/^www\./, '')

        // If we have a dot, try to parse as URL
        if (cleanWebsite.includes('.')) {
            const url = new URL(`https://${cleanWebsite}`)
            const hostname = url.hostname.replace(/^www\./, '')
            const domainPart = hostname.split('.')[0]
            return {
                domainPart,
                suggestedName: domainPart
                    .split('-')
                    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                    .join(' '),
            }
        }

        // If no dot yet, just use what they've typed
        return {
            domainPart: cleanWebsite,
            suggestedName: cleanWebsite
                .split('-')
                .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                .join(' '),
        }
    } catch {
        // If URL parsing fails, just clean and use the input
        return {
            domainPart: url,
            suggestedName: url
                .split('-')
                .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                .join(' '),
        }
    }
}

export function WorkspaceSetupForm() {
    const router = useRouter()
    const [step, setStep] = useState(1)
    const [website, setWebsite] = useState('')

    const assistantSteps = useMemo(
        () => [
            {
                message:
                    "Great! I've created your workspace. Now let's set up your data sources.",
            },
        ],
        [],
    )

    const handleComplete = useCallback(() => {
        router.push('/onboarding/data-sources')
    }, [router])

    const assistant = useAIAssistant(assistantSteps, handleComplete)

    const websiteForm = useForm<WebsiteFormValues>({
        resolver: zodResolver(websiteFormSchema),
        defaultValues: {
            website: '',
        },
    })

    const workspaceForm = useForm<WorkspaceFormValues>({
        resolver: zodResolver(workspaceFormSchema),
        defaultValues: {
            name: '',
            slug: '',
        },
    })

    async function onWebsiteSubmit(data: WebsiteFormValues) {
        try {
            // Store the original input for later use
            setWebsite(data.website)

            // Extract domain info and pre-fill workspace form
            const { domainPart, suggestedName } = extractDomainInfo(
                data.website,
            )
            workspaceForm.setValue('name', suggestedName)
            workspaceForm.setValue('slug', generateSlug(domainPart))

            setStep(2)
        } catch (error) {
            console.error('Failed to process website:', error)
            websiteForm.setError('root', {
                type: 'manual',
                message: 'Failed to process website. Please try again.',
            })
        }
    }

    async function onWorkspaceSubmit(data: WorkspaceFormValues) {
        try {
            const { data: workspace, error } = await createWorkspace({
                name: data.name,
                slug: data.slug,
                settings: {
                    website: ensureFullyQualifiedUrl(website),
                },
            })

            if (error) {
                throw new Error(error)
            }

            if (!workspace?.id) {
                throw new Error('No workspace ID returned')
            }

            // Store workspace info in session storage
            sessionStorage.setItem('workspace_id', workspace.id)
            sessionStorage.setItem(
                'workspace_website',
                ensureFullyQualifiedUrl(website),
            )

            // Show completion message and trigger redirect
            assistant.handleNextStep()
        } catch (error) {
            console.error('Failed to create workspace:', error)
            workspaceForm.setError('root', {
                type: 'manual',
                message:
                    'Failed to create workspace. Please try again or contact support.',
            })
        }
    }

    return (
        <AnimatePresence mode="wait">
            {step === 1 && (
                <motion.div
                    key="website-form"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                >
                    <Form {...websiteForm}>
                        <form
                            onSubmit={websiteForm.handleSubmit(onWebsiteSubmit)}
                            className="mx-auto w-full max-w-[500px]"
                        >
                            <div className="space-y-4">
                                <FormField
                                    control={websiteForm.control}
                                    name="website"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Website URL</FormLabel>
                                            <FormControl>
                                                <div className="relative">
                                                    <span className="absolute inset-y-0 left-0 flex items-center rounded-l-lg border-r border-border bg-muted px-3 pr-2 text-sm text-muted-foreground">
                                                        https://
                                                    </span>
                                                    <Input
                                                        placeholder="example.com"
                                                        {...field}
                                                        autoFocus
                                                        className="bg-card pl-[calc(theme(space.3)*2+3.25rem)]"
                                                        onChange={e => {
                                                            const cleanedValue =
                                                                cleanUrl(
                                                                    e.target
                                                                        .value,
                                                                )
                                                            field.onChange(
                                                                cleanedValue,
                                                            )
                                                        }}
                                                    />
                                                </div>
                                            </FormControl>
                                            <FormDescription>
                                                We&apos;ll use this to help set
                                                up your workspace
                                            </FormDescription>
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
                                    Continue
                                </Button>
                            </div>
                        </form>
                    </Form>
                </motion.div>
            )}

            {step === 2 && (
                <motion.div
                    key="workspace-form"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                >
                    <Form {...workspaceForm}>
                        <form
                            onSubmit={workspaceForm.handleSubmit(
                                onWorkspaceSubmit,
                            )}
                            className="mx-auto w-full max-w-[500px]"
                        >
                            <div className="space-y-4">
                                <FormField
                                    control={workspaceForm.control}
                                    name="name"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>
                                                Workspace Name
                                            </FormLabel>
                                            <FormControl>
                                                <Input
                                                    placeholder="My Company Support"
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
                                    control={workspaceForm.control}
                                    name="slug"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Workspace URL</FormLabel>
                                            <FormControl>
                                                <div className="relative">
                                                    <span className="absolute inset-y-0 left-0 flex items-center rounded-l-lg border-r border-border bg-muted px-3 pr-2 text-sm text-muted-foreground">
                                                        metta.dev/
                                                    </span>
                                                    <Input
                                                        placeholder="my-company"
                                                        {...field}
                                                        className="bg-card pl-[calc(theme(space.3)*2+4.75rem)]"
                                                    />
                                                </div>
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
                                    Continue to Data Sources
                                </Button>
                            </div>
                        </form>
                    </Form>
                </motion.div>
            )}
        </AnimatePresence>
    )
}
