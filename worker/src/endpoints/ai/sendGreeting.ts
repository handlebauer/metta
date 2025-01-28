import { OpenAPIRoute } from 'chanfana'
import dedent from 'dedent'
import OpenAI from 'openai'
import { z } from 'zod'

import type { ChatCompletionMessageParam } from 'openai/resources/chat/completions'

const GreetingRequest = z.object({
    name: z.string().min(1),
    bio: z.string().optional(),
    customPrompt: z.string().optional(),
})

const GreetingResponse = z.object({
    greeting: z.string(),
    timestamp: z.string(),
})

export class SendGreeting extends OpenAPIRoute {
    schema = {
        tags: ['AI'],
        summary: 'Generate a personalized AI greeting for a user',
        request: {
            body: {
                content: {
                    'application/json': {
                        schema: GreetingRequest,
                    },
                },
            },
        },
        responses: {
            '200': {
                description: 'Returns a personalized greeting',
                content: {
                    'application/json': {
                        schema: z.object({
                            success: z.boolean(),
                            result: GreetingResponse,
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

    async handle(c) {
        try {
            // Get validated data
            const data = await this.getValidatedData<typeof this.schema>()
            const { name, bio, customPrompt } = data.body

            // Initialize OpenAI client
            const openai = new OpenAI({
                apiKey: c.env.OPENAI_API_KEY,
            })

            // Construct the system prompt
            const systemPrompt = dedent`
              You are a friendly AI assistant for the Metta CRM system.
              Your task is to generate a short, memorable greeting for ${name}.
              Be a little quirky and personal.
              They are currently in the onboarding process and this is your first interaction with them.
              ${bio ? `Here is some information about ${name}: ${bio}` : ''}
              Keep the greeting concise (1-2 sentences) and make it feel in some way personal and quirky.`

            // Prepare messages array with proper typing
            const messages: ChatCompletionMessageParam[] = [
                { role: 'system', content: systemPrompt },
            ]

            if (customPrompt) {
                messages.push({ role: 'user', content: customPrompt })
            }

            // Generate the greeting using OpenAI
            const completion = await openai.chat.completions.create({
                model: 'gpt-4o-mini',
                messages,
                max_tokens: 100,
                temperature: 0.7,
            })

            const greeting =
                completion.choices[0]?.message?.content || 'Welcome to Metta!'

            return {
                success: true,
                result: {
                    greeting,
                    timestamp: new Date().toISOString(),
                },
            }
        } catch (error) {
            console.error('Error generating greeting:', error)
            return {
                success: false,
                error: 'Failed to generate greeting',
            }
        }
    }
}
