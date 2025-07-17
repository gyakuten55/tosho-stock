-- 東翔運輸株式会社 社内資料管理システム
-- Supabase データベーステーブル作成スクリプト

-- カテゴリテーブル
CREATE TABLE categories (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- ファイルテーブル
CREATE TABLE files (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    original_name VARCHAR(255) NOT NULL,
    size BIGINT NOT NULL,
    category VARCHAR(100) NOT NULL,
    description TEXT,
    file_path VARCHAR(500) NOT NULL,
    uploaded_at TIMESTAMP DEFAULT NOW(),
    uploaded_by VARCHAR(100) NOT NULL,
    FOREIGN KEY (category) REFERENCES categories(name) ON UPDATE CASCADE
);

-- Storage bucket作成（Supabase管理画面で実行）
-- Bucket名: files
-- Public access: false（管理者・ユーザーのみアクセス可能）

-- 初期カテゴリデータの挿入
INSERT INTO categories (name, description) VALUES
('教育資料', '新人研修や安全講習などの教育関連資料'),
('業務資料', '日常業務で使用する手順書やマニュアル'),
('安全管理', '安全運転や事故防止に関する資料'),
('法令・規則', '運送業に関する法令や社内規則'),
('その他', 'その他の資料');

-- Row Level Security (RLS) ポリシーの設定
-- 注意: 本システムでは認証をカスタム実装しているため、
-- 実際の本番環境では適切なRLSポリシーを設定してください

-- categoriesテーブルのRLS有効化
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

-- filesテーブルのRLS有効化  
ALTER TABLE files ENABLE ROW LEVEL SECURITY;

-- 一時的にすべてのユーザーに読み取り権限を付与
-- 本番環境では適切な認証システムに合わせて調整してください
CREATE POLICY "Enable read access for all users" ON categories FOR SELECT USING (true);
CREATE POLICY "Enable insert access for all users" ON categories FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update access for all users" ON categories FOR UPDATE USING (true);
CREATE POLICY "Enable delete access for all users" ON categories FOR DELETE USING (true);

CREATE POLICY "Enable read access for all users" ON files FOR SELECT USING (true);
CREATE POLICY "Enable insert access for all users" ON files FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update access for all users" ON files FOR UPDATE USING (true);
CREATE POLICY "Enable delete access for all users" ON files FOR DELETE USING (true);

-- Storage bucket作成とポリシー設定（Supabase管理画面で実行）
-- 1. Storage → Files → Create bucket
-- 2. Bucket名: files
-- 3. Public access: OFF
-- 4. ポリシー設定:
INSERT INTO storage.buckets (id, name, public) VALUES ('files', 'files', false);

INSERT INTO storage.policies (id, bucket_id, name, definition, check, command, roles) VALUES 
('files_select', 'files', 'Enable read access for all users', 'true', null, 'SELECT', '{anon,authenticated}'),
('files_insert', 'files', 'Enable insert for all users', 'true', null, 'INSERT', '{anon,authenticated}'),
('files_update', 'files', 'Enable update for all users', 'true', null, 'UPDATE', '{anon,authenticated}'),
('files_delete', 'files', 'Enable delete for all users', 'true', null, 'DELETE', '{anon,authenticated}'); 