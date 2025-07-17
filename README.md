# 東翔運輸株式会社 - 社内資料管理システム

社内の教育資料や業務資料をストックし、従業員が必要に応じてダウンロードできるWebアプリケーションです。

## 機能

### 管理者機能
- ファイルのアップロード
- ファイルの管理・削除
- カテゴリの作成・編集・削除
- アップロードされたファイルの一覧表示

### 一般ユーザー機能
- ファイルの閲覧・ダウンロード
- カテゴリ別でのファイル検索
- ファイル名・説明での検索

## 技術スタック

- **フロントエンド**: Next.js 14 (App Router)
- **データベース**: Supabase (PostgreSQL)
- **ストレージ**: Supabase Storage
- **スタイリング**: TailwindCSS
- **アイコン**: Lucide React
- **認証**: カスタム実装（ID/パスワード）

## セットアップ

### 1. 依存関係のインストール

```bash
npm install
```

### 2. 環境変数の設定

`.env.local`ファイルを作成し、以下の環境変数を設定してください：

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# 認証設定
ADMIN_ID=admin
ADMIN_PASSWORD=password123
USER_ID=user  
USER_PASSWORD=password123
```

### 3. Supabaseの設定

1. [Supabase](https://supabase.com)でプロジェクトを作成
2. データベースURL、匿名キーを取得
3. `supabase_setup.sql`のSQLを実行してテーブルを作成
4. Storageで`files`バケットを作成

### 4. 開発サーバーの起動

```bash
npm run dev
```

ブラウザで [http://localhost:3000](http://localhost:3000) を開いてアプリケーションにアクセスできます。

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