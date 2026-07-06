# 調査ノート: AIの経済効果を扱うマクロ経済モデルとその係数
調査日: 2026-07-06 / 調査エージェント: Claude (Fable 5)
目的: ブラウザ内で動くタスクベース簡易マクロモデル(国別GDP・失業率・社会安定性)の理論的裏付けと係数収集。

---

## 1. Acemoglu (2024) "The Simple Macroeconomics of AI"

- 原文PDF: https://shapingwork.mit.edu/wp-content/uploads/2024/05/Acemoglu_Macroeconomics-of-AI_May-2024.pdf (2024-05-12版、本文をPDF取得し確認)
- NBER WP 32487: https://www.nber.org/papers/w32487

### モデル(タスクベース、Acemoglu-Restrepo 2018/2019b/2022 の枠組み)
- 最終財の生産(式1): Y = B(N) (∫₀^N y(z)^((σ-1)/σ) dz)^(σ/(σ-1))
  - σ: タスク間の代替弾力性。**σ ≈ 0.5**(Humlum 2021 の推定、Acemoglu-Restrepo 2022 でも採用)
- タスク生産: y(z) = A_L γ_L(z) l(z) + A_K γ_K(z) k(z)(タスク内では労働と資本は完全代替)
- 労働は高indexタスクに比較優位(γ_L/γ_K が z に関して増加)→ 閾値 I 以下のタスクは資本(=自動化)、以上は労働
- 均衡賃金(式10): w = (Y/L)^(1/σ) (B A_L)^((σ-1)/σ) (∫_I^N γ_L(z)^(σ-1) dz)^(1/σ)
- 自動化(I の増加)の賃金効果(式11の派生):
  d ln w / dI = (1/σ) d ln Y/dI − (1/σ) γ_L(I)^(σ-1) / ∫_I^N γ_L(z)^(σ-1)dz
  → **生産性効果(正)と置換効果(負)の綱引きで符号は不定**。R(K)一定なら賃金は上昇、Kが固定/R上昇なら賃金低下があり得る。
- 労働増強型技術(A_L↑)は σ = s_K(資本分配率)のとき賃金を変えず、**σ < s_K なら実質賃金を下げ得る**。現在の米国 s_K ≈ 0.4、σ ≈ 0.5 なので賃金押し上げ効果は小さい。

### Hulten の定理による TFP 効果の規律付け
- TFP 上昇 ≒ (影響を受けるタスクの GDP シェア) × (タスクレベルの平均コスト削減率)
- 採用した数値:
  - AI に曝露される米国労働タスク: **20%**(Eloundou et al. 2023 の automation index を職業レベルに集計し賃金シェアで加重)
  - 曝露タスクのうち収益的に自動化可能: **23%**(Svanberg et al. 2024、コンピュータビジョン)
  - タスクレベル平均「労働コスト」削減: **27%**(Noy-Zhang 2023 と Brynjolfsson et al. 2023 の平均)
  - 産業の労働シェアで換算した平均「総コスト」削減: **14.4%**
- 計算: 0.20 × 0.23 × 0.144 ≈ 0.0066 → **TFP 効果は10年で最大 0.66%(年率 ≈0.064%)**
- Peng et al.(2023)の大きめの生産性向上や GPU コスト低下を織り込んでも **≈0.9%**
- GDP 効果: 資本ストックが TFP に比例して増える基準ケースで **10年で 0.93〜1.16%**。Acemoglu-Restrepo(2022)のフル枠組みで投資反応を入れると上限 **1.4〜1.56%**
- hard-to-learn タスク補正: 曝露タスクの易習得(easy-to-learn)上限 **73%**、hardタスクの生産性向上は easy の **1/4** と仮定 → **TFP ≤0.53%、GDP ≤0.90%(10年)**
- 「悪い新タスク」: Bursztyn et al.(2023)の SNS 数値(収益 +$53/ユーザー月、厚生 −$19/ユーザー月)を使うと、**GDP +2% に見えて厚生 −0.72%(消費等価)** という乖離があり得る
- 不平等: AI は資本分配率と労働分配率のギャップを拡大。低学歴女性の実質所得にマイナス。グループ間格差は過去の自動化ほど拡大しない。

### 簡易シミュレータへの示唆
- コア写像: ΔTFP = 曝露率 × 自動化採算率 × 総コスト削減率(Hulten)。GDP = TFP × 資本反応(1.4〜2.4倍のスケーリング)。
- 国別化: 曝露率は所得水準・職業構成で変える(IMF: 先進国60%、新興国40%、低所得国26%)。

---

## 2. Aghion, Jones & Jones (2017/2019) "AI and Economic Growth" と Baumol のコスト病

- 書籍章PDF: https://web.stanford.edu/~chadj/AJJ-AIandGrowth.pdf(本文PDF取得し確認)/ NBER WP 23928: https://www.nber.org/papers/w23928

### 財生産の Zeira/CES モデル(§9.2.2)
- 式(5): Y_t = A_t (∫₀¹ X_it^ρ di)^(1/ρ)、**ρ < 0(代替弾力性 <1、タスクは粗補完)** — "weak link"生産関数
- 式(6): X_it = L_it(未自動化)/ K_it(自動化済み)
- β_t = 自動化済みタスクの割合として式(11)-(12): **Y_t = A_t (β_t^(1-ρ) K_t^ρ + (1-β_t)^(1-ρ) L_t^ρ)^(1/ρ)**
- 資本分配率(式13): α_K = β_t^(1-ρ) A_t^ρ (K_t/Y_t)^ρ、式(15): α_K/α_L = (β/(1-β))^(1-ρ) (K/L)^ρ
- **Baumol 効果**: ρ<0 では自動化財の相対価格が下落し GDP シェアも下落 → 成長は「不可欠だが改善しにくい」未自動化タスクに制約される。自動化は労働増強的かつ資本希釈的(ρ<0 のとき)。
- 漸近的均斉成長: 残タスクの一定割合 θ が毎期自動化される(β̇ = θ(1-β))と、β→1 でも **資本分配率は約1/3に漸近し、労働は GDP の約2/3 を維持**しつつ2%成長が続く(Fig 9.1、注8: 極限の資本分配率 = (s̄/(g_Y+δ))^ρ 型)。
- 資本分配率一定の knife-edge 条件(式17): g_β = (1-β)(−ρ/(1-ρ)) g_k。分配率一定でも g_Y = g_A + β g_K(式18)で**成長は加速**し得る。

### アイデア生産への AI 導入(§9.3)
- 式(21): Ȧ_t = A_t^φ (B_t K_t)^ρ + (C_t S_t)^ρ)^(1/ρ)。研究タスクの自動化率一定増なら **g_A = (g_C + g_S)/(1-φ)**(式25、Jones 1995 の拡張)→ 自動化は成長率を恒常的に押し上げる。
- **シンギュラリティ条件(§9.4)**: アイデア生産が完全自動化(Ȧ = K A^φ, φ>0)なら Type II(有限時間で無限)。解: A_t = (1/(A_0^(−φ) − φt))^(1/φ)、爆発時刻 t* = 1/(φ A_0^φ)。財生産の完全自動化のみなら Type I(g_Y = g + s̄A_t − δ が指数的に増加、AK型)。
- **簡易モデルへの示唆**: 自動化率 β をスライダにし、σ(=1/(1-ρ))<1 なら「未自動化タスクボトルネック」でGDP増加が logistic に飽和、σ>1 なら爆発、という分岐を再現できる。

---

## 3. Epoch AI「GATE」モデル (2025)

- 論文: https://arxiv.org/abs/2503.04941 (HTML v2 https://arxiv.org/html/2503.04941v2 を取得し確認)
- 発表ブログ: https://epoch.ai/blog/announcing-gate / プレイグラウンド: https://epoch.ai/gate

### 構造(3ブロック)
1. compute ベースの AI 開発モデル(実効計算量 = ハードウェア × ソフトウェア効率)
2. 自動化フレームワーク: 訓練計算量 C_T が閾値分布を越えるごとにタスクが自動化(extensive margin)。**完全自動化の実効訓練計算量目安 ~1e36 FLOP**。推論計算量が「デジタル労働者」の数を決める(intensive margin)
3. 準内生的成長モデル(調整費用つき投資、CES 生産)

### 主な式・パラメータ(論文付録D、WebFetch 抽出)
- 実効計算量: Ċ = C·(Ṡ/S) − δ_Q·C + I_q·H·S、**δ_Q(計算資本減耗)= 0.30/年**
- 訓練↔推論トレードオフ: C_{T+ι} = C_T · ι^(1/m)、**m ≈ 1〜2 OOM**、推論倍率上限 ι_max = 100
- R&D(準内生): Ḣ/H = θ_H H^(−φ_H) (I_H^RD)^(λ_H)、Ṡ/S 同型。**λ(R&D収穫)≈0.3-0.5、φ(fishing-out)≈0.3-0.5**
- 物理上限: 計算量の熱的上限 **C_L = 2.0e38 FLOP/年**。ハードウェア効率上限 H^max、ソフト上限 S^max
- 調整費用: 凸性 χ ≈ 2-3
- 初期値: 最大訓練実行 ~1e21〜(モデル時点)、初期ハードウェアストック ~1e20 FLOP/年
- 労働再配置: 「完全再配置(失業なし)」と「完全置換(自動化された労働者は退出)」の2極シナリオを実装 → **失業率モジュールの理論的な上限・下限として使える**
### 出力
- 自動化進行期の成長率は歴史平均(~3%/年)の **2〜20倍**。積極シナリオでは **年30〜100%** のGDP成長(出典: announcing-gate ブログ、2025-03時点)
- Epoch/Erdil et al.(2025)としての代表値: **2035年頃に年率+30%**(Tom Cunningham の比較表による)

---

## 4. Tom Davidson の compute-centric takeoff モデル (2023)

- レポート概要: https://coefficientgiving.org/research/what-a-compute-centric-framework-says-about-takeoff-speeds/(403のため未取得)
- 対話モデル: https://takeoffspeeds.com/ / Epoch 版: https://epoch.ai/blog/interactive-model-of-takeoff-speeds
- 要約(数値の出典): Scott Alexander "Davidson On Takeoff Speeds" https://www.astralcodexten.com/p/davidson-on-takeoff-speeds(取得し確認)

### 定義と中央値(2023年時点の推定)
- takeoff = 「認知タスクの20%を自動化できるAI」→「100%自動化(AGI)」までの期間
- **中央値: 約3年**(20%→100%)。AGI(100%自動化)中央値 **2043年**。AGI→超知能は 1〜12ヶ月
- **実効FLOPギャップ(20%→100%)中央値 ~4 OOM**(検討レンジ 1〜9 OOM)
- AGI 訓練要件: Bio Anchors 系の中央値 ~1e35〜1e36 実効FLOP(2020アルゴリズム換算)。GPT-4 は ~1e24-25
- R&D における AI と人間労働の代替: **CES ρ = −0.5**(ボトルネックを表現)
- ソフトウェア(アルゴリズム)効率: 年 ~2倍。wake-up(投資加速)時点 ~2034(著者自身が保守的と注記)
- 主要パラメータ名(takeoffspeeds.com の UI): AGI training requirements / effective FLOP gap / returns to hardware / returns to software / R&D parallelization penalty / hardware adoption delay / max fraction compute training / initial GWP 等
- **簡易モデルへの示唆**: 「実効計算量の対数」を状態変数にし、自動化率 = シグモイド(log10(実効FLOP), 中点=AGI要件−2OOM, 幅≈4OOM)とすると Davidson/GATE 両方の構造を近似できる。

---

## 5. AI の GDP 効果推定の比較(機関別)

比較表の主要出典: Tom Cunningham "Forecasts of AI & Economic Growth" (2025-10-19) https://tecunningham.github.io/posts/2025-10-19-forecasts-of-AI-growth-extended.html(取得し確認)

| 推定者(年) | 効果 | 期間 | 手法メモ |
|---|---|---|---|
| Goldman Sachs / Briggs-Kodnani (2023) | 世界GDP +7%($7兆)、米生産性 +1.5pp/年 | 10年 | O*NET 900職種のタスク分析 |
| McKinsey GI (2023) | 生成AIで年 $2.6〜4.4兆(生産性押上げ +0.1〜0.6pp/年)。自動化全体で先進国 +1.5〜3.4pp/年の試算も | 〜2040 | ユースケース積み上げ |
| PwC (2017) | 2030年に世界GDP +$15.7兆(+14%) | 〜2030 | マクロ+ミクロ効果 |
| IMF Cazzaniga et al. (2024, SDN/2024/001) | 世界雇用の40%がAI曝露、先進国60%(うち半分は代替リスク、半分は補完) | — | 曝露指標+AI Preparedness Index(174カ国) https://www.imf.org/-/media/files/publications/sdn/2024/english/sdnea2024001.pdf |
| IMF / Misch et al. (2025) | +0.2%/年(欧州、5年で累計~1%)。規制で3割減の可能性 | 5年 | Acemoglu 枠組みの欧州適用 |
| Acemoglu (2024) | TFP +0.66%/10年(=+0.06〜0.07%/年)、GDP +0.9〜1.6%/10年 | 10年 | Hulten・タスクベース |
| Aghion & Bunel (2024) | +0.68〜1.3pp/年 | 10年 | 電化・IT波との歴史比較 |
| OECD / Filippucci-Gal-Schief (2024) | TFP +0.25〜0.6pp/年(労働生産性 +0.4〜0.9pp) | 10年 | ミクロ→マクロ、30%コスト削減仮定 |
| ECB / Bergeaud et al. (2025) | +0.29%/年(ユーロ圏、累計2.9pp) | 10年 | Acemoglu 枠組み、GPT-4 で16,937タスク分類 |
| BIS / Aldasoro et al. (2024) | +2.5%(累計) | 10年 | 多部門一般均衡、1.5pp生産性仮定 |
| Baily-Brynjolfsson-Korinek (2023) | +1pp/年程度(累計+2.8%〜) | 10-20年 | 認知労働=経済価値の60%、30%効率化 |
| Penn Wharton / Arnon (2025) | +0.15%/年(2035年までに+1.5%) | 〜2035 | GDPの40%が影響、曝露の23%自動化、コスト削減25-40% |
| Korinek & Suh (2024) | AGIベースラインで +18%/年、賃金は**約85%崩落**(雇用は維持) | 20年 | 完全自動化シナリオ |
| Epoch / GATE (2025) | +30%/年(2035) | — | compute ベース |

- レンジは **年率 +0.07%(Acemoglu)〜 +30%(Epoch)で3桁の開き**。手法(現在自動化可能なタスクの静的計上 vs. compute スケーリング+研究自動化の複利)が主因。
- 簡易モデルの UI 設計: この表をそのまま「シナリオプリセット」(保守=Acemoglu、中位=Goldman、急進=GATE/Davidson)にできる。

---

## 6. タスクベースモデルの定式化(実装用まとめ)

- 生産: Y = (∫ y(z)^((σ-1)/σ) dz)^(σ/(σ-1))、σ≈0.5(タスクは補完)
- 自動化率 β(またはAcemogluの閾値I)を政策変数/時間関数に。
- TFP: d ln TFP = Σ(自動化された各タスクのGDPシェア × コスト削減率) — Hulten
- GDP: d ln Y = d ln TFP × κ、κ(資本反応)≈ 1.4〜2.4(Acemoglu 2024 の 0.66%→0.93〜1.56% に対応)
- 賃金: d ln w = (1/σ) d ln Y − (1/σ)(限界タスクの労働シェア密度) → 実装は「w の変化 = 生産性効果 − 置換効果」の2項で、置換効果は dβ に比例させる
- 労働分配率: 自動化は常に労働分配率を低下(AJJ 式15: α_K/α_L = (β/(1-β))^(1-ρ)(K/L)^ρ)。新タスク創出 N↑ のみが分配率を回復。
- 雇用: 完全再配置(GATE の polar case 1)〜完全置換(polar case 2)の間を「再配置摩擦 μ∈[0,1]」で内挿。Δ失業率 ≈ μ × Δβ × 雇用曝露シェア − 再吸収率。
- Korinek-Suh (2024): 完全自動化に近づくと「雇用維持でも賃金が最大~85%崩落」という経路があり、賃金と失業を別軸で持つべき根拠。

---

## 7. 失業・緊縮 → 社会不安の実証係数

### Okun の法則(GDP→失業の写像; Ball, Leigh & Loungani 2013/2017)
- IMF WP 13/10: https://www.imf.org/external/pubs/ft/wp/2013/wp1310.pdf / JMCB版PDF: http://www.econ2.jhu.edu/People/Ball/okuns_law.pdf(本文取得し確認)
- Δu = β × 産出ギャップ(%)。国別係数(絶対値、levels equation, 年次):
  - **米国 −0.45、スペイン −0.82(最大)、日本 −0.17(終身雇用で最小級; 前半−0.12→後半−0.22に上昇)、スイス −0.22、オーストリア −0.13(最小)**
  - 20先進国で安定的に成立、大不況でも不変。労働市場の柔軟性(有期契約比率)が高いほど係数大。
- 実装: 失業率の遷移 u_{t+1} = u_t − β_okun × (g_GDP − g_potential) + 自動化ショック項。

### 緊縮・所得ショック → 社会不安(Ponticelli & Voth 2011/2020)
- SSRN: https://papers.ssrn.com/sol3/papers.cfm?abstract_id=1899287 / J. Comparative Economics 48(1) 2020
- CHAOS 指標 = 暴動+反政府デモ+ゼネスト+暗殺+クーデター未遂の年間件数(欧州1919-2008)
- **支出削減が GDP 1%増えるごとに不安イベントの リスクが単調増加。削減 ≥5% GDP の年は、支出増加時に比べ不安イベントが約2倍**(CBS 報道の要約 https://www.cbsnews.com/news/anarchy-in-the-uk-research-shows-that-austerity-can-lead-to-riots/)。増税の効果は小さく有意でない。
- 経済成長をコントロールしても結果は同じ(IMF の外生的財政ショックデータで確認)。

### ILO 社会不安指数(Social Unrest Index)
- 解説: https://www.ilo.org/newyork/voices-at-work/WCMS_217280/lang--en/index.htm / World of Work Report 2013: https://www.ilo.org/media/6651/download
- Gallup World Poll の「政府への信頼・生活水準・個人の自由・雇用機会・ネットアクセス」から構成される合成指数。
- **不安の2大決定要因は「不十分な経済成長」と「高失業率」。総失業率の影響は若年失業率単独より大きい**(定量係数は本文で非公開の記述レベル)。
- EU の社会不安リスクは 2006年 34% → 2013年 46% に上昇(同報告)。

### 実装用の合成(推定であることを明記)
- 社会不安指数 S_{t+1} = S_t + a1·max(0, Δu) + a2·max(0, −g_GDP) + a3·Δ(労働分配率低下) − a4·(再分配/セーフティネット)
- 文献から正当化できる形: a1(失業)> 若年失業単独、負の所得ショックは効果2倍規模(Ponticelli-Voth の非対称性: 支出減は効くが増税は効かない → 「可処分所得の急落」をトリガーに)。**具体的な a1..a4 の普遍係数は文献に存在しないため、モデルでは感度スライダにすべき(推定)**。

---

## 8. 可視化に使える数値系列(本文 series に転記済み)

1. 機関別 AI 効果推定(年率換算 pp)— 出典: Cunningham 2025 比較表
2. Acemoglu の係数分解(20% → 23% → 27%/14.4% → 0.66%)
3. Okun 係数の国別比較(US 0.45 / ESP 0.82 / JPN 0.17 / CHE 0.22 / AUT 0.13)
4. GATE 成長率シナリオ(歴史3% → 2-20x → 30-100%/yr)
5. AJJ Fig 9.1(β→1 でも資本分配率→~1/3、成長率~2%で安定)— グラフからの読み取り

## 未解決の問い
- ILO 社会不安指数の回帰係数の一次資料(World of Work 2013 の技術付録)の具体値
- GATE のデフォルト・トラジェクトリ(公式の「基準シナリオ」数値表)— プレイグラウンドの Monte Carlo 出力を要確認
- IMF AI Preparedness Index の国別スコア(米0.77前後等)の公式一覧 CSV
- 2026年上期の最新推定(CEA 2026-01 レポート "AI and the Great Divergence" の数値)未読
