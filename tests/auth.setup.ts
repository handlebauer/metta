import { mkdir, readFile } from 'fs/promises'
import { join } from 'path'
import { chromium, Page, request } from '@playwright/test'

import type { FullConfig } from '@playwright/test'

// ============================================================================
// Configuration
// ============================================================================

const CONFIG = {
    email: 'demo@example.com',
    maxRetries: 10,
    retryDelay: 500,
    authDir: './tests/.auth',
    timeouts: {
        magicLink: 5000,
        navigation: 10000,
        stateSettle: 1000,
    },
} as const

const AUTH_STATE_PATH = join(CONFIG.authDir, 'state.json')

// ============================================================================
// Types
// ============================================================================

interface InBucketMessage {
    id: string
    from: string
    to: string
    subject: string
    date: string
    body: {
        text: string
        html: string
    }
}

interface StorageState {
    origins: Array<{
        origin: string
        localStorage: Array<{
            name: string
            value: string
        }>
    }>
    cookies: Array<{
        name: string
        value: string
        domain: string
        path: string
        expires: number
        httpOnly: boolean
        secure: boolean
        sameSite: string
    }>
}

// ============================================================================
// Email Handling
// ============================================================================

/**
 * Manages email operations for authentication testing
 */
class EmailManager {
    private requestContext = request.newContext()

    /**
     * Clears the mailbox and verifies it's empty
     */
    async clearMailbox(): Promise<boolean> {
        const messagesUrl = this.getMailboxUrl()
        await (await this.requestContext).delete(messagesUrl)

        const items = await this.getMessages()
        if (items?.length) {
            console.log(
                `⚠️  Mailbox not empty: ${items.length} messages remain`,
            )
            return false
        }
        return true
    }

    /**
     * Retrieves the magic link from emails after a specific timestamp
     */
    async getMagicLink(requestTimestamp: number): Promise<string | null> {
        const messages = await this.getMessages()
        if (!messages?.length) return null

        const validMessages = this.filterMessagesByTimestamp(
            messages,
            requestTimestamp,
        )
        if (!validMessages.length) return null

        const latestMessage = this.getLatestMessage(validMessages)
        return this.extractMagicLink(latestMessage)
    }

    private getMailboxUrl(): string {
        return `${process.env.SUPABASE_INBUCKET_URL}/api/v1/mailbox/${CONFIG.email}`
    }

    private async getMessages(): Promise<InBucketMessage[]> {
        const response = await (
            await this.requestContext
        ).get(this.getMailboxUrl())
        if (!response.ok()) {
            console.log(
                `⚠️  Failed to fetch messages: ${response.statusText()}`,
            )
            return []
        }
        return response.json()
    }

    private filterMessagesByTimestamp(
        messages: InBucketMessage[],
        timestamp: number,
    ): InBucketMessage[] {
        const requestDate = new Date(timestamp * 1000)
        return messages.filter(msg => new Date(msg.date) > requestDate)
    }

    private getLatestMessage(messages: InBucketMessage[]): InBucketMessage {
        return messages.reduce((latest, current) => {
            return new Date(current.date) > new Date(latest.date)
                ? current
                : latest
        }, messages[0])
    }

    private async extractMagicLink(
        message: InBucketMessage,
    ): Promise<string | null> {
        const messageUrl = `${this.getMailboxUrl()}/${message.id}`
        const response = await (await this.requestContext).get(messageUrl)
        const fullMessage = (await response.json()) as InBucketMessage

        const urlMatch = fullMessage.body.text.match(
            /https?:\/\/[^\s)]+auth\/v1\/verify[^\s)]+token=[^\s)]+/,
        )

        if (!urlMatch?.[0]) return null
        return urlMatch[0].trim()
    }
}

// ============================================================================
// Authentication Flow
// ============================================================================

/**
 * Manages the authentication process for testing
 */
class AuthenticationManager {
    private emailManager = new EmailManager()

    /**
     * Verifies that the magic link request was successful
     */
    async verifyMagicLinkRequest(page: Page): Promise<boolean> {
        try {
            const result = await Promise.race([
                page
                    .getByText('Check your email')
                    .waitFor({ timeout: CONFIG.timeouts.magicLink })
                    .then(() => 'success'),
                page
                    .getByText('Error sending magic link')
                    .waitFor({ timeout: CONFIG.timeouts.magicLink })
                    .then(() => 'error'),
            ])

            return result === 'success'
        } catch (_error) {
            return false
        }
    }

    /**
     * Verifies that the auth state was properly saved
     */
    async verifyAuthState(): Promise<void> {
        const authState = JSON.parse(
            await readFile(AUTH_STATE_PATH, 'utf-8'),
        ) as StorageState

        const hasAuthCookie = authState.cookies?.some(cookie =>
            cookie.name.includes('auth-token'),
        )

        const hasAuthLocalStorage = authState.origins?.some(origin =>
            origin.localStorage?.some(
                item =>
                    item.name.includes('auth') ||
                    item.name.includes('supabase'),
            ),
        )

        if (!hasAuthCookie && !hasAuthLocalStorage) {
            throw new Error('No auth data found in cookies or localStorage')
        }
    }

    /**
     * Runs the complete authentication flow
     */
    async authenticate(page: Page, baseUrl: string): Promise<void> {
        console.log(`🔑 Starting auth flow for ${CONFIG.email}...`)

        const cleared = await this.emailManager.clearMailbox()
        if (!cleared) throw new Error('Failed to clear mailbox')

        await page.waitForTimeout(CONFIG.timeouts.stateSettle)

        const requestTimestamp = Math.floor(Date.now() / 1000)
        await page.goto(`${baseUrl}/login`)
        await page.getByPlaceholder('user@example.com').fill(CONFIG.email)
        await page.getByRole('button', { name: 'Send Magic Link' }).click()

        const requestSuccessful = await this.verifyMagicLinkRequest(page)
        if (!requestSuccessful) throw new Error('Magic link request failed')

        let loginUrl: string | null = null
        for (let attempt = 1; attempt <= CONFIG.maxRetries; attempt++) {
            loginUrl = await this.emailManager.getMagicLink(requestTimestamp)
            if (loginUrl) break
            await page.waitForTimeout(CONFIG.retryDelay)
        }

        if (!loginUrl) {
            throw new Error('Failed to retrieve magic link')
        }

        await page.goto(loginUrl)

        try {
            await page.waitForURL('**/dashboard/**', {
                timeout: CONFIG.timeouts.navigation,
                waitUntil: 'networkidle',
            })
        } catch (error) {
            console.log(`⚠️  Navigation failed: ${page.url()}`)
            throw error
        }

        await page.waitForTimeout(CONFIG.timeouts.stateSettle)
        await page.context().storageState({ path: AUTH_STATE_PATH })
        await this.verifyAuthState()
        console.log('✅ Auth flow completed successfully')
    }
}

// ============================================================================
// Setup Function
// ============================================================================

/**
 * Main setup function for Playwright authentication
 */
export default async function setup(config: FullConfig) {
    await mkdir(CONFIG.authDir, { recursive: true })

    const browser = await chromium.launch()
    const page = await browser.newPage()

    try {
        const auth = new AuthenticationManager()
        await auth.authenticate(page, config.webServer?.url ?? '')
    } finally {
        await browser.close()
    }
}
