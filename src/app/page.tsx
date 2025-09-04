'use client'

import LoginForm from '@/components/LoginForm'
import AdminDashboard from '@/components/AdminDashboard'
import UserDashboard from '@/components/UserDashboard'
import { useAuth } from '@/lib/auth-context'
import { LogOut } from 'lucide-react'

export default function Home() {
  const { user, loading, signOut, isAdmin } = useAuth()

  const handleLogout = async () => {
    await signOut()
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg text-gray-600">読み込み中...</div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              東翔運輸株式会社
            </h1>
            <p className="text-gray-600">社内資料管理システム</p>
          </div>
          <LoginForm />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div>
              <h1 className="text-xl font-semibold text-gray-900">
                東翔運輸株式会社 - 社内資料管理システム
              </h1>
              <p className="text-sm text-gray-600">
                {isAdmin ? '管理者' : 'ユーザー'}としてログイン中 ({user?.profile?.username || user?.email})
              </p>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
            >
              <LogOut size={20} className="mr-2" />
              ログアウト
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {isAdmin ? (
          <AdminDashboard />
        ) : (
          <UserDashboard />
        )}
      </main>
    </div>
  )
} 