-- 資料ストックシステム - 最終統一Supabaseセットアップスクリプト
-- MCP対応完全版

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Profiles テーブル（Supabase Auth統合用）
CREATE TABLE IF NOT EXISTS profiles (
    id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    user_type TEXT CHECK (user_type IN ('admin', 'user')) DEFAULT 'user',
    full_name TEXT,
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Categories テーブル
CREATE TABLE IF NOT EXISTS categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Files テーブル
CREATE TABLE IF NOT EXISTS files (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    original_name TEXT NOT NULL,
    size BIGINT NOT NULL,
    category TEXT NOT NULL REFERENCES categories(name) ON UPDATE CASCADE,
    description TEXT,
    file_path TEXT NOT NULL,
    mime_type TEXT,
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    uploaded_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    is_deleted BOOLEAN DEFAULT FALSE,
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- 必要なインデックスの作成
CREATE INDEX IF NOT EXISTS idx_files_category ON files(category);
CREATE INDEX IF NOT EXISTS idx_files_uploaded_at ON files(uploaded_at DESC);
CREATE INDEX IF NOT EXISTS idx_files_name ON files(name);
CREATE INDEX IF NOT EXISTS idx_files_uploaded_by ON files(uploaded_by);
CREATE INDEX IF NOT EXISTS idx_files_is_deleted ON files(is_deleted) WHERE is_deleted = FALSE;
CREATE INDEX IF NOT EXISTS idx_categories_name ON categories(name);
CREATE INDEX IF NOT EXISTS idx_profiles_username ON profiles(username);
CREATE INDEX IF NOT EXISTS idx_profiles_user_type ON profiles(user_type);

-- Row Level Security (RLS) の有効化
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE files ENABLE ROW LEVEL SECURITY;

-- RLSポリシーの設定

-- Profiles テーブルのポリシー
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
CREATE POLICY "Users can view their own profile" ON profiles
    FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
CREATE POLICY "Users can update their own profile" ON profiles
    FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "Admin can view all profiles" ON profiles;
CREATE POLICY "Admin can view all profiles" ON profiles
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() AND user_type = 'admin'
        )
    );

-- Categories テーブルのポリシー
DROP POLICY IF EXISTS "Anyone can view categories" ON categories;
CREATE POLICY "Anyone can view categories" ON categories
    FOR SELECT USING (TRUE);

DROP POLICY IF EXISTS "Admin can insert categories" ON categories;
CREATE POLICY "Admin can insert categories" ON categories
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() AND user_type = 'admin'
        )
    );

DROP POLICY IF EXISTS "Admin can update categories" ON categories;
CREATE POLICY "Admin can update categories" ON categories
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() AND user_type = 'admin'
        )
    );

DROP POLICY IF EXISTS "Admin can delete categories" ON categories;
CREATE POLICY "Admin can delete categories" ON categories
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() AND user_type = 'admin'
        )
    );

-- Files テーブルのポリシー
DROP POLICY IF EXISTS "Anyone can view non-deleted files" ON files;
CREATE POLICY "Anyone can view non-deleted files" ON files
    FOR SELECT USING (is_deleted = FALSE);

DROP POLICY IF EXISTS "Admin can insert files" ON files;
CREATE POLICY "Admin can insert files" ON files
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() AND user_type = 'admin'
        )
    );

DROP POLICY IF EXISTS "Admin can update files" ON files;
CREATE POLICY "Admin can update files" ON files
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() AND user_type = 'admin'
        )
    );

-- トリガー関数：updated_at の自動更新
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- トリガーの設定
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
    FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- 新しいユーザーが作成されたときに自動でprofileを作成するための関数
CREATE OR REPLACE FUNCTION create_profile_for_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO profiles (id, username, user_type, full_name)
    VALUES (
        NEW.id, 
        COALESCE(NEW.raw_user_meta_data->>'username', NEW.email),
        COALESCE(NEW.raw_user_meta_data->>'user_type', 'user'),
        COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email)
    );
    RETURN NEW;
END;
$$ language 'plpgsql' security definer;

-- 新しいユーザーが作成されたときに自動でprofileを作成
DROP TRIGGER IF EXISTS create_profile_trigger ON auth.users;
CREATE TRIGGER create_profile_trigger 
    AFTER INSERT ON auth.users 
    FOR EACH ROW EXECUTE PROCEDURE create_profile_for_user();

-- デフォルトカテゴリの挿入
INSERT INTO categories (name, description) VALUES
    ('教育資料', '教育関連の資料やドキュメント'),
    ('業務資料', '業務に関する資料やマニュアル'),
    ('安全管理', '安全管理に関する資料やガイドライン'),
    ('法令・規則', '法令や規則に関する文書'),
    ('その他', 'その他の資料')
ON CONFLICT (name) DO NOTHING;

-- 管理者ユーザーのためのテスト用プロファイル作成（開発用）
-- 実際のSupabase Authと併用する場合は、Auth UIで作成したユーザーのIDを使用してください
DO $$
DECLARE
    admin_uuid UUID := gen_random_uuid();
    user_uuid UUID := gen_random_uuid();
BEGIN
    -- テスト用管理者プロファイル（レガシー認証用）
    INSERT INTO profiles (id, username, user_type, full_name) VALUES
        (admin_uuid, 'admin', 'admin', 'Administrator')
    ON CONFLICT (username) DO NOTHING;
    
    -- テスト用一般ユーザープロファイル（レガシー認証用）
    INSERT INTO profiles (id, username, user_type, full_name) VALUES
        (user_uuid, 'user', 'user', 'Regular User')
    ON CONFLICT (username) DO NOTHING;
END $$;

-- ファイルストレージバケットとポリシーの作成
-- 注意：これらのコマンドはSupabase SQL Editorでは動作しません
-- Supabase ダッシュボードまたは管理APIで個別に実行してください

-- Storage bucket creation (ダッシュボードで実行)
-- INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
-- VALUES (
--     'files',
--     'files',
--     false,
--     52428800, -- 50MB limit
--     ARRAY[
--         'application/pdf',
--         'application/vnd.ms-excel',
--         'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
--         'application/vnd.ms-powerpoint',
--         'application/vnd.openxmlformats-officedocument.presentationml.presentation',
--         'application/msword',
--         'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
--         'text/plain',
--         'image/jpeg',
--         'image/png',
--         'image/gif',
--         'image/webp'
--     ]
-- );

-- Storage policies (ダッシュボードで実行)
-- CREATE POLICY "Authenticated users can view files" ON storage.objects
--     FOR SELECT USING (
--         bucket_id = 'files' AND
--         auth.role() = 'authenticated'
--     );

-- CREATE POLICY "Admin can upload files" ON storage.objects
--     FOR INSERT WITH CHECK (
--         bucket_id = 'files' AND
--         auth.role() = 'authenticated' AND
--         EXISTS (
--             SELECT 1 FROM profiles 
--             WHERE id = auth.uid() AND user_type = 'admin'
--         )
--     );

-- CREATE POLICY "Admin can update files" ON storage.objects
--     FOR UPDATE USING (
--         bucket_id = 'files' AND
--         auth.role() = 'authenticated' AND
--         EXISTS (
--             SELECT 1 FROM profiles 
--             WHERE id = auth.uid() AND user_type = 'admin'
--         )
--     );

-- CREATE POLICY "Admin can delete files" ON storage.objects
--     FOR DELETE USING (
--         bucket_id = 'files' AND
--         auth.role() = 'authenticated' AND
--         EXISTS (
--             SELECT 1 FROM profiles 
--             WHERE id = auth.uid() AND user_type = 'admin'
--         )
--     );

-- セットアップ完了の確認用クエリ
SELECT 
    'Setup completed successfully! Tables created:' AS message,
    COUNT(*) AS table_count
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('profiles', 'categories', 'files');