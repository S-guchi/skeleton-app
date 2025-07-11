-- Remove email column from public.users table
-- Related to: https://github.com/S-guchi/usako-work/issues/17

-- 1. Update the trigger function to not use email column
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, name, created_at, updated_at)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', 'Anonymous User'),
    NOW(),
    NOW()
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Drop the unique constraint on email if it exists
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'users_email_key'
  ) THEN
    ALTER TABLE public.users DROP CONSTRAINT users_email_key;
  END IF;
END $$;

-- 3. Remove the email column from users table
ALTER TABLE public.users DROP COLUMN IF EXISTS email;

-- Note: Email information is now accessed from auth.users table directly
-- Components that need email should use session.user.email from Supabase Auth