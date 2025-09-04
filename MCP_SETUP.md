# 資料ストックシステム - MCP セットアップガイド

このドキュメントでは、資料ストックシステムのMCP（Model Context Protocol）サーバーのセットアップ方法を説明します。

## 前提条件

- Node.js 18以上
- npm または yarn
- Supabaseプロジェクトが設定済み
- Claude Desktop がインストール済み

## セットアップ手順

### 1. MCPサーバーの依存関係をインストール

```bash
# プロジェクトルートで実行
npm install @modelcontextprotocol/sdk@latest @supabase/supabase-js zod dotenv
```

### 2. 環境変数の設定

`.env.local` ファイルに以下の環境変数が設定されていることを確認：

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://xaxhzcxcgqxuyeawkclj.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhheGh6Y3hjZ3F4dXllYXdrY2xqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY2NjMwMjYsImV4cCI6MjA3MjIzOTAyNn0.AthQcUXmmfXpjVdAyQzaiOv1NXLuk5g_EVBxqHRhPTA
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhheGh6Y3hjZ3F4dXllYXdrY2xqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NjY2MzAyNiwiZXhwIjoyMDcyMjM5MDI2fQ.FyNiG7q0vUe-LZf8xUS9IKg4HYbNyjWEmSUKLfrY6Oc
```

### 3. Supabaseデータベースのセットアップ

Supabaseダッシュボードで以下のSQLスクリプトを実行：

```bash
# データベーステーブルの作成
# supabase_setup.sql の内容をSupabase SQL Editorで実行

# ストレージバケットの作成
# storage_setup.sql の内容をSupabase SQL Editorで実行
```

### 4. MCPサーバーのテスト

```bash
# MCPサーバーを直接テスト
node mcp-server.js
```

### 5. Claude Desktop の設定

Claude Desktop の設定ファイルを更新します：

**macOS:** `~/Library/Application Support/Claude/claude_desktop_config.json`
**Windows:** `%APPDATA%\Claude\claude_desktop_config.json`

設定内容：

```json
{
  "mcpServers": {
    "document-stock": {
      "command": "node",
      "args": [
        "/Volumes/GYAKUTEN/PASSフォルダ/04_Projects/2025/tosho_siryo_stock_project/mcp-server.js"
      ],
      "cwd": "/Volumes/GYAKUTEN/PASSフォルダ/04_Projects/2025/tosho_siryo_stock_project",
      "env": {
        "NODE_ENV": "production"
      }
    }
  }
}
```

**注意:** パスは実際のプロジェクトの場所に置き換えてください。

### 6. Claude Desktop の再起動

Claude Desktop を再起動して、MCP設定を読み込みます。

## 利用可能なMCPツール

MCPサーバーは以下のツールを提供します：

### ファイル管理
- `list_files` - ファイル一覧の取得
- `get_file` - 特定ファイルの詳細取得
- `create_file` - 新しいファイルレコードの作成
- `update_file` - ファイル情報の更新
- `delete_file` - ファイルのソフト削除

### カテゴリ管理
- `list_categories` - カテゴリ一覧の取得
- `get_category` - 特定カテゴリの詳細取得
- `create_category` - 新しいカテゴリの作成
- `update_category` - カテゴリ情報の更新
- `delete_category` - カテゴリの削除

### ユーザー管理
- `list_users` - ユーザー一覧の取得
- `get_user` - 特定ユーザーの詳細取得

### 分析ツール
- `get_file_stats` - ファイル統計の取得
- `get_category_usage` - カテゴリ使用状況の取得

## トラブルシューティング

### MCPサーバーが起動しない場合

1. 環境変数が正しく設定されているか確認
2. Supabaseプロジェクトがアクティブか確認
3. 依存関係が正しくインストールされているか確認

```bash
npm list @modelcontextprotocol/sdk @supabase/supabase-js zod dotenv
```

### Claude Desktop でMCPツールが表示されない場合

1. 設定ファイルのJSON形式が正しいか確認
2. ファイルパスが正しいか確認
3. Claude Desktop を完全に再起動
4. Claude Desktop のログを確認

### 権限エラーが発生する場合

1. Supabase Row Level Security (RLS)設定を確認
2. Service Role キーが正しく設定されているか確認
3. データベーステーブルが正しく作成されているか確認

## ログの確認

MCPサーバーのログを確認するには：

```bash
# 開発モードでの実行
node --inspect mcp-server.js

# または詳細ログ付きで実行
DEBUG=* node mcp-server.js
```

## セキュリティ注意事項

- Service Role キーは決して公開リポジトリにコミットしないでください
- 本番環境では適切なRLSポリシーを設定してください
- 定期的にアクセスキーをローテーションしてください

## サポート

問題が発生した場合は、以下を確認してください：

1. Supabaseプロジェクトの状態
2. 環境変数の設定
3. データベーステーブルの作成状況
4. Claude Desktop のバージョンとMCP対応状況