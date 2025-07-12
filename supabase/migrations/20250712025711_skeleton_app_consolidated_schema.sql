-- Skeleton App Database Schema
-- Consolidated migration containing all necessary components
-- Created: 2025-07-12

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

-- Create public schema if not exists
CREATE SCHEMA IF NOT EXISTS "public";
ALTER SCHEMA "public" OWNER TO "pg_database_owner";
COMMENT ON SCHEMA "public" IS 'standard public schema';

-- ==============================================
-- 1. FUNCTIONS
-- ==============================================

-- Function to handle new user creation
-- This function creates a corresponding record in public.users when a new user is created in auth.users
CREATE OR REPLACE FUNCTION "public"."handle_new_user"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
  INSERT INTO public.users (id, name, created_at, updated_at)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', 'Anonymous User'),
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

ALTER FUNCTION "public"."handle_new_user"() OWNER TO "postgres";

-- Function to update updated_at column
CREATE OR REPLACE FUNCTION "public"."update_updated_at_column"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

ALTER FUNCTION "public"."update_updated_at_column"() OWNER TO "postgres";

SET default_tablespace = '';
SET default_table_access_method = "heap";

-- ==============================================
-- 2. TABLES
-- ==============================================

-- Users table for extended user profile information
-- This table extends auth.users with additional profile fields
CREATE TABLE IF NOT EXISTS "public"."users" (
    "id" "uuid" NOT NULL,                                    -- Links to auth.users.id
    "name" "text",                                           -- User's full name
    "display_name" "text",                                   -- User's display name
    "avatar_url" "text",                                     -- URL to user's avatar image
    "is_provider" boolean DEFAULT false,                     -- Whether user is a service provider
    "created_at" timestamp with time zone DEFAULT "now"(),  -- Creation timestamp
    "updated_at" timestamp with time zone DEFAULT "now"()   -- Last update timestamp
);

ALTER TABLE "public"."users" OWNER TO "postgres";

-- ==============================================
-- 3. CONSTRAINTS
-- ==============================================

-- Primary key constraint
ALTER TABLE ONLY "public"."users"
    ADD CONSTRAINT "users_pkey" PRIMARY KEY ("id");

-- Foreign key constraint linking to auth.users
ALTER TABLE ONLY "public"."users"
    ADD CONSTRAINT "users_id_fkey" FOREIGN KEY ("id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;

-- ==============================================
-- 4. TRIGGERS
-- ==============================================

-- Trigger to automatically update updated_at column
CREATE OR REPLACE TRIGGER "update_users_updated_at" 
    BEFORE UPDATE ON "public"."users" 
    FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();

-- Trigger to handle new user creation
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ==============================================
-- 5. ROW LEVEL SECURITY
-- ==============================================

-- Enable Row Level Security
ALTER TABLE "public"."users" ENABLE ROW LEVEL SECURITY;

-- RLS Policies for users table

-- Users can view their own profile
CREATE POLICY "Users can view own profile" 
    ON "public"."users" 
    FOR SELECT 
    TO "authenticated" 
    USING (("auth"."uid"() = "id"));

-- Users can update their own profile
CREATE POLICY "Users can update own profile" 
    ON "public"."users" 
    FOR UPDATE 
    TO "authenticated" 
    USING (("auth"."uid"() = "id")) 
    WITH CHECK (("auth"."uid"() = "id"));

-- Users can create their own profile
CREATE POLICY "Authenticated users can create own profile" 
    ON "public"."users" 
    FOR INSERT 
    TO "authenticated" 
    WITH CHECK (("auth"."uid"() = "id"));

-- Users can delete their own profile
CREATE POLICY "Users can delete own profile" 
    ON "public"."users" 
    FOR DELETE 
    TO "authenticated" 
    USING (("auth"."uid"() = "id"));

-- ==============================================
-- 6. STORAGE POLICIES
-- ==============================================

-- Users can upload their own avatars
CREATE POLICY "Users can upload their own avatars"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'users' 
  AND (storage.foldername(name))[1] = 'avatars'
  AND auth.uid()::text = (regexp_split_to_array((storage.filename(name)), '_'))[1]
);

-- Users can update their own avatars
CREATE POLICY "Users can update their own avatars"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'users' 
  AND (storage.foldername(name))[1] = 'avatars'
  AND auth.uid()::text = (regexp_split_to_array((storage.filename(name)), '_'))[1]
);

-- Users can delete their own avatars
CREATE POLICY "Users can delete their own avatars"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'users' 
  AND (storage.foldername(name))[1] = 'avatars'
  AND auth.uid()::text = (regexp_split_to_array((storage.filename(name)), '_'))[1]
);

-- Users can view their own avatars
CREATE POLICY "Users can view their own avatars"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'users' 
  AND (storage.foldername(name))[1] = 'avatars'
  AND auth.uid()::text = (regexp_split_to_array((storage.filename(name)), '_'))[1]
);

-- Authenticated users can view avatars
CREATE POLICY "Authenticated users can view avatars"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'users' 
  AND (storage.foldername(name))[1] = 'avatars'
);

-- Anyone can view avatar images (public access)
CREATE POLICY "Anyone can view avatar images"
ON storage.objects
FOR SELECT
TO public
USING (
  bucket_id = 'users' 
  AND (storage.foldername(name))[1] = 'avatars'
);

-- ==============================================
-- 7. PERMISSIONS
-- ==============================================

-- Grant permissions
GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";

-- Grant function permissions
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "anon";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "service_role";

GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "service_role";

-- Grant table permissions
GRANT ALL ON TABLE "public"."users" TO "anon";
GRANT ALL ON TABLE "public"."users" TO "authenticated";
GRANT ALL ON TABLE "public"."users" TO "service_role";

-- Default privileges
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "service_role";

ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "service_role";

ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "service_role";

RESET ALL;

-- ==============================================
-- Schema Creation Complete
-- ==============================================
-- This migration creates a minimal but complete schema for the skeleton app:
-- - auth.users (Supabase managed)
-- - public.users (extended profile)
-- - avatar storage with RLS policies
-- - Automatic user profile creation via triggers