# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this repo is

`evals` は Claude / OpenAI / Google など各社フロンティアモデルおよび OSS モデルの実力を比較評価するための実験室。各サブディレクトリは独立したデモ・評価テーマで、それぞれ複数モデルに同一(または類似)プロンプトを与えて成果物を作らせ、比較する構成になっている。

## Architecture

- テーマごとにトップレベルディレクトリを切る: `fluid-demos/`(流体シミュレーション)、`anime-effects/`(アニメ風エフェクト作画)、`3DCG/`(3DCG モデル比較評価)。
- 現行テーマはいずれもビルド不要・単一 HTML ファイル完結だが、これは現状のテーマがそういう性質だからであり固定ルールではない。**今後より複雑なアプリ(ビルドツール・パッケージマネージャ・テスト・マルチファイル構成を要するもの)が追加される可能性がある**。新しいテーマディレクトリを扱う際は `package.json` 等のビルド設定の有無をまず確認し、単一 HTML 前提を機械的に適用しないこと。
- 各テーマディレクトリの構成パターン、3DCG のモデル比較の進め方、gitignore 対象の生成物、単一 HTML デモの実装規約(ダークテーマ・dt クランプ・API キーの扱い等)は [docs/conventions.md](docs/conventions.md) を参照。

## Running demos

ビルド・インストール不要。対象の HTML をブラウザで直接開くか、ローカルサーバーを立てる:

```sh
python3 -m http.server 8000
```
