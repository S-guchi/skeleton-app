-- Fix infinite recursion in household_members RLS policy (Final Fix)
-- Issue: Still experiencing infinite recursion in RLS policies

-- Drop all existing household_members policies
DROP POLICY IF EXISTS "Users can view own membership" ON public.household_members;
DROP POLICY IF EXISTS "Members can view household peers" ON public.household_members;
DROP POLICY IF EXISTS "Household members can view other members" ON public.household_members;
DROP POLICY IF EXISTS "Authenticated users can join households" ON public.household_members;
DROP POLICY IF EXISTS "Household admins can manage members" ON public.household_members;
DROP POLICY IF EXISTS "Users can leave households" ON public.household_members;
DROP POLICY IF EXISTS "Household admins can remove members" ON public.household_members;

-- Create simplified, non-recursive policies

-- 1. Users can always see their own membership records
CREATE POLICY "view_own_membership" ON public.household_members
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

-- 2. Users can view other members in households they belong to
-- Use a function to avoid recursion
CREATE OR REPLACE FUNCTION public.user_household_ids(user_uuid UUID)
RETURNS SETOF UUID AS $$
BEGIN
  RETURN QUERY
  SELECT household_id 
  FROM public.household_members 
  WHERE user_id = user_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE POLICY "view_household_members" ON public.household_members
  FOR SELECT TO authenticated
  USING (household_id IN (SELECT public.user_household_ids(auth.uid())));

-- 3. Insert policy - users can join households
CREATE POLICY "insert_membership" ON public.household_members
  FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

-- 4. Update policy - admins can update members in their households
CREATE POLICY "update_membership" ON public.household_members
  FOR UPDATE TO authenticated
  USING (
    household_id IN (
      SELECT hm.household_id 
      FROM public.household_members hm 
      WHERE hm.user_id = auth.uid() AND hm.role = 'admin'
    )
  );

-- 5. Delete policy - users can leave their households or admins can remove members
CREATE POLICY "delete_membership" ON public.household_members
  FOR DELETE TO authenticated
  USING (
    user_id = auth.uid() OR  -- Users can leave
    household_id IN (
      SELECT hm.household_id 
      FROM public.household_members hm 
      WHERE hm.user_id = auth.uid() AND hm.role = 'admin'
    )  -- Admins can remove
  );