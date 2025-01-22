import { expect, test } from '@playwright/test'

// Core ticket functionality tests
test.describe('Ticket Management - Core @smoke', () => {
    test.beforeEach(async ({ page }) => {
        // Start from the dashboard tickets page
        await page.goto('/dashboard/tickets')
    })

    test('admin can create a new ticket @critical', async ({ page }) => {
        // Click create ticket button (from the tickets page)
        await page.getByRole('link', { name: 'Create' }).click()

        // Wait for navigation to new ticket page
        await expect(page).toHaveURL('/dashboard/tickets/new')

        // Fill in the ticket form
        // Select customer (requester)
        await page.getByRole('combobox', { name: 'Requester' }).click()
        await page
            .getByRole('option', { name: /customer/i })
            .first()
            .click()

        // Fill subject and description
        await page
            .getByRole('textbox', { name: 'Subject' })
            .fill('Test Ticket Subject')
        await page
            .getByRole('textbox', { name: 'Description' })
            .fill('This is a test ticket description')

        // Select priority
        await page.getByRole('combobox', { name: 'Priority' }).click()
        await page.getByRole('option', { name: 'High' }).click()

        // Optional: Assign to self
        await page.getByRole('combobox', { name: 'Assignee' }).click()
        await page.getByRole('option', { name: 'Leave unassigned' }).click()

        // Submit the form and wait for navigation
        const submitPromise = page.waitForNavigation()
        await page.getByRole('button', { name: 'Create Ticket' }).click()
        await submitPromise

        // Verify redirect to tickets page
        await expect(page).toHaveURL('/dashboard/tickets')

        // Verify the new ticket appears in the list
        await expect(
            page.getByRole('cell', { name: 'Test Ticket Subject' }).first(),
        ).toBeVisible()
    })
})

// Extended ticket functionality tests
test.describe('Ticket Management - Extended', () => {
    test.beforeEach(async ({ page }) => {
        // Start from the dashboard tickets page
        await page.goto('/dashboard/tickets')
    })

    test('validates required fields', async ({ page }) => {
        // Navigate to new ticket form
        await page.getByRole('link', { name: 'Create' }).click()
        await expect(page).toHaveURL('/dashboard/tickets/new')

        // Try to submit without required fields
        await page.getByRole('button', { name: 'Create Ticket' }).click()

        // Wait for form validation to complete and show error messages
        await page.waitForTimeout(250) // Give time for validation to complete

        // Verify validation messages (these are Zod's default messages)
        await expect(
            page.locator('p.text-destructive').filter({
                hasText: 'String must contain at least 1 character(s)',
            }),
        ).toBeVisible() // For subject
    })
})
