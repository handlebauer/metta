create type message_role as enum ('customer', 'agent', 'system');

create table messages (
    id text primary key default gen_ulid(),
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    ticket_id text not null references tickets(id) on delete cascade,
    user_id text not null references users(id) on delete cascade,
    role message_role not null,
    content text not null,
    html_content text not null
);

-- Add RLS policies
alter table messages enable row level security;

-- Allow read access to authenticated users
create policy "Allow read access to authenticated users"
    on messages for select
    to authenticated
    using (true);

-- Allow insert access to authenticated users
create policy "Allow insert access to authenticated users"
    on messages for insert
    to authenticated
    with check (true);

-- Allow update access to message owners
create policy "Allow update access to message owners"
    on messages for update
    to authenticated
    using (user_id = auth.uid()::text)
    with check (user_id = auth.uid()::text);

-- Add updated_at trigger
create trigger set_messages_updated_at
    before update on messages
    for each row
    execute function public.handle_updated_at();
