import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// 環境変数が設定されているかチェック
if (!supabaseUrl || !supabaseAnonKey || supabaseUrl.includes('your_supabase') || supabaseAnonKey.includes('your_supabase')) {
  console.warn('Supabase環境変数が正しく設定されていません。Vercelで環境変数を設定してください。')
}

// 安全なSupabaseクライアントの作成
export const supabase = supabaseUrl && supabaseAnonKey && 
  !supabaseUrl.includes('your_supabase') && 
  !supabaseAnonKey.includes('your_supabase')
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null

export type Database = {
  public: {
    Tables: {
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
          uploaded_by: string
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
          uploaded_by: string
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
          uploaded_by?: string
        }
      }
      categories: {
        Row: {
          id: string
          name: string
          description: string | null
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          created_at?: string
        }
      }
    }
  }
} 