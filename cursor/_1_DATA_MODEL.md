# Data Model Creation

## Quick Start

1. Create migration file: ./supabase/migrations/<timestamp>_add_<feature>.sql

```sql
CREATE TABLE public.tasks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  title TEXT NOT NULL,
  user_id UUID NOT NULL REFERENCES auth.users(id)
);
```

2. Add RLS (Required)

```sql
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users can view own tasks" ON public.tasks
  FOR SELECT USING (auth.uid() = user_id);
```

3. Migrate and generate types

```bash
bun run supabase:init
```

4. Create schema: @/lib/schemas/tasks.ts

```typescript
import { z } from 'zod'

import { type Tables, type TablesInsert } from '@/lib/supabase/types'

// Runtime validation schema - use at service layer entry points
export const taskSchema = z.object({
    id: z.string().uuid(),
    created_at: z.string().datetime(),
    title: z.string().min(1),
    user_id: z.string().uuid(),
}) satisfies z.ZodType<Tables<'tasks'>>

// Input validation schema - use at form/API boundaries
export const createTaskSchema = taskSchema.omit({
    id: true,
    created_at: true,
}) satisfies z.ZodType<TablesInsert<'tasks'>>

// Note: Additional schemas (e.g., updateTaskSchema, taskFilterSchema) can be added
// if and when specific validation needs arise. Start with just what you need.
```

## Essential Requirements

- Table name and fields
- Foreign key relationships
- RLS policies for each operation (SELECT, INSERT, etc.)
- Zod schema with runtime validations
- Generated Supabase types

## Common Gotchas

- You must execute the `bun run supabase:init` command after mutating a migration file
- Always test RLS policies with `anon` and authenticated roles
- Ensure Zod schemas match Supabase types using `satisfies`

## Optional Enhancements

When to add (only if needed):

- Indexes: For specific query performance issues
- Triggers: For essential automated updates
- Check constraints: For critical data integrity
- Composite keys: For required unique combinations
