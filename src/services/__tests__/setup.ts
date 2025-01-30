import { mock } from 'bun:test'
import dotenv from 'dotenv'

// Set required environment variables
process.env.SENDGRID_API_KEY = 'test-api-key'

// Load environment variables
dotenv.config({ path: '.env.local' })

// Mock SendGrid
mock.module('@sendgrid/mail', () => ({
    setApiKey: () => {},
    send: () => Promise.resolve(),
    default: {
        setApiKey: () => {},
        send: () => Promise.resolve(),
    },
}))

// Mock SendGrid initialization
mock.module('@/lib/sendgrid/index', () => ({
    default: {
        setApiKey: () => {},
        send: () => Promise.resolve(),
    },
}))
