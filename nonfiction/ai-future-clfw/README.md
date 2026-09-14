# AIの未来 — Cloudflare Workers版

`../ai-future/site/` と `../ai-future/articles/` を複製した独立した配信プロジェクトです。文章・データ・画面・シミュレーション・HashRouter は変更していません。`astrea` 版は含みません。調査ノートは元の `../ai-future/research/` を参照してください。

## セットアップと確認

Node.js 24 と npm を使用します。

```bash
cd nonfiction/ai-future-clfw
npm ci
npm run preview
```

`postinstall` が `site/` の依存関係もインストールします。preview はビルド後に Workers のローカル環境で配信します（通常 http://localhost:8787/）。Docker Sandboxではhostへのポート転送が必要になる場合があります。

記事URLは既存どおり `/#/llm`、`/#/physical`、`/#/simulator`、`/#/data` です。`npm run dev` で元のVite開発サーバーも使えます。

## デプロイ

```bash
npx wrangler login
npm run deploy:check  # ビルドとdry-run（公開しない）
npm run deploy
```

Cloudflareアカウントへのログイン後、`ai-future-clfw` という名前でデプロイします。公開URLはコマンドの出力に表示されます。別名を使う場合は `wrangler.jsonc` の `name` を変更してください。

CIでは `CLOUDFLARE_API_TOKEN` と `CLOUDFLARE_ACCOUNT_ID` をCIのシークレットに設定し、このディレクトリで `npm ci`、`npm run deploy` を実行します。

CloudflareのGit連携設定：

- ルートディレクトリ：`nonfiction/ai-future-clfw`
- ビルドコマンド：`npm ci && npm run build`
- デプロイコマンド：`npx wrangler deploy`

Workers Static Assets で `site/dist/` のみを配信します。バックエンド・DBは不要です。記事はViteビルド時に取り込まれます。

公式資料：[Workers Static Assets](https://developers.cloudflare.com/workers/static-assets/)
