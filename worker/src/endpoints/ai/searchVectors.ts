import { OpenAPIRoute } from 'chanfana'
import { Langfuse } from 'langfuse'
import OpenAI from 'openai'
import { z } from 'zod'

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

    async handle(context) {
        try {
            // Get validated data
            const data = await this.getValidatedData<typeof this.schema>()
            const { workspace_id, query, limit } = data.body

            // Initialize clients
            const openai = new OpenAI({
                apiKey: context.env.OPENAI_API_KEY,
            })
            const langfuse = new Langfuse({
                secretKey: context.env.LANGFUSE_SECRET_KEY,
                publicKey: context.env.LANGFUSE_PUBLIC_KEY,
                baseUrl: context.env.LANGFUSE_BASEURL,
            })

            // Start trace
            const trace = langfuse.trace({
                name: 'search-vectors',
                metadata: { workspace_id, query },
            })

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
                input: { query, limit, workspace_id },
            })

            // Search vectors using the query embedding
            const searchResults = await context.env.VECTORIZE.query(
                embedding.data[0].embedding,
                {
                    topK: limit,
                    returnMetadata: 'all',
                    token: context.env.VECTORIZE_TOKEN,
                },
            )

            // Filter results by workspace_id
            const filteredMatches = searchResults.matches.filter(
                match => match.metadata?.workspace_id === workspace_id,
            )

            searchSpan.end({
                output: {
                    matchCount: filteredMatches.length,
                    scores: filteredMatches.map(m => m.score),
                },
            })

            // Format and return results
            const response = {
                success: true,
                result: {
                    results: filteredMatches.map(match => ({
                        id: match.id,
                        score: match.score,
                        values: match.values,
                        metadata: match.metadata,
                    })),
                    timestamp: new Date().toISOString(),
                },
            }

            await langfuse
                .flushAsync()
                .then(() => console.log('Sent traces to Langfuse'))
                .catch(console.error)

            return response
        } catch (error) {
            console.error('Error searching vectors:', error)
            return {
                success: false,
                error: 'Failed to search vectors',
            }
        }
    }
}
