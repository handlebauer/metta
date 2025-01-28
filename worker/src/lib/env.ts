import type { Vectorize } from './vectorize'

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
