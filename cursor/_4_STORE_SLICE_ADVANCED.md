# Advanced Store Patterns

## Quick Start

```typescript
// @/store/tasks.ts
import { create } from 'zustand'
import { createTask, updateTask } from '@/actions/tasks'
import { type Tables } from '@/lib/supabase/types'
import { persist } from 'zustand/middleware'

interface TaskState {
  tasks: Tables<'tasks'>[]
  isLoading: boolean
  error: string | null
}

interface TaskActions {
  // Optimistic update example
  updateStatus: (id: string, status: 'todo' | 'done') => Promise<void>
  // Batch operation example
  completeTasks: (ids: string[]) => Promise<void>
}

export const useTaskStore = create<TaskState & TaskActions>()(
  persist(
    (set, get) => ({
      tasks: [],
      isLoading: false,
      error: null,

      updateStatus: async (id, status) => {
        const previousTasks = get().tasks

        // Optimistic update
        set(state => ({
          tasks: state.tasks.map(task =>
            task.id === id ? { ...task, status } : task
          )
        }))

        try {
          const result = await updateTask({ id, status })
          if (result.error) throw new Error(result.error)
        } catch (error) {
          // Rollback on failure
          set({ tasks: previousTasks, error: error.message })
        }
      },

      completeTasks: async (ids) => {
        const previousTasks = get().tasks

        // Optimistic update
        set(state => ({
          tasks: state.tasks.map(task =>
            ids.includes(task.id) ? { ...task, status: 'done' } : task
          )
        }))

        try {
          await Promise.all(
            ids.map(id => updateTask({ id, status: 'done' }))
          )
        } catch (error) {
          // Rollback on failure
          set({ tasks: previousTasks, error: error.message })
        }
      }
    }),
    {
      name: 'task-storage',
      partialize: (state) => ({ tasks: state.tasks }) // Only persist tasks
    }
  )
)

// Usage with derived state:
export function TaskStats() {
  const tasks = useTaskStore(useShallow(state => state.tasks))
  const stats = useMemo(() => ({
    total: tasks.length,
    completed: tasks.filter(t => t.status === 'done').length
  }), [tasks])

  return (
    <div>
      <div>Total: {stats.total}</div>
      <div>Completed: {stats.completed}</div>
    </div>
  )
}
```

## Essential Requirements

- Optimistic updates with rollback
- Batch operations handling
- Persistence configuration
- Derived state with useMemo

## Common Gotchas

- Always save previous state before optimistic updates
- Handle all error cases in batch operations
- Use partialize to control what gets persisted

## Optional Enhancements

When to add:

- Middleware: For logging/debugging
- Selectors: For complex derived state
- Subscriptions: For side effects
- DevTools: For development
- Action queuing: For offline support
