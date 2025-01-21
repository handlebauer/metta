-- Add admin delete policies for users table
CREATE POLICY "Admins can delete users"
  ON public.users
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE user_id = auth.uid()::text
      AND role = 'admin'
    )
  );

-- Add admin delete policies for profiles table
CREATE POLICY "Admins can delete profiles"
  ON public.profiles
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE user_id = auth.uid()::text
      AND role = 'admin'
    )
  );
