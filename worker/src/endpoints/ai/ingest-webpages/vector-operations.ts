import { createHash } from 'node:crypto'
import OpenAI from 'openai'

export interface Document {
    content: string
    url: string
    workspace_id: string
    chunk_metadata?: {
        startChar: number
        endChar: number
    }
}

/**
 * Creates a deterministic ID for a chunk that's guaranteed to be under 64 bytes
 */
function createChunkId(doc: Document): string {
    // Create a base string that captures the essential uniqueness
    const baseString = `${doc.workspace_id}:${doc.url}:${doc.chunk_metadata?.startChar ?? 0}`

    // Hash it to ensure fixed length while maintaining uniqueness
    const hash = createHash('sha256')
        .update(baseString)
        .digest('base64')
        .slice(0, 16) // Take first 16 chars of base64 (effectively 12 bytes)

    // Combine workspace_id (for easy filtering) with hash
    return `${doc.workspace_id.slice(0, 8)}_${hash}`
}

export async function createEmbeddings(
    documents: Document[],
    openai: OpenAI,
): Promise<number[][]> {
    return Promise.all(
        documents.map(async doc => {
            const result = await openai.embeddings.create({
                model: 'text-embedding-3-small',
                input: doc.content,
                encoding_format: 'float',
            })
            return result.data[0].embedding
        }),
    )
}

export function prepareVectors(
    documents: Document[],
    embeddings: number[][],
): Array<{
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
}> {
    return documents.map((doc, index) => ({
        id: createChunkId(doc),
        values: embeddings[index],
        metadata: {
            url: doc.url,
            workspace_id: doc.workspace_id,
            content: doc.content,
            chunk_position: doc.chunk_metadata,
            added_at: new Date().toISOString(),
            type: 'webpage',
        },
    }))
}
