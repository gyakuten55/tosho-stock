import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'your_supabase_url'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'your_supabase_anon_key'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

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