import { Ai } from '@cloudflare/ai'
import { VectorizeIndex } from '@cloudflare/workers-types'
import { DateTime, Str } from 'chanfana'
import { z } from 'zod'

declare global {
    interface Env {
        AI: Ai
        VECTORIZE: VectorizeIndex
    }
}

export const Task = z.object({
    name: Str({ example: 'lorem' }),
    slug: Str(),
    description: Str({ required: false }),
    completed: z.boolean().default(false),
    due_date: DateTime(),
})
