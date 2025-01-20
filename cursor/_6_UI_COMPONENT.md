# UI Component Creation

## Quick Start

```typescript
// First, add required shadcn components:
// bun run shadcn:add card checkbox button skeleton

// Note: shadcn components use a CSS variables theme system
// Check @/app/globals.css for theme variables
// Check tailwind.config.ts for theme configuration

// React Client Components end with `.client.tsx`
// React Server Components do not have a specific file extension

// @/components/tasks/task-list.tsx
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Skeleton } from '@/components/ui/skeleton'
import { useTasks, useTaskActions } from '@/hooks/use-tasks'

interface TaskListProps {
  status?: 'todo' | 'done'
  className?: string
}

export function TaskList({ status, className }: TaskListProps) {
  const { tasks, isLoading, error } = useTasks(status)
  const { updateStatus } = useTaskActions()

  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-[68px] w-full" />
        <Skeleton className="h-[68px] w-full" />
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <Card className="p-6 bg-destructive/10">
        <p className="text-destructive">Failed to load tasks: {error}</p>
      </Card>
    )
  }

  // Empty state
  if (!tasks.length) {
    return (
      <Card className="p-6">
        <p className="text-muted-foreground">No tasks found</p>
      </Card>
    )
  }

  // Data state
  return (
    <div className={className}>
      {tasks.map(task => (
        <Card key={task.id} className="p-4 flex items-center gap-3">
          <Checkbox
            checked={task.status === 'done'}
            onCheckedChange={(checked) => {
              updateStatus(task.id, checked ? 'done' : 'todo')
            }}
          />
          <span className={task.status === 'done' ? 'line-through' : ''}>
            {task.title}
          </span>
        </Card>
      ))}
    </div>
  )
}

// Usage in a page:
export default function TasksPage() {
  return (
    <div className="container py-8 space-y-8">
      <div>
        <h2 className="text-lg font-semibold mb-4">To Do</h2>
        <TaskList status="todo" className="space-y-2" />
      </div>
      <div>
        <h2 className="text-lg font-semibold mb-4">Done</h2>
        <TaskList status="done" className="space-y-2" />
      </div>
    </div>
  )
}
```

## Essential Requirements

- Handle all states (loading, error, empty, data)
- Use shadcn/ui components
- Follow Tailwind class patterns
- Implement basic accessibility
- Use theme CSS variables for consistency:
    - `text-primary` for main text
    - `text-muted-foreground` for secondary text
    - `bg-background` for main backgrounds
    - `bg-card` for elevated surfaces
    - `text-destructive` for error states

## Common Gotchas

- Always provide loading states
- Handle error states gracefully
- Make components keyboard accessible
- Use semantic color tokens instead of raw colors

## Optional Enhancements

When to add:

- Animations: For status changes
- Sorting: For large lists
- Filtering: For complex data
- Error boundaries: For robust error handling
- Server components: For static parts
- Custom theme variants: For specialized UI states
