-- Supabase Storage バケット設定スクリプト
-- 注意：このスクリプトはSupabase ダッシュボードのSQL Editorで実行してください

-- 1. ファイルストレージバケットの作成
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'files',
    'files',
    false,
    52428800, -- 50MB limit
    ARRAY[
        'application/pdf',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/vnd.ms-powerpoint',
        'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'text/plain',
        'image/jpeg',
        'image/png',
        'image/gif',
        'image/webp',
        'image/svg+xml'
    ]
)
ON CONFLICT (id) DO UPDATE SET
    file_size_limit = EXCLUDED.file_size_limit,
    allowed_mime_types = EXCLUDED.allowed_mime_types;

-- 2. ストレージポリシーの設定
-- RLSを有効にする
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- 既存のポリシーを削除
DROP POLICY IF EXISTS "Authenticated users can view files" ON storage.objects;
DROP POLICY IF EXISTS "Admin can upload files" ON storage.objects;
DROP POLICY IF EXISTS "Admin can update files" ON storage.objects;
DROP POLICY IF EXISTS "Admin can delete files" ON storage.objects;
DROP POLICY IF EXISTS "Users can view files" ON storage.objects;
DROP POLICY IF EXISTS "Admins can upload files" ON storage.objects;
DROP POLICY IF EXISTS "Admins can update files" ON storage.objects;
DROP POLICY IF EXISTS "Admins can delete files" ON storage.objects;

-- 新しいポリシーを作成
-- 認証済みユーザーのファイル表示ポリシー
CREATE POLICY "Users can view files" ON storage.objects
    FOR SELECT USING (
        bucket_id = 'files' AND
        auth.role() = 'authenticated'
    );

-- 管理者のファイルアップロードポリシー
CREATE POLICY "Admins can upload files" ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id = 'files' AND
        auth.role() = 'authenticated' AND
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() AND user_type = 'admin'
        )
    );

-- 管理者のファイル更新ポリシー
CREATE POLICY "Admins can update files" ON storage.objects
    FOR UPDATE USING (
        bucket_id = 'files' AND
        auth.role() = 'authenticated' AND
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() AND user_type = 'admin'
        )
    );

-- 管理者のファイル削除ポリシー
CREATE POLICY "Admins can delete files" ON storage.objects
    FOR DELETE USING (
        bucket_id = 'files' AND
        auth.role() = 'authenticated' AND
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() AND user_type = 'admin'
        )
    );

-- バケット設定の確認
SELECT 
    id,
    name,
    public,
    file_size_limit,
    allowed_mime_types
FROM storage.buckets 
WHERE id = 'files';

-- ポリシー設定の確認
SELECT 
    policyname,
    cmd,
    qual
FROM pg_policy p
JOIN pg_class c ON p.polrelid = c.oid
JOIN pg_namespace n ON c.relnamespace = n.oid
WHERE n.nspname = 'storage' AND c.relname = 'objects';