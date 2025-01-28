import { OpenAPIRoute } from 'chanfana'
import OpenAI from 'openai'
import { z } from 'zod'

import { withLangfuseTrace } from '../../lib/langfuse'
import {
    type VectorizeMatch,
    type VectorizeResponse,
} from '../../lib/vectorize'

import type { Env } from '../../lib/env'

const SearchVectorsRequest = z.object({
    workspace_id: z.string(),
    query: z.string(),
    limit: z.number().min(1).max(20).default(5),
    minSimilarity: z.number().min(0).max(1).default(0.1),
})

const SearchVectorsResponse = z.object({
    results: z.array(
        z.object({
            id: z.string(),
            score: z.number(),
            values: z.array(z.number()).optional(),
            metadata: z
                .object({
                    url: z.string(),
                    workspace_id: z.string(),
                    content: z.string(),
                    chunk_position: z
                        .object({
                            startChar: z.number(),
                            endChar: z.number(),
                        })
                        .optional(),
                    added_at: z.string(),
                    type: z.literal('webpage'),
                })
                .optional(),
        }),
    ),
    timestamp: z.string(),
})

export class SearchVectors extends OpenAPIRoute {
    schema = {
        tags: ['AI'],
        summary: 'Search vectorized content using semantic similarity',
        request: {
            body: {
                content: {
                    'application/json': {
                        schema: SearchVectorsRequest,
                    },
                },
            },
        },
        responses: {
            '200': {
                description: 'Returns semantically similar content',
                content: {
                    'application/json': {
                        schema: z.object({
                            success: z.boolean(),
                            result: SearchVectorsResponse,
                        }),
                    },
                },
            },
            '500': {
                description: 'Internal server error',
                content: {
                    'application/json': {
                        schema: z.object({
                            success: z.boolean(),
                            error: z.string(),
                        }),
                    },
                },
            },
        },
    }

    async handle(context: { env: Env }) {
        try {
            // Get validated data
            const data = await this.getValidatedData<typeof this.schema>()
            const { workspace_id, query, limit, minSimilarity } = data.body

            // Initialize OpenAI
            const openai = new OpenAI({
                apiKey: context.env.OPENAI_API_KEY,
            })

            return await withLangfuseTrace(
                {
                    secretKey: context.env.LANGFUSE_SECRET_KEY,
                    publicKey: context.env.LANGFUSE_PUBLIC_KEY,
                    baseUrl: context.env.LANGFUSE_BASEURL,
                },
                {
                    name: 'search-vectors',
                    metadata: { workspace_id, query },
                    fn: async trace => {
                        // Create generation for embeddings
                        const embeddingGen = trace.generation({
                            name: 'create-search-embedding',
                            model: 'text-embedding-3-small',
                            input: query,
                        })

                        // Generate embedding for the search query
                        const embedding = await openai.embeddings.create({
                            model: 'text-embedding-3-small',
                            input: query,
                            encoding_format: 'float',
                        })

                        embeddingGen.end({
                            output: `Generated embedding with ${embedding.data[0].embedding.length} dimensions`,
                        })

                        // Create span for vector search
                        const searchSpan = trace.span({
                            name: 'vector-search',
                            input: {
                                query,
                                limit,
                                workspace_id,
                                minSimilarity,
                            },
                        })

                        // Search vectors using the query embedding
                        const searchResults: VectorizeResponse =
                            await context.env.VECTORIZE.query(
                                embedding.data[0].embedding,
                                {
                                    topK: limit * 2, // Get more results for better filtering
                                    returnMetadata: 'all',
                                    token: context.env.VECTORIZE_TOKEN,
                                },
                            )

                        // Filter and validate results
                        const filteredMatches = searchResults.matches
                            .filter((match: VectorizeMatch) => {
                                // Ensure workspace isolation
                                if (
                                    match.metadata?.workspace_id !==
                                    workspace_id
                                ) {
                                    return false
                                }
                                // Apply similarity threshold
                                if (match.score < minSimilarity) {
                                    return false
                                }
                                // Validate metadata shape
                                if (
                                    !match.metadata?.url ||
                                    !match.metadata?.content ||
                                    match.metadata?.type !== 'webpage'
                                ) {
                                    return false
                                }
                                return true
                            })
                            // Limit after filtering
                            .slice(0, limit)

                        searchSpan.end({
                            output: {
                                matchCount: filteredMatches.length,
                                scores: filteredMatches.map(m => m.score),
                                minScore: Math.min(
                                    ...filteredMatches.map(m => m.score),
                                ),
                            },
                        })

                        // Format and return results
                        return {
                            success: true,
                            result: {
                                results: filteredMatches.map(match => ({
                                    id: match.id,
                                    score: match.score,
                                    metadata: match.metadata,
                                })),
                                timestamp: new Date().toISOString(),
                            },
                        }
                    },
                },
            )
        } catch (error) {
            console.error('Error searching vectors:', error)
            return {
                success: false,
                error: 'Failed to search vectors',
            }
        }
    }
}
