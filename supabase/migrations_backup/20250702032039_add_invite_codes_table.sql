-- Add invite_codes table for timed passcode invitation system

-- Create invite_codes table
CREATE TABLE IF NOT EXISTS public.invite_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE CHECK (code ~ '^[A-Z0-9]{6}$'),
  household_id UUID NOT NULL REFERENCES public.households(id) ON DELETE CASCADE,
  created_by UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  expires_at TIMESTAMPTZ NOT NULL,
  is_used BOOLEAN DEFAULT FALSE,
  used_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_invite_codes_code ON public.invite_codes(code);
CREATE INDEX IF NOT EXISTS idx_invite_codes_household_id ON public.invite_codes(household_id);
CREATE INDEX IF NOT EXISTS idx_invite_codes_expires_at ON public.invite_codes(expires_at);
CREATE INDEX IF NOT EXISTS idx_invite_codes_is_used ON public.invite_codes(is_used);
CREATE INDEX IF NOT EXISTS idx_invite_codes_created_by ON public.invite_codes(created_by);

-- Enable RLS
ALTER TABLE public.invite_codes ENABLE ROW LEVEL SECURITY;

-- RLS Policies for invite_codes

-- Household members can view their household's invite codes
CREATE POLICY "Household members can view invite codes" ON public.invite_codes
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.household_members
      WHERE household_id = public.invite_codes.household_id AND user_id = auth.uid()
    )
  );

-- Household members can create invite codes for their household
CREATE POLICY "Household members can create invite codes" ON public.invite_codes
  FOR INSERT TO authenticated
  WITH CHECK (
    created_by = auth.uid() AND
    EXISTS (
      SELECT 1 FROM public.household_members
      WHERE household_id = public.invite_codes.household_id AND user_id = auth.uid()
    )
  );

-- Invite code creators can update their codes (mark as used, etc.)
CREATE POLICY "Users can update invite codes they created" ON public.invite_codes
  FOR UPDATE TO authenticated
  USING (created_by = auth.uid())
  WITH CHECK (created_by = auth.uid());

-- Anyone can use (mark as used) valid invite codes
CREATE POLICY "Anyone can use valid invite codes" ON public.invite_codes
  FOR UPDATE TO authenticated
  USING (
    is_used = false AND
    expires_at > NOW()
  )
  WITH CHECK (
    is_used = true AND
    used_by = auth.uid()
  );

-- Household admins can delete invite codes
CREATE POLICY "Household admins can delete invite codes" ON public.invite_codes
  FOR DELETE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.household_members
      WHERE household_id = public.invite_codes.household_id 
        AND user_id = auth.uid() 
        AND role = 'admin'
    )
  );

-- Set up updated_at trigger
CREATE TRIGGER update_invite_codes_updated_at
  BEFORE UPDATE ON public.invite_codes
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Remove password constraint from households table
-- (Allow non-alphanumeric characters in household names and potentially passwords)
ALTER TABLE public.households DROP CONSTRAINT IF EXISTS households_password_check;

-- Add new password constraint that allows more characters but maintains minimum length
ALTER TABLE public.households 
  ADD CONSTRAINT households_password_check 
  CHECK (LENGTH(password) >= 4);

-- Comments for documentation
COMMENT ON TABLE public.invite_codes IS 'Timed passcode invitation system for households';
COMMENT ON COLUMN public.invite_codes.code IS 'Six-character alphanumeric invite code (A-Z, 0-9)';
COMMENT ON COLUMN public.invite_codes.expires_at IS 'Expiration time for the invite code';
COMMENT ON COLUMN public.invite_codes.is_used IS 'Whether the invite code has been used';
COMMENT ON COLUMN public.invite_codes.used_by IS 'User who used the invite code';
COMMENT ON COLUMN public.invite_codes.used_at IS 'When the invite code was used';