const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Service role clientを作成（Admin権限でユーザー作成可能）
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function setupUsers() {
  console.log('ユーザーセットアップを開始...');

  try {
    // 管理者ユーザーを作成
    console.log('管理者ユーザーを作成中...');
    const { data: adminUser, error: adminError } = await supabaseAdmin.auth.admin.createUser({
      email: 'admin@example.com',
      password: 'admin123',
      email_confirm: true,
      user_metadata: {
        username: 'admin',
        user_type: 'admin',
        full_name: '管理者'
      }
    });

    if (adminError) {
      console.error('管理者ユーザー作成エラー:', adminError);
    } else {
      console.log('管理者ユーザー作成成功:', adminUser.user.email);
    }

    // テストユーザーを作成
    console.log('テストユーザーを作成中...');
    const { data: testUser, error: testError } = await supabaseAdmin.auth.admin.createUser({
      email: 'test@example.com',
      password: 'test123',
      email_confirm: true,
      user_metadata: {
        username: 'test',
        user_type: 'user',
        full_name: 'テストユーザー'
      }
    });

    if (testError) {
      console.error('テストユーザー作成エラー:', testError);
    } else {
      console.log('テストユーザー作成成功:', testUser.user.email);
    }

    console.log('ユーザーセットアップ完了！');

  } catch (error) {
    console.error('セットアップエラー:', error);
  }
}

setupUsers();