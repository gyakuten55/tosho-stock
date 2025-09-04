const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'https://xaxhzcxcgqxuyeawkclj.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhheGh6Y3hjZ3F4dXllYXdrY2xqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY2NjMwMjYsImV4cCI6MjA3MjIzOTAyNn0.AthQcUXmmfXpjVdAyQzaiOv1NXLuk5g_EVBxqHRhPTA'

const supabase = createClient(supabaseUrl, supabaseKey)

async function setupDatabase() {
  console.log('Setting up Supabase database...')
  
  try {
    // Check if categories table exists by trying to read from it
    console.log('Checking existing categories...')
    const { data: existingCategories, error: readError } = await supabase
      .from('categories')
      .select('*')
    
    if (readError && readError.code !== 'PGRST116') {
      console.error('Error reading categories table:', readError)
      console.log('Please run the SQL script manually in Supabase Dashboard:')
      console.log('1. Go to https://supabase.com/dashboard')
      console.log('2. Select your project')
      console.log('3. Go to SQL Editor')
      console.log('4. Run the contents of supabase_setup.sql')
      return
    }

    if (!existingCategories || existingCategories.length === 0) {
      // Insert initial categories if table is empty
      console.log('Inserting initial categories...')
      const { error: insertError } = await supabase
        .from('categories')
        .insert([
          { name: '教育資料', description: '新人研修や安全講習などの教育関連資料' },
          { name: '業務資料', description: '日常業務で使用する手順書やマニュアル' },
          { name: '安全管理', description: '安全運転や事故防止に関する資料' },
          { name: '法令・規則', description: '運送業に関する法令や社内規則' },
          { name: 'その他', description: 'その他の資料' }
        ])

      if (insertError) {
        console.error('Error inserting categories:', insertError)
      } else {
        console.log('Initial categories inserted successfully!')
      }
    } else {
      console.log(`Found ${existingCategories.length} existing categories`)
    }

    // Test files table
    console.log('Testing files table...')
    const { data: files, error: filesError } = await supabase
      .from('files')
      .select('*')
      .limit(1)

    if (filesError && filesError.code !== 'PGRST116') {
      console.error('Error reading files table:', filesError)
    } else {
      console.log('Files table is accessible')
    }

    // Test storage bucket
    console.log('Testing storage bucket...')
    const { data: buckets, error: bucketsError } = await supabase.storage
      .listBuckets()

    if (bucketsError) {
      console.error('Error accessing storage:', bucketsError)
    } else {
      const filesBucket = buckets.find(b => b.name === 'files')
      if (filesBucket) {
        console.log('Files bucket exists')
      } else {
        console.log('Files bucket not found - please create it manually')
      }
    }

    console.log('Database setup check completed!')

  } catch (error) {
    console.error('Setup error:', error)
  }
}

setupDatabase()