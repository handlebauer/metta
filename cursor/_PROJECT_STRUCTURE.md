# Project Structure

```
├── src/
│   ├── app/                    # Next.js app router pages
│   │   ├── (groups)/           # Route groups
│   │   ├── api/                # API routes
│   │   ├── page.tsx            # Home page (RSC)
│   │   ├── layout.tsx          # Root layout
│   │   └── error.tsx           # Error boundary
│   │
│   ├── actions/                # Server actions by feature
│   │   └── [feature]/
│   │
│   ├── auth/                   # Auth functionality
│   │   ├── middleware.ts       # Auth middleware
│   │   └── utils.ts            # Auth utilities
│   │
│   ├── components/             # UI components by feature
│   │   ├── ui/                 # shadcn components
│   │   └── [feature]/          # Other feature components
│   │       ├── *.client.tsx    # Client components (RCC)
│   │       └── *.tsx           # Server components (RSC)
│   │
│   ├── hooks/                  # Custom hooks by feature
│   │   └── use-behaviour.ts    # Behaviour-specific hooks
│   │
│   ├── lib/                    # Shared utilities
│   │   ├── errors/             # Error types/handling
│   │   ├── schemas/            # Zod schemas
│   │   ├── supabase/           # Supabase configuration
│   │   │   ├── server.ts       # Server-side client
│   │   │   ├── client.ts       # Browser client
│   │   │   └── types.ts        # Generated types
│   │   └── utils.ts            # Shared utilities
│   │
│   └── services/               # Database operations by feature
│       └── [feature].ts
│
├── supabase/                   # Supabase configuration
│   └── migrations/             # Database migrations
│
├── tests/                      # E2E tests
│   ├── *.spec.ts               # Test files
│   └── *.setup.ts              # Test setup
│
└── scripts/                    # Build/DB scripts
    └── db/                     # Database scripts
        └── dev.ts              # Development data seeding
```

## Key Conventions

- Components: Organized by feature (auth, tasks, etc.)
- Client Components: Named with `.client.tsx` suffix
- Server Components: Default, no special suffix
- Database Logic: Lives in `services/`
- Data Mutations: Lives in `actions/`
- Shared Component Logic: Lives in `hooks/`
- Type Safety: `schemas/` for runtime validation
- Testing: Playwright in `tests/`
- Supabase: Use `server.ts` in RSCs/Server Actions, `client.ts` in RCCs
- Development: Use `scripts/db/dev.ts` for seeding test data

## Common Paths

```typescript
// Components (by feature)
import { Button } from '@/components/ui/button'
import { SignInForm } from '@/components/auth/sign-in-form.client'
import { TaskList } from '@/components/tasks/task-list'
import { CreateForm } from '@/components/tasks/create-form.client'

// Data & Logic
import { taskSchema } from '@/lib/schemas/tasks'
import { createTask } from '@/actions/tasks'
import { TaskService } from '@/services/tasks'
import { useTasks } from '@/hooks/tasks'

// Supabase
import { createClient } from '@/lib/supabase/server' // For RSCs
import { createClient } from '@/lib/supabase/client' // For RCCs
import type { Tables } from '@/lib/supabase/types'
```
