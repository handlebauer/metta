-- Create a function to get the current token from headers
create or replace function current_ticket_token()
returns text
language plpgsql
security definer
as $$
declare
    headers json;
begin
    -- Get headers safely, return null if not set
    begin
        headers := current_setting('request.headers', true)::json;
    exception when others then
        return null;
    end;

    -- Return token from headers
    return headers->>'x-ticket-token';
end;
$$;

-- Drop existing policies
drop policy if exists "Token holders can view users" on users;
drop policy if exists "Token holders can view profiles" on profiles;
drop policy if exists "Token holders can view tickets" on tickets;
drop policy if exists "Token holders can view messages" on messages;
drop policy if exists "Token holders can create messages" on messages;

-- Enable RLS for messages
alter table messages enable row level security;

-- Add updated RLS policy for token-based access to users
create policy "Token holders can view users"
    on users
    for select
    using (
        exists (
            select 1
            from ticket_access_tokens t
            where (
                -- Check both token sources, handling nulls
                (t.token = current_ticket_token() and current_ticket_token() is not null)
                or (t.token = current_setting('app.token', true) and current_setting('app.token', true) is not null)
            )
            and t.expires_at > now()
        )
    );

-- Allow token holders to view profiles
create policy "Token holders can view profiles"
    on profiles
    for select
    using (
        exists (
            select 1
            from ticket_access_tokens t
            where (
                (t.token = current_ticket_token() and current_ticket_token() is not null)
                or (t.token = current_setting('app.token', true) and current_setting('app.token', true) is not null)
            )
            and t.expires_at > now()
        )
    );

-- Add RLS policy for token-based access to tickets
create policy "Token holders can view tickets"
    on tickets
    for select
    using (
        exists (
            select 1
            from ticket_access_tokens t
            where t.ticket_id = tickets.id
            and (
                (t.token = current_ticket_token() and current_ticket_token() is not null)
                or (t.token = current_setting('app.token', true) and current_setting('app.token', true) is not null)
            )
            and t.expires_at > now()
        )
    );

-- Add RLS policy for token-based access to messages
create policy "Token holders can view messages"
    on messages
    for select
    using (
        exists (
            select 1
            from ticket_access_tokens t
            where t.ticket_id = messages.ticket_id
            and (
                (t.token = current_ticket_token() and current_ticket_token() is not null)
                or (t.token = current_setting('app.token', true) and current_setting('app.token', true) is not null)
            )
            and t.expires_at > now()
        )
    );

-- Add RLS policy for token-based message creation
create policy "Token holders can create messages"
    on messages
    for insert
    with check (
        exists (
            select 1
            from ticket_access_tokens t
            where t.ticket_id = ticket_id
            and (
                (t.token = current_ticket_token() and current_ticket_token() is not null)
                or (t.token = current_setting('app.token', true) and current_setting('app.token', true) is not null)
            )
            and t.expires_at > now()
        )
    );
