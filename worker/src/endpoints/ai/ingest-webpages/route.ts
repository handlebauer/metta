import { OpenAPIRoute } from 'chanfana'
import OpenAI from 'openai'
import { z } from 'zod'

import { withLangfuseTrace } from '../../../lib/langfuse'
import { chunkText } from '../../../lib/text'
import {
    IngestWebpagesRequest,
    IngestWebpagesResponse,
    ScrapeResponse,
} from './schemas'
import { createEmbeddings, Document, prepareVectors } from './vector-operations'

export class IngestWebpages extends OpenAPIRoute {
    schema = {
        tags: ['AI'],
        summary: 'Scrape and ingest webpage content into vector database',
        request: {
            body: {
                content: {
                    'application/json': {
                        schema: IngestWebpagesRequest,
                    },
                },
            },
        },
        responses: {
            '200': {
                description: 'Webpages successfully scraped and ingested',
                content: {
                    'application/json': {
                        schema: z.object({
                            success: z.boolean(),
                            result: IngestWebpagesResponse,
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
            // Get and validate data first
            const rawData = await this.getValidatedData<typeof this.schema>()
            const validatedData = IngestWebpagesRequest.parse(rawData.body)
            const { workspace_id, sources } = validatedData

            console.log(
                'Received request:',
                JSON.stringify(validatedData, null, 2),
            )

            // Initialize OpenAI
            const openai = new OpenAI({ apiKey: context.env.OPENAI_API_KEY })

            return await withLangfuseTrace(
                {
                    secretKey: context.env.LANGFUSE_SECRET_KEY,
                    publicKey: context.env.LANGFUSE_PUBLIC_KEY,
                    baseUrl: context.env.LANGFUSE_BASEURL,
                },
                {
                    name: 'ingest-webpages',
                    metadata: { workspace_id },
                    fn: async trace => {
                        // Create span for website scraping
                        const scrapeSpan = trace.generation({
                            name: 'scrape-website',
                            input: sources.website.paths,
                        })

                        // Scrape website pages
                        const urlsToScrape = sources.website.paths.join(',')
                        console.log('Scraping URLs:', urlsToScrape)

                        const websiteData = await fetch(
                            `https://llmd.hbauer.workers.dev/scrape/${urlsToScrape}`,
                        ).then(res => res.json() as Promise<ScrapeResponse>)

                        scrapeSpan.end({
                            output: websiteData,
                        })

                        // Prepare documents for ingestion
                        const documents: Document[] = []

                        // Add scraped pages with chunking
                        if (websiteData) {
                            for (const page of websiteData.pages) {
                                // Create chunks from the page content
                                const chunks = chunkText(page.markdown, {
                                    chunkSize: 500,
                                    overlapSize: 100,
                                })

                                // Create a document for each chunk
                                for (const chunk of chunks) {
                                    documents.push({
                                        content: chunk.content,
                                        url: page.url,
                                        workspace_id,
                                        chunk_metadata: {
                                            startChar: chunk.metadata.startChar,
                                            endChar: chunk.metadata.endChar,
                                        },
                                    })
                                }
                            }
                        }

                        // Create embeddings for documents
                        const embeddingSpan = trace.generation({
                            name: 'create-embeddings',
                            model: 'text-embedding-3-small',
                            input: documents.map(d => d.content),
                        })

                        const embeddings = await createEmbeddings(
                            documents,
                            openai,
                        )

                        embeddingSpan.end({
                            output: `Generated ${embeddings.length} embeddings`,
                        })

                        // Prepare vectors for ingestion
                        const vectors = prepareVectors(documents, embeddings)

                        // Create span for vector ingestion
                        const ingestSpan = trace.span({
                            name: 'ingest-vectors',
                            input: { vectorCount: vectors.length },
                        })

                        // Ingest vectors into database
                        await context.env.VECTORIZE.upsert(vectors, {
                            token: context.env.VECTORIZE_TOKEN,
                        })

                        ingestSpan.end()

                        return {
                            success: true,
                            result: {
                                success: true,
                                timestamp: new Date().toISOString(),
                                stats: {
                                    total_pages: websiteData.pages.length,
                                    website_pages: websiteData.pages.length,
                                    total_chunks: documents.length,
                                },
                            },
                        }
                    },
                },
            )
        } catch (error) {
            console.error('Error ingesting webpages:', error)
            return {
                success: false,
                error: 'Failed to ingest webpages',
            }
        }
    }
}
