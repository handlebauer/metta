import { fromHono } from 'chanfana'
import { Hono } from 'hono'

import { SendGreeting } from './endpoints/ai/sendGreeting'

// Start a Hono app
const app = new Hono()

// Setup OpenAPI registry
const openapi = fromHono(app, {
    docs_url: '/',
})

// Register AI endpoints
openapi.post('/api/ai/send-greeting', SendGreeting)

// Export the Hono app
export default app
