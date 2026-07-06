# 調査ノート: LLM系AIの能力トレンド (2022〜2026)

調査日: 2026-07-06。学習知識カットオフ(2026-01)以降の数値はすべて Web 検索・フェッチで確認。

## 1. 主要ベンチマークの飽和と推移

### MMLU / GPQA — 飽和
- MMLU / MMLU-Pro はフロンティアモデルで 88% 超に飽和、上位の差は統計的に無意味(2026年時点)。
  - 出典: https://benchlm.ai/knowledge (2026)
- GPQA Diamond: GPT-4 (2023) ~36% → o1 (2024末) ~78% → 2026年4月時点で GPT-5.4 が 92%、Gemini 3.1 Pro 94.1%。上位では飽和に接近。
  - 出典: https://benchlm.ai/knowledge / https://lmcouncil.ai/benchmarks

### SWE-bench Verified — 4年で <5% → 95%
- 2023(SWE-bench 原論文): 最良モデル解決率 2%未満。
- 2024-08 Verified 公開(500問、OpenAI が人手検証)。GPT-4o ~33%(2024, 実測)。
- Claude 3.5 Sonnet ~49%(2024-10)、Claude 4 Opus ~72.5%(2025-05)、Claude Opus 4.5 ~80%台(2025-12)。(カットオフ前知識、概数)
- 2026-04: Claude Opus 4.7 87.6%、GPT-5.3-Codex 85.0%、Gemini 3.1 Pro 80.6%。
  - 出典: https://tokenmix.ai/blog/swe-bench-2026-claude-opus-4-7-wins
- 2026-07-04 時点: Claude Mythos 5 95.5%、Claude Fable 5 95.0%、Claude Opus 4.8 88.6%、GPT-5.5 82.6%。実質飽和領域へ。
  - 出典: https://llm-stats.com/benchmarks/swe-bench-verified / https://benchlm.ai/benchmarks/sweVerified
- 後継として SWE-bench Pro: Opus 4.8 が 69.2%(2026)。https://www.morphllm.com/swe-bench-pro

### ARC-AGI-2 — 20ヶ月で 0.1% → 83〜85%
- 2025年前半のフロンティア初期スコアはほぼ 0〜数%。
- 2026年: GPT-5.5 85%、GPT-5.4 Pro 83.3%、Gemini 3.1 Pro 77.1%。「20ヶ月で 0.1→83.3」。
  - 出典: https://agentmarketcap.ai/blog/2026/04/06/arc-agi-2-leaderboard-2026-gemini-gpt5-claude-reasoning-benchmark / https://llm-stats.com/benchmarks/arc-agi-v2
- ARC-AGI-3(エージェント型)が 2026 年に公開され次の壁に。https://arxiv.org/pdf/2603.24621

### FrontierMath(Epoch AI)
- 2024-11 公開時: 最良モデル 2%未満。o3 発表(2024-12)で ~25%。
- 2026-05-27 時点(v1): GPT-5.5 Pro 52.4%、GPT-5.5 51.7%、GPT-5.4 Pro 50%。
- 2026-06-12 に v2 公開(監査で旧問題の42%に軽微だが致命的な誤りが発覚し修正)。v2 Tiers 1–3: GPT-5.5 Pro 87.7%±1.9、Claude Fable 5 87.0%±2.0 でほぼ同率首位。Tier 4(研究水準)は Fable 5 が約10ポイントリード。
  - 出典: https://epoch.ai/frontiermath / https://lmcouncil.ai/benchmarks / https://www.digitalapplied.com/blog/epoch-frontiermath-v2-error-corrected-ai-benchmark-analysis
  - 注意: v1→v2 でスコアの連続性なし。

### Humanity's Last Exam (HLE)
- 2025-01 公開(2,500問、約1,000人の専門家が作成、2026-01 に Nature 掲載)。公開時の最良スコアは一桁%。
- 2026-07 時点: Claude Mythos Preview が 64.7% で首位(88モデル中)。人間専門家平均 ~90% とのギャップは残る。
  - 出典: https://llm-stats.com/benchmarks/humanity's-last-exam / https://agi.safe.ai/

## 2. METR タスク長ホライズン(一次ソース)

- 手法: 「AIが50%の成功率でこなせるタスクを人間専門家がやると何分かかるか」。
- Time Horizon 1.1(2026-01-29 発表、タスク数 170→228、8時間超タスク 14→31)での 50% ホライズン実測値:
  - GPT-4 0314 (2023-03): 3.5 分 [1.6–6.9]
  - GPT-4 1106 (2023-11): 3.6 分 [1.6–7.5]
  - Claude Sonnet 3.7 (2025-02): 60 分 [32–106]
  - Claude Opus 4 (2025-05): 101 分 [58–170]
  - o3 (2025-04): 121 分 [74–201]
  - GPT-5 (2025-08): 214 分 [117–480]
  - Claude Opus 4.5 (2025-11): 320 分 [170–729]
  - 出典: https://metr.org/blog/2026-1-29-time-horizon-1-1/
- 2026年前半モデル: Claude Opus 4.6 の 50% ホライズンは約12時間(~720分)と報告(二次情報、METR公式ページは「16時間超の測定は現行タスクスイートでは信頼できない」と注記)。
  - 出典: https://metr.org/time-horizons/ / https://medium.com/@AIchats/are-ai-time-horizons-still-doubling-every-7-months-6262ed2bcc6a
- 倍増周期: 2019–2025 全期間で約7ヶ月(212日)。post-2023 は TH1.0 で 165日、TH1.1 で 131日(約4.3ヶ月)。2024–2025 は約4ヶ月との推計も。
  - 出典: https://metr.org/blog/2026-1-29-time-horizon-1-1/ / https://theaidigest.org/time-horizons
- METR 自身が限界を明記(2026-01-22): ホライズンはソフトウェアタスク中心で、実世界の雑多なタスクへの外挿には注意。https://metr.org/notes/2026-01-22-time-horizon-limitations/

## 3. Epoch AI: 学習計算量・アルゴリズム効率

- フロンティアモデルの学習計算量: 2010–2024 で年 4–5 倍、2018 以降のフロンティアは年約4倍。2030 年まで年4倍の継続は電力 5GW 超を要するが可能との分析。
  - 出典: https://epoch.ai/publications/training-compute-of-frontier-ai-models-grows-by-4-5x-per-year
- フロンティア LLM の学習計算は 2020 年以降 年5倍(5.2ヶ月で倍増)との表現も(Epoch trends)。https://epoch.ai/trends
- 学習に要する電力は年2倍で増加。https://epoch.ai/data-insights/power-usage-trend
- オープンウェイトモデルも年 ~4.7 倍で拡大、2025-11 頃に 1e26 FLOP 超え予測(90%CI: 2025-08〜2026-11)。https://epoch.ai/data-insights/open-models-threshold
- アルゴリズム効率(事前学習): 同一性能に必要な計算が約8ヶ月で半減 ≒ 年3倍の効率改善(推定レンジ 1.8〜5.3倍/年)。
  - 出典: https://epoch.ai/blog/algorithmic-progress-in-language-models / https://epoch.ai/trends

## 4. 推論モデル以降のパラダイム変化・RL スケーリング

- 2024-09 o1 で「推論(思考トークン)+RL」パラダイムが本格化。o3 は o1 の約10倍の推論(RL)計算で訓練との証拠。
  - 出典: https://epoch.ai/gradient-updates/how-far-can-reasoning-models-scale
- Dario Amodei(2025-01): 「RL 段階への支出はまだ小さく、各社が数億〜数十億ドル規模に拡大中。新パラダイムがスケーリング曲線の初期にある特異な交差点」。
- RL 計算のスケーリングは事前学習より情報効率が悪い(1 FLOP あたりの学習情報が 1/10,000 未満)との分析、推論時スケーリング100倍相当の効果を得るのに RL 計算 ~10,000倍が必要との試算(Toby Ord)。RL 後学習にはべき則+飽和傾向(2026 論文)。
  - 出典: https://www.tobyord.com/writing/how-well-does-rl-scale / https://arxiv.org/pdf/2510.13786 / https://arxiv.org/pdf/2509.25300
- 帰結: 2025〜2026 の能力向上は「事前学習スケール」より「RL 後学習+推論時計算+エージェント足場(メモリ、長時間自律実行)」が主駆動。ARC-AGI-2 の 20ヶ月 0.1→83% や METR ホライズン倍増の加速(7→4ヶ月)はこのパラダイムの成果。

## 5. トークン単価の下落(同等能力あたり)

- Epoch AI: 固定性能水準を達成する推論価格は年 9〜900 倍の幅で下落、中央値 年50倍(約2ヶ月で半減)。2024-01 以降のデータのみでは中央値 年200倍に加速。
  - GPT-4 水準の GPQA 性能: 年40倍で下落。Claude 3.5 Sonnet 水準の GPQA Diamond 評価コスト: 年200〜400倍の下落。
  - 出典: https://epoch.ai/data-insights/llm-inference-price-trends
- 補助: a16z「LLMflation」— 同等性能の推論コストは年 ~10倍下落(保守的な系列)。https://a16z.com/llmflation-llm-inference-cost/
- 注意: フラッグシップの絶対価格は下がっていない(Fable 5 は $10/$50 per Mtok で Opus 4.8 の2倍)。下落は「同等能力あたり」の話で、需要側はより高能力・長い思考トークンに支出をシフト(総支出は増加)。

## 6. 2026年前半の最前線モデルと研究エンジニアリング自動化

### フロンティアモデル(2026-07 時点)
- Anthropic: Claude Fable 5 / Claude Mythos 5(2026-06-09 リリース)。Fable 5 は一般提供、Mythos 5 は同一モデルでセーフガードを一部解除し政府連携(Project Glasswing)下で限定提供。価格 $10/$50 per Mtok。CBRN・サイバー等の要注意クエリは Opus 4.8 が代理応答(セッションの5%未満)。
  - SWE-bench Verified 95.0%(Mythos 95.5%)、HLE 64.7%(Mythos Preview)、FrontierMath v2 Tiers1-3 87.0%。創薬設計の一部工程を約10倍加速、14標的中9つで有望候補。Mythos 5 は約1週間の自律作業でゲノミクス新規研究を実施。
  - 出典: https://www.anthropic.com/news/claude-fable-5-mythos-5 / https://www.cnbc.com/2026/06/09/anthropic-mythos-claude-fable-5.html
- OpenAI: GPT-5.5 / GPT-5.5 Pro(ARC-AGI-2 85%、FrontierMath 首位級、SWE-bench Verified 82.6%)。
- Google: Gemini 3.1 Pro(GPQA Diamond 94.1%、ARC-AGI-2 77.1%)。
- 傾向: コーディング/長時間エージェントは Claude 系、抽象推論(ARC-AGI-2)は GPT 系が首位という「軸による棲み分け」。

### 研究エンジニアリング自動化(公表値)
- Anthropic(公式、2026): マージされるコードの 80%超が Claude 起筆(2026-05 時点、Claude Code 登場前は一桁%)。エンジニアの1日あたりマージ量は 2024 年比 8倍(2026 Q2)。コード最適化タスクで Claude が 52倍の高速化を達成(2026-04、2025-05 は約3倍;熟練研究者は4〜8時間で4倍程度)。難しい探索的問題で「人間研究者より良い次の一手」を示す割合 64%(2026-04、2025-11 は51%)。社員の体感生産性 ~4倍(2026-03、n=130)。
  - 出典: https://www.anthropic.com/institute/recursive-self-improvement
- Google(Sundar Pichai、2026 Cloud Next): 新規コードの 75% が AI 生成(2024-10 ~25% → 2025 秋 50% → 2026 75%)。
  - 出典: https://devops.com/google-ceo-says-75-of-new-code-is-ai-generated/
- Microsoft(Nadella、2025-04): 約30%。Meta: 2026 年央までに選抜チームで 75% 目標。
- 個人レベル: Anthropic Claude Code 責任者 Boris Cherny・OpenAI 研究者が「自分のコードは100% AI」(2026-01)。
  - 出典: https://fortune.com/2026/01/29/100-percent-of-code-at-anthropic-and-openai-is-now-ai-written-boris-cherny-roon/
- Science 誌掲載研究: 米国の GitHub Python 関数の約29%が AI 起筆。

## 未解決の論点
- METR ホライズン 16時間超の測定信頼性(タスクスイートの天井)。
- FrontierMath v1→v2 の断絶によりトレンド線が引き直しに。
- RL スケーリングの収穫逓減が 2027 年以降どこで効くか(Epoch は推論モデルの伸びが事前学習フロンティアに合流すると鈍化の可能性を指摘)。
- 「同等能力あたり価格年50〜200倍下落」と「総推論支出の爆発」の同時進行の経済的帰結。
