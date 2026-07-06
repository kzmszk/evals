# フィジカルAI(ロボティクス+基盤モデル)調査ノート
調査日: 2026-07-06 / 調査エージェント: Claude (Fable 5)

## 1. VLA(Vision-Language-Action)モデルの進捗

### Physical Intelligence(π系列)
- **π0**(2024-10発表): flow matching による連続アクション生成を導入。単一モデルで10種以上の操作タスク・複数ロボット形態に対応。https://www.pi.website/blog/pi0
- **π0.5**(2025-04): 未知環境への汎化(open-world generalization)。新しいキッチン・寝室の片付けをモバイルマニピュレータで実行。階層アーキテクチャ+FASTトークナイザ。https://www.pi.website/blog/pi05
- **π*0.6 + RECAP**(2025-11): RLで実機経験から自己改善するVLA。RECAP = RL with Experience & Corrections via Advantage-conditioned Policies。示範→リアルタイム介入→自律練習の3段階。最難タスクでスループット2倍超、失敗率半減。デモ: エスプレッソ13時間連続稼働(5:30-23:30)、新環境で50点の未知衣類折りたたみ、工場で59箱の組立・ラベル貼り。共同創業者 Karol Hausman「RL is back」。
  - 論文: https://arxiv.org/abs/2511.14759 / PDF: https://www.pi.website/download/pistar06.pdf
  - 解説: https://www.humanoidsdaily.com/news/physical-intelligence-claims-rl-is-back-with-new-model-that-learns-from-its-own-mistakes

### Google DeepMind Gemini Robotics
- **Gemini Robotics / -ER**(2025-03): Gemini 2.0ベース。3D空間認識、コード生成。
- **On-Device版**(2025-06): ロボット上でローカル実行可能な軽量VLA。https://deepmind.google/blog/gemini-robotics-on-device-brings-ai-to-local-robotic-devices/
- **Gemini Robotics 1.5 + ER 1.5**(2025-09): 「行動前に考える」内的独白(思考の言語化)、embodiment間のモーション転移(ALOHA→Franka→Apptronik Apollo)。推論モデル(ER)+VLAの2モデル構成。https://deepmind.google/blog/gemini-robotics-15-brings-ai-agents-into-the-physical-world/ / 論文: https://arxiv.org/pdf/2510.03342
- **CES 2026**: Boston Dynamics 電動Atlasへの Gemini Robotics 統合パートナーシップ発表。https://www.marktechpost.com/2026/04/28/top-10-physical-ai-models-powering-real-world-robots-in-2026/

### NVIDIA Isaac GR00T
- **GR00T N1**(2025-03): 初のオープン汎用ヒューマノイド基盤モデル。https://arxiv.org/abs/2503.14734
- **GR00T N1.7 Early Access**(2026-04-17): 3Bパラメータ、Cosmos-Reason2-2Bバックボーン+32層DiT、Apache 2.0。EgoScale人間視点動画2万時間を事前学習に追加し言語追従・汎化を改善。https://github.com/Nvidia/Isaac-GR00T
- 2026年にアカデミア向けオープンヒューマノイド参照設計を発表。https://nvidianews.nvidia.com/news/nvidia-open-humanoid-robot-reference-design

### Figure Helix
- Helix: 上半身全体を制御するVLA。Helix System 0 (S0) で知覚条件付き全身制御に拡張。フリート拡大でデータフライホイールを回す戦略。https://www.figure.ai/news/ramping-figure-03-production

### 残る技術課題
- 信頼性・稼働率の公開データがほぼ皆無(MTBF等)。模倣学習の誤差蓄積→π*0.6がRLで対処を試みる段階。
- 未知環境汎化はπ0.5/Gemini 1.5で前進したが、評価は各社独自でベンチマーク標準が未確立。
- 器用さ(dexterity): 柔軟物・接触リッチ操作は依然デモレベル中心。

## 2. ヒューマノイド主要プレイヤーと2025-2026実績

### 2025年の世界出荷
- 世界出荷 約13,000台(2025年)。中国勢(主にUnitree・AgiBot)が約80%。出典(二次): https://www.forbes.com/sites/jonmarkman/2026/04/27/unitree-g1-humanoid-robots-are-reshaping-the-robotics-investment-stack/
- 別ソースでは「中国が世界出荷の90%」(2026-06 TechTimes、閲覧不可のため見出しベース)。

### Unitree(宇樹科技)
- 2025年出荷: ヒューマノイド5,500台超(世界1位)、生産計6,500台超(大半がG1)。2026年目標2万台。(Forbes 2026-04)
- 価格: R1 $5,900(2025-07発売)/ G1 $16,000(base $13,500との情報も)/ H2 $40,900(商用)・$68,900(EDU)(2025-10発売)/ H1 $90,000。
- TrendForce(2026-04): ヒューマノイドが売上の51%超、四足込み粗利率60%。能力増強目標: ヒューマノイド年産75,000台+四足115,000台。IPO準備中。https://www.trendforce.com/presscenter/news/20260409-13007.html

### AgiBot(智元機器人)
- 2025-12に上海ラインで累計5,000台目、2026-03に累計10,000台(3カ月で倍増)。2025年出荷5,100台超=世界の約40%。(TrendForce / ifactoryapp)

### UBTech(優必選)
- Walker S2: 2025-11量産・納入開始、2025年末までに柳州工場で累計1,000台生産。Walkerシリーズ受注累計8億元(約$112M)超(2025-11時点)、約$195Mとの報道も(2025年末)。
- 導入先: BYD(100-200台、世界最大の商用ヒューマノイド配備)、吉利、一汽VW、東風、アウディ一汽、北汽、Foxconn、SF Express。2026-01にAirbus、中国商飛(COMAC)。2026-07に中越国境の税関業務に配備。
- 生産計画: 2026年に産業用ヒューマノイド年産5,000台、2027年に10,000台。
- https://www.prnewswire.com/news-releases/ubtech-humanoid-robot-walker-s2-begins-mass-production-and-delivery-with-orders-exceeding-800-million-yuan-302616924.html

### Figure
- Figure 03: 2026-04-29時点で累計350台超を BotQ で生産。生産速度は1台/日→1台/時(120日以内に24倍)。BotQ第1世代ラインは年産12,000台能力、4年で累計10万台目標。https://www.figure.ai/news/ramping-figure-03-production / https://www.figure.ai/news/botq
- BMW Spartanburg: Figure 02 で10-11カ月のパイロット(X3を3万台以上生産する工程に参加)→ Figure 03 初期40台の商用契約。課金は約$25/ロボット稼働時間。https://www.iiot-world.com/artificial-intelligence-ml/robotics/physical-ai-deployment-roi-humanoid-robots/(二次)
- 家庭向けは2026年後半に限定提供予定。

### Tesla Optimus
- 2026-01時点でFremont工場にGen3が1,000台超稼働(バッテリー組立・パック搬送等)。ただしMusk自身が2026-01-28決算で「主に学習用で生産的タスクではない」と認める。
- V3量産はFremontで2026年7月末〜8月開始予定(2026-04-22決算)。目標コスト$20,000-25,000/台(年産100万台時)。Giga Texasに年産1,000万台目標の専用工場計画。
- 出典(二次): https://optimusk.blog/blog/tesla-optimus-production-timeline/ ほか

### 1X / Agility / Apptronik
- 1X NEO: 家庭向けヒューマノイドを$20,000(Early Access、$200デポジット)で予約受付、2026年納入予定。テレオペ→自律の段階移行方式。https://www.therobotreport.com/1x-announces-pre-order-launch-neo-humanoid-robot/
- Agility Digit: GXO運営のSpanx倉庫(ジョージア州)でRaaSモデルの業界初商用配備。2025-11に累計10万トート搬送を突破。GXOと複数年契約(100台規模、2026年まで)。https://www.agilityrobotics.com/content/digit-moves-over-100k-totes
- Apptronik Apollo: Mercedes-Benz のベルリン Marienfelde デジタルファクトリーとハンガリー Kecskemét 工場でイントラロジスティクス(10-20台)。

## 3. 産業用ロボット世界出荷(IFR World Robotics 2025)
出典: https://ifr.org/img/worldrobotics/Executive_Summary_WR_2025_Industrial_Robots.pdf(本文確認済)

- 2024年世界設置台数: **542,076台**(史上2位、4年連続50万台超)。2022年記録552,946台、2023年541,302台。
- **中国: 295,045台(+7%、過去最高)= 世界需要の54%**。2013年から世界最大市場。稼働台数2,027,190台(世界ストックの43%、2024年に200万台突破)。
- 中国国内で中国メーカーのシェアが初めて外資を逆転し**57%**(10年前は約28%)。
- 日本44,453台(-4%)、韓国30,596台、欧州85,006台(-8%、独26,982台)、米州50,077台(米34,164台)。上位5カ国(中日米韓独)で世界の80%。
- 地域別: アジア74% / 欧州16% / 米州9%。
- 業種別2024: 電機・電子128,899台(24%)> 自動車126,088台(23%)> 金属・機械88,777台(16%)。
- ロボット密度(2024): 世界平均177台/従業員1万人、アジア204、欧州148、米州131。
- 見通し: 2025年は+6%の575,000台、2028年に70万台超え。中国は2028年まで年平均+10%成長余地。
- 年次設置台数(地域別グラフ読み取り、千台): 2014: 213 / 2015: 249 / 2016: 297 / 2017: 393 / 2018: 415 / 2019: 376 / 2020: 379 / 2021: 519 / 2022: 553(実測)/ 2023: 541(実測)/ 2024: 542(実測)

## 4. コスト曲線とBOM
- Goldman Sachs: 製造コストは2022年の$50,000-250,000/台 → 2023年に$30,000-150,000/台へ **約40%低下**(従来想定の年15-20%低下を上回る)。https://www.goldmansachs.com/insights/articles/the-global-market-for-robots-could-reach-38-billion-by-2035
- 2026年時点の商用グレード価格帯は約$40,000-60,000(2023年の$150,000以上から低下)との業界分析(二次: theresarobotforthat / robozaps)。
- BOM構成: アクチュエータが35-50%、バッテリー15-20%、オンボード計算10-15%。1台あたりハーモニックドライブ最大44個。
- 中国勢(特にUnitree)が国産化・量産でアクチュエータコストを約50%低減。バッテリーは約$100/kWh(2026年)。
- Tesla: ローラースクリューを垂直統合で$3,000→$800(75%減)。
- 価格実例の時系列: H1 $90,000(2023)→ G1 $16,000(2024)→ R1 $5,900(2025-07)→ NEO $20,000(家庭用、2025-10予約)→ Optimus目標$20-25k(量産時)。

## 5. データ問題(実機・テレオペ・シミュレーション)
- ボトルネック: 高品質テレオペデータは1時間分の収集に1時間かかりスケールしない。
- NVIDIA GR00T-Dreams: 少数の実機示範→Cosmos世界基盤モデル(Predict-2)をファインチューン→画像+テキストから合成軌道を大量生成。**11時間で78万軌道**を生成した実績。https://developer.nvidia.com/blog/enhance-robot-learning-with-synthetic-trajectory-data-generated-by-world-foundation-models/
- Isaac Lab / Isaac Sim: GPU並列シミュレーションで再現可能なデータ生成。https://arxiv.org/pdf/2511.04831
- 人間視点動画の活用: GR00T N1.7 は EgoScale 2万時間の egocentric 動画を事前学習に使用。
- 実機経験からのRL: π*0.6 RECAP が実運用データ(自律実行+人間介入)での自己改善を実証。
- Figure: フリート拡大(350台超)自体をHelix用データ収集と位置づけ。
- Gemini Robotics 1.5: モーション転移により embodiment 間でデータを相互利用。

## 6. 市場予測の比較
| 機関 | 予測 | 時点 |
|---|---|---|
| Goldman Sachs | ヒューマノイド市場 2035年に$38B(従来$6Bから6倍上方修正) | 2024-01改定 |
| Morgan Stanley | 世界市場 2025年$3B → 2030年$28B。エコシステム全体で2050年$5T。世界稼働台数2050年10億台シナリオ | 2025 |
| Morgan Stanley(中国) | 中国出荷 2026年50,000台(従来28,000から倍増)、2030年446,000台(従来262,000)。中国市場 2026年$2B → 2030年$15B | 2026-06-24 |
| TrendForce | 中国の2026年生産 +94%。Unitree+AgiBotで出荷の約80% | 2026-04-09 |
| IFR(産業用) | 2025年575,000台(+6%)、2028年に70万台超 | 2025-09 |

- Morgan Stanley: フルサイズ機の構成比 2026年30% → 2027年50% → 2028年70%。
- 出典: https://www.scmp.com/tech/article/3358210/morgan-stanley-raises-china-humanoid-robot-shipment-forecast-50000-units / https://www.trendforce.com/presscenter/news/20260409-13007.html / https://www.morganstanley.com/insights/articles/humanoid-robot-market-5-trillion-by-2050

## 7. 2026年前半時点の商用配備事例
- **BMW Spartanburg(米)**: Figure 03 ×40台の商用契約($25/稼働時間)。X3生産工程で板金部品装填等。
- **GXO/Spanx倉庫(米ジョージア)**: Agility Digit、RaaSで10万トート突破(2025-11)、複数年・100台規模契約。
- **BYD ほか中国自動車工場**: UBTech Walker S2 100-200台規模(世界最大)。吉利、一汽VW、Foxconn、SF Expressにも。
- **Airbus / COMAC**: Walker S2 が航空機製造に参入(2026-01)。
- **中越国境税関**: Walker S2 が実際の税関業務に配備(2026-07報道)。
- **Mercedes-Benz(独・ハンガリー)**: Apptronik Apollo 10-20台、トート搬送。
- **Foxconn**: iPhoneシャーシ組立でヒューマノイド評価中。CATL寧徳工場でパイロット。
- **Tesla Fremont**: Optimus 1,000台超が社内稼働(ただし「主に学習用」)。
- **1X NEO**: 家庭向け予約$20,000、2026年内納入予定(商用配備は未達)。

## 未解決の問い
- ヒューマノイドの信頼性(MTBF・稼働率)の公開データが欠如。出荷台数≠実稼働台数(研究・デモ用途が相当数)。
- Optimus の生産性ある実タスク移行時期。V3量産の実際の立ち上がり。
- VLAの標準ベンチマーク不在で各社性能主張の比較が困難。
- 米中デカップリング(レアアース・アクチュエータ供給、中国製ロボットへの安全保障規制)の影響。
- Unitree IPO後の情報開示で実売上・粗利の検証が可能になるか。
