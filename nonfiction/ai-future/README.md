# AIの未来 — データ分析に基づく10年予測

`nonfiction/README.md` の企画に基づく成果物一式。

## 構成

```
ai-future/
├── research/        # Web調査ノート(領域別 .md、マルチエージェント調査の出力)
├── articles/        # 論考の Markdown ソース(サイトが直接 import する)
│   ├── llm-future.md      # LLM系AIの現状分析と10年予測(約2万字)
│   └── physical-ai.md     # フィジカルAIの現状分析と10年予測(約1万字)
└── site/            # Vite + React + TypeScript のWEBサイト
    └── src/
        ├── pages/       # ルーティング単位のページ
        ├── components/  # 記事レンダラ・チャート部品
        ├── data/        # 可視化用データセット(出典URL付き JSON/TS)
        └── model/       # マクロ経済シミュレーションエンジン(純関数、vitest でテスト)
```

## 実行

```sh
cd site
npm install
npm run dev        # 開発サーバー
npm run build      # 本番ビルド(tsc + vite)
npx vitest run     # 経済モデルのテスト
```

## 設計方針

- 記事本文は `articles/*.md` に置き、サイトは `?raw` import して描画する。
  記事中の `::figure{id}` 行が `src/components/charts/registry.tsx` に登録された
  チャートに置き換わる。文章の修正は Markdown だけで完結する。
- 可視化データはすべて `src/data/` に出典 URL・取得時点付きで保持する。
- 経済モデルは UI から分離した純関数(`src/model/`)で、単体テストを持つ。
