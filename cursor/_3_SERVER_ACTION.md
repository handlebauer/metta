# Server Actions Creation

## When do I need this?

You need server actions when:

- You need to perform mutations (POST, PUT, PATCH, DELETE)
- Handling form submissions in React Server Components
- Managing client-server data flow without API endpoints
- Performing mutations that need immediate cache revalidation

You might skip this layer when:

- Working purely with client-side state
- Using the service layer directly in RSCs
- Building simple UI components that don't mutate data

## Quick Start

```typescript
// @/actions/tasks.ts
'use server'

import { revalidatePath } from 'next/cache'
import { TaskService } from '@/services/tasks'
import { createTaskSchema } from '@/lib/schemas/tasks'
import { ActionError } from '@/lib/errors'

const service = new TaskService()

export async function createTask(formData: FormData) {
  try {
    const result = await service.create({
      title: formData.get('title') as string,
      user_id: 'current-user-id' // Get from auth
    })
    revalidatePath('/tasks')
    return { data: result, error: null }
  } catch (error) {
    console.error('[createTask]', error)
    return {
      data: null,
      error: error instanceof Error ? error.message : 'Failed to create task'
    }
  }
}

// Usage in a Client Component:
'use client'
import { createTask } from '@/lib/actions/tasks'

export function NewTaskForm() {
  async function handleSubmit(formData: FormData) {
    const result = await createTask(formData)

    if (result.error) {
      // Handle error
    }
  }

  return (
    <form action={handleSubmit}>
      <input name="title" required />
      <button type="submit">Create Task</button>
    </form>
  )
}

## Essential Requirements
- Mark file with 'use server'
- Error handling with user-friendly messages
- Cache invalidation after mutations
- Type-safe inputs and outputs
- Form action or function call usage

## Common Gotchas
- Always revalidate cache after mutations
- Return consistent { data, error } shape
- Handle both service and validation errors

## Optional Enhancements
When to add:
- Optimistic updates: For better UX
- Loading states: For longer operations
- Batch operations: For multi-item actions
- Form validation: For complex inputs
- Specialized error handling: For specific cases
```
