import './globals.css'
import type { Metadata } from 'next'
import { AuthProvider } from '@/lib/auth-context'

export const metadata: Metadata = {
  title: '資料ストックシステム - Supabase統合版',
  description: '社内の教育資料や業務資料をストックし、従業員が必要に応じてダウンロードできるシステム（MCP対応）',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ja">
      <body className="bg-gray-50 min-h-screen">
        <AuthProvider>
          <div className="min-h-screen">
            {children}
          </div>
        </AuthProvider>
      </body>
    </html>
  )
} 