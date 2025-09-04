const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://xaxhzcxcgqxuyeawkclj.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhheGh6Y3hjZ3F4dXllYXdrY2xqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY2NjMwMjYsImV4cCI6MjA3MjIzOTAyNn0.AthQcUXmmfXpjVdAyQzaiOv1NXLuk5g_EVBxqHRhPTA';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testConnection() {
  console.log('🔍 Testing Supabase connection...\n');
  
  try {
    // Test 1: Categories table
    console.log('1. Testing categories table...');
    const { data: categories, error: catError } = await supabase
      .from('categories')
      .select('*');
    
    if (catError) {
      console.log('❌ Categories error:', catError.message);
    } else {
      console.log('✅ Categories found:', categories.length);
      categories.forEach(cat => console.log(`   - ${cat.name}: ${cat.description}`));
    }

    // Test 2: Files table
    console.log('\n2. Testing files table...');
    const { data: files, error: filesError } = await supabase
      .from('files')
      .select('*')
      .limit(5);
    
    if (filesError) {
      console.log('❌ Files error:', filesError.message);
    } else {
      console.log('✅ Files table accessible, found:', files.length, 'files');
    }

    // Test 3: Storage buckets
    console.log('\n3. Testing storage buckets...');
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
    
    if (bucketsError) {
      console.log('❌ Storage error:', bucketsError.message);
    } else {
      console.log('✅ Storage accessible, found:', buckets.length, 'buckets');
      buckets.forEach(bucket => console.log(`   - ${bucket.name} (${bucket.public ? 'public' : 'private'})`));
    }

    // Test 4: Insert test (optional)
    if (categories && categories.length > 0) {
      console.log('\n4. Testing data insertion...');
      const testCategory = categories[0].name;
      
      const { error: insertError } = await supabase
        .from('files')
        .insert({
          name: 'Test File',
          original_name: 'test.txt',
          size: 1024,
          category: testCategory,
          description: 'Connection test file',
          file_path: 'test/test.txt',
          uploaded_by: 'system_test'
        });

      if (insertError) {
        console.log('❌ Insert test failed:', insertError.message);
      } else {
        console.log('✅ Insert test successful');
        
        // Clean up test data
        await supabase
          .from('files')
          .delete()
          .eq('name', 'Test File')
          .eq('uploaded_by', 'system_test');
        console.log('✅ Test data cleaned up');
      }
    }

    console.log('\n🎉 Connection test completed!');
    
  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

testConnection();