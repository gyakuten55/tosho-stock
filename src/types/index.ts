export interface FileItem {
  id: string
  name: string
  original_name: string
  size: number
  category: string
  description?: string
  file_path: string
  uploaded_at: string
  uploaded_by: string
}

export interface Category {
  id: string
  name: string
  description?: string
  created_at: string
}

export interface User {
  id: string
  type: 'admin' | 'user'
}

export interface UploadFileData {
  name: string
  category: string
  description?: string
  file: File
} 