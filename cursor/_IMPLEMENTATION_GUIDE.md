# Feature Implementation Analysis Guide

To analyze a feature's implementation needs, consider each question:

## Data Requirements

1. What data needs to be stored?

    - [ ] New database table required?
    - [ ] Changes to existing tables needed?
    - [ ] No persistence required?

2. What type of data access is needed?
    - [ ] Read operations (GET)
    - [ ] Write operations (POST/PUT/PATCH/DELETE)
    - [ ] Real-time updates
    - [ ] Offline capabilities

## Data Fetching Strategy

1. How will data be accessed?
    - [ ] GET requests in RSCs (preferred)
        - Static data display
        - Server-rendered lists
        - Initial page data
    - [ ] Route Handlers
        - Complex GET requests
        - Custom API endpoints
        - Third-party API proxying
    - [ ] Server Actions
        - Form submissions
        - Data mutations
        - Cache invalidation

## UI/UX Requirements

1. How will users interact with the data?

    - [ ] View-only display
    - [ ] Form submissions
    - [ ] Real-time updates
    - [ ] Complex interactions

2. What client-side state is needed?

    - [ ] Form state
    - [ ] UI state (loading, errors)
    - [ ] Cached server data
    - [ ] Complex state management

3. Component Type Decision
    - [ ] Server Component (RSC) candidate?
        - Static or infrequently updated content
        - SEO requirements
        - Direct database access needed
    - [ ] Client Component (RCC) required?
        - User interactions (besides forms)
        - Browser APIs needed
        - Real-time updates
        - Client-side state

## Code Reuse

1. Will this logic be shared?
    - [ ] Across multiple components
    - [ ] With other features
    - [ ] One-off implementation

## Implementation Layers

Based on the requirements above, which layers are needed:

1. Data Model (@\_1_DATA_MODEL.md)

    - Required if storing data
    - Defines database schema and types

2. Services (@\_2_SERVICES_LAYER.md)

    - Required for database operations
    - Handles data validation

3. Server Actions (@\_3_SERVER_ACTION.md)

    - Required for form submissions in RSCs
    - Handles server mutations

4. Store (@\_4_STORE_SLICE_BASIC.md/@\_4_STORE_SLICE_ADVANCED.md)

    - Required for complex client state
    - Manages shared client data

5. Hooks (@\_5_HOOKS.md)

    - Required for shared component logic
    - Combines multiple layers

6. UI Components (@\_6_UI_COMPONENT.md)

    - Required for user interface
    - Implements the feature

7. E2E Tests (@\_7_E2E_TESTS.md)
    - Required for feature testing

## Example Analysis

For a "Task Management" feature:

```typescript
// Basic Requirements:
// - Store tasks in database
// - Display task list
// - Create new tasks
// - Update task status

// Data Fetching Strategy:
// - TaskList: RSC with direct database query (GET)
// - TaskCreate: Server Action (POST)
// - TaskUpdate: Server Action (PATCH)
// - TaskSearch: Route Handler (complex GET with params)

// Component Strategy:
// - TaskList: RSC (uses direct DB query or service call)
// - CreateTaskForm: RCC (needs loading state)
// - TaskItem: RSC (static display)

// Basic Implementation Layers:
// 1. Data Model: Task table + schemas
// 2. Service: Task operations + validation
// 3. Server Components: For data display
// 4. Server Actions: For mutations
// 5. UI Components:
//    - RSC: TaskList, TaskItem
//    - RCC: CreateTaskForm (minimal client state)

// Optional Advanced Requirements (implement only if needed):
// - Optimistic updates for instant feedback
// - Offline task creation
// - Real-time updates across tabs
// - Complex task filtering/sorting
// - Batch task operations
// - Undo/redo support

// Optional Additional Layers:
// 5. Store: For optimistic updates and offline support
// 6. Hooks: For sharing task logic across components
// 7. E2E Tests: For critical task workflows

// Component Strategy Changes for Advanced Features:
// - TaskList: Convert to RCC if real-time updates needed
// - TaskItem: Convert to RCC if inline editing needed
// - New RCC: TaskFilter for complex filtering
```

## Response Format

Please analyze the feature and provide:

1. Required implementation layers
2. Component types (RSC vs RCC) with justification
3. Implementation order
4. Justification for each layer
5. Any layers that can be skipped

Remember:

- Start with minimal implementation
- Default to RSC when possible
- Add client components only when needed
- Add layers only when justified
- Consider maintenance costs
