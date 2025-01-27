-- Create a function to check if a user is an admin
create or replace function is_admin(user_id text)
returns boolean
language plpgsql
security definer
as $$
declare
    user_role text;
begin
    select role into user_role
    from profiles p
    where p.user_id = $1;

    return user_role = 'admin';
end;
$$;

-- Drop existing admin profile policy
drop policy if exists "Admins can update all profiles" on profiles;
drop policy if exists "Users can update own profile" on profiles;

-- Create new admin profile policy using the function
create policy "Admins can update all profiles"
    on profiles
    for update
    using (
        -- Either the user is updating their own profile
        (auth.uid()::text = user_id) or
        -- Or they are an admin
        is_admin(auth.uid()::text)
    );

-- Grant execute permission on the function
grant execute on function is_admin to authenticated;

