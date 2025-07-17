'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { FileItem, Category } from '@/types'
import { Download, Trash2, FileText, Calendar, User, Folder } from 'lucide-react'

interface FileListProps {
  files: FileItem[]
  categories: Category[]
  isAdmin: boolean
  onFileDeleted?: () => void
}

export default function FileList({ files, categories, isAdmin, onFileDeleted }: FileListProps) {
  const [deleting, setDeleting] = useState<string | null>(null)

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getCategoryName = (categoryId: string): string => {
    const category = categories.find(cat => cat.name === categoryId)
    return category ? category.name : categoryId
  }

  const handleDownload = async (file: FileItem) => {
    try {
      const { data, error } = await supabase.storage
        .from('files')
        .download(file.file_path)

      if (error) {
        throw error
      }

      // ファイルをダウンロード
      const url = window.URL.createObjectURL(data)
      const a = document.createElement('a')
      a.href = url
      a.download = file.original_name
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      console.error('Download error:', error)
      alert('ファイルのダウンロードに失敗しました')
    }
  }

  const handleDelete = async (file: FileItem) => {
    if (!confirm(`「${file.name}」を削除してもよろしいですか？`)) {
      return
    }

    setDeleting(file.id)
    try {
      // Storageからファイルを削除
      await supabase.storage
        .from('files')
        .remove([file.file_path])

      // データベースからレコードを削除
      const { error } = await supabase
        .from('files')
        .delete()
        .eq('id', file.id)

      if (error) {
        throw error
      }

      onFileDeleted?.()
    } catch (error) {
      console.error('Delete error:', error)
      alert('ファイルの削除に失敗しました')
    } finally {
      setDeleting(null)
    }
  }

  if (files.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <FileText size={48} className="mx-auto mb-4 text-gray-300" />
        <p>ファイルがありません</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {files.map((file) => (
        <div key={file.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-3">
                <FileText size={24} className="text-primary-600 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-medium text-gray-900 truncate">
                    {file.name}
                  </h3>
                  <p className="text-sm text-gray-500 truncate">
                    {file.original_name}
                  </p>
                </div>
              </div>
              
              <div className="mt-2 flex items-center space-x-4 text-sm text-gray-500">
                <div className="flex items-center">
                  <Folder size={16} className="mr-1" />
                  {getCategoryName(file.category)}
                </div>
                <div className="flex items-center">
                  <Calendar size={16} className="mr-1" />
                  {formatDate(file.uploaded_at)}
                </div>
                <div className="flex items-center">
                  <User size={16} className="mr-1" />
                  {file.uploaded_by}
                </div>
                <span>
                  {formatFileSize(file.size)}
                </span>
              </div>
              
              {file.description && (
                <p className="mt-2 text-sm text-gray-600">
                  {file.description}
                </p>
              )}
            </div>

            <div className="flex items-center space-x-2 ml-4">
              <button
                onClick={() => handleDownload(file)}
                className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                <Download size={16} className="mr-2" />
                ダウンロード
              </button>
              
              {isAdmin && (
                <button
                  onClick={() => handleDelete(file)}
                  disabled={deleting === file.id}
                  className="inline-flex items-center px-3 py-2 border border-red-300 shadow-sm text-sm font-medium rounded-md text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
                >
                  {deleting === file.id ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600"></div>
                  ) : (
                    <>
                      <Trash2 size={16} className="mr-2" />
                      削除
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
} 