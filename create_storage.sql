-- Storage bucket作成とポリシー設定

-- Storage bucket作成（SQL形式）
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
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Storage objects の読み取り権限
DROP POLICY IF EXISTS "Enable read access for all users" ON storage.objects;
CREATE POLICY "Enable read access for all users" ON storage.objects FOR SELECT USING (bucket_id = 'files');

-- Storage objects の書き込み権限
DROP POLICY IF EXISTS "Enable insert for all users" ON storage.objects;
CREATE POLICY "Enable insert for all users" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'files');

-- Storage objects の更新権限
DROP POLICY IF EXISTS "Enable update for all users" ON storage.objects;
CREATE POLICY "Enable update for all users" ON storage.objects FOR UPDATE USING (bucket_id = 'files');

-- Storage objects の削除権限
DROP POLICY IF EXISTS "Enable delete for all users" ON storage.objects;
CREATE POLICY "Enable delete for all users" ON storage.objects FOR DELETE USING (bucket_id = 'files');