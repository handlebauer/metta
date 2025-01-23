-- Create ticket status history table
CREATE TABLE public.ticket_status_history (
    id TEXT PRIMARY KEY DEFAULT gen_ulid(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    ticket_id TEXT NOT NULL REFERENCES public.tickets(id) ON DELETE CASCADE,
    old_status ticket_status,
    new_status ticket_status NOT NULL,
    changed_by TEXT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE
);

-- Create indexes for common queries
CREATE INDEX ticket_status_history_ticket_id_idx ON public.ticket_status_history(ticket_id);
CREATE INDEX ticket_status_history_changed_by_idx ON public.ticket_status_history(changed_by);

-- Enable RLS
ALTER TABLE public.ticket_status_history ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- All authenticated users can view status history
CREATE POLICY "All users can view status history"
    ON public.ticket_status_history
    FOR SELECT
    USING (true);

-- Only agents and admins can create status history (though this will mainly be handled by trigger)
CREATE POLICY "Only agents and admins can create status history"
    ON public.ticket_status_history
    FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE user_id = auth.uid()::text
            AND role IN ('agent', 'admin')
        )
    );

-- Create trigger function to track status changes
CREATE OR REPLACE FUNCTION public.handle_ticket_status_change()
RETURNS TRIGGER AS $$
BEGIN
    -- Only create history entry if status has changed
    IF OLD.status IS DISTINCT FROM NEW.status THEN
        INSERT INTO public.ticket_status_history (
            ticket_id,
            old_status,
            new_status,
            changed_by
        ) VALUES (
            NEW.id,
            OLD.status,
            NEW.status,
            auth.uid()::text
        );
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add the trigger to the tickets table
CREATE TRIGGER track_ticket_status_changes
    AFTER UPDATE OF status ON public.tickets
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_ticket_status_change();
