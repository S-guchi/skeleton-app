-- Fix invite code RLS to allow anonymous users to validate invite codes
-- This is necessary for the join-with-invite flow to work with anonymous authentication

-- Drop the existing restrictive SELECT policy
DROP POLICY IF EXISTS "Household members can view invite codes" ON public.invite_codes;

-- Create a new policy that allows anyone to read invite codes for validation purposes
-- This is secure because invite codes are meant to be shared and validated
CREATE POLICY "Anyone can read invite codes for validation" ON public.invite_codes
  FOR SELECT 
  USING (true);

-- Keep the existing policies for other operations (INSERT, UPDATE, DELETE)
-- These still require proper authentication and authorization

-- Note: This change allows anonymous users to validate invite codes,
-- which is required for the join-with-invite functionality.
-- The security is maintained by:
-- 1. Invite codes are temporary (expire in 24 hours)
-- 2. Invite codes can only be used once (is_used flag)
-- 3. Only household members can create invite codes
-- 4. Only the creator or the user using the code can update it