import { expect, test } from '@playwright/test'

test.describe('Authentication and Dashboard', () => {
    test.describe('authenticated user', () => {
        test('can access and view dashboard', async ({ page }) => {
            await test.step('navigate to dashboard', async () => {
                await page.goto('/dashboard')
            })

            await test.step('verify dashboard content', async () => {
                // Wait for the page to be fully loaded
                await page.waitForLoadState('networkidle')

                // Verify we're on the dashboard page
                await expect(page).toHaveURL(/.*\/dashboard/)

                // Verify navigation is present
                await expect(page.getByRole('navigation')).toBeVisible()

                // Verify user menu is present (it should show demo@example.com)
                await expect(
                    page.getByText('demo@example.com', { exact: true }),
                ).toBeVisible()

                // Verify sign out button is present
                await expect(
                    page.getByRole('button', { name: /sign out/i }),
                ).toBeEnabled()
            })
        })
    })

    test.describe('unauthenticated user', () => {
        test('is redirected to login page', async ({ browser }) => {
            // Create a new context without authentication
            const context = await browser.newContext({
                storageState: undefined,
            })
            const page = await context.newPage()

            try {
                await test.step('attempt to access dashboard', async () => {
                    await page.goto('/dashboard')
                    // Use more precise URL matching
                    await expect(page).toHaveURL(/.*\/login$/)
                })

                await test.step('verify login page content', async () => {
                    // Check page title (CardTitle renders as div)
                    await expect(
                        page.getByText('Welcome back', { exact: true }),
                    ).toBeVisible()
                    await expect(
                        page.getByText('Sign in to your account', {
                            exact: true,
                        }),
                    ).toBeVisible()

                    // Check form elements using more specific selectors
                    const emailInput = page.getByPlaceholder('user@example.com')
                    await expect(emailInput).toBeVisible()
                    await expect(emailInput).toBeEmpty()
                    await expect(emailInput).toHaveAttribute('type', 'email')
                    await expect(emailInput).toHaveAttribute('required', '')
                    await expect(emailInput).toBeEnabled()

                    // Check button in different states
                    const submitButton = page.getByRole('button', {
                        name: 'Send Magic Link',
                    })
                    await expect(submitButton).toBeVisible()
                    await expect(submitButton).toBeEnabled()
                    await expect(submitButton).toHaveAttribute('type', 'submit')
                })
            } finally {
                await context.close()
            }
        })
    })
})
