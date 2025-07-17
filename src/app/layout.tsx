import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '東翔運輸株式会社 - 社内資料管理システム',
  description: '社内の教育資料や業務資料をストックし、従業員が必要に応じてダウンロードできるシステム',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ja">
      <body className="bg-gray-50 min-h-screen">
        <div className="min-h-screen">
          {children}
        </div>
      </body>
    </html>
  )
} 