# 過去のAI予測の答え合わせ — 調査ノート(2026-07-06 時点)

調査エージェント作成。検索 7 回、本文フェッチ 9 件(成功分)。一次ソース優先。

---

## 1. Leopold Aschenbrenner「Situational Awareness」(2024年6月)の答え合わせ

原文: https://situational-awareness.ai/ (各章フェッチ済み)

### 1.1 原文の主要予測(exact quotes)

- AGI タイムライン: **"AGI by 2027 is strikingly plausible."**(From GPT-4 to AGI 章)。AGI の定義は「自分や友人の仕事を完全自動化できる」「AI研究者/エンジニアの仕事ができる」システム。
- 実効計算量: 2023→2027 で base effective compute を **3〜6 OOM(ベストゲス ~5 OOM)** スケールアップ(物理計算 2-3 OOM + アルゴリズム効率 1-3 OOM(~0.5 OOM/年)+ unhobbling)。
  - "In 2027, a leading AI lab will be able to train a GPT-4-level model in a minute"(2023年は3ヶ月)。
- 2027年像: 単なるチャットボットでなく **"drop-in remote worker"** — 長期記憶、社内オンボーディング、PC操作、数週間規模のプロジェクトを自律遂行。
- 自動AI研究者: "millions of automated researchers could very plausibly compress a decade of further algorithmic progress into a year or less."
- クラスタ規模の予測表(Racing to the Trillion-Dollar Cluster 章、原文の表):

| 年 | OOM | H100換算 | コスト | 電力 |
|---|---|---|---|---|
| 2022 | ~GPT-4 | ~1万 | ~$5億 | ~10 MW |
| 2024 | +1 OOM | ~10万 | $数十億 | ~100 MW |
| 2026 | +2 OOM | ~100万 | $数百億 | ~1 GW |
| 2028 | +3 OOM | ~1000万 | $数千億 | ~10 GW |
| 2030 | +4 OOM | ~1億 | $1兆+ | ~100 GW(米国発電量の>20%) |

- AI収益: 収益6ヶ月倍増の外挿で **$100B ランレート到達は "mid-2026"**。"total AI investment could be north of $1T annually by 2027."
- チップ: 「兆ドルクラスタはTSMCの年間ロジック出力の~100%で賄える」「2030年のAIチップ需要はTSMC現行先端ロジック能力の数倍」。
- 政治面(The Project 章): 2027/28 までに研究所は国家プロジェクトに統合、議会は数兆ドル歳出、輸出規制強化、民主主義連合(Quebec協定型)、オープンソースは後退し独自アルゴリズムが米国の堀になる、実質金利10%超の「債券ショート」。

### 1.2 2026年時点の判定(2つの独立評価より)

ソースA: philippdubach.com「Aschenbrenner's Receipts」(2026年5月頃)
https://philippdubach.com/posts/aschenbrenners-receipts/
ソースB: EA Forum「How did Leopold do?」(2026年3月、フェッチは GreaterWrong ミラー経由)
https://forum.effectivealtruism.org/posts/RuwF8FCfpsLeZRgur/how-did-leopold-do-evaluating-situational-awareness-s

**技術・インフラ系 ≈ 8/10 的中、政治経済系 ≈ 8/10 外れ**(ソースA の総括)。

的中(HIT):
1. **テストタイム計算パラダイム** — o1(2024年10月)、DeepSeek-R1(2025年1月)、extended thinking で検証。
2. **GPQA Diamond 飽和** — 「次の1〜2世代で陥落」→ 実際 ~18ヶ月で GPT-5 88.4%(ツールなし)、Gemini 3.1 Pro 94.3%(ソースA、2026年5月時点)。
3. **電力が律速** — タービン納期6年、データセンター系統電力需要 2025年に+22%(S&P Global、ソースA経由)。
4. **天然ガスによるAI電源** — Meta がガス発電10基(7.5GW)発注、Microsoft-Chevron 西テキサス5GW、新規ガス容量パイプライン250GW+(ソースA)。
5. **湾岸へのチップ移転**(彼は警告したが現実化)— Stargate UAE 5GW 建設中、サウジ HUMAIN に GB300 18,000基、2025年11月に G42/HUMAIN へ 70,000 GB300 認可(ソースA)。
6. **資本動員** — 予測($5000億/年 2026頃、$2兆 2028)を上回るペース。McKinsey は2030年までのDC設備投資 $5.2兆(2025年4月、ソースA)。
7. スケーリング則の持続(部分的中: RLポストトレーニングの比重増は修正要)。
8. アルゴリズム効率 ~0.5 OOM/年 + unhobbling の枠組み。

外れ(MISS):
1. **AI収益 $100B ランレート(2026年央)→ 実際 ~$60B**(ソースB、2026年3月)。約4割未達。
2. **国家プロジェクト化・研究所統合(2027/28)** → 起きず。研究所は分散・競争のまま(国防契約は PPP 型で部分的な「エコー」のみ)。
3. **議会の数兆ドル歳出** → CHIPS法 $39B+$11B のまま。
4. **輸出規制強化 → 逆方向**。AI Diffusion Rule 撤回(2025年5月)、審査は case-by-case へ(2026年1月)、H200級の対中販売を25%レベニュー条件で発表(2025年12月)(ソースA)。
5. **民主主義連合** → 形成されず。米は単独行動、AISI は CAISI に改称(2025年6月)。
6. **封じ込め成功** → DeepSeek-R1 が示す通りアルゴリズムは拡散。
7. **オープンソース後退・独自アルゴリズムの堀** → 逆。中国の独自革新とOSSフロンティアを見落とし(ソースB)。
8. **実質金利10%超** → 2026年5月時点で 2.0〜2.4%(2024年央 ~2% から横ばい)。
9. **AGI by 2027** → 未確定。ソースB: 「半年前は非現実的に見えたが、直近の(特にSWE系)能力ジャンプで再び信憑性が増した」。drop-in remote worker は未実現(ツール使用は on track)。

メタ分析(ソースA): 予測は「経験則が支配する基盤(スケーリング曲線、capex、電力需要)では頑健、連合政治に依存する基盤(選挙、規制、政権)では脆弱」。

---

## 2. AI 2027(Kokotajlo, Lifland ら、2025年4月)の答え合わせ

原文: https://ai-2027.com/ (フェッチ済み)

### 2.1 原文の中間予測(exact quotes)

- Mid-2025: エージェントは "impressive in theory (and in cherry-picked examples), but in practice unreliable"、"struggle to get widespread usage"、最高性能は「月数百ドル」。一方でコーディング/リサーチ特化エージェントは職業を変えつつある。
- Late-2025: OpenBrain の Agent-0 は "trained with 10^27 FLOP"(GPT-4 は 2×10^25)。次は "10^28 FLOP—a thousand times more than GPT-4"。
- Early-2026: Agent-1 の社内利用で "making algorithmic progress 50% faster"。Agent-1 は「注意深い管理の下で活躍する散漫な従業員」。
- Mid-2026: 中国は世界のAI計算量の ~12% を維持、最良モデルは6ヶ月遅れ。「中国AI研究の国有化」で DeepCent 主導集合体に中国AI計算量の ~50% 集中、田湾原発に CDZ 設置。

### 2.2 実績との比較

ソースC: LessWrong「Grading AI 2027's 2025 Predictions」(2026年初頭)
https://www.lesswrong.com/posts/JYGeAAh92hAwvseFk/grading-ai-2027-s-2025-predictions
- **定量指標の進捗は予測ペースの ~65%**。定性予測はおおむね on track。
- SWE-bench Verified: **予測 85%(2025年央)→ 実際 74.5%**(Opus 4.1)。
- OpenAI 年換算収益: **予測 $18B → 実際 ~$20B**(わずかに上振れ)。
- 評価額: $500B 到達は2025年10月(シナリオは6月想定 → 遅れ)。
- 訓練計算量はほぼ on pace。
- 65% ペース補正で「テイクオフは 2028年央〜2030年央」と再推定。

ソースD: LessWrong「AI 2027 Tracker: One Year of Predictions vs. Reality」(2026年4月頃)
https://www.lesswrong.com/posts/oSWae4bE4mqWy5a6Q/ai-2027-tracker-one-year-of-predictions-vs-reality
- 53予測の内訳: **確認 14 / 先行 3 / 順調 10 / 遅れ 4 / 兆候段階 13 / 未検証 9**(確認+先行+順調 = 51%)。
- 特筆パターン: **「リスクが、それを生むはずだった能力より先に到来」** — 自律ゼロデイ発見は Agent-2(2027年初)想定だったが、Claude(Mythos Preview との報)が約1年早く達成(2026年3月頃、二次情報)。

### 2.3 著者自身の更新

- AI Futures Model(2025年12月): https://blog.ai-futures.org/p/ai-futures-model-dec-2025-update / https://www.lesswrong.com/posts/YABG5JmztGGPwNFq2/ai-futures-timelines-and-takeoff-model-dec-2025-update
  - 完全コーディング自動化のタイムラインは AI 2027 のモデルより **3〜5年遅い**方向へ改訂(自動化前の AI R&D 加速に弱気になったのが主因)。Kokotajlo の superhuman AI researcher 中央値は 2031(以前 2030)。
- Q1 2026 Timelines Update: https://www.lesswrong.com/posts/XLLjqMxETva3ABtsK/q1-2026-timelines-update
  - 再び**短縮**: Daniel の Automated Coder 中央値 "from late 2029 to mid 2028"、Eli は mid-2030。TED-AI(トップ専門家超えAI)は Daniel ~2030。
  - 理由: METR Time Horizon 1.1 採用、新モデル(Gemini 3、GPT-5.2、Claude Opus 4.6)、倍増時間の見積り改訂(5.5ヶ月 → Daniel 4.0 / Eli 4.5ヶ月)。
  - 参考実績: Claude Code が公開9ヶ月で年換算 $2.5B(2026年2月上旬)、Anthropic は年10倍成長を継続。
- 要約: **原シナリオ(2027年に superhuman coder)→ 2025年12月に大幅後ろ倒し(2030年代前半)→ 2026年Q1に一部前倒し(2028年央〜2030年央)**と振動しつつ、総じて「AI 2027 より2〜3年遅い」に収束。

### 2.4 参考: Kokotajlo の旧予測「What 2026 Looks Like」(2021)

- Asterisk 誌の検証(https://asteriskmag.substack.com/p/before-he-wrote-ai-2027-he-predicted)では「恐ろしく正確」と評価。外れは「2024年に大幅に大きいモデルは出ない」「チップ不足は緩和」など(実際は大型化継続・不足継続)。新規ファブ立ち上げ速度と AI によるチップ設計の効果を過大評価。

---

## 3. Metaculus の AGI 予測分布の推移(2020→2026)

- 質問3479「Weakly General AI」: https://www.metaculus.com/questions/3479/date-weakly-general-ai-is-publicly-known/(直接フェッチは403、二次ソースで確認)
- 質問5121「First General AI System」: https://www.metaculus.com/questions/5121/

確認できた値:
- **2020年時点: コミュニティ中央値は「約50年先」(≈2070年頃)**(MEXC まとめ、aisafety.info とも整合。「2060→2033」への圧縮と表現するソースも)。
- **2025年10月時点: weakly general AI 中央値 2027年、general AI(強い定義)中央値 2033年**(aisafety.info: https://aisafety.info/questions/5633/When-do-experts-think-human-level-AI-will-be-created)。
- **2026年2月時点: AGI 確率 25% by 2029、50% by 2033(約2,000人の予測者)**(https://www.mexc.com/news/1021446)。
- AI Digest(2026年6月26日時点、https://theaidigest.org/timeline): 「AGI before 2030」38%、「before 2040」72%、「before 2050」83%(Metaculus/Manifold 中央値)。
- 既知の推移(学習知識 + 二次ソース、近似): weak AGI 中央値は 2020年 ~2045-2057 → 2022年前半(Chinchilla/PaLM/Gato 後)~2033 → GPT-4 後(2023) ~2027-2028 → 2024-2026 は 2026-2028 で安定。**注: 曲線グラフからの読み取り・二次情報による近似値**。
- 集約ダッシュボード(Good Heart Labs、2026年7月6日時点): 統合推定 **2031(80%CI: 2027–2044)** https://agi.goodheartlabs.com/
- Samotsvety: 2022年「AGI 32% by ~2042」→ 2026年1月「28% by 2030」(MEXC 経由)。

---

## 4. 専門家サーベイ(AI Impacts ESPAI)の推移

- 2016年調査(Grace et al. 2018, https://arxiv.org/abs/1705.08807): HLMI 50% 到達中央値 **2061年**。
- 2022年 ESPAI(https://aiimpacts.org/2022-expert-survey-on-progress-in-ai/): HLMI 中央値 **2059-2060年**(2016年比ほぼ変化なし、~1年短縮)。
- 2023年 ESPAI(Grace et al. "Thousands of AI Authors on the Future of AI", 回答 2,704〜2,778人, https://wiki.aiimpacts.org/ai_timelines/predictions_of_human-level_ai_timelines/ai_timeline_surveys/2023_expert_survey_on_progress_in_ai): HLMI 50% **2047年** — **1年で13年の短縮**。同調査の「全労働の完全自動化」は 50% で **2116年**(HLMI と 69年の乖離 = フレーミング効果)。
- 対比構造(2026年時点): 研究者サーベイ 2047 ≫ Metaculus 2033 ≫ ラボ内部者・シナリオ作者 2028-2031。予測主体が対象に近いほど短い、の階層は不変。

---

## 5. 実測アンカー: METR タイムホライズン(エージェント信頼性の代理指標)

METR Time Horizon 1.1(2026年1月29日発表, https://metr.org/blog/2026-1-29-time-horizon-1-1/):

| モデル | 50% タイムホライズン | 時期 |
|---|---|---|
| GPT-4 0314 | 3.5分 [1.6-6.9] | 2023-03 |
| GPT-4 1106 | 3.6分 [1.6-7.5] | 2023-11 |
| Claude Sonnet 3.7 | 60分 [32-106] | 2025-02 |
| Claude Opus 4 | 101分 [58-170] | 2025-05 |
| o3 | 121分 [74-201] | 2025-04 |
| GPT-5 | 214分 [117-480] | 2025-08 |
| Claude Opus 4.5 | 320分 [170-729] | 2025-11 |

- 倍増時間: 全期間 196日、2023年以降 131日、**2024年以降 89日**(加速)。2026年2月データでは ~105日とする分析も(X 経由、二次)。
- 2026年3月の最前線モデル(Claude Mythos Preview との報)は **~16時間**とされるが、METR 自身が「16時間超の推定はスイート飽和のため信頼できない」と注記(https://metr.org/time-horizons/ 系、二次情報混在)。
- 含意: AI 2027 の「エージェントは実務では信頼性不足」(mid-2025)は的中したが、ホライズン曲線自体は予測モデルの想定より速く、著者の再前倒しの主因になった。

---

## 6. 過去予測に共通する系統誤差

1. **能力トレンド(ベンチマーク・スケーリング)は当たる、むしろ控えめ**: GPQA 飽和、テストタイム計算、タイムホライズン倍増、capex はいずれも予測どおりか予測超え。直線外挿は「経験則が支配する基盤」では有効(dubach)。
2. **エージェントの経済的信頼性・普及は過大評価**: 「drop-in remote worker」(SA)も superhuman coder 2027(AI 2027)も未達。ベンチマーク→実務の変換係数を高く見積もりすぎる。SWE-bench 85% 予測 vs 74.5%、進捗ペース ~65%。
3. **収益は過大評価(ただし倍率は小さい)**: $100B vs $60B(SA)。一方 OpenAI $18B vs $20B(AI 2027)はほぼ的中 — 短期・単一企業の外挿は当たり、業界合算の指数外挿は外れやすい。
4. **政府・制度の反応速度を大幅に過大評価**: 国有化、数兆ドル歳出、輸出規制強化、国際連合形成はすべて不発。逆に規制は緩和方向へ(Diffusion Rule 撤回、対中販売容認)。「政治は指数曲線に乗らない」。
5. **拡散(オープンソース・中国の独自革新)を過小評価**: DeepSeek-R1 が象徴。アルゴリズムの秘匿可能性・排除可能性を高く見積もりすぎた(SA の構造的誤り)。
6. **リスクの到来順序の読み違い**: AI 2027 Tracker いわく「リスクは、それを生むはずだった能力より先に来ている」(ゼロデイ自律発見が1年早い)。能力→リスクの直列モデルは崩れがち。
7. **遠い予測の粘着と一斉更新**: 専門家サーベイは 2016→2022 でほぼ不動(2061→2059)、GPT-4 で一気に13年短縮(→2047)。アンカリングと「イベント駆動の階段状更新」が支配的で、なめらかなベイズ更新はどの主体もできていない。
8. **予測者の近接バイアス**: ラボ内部者(2027-2031)< 予測プラットフォーム(2033)< 学界サーベイ(2047)の順に長くなる階層が 2016年から一貫。どちらが正しいかは 2026年時点で未決着だが、直近3年は「内部者寄りに世界が動く」年が続いた。

---

## 主要出典一覧

- Situational Awareness 原文: https://situational-awareness.ai/from-gpt-4-to-agi/ / https://situational-awareness.ai/racing-to-the-trillion-dollar-cluster/
- philippdubach 検証(2026年5月頃): https://philippdubach.com/posts/aschenbrenners-receipts/
- EA Forum 検証(2026年3月): https://forum.effectivealtruism.org/posts/RuwF8FCfpsLeZRgur/how-did-leopold-do-evaluating-situational-awareness-s
- AI 2027 原文: https://ai-2027.com/
- Grading AI 2027's 2025 Predictions: https://www.lesswrong.com/posts/JYGeAAh92hAwvseFk/grading-ai-2027-s-2025-predictions
- AI 2027 Tracker(1年後検証): https://www.lesswrong.com/posts/oSWae4bE4mqWy5a6Q/ai-2027-tracker-one-year-of-predictions-vs-reality
- Q1 2026 Timelines Update(著者更新): https://www.lesswrong.com/posts/XLLjqMxETva3ABtsK/q1-2026-timelines-update
- AI Futures Model Dec 2025: https://blog.ai-futures.org/p/ai-futures-model-dec-2025-update
- METR Time Horizon 1.1: https://metr.org/blog/2026-1-29-time-horizon-1-1/
- Metaculus: https://www.metaculus.com/questions/3479/ / https://www.metaculus.com/questions/5121/(403のため二次確認)
- aisafety.info まとめ: https://aisafety.info/questions/5633/When-do-experts-think-human-level-AI-will-be-created
- AI Impacts 2023 ESPAI: https://wiki.aiimpacts.org/ai_timelines/predictions_of_human-level_ai_timelines/ai_timeline_surveys/2023_expert_survey_on_progress_in_ai
- AI Impacts 2022 ESPAI: https://aiimpacts.org/2022-expert-survey-on-progress-in-ai/
- Grace et al. 2016/2018: https://arxiv.org/abs/1705.08807
- AGI ダッシュボード: https://agi.goodheartlabs.com/ / https://theaidigest.org/timeline
- Kokotajlo 2021 予測の検証: https://asteriskmag.substack.com/p/before-he-wrote-ai-2027-he-predicted

注: 2026年の一部固有名詞(Claude Mythos Preview、GPT-5.2、Gemini 3.1 等)および Metaculus の歴史的中央値の一部は二次ソース経由であり、本文中に「二次情報」「近似」と明記した。
