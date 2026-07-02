# 流体可視化デモ集

ブラウザだけで動く流体シミュレーションのデモ3本。**ビルド・サーバー・外部ライブラリ一切不要**。各HTMLファイルをブラウザで開くだけで動く。

| # | デモ | ファイル | 手法 | 計画書 |
|---|------|---------|------|--------|
| 1 | カルマン渦列 | `karman-vortex.html` | 格子ボルツマン法 (LBM, D2Q9) | [docs/01-karman-vortex-plan.md](docs/01-karman-vortex-plan.md) |
| 2 | 煙と炎 | `smoke-fire.html` | Stable Fluids (WebGL2, GPU) | [docs/02-smoke-fire-plan.md](docs/02-smoke-fire-plan.md) |
| 3 | ダムブレイク | `dambreak.html` | 粒子法 (Double Density Relaxation) | [docs/03-dambreak-plan.md](docs/03-dambreak-plan.md) |

## 実行方法

HTMLファイルをダブルクリック（`file://` で動く）。ローカルサーバーでもよい:

```
python3 -m http.server 8000
```

## 引き継ぎについて（重要）

rate limit 等で作業が中断しても、別のモデル（Codex 等）が続きから実装できるように、
各計画書は **計画書単体で実装を完遂できる** 詳細度で書いてある:

- アルゴリズムの数式・パス構成・推奨パラメータの具体値
- 実装手順（この順で作れば各段階で動作確認できる、という分割）
- UI仕様・視覚デザインの方針
- 完成判定チェックリストと、ハマりやすい落とし穴

パラメータの具体値は計画書の値が出発点。**実装済みファイルが存在する場合はコード内の CONFIG / 定数を正とする**（動作検証を経た調整済みの値のため）。

## 実装の共通ルール

- **単一HTMLファイル完結**（JS/CSS インライン、外部依存・CDN 不使用。`file://` で開くため fetch やモジュール分割をしない）
- ダークテーマ（背景 `#0b0e14` 系）、上部にコントロールバー、FPS 表示付き
- タイトルは日本語、`<html lang="ja">`
- requestAnimationFrame ループ。タブ復帰時の巨大 dt でシミュレーションが爆発しないよう dt をクランプする
