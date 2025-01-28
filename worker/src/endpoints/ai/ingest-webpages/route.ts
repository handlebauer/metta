import { OpenAPIRoute } from 'chanfana'
import { Langfuse } from 'langfuse'
import OpenAI from 'openai'
import { z } from 'zod'

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

            // Initialize clients
            const openai = new OpenAI({ apiKey: context.env.OPENAI_API_KEY })
            const langfuse = new Langfuse({
                secretKey: context.env.LANGFUSE_SECRET_KEY,
                publicKey: context.env.LANGFUSE_PUBLIC_KEY,
                baseUrl: context.env.LANGFUSE_BASEURL,
            })

            // Start trace
            const trace = langfuse.trace({
                name: 'ingest-webpages',
                metadata: { workspace_id },
            })

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

            // Add scraped pages
            if (websiteData) {
                const pages =
                    websiteData.metadata.stats.successfulPages > 0
                        ? websiteData.pages
                        : []

                console.log('Successfully scraped pages:', pages.length)
                documents.push(
                    ...pages.map(page => ({
                        content: page.markdown,
                        url: page.url,
                        workspace_id,
                    })),
                )
            }

            console.log('Total documents to vectorize:', documents.length)

            if (documents.length > 0) {
                // Create generation for OpenAI embeddings
                const embeddingGen = trace.generation({
                    name: 'create-embeddings',
                    model: 'text-embedding-3-small',
                    modelParameters: {
                        batchSize: documents.length,
                    },
                    input: documents.map(doc => doc.content),
                })

                // Create embeddings using OpenAI
                const embeddings = await createEmbeddings(documents, openai)

                embeddingGen.end({
                    output: `Generated ${embeddings.length} embeddings`,
                })

                // Create vectors with embeddings
                const vectors = prepareVectors(documents, embeddings)

                // Create span for vector storage
                const vectorSpan = trace.generation({
                    name: 'store-vectors',
                    input: { vectorCount: vectors.length },
                })

                // Upsert vectors
                console.log('Upserting vectors:', vectors.length)
                await context.env.VECTORIZE.upsert(vectors)

                vectorSpan.end({
                    output: { storedVectors: vectors.length },
                })
            }

            await langfuse
                .flushAsync()
                .then(() => console.log('Sent traces to Langfuse'))
                .catch(console.error)

            return {
                success: true,
                result: {
                    success: true,
                    timestamp: new Date().toISOString(),
                    stats: {
                        total_pages: documents.length,
                        website_pages: documents.length,
                    },
                },
            }
        } catch (error) {
            console.error('Error ingesting webpages:', error)
            return {
                success: false,
                error: 'Failed to ingest webpages',
            }
        }
    }
}
