-- Create webhook event type enum
create type webhook_event as enum (
    'ticket.created',
    'ticket.updated',
    'ticket.closed',
    'message.created'
);

-- Create webhook endpoints table
create table webhook_endpoints (
    id text primary key default gen_ulid(),
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    user_id uuid not null references auth.users(id) on delete cascade,
    name text not null,
    url text not null,
    events webhook_event[] not null,
    active boolean not null default true,
    secret text not null -- For signing webhook payloads
);

-- Create webhook delivery attempts table for logging
create table webhook_delivery_attempts (
    id text primary key default gen_ulid(),
    created_at timestamptz not null default now(),
    webhook_id text not null references webhook_endpoints(id) on delete cascade,
    event webhook_event not null,
    payload jsonb not null,
    response_status int,
    response_body text,
    error text
);

-- Add indexes
create index webhook_endpoints_user_id_idx on webhook_endpoints(user_id);
create index webhook_endpoints_active_idx on webhook_endpoints(active);
create index webhook_delivery_attempts_webhook_id_idx on webhook_delivery_attempts(webhook_id);
create index webhook_delivery_attempts_created_at_idx on webhook_delivery_attempts(created_at);

-- Enable RLS
alter table webhook_endpoints enable row level security;
alter table webhook_delivery_attempts enable row level security;

-- Add RLS policies for webhook_endpoints
create policy "Users can view their own webhook endpoints"
    on webhook_endpoints for select
    using (auth.uid() = user_id);

create policy "Users can create their own webhook endpoints"
    on webhook_endpoints for insert
    with check (auth.uid() = user_id);

create policy "Users can update their own webhook endpoints"
    on webhook_endpoints for update
    using (auth.uid() = user_id);

create policy "Users can delete their own webhook endpoints"
    on webhook_endpoints for delete
    using (auth.uid() = user_id);

-- Add RLS policies for webhook_delivery_attempts
create policy "Users can view delivery attempts for their webhooks"
    on webhook_delivery_attempts for select
    using (
        exists (
            select 1 from webhook_endpoints
            where webhook_endpoints.id = webhook_id
            and webhook_endpoints.user_id = auth.uid()
        )
    );

-- Add updated_at trigger
create trigger set_webhook_endpoints_updated_at
    before update on webhook_endpoints
    for each row
    execute function public.handle_updated_at();

-- Function to generate a webhook secret
create or replace function generate_webhook_secret()
returns text
language plpgsql
security definer
as $$
declare
    new_secret text;
begin
    -- Generate a random secret
    new_secret := encode(gen_random_bytes(32), 'base64');
    -- Make URL safe
    new_secret := replace(replace(new_secret, '/', '_'), '+', '-');
    -- Add prefix
    new_secret := 'whsec_' || new_secret;
    return new_secret;
end;
$$;

-- Function to create a webhook endpoint with a generated secret
create or replace function create_webhook_endpoint(
    p_name text,
    p_url text,
    p_events webhook_event[],
    p_active boolean default true
)
returns webhook_endpoints
language plpgsql
security definer
as $$
declare
    v_webhook webhook_endpoints;
begin
    insert into webhook_endpoints (
        user_id,
        name,
        url,
        events,
        active,
        secret
    ) values (
        auth.uid(),
        p_name,
        p_url,
        p_events,
        p_active,
        generate_webhook_secret()
    )
    returning * into v_webhook;

    return v_webhook;
end;
$$;
