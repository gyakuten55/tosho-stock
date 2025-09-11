import { createClient } from '@supabase/supabase-js'

// Next.jsクライアントサイドでは直接環境変数を参照
const supabaseUrl = 'https://vqknmngemupivytxznzd.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZxa25tbmdlbXVwaXZ5dHh6bnpkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI3NTIwMTksImV4cCI6MjA2ODMyODAxOX0.J-33xhk-dGsQBt9WgYcxVcC_guLemUknfW1USESUoRE'

// デバッグ情報（本番環境では削除）
console.log('Supabase URL:', supabaseUrl)
console.log('Supabase Anon Key length:', supabaseAnonKey?.length)
console.log('Supabase Anon Key preview:', supabaseAnonKey?.substring(0, 50) + '...')

// Supabaseクライアントの作成
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Supabaseクライアントの初期化状態をログ出力
console.log('Supabase client initialized successfully')

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