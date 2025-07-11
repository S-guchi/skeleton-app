-- Fix: Add missing trigger for handle_new_user function to auth.users table
-- This ensures that when a new user is created in auth.users, 
-- a corresponding record is automatically created in public.users

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();