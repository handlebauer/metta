-- Create ticket priority enum
CREATE TYPE ticket_priority AS ENUM ('low', 'medium', 'high', 'urgent');

-- Create internal notes table
CREATE TABLE public.ticket_internal_notes (
    id TEXT PRIMARY KEY DEFAULT gen_ulid(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    content TEXT NOT NULL,
    created_by TEXT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    ticket_id TEXT NOT NULL REFERENCES public.tickets(id) ON DELETE CASCADE,
    CONSTRAINT content_not_empty CHECK (length(trim(content)) > 0)
);

-- Add priority column to tickets
ALTER TABLE public.tickets
ADD COLUMN priority ticket_priority DEFAULT 'medium';

-- Enable RLS on internal notes
ALTER TABLE public.ticket_internal_notes ENABLE ROW LEVEL SECURITY;

-- Create indexes
CREATE INDEX ticket_internal_notes_ticket_id_idx ON public.ticket_internal_notes(ticket_id);
CREATE INDEX ticket_internal_notes_created_by_idx ON public.ticket_internal_notes(created_by);
CREATE INDEX tickets_priority_idx ON public.tickets(priority);

-- RLS Policies for internal notes (only agents can access)
CREATE POLICY "Agents can view internal notes"
    ON public.ticket_internal_notes
    FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM public.profiles
        WHERE user_id = auth.uid()::text
        AND role = 'agent'
    ));

CREATE POLICY "Agents can create internal notes"
    ON public.ticket_internal_notes
    FOR INSERT
    WITH CHECK (EXISTS (
        SELECT 1 FROM public.profiles
        WHERE user_id = auth.uid()::text
        AND role = 'agent'
    ));
