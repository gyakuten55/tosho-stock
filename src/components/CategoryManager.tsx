'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Category } from '@/types'
import { Plus, Trash2, Edit2, Folder, RefreshCw } from 'lucide-react'

interface CategoryManagerProps {
  categories: Category[]
  onCategoryChanged: () => void
}

export default function CategoryManager({ categories, onCategoryChanged }: CategoryManagerProps) {
  const [formData, setFormData] = useState({
    name: '',
    description: ''
  })
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [loading, setLoading] = useState(false)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [error, setError] = useState('')
  const [isRealtimeConnected, setIsRealtimeConnected] = useState(false)

  // Supabaseリアルタイムサブスクリプションの設定
  useEffect(() => {
    if (!supabase) return

    console.log('Setting up realtime subscription for categories...')
    
    const channel = supabase
      .channel('categories-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'categories'
        },
        (payload) => {
          console.log('Categories table change detected:', payload)
          onCategoryChanged()
        }
      )
      .subscribe((status) => {
        console.log('Categories subscription status:', status)
        setIsRealtimeConnected(status === 'SUBSCRIBED')
        if (status === 'CHANNEL_ERROR') {
          console.warn('カテゴリのリアルタイム機能でエラーが発生しました。手動で更新してください。')
        }
      })

    return () => {
      console.log('Cleaning up categories realtime subscription')
      supabase?.removeChannel(channel)
    }
  }, [onCategoryChanged])

  // Supabaseクライアントが設定されていない場合の表示
  if (!supabase) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
        <p className="text-gray-600 text-center">
          カテゴリ管理機能を使用するには、Supabase設定が必要です。
        </p>
      </div>
    )
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!supabase) {
      setError('システム設定が完了していません。しばらくお待ちください。')
      return
    }
    
    setLoading(true)
    setError('')

    try {
      if (editingCategory) {
        // カテゴリを更新
        const { error } = await supabase
          .from('categories')
          .update({
            name: formData.name,
            description: formData.description || null
          })
          .eq('id', editingCategory.id)

        if (error) throw error
      } else {
        // 新しいカテゴリを作成
        const { error } = await supabase
          .from('categories')
          .insert({
            name: formData.name,
            description: formData.description || null
          })

        if (error) throw error
      }

      // フォームをリセット
      setFormData({ name: '', description: '' })
      setEditingCategory(null)
      onCategoryChanged()
    } catch (error) {
      console.error('Category operation error:', error)
      setError('カテゴリの保存に失敗しました')
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (category: Category) => {
    setEditingCategory(category)
    setFormData({
      name: category.name,
      description: category.description || ''
    })
  }

  const handleCancelEdit = () => {
    setEditingCategory(null)
    setFormData({ name: '', description: '' })
    setError('')
  }

  const handleDelete = async (category: Category) => {
    if (!supabase) return
    
    if (!confirm(`カテゴリ「${category.name}」を削除してもよろしいですか？\n※このカテゴリに属するファイルがある場合、削除できません。`)) {
      return
    }

    setDeleting(category.id)
    try {
      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', category.id)

      if (error) {
        throw error
      }

      onCategoryChanged()
    } catch (error) {
      console.error('Delete error:', error)
      alert('カテゴリの削除に失敗しました。このカテゴリに属するファイルが存在する可能性があります。')
    } finally {
      setDeleting(null)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-gray-900">カテゴリ管理</h3>
        <div className="flex items-center text-sm text-gray-500">
          <RefreshCw size={16} className={`mr-2 ${isRealtimeConnected ? 'text-green-500' : 'text-gray-400'}`} />
          リアルタイム更新: {isRealtimeConnected ? '接続済み' : '未接続'}
        </div>
      </div>

      {/* カテゴリ追加・編集フォーム */}
      <div className="card bg-gray-50">
        <h4 className="text-md font-medium text-gray-900 mb-4">
          {editingCategory ? 'カテゴリを編集' : 'カテゴリを追加'}
        </h4>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              カテゴリ名
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              className="input-field"
              placeholder="カテゴリ名を入力"
              required
            />
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
              rows={2}
              className="input-field"
              placeholder="カテゴリの説明を入力"
            />
          </div>

          {error && (
            <div className="text-red-600 text-sm bg-red-50 p-3 rounded-md">
              {error}
            </div>
          )}

          <div className="flex space-x-3">
            <button
              type="submit"
              disabled={loading}
              className="btn-primary flex items-center"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              ) : (
                <Plus size={16} className="mr-2" />
              )}
              {editingCategory ? '更新' : '追加'}
            </button>
            
            {editingCategory && (
              <button
                type="button"
                onClick={handleCancelEdit}
                className="btn-secondary"
              >
                キャンセル
              </button>
            )}
          </div>
        </form>
      </div>

      {/* カテゴリ一覧 */}
      <div className="space-y-3">
        {categories.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Folder size={48} className="mx-auto mb-4 text-gray-300" />
            <p>カテゴリがありません</p>
          </div>
        ) : (
          categories.map((category) => (
            <div key={category.id} className="border border-gray-200 rounded-lg p-4 bg-white">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3">
                    <Folder size={20} className="text-primary-600" />
                    <div>
                      <h4 className="text-lg font-medium text-gray-900">
                        {category.name}
                      </h4>
                      {category.description && (
                        <p className="text-sm text-gray-600 mt-1">
                          {category.description}
                        </p>
                      )}
                      <p className="text-xs text-gray-500 mt-1">
                        作成日: {new Date(category.created_at).toLocaleDateString('ja-JP')}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleEdit(category)}
                    className="inline-flex items-center px-3 py-1 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                  >
                    <Edit2 size={14} className="mr-1" />
                    編集
                  </button>
                  
                  <button
                    onClick={() => handleDelete(category)}
                    disabled={deleting === category.id}
                    className="inline-flex items-center px-3 py-1 border border-red-300 shadow-sm text-sm font-medium rounded-md text-red-700 bg-white hover:bg-red-50 disabled:opacity-50"
                  >
                    {deleting === category.id ? (
                      <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-red-600"></div>
                    ) : (
                      <>
                        <Trash2 size={14} className="mr-1" />
                        削除
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
} 