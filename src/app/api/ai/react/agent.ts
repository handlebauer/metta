import { BaseMessageLike } from '@langchain/core/messages'
import { addMessages, entrypoint } from '@langchain/langgraph'

import { callModel, callTool } from './tasks'

const MAX_ITERATIONS = 3 // Prevent infinite loops

export const agent = entrypoint(
    'agent',
    async (messages: BaseMessageLike[]) => {
        let currentMessages = messages
        let llmResponse = await callModel(currentMessages)
        let iterations = 0

        while (true) {
            if (
                !llmResponse.tool_calls?.length ||
                iterations >= MAX_ITERATIONS
            ) {
                break
            }

            // Execute tools
            const toolResults = await Promise.all(
                llmResponse.tool_calls.map(toolCall => {
                    return callTool(toolCall)
                }),
            )

            // Append to message list
            currentMessages = addMessages(currentMessages, [
                llmResponse,
                ...toolResults,
            ])

            // Call model again
            llmResponse = await callModel(currentMessages)
            iterations++
        }

        return llmResponse
    },
)
