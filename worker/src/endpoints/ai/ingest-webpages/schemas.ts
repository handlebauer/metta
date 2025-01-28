import { z } from 'zod'

export const IngestWebpagesRequest = z.object({
    workspace_id: z.string(),
    sources: z
        .object({
            website: z.object({
                url: z.string(),
                paths: z.array(z.string()),
            }),
        })
        .strip(),
})

export interface ScrapeResponse {
    pages: {
        url: string
        markdown: string
    }[]
    metadata: {
        timing: {
            durationMs: number
            averagePageTimeMs: number
        }
        stats: {
            successfulPages: number
            failedPages: number
        }
        errors: string[]
    }
}

export const IngestWebpagesResponse = z.object({
    success: z.boolean(),
    timestamp: z.string(),
    stats: z.object({
        total_pages: z.number(),
        website_pages: z.number(),
    }),
})
