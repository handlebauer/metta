// import { AIMessage, BaseMessage, ToolMessage } from '@langchain/core/messages'
// import dedent from 'dedent'

// import { agent } from './agent'
// import { parseFirebreakAnalysis } from './schemas'

// const SYSTEM_PROMPT = dedent`
//     You are the Firebreak agent, responsible for analyzing tickets for potential crisis patterns.
//     Your task is to:
//     1. Get tickets from the last 2 hours
//     2. If no tickets are found, stop and report that there are no tickets to analyze
//     3. If tickets are found, look for patterns that might indicate an issue, such as:
//         - Multiple tickets with similar error messages
//         - Tickets affecting the same system or component
//         - Tickets with related symptoms or behavior
//     4. Before creating any incidents:
//         - Review your pattern analysis to validate clustering decisions
//         - Merge clusters if they are too similar
//         - Tend towards creating fewer incidents
//         - IMPORTANT: Always preserve and use the exact ticket IDs provided in the input
//     5. For each validated pattern:
//         - Create a new incident ticket summarizing the pattern
//         - Link the related tickets to this incident using their exact IDs

//     Focus on identifying clear patterns that suggest a broader system issue rather than isolated problems.
//     Do not make redundant tool calls - if a tool returns no results, proceed to the final reflection.
//     Always review patterns before creating incidents to ensure high-quality clustering.
//     Remember to always use the exact ticket IDs from the input when referencing tickets.
// `

// interface BasePayload {
//     timestamp: string
//     content: string
//     type: 'action' | 'reflection' | 'result'
// }

// async function formatToolCall(
//     basePayload: BasePayload,
//     aiMessage: AIMessage,
// ): Promise<string> {
//     const payload = JSON.stringify({
//         ...basePayload,
//         type: 'action',
//         tool_calls: aiMessage.tool_calls?.map(tool => ({
//             id: tool.id,
//             type: tool.type,
//             function: {
//                 name: tool.name,
//                 arguments: JSON.stringify(tool.args),
//             },
//         })),
//     })
//     console.log('[Firebreak] Tool call:', aiMessage.tool_calls?.[0]?.name)
//     return payload
// }

// async function formatReflection(
//     basePayload: BasePayload,
//     content: string,
// ): Promise<string> {
//     try {
//         const structured = await parseFirebreakAnalysis(content)
//         console.log(
//             '[Firebreak] Analysis state:',
//             structured.analysis_state.status,
//         )
//         return JSON.stringify({
//             ...basePayload,
//             type: 'reflection',
//             structured,
//         })
//     } catch (error) {
//         console.error('[Firebreak] Failed to parse analysis:', error)
//         return JSON.stringify({
//             ...basePayload,
//             type: 'reflection',
//         })
//     }
// }

// async function formatToolResult(
//     basePayload: BasePayload,
//     toolMessage: ToolMessage,
// ): Promise<string> {
//     console.log('[Firebreak] Tool result:', toolMessage.name)
//     return JSON.stringify({
//         ...basePayload,
//         type: 'result',
//         name: toolMessage.name,
//         tool_call_id: toolMessage.tool_call_id,
//     })
// }

// async function processMessage(message: BaseMessage): Promise<string | null> {
//     const messageType = message.getType()
//     const content = String(message.content || '')

//     const basePayload = {
//         timestamp: new Date().toISOString(),
//         content,
//         type: 'reflection' as const,
//     }

//     if (messageType === 'ai') {
//         const aiMessage = message as AIMessage
//         if (aiMessage.tool_calls?.length) {
//             return formatToolCall(basePayload, aiMessage)
//         }
//         if (content) {
//             return formatReflection(basePayload, content)
//         }
//     } else if (messageType === 'tool') {
//         return formatToolResult(basePayload, message as ToolMessage)
//     }

//     return null
// }

// async function processAgentStream(
//     writer: WritableStreamDefaultWriter<Uint8Array>,
// ) {
//     console.log('[Firebreak] Starting new agent session')
//     const agentStream = await agent.stream([
//         { role: 'system', content: SYSTEM_PROMPT },
//     ])

//     const encoder = new TextEncoder()
//     let messageCount = 0

//     for await (const step of agentStream) {
//         for (const [taskName, update] of Object.entries(step)) {
//             if (taskName === 'firebreak') continue

//             const payload = await processMessage(update as BaseMessage)
//             if (payload) {
//                 await writer.write(encoder.encode(`data: ${payload}\n\n`))
//                 messageCount++
//             }
//         }
//     }

//     console.log(
//         `[Firebreak] Session complete. Processed ${messageCount} messages`,
//     )
//     await writer.write(encoder.encode('data: [DONE]\n\n'))
// }

// export async function POST(_req: Request) {
//     try {
//         const stream = new TransformStream()
//         const writer = stream.writable.getWriter()

//         const response = new Response(stream.readable, {
//             headers: {
//                 'Content-Type': 'text/event-stream',
//                 'Cache-Control': 'no-cache',
//                 Connection: 'keep-alive',
//             },
//         })

//         void (async () => {
//             let isStreamClosed = false

//             try {
//                 await processAgentStream(writer)
//             } catch (error) {
//                 // Check if this is an aborted response
//                 if (
//                     error instanceof Error &&
//                     error.name === 'ResponseAborted'
//                 ) {
//                     console.log(
//                         '[Firebreak] Client disconnected, stopping stream',
//                     )
//                     isStreamClosed = true
//                     return // Don't try to write to a disconnected stream
//                 }

//                 console.error('[Firebreak] Stream processing failed:', error)
//                 // Only try to write error if it's not an aborted response
//                 try {
//                     const encoder = new TextEncoder()
//                     await writer.write(
//                         encoder.encode(
//                             `data: {"type":"error","content":"Stream processing failed"}\n\n`,
//                         ),
//                     )
//                 } catch (writeError) {
//                     isStreamClosed = true
//                     console.error(
//                         '[Firebreak] Failed to write error:',
//                         writeError,
//                     )
//                 }
//             } finally {
//                 // Only try to close if we haven't already detected a disconnection
//                 if (isStreamClosed) {
//                     console.log('[Firebreak] Stream already closed')
//                     return
//                 }

//                 try {
//                     await writer.close()
//                 } catch (closeError) {
//                     // Only log if it's not an already-closed error
//                     if (
//                         !(
//                             closeError instanceof TypeError &&
//                             closeError.message.includes(
//                                 'WritableStream is closed',
//                             )
//                         )
//                     ) {
//                         console.error(
//                             '[Firebreak] Failed to close stream:',
//                             closeError,
//                         )
//                     }
//                 }
//             }
//         })()

//         return response
//     } catch (error) {
//         console.error('[Firebreak] Request failed:', error)
//         return Response.json(
//             { error: 'Internal server error' },
//             { status: 500 },
//         )
//     }
// }
