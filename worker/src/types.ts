import { Ai } from '@cloudflare/ai'
import { VectorizeIndex } from '@cloudflare/workers-types'
import { DateTime, Str } from 'chanfana'
import { z } from 'zod'

declare global {
    interface Env {
        AI: Ai
        VECTORIZE: VectorizeIndex
        OPENAI_API_KEY: string
        VECTORIZE_TOKEN: string
        LANGFUSE_SECRET_KEY: string
        LANGFUSE_PUBLIC_KEY: string
        LANGFUSE_BASEURL: string
    }
}

export const Task = z.object({
    name: Str({ example: 'lorem' }),
    slug: Str(),
    description: Str({ required: false }),
    completed: z.boolean().default(false),
    due_date: DateTime(),
})

interface VectorizeMatch {
    id: string
    score: number
    values?: number[]
    metadata?: {
        url: string
        workspace_id: string
        content: string
        chunk_position?: {
            startChar: number
            endChar: number
        }
        added_at: string
        type: 'webpage'
    }
}

interface VectorizeResponse {
    matches: VectorizeMatch[]
}

interface VectorizeOptions {
    topK: number
    returnMetadata?: 'all'
    token: string
}

interface VectorizeVector {
    id: string
    values: number[]
    metadata: {
        url: string
        workspace_id: string
        content: string
        chunk_position?: {
            startChar: number
            endChar: number
        }
        added_at: string
        type: 'webpage'
    }
}

interface Vectorize {
    query(
        embedding: number[],
        options: VectorizeOptions,
    ): Promise<VectorizeResponse>
    upsert(
        vectors: VectorizeVector[],
        options: { token: string },
    ): Promise<void>
}

export interface Env {
    // API Keys
    OPENAI_API_KEY: string
    VECTORIZE_TOKEN: string

    // Langfuse Config
    LANGFUSE_SECRET_KEY: string
    LANGFUSE_PUBLIC_KEY: string
    LANGFUSE_BASEURL: string

    // Cloudflare Services
    VECTORIZE: Vectorize
}

// Re-export types that might be useful elsewhere
export type {
    VectorizeMatch,
    VectorizeResponse,
    VectorizeVector,
    VectorizeOptions,
}
