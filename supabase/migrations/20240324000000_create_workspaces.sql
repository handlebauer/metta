-- Create workspaces table
CREATE TABLE public.workspaces (
  id TEXT PRIMARY KEY DEFAULT gen_ulid(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  logo_url TEXT,
  settings JSONB DEFAULT '{}'::jsonb,
  CONSTRAINT slug_format CHECK (slug ~* '^[a-z0-9-]+$')
);

-- Create workspace_members table for managing workspace membership and roles
CREATE TABLE public.workspace_members (
  id TEXT PRIMARY KEY DEFAULT gen_ulid(),
  workspace_id TEXT NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  role user_role NOT NULL DEFAULT 'customer',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT unique_workspace_member UNIQUE (workspace_id, user_id)
);

-- Add updated_at triggers
CREATE TRIGGER set_workspaces_updated_at
  BEFORE UPDATE ON public.workspaces
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_workspace_members_updated_at
  BEFORE UPDATE ON public.workspace_members
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Helper function to check workspace membership
CREATE OR REPLACE FUNCTION public.is_workspace_member(workspace_id TEXT, user_id TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM workspace_members
    WHERE workspace_members.workspace_id = $1
    AND workspace_members.user_id = $2
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Helper function to check workspace admin
CREATE OR REPLACE FUNCTION public.is_workspace_admin(workspace_id TEXT, user_id TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM workspace_members
    WHERE workspace_members.workspace_id = $1
    AND workspace_members.user_id = $2
    AND workspace_members.role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Enable RLS
ALTER TABLE public.workspaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workspace_members ENABLE ROW LEVEL SECURITY;

-- Create default policies to deny all
CREATE POLICY "Deny all by default for workspaces"
  ON public.workspaces
  FOR ALL
  USING (false);

CREATE POLICY "Deny all by default for workspace_members"
  ON public.workspace_members
  FOR ALL
  USING (false);

-- RLS Policies for workspaces
CREATE POLICY "Users can view workspaces they are members of"
  ON public.workspaces
  FOR SELECT
  USING (
    public.is_workspace_member(id, auth.uid()::text)
  );

CREATE POLICY "Workspace admins can update workspace"
  ON public.workspaces
  FOR UPDATE
  USING (
    public.is_workspace_admin(id, auth.uid()::text)
  );

-- RLS Policies for workspace_members
CREATE POLICY "Users can view their own memberships"
  ON public.workspace_members
  FOR SELECT
  USING (
    user_id = auth.uid()::text
  );

CREATE POLICY "Workspace admins can manage members"
  ON public.workspace_members
  FOR ALL
  USING (
    public.is_workspace_admin(workspace_id, auth.uid()::text)
  );

-- Function to create a workspace and add the creator as admin
CREATE OR REPLACE FUNCTION public.create_workspace_with_admin(
  workspace_name TEXT,
  workspace_slug TEXT,
  creator_id TEXT
) RETURNS public.workspaces AS $$
DECLARE
  new_workspace public.workspaces;
BEGIN
  -- Create the workspace
  INSERT INTO public.workspaces (name, slug)
  VALUES (workspace_name, workspace_slug)
  RETURNING * INTO new_workspace;

  -- Add the creator as an admin
  INSERT INTO public.workspace_members (workspace_id, user_id, role)
  VALUES (new_workspace.id, creator_id, 'admin');

  RETURN new_workspace;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
