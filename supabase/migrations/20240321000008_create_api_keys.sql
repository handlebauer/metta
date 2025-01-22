-- Enable the vault extension if not already enabled
create extension if not exists supabase_vault with schema vault;

-- Create API keys table
create type api_key_status as enum ('active', 'revoked', 'expired');

create table api_keys (
    id text primary key default gen_ulid(),
    name text not null,
    -- The key will be stored encrypted in the vault
    key_id uuid not null references vault.secrets(id),
    user_id uuid not null references auth.users(id),
    status api_key_status not null default 'active',
    last_used_at timestamp with time zone,
    expires_at timestamp with time zone,
    created_at timestamp with time zone default now(),
    updated_at timestamp with time zone default now()
);

-- Add RLS policies
alter table api_keys enable row level security;

-- Only allow users to see their own API keys
create policy "Users can view their own API keys"
    on api_keys for select
    using (auth.uid() = user_id);

-- Only allow users to insert their own API keys
create policy "Users can insert their own API keys"
    on api_keys for insert
    with check (auth.uid() = user_id);

-- Only allow users to update their own API keys
create policy "Users can update their own API keys"
    on api_keys for update
    using (auth.uid() = user_id);

-- Only allow users to delete their own API keys
create policy "Users can delete their own API keys"
    on api_keys for delete
    using (auth.uid() = user_id);

-- Create a function to generate a new API key
create or replace function generate_api_key(key_name text, user_id uuid)
returns jsonb
language plpgsql
security definer
as $$
declare
    new_key text;
    secret_id uuid;
    api_key_id text;
begin
    -- Generate a random API key
    new_key := encode(gen_random_bytes(32), 'base64');

    -- Store the key in vault
    secret_id := vault.create_secret(
        new_key,
        key_name || '_' || gen_ulid(),
        'API key for ' || key_name
    );

    -- Create the API key record
    insert into api_keys (name, key_id, user_id)
    values (key_name, secret_id, user_id)
    returning id into api_key_id;

    -- Return both the key and its ID
    -- The key will only be shown once at creation time
    return jsonb_build_object(
        'api_key_id', api_key_id,
        'api_key', new_key
    );
end;
$$;

-- Create a view that includes the decrypted API keys
-- This view should be carefully protected as it contains the decrypted keys
create view decrypted_api_keys as
select
    k.id,
    k.name,
    k.user_id,
    k.status,
    k.last_used_at,
    k.expires_at,
    k.created_at,
    k.updated_at,
    s.decrypted_secret as key
from api_keys k
join vault.decrypted_secrets s on s.id = k.key_id;

-- Protect the view
grant select on decrypted_api_keys to authenticated;
revoke select on decrypted_api_keys from anon;

-- Create a function to revoke an API key
create or replace function revoke_api_key(api_key_id text)
returns void
language plpgsql
security definer
as $$
begin
    update api_keys
    set status = 'revoked',
        updated_at = now()
    where id = api_key_id
    and user_id = auth.uid();
end;
$$;
