-- Add admin policies for ticket_internal_notes
CREATE POLICY "Admins can view internal notes"
    ON public.ticket_internal_notes
    FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM public.profiles
        WHERE user_id = auth.uid()::text
        AND role = 'admin'
    ));

CREATE POLICY "Admins can create internal notes"
    ON public.ticket_internal_notes
    FOR INSERT
    WITH CHECK (EXISTS (
        SELECT 1 FROM public.profiles
        WHERE user_id = auth.uid()::text
        AND role = 'admin'
    ));

-- Add update policies
CREATE POLICY "Agents can update own internal notes"
    ON public.ticket_internal_notes
    FOR UPDATE
    USING (
        created_by = auth.uid()::text
        AND EXISTS (
            SELECT 1 FROM public.profiles
            WHERE user_id = auth.uid()::text
            AND role = 'agent'
        )
    );

CREATE POLICY "Admins can update all internal notes"
    ON public.ticket_internal_notes
    FOR UPDATE
    USING (EXISTS (
        SELECT 1 FROM public.profiles
        WHERE user_id = auth.uid()::text
        AND role = 'admin'
    ));
