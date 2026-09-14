# AI2026

AIとの制作と検証を紹介するポートフォリオ。Cloudflare Workers Static Assets で配信する静的サイトです。

## 公開先

- ポートフォリオ: https://ai2026.kazumasa.workers.dev/
- AIの未来: https://ai-future-clfw.kazumasa.workers.dev/
- TypeScript教材: https://typescript-course.kazumasa.workers.dev/

## 更新

リポジトリのルートから実行します。Node.js と npm が必要です。

```sh
npm ci --prefix nonfiction/ai-future/astrea
npm ci --prefix ai2026
cd ai2026
npm run build
npm run check
npm run dev
```

http://127.0.0.1:4326 で確認できます。`catalog.mjs` が紹介文・評価の着眼点・作品リンクの編集箇所です。紹介の着眼点と、原資料に記載された採点・順位は区別しています。

`scripts/build.mjs` は Git 管理下の対象作品だけを読み込み、Markdown をサニタイズした HTML に変換します。目次、作品集、相対リンクの変換、印刷用スタイル付き。ビルドで置き換えるのは `ai2026/dist/` の生成物だけです。設定・資格情報・作業メモ・node_modules を公開ディレクトリへコピーしません。

HTML デモは単一ファイルの原作をそのまま配信。ASTREA は `/astrea/` 用にビルドし、各既知ルートの直接アクセスにも対応します。既存2サイトは公開URLへリンクします。

## サムネイル

`thumbnails/` は作品ページの実画面です。再撮影時は開発サーバーを起動したまま、別ターミナルで次を実行します。

```sh
npx playwright install chromium
npm run thumbnails
npm run build
npm run check
```

既存の Chromium を使う場合は `AI2026_CHROMIUM=/absolute/path/to/chrome` を設定できます。`npm run thumbnails -- golden-gate` のように作品IDを指定して個別に撮影できます。撮影は代表フレームの取得であり、数値シミュレーションの長時間安定性の再検証ではありません。

## デプロイ

```sh
npx wrangler login
npm run deploy:check
npm run deploy
```

Worker名は `ai2026`。公開用の成果物のみをアップロードします。作品リンクと画像の存在確認に失敗した場合はデプロイしません。

## 掲載範囲と制約

- 15の紹介枠、68のMarkdown文書、15の単一HTMLデモ、ASTREAサイトを掲載。
- 原資料へのリンクはビルド時のGitコミットを参照。評価記録にある未収録画像は欠落を明示します。
- WebGPUの雪デモは対応ブラウザ・GPUが必要。実写3Dタイル版は閲覧者自身の Google Maps API キーが必要です。
- 健康教材は制作時点の草稿。動画制作は設計成果物を掲載し、ローカルの音声レビュー画面や未生成の動画は作品として公開しません。
- 外部CDNを利用する原作デモは、配信先の通信状態にも依存します。
