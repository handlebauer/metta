# Data Model Creation

## Quick Start

```sql
-- 1. Create migration file: ./supabase/migrations/<timestamp>_add_<feature>.sql
CREATE TABLE public.tasks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  title TEXT NOT NULL,
  user_id UUID NOT NULL REFERENCES auth.users(id)
);

-- 2. Add RLS (Required)
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users can view own tasks" ON public.tasks
  FOR SELECT USING (auth.uid() = user_id);
```

```bash
# 3. Generate types
bun run supabase:gen-types
```

```typescript
// 4. Create schema: @/lib/schemas/tasks.ts
import { type Tables, type TablesInsert } from '@/lib/supabase/types'
import { z } from 'zod'

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

- Run `bun run supabase:gen-types` after ANY schema change
- Always test RLS policies with `anon` and authenticated roles
- Ensure Zod schemas match Supabase types using `satisfies`

## Optional Enhancements

When to add (only if needed):

- Indexes: For specific query performance issues
- Triggers: For essential automated updates
- Check constraints: For critical data integrity
- Composite keys: For required unique combinations
