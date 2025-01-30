CREATE TABLE public.incidents (
    id TEXT DEFAULT gen_ulid() PRIMARY KEY,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    pattern_name TEXT NOT NULL,
    severity TEXT NOT NULL,
    linked_ticket_ids TEXT[] NOT NULL DEFAULT '{}',
    status TEXT NOT NULL DEFAULT 'open'
);

-- Enable RLS
ALTER TABLE public.incidents ENABLE ROW LEVEL SECURITY;

-- Allow all authenticated users to view incidents
CREATE POLICY "authenticated users can view incidents" ON public.incidents
    FOR SELECT USING (auth.role() = 'authenticated');

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE incidents;
