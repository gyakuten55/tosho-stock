# 📋 Supabase完璧セットアップガイド - MCP対応版

このガイドでは、MCPサーバーでSupabaseを完璧に整えるための手順を説明します。

## ✅ 現在の状況確認

MCPサーバー接続テストの結果：
- ✅ Supabase接続: **成功**
- ✅ ストレージバケット: **既存**
- ⚠️ データベーステーブル: **未作成**

## 🚀 セットアップ手順

### 1. 事前準備完了項目

- ✅ 環境変数設定（`.env.local`）
- ✅ MCPサーバー修正（`mcp-server.js`）
- ✅ ES Module対応（`package.json`）
- ✅ 統一SQLスクリプト作成（`final_supabase_setup.sql`）
- ✅ ストレージ設定スクリプト作成（`storage_bucket_setup.sql`）

### 2. Supabaseダッシュボードでの作業

#### 📊 データベーステーブルの作成

1. Supabaseダッシュボードにアクセス: https://app.supabase.com
2. プロジェクト「xaxhzcxcgqxuyeawkclj」を選択
3. 左メニューから「SQL Editor」を選択
4. 「New query」をクリック
5. `final_supabase_setup.sql` の内容をコピー＆ペースト
6. 「Run」ボタンをクリックして実行

**期待される結果:**
- `profiles` テーブル作成
- `categories` テーブル作成  
- `files` テーブル作成
- RLSポリシー設定
- デフォルトカテゴリ挿入
- テスト用プロファイル作成

#### 💾 ストレージポリシーの更新

1. 同じSQL Editorで新しいクエリを作成
2. `storage_bucket_setup.sql` の内容をコピー＆ペースト
3. 「Run」ボタンをクリックして実行

**期待される結果:**
- ストレージバケット設定更新
- RLSポリシー設定
- アクセス権限の適切な設定

### 3. セットアップの確認

#### 🔍 データベース確認

```bash
node test-mcp-connection.js
```

**期待される出力:**
```
✅ Basic connection successful
📋 Available tables: profiles, categories, files
✅ Files storage bucket exists
✅ MCP Server is ready for Supabase integration
```

#### 🛠️ MCPサーバーテスト

```bash
# MCPサーバー起動テスト
node mcp-server.js &
# プロセスをバックグラウンドで実行
```

エラーが出ずにサーバーが起動すれば成功です。

### 4. Claude Desktop設定

#### 📁 設定ファイルの場所

- **macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
- **Windows**: `%APPDATA%\Claude\claude_desktop_config.json`

#### ⚙️ 設定内容

`claude_desktop_config.json` に以下を追加：

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

**注意**: パスは実際のプロジェクトの場所に合わせて変更してください。

### 5. 最終動作確認

#### ✨ MCPツール一覧

MCPサーバーが提供するツール：

**📁 ファイル管理**
- `list_files` - ファイル一覧取得
- `get_file` - ファイル詳細取得
- `create_file` - ファイル作成
- `update_file` - ファイル更新
- `delete_file` - ファイル削除

**📂 カテゴリ管理**  
- `list_categories` - カテゴリ一覧取得
- `get_category` - カテゴリ詳細取得
- `create_category` - カテゴリ作成
- `update_category` - カテゴリ更新
- `delete_category` - カテゴリ削除

**👥 ユーザー管理**
- `list_users` - ユーザー一覧取得
- `get_user` - ユーザー詳細取得

**📈 分析ツール**
- `get_file_stats` - ファイル統計取得
- `get_category_usage` - カテゴリ使用状況取得

#### 🔧 Claude Desktopでの確認

1. Claude Desktopを再起動
2. 新しい会話を開始
3. MCPツールが利用可能か確認
4. 例：「ファイル一覧を取得してください」

## 🎯 完了チェックリスト

- [ ] `final_supabase_setup.sql` 実行完了
- [ ] `storage_bucket_setup.sql` 実行完了  
- [ ] `test-mcp-connection.js` で全テスト成功
- [ ] MCPサーバー起動エラーなし
- [ ] Claude Desktop設定完了
- [ ] Claude DesktopでMCPツール利用可能

## 🚨 トラブルシューティング

### データベース接続エラー

```bash
# 接続テストを再実行
node test-mcp-connection.js

# エラーが出る場合、環境変数を確認
echo $NEXT_PUBLIC_SUPABASE_URL
```

### MCPサーバー起動エラー

```bash
# 依存関係を再インストール
npm install @modelcontextprotocol/sdk@latest @supabase/supabase-js zod dotenv

# パッケージの確認  
npm list @modelcontextprotocol/sdk
```

### Claude Desktop設定エラー

1. 設定ファイルのJSON形式確認
2. ファイルパスの正確性確認
3. Claude Desktop完全再起動

## 🎉 セットアップ完了後

MCPサーバーが正常に動作すると、Claude Desktopから直接：

- ✨ ファイルシステムの完全制御
- 📊 リアルタイム統計取得  
- 🔄 自動データベース操作
- 📈 詳細な分析レポート生成

が可能になります！

---

**🆘 サポートが必要な場合**

1. `test-mcp-connection.js` の出力を確認
2. Supabaseプロジェクトの状態を確認
3. MCPサーバーログを確認
4. Claude Desktopのログを確認