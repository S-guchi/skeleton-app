-- Add DELETE policy for users table to allow account deletion
-- This enables users to delete their own profile data

CREATE POLICY "Users can delete own profile" ON public.users
  FOR DELETE TO authenticated
  USING (auth.uid() = id);