'use client'

import { useState } from 'react'
import { login } from '@/lib/auth'
import { User, LogIn } from 'lucide-react'

interface LoginFormProps {
  onLogin: (user: { id: string; type: 'admin' | 'user' }) => void
}

export default function LoginForm({ onLogin }: LoginFormProps) {
  const [formData, setFormData] = useState({
    id: '',
    password: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const user = await login(formData.id, formData.password)
      if (user) {
        onLogin(user)
      } else {
        setError('IDまたはパスワードが正しくありません')
      }
    } catch (error) {
      console.error('Login error:', error)
      setError('ログインに失敗しました')
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  return (
    <div className="card">
      <div className="flex items-center justify-center mb-6">
        <User size={48} className="text-primary-600" />
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="id" className="block text-sm font-medium text-gray-700 mb-1">
            ユーザーID
          </label>
          <input
            type="text"
            id="id"
            name="id"
            value={formData.id}
            onChange={handleInputChange}
            className="input-field"
            placeholder="IDを入力してください"
            required
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
            パスワード
          </label>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleInputChange}
            className="input-field"
            placeholder="パスワードを入力してください"
            required
          />
        </div>

        {error && (
          <div className="text-red-600 text-sm bg-red-50 p-3 rounded-md">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="btn-primary w-full flex items-center justify-center"
        >
          {loading ? (
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
          ) : (
            <>
              <LogIn size={20} className="mr-2" />
              ログイン
            </>
          )}
        </button>
      </form>

      <div className="mt-6 p-4 bg-gray-50 rounded-md text-sm text-gray-600">
        <p className="font-medium mb-2">テスト用アカウント:</p>
        <p>管理者: ID: admin, パスワード: password123</p>
        <p>ユーザー: ID: user, パスワード: password123</p>
      </div>
    </div>
  )
} 