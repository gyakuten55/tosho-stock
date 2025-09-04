# セットアップ手順書

## 重要: Service Role Key の設定

Supabase完全実装のため、以下の手順でService Role Keyを取得して設定してください:

1. Supabaseダッシュボード (https://supabase.com/dashboard) にログイン
2. プロジェクト `tosho-siryo-stock` を選択
3. Settings → API にアクセス  
4. Project API keys セクションで `service_role` キーをコピー
5. `.env.local` ファイルの `SUPABASE_SERVICE_ROLE_KEY=YOUR_SERVICE_ROLE_KEY_HERE` を実際のキーに置換

## データベース設定状況

以下が完了済みです:
- ✅ profilesテーブル作成（Supabase Auth統合）
- ✅ RLSポリシー設定
- ✅ filesテーブル構造修正（UUID型、削除フラグ等）
- ✅ ストレージバケット作成
- ✅ 環境変数ファイル更新

## 次のステップ

1. Service Role Key を設定後
2. `node mcp-server.mjs` でMCPサーバーをテスト
3. Claude Desktop設定ファイルを更新
4. `npm run dev` でフロントエンドを起動