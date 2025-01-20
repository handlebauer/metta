-- Add policy for agents to view all users
CREATE POLICY "Agents can view all users"
  ON public.users
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE user_id = auth.uid()::text
      AND role = 'agent'
    )
  );
