import { fromHono } from 'chanfana'
import { Hono } from 'hono'

import { IngestWebpages } from './endpoints/ai/ingest-webpages/route'
import { SearchVectors } from './endpoints/ai/searchVectors'
import { SendGreeting } from './endpoints/ai/sendGreeting'

// Start a Hono app
const app = new Hono()

// Setup OpenAPI registry
const openapi = fromHono(app, {
    docs_url: '/',
})

// Register AI endpoints
openapi.post('/api/ai/send-greeting', SendGreeting)
openapi.post('/api/ai/ingest-webpages', IngestWebpages)
openapi.post('/api/ai/search-vectors', SearchVectors)

// Export the Hono app
export default app
