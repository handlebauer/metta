import OpenAI from 'openai'

export interface Document {
    content: string
    url: string
    workspace_id: string
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
        added_at: string
        type: 'webpage'
    }
}> {
    return documents.map((doc, index) => ({
        id: `${doc.workspace_id}:${doc.url}`,
        values: embeddings[index],
        metadata: {
            url: doc.url,
            workspace_id: doc.workspace_id,
            added_at: new Date().toISOString(),
            type: 'webpage',
        },
    }))
}
