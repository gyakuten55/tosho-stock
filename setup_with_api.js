const fetch = require('node-fetch');

const supabaseUrl = 'https://xaxhzcxcgqxuyeawkclj.supabase.co';
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhheGh6Y3hjZ3F4dXllYXdrY2xqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NjY2MzAyNiwiZXhwIjoyMDcyMjM5MDI2fQ.FyNiG7q0vUe-LZf8xUS9IKg4HYbNyjWEmSUKLfrY6Oc';

async function executeSQL(query) {
  const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${serviceRoleKey}`,
      'apikey': serviceRoleKey
    },
    body: JSON.stringify({ query })
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`SQL execution failed: ${error}`);
  }

  return response.json();
}

async function setupDatabaseWithAPI() {
  console.log('🚀 Setting up database with REST API...\n');

  try {
    // Step 1: Create categories table
    console.log('1. Creating categories table...');
    await executeSQL(`
      CREATE TABLE IF NOT EXISTS categories (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        name VARCHAR(100) UNIQUE NOT NULL,
        description TEXT,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);
    console.log('✅ Categories table created');

    // Step 2: Create files table
    console.log('2. Creating files table...');
    await executeSQL(`
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
    `);
    console.log('✅ Files table created');

    // Step 3: Insert initial data
    console.log('3. Inserting initial categories...');
    await executeSQL(`
      INSERT INTO categories (name, description) VALUES
      ('教育資料', '新人研修や安全講習などの教育関連資料'),
      ('業務資料', '日常業務で使用する手順書やマニュアル'),
      ('安全管理', '安全運転や事故防止に関する資料'),
      ('法令・規則', '運送業に関する法令や社内規則'),
      ('その他', 'その他の資料')
      ON CONFLICT (name) DO NOTHING;
    `);
    console.log('✅ Initial categories inserted');

    console.log('\n🎉 Database setup completed successfully!');

  } catch (error) {
    console.error('❌ Setup failed:', error.message);
  }
}

setupDatabaseWithAPI();