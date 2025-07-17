'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { FileItem, Category } from '@/types'
import FileUploadForm from './FileUploadForm'
import FileList from './FileList'
import CategoryManager from './CategoryManager'
import { Upload, Files, Folder, Plus } from 'lucide-react'

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<'upload' | 'files' | 'categories'>('upload')
  const [files, setFiles] = useState<FileItem[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    try {
      await Promise.all([loadFiles(), loadCategories()])
    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadFiles = async () => {
    const { data, error } = await supabase
      .from('files')
      .select('*')
      .order('uploaded_at', { ascending: false })
    
    if (error) {
      console.error('Error loading files:', error)
    } else {
      setFiles(data || [])
    }
  }

  const loadCategories = async () => {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('name', { ascending: true })
    
    if (error) {
      console.error('Error loading categories:', error)
    } else {
      setCategories(data || [])
    }
  }

  const handleFileUploaded = () => {
    loadFiles()
  }

  const handleFileDeleted = () => {
    loadFiles()
  }

  const handleCategoryChanged = () => {
    loadCategories()
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="card">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">管理者ダッシュボード</h2>
        
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('upload')}
              className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'upload'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Upload size={20} className="inline mr-2" />
              ファイルアップロード
            </button>
            <button
              onClick={() => setActiveTab('files')}
              className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'files'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Files size={20} className="inline mr-2" />
              ファイル管理
            </button>
            <button
              onClick={() => setActiveTab('categories')}
              className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'categories'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Folder size={20} className="inline mr-2" />
              カテゴリ管理
            </button>
          </nav>
        </div>

        <div className="mt-6">
          {activeTab === 'upload' && (
            <FileUploadForm 
              categories={categories} 
              onFileUploaded={handleFileUploaded}
            />
          )}
          {activeTab === 'files' && (
            <FileList 
              files={files} 
              categories={categories}
              isAdmin={true}
              onFileDeleted={handleFileDeleted}
            />
          )}
          {activeTab === 'categories' && (
            <CategoryManager 
              categories={categories}
              onCategoryChanged={handleCategoryChanged}
            />
          )}
        </div>
      </div>
    </div>
  )
} 