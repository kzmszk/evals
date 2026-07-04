# 健康教育動画生成システム

`final-plan.md` の採用アーキテクチャを実装したローカルパイプライン。

## データフロー

1. `draft.md` を `draft.json` に変換する。
2. `draft.json` から `script.json` を生成する。
3. `script.json` の発話をVOICEVOX `/audio_query` に渡す。
4. モーラ長から計算尺を出す。
5. `/synthesis` 後のWAV実測尺と比較し、50ms超の差分は実測尺を採用する。
6. `pacing.json` の無音を物理WAVとして挿入し、同じループで `timeline.json` へ絶対時刻を書き込む。
7. Remotion が `timeline.json` をフレームに変換して動画化する。

## レビュー点

- レビュー1: `script.json`
  - 事実、主張の強さ、トーン、尺を見る。
- レビュー2: `review/accent_review.html`
  - `timeline.json` を貼り付け、発話ごとにWAVを確認する。
- レビュー3: Remotion 720p preview
  - 文字量、テンポ、読みやすさを見る。

## ドライラン

VOICEVOXが未起動でも `--mode dry-run` で無音WAVを生成する。同期データ、Remotion表示、シーン尺の検証に使う。本番音声は `--mode voicevox` で生成する。
