# Implementation Overview

## Flow Definition

```yaml
steps:
    data_model:
        file: _1_DATA_MODEL.md
        provides:
            - database_schema
            - rls_policies
            - supabase_types
            - zod_schemas
        critical_patterns: [security, type_safety]
        required: true

    services_layer:
        file: _2_SERVICES_LAYER.md
        requires: [database_schema, supabase_types]
        provides: [database_operations]
        critical_patterns: [error_handling]
        required: true
        note: 'Start with minimal operations, expand as needed'

    server_actions:
        file: _3_SERVER_ACTION.md
        requires: [database_operations]
        provides: [api_endpoints, cache_invalidation]
        critical_patterns: [validation, caching]
        required: true

    store_slice:
        file: _4_STORE_SLICE_BASIC.md
        requires: [api_endpoints]
        provides: [client_state]
        critical_patterns: [state_management]
        required: true
        variants:
            advanced:
                file: _4_STORE_SLICE_ADVANCED.md
                when: ['optimistic_updates', 'complex_state']
                required: false

    hooks:
        file: _5_HOOKS.md
        requires: [client_state]
        provides: [reusable_logic]
        critical_patterns: [composition]
        required: false
        note: 'Create only when logic is reused across components'

    ui_component:
        file: _6_UI_COMPONENT.md
        requires: [client_state]
        provides: [user_interface]
        critical_patterns: [accessibility]
        required: true

    e2e_testing:
        file: _7_E2E_TESTING.md
        requires: [user_interface]
        provides: [integration_tests]
        critical_patterns: [user_flows]
        required: true
```

## Core Patterns

```yaml
patterns:
    security:
        required: true
        features:
            - row_level_security
            - type_safe_operations
            - input_validation

    error_handling:
        required: true
        features:
            - user_friendly_messages
            - consistent_error_types
            - graceful_recovery

    state_management:
        required: true
        features:
            - loading_states
            - error_states
            - minimal_client_state

    testing:
        required: true
        features:
            - core_user_flows
            - error_scenarios
            - performance_checks
```

## Implementation Guide

1. Start Small:

    - Create minimal data model with security
    - Implement core operations only
    - Add features incrementally

2. Focus on Security:

    - Always implement RLS policies
    - Validate all inputs with Zod
    - Type-check all operations

3. Prioritize UX:

    - Handle all loading states
    - Show clear error messages
    - Make UI accessible

4. Test Critical Paths:
    - Write E2E tests for core flows
    - Verify error handling
    - Check performance

## Development Flow

1. Define data model and security rules
2. Create minimal service with core operations
3. Add server actions with cache handling
4. Implement basic client state
5. Build UI with proper accessibility
6. Write E2E tests for critical paths
7. Enhance based on requirements:
    - Add more operations as needed
    - Create hooks for reused logic
    - Implement optimistic updates
    - Add advanced testing
