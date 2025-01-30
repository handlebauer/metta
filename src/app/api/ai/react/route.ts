import { BaseMessage, isAIMessage } from '@langchain/core/messages'

import { agent } from './agent'

interface ToolMessageContent {
    lc_kwargs?: {
        content?: string
    }
    content?: string
    lc_serializable?: boolean
    kwargs?: {
        content?: string
        tool_call_id?: string
        name?: string
    }
}

export async function GET(req: Request) {
    const url = new URL(req.url)
    const prompt = url.searchParams.get('prompt')

    if (!prompt) {
        return Response.json({ error: 'No prompt provided' }, { status: 400 })
    }

    // Set up Server-Sent Events headers
    const encoder = new TextEncoder()
    const stream = new TransformStream()
    const writer = stream.writable.getWriter()

    // Start the response
    const response = new Response(stream.readable, {
        headers: {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            Connection: 'keep-alive',
        },
    })

    const agentStream = await agent.stream([{ role: 'user', content: prompt }])

    // Process the stream in the background
    void (async () => {
        try {
            for await (const step of agentStream) {
                for (const [taskName, update] of Object.entries(step)) {
                    const message = update as BaseMessage
                    console.log(message.getType(), taskName)

                    // Extract content based on message type and structure
                    let content: string
                    const rawContent = message.content

                    if (typeof rawContent === 'object' && rawContent !== null) {
                        const toolContent = rawContent as ToolMessageContent
                        if (toolContent.lc_kwargs?.content) {
                            content = toolContent.lc_kwargs.content
                        } else if (toolContent.kwargs?.content) {
                            content = toolContent.kwargs.content
                        } else if (toolContent.content) {
                            content = toolContent.content
                        } else {
                            // If we can't find the content in expected places, stringify the whole object
                            content = JSON.stringify(rawContent)
                        }
                    } else {
                        content = String(rawContent || '')
                    }

                    // Handle tool calls from AIMessage
                    let toolCalls
                    if (isAIMessage(message)) {
                        toolCalls = message.tool_calls?.map(call => ({
                            id: call.id,
                            type: call.type,
                            function: {
                                name: call.name,
                                arguments: call.args,
                            },
                        }))
                    }

                    // Create a clean payload for the frontend
                    const payload = JSON.stringify({
                        type: message.getType(),
                        content: content.trim(),
                        tool_calls: toolCalls,
                    })

                    await writer.write(encoder.encode(`data: ${payload}\n\n`))
                }
            }
            // Send a completion message before closing
            await writer.write(encoder.encode('data: [DONE]\n\n'))
        } finally {
            await writer.close()
        }
    })()

    return response
}
