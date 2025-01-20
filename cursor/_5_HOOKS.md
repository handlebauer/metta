# Custom Hooks Creation

## When do I need this?

You need custom hooks when:

- Sharing complex logic between multiple components
- Combining store and server actions in a reusable way
- Managing component-specific side effects or state

You might skip this layer when:

- Components can use store/actions directly
- Logic is simple enough to live in the component
- Functionality isn't reused across components

## Quick Start

```typescript
// @/hooks/use-tasks.ts
import { useCallback } from 'react'
import { useTaskStore } from '@/store/tasks'
import { createTask } from '@/actions/tasks'

export function useTasks() {
  const { tasks, isLoading, error } = useTaskStore()

  const handleCreate = useCallback(async (formData: FormData) => {
    const result = await createTask(formData)
    if (result.error) {
      // Custom error handling
    }
    return result
  }, [])

  return {
    tasks,
    isLoading,
    error,
    createTask: handleCreate
  }
}

// Usage in a component:
export function TaskList() {
  const { tasks, createTask, isLoading } = useTasks()

  return (
    <div>
      {/* Component logic */}
    </div>
  )
}
```

## Essential Requirements

- Clear single responsibility
- Combine related actions
- Proper cleanup in useEffect
- Memoization of callbacks and values
- Type safety for inputs/outputs

## Common Gotchas

- Avoid premature abstraction
- Handle cleanup to prevent memory leaks
- Consider hook dependencies carefully

## Optional Enhancements

When to add:

- Error boundaries: For predictable error handling
- Loading states: For better UX
- Caching: For expensive operations
- Debouncing/throttling: For performance
