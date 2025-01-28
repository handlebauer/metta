'use server'

import { callInternalApi } from '@/lib/api'

interface GreetingResult {
    greeting: string
    timestamp: string
}

export async function getAIGreeting(name: string, bio?: string) {
    return callInternalApi<GreetingResult>('ai/send-greeting', {
        method: 'POST',
        body: { name, bio },
    })
}
