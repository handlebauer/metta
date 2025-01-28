export interface VectorizeMatch {
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

export interface VectorizeResponse {
    matches: VectorizeMatch[]
}

export interface VectorizeOptions {
    topK: number
    returnMetadata?: 'all'
    token: string
}

export interface VectorizeVector {
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

export interface Vectorize {
    query(
        embedding: number[],
        options: VectorizeOptions,
    ): Promise<VectorizeResponse>
    upsert(
        vectors: VectorizeVector[],
        options: { token: string },
    ): Promise<void>
}
