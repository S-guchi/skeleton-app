-- Usako Chore App - Seed Data (Invite Code System)
-- Initial test data for development and testing environment
-- Created: 2025-07-01
-- Updated: 2025-07-02 - Removed password-based system

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

-- Test User 1: Admin (田中太郎)
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
  'tanaka@example.com',
  crypt('password123', gen_salt('bf')),
  NOW(),
  NOW(),
  NOW(),
  '{"provider": "email", "providers": ["email"]}',
  '{"name": "田中太郎"}',
  false,
  'authenticated'
) ON CONFLICT (id) DO NOTHING;

-- Test User 2: Member (佐藤花子)
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
  'sato@example.com',
  crypt('password123', gen_salt('bf')),
  NOW(),
  NOW(),
  NOW(),
  '{"provider": "email", "providers": ["email"]}',
  '{"name": "佐藤花子"}',
  false,
  'authenticated'
) ON CONFLICT (id) DO NOTHING;

-- Test User 3: Member (山田次郎)
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
  '33333333-3333-3333-3333-333333333333',
  'yamada@example.com',
  crypt('password123', gen_salt('bf')),
  NOW(),
  NOW(),
  NOW(),
  '{"provider": "email", "providers": ["email"]}',
  '{"name": "山田次郎"}',
  false,
  'authenticated'
) ON CONFLICT (id) DO NOTHING;

-- Create corresponding public users records
-- These should be created automatically by the trigger, but we'll ensure they exist

INSERT INTO public.users (
  id,
  name,
  created_at,
  updated_at
) VALUES 
  (
    '11111111-1111-1111-1111-111111111111',
    '田中太郎',
    NOW(),
    NOW()
  ),
  (
    '22222222-2222-2222-2222-222222222222',
    '佐藤花子',
    NOW(),
    NOW()
  ),
  (
    '33333333-3333-3333-3333-333333333333',
    '山田次郎',
    NOW(),
    NOW()
  )
ON CONFLICT (id) DO NOTHING;

-- ==============================================
-- 2. Sample Household (Invite Code System)
-- ==============================================

-- Create sample household (password removed)
INSERT INTO public.households (
  id,
  name,
  settlement_day,
  created_at,
  updated_at
) VALUES (
  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
  'tanaka',
  25,
  NOW(),
  NOW()
) ON CONFLICT (id) DO NOTHING;

-- ==============================================
-- 3. Household Members
-- ==============================================

-- Add household members
INSERT INTO public.household_members (
  id,
  household_id,
  user_id,
  role,
  joined_at
) VALUES 
  (
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    '11111111-1111-1111-1111-111111111111',
    'admin',
    NOW() - INTERVAL '30 days'
  ),
  (
    'cccccccc-cccc-cccc-cccc-cccccccccccc',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    '22222222-2222-2222-2222-222222222222',
    'member',
    NOW() - INTERVAL '25 days'
  ),
  (
    'dddddddd-dddd-dddd-dddd-dddddddddddd',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    '33333333-3333-3333-3333-333333333333',
    'member',
    NOW() - INTERVAL '20 days'
  )
ON CONFLICT (household_id, user_id) DO NOTHING;

-- ==============================================
-- 4. Sample Invite Codes
-- ==============================================

-- Create sample invite codes for testing
INSERT INTO public.invite_codes (
  id,
  code,
  household_id,
  created_by,
  expires_at,
  is_used,
  created_at,
  updated_at
) VALUES 
  (
    'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee',
    'TEST01',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    '11111111-1111-1111-1111-111111111111',
    NOW() + INTERVAL '24 hours',
    false,
    NOW(),
    NOW()
  ),
  (
    'eeeeeeef-eeee-eeee-eeee-eeeeeeeeeeee',
    'USED01',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    '11111111-1111-1111-1111-111111111111',
    NOW() + INTERVAL '24 hours',
    true,
    NOW() - INTERVAL '1 hour',
    NOW()
  )
ON CONFLICT (id) DO NOTHING;

-- ==============================================
-- 5. Basic Chore Items
-- ==============================================

-- Create common household chores with Japanese names and reasonable rewards
INSERT INTO public.chores (
  id,
  household_id,
  name,
  description,
  reward_amount,
  order_index,
  is_active,
  created_by,
  created_at,
  updated_at
) VALUES 
  (
    '10000000-0000-0000-0000-000000000001',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    '掃除機かけ',
    'リビングと寝室の掃除機がけ',
    300,
    1,
    true,
    '11111111-1111-1111-1111-111111111111',
    NOW(),
    NOW()
  ),
  (
    '10000000-0000-0000-0000-000000000002',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    '洗濯',
    '洗濯物を洗って干す',
    200,
    2,
    true,
    '11111111-1111-1111-1111-111111111111',
    NOW(),
    NOW()
  ),
  (
    '10000000-0000-0000-0000-000000000003',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    '食器洗い',
    '食事後の食器洗いと片付け',
    150,
    3,
    true,
    '11111111-1111-1111-1111-111111111111',
    NOW(),
    NOW()
  ),
  (
    '10000000-0000-0000-0000-000000000004',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    'ゴミ出し',
    '燃えるゴミ・資源ゴミの分別と回収',
    100,
    4,
    true,
    '11111111-1111-1111-1111-111111111111',
    NOW(),
    NOW()
  ),
  (
    '10000000-0000-0000-0000-000000000005',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    'お風呂掃除',
    '浴槽とバスルーム全体の掃除',
    400,
    5,
    true,
    '11111111-1111-1111-1111-111111111111',
    NOW(),
    NOW()
  ),
  (
    '10000000-0000-0000-0000-000000000006',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    'トイレ掃除',
    'トイレの清掃と消毒',
    250,
    6,
    true,
    '11111111-1111-1111-1111-111111111111',
    NOW(),
    NOW()
  ),
  (
    '10000000-0000-0000-0000-000000000007',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    '料理',
    '朝食・昼食・夕食の準備',
    500,
    7,
    true,
    '22222222-2222-2222-2222-222222222222',
    NOW(),
    NOW()
  ),
  (
    '10000000-0000-0000-0000-000000000008',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    '買い物',
    '日用品や食材の買い出し',
    200,
    8,
    true,
    '22222222-2222-2222-2222-222222222222',
    NOW(),
    NOW()
  )
ON CONFLICT (id) DO NOTHING;

-- ==============================================
-- 6. Sample Chore Logs (Past Week)
-- ==============================================

-- Create realistic chore completion logs for the past week
-- Distributed among the three household members

-- Day 1 (7 days ago)
INSERT INTO public.chore_logs (
  id,
  household_id,
  chore_id,
  performed_by,
  performed_at,
  reward_amount,
  created_at
) VALUES 
  (
    '20000000-0000-0000-0000-000000000001',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    '10000000-0000-0000-0000-000000000007', -- 料理
    '22222222-2222-2222-2222-222222222222', -- 佐藤花子
    NOW() - INTERVAL '7 days' + INTERVAL '18 hours',
    500,
    NOW() - INTERVAL '7 days' + INTERVAL '18 hours'
  ),
  (
    '20000000-0000-0000-0000-000000000002',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    '10000000-0000-0000-0000-000000000003', -- 食器洗い
    '33333333-3333-3333-3333-333333333333', -- 山田次郎
    NOW() - INTERVAL '7 days' + INTERVAL '20 hours',
    150,
    NOW() - INTERVAL '7 days' + INTERVAL '20 hours'
  ),

-- Day 2 (6 days ago)
  (
    '20000000-0000-0000-0000-000000000003',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    '10000000-0000-0000-0000-000000000004', -- ゴミ出し
    '11111111-1111-1111-1111-111111111111', -- 田中太郎
    NOW() - INTERVAL '6 days' + INTERVAL '7 hours',
    100,
    NOW() - INTERVAL '6 days' + INTERVAL '7 hours'
  ),
  (
    '20000000-0000-0000-0000-000000000004',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    '10000000-0000-0000-0000-000000000002', -- 洗濯
    '22222222-2222-2222-2222-222222222222', -- 佐藤花子
    NOW() - INTERVAL '6 days' + INTERVAL '10 hours',
    200,
    NOW() - INTERVAL '6 days' + INTERVAL '10 hours'
  ),

-- Day 3 (5 days ago)
  (
    '20000000-0000-0000-0000-000000000005',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    '10000000-0000-0000-0000-000000000001', -- 掃除機かけ
    '33333333-3333-3333-3333-333333333333', -- 山田次郎
    NOW() - INTERVAL '5 days' + INTERVAL '15 hours',
    300,
    NOW() - INTERVAL '5 days' + INTERVAL '15 hours'
  ),
  (
    '20000000-0000-0000-0000-000000000006',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    '10000000-0000-0000-0000-000000000007', -- 料理
    '22222222-2222-2222-2222-222222222222', -- 佐藤花子
    NOW() - INTERVAL '5 days' + INTERVAL '18 hours',
    500,
    NOW() - INTERVAL '5 days' + INTERVAL '18 hours'
  ),

-- Day 4 (4 days ago)
  (
    '20000000-0000-0000-0000-000000000007',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    '10000000-0000-0000-0000-000000000008', -- 買い物
    '11111111-1111-1111-1111-111111111111', -- 田中太郎
    NOW() - INTERVAL '4 days' + INTERVAL '16 hours',
    200,
    NOW() - INTERVAL '4 days' + INTERVAL '16 hours'
  ),
  (
    '20000000-0000-0000-0000-000000000008',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    '10000000-0000-0000-0000-000000000005', -- お風呂掃除
    '33333333-3333-3333-3333-333333333333', -- 山田次郎
    NOW() - INTERVAL '4 days' + INTERVAL '19 hours',
    400,
    NOW() - INTERVAL '4 days' + INTERVAL '19 hours'
  ),

-- Day 5 (3 days ago)
  (
    '20000000-0000-0000-0000-000000000009',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    '10000000-0000-0000-0000-000000000003', -- 食器洗い
    '22222222-2222-2222-2222-222222222222', -- 佐藤花子
    NOW() - INTERVAL '3 days' + INTERVAL '20 hours',
    150,
    NOW() - INTERVAL '3 days' + INTERVAL '20 hours'
  ),
  (
    '20000000-0000-0000-0000-000000000010',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    '10000000-0000-0000-0000-000000000006', -- トイレ掃除
    '11111111-1111-1111-1111-111111111111', -- 田中太郎
    NOW() - INTERVAL '3 days' + INTERVAL '14 hours',
    250,
    NOW() - INTERVAL '3 days' + INTERVAL '14 hours'
  ),

-- Day 6 (2 days ago)
  (
    '20000000-0000-0000-0000-000000000011',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    '10000000-0000-0000-0000-000000000002', -- 洗濯
    '33333333-3333-3333-3333-333333333333', -- 山田次郎
    NOW() - INTERVAL '2 days' + INTERVAL '9 hours',
    200,
    NOW() - INTERVAL '2 days' + INTERVAL '9 hours'
  ),
  (
    '20000000-0000-0000-0000-000000000012',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    '10000000-0000-0000-0000-000000000007', -- 料理
    '22222222-2222-2222-2222-222222222222', -- 佐藤花子
    NOW() - INTERVAL '2 days' + INTERVAL '18 hours',
    500,
    NOW() - INTERVAL '2 days' + INTERVAL '18 hours'
  ),

-- Day 7 (1 day ago)
  (
    '20000000-0000-0000-0000-000000000013',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    '10000000-0000-0000-0000-000000000001', -- 掃除機かけ
    '11111111-1111-1111-1111-111111111111', -- 田中太郎
    NOW() - INTERVAL '1 day' + INTERVAL '16 hours',
    300,
    NOW() - INTERVAL '1 day' + INTERVAL '16 hours'
  ),
  (
    '20000000-0000-0000-0000-000000000014',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    '10000000-0000-0000-0000-000000000003', -- 食器洗い
    '33333333-3333-3333-3333-333333333333', -- 山田次郎
    NOW() - INTERVAL '1 day' + INTERVAL '20 hours',
    150,
    NOW() - INTERVAL '1 day' + INTERVAL '20 hours'
  ),

-- Today
  (
    '20000000-0000-0000-0000-000000000015',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    '10000000-0000-0000-0000-000000000008', -- 買い物
    '22222222-2222-2222-2222-222222222222', -- 佐藤花子
    NOW() - INTERVAL '3 hours',
    200,
    NOW() - INTERVAL '3 hours'
  )
ON CONFLICT (id) DO NOTHING;

-- ==============================================
-- Seed Data Creation Complete
-- ==============================================

-- Summary of created test data:
-- - 3 test users (田中太郎 admin, 佐藤花子 member, 山田次郎 member)
-- - 1 household (tanaka) using invite code system
-- - 2 sample invite codes (1 active: TEST01, 1 used: USED01)
-- - 8 common chore types with realistic rewards
-- - 15 chore completion logs over the past week

-- Login credentials for testing:
-- Email: tanaka@example.com, Password: password123 (Admin)
-- Email: sato@example.com, Password: password123 (Member)
-- Email: yamada@example.com, Password: password123 (Member)

-- Household join info for testing:
-- Group Name: tanaka
-- Invite Code: TEST01 (active, 24h expiry)
-- Invite Code: USED01 (already used)

-- Note: Remember to run 'npm run db:reset' to apply this seed data