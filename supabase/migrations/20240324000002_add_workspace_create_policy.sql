-- Drop the default deny policy for workspaces
drop policy if exists "Deny all by default for workspaces" on workspaces;

-- Allow authenticated users to create workspaces
create policy "Authenticated users can create workspaces"
    on workspaces
    for insert
    to authenticated
    with check (true);

-- Keep existing policies for viewing and updating workspaces
