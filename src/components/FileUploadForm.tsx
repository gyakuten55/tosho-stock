'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Category } from '@/types'
import { Upload, X, Plus } from 'lucide-react'

interface FileUploadFormProps {
  categories: Category[]
  onFileUploaded: () => void
}

export default function FileUploadForm({ categories, onFileUploaded }: FileUploadFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    description: ''
  })
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Supabaseクライアントが設定されていない場合の表示
  if (!supabase) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
        <p className="text-gray-600 text-center">
          ファイルアップロード機能を使用するには、Supabase設定が必要です。
        </p>
      </div>
    )
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setSelectedFile(file)
      // ファイル名が空の場合、選択したファイル名を設定
      if (!formData.name) {
        setFormData({
          ...formData,
          name: file.name
        })
      }
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!selectedFile) {
      setError('ファイルを選択してください')
      return
    }

    if (!formData.category) {
      setError('カテゴリを選択してください')
      return
    }

    if (!supabase) {
      setError('システム設定が完了していません。しばらくお待ちください。')
      return
    }

    setLoading(true)
    setError('')

    try {
      // ファイルをSupabase Storageにアップロード
      const fileExt = selectedFile.name.split('.').pop()
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('files')
        .upload(fileName, selectedFile)

      if (uploadError) {
        throw uploadError
      }

      // ファイル情報をデータベースに保存
      const { error: dbError } = await supabase
        .from('files')
        .insert({
          name: formData.name,
          original_name: selectedFile.name,
          size: selectedFile.size,
          category: formData.category,
          description: formData.description || null,
          file_path: uploadData.path,
          uploaded_by: 'admin' // 実際のユーザーIDを使用
        })

      if (dbError) {
        throw dbError
      }

      // フォームをリセット
      setFormData({
        name: '',
        category: '',
        description: ''
      })
      setSelectedFile(null)
      
      // 親コンポーネントに通知
      onFileUploaded()

    } catch (error) {
      console.error('Upload error:', error)
      setError('ファイルのアップロードに失敗しました')
    } finally {
      setLoading(false)
    }
  }

  const removeFile = () => {
    setSelectedFile(null)
    setFormData({
      ...formData,
      name: ''
    })
  }

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-medium text-gray-900">ファイルアップロード</h3>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="file" className="block text-sm font-medium text-gray-700 mb-2">
            ファイル選択
          </label>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
            {selectedFile ? (
              <div className="flex items-center justify-between bg-gray-50 rounded-md p-3">
                <div className="flex items-center">
                  <Upload size={20} className="text-primary-600 mr-2" />
                  <span className="text-sm text-gray-900">{selectedFile.name}</span>
                  <span className="text-xs text-gray-500 ml-2">
                    ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
                  </span>
                </div>
                <button
                  type="button"
                  onClick={removeFile}
                  className="text-red-500 hover:text-red-700"
                >
                  <X size={16} />
                </button>
              </div>
            ) : (
              <div>
                <Upload size={48} className="mx-auto text-gray-400 mb-2" />
                <label htmlFor="file" className="cursor-pointer">
                  <span className="text-primary-600 hover:text-primary-700 font-medium">
                    ファイルを選択
                  </span>
                  <span className="text-gray-500"> またはドラッグ&ドロップ</span>
                </label>
                <input
                  type="file"
                  id="file"
                  onChange={handleFileSelect}
                  className="hidden"
                  accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.jpg,.jpeg,.png,.gif"
                />
              </div>
            )}
          </div>
        </div>

        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
            表示名
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            className="input-field"
            placeholder="ファイルの表示名を入力"
            required
          />
        </div>

        <div>
          <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
            カテゴリ
          </label>
          <select
            id="category"
            name="category"
            value={formData.category}
            onChange={handleInputChange}
            className="input-field"
            required
          >
            <option value="">カテゴリを選択してください</option>
            {categories.map((category) => (
              <option key={category.id} value={category.name}>
                {category.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
            説明（任意）
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            rows={3}
            className="input-field"
            placeholder="ファイルの説明を入力"
          />
        </div>

        {error && (
          <div className="text-red-600 text-sm bg-red-50 p-3 rounded-md">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading || !selectedFile}
          className="btn-primary w-full flex items-center justify-center"
        >
          {loading ? (
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
          ) : (
            <>
              <Upload size={20} className="mr-2" />
              アップロード
            </>
          )}
        </button>
      </form>
    </div>
  )
} 