# 調査ノート: 中国のAI・ロボット政策と輸出規制の世界への影響

調査日: 2026-07-06(検索・フェッチによる確認済み。学習知識カットオフ 2026-01 以降の事象は Web で検証)

---

## 1. レアアース・永久磁石の輸出規制(2025年4月〜)の経緯と影響

### 経緯(時系列)
- **2023-12-21**: 中国、レアアースの抽出・分離「技術」の輸出を禁止
- **2025-04-04**: 商務部、対米関税への報復として中重レアアース7元素(サマリウム、ガドリニウム、テルビウム、ジスプロシウム、ルテチウム、スカンジウム、イットリウム)の輸出許可制を導入
- **2025-10-09**: 規制を大幅拡大。5元素追加(ホルミウム、エルビウム、ツリウム、ユウロピウム、イッテルビウム)。**中国版の再輸出規制(FDPR類似)を初適用**: 中国産重レアアースを0.1%以上含む、または中国技術で製造された外国製品(磁石・部品・アセンブリ含む)にも許可を要求。2025-12-01から外国軍関連企業への許可は原則拒否
- **2025-11-07**: 米中首脳合意(2025-10)を受け、10月発表分の規制を **2026-11-10まで停止**(4月分の許可制は継続)
- 出典: CSIS https://www.csis.org/analysis/chinas-new-rare-earth-and-magnet-restrictions-threaten-us-defense-supply-chains / 欧州議会シンクタンク https://epthinktank.eu/2025/11/24/chinas-rare-earth-export-restrictions/ / Clark Hill https://www.clarkhill.com/news-events/news/china-hits-pause-on-rare-earth-export-controls-and-what-it-means-for-supply-chains/

### 中国の支配度(CSIS、2025-10時点)
- レアアース採掘: **世界の70%**
- 分離・精製: **90%**
- 永久磁石(NdFeB等)製造: **93%**

### 産業への実害
- 2025年4-5月に輸出急減: 対米磁石輸出は5月に**50トン未満**(平常月500トン超)。6月に353トン(前月比+660%)へ回復。世界向け磁石輸出は6月3,188トン(前月比+157.5%だが前年同月比▲38.1%)
  - 出典: 中国税関データ(via discoveryalert / china-briefing) https://discoveryalert.com.au/china-rare-earth-magnet-exports-us-2025-surge/
- 米欧の自動車工場で磁石不足による稼働率低下・一時停止が発生(IEA) https://www.iea.org/commentaries/with-new-export-controls-on-critical-minerals-supply-concentration-risks-become-reality
- 回復後も中国外の価格は高止まり(欧州価格は中国国内の最大6倍、IEA)。ロボット向け磁石需要増で高価格持続の見通し
- 2026年時点の残存影響(CSIS「One Year Later」2026-04): 対米イットリウム輸出は2025年4-12月で17トン(前8ヶ月は333トン)。2026-02も20トンと低迷(2025-01は66トン超)。航空エンジン向け熱コーティング材の配給制が発生 https://www.csis.org/analysis/rare-earth-export-restrictions-one-year-later

### 米国の対応(CSIS 2026-04)
- 5省庁で**73億ドル超**をコミット。MP Materials に4億ドル出資+DoD価格フロア(NdPr $110/kg・10年)。Vulcan Elements 6.2億ドル、USA Rare Earth 16億ドル(CHIPS)
- Mountain Pass の2025年生産はレアアース化合物 8,900トン(数十年で最高)だが米国消費の約1/3に過ぎず、残り需要の71%を中国から輸入
- 豪(重要鉱物枠組み、2025-10)、サウジ(2025-11)、マレーシア(2025-05に中国外初のジスプロシウム酸化物生産)等と連携

## 2. 中国のロボット供給網支配の度合い

- ヒューマノイド部品サプライチェーン全体: 中国が**約6-7割を支配**(MERICSは「主要企業の63%」、他推計70%) https://merics.org/en/report/embodied-ai-chinas-ambitious-path-transform-its-robotics-industry
- **減速機**: ハーモニック減速機は日本HDS(ハーモニック・ドライブ・システムズ)が伝統的首位だが、中国Leaderdrive(緑的諧波)が2023年に世界シェア15%・国内26%、出荷33万台(2022)→79万台(2025見込)へ急拡大。RV減速機は生産の8割超が中国国内(Jamestown)だが、製造用工作機械の約9割を日本等から輸入 https://jamestown.org/new-gains-in-prc-robotics-software-hardware/
- **アクチュエータ**: 中国シェア約26%(Gerra推計)。Unitreeはモーター・減速機・センサーを内製、長江デルタに2時間物流圏の垂直統合網 https://www.gerra.com/insights/humanoid-robot-supply-chain
- **バッテリー**: 2025年の世界EV電池搭載量1,187GWhのうちCATL 39.2%+BYD 16.4%=**55.6%**。中国6社合計で約69% https://cnevpost.com/2026/02/04/global-ev-battery-market-share-2025/
- **磁石・モーター材料**: 上記の通り磁石93%が中国。レアアース精製90%
- 弱点: 高精度ボールねじは独日が9割(MERICS)、RV減速機用工作機械は9割輸入、ハイエンド半導体

## 3. 中国の半導体自給(SMIC / Huawei Ascend / HBM)

出典: SemiAnalysis https://newsletter.semianalysis.com/p/huawei-ascend-production-ramp / Tom's Hardware
- **Ascend出荷**: 2024年 50.7万個(主に910B)→2025年 80.5万個見込(910Cが65.3万)→2026年 910C 約60万個(前年比2倍)、Ascend全体で最大160万ダイ計画
- TSMC由来のダイ在庫(die bank)290万個超が生産を下支え(2025年時点、約9ヶ月で枯渇見込み)
- **SMIC 7nm級能力**: 2025年末 45k wspm → 2026年 60k → 2027年 80k。5nmパイロット開始(Huawei/Alibaba向け)
- **HBMが最大のボトルネック**: CXMTの2026年HBM生産は約200万スタック=910C換算25-30万パッケージ分のみ。Samsungから過去に1,140万スタック輸入(在庫計1,300万≒910C 160万個分)。CXMTはHBM3を2026年、HBM3Eを2027年目標。DRAM能力は2026年257k wspm(世界DRAMの約15%)
- ロードマップ: Ascend 950DT(2026後半)、960(2027後半)、970(2028後半)、「毎年演算2倍」目標
- 評価: ロジックは自給が進むが、HBM・装置・EDAを含む完全自給は未達。「HBMがなければNvidia/AMDは中国で事実上無競争」(SemiAnalysis)

## 4. 中国AIモデルの水準とオープンウェイト戦略

- **Epoch AI**(2026-01): 中国モデルは米フロンティアに**平均7ヶ月遅れ**(2023年以降、範囲4-14ヶ月)。ECIで差1pt以内を「同等」と定義。2026-01時点でOpenAI o3(2025-04)に並ぶ中国モデルは未出現 https://epoch.ai/data-insights/us-vs-china-eci
- オープンウェイトモデル全体はSOTAに約3.5ヶ月遅れ(Epoch)。中国トップ勢はほぼ全てオープンウェイトのため両ギャップはほぼ一致
- 2025年に中国はオープンウェイト開発で世界首位を獲得(Stanford AI Index分析、the-decoder) https://the-decoder.com/china-captured-the-global-lead-in-open-weight-ai-development-during-2025-stanford-analysis-shows/
- 2026年上期の状況: DeepSeek V4(2026-04頃)、Kimi K2.6、Qwen 3.5/3.6、GLM-5 が相次ぎ公開。BenchLM集計では中国最上位が87 vs 米プロプライエタリ首位93。DeepSeek自身が「SOTAに3-6ヶ月遅れ」と認める(CFR) https://www.cfr.org/articles/deepseek-v4-signals-a-new-phase-in-the-u-s-china-ai-rivalry
- 戦略的含意: 重み公開・低価格APIで世界のデファクト獲得を狙う。自前ホスト・改変可能性で新興国・研究機関に浸透

## 5. 中国政府のAI・ロボット産業政策

出典: MERICS / Carnegie https://carnegieendowment.org/research/2025/11/embodied-ai-china-smart-robots / The Diplomat(2026-03)
- 2025-03 政府活動報告で「具身智能(Embodied AI)」を初明記。第15次五カ年計画(2026-30)で新産業トラックに指定、核融合と同格の「6大成長エンジン」の一つ
- **国家AI産業投資基金**: 600億元(約82億ドル)。**国家創業投資引導基金**: 20年で1兆元(約1,200億ユーロ)規模
- 深圳: 100億元のAI・ロボット産業基金(2025年初)。各省で購入補助(プロジェクト費用の最大30%)、減速機からクラウドロボティクスまで補助
- 「Robot+」「AI+製造」: 2030年までに製造業ロボット密度を倍増目標
- ヒューマノイド企業150社超、国費のロボット訓練センター40ヶ所超
- 2025年実績: ヒューマノイド生産 **12,800体(世界の約90%)**、産業用ロボット生産55.6万台
- 平均価格30-50万元、Unitree G1は約1.2万ユーロ(Boston Dynamics Atlasの1/10)

## 6. 米中輸出規制の応酬 — 2026年時点の状況

- **2025-10 釜山米中首脳会談**: 双方が一部輸出管理を1年停止で合意(中国の10月レアアース規制停止は2026-11-10期限、米国の50%ルール(Affiliates Rule)停止等)。JETRO https://www.jetro.go.jp/biznews/2026/04/4628b6d57055cf4b.html
- **2025-12**: トランプ政権がNvidia **H200の対中輸出を条件付き解禁**(売上の25%を政府へ、BISケースバイケース審査)。Alibaba・Tencent・ByteDance等約10社、1社あたり上限7.5万個。Blackwellは禁止のまま。NRI https://www.nri.com/jp/media/column/kiuchi/20260115_2.html / Tom's Hardware https://www.tomshardware.com/tech-industry/semiconductors/us-eases-nvidia-export-restrictions-h200-cleared-for-china-under-tight-controls
- ただし2026年半ば時点で**H200の実出荷はほぼ停止**: 中国側が税関で輸入を差し止め、国産チップ利用を指導。8.2万個の出荷準備が宙吊り(Tom's Hardware 2026)
- **2026-01**: 中国、対日デュアルユース輸出管理を強化(日本の軍事関連向け禁輸)。CISTEC https://www.cistec.or.jp/service/uschina.html
- 2026-04 USTR外国貿易障壁報告書は中国のレアアース輸出管理を「武器化」と批判
- 構図: 米「チップで締める」vs 中「鉱物・磁石で締める」の人質交換型均衡。停止期限(2026-11)が次の山

## 7. 「中国以外で十分な数のロボットを生産できるか」

- **産業用ロボット設置(IFR World Robotics 2025)**: 2024年世界54.2万台のうち中国29.5万台(**54%**、前年比+7%)。日本4.45万台(第2位、▲4%)、以下米国・韓国。中国の稼働台数200万台超で世界最大 https://ifr.org/ifr-press-releases/news/global-robot-demand-in-factories-doubles-over-10-years
- 中国国内市場でも中国メーカーがシェア57%超(2024、MERICS)で外資を逆転
- **ヒューマノイド生産能力(2026年時点)**:
  - 中国: 2025年に12,800体(世界の~90%)。Unitree等が価格破壊
  - 米国: Figure「BotQ」設計能力 年12,000体(2026年5万体目標、実績350体超・1体/時)。Agility「RoboFab」(オレゴン州セーラム)最大年10,000体だが実際は数百→数千台へ漸増。Tesla OptimusはフリーモントでGen3を2026年夏に低量産開始、「年100万体」はまだ目標段階 https://www.humanoidsdaily.com/news/hardware-first-brains-later-the-great-american-humanoid-scale-up-of-2026
- **制約**: 中国外で量産する場合も磁石(中国93%)、電池(中国系69%)、減速機(中国生産比率上昇中)、レアアース精製(90%)に依存。米国の磁石内製投資(MP、Vulcan等)は立ち上がりに数年
- 逆依存も存在: 中国はRV減速機用の精密工作機械の~9割、精密ボールねじの9割を日独に依存
- 結論の骨子: 「設計能力」は中国外でも年2-3万体規模が立ち上がりつつあるが、**部材レベルで中国を完全に迂回した量産は2026年時点では不可能**。磁石・電池の代替供給網構築には最低3-5年と巨額の補助が必要

---

## 主要一次・準一次ソース一覧
1. CSIS (2025-10, 2026-04) rare earth analyses
2. SemiAnalysis "Huawei Ascend Production Ramp"
3. MERICS "Embodied AI: China's ambitious path"
4. Epoch AI "US vs China ECI gap"
5. IFR World Robotics 2025 press release
6. IEA commentary on critical mineral export controls
7. JETRO ビジネス短信・地域分析(2026-01, 2026-04)
8. CnEVPost(SNE Research経由)EV電池シェア2025
9. Tom's Hardware H200 export saga
10. Carnegie Endowment "Embodied AI: China's Big Bet"

## 派生・注意事項
- 2025年5月の世界向け磁石輸出 ~1,238トンは「6月3,188トン、前月比+157.5%」からの逆算(派生値)
- 2024年6月の ~5,150トンは「前年同月比▲38.1%」からの逆算(派生値)
- 「中国がヒューマノイド部品の70%を支配」はSVRC/Gerra系の推計値、MERICSは「主要企業の63%」— 推計幅として扱う
