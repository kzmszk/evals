# TypeScript速習 — Cloudflare Workersで配信

教材のHTML・JavaScriptを変更せず、Workers Static Assetsで `app/` を配信します。ビルド・バックエンド・DBは不要です。カリキュラムと設計資料は配信対象外で、教材の検証スクリプトも `app/.assetsignore` で除外します。

## ローカル確認

Node.js 24 と npm を使用します。

```bash
cd education/typescript
npm ci
npm test
npm run dev
```

http://localhost:8788/ を開きます。Docker Sandbox内で起動する場合はhostへのポート転送が必要になる場合があります。従来どおり `app/index.html` を直接開くこともできます。

## 本番デプロイ

ホスト側のターミナルで実行します。

```bash
cd education/typescript
npm ci
npx wrangler login
npm run deploy:check
npm run deploy
```

ログイン時にブラウザでCloudflareへのアクセスを許可してください。`deploy:check` は検証とdry-runのみで、公開しません。`deploy` は教材検証の成功後にアップロードします。

Worker名は `typescript-course` です。公開URLはデプロイ結果に表示されます（通常 `https://typescript-course.<サブドメイン>.workers.dev`）。名前は `wrangler.jsonc` で変更できます。更新時も `npm run deploy` を実行してください。

CloudflareのGit連携では、ルートディレクトリを `education/typescript`、ビルドコマンドを `npm ci && npm test`、デプロイコマンドを `npx wrangler deploy` に設定します。外部CIでは `CLOUDFLARE_API_TOKEN` と `CLOUDFLARE_ACCOUNT_ID` をシークレットに設定し、`npm ci && npm run deploy` を実行します。

## 既存の動作

MonacoエディタはCDNから読み込みます。学習進捗はブラウザのlocalStorageに保存され、別URLで保存した進捗は公開URLへ自動移行されません。

公式資料：[Workers Static Assets](https://developers.cloudflare.com/workers/static-assets/)
