import { OpenAPIRoute } from 'chanfana'
import dedent from 'dedent'
import OpenAI from 'openai'
import { z } from 'zod'

import { withLangfuseTrace } from '../../lib/langfuse'

import type { ChatCompletionMessageParam } from 'openai/resources/chat/completions'
import type { Env } from '../../lib/env'

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

    async handle(context: { env: Env }) {
        try {
            // Get validated data
            const data = await this.getValidatedData<typeof this.schema>()
            const { name, bio, customPrompt } = data.body

            // Initialize OpenAI client
            const openai = new OpenAI({
                apiKey: context.env.OPENAI_API_KEY,
            })

            return await withLangfuseTrace(
                {
                    secretKey: context.env.LANGFUSE_SECRET_KEY,
                    publicKey: context.env.LANGFUSE_PUBLIC_KEY,
                    baseUrl: context.env.LANGFUSE_BASEURL,
                },
                {
                    name: 'send-greeting',
                    metadata: { name, hasBio: !!bio },
                    fn: async trace => {
                        // Construct the system prompt
                        const systemPrompt = dedent`
                          You are a friendly assistant for the Metta CRM system.
                          Your task is to generate a short, memorable greeting for ${name}.
                          Use only their first name. Be a little quirky and personal. Be surprising!
                          They are currently in the onboarding process and this is your first interaction with them.
                          ${bio ? `Here is some information about ${name}: ${bio}` : ''}
                          Keep the greeting concise (1 sentence)y.`

                        // Prepare messages array with proper typing
                        const messages: ChatCompletionMessageParam[] = [
                            { role: 'system', content: systemPrompt },
                        ]

                        if (customPrompt) {
                            messages.push({
                                role: 'user',
                                content: customPrompt,
                            })
                        }

                        // Create generation span for the greeting
                        const greetingGen = trace.generation({
                            name: 'create-greeting',
                            model: 'gpt-4-turbo',
                            input: messages.map(m => m.content).join('\n'),
                        })

                        // Generate the greeting using OpenAI
                        const completion = await openai.chat.completions.create(
                            {
                                model: 'gpt-4-turbo',
                                messages,
                                max_tokens: 100,
                                temperature: 0.7,
                            },
                        )

                        const greeting =
                            completion.choices[0]?.message?.content ||
                            'Welcome to Metta!'

                        greetingGen.end({
                            output: greeting,
                        })

                        return {
                            success: true,
                            result: {
                                greeting,
                                timestamp: new Date().toISOString(),
                            },
                        }
                    },
                },
            )
        } catch (error) {
            console.error('Error generating greeting:', error)
            return {
                success: false,
                error: 'Failed to generate greeting',
            }
        }
    }
}
