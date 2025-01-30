import { BaseMessageLike } from '@langchain/core/messages'
import { addMessages, entrypoint } from '@langchain/langgraph'

import { callModel, callTool } from './tasks'

const MAX_ITERATIONS = 5 // Allow more iterations for complex pattern analysis

export const agent = entrypoint(
    'firebreak',
    async (messages: BaseMessageLike[]) => {
        let currentMessages = messages
        let llmResponse = await callModel(currentMessages)
        let iterations = 0

        while (true) {
            if (
                !llmResponse.tool_calls?.length ||
                iterations >= MAX_ITERATIONS
            ) {
                // Don't return the final response if there are no more tool calls
                // This prevents duplicate messages in the stream
                if (llmResponse.tool_calls?.length) {
                    return llmResponse
                }
                break
            }

            // Execute tools in parallel for better performance
            const toolResults = await Promise.all(
                llmResponse.tool_calls.map(toolCall => callTool(toolCall)),
            )

            // Append results to message list
            currentMessages = addMessages(currentMessages, [
                llmResponse,
                ...toolResults,
            ])

            // Call model again for next iteration
            llmResponse = await callModel(currentMessages)
            iterations++
        }

        // Return null to indicate no more processing needed
        return null
    },
)
