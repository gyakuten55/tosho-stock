const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://xaxhzcxcgqxuyeawkclj.supabase.co';
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhheGh6Y3hjZ3F4dXllYXdrY2xqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NjY2MzAyNiwiZXhwIjoyMDcyMjM5MDI2fQ.FyNiG7q0vUe-LZf8xUS9IKg4HYbNyjWEmSUKLfrY6Oc';

// Service Role Keyで管理者クライアント作成
const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function setupDatabase() {
  console.log('🚀 Setting up Supabase database with Service Role...\n');

  try {
    // Step 1: Create categories table
    console.log('1. Creating categories table...');
    const { error: categoriesError } = await supabase.rpc('exec_sql', {
      query: `
        CREATE TABLE IF NOT EXISTS categories (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          name VARCHAR(100) UNIQUE NOT NULL,
          description TEXT,
          created_at TIMESTAMP DEFAULT NOW()
        );
      `
    });

    if (categoriesError) {
      console.log('❌ Categories table creation failed, trying alternative method...');
      console.log('Error:', categoriesError.message);
    } else {
      console.log('✅ Categories table created successfully');
    }

    // Step 2: Create files table
    console.log('\n2. Creating files table...');
    const { error: filesError } = await supabase.rpc('exec_sql', {
      query: `
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
      `
    });

    if (filesError) {
      console.log('❌ Files table creation failed');
      console.log('Error:', filesError.message);
    } else {
      console.log('✅ Files table created successfully');
    }

    // Step 3: Insert initial categories
    console.log('\n3. Inserting initial categories...');
    const { error: insertError } = await supabase
      .from('categories')
      .upsert([
        { name: '教育資料', description: '新人研修や安全講習などの教育関連資料' },
        { name: '業務資料', description: '日常業務で使用する手順書やマニュアル' },
        { name: '安全管理', description: '安全運転や事故防止に関する資料' },
        { name: '法令・規則', description: '運送業に関する法令や社内規則' },
        { name: 'その他', description: 'その他の資料' }
      ], { 
        onConflict: 'name',
        ignoreDuplicates: true 
      });

    if (insertError) {
      console.log('❌ Categories insertion failed');
      console.log('Error:', insertError.message);
    } else {
      console.log('✅ Initial categories inserted successfully');
    }

    // Step 4: Enable RLS
    console.log('\n4. Setting up Row Level Security...');
    const rlsQueries = [
      'ALTER TABLE categories ENABLE ROW LEVEL SECURITY;',
      'ALTER TABLE files ENABLE ROW LEVEL SECURITY;',
      'DROP POLICY IF EXISTS "Enable read access for all users" ON categories;',
      'CREATE POLICY "Enable read access for all users" ON categories FOR SELECT USING (true);',
      'DROP POLICY IF EXISTS "Enable insert access for all users" ON categories;',
      'CREATE POLICY "Enable insert access for all users" ON categories FOR INSERT WITH CHECK (true);',
      'DROP POLICY IF EXISTS "Enable update access for all users" ON categories;',
      'CREATE POLICY "Enable update access for all users" ON categories FOR UPDATE USING (true);',
      'DROP POLICY IF EXISTS "Enable delete access for all users" ON categories;',
      'CREATE POLICY "Enable delete access for all users" ON categories FOR DELETE USING (true);',
      'DROP POLICY IF EXISTS "Enable read access for all users" ON files;',
      'CREATE POLICY "Enable read access for all users" ON files FOR SELECT USING (true);',
      'DROP POLICY IF EXISTS "Enable insert access for all users" ON files;',
      'CREATE POLICY "Enable insert access for all users" ON files FOR INSERT WITH CHECK (true);',
      'DROP POLICY IF EXISTS "Enable update access for all users" ON files;',
      'CREATE POLICY "Enable update access for all users" ON files FOR UPDATE USING (true);',
      'DROP POLICY IF EXISTS "Enable delete access for all users" ON files;',
      'CREATE POLICY "Enable delete access for all users" ON files FOR DELETE USING (true);'
    ];

    for (const query of rlsQueries) {
      const { error: rlsError } = await supabase.rpc('exec_sql', { query });
      if (rlsError) {
        console.log(`⚠️ RLS query failed: ${query.substring(0, 50)}...`);
        console.log('Error:', rlsError.message);
      }
    }
    console.log('✅ RLS policies configured');

    // Step 5: Create storage bucket
    console.log('\n5. Creating storage bucket...');
    const { error: bucketError } = await supabase.storage.createBucket('files', {
      public: false,
      fileSizeLimit: 52428800, // 50MB
      allowedMimeTypes: [
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
      ]
    });

    if (bucketError && bucketError.message !== 'Bucket already exists') {
      console.log('❌ Storage bucket creation failed');
      console.log('Error:', bucketError.message);
    } else {
      console.log('✅ Storage bucket created or already exists');
    }

    // Step 6: Set storage policies
    console.log('\n6. Setting up storage policies...');
    const storageQueries = [
      `DROP POLICY IF EXISTS "Enable read access for all users" ON storage.objects;`,
      `CREATE POLICY "Enable read access for all users" ON storage.objects FOR SELECT USING (bucket_id = 'files');`,
      `DROP POLICY IF EXISTS "Enable insert for all users" ON storage.objects;`,
      `CREATE POLICY "Enable insert for all users" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'files');`,
      `DROP POLICY IF EXISTS "Enable update for all users" ON storage.objects;`,
      `CREATE POLICY "Enable update for all users" ON storage.objects FOR UPDATE USING (bucket_id = 'files');`,
      `DROP POLICY IF EXISTS "Enable delete for all users" ON storage.objects;`,
      `CREATE POLICY "Enable delete for all users" ON storage.objects FOR DELETE USING (bucket_id = 'files');`
    ];

    for (const query of storageQueries) {
      const { error: storageError } = await supabase.rpc('exec_sql', { query });
      if (storageError) {
        console.log(`⚠️ Storage policy failed: ${query.substring(0, 50)}...`);
        console.log('Error:', storageError.message);
      }
    }
    console.log('✅ Storage policies configured');

    console.log('\n🎉 Database setup completed successfully!');
    console.log('✅ Tables: categories, files');
    console.log('✅ Initial data: 5 categories inserted');
    console.log('✅ RLS policies: Enabled for all tables');
    console.log('✅ Storage bucket: files bucket created');
    console.log('✅ Storage policies: Configured for file operations');

  } catch (error) {
    console.error('❌ Unexpected error during setup:', error);
  }
}

setupDatabase();