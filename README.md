# 資料ストックシステム - Supabase統合版（MCP対応）

社内の教育資料や業務資料をストックし、従業員が必要に応じてダウンロードできるWebアプリケーションです。
Model Context Protocol (MCP)サーバーを統合し、Claude Desktopから直接操作可能です。

## 🆕 新機能・改良点

### Supabase完全統合
- 本格的なSupabase認証システム（レガシーログインとの併用対応）
- Row Level Security (RLS)によるセキュリティ強化
- リアルタイム更新機能

### MCP統合
- Claude Desktop用MCPサーバー
- ファイル・カテゴリ・ユーザー管理のAPI
- リアルタイム分析機能

### リアルタイム機能
- ファイルリストの自動更新
- カテゴリ変更の即時反映
- 複数ユーザーでの同期

## 機能

### 管理者機能
- ファイルのアップロード（ドラッグ＆ドロップ対応）
- ファイルの管理・削除（ソフト削除）
- カテゴリの作成・編集・削除
- アップロードされたファイルの一覧表示
- リアルタイム統計とファイル分析

### 一般ユーザー機能
- ファイルの閲覧・ダウンロード
- カテゴリ別でのファイル検索
- ファイル名・説明での検索
- リアルタイム更新通知

### MCP機能（Claude Desktop連携）
- ファイルシステムの完全制御
- 統計データの取得と分析
- 自動レポート生成
- バックアップとメンテナンス

## 技術スタック

- **フロントエンド**: Next.js 14 (App Router)
- **データベース**: Supabase (PostgreSQL)
- **ストレージ**: Supabase Storage
- **認証**: Supabase Auth + レガシー認証システム併用
- **リアルタイム**: Supabase Realtime
- **MCP**: Model Context Protocol Server
- **スタイリング**: TailwindCSS
- **アイコン**: Lucide React

## セットアップ

### 1. 依存関係のインストール

```bash
npm install
```

### 2. MCPサーバー用依存関係の追加インストール

```bash
npm install @modelcontextprotocol/sdk@latest @supabase/supabase-js zod dotenv
```

### 3. 環境変数の設定

`.env.local`ファイルを作成し、以下の環境変数を設定してください：

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://vqknmngemupivytxznzd.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZxa21ubmdlbXVwaXZ5dHh6bnpkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI3NTIwMTksImV4cCI6MjA2ODMyODAxOX0.J-33xhk-dGsQBt9WgYcxVcC_guLemUknfW1USESUoRE
SUPABASE_SERVICE_ROLE_KEY=YOUR_SERVICE_ROLE_KEY_HERE

# Legacy Authentication (backward compatibility)
ADMIN_ID=admin
ADMIN_PASSWORD=password123
USER_ID=user
USER_PASSWORD=password123
```

**重要**: `YOUR_SERVICE_ROLE_KEY_HERE` をSupabaseダッシュボード → Settings → API → service_role キーで取得した実際の値に置換してください。

### 4. Supabaseの設定

✅ **完了済み**: 以下の設定は自動実行されました
1. Supabaseプロジェクト: `tosho-siryo-stock` (vqknmngemupivytxznzd)
2. データベーステーブル作成:
   - `profiles` テーブル（Supabase Auth統合）
   - `files` テーブル（UUID型、削除フラグ対応）
   - `categories` テーブル
3. Row Level Security (RLS)ポリシー設定
4. ストレージバケット `files` 作成
5. 認証システム（レガシーとSupabase Auth併用）

### 5. MCPサーバーの設定

詳細な手順は `MCP_SETUP.md` を参照してください。

### 6. 開発サーバーの起動

```bash
npm run dev
```

ブラウザで [http://localhost:3000](http://localhost:3000) を開いてアプリケーションにアクセスできます。

### 7. MCPサーバーの起動（別ターミナル）

```bash
node mcp-server.mjs
```

## デフォルトアカウント

### 管理者アカウント
- **ID**: admin
- **パスワード**: password123

### 一般ユーザーアカウント  
- **ID**: user
- **パスワード**: password123

## ディレクトリ構造

```
src/
├── app/                    # Next.js 13+ App Router
│   ├── globals.css        # グローバルスタイル
│   ├── layout.tsx         # ルートレイアウト
│   └── page.tsx           # メインページ
├── components/            # Reactコンポーネント
│   ├── AdminDashboard.tsx # 管理者ダッシュボード
│   ├── CategoryManager.tsx# カテゴリ管理
│   ├── FileList.tsx       # ファイル一覧
│   ├── FileUploadForm.tsx # ファイルアップロード
│   ├── LoginForm.tsx      # ログインフォーム
│   └── UserDashboard.tsx  # ユーザーダッシュボード
├── lib/                   # ユーティリティ
│   ├── auth.ts           # 認証ロジック
│   └── supabase.ts       # Supabaseクライアント
└── types/                 # TypeScript型定義
    └── index.ts
```

## カテゴリ

デフォルトで以下のカテゴリが作成されます：

- 教育資料
- 業務資料  
- 安全管理
- 法令・規則
- その他

## サポートファイル形式

- PDF (.pdf)
- Microsoft Word (.doc, .docx)
- Microsoft Excel (.xls, .xlsx)
- Microsoft PowerPoint (.ppt, .pptx)
- テキストファイル (.txt)
- 画像ファイル (.jpg, .jpeg, .png, .gif)

## ライセンス

このプロジェクトは東翔運輸株式会社の内部使用のために開発されました。

## サポート

技術的な問題や質問については、開発チームまでお問い合わせください。 