import { Langfuse } from 'langfuse'

export interface LangfuseConfig {
    secretKey: string
    publicKey: string
    baseUrl: string
}

export function createLangfuse(config: LangfuseConfig) {
    return new Langfuse({
        secretKey: config.secretKey,
        publicKey: config.publicKey,
        baseUrl: config.baseUrl,
    })
}

export async function withLangfuseTrace<T>(
    config: LangfuseConfig,
    options: {
        name: string
        metadata?: Record<string, unknown>
        fn: (trace: ReturnType<Langfuse['trace']>) => Promise<T>
    },
): Promise<T> {
    const langfuse = createLangfuse(config)
    const trace = langfuse.trace({
        name: options.name,
        metadata: options.metadata,
    })

    try {
        const result = await options.fn(trace)
        await langfuse
            .flushAsync()
            .then(() => console.log('Sent traces to Langfuse'))
            .catch(console.error)
        return result
    } catch (error) {
        console.error(`Error in ${options.name}:`, error)
        throw error
    }
}
