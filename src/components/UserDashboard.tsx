'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { FileItem, Category } from '@/types'
import FileList from './FileList'
import { Files, Search, Filter } from 'lucide-react'

export default function UserDashboard() {
  const [files, setFiles] = useState<FileItem[]>([])
  const [filteredFiles, setFilteredFiles] = useState<FileItem[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')

  useEffect(() => {
    loadData()
  }, [])

  useEffect(() => {
    filterFiles()
  }, [files, searchTerm, selectedCategory])

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

  const filterFiles = () => {
    let filtered = files

    // 検索フィルター
    if (searchTerm) {
      filtered = filtered.filter(file =>
        file.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        file.original_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (file.description && file.description.toLowerCase().includes(searchTerm.toLowerCase()))
      )
    }

    // カテゴリフィルター
    if (selectedCategory) {
      filtered = filtered.filter(file => file.category === selectedCategory)
    }

    setFilteredFiles(filtered)
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
        <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
          <Files size={28} className="mr-3" />
          社内資料一覧
        </h2>

        {/* 検索・フィルター */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="relative">
            <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="ファイル名や説明で検索..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 input-field"
            />
          </div>
          
          <div className="relative">
            <Filter size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="pl-10 input-field"
            >
              <option value="">すべてのカテゴリ</option>
              {categories.map((category) => (
                <option key={category.id} value={category.name}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* 検索結果の表示 */}
        <div className="mb-4 text-sm text-gray-600">
          {filteredFiles.length}件のファイルが見つかりました
          {searchTerm && ` (検索: "${searchTerm}")`}
          {selectedCategory && ` (カテゴリ: "${selectedCategory}")`}
        </div>

        {/* ファイル一覧 */}
        <FileList 
          files={filteredFiles} 
          categories={categories}
          isAdmin={false}
        />
      </div>
    </div>
  )
} 