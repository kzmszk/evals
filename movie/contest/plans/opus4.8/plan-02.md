# プラン02: 表現力優先 — Style-Bert-VITS2 × 強制アラインメント × Remotion

> 設計者: opus4.8 / 位置づけ: **表現力を最優先する"看板回"向けの上位ライン**
> 一言: 声の演技力(感情・自然さ)でプラン01を上回る代わりに、timing を TTS から直接得られないので **正解テキスト既知の強制アラインメント(forced alignment)** で厳密な語単位タイムスタンプを復元する。前段(manifest)と後段(Remotion)はプラン01と**完全共有**。

本ドキュメントはプラン01と共通の部分を繰り返さない。**差分は「音声合成」と「同期データ生成」の2工程のみ**。それ以外(台本化・manifest スキーマ・Remotion レンダラ・人間関与①③・再現性設計)はプラン01を参照。

---

## 1. なぜ別ラインが要るか(プラン01との棲み分け)

VOICEVOX はキャラクター声で「楽しく気楽」には最適だが、しっとりした導入や感情の起伏(「督促状が来なくなった借金ほど怖い」的な語り)では、より人間に近い抑揚が欲しい回がある。**Style-Bert-VITS2(JP-Extra)は現状のオープン日本語 TTS で自然さ・感情表現の評価が最も高い**部類で、`Happy`/`Sad` 等のスタイル指定と感情豊かな読みができる([出典](https://github.com/litagin02/Style-Bert-VITS2))。RTX 4090 のローカル推論で商用利用も可能。

代償として、Style-Bert-VITS2 は VOICEVOX のようなモーラ長メタデータを API で返さない。そこで **「合成音声 + 既知の台本テキスト」を突き合わせる強制アラインメント**で語・音素単位のタイムスタンプを外挿する。これはプラン01の「TTS ネイティブ timing」を、アラインメント工程で置換する構図。

---

## 2. アーキテクチャ差分

```
manifest.json  (プラン01と同一スキーマ)
      │
      │ ②' 音声合成: Style-Bert-VITS2 (RTX 4090 / Windows)
      ▼
 per-scene WAV × N
      │
      │ ③' 強制アラインメント: 台本既知 → 語タイムスタンプ復元 (RTX 4090)
      ▼
 narration.wav + timeline.json   ← ★スキーマはプラン01と互換
      │
      ▼
 ④ Remotion (Mac) — プラン01と同一レンダラ、無改造
      ▼
 output.mp4
```

**機材の役割分担(ここは明確な理由がある):**
- **Windows / RTX 4090**: Style-Bert-VITS2 の GPU 推論とアラインメントを担当。JP-Extra モデルは VRAM 数 GB 程度で 24GB に余裕で収まる。バッチで10本の全シーンを合成。
- **MacBook Pro (M1 Pro)**: Remotion レンダリングと最終 QA。GPU 推論を Mac に載せない=分業の必然性がある(プラン01は1台完結だったが、こちらは表現力のために GPU 機を積極利用する、という使い分けの理由が立つ)。
- 中間ファイル(WAV・timeline.json)は共有フォルダ / rsync / git-lfs で Mac へ受け渡す。

---

## 3. ②' 音声合成(Style-Bert-VITS2)

Windows 側で API サーバを起動し、シーンごとに話者(モデル)とスタイルを指定して合成。

```bash
# RTX 4090 機で API サーバ起動
python server_fastapi.py           # → http://localhost:5000

# scene ごとに合成 (話者=モデル, style=感情, style_weight=強度)
curl -s "localhost:5000/voice?text=6時間睡眠を2週間。&model_id=0&speaker_id=0&style=Neutral&style_weight=1.0&length=1.0" \
  --output s07.wav
```

- 2話者は**モデルを分ける**(男女別 or 別キャラの学習済みモデル)。JVNV コーパス由来の感情ラベル付きモデルなら `style` で回ごとの温度感を変えられる。
- `length` パラメータで話速、句読点で間を制御。掛け合いの間はプラン01同様、③'で無音を挿入。
- クラウド代替(GPU を使いたくない/さらに高品質を狙う場合): **ElevenLabs v3** または **Azure AI Speech(日本語 Neural, 多数の話者)**。いずれも会話用途に十分な自然さ。この場合機材は Mac 1台でよい(合成はクラウド、アラインメントは whisperX を Mac CPU/軽量 GPU or クラウドで)。

## 4. ③' 同期データ生成(強制アラインメント)

**ここが本プラン固有の同期メカニズム。** ポイントは「聞き起こし(recognition)ではなく、既に正解テキスト(manifest の `line`)を持っているので、テキストと音声の対応付け(alignment)問題として解く」こと。認識ではないのでハルシネーションが原理的に起きず、精度が高い。

推奨は用途に応じ2択:
- **aeneas / Montreal Forced Aligner(MFA)**: 正解テキストありの強制アラインメント専用。語・音素境界を高精度で返す。テキスト既知の本ケースに最適。
- **WhisperX(`--align`)**: Whisper 転写に wav2vec2 で語単位アライン層を足す。手軽で 4090 上で高速。日本語対応。

処理は各シーン WAV に対しアラインを掛け、`line` 中の `keywords` 語の開始 ms を取得 → プラン01と**同一スキーマ**の `timeline.json` を吐く:

```python
# 概念: WhisperX の word segments から keyword の発話時刻を拾う
import whisperx, soundfile as sf, json
model_a, meta = whisperx.load_align_model(language_code="ja", device="cuda")
cursor, clips, tl = 0.0, [], []
for sc in scenes:
    wav, sr = sf.read(f"{sc['id']}.wav")
    dur_ms = len(wav)/sr*1000
    seg = whisperx.align(transcribe_stub(sc["line"]), model_a, meta, f"{sc['id']}.wav", "cuda")
    highlights = [{"kw": k, "ms": round(cursor + w["start"]*1000)}
                  for k in sc["visual"]["keywords"] for w in seg["word_segments"] if k.startswith(w["word"])]
    tl.append({"id": sc["id"], "start_ms": round(cursor), "end_ms": round(cursor+dur_ms), "highlights": highlights})
    cursor += dur_ms + sc.get("pause_after_ms", 250)
json.dump({"fps":30,"clips":tl}, open("timeline.json","w"), ensure_ascii=False, indent=2)
```

**尺揺れ問題**: プラン01同様、シーン尺は WAV 実測(`len/sr`)で確定。アラインメントは**シーン内のキーワード位置決めにだけ**使い、シーン尺そのものには介入しない → アライン誤差がスライド切替タイミングに波及しない設計。会話の間はプラン01と同じく無音挿入。

---

## 5. 人間の関与ポイント(プラン01 + 1点追加)

プラン01の①manifest レビュー / ③最終 QA はそのまま。②音声スポットチェックは**アラインメント確認を兼ねる**形に拡張:
- 誤読チェック(プラン01同様)に加え、**キーワード highlight のタイミングが発話とズレていないか**を Remotion Studio プレビューで数点確認。ズレる代表原因は長い英語専門語・数字で、そこだけ手動で ms を補正 or 一括表示にフォールバック。
- 感情スタイル(`style`)の当たり外れも耳で確認。回の温度感に合わなければ manifest の話者設定を変えて再合成。

## 6. コスト概算(プラン01との差分)

| 項目 | プラン02 |
|---|---|
| 動画1本 (ローカル Style-Bert-VITS2 経路) | 電気代 + LLM 台本数十円 ≈ **実質 100円未満**。合成+アラインで 4090 を数分〜十数分 |
| 動画1本 (ElevenLabs 経路) | 5分尺 ≈ 日本語 4000〜5000 字 → 音声 API 従量で **概ね数百円〜千円台/本**(プランに依存)。GPU 不要 |
| 初期構築 | プラン01の Remotion テンプレを流用。追加は Style-Bert-VITS2 環境構築 + アラインメント配線で **実働 +2〜3日** |

トレードオフ: プラン01比で「声の質・感情表現↑」「同期が実測+推定の二層で堅牢さは同等」「ただし工程数・GPU 依存・セットアップ手間↑、1本あたり時間とコストも↑」。**日常量産はプラン01、勝負回のみプラン02**が費用対効果の最適点。

## 7. リスク差分

| リスク | 対策 |
|---|---|
| Style-Bert-VITS2 の感情スタイルが過剰/不安定 | `style_weight` を控えめ(0.6〜0.8)に既定化。回ごとに人間②で確認 |
| アラインメントの語境界ズレ(長い英語・数字) | 強制アライン(MFA/aeneas)を第一選択にし recognition 誤りを排除。閾値超のズレは一括表示へフォールバック |
| 2台間のファイル受け渡し運用の煩雑さ | 共有フォルダ/rsync を手順書化。中間成果物はすべてファイルなので工程分割に耐える |
| クラウド TTS のコスト膨張(ElevenLabs 経路) | 従量課金を1本あたりで monitor。量産はローカル経路に寄せ、クラウドは看板回限定 |

## 8. ロードマップ差分

プラン01完成(Remotine テンプレ + manifest パイプライン)を前提に、
- **+Day1**: Style-Bert-VITS2 を 4090 にセットアップ、2話者モデル選定、`manifest→WAV` を差し替え実装。
- **+Day2**: 強制アラインメント(MFA or WhisperX)配線 → 同一スキーマ `timeline.json` 生成。sleep-01 をプラン02経路で render しプラン01版と AB 比較。
- **+Day3**: 感情スタイルのプリセット化、2台運用の手順書、キーワード timing 補正 UI の微調整。

**プラン01基盤があれば追加 実働2〜3日**でプラン02経路が立ち上がる(スキーマ互換の恩恵)。
