-- Fix infinite recursion in household_members DELETE policy
-- This resolves the error: "infinite recursion detected in policy for relation household_members"

-- Add function to check if user is household admin
CREATE OR REPLACE FUNCTION public.is_household_admin(user_uuid UUID, household_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.household_members 
    WHERE user_id = user_uuid 
    AND household_id = household_uuid 
    AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fix DELETE policy to avoid infinite recursion
DROP POLICY IF EXISTS "delete_membership" ON public.household_members;
CREATE POLICY "delete_membership" ON public.household_members
  FOR DELETE TO authenticated
  USING (
    user_id = auth.uid() OR  -- Users can leave themselves
    public.is_household_admin(auth.uid(), household_id)  -- Admins can remove others
  );