import { defineConfig, devices } from '@playwright/test'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const PORT = process.env.PORT || 3000
const baseURL = `http://localhost:${PORT}`

// Reference: https://playwright.dev/docs/test-configuration
export default defineConfig({
    timeout: 30 * 1000, // 30 seconds
    testDir: './tests', // Test directory
    retries: 1, // If a test fails, retry it additional 1 time
    outputDir: 'test-results/', // Artifacts folder where screenshots, videos, and traces are stored.
    webServer: {
        command: 'bun dev',
        url: baseURL,
        timeout: 120 * 1000, // 120 seconds
        reuseExistingServer: !process.env.CI, // Reuse existing server
    },
    globalSetup: './tests/auth.setup.ts',
    use: {
        // Use baseURL so to make navigations relative.
        baseURL,

        // Retry a test if its failing with enabled tracing. This allows you to analyze the DOM, console logs, network traffic etc.
        // More information: https://playwright.dev/docs/trace-viewer
        trace: 'retry-with-trace',

        // All available context options: https://playwright.dev/docs/api/class-browser#browser-new-context
    },

    projects: [
        {
            name: 'Desktop Chrome',
            use: {
                ...devices['Desktop Chrome'],
                storageState: 'tests/.auth/state.json',
            },
        },
        // {
        //     name: 'Mobile Safari',
        //     use: devices['iPhone 12'],
        // },
        // {
        //   name: 'Desktop Firefox',
        //   use: {
        //     ...devices['Desktop Firefox'],
        //   },
        // },
        // {
        //   name: 'Desktop Safari',
        //   use: {
        //     ...devices['Desktop Safari'],
        //   },
        // },
        // Test against mobile viewports.
        // {
        //     name: 'Mobile Chrome',
        //     use: {
        //         ...devices['Pixel 5'],
        //     },
        // },
    ],
})
