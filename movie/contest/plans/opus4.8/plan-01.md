# プラン01: VOICEVOX × Remotion — TTS メタデータ駆動の決定論的同期パイプライン

> 設計者: opus4.8 / 位置づけ: **本命(全10本の量産ライン)**
> 一言: 「音声の尺を後から映像に合わせる」のではなく、**TTS エンジンが出す発話タイミングそのものを同期データにする**ことで、ASR も目測もなしに音声と映像を構造的にロックする。

---

## 0. 設計の核心を先に一行で

VOICEVOX の `audio_query` は合成前に**モーラ単位の子音長・母音長(秒)を返す**。さらに合成後の WAV はサンプル数で厳密に尺が確定する。したがって「スライドを何秒表示するか」を人間が決める必要も、Whisper で聞き起こして揃える必要も**一切ない**。尺は音声から一意に決まり、映像側(Remotion)はその尺表を読んで各シーンの `from` / `durationInFrames` を機械的に設定する。**同期は"調整"ではなく"導出"される**。これが本プランが同期観点で他案に対して持つ最大の差別化点。

---

## 1. アーキテクチャ概要

```
 education/health/drafts/xxx.md   (入力: 80〜120行の健康リテラシー Markdown)
            │
            │  ① 台本化 (Claude API + 構造化プロンプト)
            ▼
    manifest.json  ← ★中核中間成果物 / 人間レビュー地点①
     (2話者の会話台本 + シーンごとの画面設計 + エビデンス強度)
            │
            ├──────────────────────────────┐
            │ ② 音声合成 (VOICEVOX)         │ (映像は manifest から並行して組める)
            ▼                               │
   per-scene WAV × N                        │
   + audio_query.json × N (モーラ長)        │
            │                               │
            │ ③ 尺確定 & タイムライン生成    │
            ▼                               │
   narration.wav (全結合)                   │
   timeline.json  ← ★同期データ            │
     scene_id → [start_ms, end_ms]         │
     keyword  → highlight_ms               │
            │                               │
            └───────────────┬───────────────┘
                            ▼
            ④ 映像レンダリング (Remotion / React+TS)
            <HealthVideo manifest timeline audio="narration.wav"/>
                            │
                            ▼
                     output.mp4 (1920×1080, H.264, 音声込み)
                            ▲
                  人間レビュー地点③ (最終 QA / Remotion Studio でスクラブ)
```

データの流れは **`draft.md → manifest.json → (narration.wav + timeline.json) → mp4`** の一方向。中間成果物はすべてファイルとして残り git 管理でき、任意の工程から再実行できる(再現性の担保)。

実行機材の割り当て:
- **MacBook Pro (M1 Pro)**: 全工程がここで完結する。VOICEVOX は CPU 版で 5 分尺なら実用速度、Remotion のレンダリングも M1 で問題なし。**普段の量産はこの1台で回す。**
- **Windows 11 / RTX 4090**: 本プランでは必須ではない。VOICEVOX GPU 版でバッチ合成を高速化したい / 10本を一気に流す夜間バッチ、といった場合のみ使う。GPU 依存を最小化しているのが本プランの堅牢性。

---

## 2. 各工程の設計

### ② の前に: ① 台本化(draft.md → manifest.json)

Claude API に「health ドラフトの節構造(フック→クイズ→正解→解説→まとめ)を、2話者の会話へ写像する」構造化プロンプトを渡す。出力は下記スキーマの JSON に強制する(`response_format` 相当のスキーマ提示 + 検証)。

**manifest.json スキーマ(v1):**

```jsonc
{
  "meta": {
    "source": "sleep-01-nedame.md",
    "title": "寝だめはできるか",
    "subtitle": "睡眠負債の返済計画",
    "field": "睡眠",
    "target_seconds": 300          // 尺の設計目標(逆算の基準)
  },
  "speakers": {
    "host":  { "name": "ケン", "vv_style_id": 13, "speed": 1.05, "role": "解説役(ツッコミ)" },
    "guest": { "name": "ミナ", "vv_style_id": 2,  "speed": 1.0,  "role": "学習役(素朴な疑問)" }
  },
  "scenes": [
    {
      "id": "s01", "section": "hook", "speaker": "guest",
      "line": "平日は6時間、週末は昼まで爆睡…これ、私の家計簿なんですけど。",
      "reading_hints": { "爆睡": "ばくすい" },   // TTS 誤読対策(任意)
      "visual": {
        "layout": "title",
        "headline": "寝だめはできるか",
        "sub": "睡眠負債の返済計画",
        "keywords": ["睡眠負債"],
        "chart": null,
        "evidence": null                        // A/B/C or null
      },
      "pause_after_ms": 350                      // 次の話者へ渡すまでの間
    },
    {
      "id": "s07", "section": "explain", "speaker": "host",
      "line": "6時間睡眠を2週間。認知成績は毎日下がり続けたのに、眠気の自覚だけは数日で頭打ちになった。",
      "visual": {
        "layout": "keyword_reveal",
        "headline": "自覚は慣れる。性能は落ち続ける。",
        "keywords": ["眠気の自覚→頭打ち", "認知成績→下がり続ける"],
        "chart": null,
        "evidence": "A"                          // 【エビデンス強度 A】をバッジ化
      },
      "pause_after_ms": 250
    }
  ]
}
```

- `layout` は有限集合: `title` / `quiz_options` / `answer_reveal` / `keyword_reveal` / `chart` / `bansuzuri`(ぶった斬りコーナー用) / `summary`。ドラフトの節と対応し、Remotion 側に同名コンポーネントを用意する。
- LLM には「5分=約 300 秒、日本語 TTS は概ね 6〜7 モーラ/秒 ≒ 300〜360字/分なので、全 `line` の合計を約 1500〜1800 字に収める」という**尺予算**を明示的に守らせる。これが「5分・数十ページから逆算した情報量設計」の実体。
- コスト: 1本あたり入力〜出力 1万トークン程度 → **数十円**。人手で書いても可。

### ② 音声合成(VOICEVOX)

VOICEVOX Engine をローカル起動(`http://localhost:50021`)。各シーンについて2段階で叩く。

```bash
# 起動 (Mac: アプリ同梱エンジン or Docker)
docker run --rm -p 50021:50021 voicevox/voicevox_engine:cpu-latest

# scene ごと: (1) クエリ生成 → (2) 合成
curl -s -X POST "localhost:50021/audio_query?speaker=13&text=$(python -c 'import urllib.parse,sys;print(urllib.parse.quote(sys.argv[1]))' "6時間睡眠を2週間。")" \
  > s07.query.json
# speedScale などを注入
jq '.speedScale=1.05 | .pauseLengthScale=1.1' s07.query.json > s07.query2.json
curl -s -X POST "localhost:50021/synthesis?speaker=13" \
  -H "Content-Type: application/json" -d @s07.query2.json > s07.wav
```

- 話者交代は `vv_style_id` を話者ごとに切り替えるだけ。無料でキャラクター音声が多数あり、掛け合いに向く声質を選べる(例: ずんだもん/四国めたん系の対比)。
- `speedScale` を話者ごとに変えて性格づけ、`pauseLengthScale` で読点の間を調整。
- 誤読対策: `reading_hints` があれば、`audio_query` の該当モーラ列を差し替える or ユーザー辞書 API (`POST /user_dict_word`) に登録。「インスリン感受性」「Van Dongen」などの専門語・人名・英語が最大の誤読源。
- コスト: **0円**(ローカル)。5分尺の合成は Mac CPU で実時間の 1〜2 倍程度。

### ③ 尺確定 & タイムライン生成(同期データの生成)

**同期の要**。合成済み WAV のサンプル数から各シーンの尺を**厳密に**得る(予測ではなく実測=formula 誤差ゼロ)。

```python
import soundfile as sf, json, numpy as np

fps = 30
scenes = json.load(open("manifest.json"))["scenes"]
timeline, cursor_ms, clips = [], 0.0, []
for sc in scenes:
    wav, sr = sf.read(f"{sc['id']}.wav")
    dur_ms = len(wav) / sr * 1000                     # ★実測尺(揺れの余地なし)
    start, end = cursor_ms, cursor_ms + dur_ms
    timeline.append({"id": sc["id"], "start_ms": round(start), "end_ms": round(end)})
    clips.append(wav)
    pause = sc.get("pause_after_ms", 250)
    clips.append(np.zeros(int(sr*pause/1000)))         # 話者交代の"間"を無音で挿入
    cursor_ms = end + pause
sf.write("narration.wav", np.concatenate(clips), sr)
json.dump({"fps": fps, "clips": timeline}, open("timeline.json","w"), ensure_ascii=False, indent=2)
```

**サブシーン同期(キーワードのポップを発話の瞬間に当てる)**: `audio_query.json` のモーラ長を累積すれば、シーン内で任意の語が「何 ms 時点で発話されるか」が分かる。`keywords` に含まれる語のモーラ位置を照合し `highlight_ms` を timeline に付与。これで「重要ワードを、声がそこに来た瞬間に大きく出す」演出が **ASR なしで** 実現できる(VOICEVOX 固有の強み)。精度が過剰なら、この機能はシーン先頭一括表示にフォールバックしてよい。

### ④ 映像レンダリング(Remotion)

Remotion (React + TypeScript) の単一 Composition が `manifest.json` / `timeline.json` / `narration.wav` を props で受け取る。

```tsx
// Root.tsx (抜粋・概念)
export const HealthVideo: React.FC<{manifest: Manifest; timeline: Timeline}> = ({manifest, timeline}) => {
  const {fps} = useVideoConfig();
  const ms2f = (ms: number) => Math.round(ms / 1000 * fps);
  return (
    <AbsoluteFill style={{background: "#0e1116"}}>          {/* リポジトリ規約のダークテーマ */}
      <Audio src={staticFile("narration.wav")} />           {/* 音声は1本、全体で共有 */}
      {manifest.scenes.map((sc, i) => {
        const clip = timeline.clips[i];                     // 同一 index で対応
        return (
          <Sequence key={sc.id} from={ms2f(clip.start_ms)}
                    durationInFrames={ms2f(clip.end_ms - clip.start_ms)}>
            <SceneRouter scene={sc} />                       {/* layout で分岐 */}
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
};
```

- `<Audio>` と各 `<Sequence>` は Remotion の同一フレームクロックを共有 → 定義上ズレない。
- `SceneRouter` が `layout` ごとに `TitleScene` / `QuizScene` / `KeywordReveal` / `ChartScene` / `EvidenceBadge` 付き `ExplainScene` / `SummaryScene` を出し分け。大きめの文字は `@remotion/layout-utils` の `fitText` で自動フィット(オーバーフロー防止)。
- レンダリング: `npx remotion render HealthVideo out/sleep-01.mp4 --props=./manifest.json`。内部で ffmpeg が音声込み MP4 を書き出す。M1 で 5 分尺 30fps が実用時間で完了。

---

## 3. 音声・映像同期方式(採点配点最大 → 重点詳述)

| 論点 | 本プランの解 |
|---|---|
| **タイムスタンプの取得方法** | 合成後 WAV のサンプル数から実測(`len(wav)/sr`)。予測式に頼らないので誤差ゼロ。サブシーン単位のキーワード位置は `audio_query` のモーラ長累積から算出(VOICEVOX がネイティブに timing を吐くため ASR/forced-alignment 不要)。 |
| **同期データの形式** | `timeline.json`(`fps` と `clips:[{id,start_ms,end_ms,highlights[]}]`)。人間可読・git 差分可能・映像側は index 対応で読むだけ。 |
| **合成時の適用方法** | Remotion `<Sequence from durationInFrames>` に ms→frame 換算で流し込み。音声 `<Audio>` と同一クロック共有でフレーム精度ロック。 |
| **TTS 尺揺れ問題(核心リスク)** | **設計上発生しない。** スライド表示秒を人間/LLM が固定せず、常に「音声を作ってから、その実測尺に映像を合わせる」向きだから。台本を人間が1行直して再合成しても、`timeline.json` が自動更新され Remotion が自動で伸縮追従する。固定尺方式が抱える「声が余る/切れる」問題を構造的に回避。 |
| **会話形式の間・テンポ** | 話者交代のたびに `pause_after_ms`(既定 250〜400ms)を無音として挿入。話者ごとに `speedScale` を変えテンポに差(解説役=速め、学習役=ゆっくり驚く)。読点の間は `pauseLengthScale`。これらは manifest の値なので人間が数値で微調整でき、再合成に即反映。 |

補足の安全策: サブシーン highlight のモーラ照合に失敗しても、そのシーンは「キーワード先頭一括表示」に自動フォールバックするため、同期の破綻がレンダリング失敗に波及しない(グレースフルデグレード)。

---

## 4. 人間の関与ポイント

自動化が信頼できる工程(尺算出・結合・レンダリング)は完全自動化し、**品質リスクが高く自動判定が難しい3点だけ**に人間を置く。

| # | 工程 | 何を見て何を直すか | なぜ人間か |
|---|---|---|---|
| **①** | **manifest レビュー(最重要)** | エディタで `manifest.json` を開き、(a) 医学的主張・数値・エビデンス強度が原文を歪めていないか、(b) 会話の自然さ、(c) キーワード選定、(d) `line` 合計字数が尺予算内か、を確認・修正 | LLM は医療クレームを微妙に誇張/改変しうる。ここは健康教材として最も事故ってはいけない箇所で、自動検証が困難。**唯一の必須関門。** |
| **②** | **音声スポットチェック** | 各シーン WAV を再生し誤読(専門語・人名・英字・数字)を聴取。`reading_hints` かユーザー辞書で修正し再合成 | 日本語 TTS 最大の品質欠陥は誤読。文字列一致では検出できず耳が要る。ただし対象は「引っかかった語だけ」で軽い。 |
| **③** | **最終 QA** | `npx remotion studio` でタイムラインをスクラブし、文字オーバーフロー/演出タイミング/全体テンポを目視。OK ならレンダリング承認 | レイアウト崩れ・体感テンポは主観評価が要る最後の砦。 |

インターフェース具体像:
- ①③は既存 GUI を流用(コードエディタ + Remotion Studio のホットリロード付きプレビュー)。専用ツールを作らないのが低コストの肝。
- ②は「WAV 再生 + 対応 `line` 表示 + 辞書登録ボタン」だけの 30 行程度のローカル HTML で十分(初期構築で作る)。
- **意図的に自動のまま残す**: 尺決定・音声結合・シーン→フレーム割当・エンコード。ここに人手を入れるのは無駄で、むしろ再現性を損なう。

---

## 5. 技術選定の理由とコスト概算

| 工程 | 採用 | 理由(要件への紐付け) | 却下した代替と理由 |
|---|---|---|---|
| 台本化 | **Claude API** | 日本語の指示追従・構造化出力が最良。節構造の写像に強い | ルールベース抽出=会話化できず硬い |
| TTS | **VOICEVOX** | ①無料・ローカル・商用可 ②日本語ネイティブ ③**モーラ timing をネイティブ出力=同期の実現手段そのもの** ④2話者に足るキャラ音声、掛け合いに合う声質 | Style-Bert-VITS2/クラウド=声は上だが timing 非公開で ASR 必須。本命では"確実さ"を優先し**プラン02に分離**。「楽しく気楽に」という本コンセプトには VOICEVOX のキャラ声がむしろ好適 |
| 映像 | **Remotion** | React/TS でテキスト演出・タイポグラフィが最強。**プログラマティック=10本にテンプレ適用でき再現性が高い**。ヘッドレスで CI 化可 | MoviePy=文字演出が貧弱 / After Effects=スクリプト再現性・ヘッドレス性で劣る |
| 合成 | **Remotion 内蔵 ffmpeg** | 音声込み MP4 を一発書き出し。別途合成工程が不要 | 手動 ffmpeg 結合=工程増 |

**コスト:**
- **動画1本あたり**: LLM 台本 数十円 + 電気代のみ ≈ **実質 50円未満**(外部従量課金なし)。人的コストは②③のレビュー 30〜60分。
- **初期構築(1回)**: Remotion テンプレート開発が主。**エンジニア実働 3〜4日**。ソフト費 0円(Remotion は個人・小規模無料。※法人4名以上は要ライセンス、後述)。

---

## 6. リスクと対策

| リスク | 深刻度 | 対策 |
|---|---|---|
| TTS の専門語・人名・数字の誤読 | 高 | 台本生成時に `reading_hints` を LLM に併記させる + ユーザー辞書 + 人間②のスポットチェック。英語人名は事前カタカナ化ルール |
| VOICEVOX の声が5分間で単調・機械的 | 中 | 2話者の声質/速度差、`pause` による緩急、BGM ベッド(フリー音源)と効果音を Remotion 側で薄く敷く。クイズの「考え中」ジングル等 |
| キーワード highlight のモーラ照合ミス | 低 | 一括表示へ自動フォールバック(§3)。同期破綻を描画失敗に波及させない |
| 文字オーバーフロー(長いキーワード) | 中 | `fitText` 自動縮小 + 人間③QA。manifest の keywords に長さ上限を LLM 指示 |
| Remotion 商用ライセンス(法人4名以上有償) | 低 | 評価/個人利用は無料。量産を法人化するなら Company License を計上(年額)。技術リスクではなく事務リスクとして明記 |
| ドラフト形式の揺れ(章立て・分量差) | 中 | 台本化プロンプトは行番号でなく**節の意味**(フック/クイズ/解説/まとめ)で写像。節が欠けても layout をスキップして成立するよう Remotine 側を欠損耐性に |
| 尺が5分から大きく外れる | 中 | manifest 生成後に `line` 総字数を機械チェックし、閾値超なら LLM に圧縮再生成を指示(人間①の前に自動ゲート) |

---

## 7. 実装ロードマップ(最初の1本=sleep-01 まで)

| Day | 作業 | 中間成果物 |
|---|---|---|
| **1** | VOICEVOX 起動確認。`draft→manifest` プロンプト作成 & sleep-01 で試写。`manifest→WAV+timeline` スクリプト(§2②③)実装。実測尺が WAV と一致することを検証 | `manifest.json`, `narration.wav`, `timeline.json` |
| **2** | Remotion プロジェクト作成。`SceneRouter` と基本4レイアウト(Title/Quiz/Explain/Summary)実装。manifest+timeline+audio を配線し **sleep-01 を初回エンドツーエンド render** | `out/sleep-01.mp4`(粗) |
| **3** | タイポグラフィ/キーワードポップ同期/エビデンスA・B・Cバッジ(緑/橙/灰)/棒グラフコンポーネント/ぶった斬りコーナー演出を作り込み。②音声スポットチェック用の簡易 HTML 作成。人間レビュー ループを一巡 | 完成版 sleep-01.mp4 |
| **4** | **2本目(exercise-01 等)を無改造で流し**、テンプレの汎用性を検証・欠損耐性を修正。README/実行手順を整備 | 2本目 mp4 + 量産手順書 |

**最初の1本の完成: 実働約3日。以降は1本あたり実働1〜2時間(大半が人間②③レビュー、機械工程は数分)。**

---

## 8. 再現性・拡張性

- **1本目専用ハードコードの排除**: すべての可変要素(話者・尺予算・レイアウト・キーワード)は `manifest.json` に外出し。Remotion 側は manifest を解釈するだけの汎用レンダラ。10本は同じコマンドで回る。
- **形式揺れ耐性**: 節の意味で写像 + 欠損 layout スキップ(§6)。
- **将来拡張**: 声の変更=`vv_style_id` 差し替えのみ。テンプレ追加=`layout` 種別と対応コンポーネントを増やすだけ。字幕焼き込み/縦型ショート版は Remotion の別 Composition を足せば同一 manifest から派生可能。**音声バックエンドの差し替え(→プラン02の Style-Bert-VITS2)も `timeline.json` スキーマ互換なので Remotion 側は無改造**で載る。
