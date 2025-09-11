import { createClient } from '@supabase/supabase-js'

// 環境変数を取得してトリム
const rawSupabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const rawSupabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// 環境変数のクリーニング（余分な引用符や空白を削除）
const supabaseUrl = rawSupabaseUrl?.trim().replace(/^["']|["']$/g, '')
const supabaseAnonKey = rawSupabaseAnonKey?.trim().replace(/^["']|["']$/g, '')

// デバッグ情報（本番環境では削除）
console.log('Supabase URL:', supabaseUrl)
console.log('Supabase Anon Key length:', supabaseAnonKey?.length)
console.log('Supabase Anon Key preview:', supabaseAnonKey?.substring(0, 50) + '...')

// 環境変数が設定されているかチェック
if (!supabaseUrl || !supabaseAnonKey || supabaseUrl.includes('your_supabase') || supabaseAnonKey.includes('your_supabase')) {
  console.error('Supabase環境変数が正しく設定されていません。')
  console.error('URL:', supabaseUrl)
  console.error('Key length:', supabaseAnonKey?.length)
}

// 安全なSupabaseクライアントの作成
export const supabase = supabaseUrl && supabaseAnonKey && 
  !supabaseUrl.includes('your_supabase') && 
  !supabaseAnonKey.includes('your_supabase')
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null

// Supabaseクライアントの初期化状態をログ出力
if (supabase) {
  console.log('Supabase client initialized successfully')
} else {
  console.error('Supabase client initialization failed')
}

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          username: string
          user_type: 'admin' | 'user'
          full_name: string | null
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          username: string
          user_type?: 'admin' | 'user'
          full_name?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          username?: string
          user_type?: 'admin' | 'user'
          full_name?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      files: {
        Row: {
          id: string
          name: string
          original_name: string
          size: number
          category: string
          description: string | null
          file_path: string
          uploaded_at: string
          uploaded_by: string | null // UUID型
          uploaded_by_old: string | null // 古いstring型
          mime_type: string | null
          is_deleted: boolean
          deleted_at: string | null
        }
        Insert: {
          id?: string
          name: string
          original_name: string
          size: number
          category: string
          description?: string | null
          file_path: string
          uploaded_at?: string
          uploaded_by?: string | null
          uploaded_by_old?: string | null
          mime_type?: string | null
          is_deleted?: boolean
          deleted_at?: string | null
        }
        Update: {
          id?: string
          name?: string
          original_name?: string
          size?: number
          category?: string
          description?: string | null
          file_path?: string
          uploaded_at?: string
          uploaded_by?: string | null
          uploaded_by_old?: string | null
          mime_type?: string | null
          is_deleted?: boolean
          deleted_at?: string | null
        }
      }
      categories: {
        Row: {
          id: string
          name: string
          description: string | null
          created_at: string
          created_by: string | null
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          created_at?: string
          created_by?: string | null
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          created_at?: string
          created_by?: string | null
        }
      }
    }
  }
} 