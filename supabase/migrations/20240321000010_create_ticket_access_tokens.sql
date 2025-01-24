-- Create ticket access tokens table
create table ticket_access_tokens (
    id text primary key default gen_ulid(),
    ticket_id text not null references tickets(id) on delete cascade,
    token text not null unique,
    expires_at timestamptz not null,
    created_at timestamptz not null default now(),
    created_by text not null references users(id) on delete cascade,
    last_accessed_at timestamptz
);

-- Create indexes
create index ticket_access_tokens_ticket_id_idx on ticket_access_tokens(ticket_id);
create index ticket_access_tokens_token_idx on ticket_access_tokens(token);
create index ticket_access_tokens_expires_at_idx on ticket_access_tokens(expires_at);

-- Grant necessary permissions to anon role
grant usage on schema public to anon;
grant select on ticket_access_tokens to anon;
grant select on tickets to anon;
grant select on users to anon;
grant select on profiles to anon;
grant select on messages to anon;

-- Enable RLS
alter table ticket_access_tokens enable row level security;

-- Create a function to check if a token grants access to a ticket
create or replace function has_token_access(p_ticket_id text, p_token text)
returns boolean
language plpgsql
security definer
as $$
begin
    return exists (
        select 1
        from ticket_access_tokens
        where ticket_id = p_ticket_id
        and token = p_token
        and expires_at > now()
    );
end;
$$;

-- Create function to generate a secure token
create or replace function generate_ticket_access_token(
    p_ticket_id text,
    p_expires_in interval default interval '7 days',
    p_created_by text default auth.uid()::text
)
returns text
language plpgsql
security definer
as $$
declare
    v_token text;
begin
    -- Generate a random token
    v_token := encode(gen_random_bytes(32), 'base64');
    -- Make URL safe
    v_token := replace(replace(v_token, '/', '_'), '+', '-');

    -- Insert the token
    insert into ticket_access_tokens (
        ticket_id,
        token,
        expires_at,
        created_by
    ) values (
        p_ticket_id,
        v_token,
        now() + p_expires_in,
        p_created_by
    );

    return v_token;
end;
$$;

-- Create a function to set the current token for the session
create or replace function set_ticket_access_token(p_token text)
returns void
language plpgsql
security definer
as $$
begin
    -- Verify token exists and is valid
    if exists (
        select 1
        from ticket_access_tokens
        where token = p_token
        and expires_at > now()
    ) then
        -- Set the token for the current session
        perform set_config('app.token', p_token, false);
    else
        raise exception 'Invalid or expired token';
    end if;
end;
$$;

-- Grant execute on functions
grant execute on function has_token_access to anon;
grant execute on function set_ticket_access_token to anon;

-- Add basic RLS policies for ticket_access_tokens
create policy "Anyone can view valid tokens"
    on ticket_access_tokens
    for select
    using (expires_at > now());

create policy "Agents can create tokens"
    on ticket_access_tokens
    for insert
    with check (
        exists (
            select 1 from profiles
            where user_id = auth.uid()::text
            and role in ('agent', 'admin')
        )
    );

create policy "Agents can update tokens they created"
    on ticket_access_tokens
    for update
    using (
        created_by = auth.uid()::text
        and exists (
            select 1 from profiles
            where user_id = auth.uid()::text
            and role in ('agent', 'admin')
        )
    );
