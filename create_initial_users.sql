-- 初期ユーザー作成スクリプト
-- Supabase ダッシュボードのSQL Editorで実行してください

-- 既存のテストユーザーを削除（もしあれば）
DELETE FROM auth.users WHERE email IN ('admin@tosho.local', 'user@tosho.local');

-- 管理者ユーザーを作成
INSERT INTO auth.users (
  id,
  instance_id,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  raw_user_meta_data,
  role,
  aud
) VALUES (
  gen_random_uuid(),
  '00000000-0000-0000-0000-000000000000',
  'admin@tosho.local',
  crypt('admin123', gen_salt('bf')),
  now(),
  now(),
  now(),
  '{"username": "admin", "user_type": "admin", "full_name": "管理者"}'::jsonb,
  'authenticated',
  'authenticated'
);

-- 一般ユーザーを作成
INSERT INTO auth.users (
  id,
  instance_id,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  raw_user_meta_data,
  role,
  aud
) VALUES (
  gen_random_uuid(),
  '00000000-0000-0000-0000-000000000000',
  'user@tosho.local',
  crypt('user123', gen_salt('bf')),
  now(),
  now(),
  now(),
  '{"username": "user", "user_type": "user", "full_name": "一般ユーザー"}'::jsonb,
  'authenticated',
  'authenticated'
);

-- 作成されたユーザーを確認
SELECT id, email, raw_user_meta_data FROM auth.users WHERE email IN ('admin@tosho.local', 'user@tosho.local');