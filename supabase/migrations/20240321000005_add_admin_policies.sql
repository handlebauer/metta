-- Add admin policies for users table
CREATE POLICY "Admins can view all users"
  ON public.users
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE user_id = auth.uid()::text
      AND role = 'admin'
    )
  );

CREATE POLICY "Admins can update all users"
  ON public.users
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE user_id = auth.uid()::text
      AND role = 'admin'
    )
  );

-- Add admin policies for profiles table
CREATE POLICY "Admins can update all profiles"
  ON public.profiles
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE user_id = auth.uid()::text
      AND role = 'admin'
    )
  );

-- Add admin policies for tickets table
CREATE POLICY "Admins can view all tickets"
  ON public.tickets
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE user_id = auth.uid()::text
      AND role = 'admin'
    )
  );

CREATE POLICY "Admins can update all tickets"
  ON public.tickets
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE user_id = auth.uid()::text
      AND role = 'admin'
    )
  );

CREATE POLICY "Admins can create tickets"
  ON public.tickets
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE user_id = auth.uid()::text
      AND role = 'admin'
    )
  );

-- Add admin policies for messages table
CREATE POLICY "Admins can update all messages"
  ON public.messages
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE user_id = auth.uid()::text
      AND role = 'admin'
    )
  );

-- Update message policies to be more restrictive for non-admins
DROP POLICY "Allow read access to authenticated users" ON messages;
DROP POLICY "Allow insert access to authenticated users" ON messages;
DROP POLICY "Allow update access to message owners" ON messages;

-- New message policies
CREATE POLICY "Users can view messages of their tickets"
  ON messages FOR SELECT
  USING (
    (
      -- Customer can view their ticket messages
      EXISTS (
        SELECT 1 FROM tickets
        WHERE tickets.id = messages.ticket_id
        AND tickets.customer_id = auth.uid()::text
      )
    ) OR (
      -- Agent can view assigned ticket messages
      EXISTS (
        SELECT 1 FROM tickets
        WHERE tickets.id = messages.ticket_id
        AND tickets.agent_id = auth.uid()::text
      )
    ) OR (
      -- Admin can view all messages
      EXISTS (
        SELECT 1 FROM profiles
        WHERE user_id = auth.uid()::text
        AND role = 'admin'
      )
    )
  );

CREATE POLICY "Users can create messages for their tickets"
  ON messages FOR INSERT
  WITH CHECK (
    (
      -- Customer can create messages for their tickets
      EXISTS (
        SELECT 1 FROM tickets
        WHERE tickets.id = ticket_id
        AND tickets.customer_id = auth.uid()::text
      )
    ) OR (
      -- Agent can create messages for assigned tickets
      EXISTS (
        SELECT 1 FROM tickets
        WHERE tickets.id = ticket_id
        AND tickets.agent_id = auth.uid()::text
      )
    ) OR (
      -- Admin can create messages for all tickets
      EXISTS (
        SELECT 1 FROM profiles
        WHERE user_id = auth.uid()::text
        AND role = 'admin'
      )
    )
  );
