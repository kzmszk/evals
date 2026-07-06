# evals

Claude / OpenAI / Google などのフロンティアAIモデルや OSS 系モデルの実力を評価するための実験室。テーマごとにトップレベルのフォルダを切り、各社モデルに同一(または類似)のプロンプトを与えて成果物を作らせ、比較する。

- 複数モデルで作業した場合は、フォルダ内で `fable5/` `opus/` `gpt55/` のようにモデル別へ出力を分離する。
- モデル別の出力がない場合は、基本的に Fable 5 による出力。

## 各フォルダの概要

| フォルダ | 内容 | 形態 |
|---|---|---|
| [3DCG/](3DCG/) | 3DCG モデル比較評価。手続き生成のビル街飛行デモ(`city-flight/`)、実写 3D タイル版(`city-flight-real/`、要 Google Maps API キー)、MLS-MPM 雪シミュレーション(`mls-mpm-snow/`、モデル別) | 単一 HTML |
| [anime-effects/](anime-effects/) | アニメ風エフェクトの作画。爆発・セル爆発・ヘリ攻撃など(`*.html`) | 単一 HTML |
| [fluid-demos/](fluid-demos/) | 流体シミュレーション。ダム崩壊・カルマン渦・煙と炎(`*.html`) | 単一 HTML |
| [infographics/](infographics/) | 歴史インフォグラフィック教材。幕末〜明治のタイムライン(`bakumatsu-timeline/`、モデル別) | 単一 HTML |
| [education/](education/) | 教材コンテンツ。TypeScript 速習コース(`typescript/`)、健康リテラシー(`health/`) | 単一 HTML + Markdown |
| [fiction/](fiction/) | フィクション生成コンテスト。短編(`contest/`)、アニメ原作企画(`anime-contest/`) | Markdown |
| [nonfiction/](nonfiction/) | ノンフィクション論考。AI の未来レポート(`ai-future/`、論考2本+マクロ経済シミュレータ) | Vite + React サイト |
| [movie/](movie/) | 動画生成パイプライン。設計コンテストと Remotion による実装(`remotion/`) | ビルド要(Remotion) |

各フォルダの詳しい規約・進め方は [docs/conventions.md](docs/conventions.md)、およびフォルダ内の `README.md` / `CLAUDE.md` を参照。

## デモの表示方法

### 単一 HTML のデモ(3DCG / anime-effects / fluid-demos / infographics / education の一部)

ビルド・インストール不要。対象の HTML をブラウザで直接開くか、リポジトリのルートでローカルサーバーを立てる:

```sh
python3 -m http.server 8000
# → http://localhost:8000/fluid-demos/karman-vortex.html などを開く
```

モデル別に分かれているテーマ(`3DCG/mls-mpm-snow/`、`infographics/bakumatsu-timeline/` など)は、`fable5/index.html` と `opus/index.html` を並べて見比べる。

#### 3DCG/city-flight-real は Google Maps API キーが必要

`3DCG/city-flight-real/` は Google Photorealistic 3D Tiles で実写のマンハッタンを飛ぶデモで、動かすには **Google Maps API キー**が必要。

1. Google Cloud Console でプロジェクトを作成し、**Map Tiles API** を有効化(課金の有効化も必要)。
2. API キーを発行する。
3. デモを開き、画面上部の入力欄にキーを貼り付ける(キーは `localStorage` に保存され、次回以降は自動で読み込まれる)。`?key=YOUR_API_KEY` を URL に付けて渡すこともできる。

キーはリポジトリにコミットしないこと。手続き生成版の `3DCG/city-flight/` はキー不要でそのまま開ける。

### nonfiction/ai-future(Vite + React サイト)

```sh
cd nonfiction/ai-future/site
npm install
npm run dev        # 開発サーバー
npm run build      # 本番ビルド
```

### movie(Remotion)

```sh
cd movie/remotion
npm install
npx remotion studio   # プレビュー
```
