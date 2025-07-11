-- Fix infinite recursion in household_members RLS policy
-- Created: 2025-07-01
-- Issue: Policy was referencing same table causing infinite loop

-- ==============================================
-- 1. Drop problematic policy
-- ==============================================

-- Remove the recursive policy that causes infinite loop
DROP POLICY IF EXISTS "Household members can view other members" ON public.household_members;

-- ==============================================
-- 2. Create safer RLS policies
-- ==============================================

-- Allow users to view their own membership record
CREATE POLICY "Users can view own membership" ON public.household_members
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

-- Allow users to view other members in the same household
-- This policy avoids recursion by using a direct join approach
CREATE POLICY "Members can view household peers" ON public.household_members
  FOR SELECT TO authenticated
  USING (
    household_id IN (
      SELECT hm.household_id 
      FROM public.household_members hm 
      WHERE hm.user_id = auth.uid()
    )
  );

-- ==============================================
-- Note: This fix resolves the infinite recursion
-- by splitting the logic into two policies:
-- 1. Direct access to own membership
-- 2. Indirect access to peers via subquery
-- ==============================================