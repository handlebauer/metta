-- Create the firebreak_analysis table
CREATE TABLE public.firebreak_analysis (
    id TEXT DEFAULT gen_ulid() PRIMARY KEY,
    created_at TIMESTAMPTZ DEFAULT NOW(),

    -- Analysis State
    total_tickets INTEGER NOT NULL,
    time_window TEXT NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('analyzing', 'completed', 'no_tickets')),

    -- Found Tickets (JSONB for flexibility in ticket structure)
    found_tickets JSONB NOT NULL DEFAULT '[]',

    -- Identified Patterns (JSONB to maintain full pattern data)
    identified_patterns JSONB NOT NULL DEFAULT '[]',

    -- Created Incidents (Array of UUIDs linking to incidents table)
    created_incident_ids TEXT[] NOT NULL DEFAULT '{}',

    -- Metadata
    workspace_id TEXT NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    created_by UUID NOT NULL REFERENCES auth.users(id)
);

-- Add RLS
ALTER TABLE public.firebreak_analysis ENABLE ROW LEVEL SECURITY;

-- Users can view analysis in their workspace
CREATE POLICY "users can view firebreak analysis in workspace" ON public.firebreak_analysis
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM workspace_members
            WHERE workspace_members.workspace_id = firebreak_analysis.workspace_id
            AND workspace_members.user_id = auth.uid()::text
        )
    );

-- Only workspace admins can create analysis
CREATE POLICY "workspace admins can create firebreak analysis" ON public.firebreak_analysis
    FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM workspace_members
            WHERE workspace_members.workspace_id = firebreak_analysis.workspace_id
            AND workspace_members.user_id = auth.uid()::text
            AND workspace_members.role = 'admin'
        )
    );

-- Create index for faster lookups
CREATE INDEX firebreak_analysis_workspace_id_idx ON public.firebreak_analysis(workspace_id);
CREATE INDEX firebreak_analysis_created_by_idx ON public.firebreak_analysis(created_by);

-- Add a back-reference from incidents to analysis
ALTER TABLE public.incidents
ADD COLUMN analysis_id TEXT REFERENCES public.firebreak_analysis(id);

-- Update incident RLS to include analysis relationship
DROP POLICY IF EXISTS "users can view incidents in workspace" ON public.incidents;
CREATE POLICY "users can view incidents in workspace" ON public.incidents
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM firebreak_analysis
            WHERE firebreak_analysis.id = incidents.analysis_id
            AND EXISTS (
                SELECT 1 FROM workspace_members
                WHERE workspace_members.workspace_id = firebreak_analysis.workspace_id
                AND workspace_members.user_id = auth.uid()::text
            )
        )
    );

