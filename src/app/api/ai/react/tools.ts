import { tool } from '@langchain/core/tools'
import { ChatOpenAI } from '@langchain/openai'
import { z } from 'zod'

export const model = new ChatOpenAI({
    model: 'gpt-4o-mini',
})

export const getWeather = tool(
    async ({ location }) => {
        const lowercaseLocation = location.toLowerCase()
        if (
            lowercaseLocation.includes('sf') ||
            lowercaseLocation.includes('san francisco')
        ) {
            return "It's sunny!"
        } else if (lowercaseLocation.includes('boston')) {
            return "It's rainy!"
        } else {
            return `I apologize, but I can only provide weather information for San Francisco and Boston at the moment. For ${location}, you would need to check a weather service or website for accurate information.`
        }
    },
    {
        name: 'getWeather',
        schema: z.object({
            location: z.string().describe('location to get the weather for'),
        }),
        description:
            'Get the current weather. Only available for San Francisco and Boston.',
    },
)

export const tools = [getWeather]
