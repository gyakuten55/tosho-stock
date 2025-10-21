'use client'

import { useState } from 'react'
import { useAuth } from '@/lib/auth-context'
import { Mail, LogIn } from 'lucide-react'

export default function LoginForm() {
  const { signIn, loading } = useAuth()
  
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [error, setError] = useState('')

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    try {
      const result = await signIn(formData.email, formData.password)
      if (result.error) {
        setError(result.error.message || 'メールアドレスまたはパスワードが正しくありません')
      }
    } catch (error) {
      console.error('Sign in error:', error)
      setError('ログインに失敗しました')
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
        <Mail size={48} className="text-primary-600" />
      </div>

      <form onSubmit={handleSignIn} className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
            ユーザーID
          </label>
          <input
            type="text"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            className="input-field"
            placeholder="ユーザーIDを入力してください"
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

      <div className="mt-6 p-4 bg-blue-50 rounded-md text-sm text-blue-700">
        <p className="font-medium mb-2">💼 アカウント情報:</p>
        <p className="mb-1"><strong>管理者:</strong> admin / admin123</p>
        <p><strong>一般ユーザー:</strong> user / user123</p>
      </div>
    </div>
  )
} 