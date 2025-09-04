-- Supabase Storage バケットとポリシー設定スクリプト
-- 資料ストックシステム用

-- ファイルストレージバケットの作成
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
        'image/webp'
    ]
);

-- ストレージポリシーの設定

-- 認証済みユーザーのファイル表示ポリシー
CREATE POLICY "Authenticated users can view files" ON storage.objects
    FOR SELECT USING (
        bucket_id = 'files' AND
        auth.role() = 'authenticated'
    );

-- 管理者のファイルアップロードポリシー
CREATE POLICY "Admin can upload files" ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id = 'files' AND
        auth.role() = 'authenticated' AND
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() AND user_type = 'admin'
        )
    );

-- 管理者のファイル更新ポリシー
CREATE POLICY "Admin can update files" ON storage.objects
    FOR UPDATE USING (
        bucket_id = 'files' AND
        auth.role() = 'authenticated' AND
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() AND user_type = 'admin'
        )
    );

-- 管理者のファイル削除ポリシー
CREATE POLICY "Admin can delete files" ON storage.objects
    FOR DELETE USING (
        bucket_id = 'files' AND
        auth.role() = 'authenticated' AND
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() AND user_type = 'admin'
        )
    );

-- RLSを有効化
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;