'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { zodResolver } from '@hookform/resolvers/zod'
import { Book, Globe } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

import { type Json } from '@/lib/supabase/types'
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
import { updateWorkspace } from '@/actions/workspace.actions'

import { LoadingIndicator } from './loading-indicator'
import { WebsiteLinksPopover } from './website-links-popover'

// Data source schema
const dataSourcesSchema = z.object({
    website_url: z.string().min(1, 'Please enter your website URL'),
    website_paths: z.array(z.string()).default([]),
    docs_url: z.string().optional(),
    docs_paths: z.array(z.string()).default([]),
})

type DataSourcesFormValues = z.infer<typeof dataSourcesSchema>

export interface DataSourcesSetupFormProps {
    websiteUrl: string
}

interface WebsiteLinksResponse {
    url: string
    count: number
    links: string[]
}

export function DataSourcesSetupForm({
    websiteUrl,
}: DataSourcesSetupFormProps) {
    const router = useRouter()

    const assistantSteps = useMemo(
        () => [
            {
                message:
                    "🎉 Congratulations! You've completed the onboarding process. Your workspace is now set up with the data sources you provided. I'll redirect you to your dashboard where you can start managing your customer support.",
            },
        ],
        [],
    )

    const handleComplete = useCallback(() => {
        router.push('/dashboard')
    }, [router])

    const assistant = useAIAssistant(assistantSteps, handleComplete)

    const [isLoadingLinks, setIsLoadingLinks] = useState(false)
    const [isLoadingDocsLinks, setIsLoadingDocsLinks] = useState(false)
    const [linksError, setLinksError] = useState<string | null>(null)
    const [docsLinksError, setDocsLinksError] = useState<string | null>(null)
    const [websiteLinks, setWebsiteLinks] =
        useState<WebsiteLinksResponse | null>(null)
    const [docsLinks, setDocsLinks] = useState<WebsiteLinksResponse | null>(
        null,
    )
    const [isDocsUrlFocused, setIsDocsUrlFocused] = useState(false)
    const [workspaceId, setWorkspaceId] = useState<string | null>(null)

    // Get workspace ID from session storage
    useEffect(() => {
        const id = sessionStorage.getItem('workspace_id')
        if (!id) {
            console.error('No workspace ID found in session storage')
            return
        }
        setWorkspaceId(id)
    }, [])

    function cleanUrl(url: string) {
        return url
            .replace(/^https?:\/\//, '') // Remove protocol
            .replace(/^www\./, '') // Remove www
            .split(/[/?#]/)[0] // Remove paths and query parameters
    }

    function isValidUrl(url: string) {
        // Basic URL validation - checks if it's a domain with at least one dot
        return /^[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9](?:\.[a-zA-Z]{2,})+$/.test(
            url,
        )
    }

    const form = useForm<DataSourcesFormValues>({
        resolver: zodResolver(dataSourcesSchema),
        defaultValues: {
            website_url: cleanUrl(websiteUrl),
            website_paths: [],
            docs_url: '',
            docs_paths: [],
        },
    })

    // Fetch website links
    const fetchWebsiteLinks = useCallback(
        async (websiteUrl: string) => {
            try {
                setIsLoadingLinks(true)
                setLinksError(null)

                const response = await fetch(
                    `https://llmd.hbauer.workers.dev/links/https://${websiteUrl}`,
                )

                if (!response.ok) {
                    throw new Error('Failed to fetch website links')
                }

                const data: WebsiteLinksResponse = await response.json()
                setWebsiteLinks(data)
                // Select all pages by default
                form.setValue('website_paths', data.links)
            } catch (error) {
                console.error('Failed to fetch website links:', error)
                setLinksError(
                    'Failed to fetch website links. Please try again.',
                )
                form.setValue('website_paths', [])
            } finally {
                setIsLoadingLinks(false)
            }
        },
        [form],
    )

    // Fetch documentation links
    const fetchDocsLinks = useCallback(
        async (docsUrl: string) => {
            try {
                setIsLoadingDocsLinks(true)
                setDocsLinksError(null)

                const response = await fetch(
                    `https://llmd.hbauer.workers.dev/links/https://${docsUrl}`,
                )

                if (!response.ok) {
                    throw new Error('Failed to fetch documentation links')
                }

                const data: WebsiteLinksResponse = await response.json()
                setDocsLinks(data)
                // Select all pages by default
                form.setValue('docs_paths', data.links)
            } catch (error) {
                console.error('Failed to fetch documentation links:', error)
                setDocsLinksError(
                    'Failed to fetch documentation links. Please try again.',
                )
                form.setValue('docs_paths', [])
            } finally {
                setIsLoadingDocsLinks(false)
            }
        },
        [form],
    )

    // Fetch website links on mount
    useEffect(() => {
        if (websiteUrl) {
            fetchWebsiteLinks(cleanUrl(websiteUrl))
        }
    }, [websiteUrl, fetchWebsiteLinks])

    async function onSubmit(data: DataSourcesFormValues) {
        if (!workspaceId) {
            form.setError('root', {
                type: 'manual',
                message: 'No workspace ID found. Please try again.',
            })
            return
        }

        try {
            const settings = {
                data_sources: data,
                onboarding_completed: true,
            } satisfies Json

            const { error } = await updateWorkspace(workspaceId, {
                settings,
            })

            if (error) {
                throw new Error(error)
            }

            // Show completion message and trigger redirect
            assistant.handleNextStep()
        } catch (error) {
            console.error('Failed to update data sources:', error)
            // Show error through form validation
            form.setError('root', {
                type: 'manual',
                message:
                    'Failed to save data sources. Please try again or contact support.',
            })
        }
    }

    return (
        <Form {...form}>
            <form
                onSubmit={form.handleSubmit(onSubmit)}
                onKeyDown={e => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault()
                        form.handleSubmit(onSubmit)()
                    }
                }}
                className="mx-auto w-full space-y-2"
            >
                {/* Website Crawling */}
                <div className="space-y-4 rounded-lg bg-card p-6">
                    <div className="flex items-start space-x-4">
                        <Globe className="mt-1 h-6 w-6 text-muted-foreground" />
                        <div className="flex-1">
                            <FormField
                                control={form.control}
                                name="website_url"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Website URL</FormLabel>
                                        <FormDescription>
                                            We&apos;ll automatically scan your
                                            website for content
                                        </FormDescription>
                                        <FormControl>
                                            <div className="relative">
                                                <span className="absolute inset-y-0 left-0 flex items-center rounded-l-lg border-r border-border bg-muted px-3 pr-2 text-sm text-muted-foreground">
                                                    https://
                                                </span>
                                                <Input
                                                    placeholder="example.com"
                                                    {...field}
                                                    value={field.value || ''}
                                                    className="bg-background/50 pl-[calc(theme(space.3)*2+3.25rem)] text-muted-foreground"
                                                    readOnly
                                                    onChange={e => {
                                                        const cleanedValue =
                                                            cleanUrl(
                                                                e.target.value,
                                                            )
                                                        field.onChange(
                                                            cleanedValue,
                                                        )
                                                    }}
                                                    onKeyDown={e => {
                                                        if (e.key === 'Enter') {
                                                            e.preventDefault()
                                                            if (field.value) {
                                                                fetchWebsiteLinks(
                                                                    field.value,
                                                                )
                                                            }
                                                        }
                                                    }}
                                                />
                                            </div>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <div className="mt-4">
                                {isLoadingLinks ? (
                                    <LoadingIndicator />
                                ) : linksError ? (
                                    <div className="text-sm text-destructive">
                                        {linksError}
                                    </div>
                                ) : websiteLinks ? (
                                    <div className="text-sm text-muted-foreground">
                                        Found {websiteLinks.count} pages,{' '}
                                        <WebsiteLinksPopover
                                            links={websiteLinks.links}
                                            selectedPaths={form.watch(
                                                'website_paths',
                                            )}
                                            onPathsChange={paths =>
                                                form.setValue(
                                                    'website_paths',
                                                    paths,
                                                )
                                            }
                                        />{' '}
                                        selected to index
                                    </div>
                                ) : null}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Documentation URL */}
                <div className="space-y-4 rounded-lg bg-card p-6">
                    <div className="flex items-start space-x-4">
                        <Book className="mt-1 h-6 w-6 text-muted-foreground" />
                        <div className="flex-1">
                            <FormField
                                control={form.control}
                                name="docs_url"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Documentation URL</FormLabel>
                                        <FormDescription>
                                            If you have a separate documentation
                                            site
                                        </FormDescription>
                                        <FormControl>
                                            <div className="relative">
                                                <span className="absolute inset-y-0 left-0 flex items-center rounded-l-lg border-r border-border bg-muted px-3 pr-2 text-sm text-muted-foreground">
                                                    https://
                                                </span>
                                                <Input
                                                    placeholder="docs.example.com"
                                                    {...field}
                                                    value={field.value || ''}
                                                    className="bg-background pl-[calc(theme(space.3)*2+3.25rem)]"
                                                    onFocus={() =>
                                                        setIsDocsUrlFocused(
                                                            true,
                                                        )
                                                    }
                                                    onBlur={() =>
                                                        setIsDocsUrlFocused(
                                                            false,
                                                        )
                                                    }
                                                    onChange={e => {
                                                        const cleanedValue =
                                                            cleanUrl(
                                                                e.target.value,
                                                            )
                                                        field.onChange(
                                                            cleanedValue,
                                                        )
                                                        if (!cleanedValue) {
                                                            setDocsLinks(null)
                                                            setDocsLinksError(
                                                                null,
                                                            )
                                                            form.setValue(
                                                                'docs_paths',
                                                                [],
                                                            )
                                                        }
                                                    }}
                                                    onKeyDown={e => {
                                                        if (e.key === 'Enter') {
                                                            e.preventDefault()
                                                            if (field.value) {
                                                                fetchDocsLinks(
                                                                    field.value,
                                                                )
                                                            }
                                                        }
                                                    }}
                                                />
                                                {isDocsUrlFocused &&
                                                    field.value &&
                                                    isValidUrl(field.value) && (
                                                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                                                            <span className="flex items-center gap-1.5 text-[10px] text-muted-foreground/50">
                                                                press
                                                                <kbd className="rounded border border-border/40 bg-muted/40 px-1 py-0.5 font-mono text-[9px]">
                                                                    enter
                                                                </kbd>
                                                                to scan
                                                            </span>
                                                        </div>
                                                    )}
                                            </div>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <div className="mt-4 h-5">
                                {isLoadingDocsLinks ? (
                                    <LoadingIndicator />
                                ) : docsLinksError ? (
                                    <div className="text-sm text-destructive">
                                        {docsLinksError}
                                    </div>
                                ) : docsLinks ? (
                                    <div className="text-sm text-muted-foreground">
                                        Found {docsLinks.count} pages,{' '}
                                        <WebsiteLinksPopover
                                            links={docsLinks.links}
                                            selectedPaths={form.watch(
                                                'docs_paths',
                                            )}
                                            onPathsChange={paths =>
                                                form.setValue(
                                                    'docs_paths',
                                                    paths,
                                                )
                                            }
                                        />{' '}
                                        selected to index
                                    </div>
                                ) : null}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mt-6 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>Press</span>
                        <kbd className="rounded border border-border bg-muted px-2 py-1 font-mono">
                            <span className="text-[10px] tracking-widest">
                                ⏎
                            </span>{' '}
                            Enter
                        </kbd>
                        <span>to complete setup</span>
                    </div>
                    <Button type="submit" className="hidden">
                        Complete Setup
                    </Button>
                </div>
            </form>
        </Form>
    )
}
