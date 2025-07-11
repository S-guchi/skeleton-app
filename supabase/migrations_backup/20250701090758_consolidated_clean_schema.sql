-- Usako Chore App - Consolidated Schema (Password-Based Invitation System)
-- Created: 2025-07-01
-- Note: This schema excludes the old invite_codes and invite_code_uses tables

-- ==============================================
-- 1. Authentication System and User Management  
-- ==============================================

-- Trigger function: Auto-create public user record when user is created in auth.users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, name, created_at, updated_at)
  VALUES (
    NEW.id,
    COALESCE(NEW.email, 'anonymous_' || NEW.id || '@temp.local'),
    COALESCE(NEW.raw_user_meta_data->>'name', 'Anonymous User'),
    NOW(),
    NOW()
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger function to auto-update updated_at column
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ==============================================
-- 2. Core Tables (Users, Households, Members)
-- ==============================================

-- User profile management table
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  display_name TEXT,
  avatar_url TEXT,
  is_provider BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Household/roommate group management table with password-based invitation
CREATE TABLE IF NOT EXISTS public.households (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  settlement_day INTEGER DEFAULT 25 CHECK (settlement_day >= 1 AND settlement_day <= 31),
  password TEXT NOT NULL CHECK (password ~ '^[a-zA-Z0-9]{4,}$'),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Household membership table with roles and settlement group assignment
CREATE TABLE IF NOT EXISTS public.household_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  household_id UUID NOT NULL REFERENCES public.households(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('admin', 'member')),
  settlement_group_id UUID,
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(household_id, user_id)
);

-- ==============================================
-- 3. Chore Management Tables
-- ==============================================

-- Chore definition table
CREATE TABLE IF NOT EXISTS public.chores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  household_id UUID NOT NULL REFERENCES public.households(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  reward_amount INTEGER NOT NULL DEFAULT 0 CHECK (reward_amount >= 0),
  is_active BOOLEAN DEFAULT TRUE,
  created_by UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Chore completion log table
CREATE TABLE IF NOT EXISTS public.chore_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  household_id UUID NOT NULL REFERENCES public.households(id) ON DELETE CASCADE,
  chore_id UUID NOT NULL REFERENCES public.chores(id) ON DELETE CASCADE,
  performed_by UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  performed_at TIMESTAMPTZ DEFAULT NOW(),
  reward_amount INTEGER NOT NULL DEFAULT 0 CHECK (reward_amount >= 0),
  note TEXT,
  is_verified BOOLEAN DEFAULT FALSE,
  verified_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  verified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================
-- 4. Settlement Management Tables
-- ==============================================

-- Settlement period table
CREATE TABLE IF NOT EXISTS public.settlements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  household_id UUID NOT NULL REFERENCES public.households(id) ON DELETE CASCADE,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  is_finalized BOOLEAN DEFAULT FALSE,
  finalized_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  finalized_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(household_id, period_start, period_end)
);

-- Settlement payment items table
CREATE TABLE IF NOT EXISTS public.settlement_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  settlement_id UUID NOT NULL REFERENCES public.settlements(id) ON DELETE CASCADE,
  payer_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  payee_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL CHECK (amount > 0),
  is_paid BOOLEAN DEFAULT FALSE,
  paid_at TIMESTAMPTZ,
  payment_method TEXT,
  note TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Settlement groups table for flexible settlement calculation
CREATE TABLE IF NOT EXISTS public.settlement_groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  household_id UUID NOT NULL REFERENCES public.households(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL DEFAULT 'differential' CHECK (type IN ('differential', 'reward_based')),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Settlement group membership table
CREATE TABLE IF NOT EXISTS public.settlement_group_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  settlement_group_id UUID NOT NULL REFERENCES public.settlement_groups(id) ON DELETE CASCADE,
  household_member_id UUID NOT NULL REFERENCES public.household_members(id) ON DELETE CASCADE,
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(settlement_group_id, household_member_id)
);

-- ==============================================
-- 5. Index Creation
-- ==============================================

-- User table indexes
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);

-- Household table indexes  
CREATE INDEX IF NOT EXISTS idx_households_name ON public.households(name);
CREATE INDEX IF NOT EXISTS idx_households_password ON public.households(password);

-- Household member table indexes
CREATE INDEX IF NOT EXISTS idx_household_members_household_id ON public.household_members(household_id);
CREATE INDEX IF NOT EXISTS idx_household_members_user_id ON public.household_members(user_id);
CREATE INDEX IF NOT EXISTS idx_household_members_role ON public.household_members(role);
CREATE INDEX IF NOT EXISTS idx_household_members_settlement_group ON public.household_members(settlement_group_id);

-- Chore table indexes
CREATE INDEX IF NOT EXISTS idx_chores_household_id ON public.chores(household_id);
CREATE INDEX IF NOT EXISTS idx_chores_is_active ON public.chores(is_active);
CREATE INDEX IF NOT EXISTS idx_chores_created_by ON public.chores(created_by);

-- Chore log table indexes
CREATE INDEX IF NOT EXISTS idx_chore_logs_household_id ON public.chore_logs(household_id);
CREATE INDEX IF NOT EXISTS idx_chore_logs_chore_id ON public.chore_logs(chore_id);
CREATE INDEX IF NOT EXISTS idx_chore_logs_performed_by ON public.chore_logs(performed_by);
CREATE INDEX IF NOT EXISTS idx_chore_logs_performed_at ON public.chore_logs(performed_at);

-- Settlement table indexes
CREATE INDEX IF NOT EXISTS idx_settlements_household_id ON public.settlements(household_id);
CREATE INDEX IF NOT EXISTS idx_settlements_period ON public.settlements(period_start, period_end);
CREATE INDEX IF NOT EXISTS idx_settlements_is_finalized ON public.settlements(is_finalized);

-- Settlement item table indexes
CREATE INDEX IF NOT EXISTS idx_settlement_items_settlement_id ON public.settlement_items(settlement_id);
CREATE INDEX IF NOT EXISTS idx_settlement_items_payer_id ON public.settlement_items(payer_id);
CREATE INDEX IF NOT EXISTS idx_settlement_items_payee_id ON public.settlement_items(payee_id);
CREATE INDEX IF NOT EXISTS idx_settlement_items_is_paid ON public.settlement_items(is_paid);

-- Settlement group table indexes
CREATE INDEX IF NOT EXISTS idx_settlement_groups_household_id ON public.settlement_groups(household_id);
CREATE INDEX IF NOT EXISTS idx_settlement_groups_type ON public.settlement_groups(type);
CREATE INDEX IF NOT EXISTS idx_settlement_groups_is_active ON public.settlement_groups(is_active);

-- Settlement group member table indexes
CREATE INDEX IF NOT EXISTS idx_settlement_group_members_group_id ON public.settlement_group_members(settlement_group_id);
CREATE INDEX IF NOT EXISTS idx_settlement_group_members_member_id ON public.settlement_group_members(household_member_id);

-- ==============================================
-- 6. Row Level Security (RLS) Setup
-- ==============================================

-- Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.households ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.household_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chore_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settlements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settlement_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settlement_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settlement_group_members ENABLE ROW LEVEL SECURITY;

-- ==============================================
-- 7. RLS Policies
-- ==============================================

-- Users table policies
-- Allow authenticated users (including anonymous) to create their own user profile
CREATE POLICY "Authenticated users can create own profile" ON public.users
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = id);

-- Allow users to view their own profile
CREATE POLICY "Users can view own profile" ON public.users
  FOR SELECT TO authenticated
  USING (auth.uid() = id);

-- Allow users to update their own profile
CREATE POLICY "Users can update own profile" ON public.users
  FOR UPDATE TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Allow household members to view each other's profiles
CREATE POLICY "Household members can view each other" ON public.users
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.household_members hm1
      JOIN public.household_members hm2 ON hm1.household_id = hm2.household_id
      WHERE hm1.user_id = auth.uid() AND hm2.user_id = public.users.id
    )
  );

-- Households table policies
CREATE POLICY "Household members can view their household" ON public.households
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.household_members
      WHERE household_id = public.households.id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Authenticated users can create households" ON public.households
  FOR INSERT TO authenticated
  WITH CHECK (true);

CREATE POLICY "Household admins can update their household" ON public.households
  FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.household_members
      WHERE household_id = public.households.id AND user_id = auth.uid() AND role = 'admin'
    )
  );

-- Household members table policies
CREATE POLICY "Household members can view other members" ON public.household_members
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.household_members hm
      WHERE hm.household_id = public.household_members.household_id AND hm.user_id = auth.uid()
    )
  );

CREATE POLICY "Authenticated users can join households" ON public.household_members
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Household admins can manage members" ON public.household_members
  FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.household_members hm
      WHERE hm.household_id = public.household_members.household_id 
        AND hm.user_id = auth.uid() 
        AND hm.role = 'admin'
    )
  );

CREATE POLICY "Users can leave households" ON public.household_members
  FOR DELETE TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Household admins can remove members" ON public.household_members
  FOR DELETE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.household_members hm
      WHERE hm.household_id = public.household_members.household_id 
        AND hm.user_id = auth.uid() 
        AND hm.role = 'admin'
    )
  );

-- Chores table policies
CREATE POLICY "Household members can view household chores" ON public.chores
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.household_members
      WHERE household_id = public.chores.household_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Household members can create chores" ON public.chores
  FOR INSERT TO authenticated
  WITH CHECK (
    auth.uid() = created_by AND
    EXISTS (
      SELECT 1 FROM public.household_members
      WHERE household_id = public.chores.household_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Household members can update chores" ON public.chores
  FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.household_members
      WHERE household_id = public.chores.household_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Chore creators can delete their chores" ON public.chores
  FOR DELETE TO authenticated
  USING (created_by = auth.uid());

-- Chore logs table policies
CREATE POLICY "Household members can view household chore logs" ON public.chore_logs
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.household_members
      WHERE household_id = public.chore_logs.household_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Household members can create chore logs" ON public.chore_logs
  FOR INSERT TO authenticated
  WITH CHECK (
    performed_by = auth.uid() AND
    EXISTS (
      SELECT 1 FROM public.household_members
      WHERE household_id = public.chore_logs.household_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Log creators can update their logs" ON public.chore_logs
  FOR UPDATE TO authenticated
  USING (performed_by = auth.uid());

CREATE POLICY "Log creators can delete their logs" ON public.chore_logs
  FOR DELETE TO authenticated
  USING (performed_by = auth.uid());

-- Settlement groups table policies
CREATE POLICY "Household members can view settlement groups" ON public.settlement_groups
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.household_members
      WHERE household_id = public.settlement_groups.household_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Household admins can manage settlement groups" ON public.settlement_groups
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.household_members
      WHERE household_id = public.settlement_groups.household_id 
        AND user_id = auth.uid() 
        AND role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.household_members
      WHERE household_id = public.settlement_groups.household_id 
        AND user_id = auth.uid() 
        AND role = 'admin'
    )
  );

-- Settlement groups members table policies
CREATE POLICY "Settlement group members can view their membership" ON public.settlement_group_members
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.household_members hm
      JOIN public.settlement_groups sg ON hm.household_id = sg.household_id
      WHERE sg.id = public.settlement_group_members.settlement_group_id 
        AND hm.user_id = auth.uid()
    )
  );

CREATE POLICY "Household admins can manage settlement group membership" ON public.settlement_group_members
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.household_members hm
      JOIN public.settlement_groups sg ON hm.household_id = sg.household_id
      WHERE sg.id = public.settlement_group_members.settlement_group_id 
        AND hm.user_id = auth.uid() 
        AND hm.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.household_members hm
      JOIN public.settlement_groups sg ON hm.household_id = sg.household_id
      WHERE sg.id = public.settlement_group_members.settlement_group_id 
        AND hm.user_id = auth.uid() 
        AND hm.role = 'admin'
    )
  );

-- Settlements table policies
CREATE POLICY "Household members can view settlements" ON public.settlements
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.household_members
      WHERE household_id = public.settlements.household_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Household members can create settlements" ON public.settlements
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.household_members
      WHERE household_id = public.settlements.household_id AND user_id = auth.uid()
    )
  );

-- Settlement items table policies
CREATE POLICY "Involved users can view settlement items" ON public.settlement_items
  FOR SELECT TO authenticated
  USING (
    payer_id = auth.uid() OR payee_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM public.settlements s
      JOIN public.household_members hm ON s.household_id = hm.household_id
      WHERE s.id = public.settlement_items.settlement_id AND hm.user_id = auth.uid()
    )
  );

CREATE POLICY "Household members can create settlement items" ON public.settlement_items
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.settlements s
      JOIN public.household_members hm ON s.household_id = hm.household_id
      WHERE s.id = public.settlement_items.settlement_id AND hm.user_id = auth.uid()
    )
  );

-- ==============================================
-- 8. Triggers Setup
-- ==============================================

-- Set up auth trigger for new user creation
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Set up updated_at triggers for all tables
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_households_updated_at
  BEFORE UPDATE ON public.households
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_household_members_updated_at
  BEFORE UPDATE ON public.household_members
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_chores_updated_at
  BEFORE UPDATE ON public.chores
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_chore_logs_updated_at
  BEFORE UPDATE ON public.chore_logs
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_settlements_updated_at
  BEFORE UPDATE ON public.settlements
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_settlement_items_updated_at
  BEFORE UPDATE ON public.settlement_items
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_settlement_groups_updated_at
  BEFORE UPDATE ON public.settlement_groups
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ==============================================
-- 9. Foreign Key Constraints (Settlement Groups)
-- ==============================================

-- Add foreign key constraint for settlement_group_id in household_members
ALTER TABLE public.household_members 
ADD CONSTRAINT fk_household_members_settlement_group
FOREIGN KEY (settlement_group_id) REFERENCES public.settlement_groups(id) ON DELETE SET NULL;

-- ==============================================
-- 10. Comments for Documentation
-- ==============================================

COMMENT ON TABLE public.households IS 'Household/roommate groups with password-based invitation system';
COMMENT ON COLUMN public.households.password IS 'Password for joining the household. Must be alphanumeric and at least 4 characters.';
COMMENT ON TABLE public.settlement_groups IS 'Flexible settlement groups for different calculation methods (differential vs reward-based)';
COMMENT ON COLUMN public.settlement_groups.type IS 'Settlement calculation type: differential (shared costs) or reward_based (individual rewards)';