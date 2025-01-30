export interface AgentMessage {
    type: string
    content: string
    name?: string
    tool_calls?: {
        id: string
        type: string
        function: {
            name: string
            arguments: string
        }
    }[]
    structured?: unknown // Generic type for structured responses
    timestamp: string
}
