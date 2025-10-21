import Cookies from 'js-cookie'

interface User {
  id: string
  type: 'admin' | 'user'
}

// 環境変数から認証情報を取得（実際の本番環境では環境変数を使用）
const AUTH_CONFIG = {
  admin: {
    id: process.env.ADMIN_ID || 'admin',
    password: process.env.ADMIN_PASSWORD || 'admin123'
  },
  user: {
    id: process.env.USER_ID || 'user',
    password: process.env.USER_PASSWORD || 'user123'
  }
}

export async function login(id: string, password: string): Promise<User | null> {
  // 管理者認証チェック
  if (id === AUTH_CONFIG.admin.id && password === AUTH_CONFIG.admin.password) {
    const user: User = { id, type: 'admin' }
    // セッション情報をクッキーに保存
    Cookies.set('auth-user', JSON.stringify(user), { expires: 7 })
    return user
  }
  
  // ユーザー認証チェック
  if (id === AUTH_CONFIG.user.id && password === AUTH_CONFIG.user.password) {
    const user: User = { id, type: 'user' }
    // セッション情報をクッキーに保存
    Cookies.set('auth-user', JSON.stringify(user), { expires: 7 })
    return user
  }
  
  return null
}

export async function logout(): Promise<void> {
  Cookies.remove('auth-user')
}

export async function getCurrentUser(): Promise<User | null> {
  const userCookie = Cookies.get('auth-user')
  if (userCookie) {
    try {
      return JSON.parse(userCookie)
    } catch (error) {
      console.error('Failed to parse user cookie:', error)
      Cookies.remove('auth-user')
    }
  }
  return null
} 