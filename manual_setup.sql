-- 東翔運輸 資料ストックシステム - 手動セットアップ用SQL
-- このSQLをSupabase Dashboard (SQL Editor) で実行してください

-- カテゴリテーブル
CREATE TABLE IF NOT EXISTS categories (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- ファイルテーブル
CREATE TABLE IF NOT EXISTS files (
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

-- 初期カテゴリデータの挿入
INSERT INTO categories (name, description) VALUES
('教育資料', '新人研修や安全講習などの教育関連資料'),
('業務資料', '日常業務で使用する手順書やマニュアル'),
('安全管理', '安全運転や事故防止に関する資料'),
('法令・規則', '運送業に関する法令や社内規則'),
('その他', 'その他の資料')
ON CONFLICT (name) DO NOTHING;

-- Row Level Security (RLS) ポリシーの設定
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE files ENABLE ROW LEVEL SECURITY;

-- 開発用：すべてのユーザーにアクセス権限を付与
DROP POLICY IF EXISTS "Enable read access for all users" ON categories;
CREATE POLICY "Enable read access for all users" ON categories FOR SELECT USING (true);

DROP POLICY IF EXISTS "Enable insert access for all users" ON categories;
CREATE POLICY "Enable insert access for all users" ON categories FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Enable update access for all users" ON categories;
CREATE POLICY "Enable update access for all users" ON categories FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Enable delete access for all users" ON categories;
CREATE POLICY "Enable delete access for all users" ON categories FOR DELETE USING (true);

DROP POLICY IF EXISTS "Enable read access for all users" ON files;
CREATE POLICY "Enable read access for all users" ON files FOR SELECT USING (true);

DROP POLICY IF EXISTS "Enable insert access for all users" ON files;
CREATE POLICY "Enable insert access for all users" ON files FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Enable update access for all users" ON files;
CREATE POLICY "Enable update access for all users" ON files FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Enable delete access for all users" ON files;
CREATE POLICY "Enable delete access for all users" ON files FOR DELETE USING (true);

-- Storage bucket作成
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types) 
VALUES ('files', 'files', false, 52428800, ARRAY[
    'image/jpeg', 
    'image/png', 
    'image/gif', 
    'application/pdf', 
    'application/msword', 
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 
    'application/vnd.ms-excel', 
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 
    'application/vnd.ms-powerpoint', 
    'application/vnd.openxmlformats-officedocument.presentationml.presentation', 
    'text/plain'
])
ON CONFLICT (id) DO NOTHING;

-- Storage RLS ポリシー設定
DROP POLICY IF EXISTS "Enable read access for all users" ON storage.objects;
CREATE POLICY "Enable read access for all users" ON storage.objects FOR SELECT USING (bucket_id = 'files');

DROP POLICY IF EXISTS "Enable insert for all users" ON storage.objects;
CREATE POLICY "Enable insert for all users" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'files');

DROP POLICY IF EXISTS "Enable update for all users" ON storage.objects;
CREATE POLICY "Enable update for all users" ON storage.objects FOR UPDATE USING (bucket_id = 'files');

DROP POLICY IF EXISTS "Enable delete for all users" ON storage.objects;
CREATE POLICY "Enable delete for all users" ON storage.objects FOR DELETE USING (bucket_id = 'files');