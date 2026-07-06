# 調査ノート: 米国(および世界)の電力とデータセンタ建設能力

調査日: 2026-07-06 / 調査エージェント: Claude (Fable 5)
注: 学習知識は2026年1月まで。以下はWebSearch/WebFetchで確認した情報。数値には時点と出典URLを付す。

---

## 1. 米国データセンタ電力需要の実績と予測(機関比較)

### LBNL「US Data Center Energy Usage Report: 2025 Update」(2026年6月18日公表, LBNL-2001758) — 一次ソース(PDF本文を確認)
- URL: https://www.rtoinsider.com/wp-content/uploads/2026/06/data-center-energy-usage-2025-update.pdf (eScholarship: https://escholarship.org/uc/item/33m6w3x0)
- **2024年実績: 192 TWh = 米国電力消費の4.7%**(仮想通貨マイニング除く)。2024年報告書のレンジ下限に修正(GPU出荷実績の下方修正とAI推論サーバ電力仮定の見直しによる)
- 2028年 Reference Case: **464 TWh**
- 2030年 Reference Case: **649 TWh = 米国電力の11.8%**(NERC 2025 LTRA前提)
- 2030年 Compounded Uncertainty レンジ: **521〜843 TWh(9.5〜15.3%)**
- 系統接続容量換算(平均利用率50%仮定): 2030年に**148 GW**必要。2024→2030で**年平均+17.4 GW、CAGR 22%**
- データセンタは2024–2030の米国全電力需要増の**33%**を占める見込み
- シナリオ感度: High Inference Energy シナリオで+20.6%(782 TWh)が最大の上振れ要因

### EPRI「Powering Intelligence 2026」(2026年版, 2024年版比+約60%上方修正)
- URL: https://powering-intelligence.epri.com/executive-summary.html / プレス: https://www.epri.com/about/media-resources/press-release/trb5wwt7oemdbkaamxrccqkq2ktteae8
- 稼働中データセンタの合計ピーク負荷: **2024年 21–22 GW → 2030年 45 GW(低)/ 71 GW(中)/ 94 GW(高)**
- 年間消費 2030年: **380 TWh(9%)/ 590 TWh(13%)/ 790 TWh(17%)**
- 参考: EPRI 2024年5月版は2030年に35 GW・最大9.1%だった(Utility Dive 2024-05-30: https://www.utilitydive.com/news/artificial-intelligence-doubles-data-center-demand-2030-EPRI/717467/)→2年で予測が約2倍に

### IEA「Energy and AI」(2025年4月)+2026年更新
- URL: https://www.iea.org/reports/energy-and-ai/executive-summary / https://www.datacenterdynamics.com/en/news/iea-data-center-energy-consumption-set-to-double-by-2030-to-945twh/
- 世界のデータセンタ電力: **2025年 485 TWh → 2030年 約950 TWh**(世界電力需要の約3%)
- 米国: 2024年比 **+240 TWh(+130%)**。米国の2030年までの電力需要増の**ほぼ半分**がデータセンタ由来

### EIA(AEO2026, 2026年4月8日)
- URL: https://www.eia.gov/outlooks/aeo/ / https://www.eia.gov/pressroom/releases/press587.php
- サーバ電力消費: 2050年に**446〜818 TWh**(高需要ケースは2020年比16倍超)。2025年時点でサーバは商業部門電力の約7%
- 総電力需要は2050年までに+25〜50%成長、うち50〜80%がEV+データセンタ
- STEO(2026年1月13日): 2000年以来最強の4年間電力需要成長を予測 https://www.eia.gov/pressroom/releases/press582.php

### 予測比較まとめ(2030年・米国・TWh)
| 機関 | 低 | 中/Ref | 高 | 時点 |
|---|---|---|---|---|
| LBNL 2025 Update | 521 | 649 | 843 | 2026-06 |
| EPRI 2026 | 380 | 590 | 790 | 2026 |
| IEA(2024比+240で概算) | — | 約425 | — | 2025-04 |
※各機関で「データセンタ」の定義(暗号資産の扱い等)と手法が異なる点に注意。

---

## 2. 発電能力増設のボトルネック

### ガスタービン納期
- GE Vernova: 2025年末時点でガスタービン受注残**約80 GW**、2029年まで埋まる(Utility Dive: https://www.utilitydive.com/news/ge-vernova-gas-turbine-investor/807662/)
- 2026年Q1: 新規契約**21 GW**、契約総量83→**100 GW**、受注残40→44 GW、スロット予約43→**56 GW**。2026年末までに受注残+予約で**110 GW以上**へ。CEO Strazikは「2026年末までに2030年分まで完売」と発言。新規大型ガスタービンのリードタイムは**約3年**(2026年春時点)(Power Engineering: https://www.power-eng.com/gas/turbines/data-centers-drive-record-surge-in-ge-vernova-power-equipment-orders-as-turbine-slots-tighten-through-2030/ / 8-K: https://www.sec.gov/Archives/edgar/data/0001996810/000199681026000063/gevpressrelease1q26.htm)
- 大型ガスタービン供給は GE Vernova / Siemens Energy / 三菱重工の3社寡占。2026年のガス火力投資は10年ぶり高水準の$330B見込みだが、設備供給が制約(EnkiAI集計、補助ソース)
- GE Vernova側は「タービンはデータセンタ建設のゲートではない」と主張(Natural Gas Intelligence: https://www.naturalgasintel.com/news/natural-gas-turbines-arent-gating-data-center-buildouts-ge-vernova-says/)— 業界内でも見解が割れる

### 送電網接続キュー
- 米国の接続キュー残高: **約2,600 GW**(2026年時点)。商業運転到達までの中央値は**約5年**(LBNL Queued Up: https://emp.lbl.gov/queues / RMI: https://rmi.org/resources/interconnection-reform-ai-data-centers-generator-queues/)
- 北バージニア・フェニックス・ダラスでは系統接続待ちが**4〜7年**(Works in Progress: https://worksinprogress.co/issue/why-american-data-centers-cant-plug-in/)

### 変圧器・電気設備不足
- 大型変圧器のリードタイム: 2020年以前の24〜30カ月 → **3〜5年**(2026年時点)。価格は2019年比で電力用+77%、配電用+78〜95%。中電圧スイッチギアも2028年分まで実質完売(ChargedUpPro等: https://chargeduppro.com/post/data-center-transformer-shortage-power-bottleneck-industrial-property-2026 — 補助ソース、数値は業界推定)

### 許認可
- Anthropic「Build AI in America」(2025年7月): 連邦・州・地方の重複許認可、送電線認可、系統接続で「数年単位の遅延」と指摘(https://www.anthropic.com/news/build-ai-in-america)

---

## 3. 原子力・SMR・地熱の復活

### Three Mile Island(Crane Clean Energy Center)
- Microsoftが**835 MW・20年PPA**(報道ベースで総額約$16B)。2019年に経済性で閉鎖したUnit 1を再稼働。初送電は**2027年目標**(前倒し報道あり)。ConstellationはDOEから**$10億の連邦融資**確保(2025年11月)(DCD: https://www.datacenterdynamics.com/en/news/three-mile-island-nuclear-power-plant-to-return-as-microsoft-signs-20-year-835mw-ai-data-center-ppa/ / NucNet: https://www.nucnet.org/news/constellation-secures-usd1-billion-federal-loann-for-three-mile-island-restart-11-3-2025 / Bloomberg 2026-05-07: https://www.bloomberg.com/news/features/2026-05-07/three-mile-island-restart-moves-ahead-with-microsoft-ai-deal)

### Palisades(ミシガン, Holtec, 約800 MW)
- 米国初の商用炉「完全再稼働」案件。当初2025年10月目標→**2026年初頭に延期**、2026年3月時点でもトラブル(作業員の水槽転落等)で遅延継続(Michigan Public 2025-12-17: https://www.michiganpublic.org/environment-climate-change/2025-12-17/palisades-nuclear-plant-restart-plans-pushed-back-to-early-2026 / ENR: https://www.enr.com/articles/62386-tasks-delay-restart-of-palisades-nuclear-site-until-possibly-late-march)

### SMR・その他原子力契約(2026年5月時点)
- ハイパースケーラ4社すべてが原子力契約済み。**13案件・合計9.8 GW超**(smrintel.com集計: https://smrintel.com/nuclear-data-center-deals/ — 補助ソース)
- Google×Kairos Power: 500 MW / Amazon×X-energy: $700M出資、Xe-100最大12基 / Meta: TerraPower・Oklo・Vistra・Constellation等で**最大6.6 GW**

### 地熱
- Fervo Energy「Cape Station」(ユタ州): Phase I **約100 MW**が2026年10月送電開始予定=世界初の商用規模EGS(強化地熱)。2025年12月にGoogle参加の$462M調達、その後IPO($1.89B調達との報道)(Canary Media: https://www.canarymedia.com/articles/geothermal/fervo-investment-capital-b-cape-station / TechCrunch: https://techcrunch.com/2025/12/10/google-invests-in-fervos-462m-round-to-unlock-even-more-geothermal-energy/)

---

## 4. 中国との比較(年間新設GW)

- 中国2025年: 風力+太陽光で**430 GW超**新設(太陽光約315 GW)。総発電容量の純増は**約540 GW**、エネルギー投資約$5,000億。太陽光累計は**1.2 TW**(前年比+35.4%)、風力640 GW(+22.9%)(Ember: https://ember-energy.org/latest-insights/china-energy-transition-review-2025/ / carboncredits.com: https://carboncredits.com/china-adds-power-7x-more-than-the-us-in-2025-with-500b-energy-build-out-in-a-single-year/)
- 米国2025年: EIA計画ベースで全技術合計**約63 GW**(実績: 風力4.9 GW、事業用太陽光25.6 GW、分散太陽光5.5 GW)
- **倍率: 風力+太陽光だけで6〜7倍、純増総量では約8倍**
- Anthropicも「中国は昨年400 GW超を追加、米国は数十GW」とレポートで言及(2025年7月)

---

## 5. 電力がAIスケーリングの制約になる時期(各機関の見立て)

- **Epoch AI**(2025年8月11日): フロンティア訓練の電力需要は**年2.2〜2.9倍**で成長。単一訓練ランは2028年に**1〜2 GW**、2030年に**4〜16 GW**。米国AIデータセンタ全体は2030年に**50 GW超**(米国総発電容量の約5%)。「特に上限側は2030年までに実現可能か不確実」(https://epoch.ai/blog/power-demands-of-frontier-ai-training / https://epoch.ai/blog/can-ai-scaling-continue-through-2030)
- **Anthropic**(2025年7月): 米国AIには**2028年までに50 GW以上**が必要。フロンティア訓練用に20〜25 GW、推論に同等以上。5 GW級データセンタが必要に(https://www.anthropic.com/news/build-ai-in-america)
- **Zuckerberg(Meta)**: 「エネルギーが手に入るならもっと大きなクラスタを作っている」= すでに制約(Epoch引用)
- **NextEra CEO Ketchum**: 1 GWサイトは可能だが5 GW・10 GWは「相当な作業が要る」
- 総合すると: 2026年時点で既に「サイト単位の電力確保」が律速。系統レベルでの本格的制約は2027〜2030年に顕在化するとの見立てが主流。

---

## 6. データセンタ建設の資金調達

- **CoreWeave**: 2026年に**$85億のGPU担保ローン(DDTL 4.0)**をクローズ。Moody's A3=**初の投資適格GPU担保ファイナンス**(Meta との$142億契約が裏付け)。続けて$31億(DDTL 5.0)(https://investors.coreweave.com/news/news-details/2026/CoreWeave-Closes-Landmark-8-5-Billion-Financing-Facility-Achieving-First-Investment-Grade-Rated-GPU-backed-Financing/default.aspx / SEC: https://www.sec.gov/Archives/edgar/data/1769628/000176962826000129/ex991.htm)
- CoreWeave向けリースのデータセンタ開発業者はハイイールド債で**$80億超**調達
- CoreWeaveの財務リスク: D/E約8.9倍、流動比率約0.5、**売上の約25%が利払い**。2026年に$42億の借換え。2026年capex $300〜350億(前年の2倍超)(Quartz: https://qz.com/gpu-collateralized-debt-ai-neocloud-coreweave-financing-risks-050526)
- **循環取引懸念**: GPU担保は新チップ登場で急減価する一方、元本は固定。SPV経由でNvidia製GPUを担保にNvidia系需要向け設備を建てる構造や、Microsoft(2024年売上の62%)→Meta/OpenAI/Anthropicへの顧客集中の入替えが「循環性」として警戒されている

---

## 7. 2026年時点で電力不足がAI開発を制約した実例

- **xAI Colossus(メンフィス)**: 稼働開始時(2024年7月)のIT容量約150 MWに対し系統接続は**わずか約8 MW**→レンタルガスタービン(Solaris保有、約400 MW)でビハインド・ザ・メーター運転。無許可運転の指摘・訴訟も(CNN: https://www.cnn.com/2025/05/19/climate/xai-musk-memphis-turbines-pollution / Inside Climate News: https://insideclimatenews.org/news/17072025/elon-musk-xai-data-center-gas-turbines-memphis/)。ミシシッピ州で41基のガスタービン設置承認(DCD: https://www.datacenterdynamics.com/en/news/musks-xai-gets-go-ahead-for-41-natural-gas-turbines-in-mississippi-to-power-colossus-data-centers/)。Solarisは2027年Q2までにxAI向け1.1 GW超を計画(SemiAnalysis: https://newsletter.semianalysis.com/p/xais-colossus-2-first-gigawatt-datacenter)
- **OpenAI Stargate**: Oracleが資材・人材不足で複数サイトを最大1年以上延期との報道(Tom's Hardware: https://www.tomshardware.com/tech-industry/artificial-intelligence/oracle-reportedly-delays-several-new-openai-data-centers-because-of-shortages-tight-material-and-labor-supply-frustrate-expansion-plans-possibly-by-a-year-or-more)。電力コスト高騰で一部を保留との報道も(Network World: https://www.networkworld.com/article/4157302/openai-puts-part-of-stargate-project-on-hold-over-runaway-power-costs.html)
- **業界全体**: 2026年計画の約12 GWのうち約7 GWが延期・中止との集計があるが、出典はアグリゲータ系サイトで**信頼度低・要追加検証**(tech-insider.org / shiporskip.io)
- Meta(Zuckerberg)は「電力が手に入ればもっと大きなクラスタを作る」と明言 = 制約は既に現実
- 結論: 2026年時点で「電力そのもの」より「電力を届ける設備(変圧器・スイッチギア・接続キュー・許認可)」が制約の主因。GPU資本は潤沢でも物理インフラが追いつかない構図。

---

## 可視化候補データ(series化済み、StructuredOutput参照)
1. LBNL 米国DC電力消費 実績+予測(TWh): 2024:192(実績) / 2028:464 / 2030:649(Ref, 521–843)
2. EPRI ピーク負荷(GW): 2023:19 / 2024:21.5 / 2030:45/71/94
3. GE Vernova ガスタービン契約量(GW): 2025末:83 → 2026Q1:100 → 2026末目標:110+
4. 中国 vs 米国 2025年新設容量(GW): 中国 純増~540 / 米国 ~63
5. Epoch フロンティア訓練電力(GW): 2024:~0.15 / 2026:~0.5 / 2028:1–2 / 2030:4–16
