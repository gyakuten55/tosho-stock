export interface FileItem {
  id: string
  name: string
  original_name: string
  size: number
  category: string
  description?: string
  file_path: string
  uploaded_at: string
  uploaded_by?: string // UUID型（新しいカラム）
  uploaded_by_old?: string // 古いstring型カラム（移行時用）
  mime_type?: string
  is_deleted: boolean
  deleted_at?: string
}

export interface Category {
  id: string
  name: string
  description?: string
  created_at: string
  created_by?: string // UUID型
}

export interface User {
  id: string
  type: 'admin' | 'user'
}

export interface UserProfile {
  id: string
  username: string
  user_type: 'admin' | 'user'
  full_name?: string
  avatar_url?: string
  created_at: string
  updated_at: string
}

export interface UploadFileData {
  name: string
  category: string
  description?: string
  file: File
} 