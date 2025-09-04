-- 資料ストックシステム Supabase データベースセットアップ
-- MCP統合対応 & Supabase Auth統合

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users テーブル（Supabase Auth統合用）
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
    category TEXT NOT NULL,
    description TEXT,
    file_path TEXT NOT NULL,
    mime_type TEXT,
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    uploaded_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    is_deleted BOOLEAN DEFAULT FALSE,
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- インデックスの作成
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
CREATE POLICY "Users can view their own profile" ON profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Admin can view all profiles" ON profiles
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() AND user_type = 'admin'
        )
    );

-- Categories テーブルのポリシー
CREATE POLICY "Anyone can view categories" ON categories
    FOR SELECT USING (TRUE);

CREATE POLICY "Admin can insert categories" ON categories
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() AND user_type = 'admin'
        )
    );

CREATE POLICY "Admin can update categories" ON categories
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() AND user_type = 'admin'
        )
    );

CREATE POLICY "Admin can delete categories" ON categories
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() AND user_type = 'admin'
        )
    );

-- Files テーブルのポリシー
CREATE POLICY "Anyone can view non-deleted files" ON files
    FOR SELECT USING (is_deleted = FALSE);

CREATE POLICY "Admin can insert files" ON files
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() AND user_type = 'admin'
        )
    );

CREATE POLICY "Admin can update files" ON files
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() AND user_type = 'admin'
        )
    );

CREATE POLICY "Admin can soft delete files" ON files
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() AND user_type = 'admin'
        )
    );

-- デフォルトカテゴリの挿入
INSERT INTO categories (name, description) VALUES
    ('教育資料', '教育関連の資料やドキュメント'),
    ('業務資料', '業務に関する資料やマニュアル'),
    ('安全管理', '安全管理に関する資料やガイドライン'),
    ('法令・規則', '法令や規則に関する文書'),
    ('その他', 'その他の資料')
ON CONFLICT (name) DO NOTHING;

-- ストレージバケットの作成（SQLではなく、Supabaseダッシュボードまたは管理APIで実行）
-- CREATE BUCKET IF NOT EXISTS files;

-- ストレージポリシーの設定
-- INSERT INTO storage.policies (name, bucket_id, policy) VALUES
--     ('Authenticated users can upload files', 'files', 'authenticated'),
--     ('Anyone can view files', 'files', 'public');

-- トリガー関数：updated_at の自動更新
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- トリガーの設定
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
    FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- 管理者ユーザーの初期設定（Supabase Authで手動作成後に実行）
-- Supabase Authで作成された管理者ユーザーのprofileを作成するための関数
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
CREATE TRIGGER create_profile_trigger 
    AFTER INSERT ON auth.users 
    FOR EACH ROW EXECUTE PROCEDURE create_profile_for_user(); 