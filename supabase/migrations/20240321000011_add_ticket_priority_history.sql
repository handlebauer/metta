-- Create ticket priority history table
CREATE TABLE public.ticket_priority_history (
    id TEXT PRIMARY KEY DEFAULT gen_ulid(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    ticket_id TEXT NOT NULL REFERENCES public.tickets(id) ON DELETE CASCADE,
    old_priority ticket_priority,
    new_priority ticket_priority NOT NULL,
    changed_by TEXT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE
);

-- Create indexes for common queries
CREATE INDEX ticket_priority_history_ticket_id_idx ON public.ticket_priority_history(ticket_id);
CREATE INDEX ticket_priority_history_changed_by_idx ON public.ticket_priority_history(changed_by);

-- Enable RLS
ALTER TABLE public.ticket_priority_history ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- All authenticated users can view priority history
CREATE POLICY "All users can view priority history"
    ON public.ticket_priority_history
    FOR SELECT
    USING (true);

-- Only agents and admins can create priority history (though this will mainly be handled by trigger)
CREATE POLICY "Only agents and admins can create priority history"
    ON public.ticket_priority_history
    FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE user_id = auth.uid()::text
            AND role IN ('agent', 'admin')
        )
    );

-- Create trigger function to track priority changes
CREATE OR REPLACE FUNCTION public.handle_ticket_priority_change()
RETURNS TRIGGER AS $$
BEGIN
    -- Only create history entry if priority has changed
    IF OLD.priority IS DISTINCT FROM NEW.priority THEN
        INSERT INTO public.ticket_priority_history (
            ticket_id,
            old_priority,
            new_priority,
            changed_by
        ) VALUES (
            NEW.id,
            OLD.priority,
            NEW.priority,
            auth.uid()::text
        );
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add the trigger to the tickets table
CREATE TRIGGER track_ticket_priority_changes
    AFTER UPDATE OF priority ON public.tickets
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_ticket_priority_change();
