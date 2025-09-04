# 資料ストックシステム - Claude Code MCP設定

## MCPサーバー設定

このプロジェクトには、Supabaseと統合されたMCPサーバーが含まれています。

### MCPサーバーの起動

```bash
node mcp-server.mjs
```

### 利用可能なMCPツール

#### ファイル管理
- `list_files` - ファイル一覧取得
- `get_file` - ファイル詳細取得  
- `create_file` - ファイル作成
- `update_file` - ファイル更新
- `delete_file` - ファイル削除

#### カテゴリ管理
- `list_categories` - カテゴリ一覧取得
- `get_category` - カテゴリ詳細取得
- `create_category` - カテゴリ作成
- `update_category` - カテゴリ更新
- `delete_category` - カテゴリ削除

#### ユーザー管理
- `list_users` - ユーザー一覧取得
- `get_user` - ユーザー詳細取得

#### 分析機能
- `get_file_stats` - ファイル統計取得
- `get_category_usage` - カテゴリ使用状況取得

### 環境設定

必要な環境変数:
- `NEXT_PUBLIC_SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`

### データベース構成

- **profiles**: ユーザープロファイル
- **categories**: ファイルカテゴリ  
- **files**: ファイルメタデータ

### コマンド

- 開発サーバー起動: `npm run dev`
- ビルド: `npm run build`
- MCPサーバー起動: `node mcp-server.mjs`