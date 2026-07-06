# 調査ノート: 計算資源・データセンタ投資・半導体供給 (2024〜2026)

調査日: 2026-07-06。学習知識は2026年1月まで。以降の数値はすべて Web 検索・フェッチで確認。

---

## 1. ハイパースケーラー AI capex(実績と計画)

### 年別サマリ(暦年、財務レポートベース)

| 会社 | CY2024 実績 | CY2025 実績 | CY2026 計画 |
|---|---|---|---|
| Amazon | 約$83B | 約$131B(ガイダンス$125Bを超過) | 約$200B |
| Microsoft | 約$56B(FY24) | FY25(2024/7-2025/6)約$80B超 | 暦年$190B |
| Alphabet | $52.5B | 約$90-91B | 最大$180-190B |
| Meta | $39.2B(リース元本含む) | $69B | $125-145B(引き上げ後) |
| 4社合計 | 約$230B | 約$410B | 約$690-725B(前年比+77%) |

- 4社2026年計画合計 ~$725B、前年$410Bから+77%: Tom's Hardware https://www.tomshardware.com/tech-industry/big-tech/big-techs-ai-spending-plans-reach-725-billion (2026)
- Amazon 2025実績 ~$131B、2026計画 ~$200B: CNBC https://www.cnbc.com/2026/02/05/amazon-amzn-q4-earnings-report-2025.html (2026-02)
- Meta 2024 $39.23B(8-K)https://www.sec.gov/Archives/edgar/data/0001326801/000132680125000014/meta-12312024xexhibit991.htm、2025 $69B、2026を$115-135B→$125-145Bへ引き上げ(部材価格上昇・DC追加費用が理由): Tom's Hardware 上記 (2026)
- Microsoft 暦年2026 capex $190B(アナリスト予想比+23%)、FY26Q3(2026年1-3月)四半期capex $30.88B(+84% YoY): Yahoo Finance https://finance.yahoo.com/markets/stocks/articles/microsofts-capex-spending-2026-23-135000219.html、CFO Dive https://www.cfodive.com/news/microsoft-capex-exceed-30b-quarter-cfo-ai/756522/
- アナリストは2027年に大手tech capex $1T超えを予想(推定): Tom's Hardware 上記
- 注: CY2024の Microsoft/Amazon の値は各社決算(会計年度差あり)からの推定を含む。実測(会社報告)は Meta $39.2B、Alphabet $52.5B。

### AI ラボ(非上場)側のコミットメント

- OpenAI: Altman は8年で約$1.4Tのインフラコミットメントと発言(2025年秋)→ 2026年5月報道では2030年までの総コンピュート支出目標を約$600Bに縮小、自社保有から賃借中心へ: TechTimes https://www.techtimes.com/articles/316807/20260519/openai-cut-stargates-spending-pledge-14-trillion-600-billion-now-renting-what-it-vowed-build.htm (2026-05、報道ベース・推定)
- Oracle-OpenAI 契約は5年約$300B規模(2025-09発表): https://intuitionlabs.ai/articles/oracle-openai-300b-deal-analysis
- Anthropic(一次ソース、2026-05-06発表): SpaceX の Colossus 1 の全キャパシティ利用契約(300MW超、1か月以内に NVIDIA GPU 22万基超)。既存分: Amazon 最大5GW(2026年末までに約1GW)、Google/Broadcom 5GW(2027年開始)、Microsoft/NVIDIA との Azure $30B、Fluidstack と$50Bの米国AIインフラ投資: https://www.anthropic.com/news/higher-limits-spacex
- TechCrunch (2026-05-20): Anthropic はコンピュート対価として xAI(SpaceX傘下)に月$1.25Bを支払うと報道: https://techcrunch.com/2026/05/20/anthropic-will-pay-xai-1-25-billion-per-month-for-compute/ (報道ベース)
- Anthropic は2026年2月に$30B調達、post $380B評価(報道): https://www.gradually.ai/en/openai-statistics/ ほか
- xAI: Memphis Colossus に約$18B投下、GPU約55.5万基(2026-02時点): Introl https://introl.com/blog/xai-colossus-2-gigawatt-expansion-555k-gpus-january-2026

---

## 2. NVIDIA データセンタ売上と GPU 出荷規模

### 四半期別データセンタ売上(単位: $B、会社発表=実測)

| 四半期(暦おおよそ) | DC売上 | YoY |
|---|---|---|
| FY25Q1 (2024/1-4) | 22.6 | +427% |
| FY25Q2 (2024/5-7) | 26.3 | +154% |
| FY25Q3 (2024/8-10) | 30.8 | +112% |
| FY25Q4 (2024/11-2025/1) | 35.6 | +93% |
| FY26Q1 (2025/2-4) | 39.1 | +73% |
| FY26Q2 (2025/5-7) | 41.1 | +56% |
| FY26Q3 (2025/8-10) | 51.2 | +66% |
| FY26Q4 (2025/11-2026/1) | 62.3 | +75% |
| FY27Q1 (2026/2-4) | 75.2 | +92% |

- FY2026 通期売上 $215.9B(+65% YoY)、DC通期約$193.7B。FY27Q1 総売上 $81.6B、FY27Q2 ガイダンス $91.0B(±2%)。「中国向けDCコンピュート売上はゼロと仮定」と明言。
- 出典(一次): NVIDIA newsroom Q3 FY26 https://nvidianews.nvidia.com/news/nvidia-announces-financial-results-for-third-quarter-fiscal-2026(2025-11)、Q1 FY27 https://nvidianews.nvidia.com/news/nvidia-announces-financial-results-for-first-quarter-fiscal-2027(2026-05)、SEC 8-K q4fy26pr.htm(403のため検索経由で確認)
- Q3 FY26 で Jensen Huang「Blackwell sales are off the charts, cloud GPUs are sold out」。
- FY25 以前の四半期値は NVIDIA 決算リリース(学習知識+検索で整合確認)。

### GPU 出荷規模(アナリスト推定)

- JP Morgan 推定: Blackwell 2025年 520万基 → 2026年 180万基、Rubin 2026年 570万基 + Vera CPU 150万基: TweakTown https://www.tweaktown.com/news/106116/ (推定)
- 一方 TrendForce 系報道は Rubin 遅延で2026年ハイエンド出荷の70%超は依然 Blackwell と予測(推定、相互に矛盾あり): https://iconnect007.com/article/149537/
- Colossus 実例: 55.5万基で約$18B → 1基あたり約$32k(システムレベルでは更に高い)。

---

## 3. TSMC: CoWoS・先端ノードの制約

### CoWoS 能力の推移(月産ウェハ枚数、業界推定)

| 時点 | 能力 (wpm) |
|---|---|
| 2023年末 | ~13,000 |
| 2024年末 | ~35,000 |
| 2025年末 | ~75,000 |
| 2026年末(計画) | 120,000-130,000 |

- 出典: TrendForce https://www.trendforce.com/news/2025/01/02/news-tsmc-set-to-expand-cowos-capacity-to-record-75000-wafers-in-2025-doubling-2024-output/ (2025-01)、Silicon Analysts https://siliconanalysts.com/market-data/cowos-capacity、FinancialContent 2026-02 記事(130k wpm 目標)
- OSAT(Amkor 等)の追加分 50,000-60,000 wpm を含めると業界全体で ~200,000 wpm に接近(2026年末、推定)。
- CoWoS 需給ギャップは現在約20%不足 → 2026年末に約10%へ縮小見込み: TrendForce https://www.trendforce.com/news/2026/06/15/ (2026-06、推定)
- 2年続いた「パッケージング律速」で AIサーバのリードタイムは一時50週超。

### TSMC 業績・ノード(2026年時点、会社発表)

- Q1 2026 売上 $35.9B(QoQ +6.4%)、粗利率66.2%。Q2 2026 ガイダンス $39.0-40.2B(+10% QoQ)。
- HPC(AI含む)が Q1 2026 でミックスの61%(2025通年58%)。2026年は60%超へ。
- N2(2nm)は2026年3月から売上寄与開始、新竹・高雄で多段階ラン プ中。
- 2026年 capex は $52-56B レンジの上限方向。70-80%が先端プロセス向け。
- 出典: MacroMicro 決算まとめ https://en.macromicro.me/blog/tsmc-q1-earnings-call-rare-capacity-expansion-as-the-ai-megatrend-takes-shape、Investing.com transcript https://www.investing.com/news/transcripts/earnings-call-transcript-tsmcs-q1-2026-shows-strong-growth-and-margin-gains-93CH-4617167 (2026-04)

---

## 4. 対中チップ輸出規制(2025-2026の変更点)

時系列:
1. 2025-04: 商務省が H20 を輸出規制対象化(それまで H20 は2024年に$12-15Bの対中売上)。
2. 2025-07〜08: 方針反転。Trump 政権は H20 輸出ライセンスを許可、条件として対中売上の15%を米政府に納付。
3. 2025-12: H200 へ拡大方針を表明(納付率25%、AMD/Intel も同様の枠組み)。
4. 2026-01-14: 大統領布告で25%の課金を正式化。BIS は H200 / AMD MI325X 級をセキュリティ要件付きケースバイケース審査へ。
5. 2026: 商務省が Alibaba・Tencent・ByteDance など約10社の中国企業に H200 購入を認可、1社あたり上限75,000基。実際に NVIDIA は82,000基の対中出荷を準備と報道。
6. ただし NVIDIA 自身は FY27Q2 ガイダンスで「中国DCコンピュート売上ゼロ」を前提(規制・中国側の国産化圧力の不確実性)。

- 出典: Lawfare https://www.lawfaremedia.org/article/trump-s-illegal-ai-chip-export-controls--and-who-can-challenge-them、Brookings https://www.brookings.edu/articles/ball-games-over-the-us-is-out-of-the-ai-chip-market-in-china/、BIS https://www.bis.gov/press-release/department-commerce-revises-license-review-policy-semiconductors-exported-china、Tom's Hardware https://www.tomshardware.com/tech-industry/semiconductors/nvidia-prepares-h200-shipments-to-china-as-chip-war-lines-blur、CRN Asia https://www.crnasia.com/news/2026/components-and-peripherals/trump-greenlights-nvidia-h200-chip-sales-to-china-after-mont

---

## 5. フロンティアモデルの学習計算量とコスト(Epoch AI 中心、推定)

- 既知最大の学習ラン: Grok 4 ~5e26 FLOP。
- GPT-5: ~5e25 FLOP(事前学習+RL 込み、Epoch 推定)。GPT-4 (~2e25) の2倍超だが GPT-4.5 (>1e26) より小さい。「最大モデル=最新モデル」が崩れた例。
- フロンティアモデルの学習コストは2020年以降 年率3.5倍、学習計算量は年率5倍で成長。トレンド継続なら2027年までに$1B超の学習ランが出現(Epoch 予測)。
- 過去実測/推定コスト: GPT-4 ~$40M(公表ベース最大級)、Gemini Ultra ~$30M、Llama 3.1 405B ~$170M(Meta推定)、Grok-2 ~$107M(報道)。
- 最終学習ランは R&D 計算支出の少数派: OpenAI の2024年コンピュートの大半は実験(research)に消費(Epoch)。
- 1e25 FLOP 超(GPT-4級)のモデルはすでに30本以上(2025時点)。
- 出典: Epoch AI https://epoch.ai/blog/how-much-does-it-cost-to-train-frontier-ai-models、https://epochai.substack.com/p/notes-on-gpt-5-training-compute、https://epoch.ai/data-insights/models-over-1e25-flop、https://epoch.ai/data-insights/openai-compute-spend、arXiv https://arxiv.org/html/2405.21015v2

---

## 6. メガDC計画の進捗(スターゲート等)— 実際に建ったのか

### Stargate(OpenAI/Oracle/SoftBank、$500B構想)— Epoch AI 2026-04-17 時点

| サイト | 州 | 計画GW | 稼働GW | GPU換算 | 完成予定 |
|---|---|---|---|---|---|
| Abilene | TX | 1.2 | 0.3(2026-05末に0.6へ) | 25万(現在)→100万 | 2026 Q4 |
| Shackelford County | TX | 2.0 | 0 | 420万 | 2028 Q4 |
| Doña Ana County | NM | 2.2 | 0 | 460万 | 2028 Q4 |
| Milam County | TX | 1.2 | 0 | 250万 | 2028 Q4 |
| Port Washington | WI | 1.3 | 0 | 260万 | 2028 Q4 |
| Saline Township | MI | 1.4 | 0 | 290万 | 2028 Q4 |
| Lordstown | OH | <0.3 | 0 | <30万 | 不明 |

- 合計9GW超を2029年までに計画。稼働は Abilene のみ(8棟中4棟)。
- Abilene の2.1GWへの拡張(+600MW)は中止、OpenAI 利用は1.2GWで頭打ち。隣接900MWサイトは Microsoft が Crusoe と契約。
- 出典(一次に近い専門機関): Epoch AI https://epoch.ai/publications/openai-stargate-where-the-us-sites-stand (2026-04-17)。補助: Data Center Knowledge https://www.datacenterknowledge.com/ai-data-centers/stargate-update-ai-s-biggest-data-center-buildout-meets-reality
- 判定: 「建った」のは計画9GW超のうち0.3-0.6GW(約5%)。土地・建設は全サイトで進行中だが、$500B/10GW は依然ほぼ計画段階。OpenAI は支出誓約を$1.4T→$600Bに縮小と報道(2026-05)。

### xAI Colossus(Memphis)

- Colossus 1: 2024年に122日で H100 10万基稼働 → 92日で20万基へ倍増(実績)。
- 2026-02時点: 複合施設で GPU 約55.5万基(H100/H200/GB200)、投資約$18B、グリッド受電300MW。2026-01に3棟目購入で総計画2GWへ。ガスタービン 1.1GW超が2027 Q2までに稼働予定(Solaris)。
- 出典: Introl https://introl.com/blog/xai-colossus-2-gigawatt-expansion-555k-gpus-january-2026、SemiAnalysis https://newsletter.semianalysis.com/p/xais-colossus-2-first-gigawatt-datacenter、Wikipedia https://en.wikipedia.org/wiki/Colossus_(data_center)

---

## 7. 残る論点(open questions)

- 2026年後半の Rubin ランプ実態(JPM「570万基」vs TrendForce「遅延・Blackwell主体」の矛盾)。
- OpenAI の $1.4T→$600B 縮小報道の正確性(一次確認未取得)。
- HBM・メモリ価格の高騰が capex に与える影響の定量値(Meta が言及)。
- 電力供給(タービン・系統接続)が2027年以降の実効ボトルネックになる度合い。
- 中国国産アクセラレータ(Huawei Ascend 等)の実出荷量。
