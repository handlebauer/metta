# E2E Testing

## Quick Start

```typescript
// tests/tasks.spec.ts
import path from 'path'
import { expect, test } from '@playwright/test'

// Use auth state across all tests
const authFile = path.join(__dirname, '.auth/state.json')
test.use({ storageState: authFile })

test.describe('Task Management', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/tasks')
    })

    test('creates and completes a task', async ({ page }) => {
        // Create task using semantic locators
        await page.getByRole('button', { name: 'New Task' }).click()
        await page.getByRole('textbox', { name: 'Title' }).fill('Buy groceries')
        await page.getByRole('button', { name: 'Create' }).click()

        // Verify task appears in todo list
        const todoList = page.getByRole('region', { name: 'Todo Tasks' })
        await expect(todoList.getByText('Buy groceries')).toBeVisible()

        // Complete task
        await todoList.getByRole('checkbox', { name: 'Buy groceries' }).check()

        // Verify task moves to done list
        const doneList = page.getByRole('region', { name: 'Done Tasks' })
        await expect(doneList.getByText('Buy groceries')).toBeVisible()
    })

    test('handles validation errors', async ({ page }) => {
        await page.getByRole('button', { name: 'New Task' }).click()
        // Try to create without title
        await page.getByRole('button', { name: 'Create' }).click()

        // Verify error message
        await expect(
            page.getByRole('alert').getByText('Title is required'),
        ).toBeVisible()
    })

    test('loads tasks quickly', async ({ page }) => {
        const start = Date.now()
        await page.goto('/tasks')

        // Wait for task list to be interactive
        await expect(
            page.getByRole('region', { name: 'Todo Tasks' }),
        ).toBeVisible()

        expect(Date.now() - start).toBeLessThan(2000) // 2s threshold
    })
})
```

## Essential Requirements

- Use semantic locators (getByRole, getByText)
- Reuse authentication state
- Group related tests with describe blocks
- Test on multiple devices
- Keep tests focused and isolated

## Common Gotchas

- Avoid test IDs unless necessary
- Use web-first assertions that auto-wait
- Clean up test data between runs
- Handle async operations properly

## Optional Enhancements

When to add:

- Parallel execution: For faster test runs
- Custom fixtures: For complex setup
- Soft assertions: For non-critical checks
- Tracing: For debugging failures
- Test data factories: For consistent data
