# Service Layer Creation

## Quick Start

```typescript
// @/services/tasks.ts
import { z } from 'zod'

import { DatabaseError } from '@/lib/errors'
import { createTaskSchema, taskSchema } from '@/lib/schemas/tasks'
import { createClient } from '@/lib/supabase/server'

import type { Tables } from '@/lib/supabase/types'

export class TaskService {
    private db = createClient() // requires `await` before use

    // Start with the operations you need most
    async findById(id: string): Promise<Tables<'tasks'>> {
        const { data, error } = await this.db
            .from('tasks')
            .select('*')
            .eq('id', id)
            .single()

        if (error) throw new DatabaseError(error.message)
        return taskSchema.parse(data)
    }

    async create(input: z.infer<typeof createTaskSchema>) {
        const validated = createTaskSchema.parse(input)
        const { data, error } = await this.db
            .from('tasks')
            .insert(validated)
            .select()
            .single()

        if (error) throw new DatabaseError(error.message)
        return data as Tables<'tasks'> // Already validated by RLS and schema
    }
}

// Usage:
const service = new TaskService()
const task = await service.create({
    title: 'New Task',
    user_id: 'current-user-id',
})
```

## Essential Requirements

- One primary operation (e.g., create or find)
- Error handling with custom error types
- Zod validation on all responses
- Type safety with Supabase types

## Common Gotchas

- Always validate response data with Zod
- Handle database errors consistently
- Use transactions for multi-table operations

## Optional Enhancements

When to add:

- Additional CRUD operations: As needed by UI
- Pagination: When list size grows
- Complex queries: For specialized filters
- Batch operations: For bulk actions
- Optimistic updates: For better UX
