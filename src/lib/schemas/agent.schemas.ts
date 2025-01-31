import { z } from 'zod'

// Base schema for function calls that matches LangGraph's ACTUAL format
const functionCallSchema = z.object({
    id: z.string(),
    type: z.string(),
    name: z.string(),
    args: z.union([z.string(), z.record(z.unknown())]),
})

// Schema for tool results that matches LangGraph's format
const _toolResultSchema = z.object({
    name: z.string(),
    content: z.string().optional().default(''),
    tool_call_id: z.string().optional().default(''),
})

// Schema for validating raw messages from LangGraph
export const langGraphMessageSchema = z.object({
    type: z.string().optional(),
    content: z.string().optional().default(''),
    tool_calls: z.array(functionCallSchema).optional(),
    name: z.string().optional(),
    tool_call_id: z.string().optional(),
})

// Schema for our normalized agent steps (what we store in the DB)
export const agentStepSchema = z.object({
    timestamp: z.string().datetime(),
    type: z.enum(['reflection', 'action', 'result']),
    content: z.string(),
    tool_calls: z
        .array(
            z.object({
                id: z.string(),
                type: z.string(),
                function: z.object({
                    name: z.string(),
                    arguments: z.string(),
                }),
            }),
        )
        .optional(),
    name: z.string().optional(),
    tool_call_id: z.string().optional(),
})

export type AgentStep = z.infer<typeof agentStepSchema>
export type LangGraphMessage = z.infer<typeof langGraphMessageSchema>
export type FunctionCall = z.infer<typeof functionCallSchema>
export type ToolResult = z.infer<typeof _toolResultSchema>
