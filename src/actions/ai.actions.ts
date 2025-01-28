'use server'

import { cache } from 'react'

import { callInternalApi } from '@/lib/api'

interface GreetingResult {
    greeting: string
    timestamp: string
}

interface IngestWebpagesResult {
    success: boolean
    timestamp: string
    stats: {
        total_pages: number
        website_pages: number
        docs_pages: number
    }
}

interface IngestWebpagesInput {
    workspace_id: string
    sources: {
        website: {
            url: string
            paths: string[]
        }
        docs: {
            url?: string
            paths: string[]
        }
    }
}

// Cache the greeting request for the same name+bio combination
export const getAIGreeting = cache(async (name: string, bio?: string) => {
    return callInternalApi<GreetingResult>('ai/send-greeting', {
        method: 'POST',
        body: { name, bio },
    })
})

export async function ingestWebpages(input: IngestWebpagesInput) {
    return callInternalApi<IngestWebpagesResult>('ai/ingest-webpages', {
        method: 'POST',
        body: input,
    })
}
