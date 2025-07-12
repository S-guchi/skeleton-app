-- Skeleton App - Minimal Seed Data
-- Basic test data for development and testing environment
-- Created: 2025-07-12

-- ==============================================
-- Important Notes
-- ==============================================
-- This file is for development/testing only
-- Do NOT run this on production data
-- All data is fictional and for testing purposes

-- ==============================================
-- 1. Test Users Setup
-- ==============================================

-- Create test users in auth.users table
-- Note: In real setup, these would be created via Supabase Auth
-- For seeding, we'll create them directly with sample UUIDs

-- Test User 1: Sample User (サンプルユーザー)
INSERT INTO auth.users (
  id,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  raw_app_meta_data,
  raw_user_meta_data,
  is_super_admin,
  role
) VALUES (
  '11111111-1111-1111-1111-111111111111',
  'user@example.com',
  crypt('password123', gen_salt('bf')),
  NOW(),
  NOW(),
  NOW(),
  '{"provider": "email", "providers": ["email"]}',
  '{"name": "サンプルユーザー"}',
  false,
  'authenticated'
) ON CONFLICT (id) DO NOTHING;

-- Test User 2: Test User (テストユーザー)
INSERT INTO auth.users (
  id,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  raw_app_meta_data,
  raw_user_meta_data,
  is_super_admin,
  role
) VALUES (
  '22222222-2222-2222-2222-222222222222',
  'test@example.com',
  crypt('password123', gen_salt('bf')),
  NOW(),
  NOW(),
  NOW(),
  '{"provider": "email", "providers": ["email"]}',
  '{"name": "テストユーザー"}',
  false,
  'authenticated'
) ON CONFLICT (id) DO NOTHING;

-- Create corresponding public users records
-- These should be created automatically by the trigger, but we'll ensure they exist

INSERT INTO public.users (
  id,
  name,
  display_name,
  created_at,
  updated_at
) VALUES 
  (
    '11111111-1111-1111-1111-111111111111',
    'サンプルユーザー',
    'Sample',
    NOW(),
    NOW()
  ),
  (
    '22222222-2222-2222-2222-222222222222',
    'テストユーザー',
    'Test',
    NOW(),
    NOW()
  )
ON CONFLICT (id) DO NOTHING;

-- ==============================================
-- Seed Data Creation Complete
-- ==============================================

-- Summary of created test data:
-- - 2 test users (サンプルユーザー, テストユーザー)
-- - Basic profile information for skeleton app testing

-- Login credentials for testing:
-- Email: user@example.com, Password: password123
-- Email: test@example.com, Password: password123

-- Note: Remember to run 'npm run db:reset' to apply this seed data