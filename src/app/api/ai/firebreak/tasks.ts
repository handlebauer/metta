import { ToolMessage } from '@langchain/core/messages'
import { type ToolCall } from '@langchain/core/messages/tool'
import { task } from '@langchain/langgraph'

import { model, tools } from './tools'

import type { BaseMessageLike } from '@langchain/core/messages'

const toolsByName = Object.fromEntries(tools.map(tool => [tool.name, tool]))

export const callModel = task(
    'callModel',
    async (messages: BaseMessageLike[]) => {
        const response = await model.bindTools(tools).invoke(messages)
        return response
    },
)

export const callTool = task(
    'callTool',
    async (toolCall: ToolCall): Promise<ToolMessage> => {
        if (toolCall.id) {
            const tool = toolsByName[toolCall.name]
            const observation = await tool.invoke(toolCall)

            // Ensure observation is a string
            const content =
                typeof observation === 'object'
                    ? observation?.content || JSON.stringify(observation)
                    : String(observation)

            return new ToolMessage({
                content,
                tool_call_id: toolCall.id,
                name: toolCall.name,
            })
        }
        throw new Error('Tool call id is required')
    },
)
