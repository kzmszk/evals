# 動画生成デモ

## 楽しく健康で長生きするための方法序説

* education/health/drafts に書いたトピックをベースに音声コンテンツつきの動画を作成する。
* 動画コンテンツは楽しく、気楽に、しっかり学べるというコンセプト
* シンプルなアニメーションと大きめな文字で重要なワードやセンテンスをムービーとして合成し、数10ページを切り替えながら5分程度の動画にまとめる。
* 音声シナリオはドラフトから自動で生成し、AIボイスで動画と連動させる。
* 音声シナリオは二人の会話形式。

このような動画作成システムを開発し、実際にそれを利用して一つ動画コンテンツを作成する
動画生成システムは全自動の必要はなく、ところどころ人間が支援したり、他のサービスを利用してもよい。

どのようなシステムを開発するか、その設計プランをfable5, opus4.8, gpt5.5(codex plugin経由)で独立に作成してもらう。設計プランは必要に応じて複数準備してもよい。

最後にそれら成果物をfable5で評価する。

## 採用実装

`final-plan.md` に基づく動画生成システムは `movie/` 配下に実装している。

### できること

- `education/health/drafts/*.md` を `draft.json` に構造化する。
- 二人会話の `script.json` を生成する。既定はローカルのヒューリスティック生成、`--method claude` で `claude -p` を使う。
- VOICEVOX が起動していれば `/audio_query` と `/synthesis` で音声を生成し、計算尺とWAV実測尺を照合する。
- VOICEVOX がない場合も `--mode dry-run` で無音WAV、`timeline.json`、`narration.wav` まで生成できる。
- Remotion が `timeline.json` と `narration.wav` から動画を合成する。

### クイックスタート

```sh
PYTHONPATH=movie python3 -m movie_pipeline build \
  education/health/drafts/sleep-01-nedame.md \
  --build-dir movie/build/sleep-01 \
  --mode dry-run
```

VOICEVOX アプリのエンジンが `http://127.0.0.1:50021` で起動している場合:

```sh
PYTHONPATH=movie python3 -m movie_pipeline build \
  education/health/drafts/sleep-01-nedame.md \
  --build-dir movie/build/sleep-01 \
  --mode voicevox
```

Claude Code ヘッドレスで台本を作る場合:

```sh
PYTHONPATH=movie python3 -m movie_pipeline build \
  education/health/drafts/sleep-01-nedame.md \
  --build-dir movie/build/sleep-01 \
  --method claude \
  --mode voicevox
```

Remotion レンダリング:

```sh
cd movie/remotion
npm install
npx remotion render src/index.ts HealthVideo ../out/sleep-01.mp4 \
  --props=../build/sleep-01/timeline.json \
  --public-dir=../build/sleep-01 \
  --concurrency=8
```

720p プレビューは `--height=720 --width=1280` を追加する。

### 主なファイル

- `movie/movie_pipeline/`: Python CLI。ドラフト解析、台本生成、VOICEVOX接続、timeline生成。
- `movie/config/pacing.json`: 会話の「間」の調整値。
- `movie/config/pronunciation.json`: 横断の読み辞書。
- `movie/prompts/scenario.md`: Claude用シナリオ生成プロンプト。
- `movie/remotion/`: timeline契約を読むRemotionテンプレート。
- `movie/review/accent_review.html`: 読み・アクセント確認用の軽量HTML。
