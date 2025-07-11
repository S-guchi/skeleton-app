-- Remove password column from households table
-- This migration removes the password-based household system in favor of invite codes

-- Remove the password constraint first
ALTER TABLE public.households DROP CONSTRAINT IF EXISTS households_password_check;

-- Remove the password index
DROP INDEX IF EXISTS idx_households_password;

-- Drop the password column
ALTER TABLE public.households DROP COLUMN IF EXISTS password;

-- Update comment to reflect the change
COMMENT ON TABLE public.households IS 'Household/roommate groups with invite code-based invitation system';