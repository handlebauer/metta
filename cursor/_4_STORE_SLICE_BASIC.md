# Basic Store Slice Creation

## When do I need this?

You need a store slice when:

- Managing client-side state across components
- Handling optimistic updates
- Maintaining UI state that persists across renders

You might skip this layer when:

- Working with server-fetched data that doesn't need client caching
- Building simple forms that submit directly through server actions
- Creating UI components that only use local state

## Quick Start

```typescript
// @/store/tasks.ts
import { create } from 'zustand'
import { type Tables } from '@/lib/supabase/types'
import { createTask } from '@/lib/actions/tasks'

interface TaskState {
  tasks: Tables<'tasks'>[]
  isLoading: boolean
  error: string | null
}

interface TaskActions {
  create: (formData: FormData) => Promise<void>
  setError: (error: string | null) => void
}

// Create store with minimal state and one action
export const useTaskStore = create<TaskState & TaskActions>((set) => ({
  // Initial state
  tasks: [],
  isLoading: false,
  error: null,

  // Start with most common action
  create: async (formData) => {
    set({ isLoading: true, error: null })

    const result = await createTask(formData)

    if (result.error) {
      set({ error: result.error, isLoading: false })
      return
    }

    set(state => ({
      tasks: [...state.tasks, result.data],
      isLoading: false
    }))
  },

  setError: (error) => set({ error })
}))

// Usage in a component:
'use client'
export function TaskList() {
  const { tasks, create, isLoading, error } = useTaskStore()

  return (
    <div>
      {error && <div className="text-red-500">{error}</div>}
      {isLoading && <div>Creating task...</div>}
      <button
        onClick={() => create({ title: 'New Task' })}
        disabled={isLoading}
      >
        Add Task
      </button>
      <ul>
        {tasks.map(task => (
          <li key={task.id}>{task.title}</li>
        ))}
      </ul>
    </div>
  )
}
```

## Essential Requirements

- Minimal state (data, loading, error)
- One primary action that updates state
- Type safety with Supabase types
- Loading and error handling

## Common Gotchas

- Keep state minimal and flat
- Handle all loading/error states
- Use server actions for data mutations

## Optional Enhancements

When to add:

- Additional actions: As UI needs grow
- Computed values: For derived state
- Persistence: For offline support
- State slicing: For complex state
- Middleware: For logging/debugging
