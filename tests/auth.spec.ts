import { expect, test } from '@playwright/test'

test.describe('Authentication and Dashboard', () => {
    test.describe('authenticated user', () => {
        test('can access and view dashboard', async ({ page }) => {
            await test.step('navigate to dashboard', async () => {
                await page.goto('/dashboard')
            })

            await test.step('verify dashboard header', async () => {
                // Use semantic heading roles for better accessibility testing
                await expect(
                    page.getByRole('heading', { name: 'Dashboard', level: 1 }),
                ).toBeVisible()
                await expect(
                    page.getByRole('heading', {
                        name: 'Welcome to your Dashboard',
                        level: 2,
                    }),
                ).toBeVisible()
            })

            await test.step('verify user information', async () => {
                // Use more specific selector for the email text
                const emailText = page.getByText(
                    'You are signed in as hello@hello.com',
                    {
                        exact: true,
                    },
                )
                await expect(emailText).toBeVisible()
            })

            await test.step('verify navigation elements', async () => {
                // Use semantic roles for better accessibility testing
                await expect(page.getByRole('navigation')).toBeVisible()
                await expect(
                    page.getByRole('button', { name: 'Sign out' }),
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
