# 調査ノート: AI開発で先行しない国(日本・EU)の状況と制度的条件

調査日: 2026-07-06 / 調査エージェント: Claude (Fable 5)
学習知識は2026年1月まで。以降の数値はすべてWeb検索・フェッチで確認済み。

---

## 1. 日本の解雇規制・労働流動性の実態

### 整理解雇4要件(学習知識ベース、判例法理)
- 労働契約法16条(解雇権濫用法理): 客観的合理性・社会的相当性を欠く解雇は無効。
- 整理解雇4要件(東洋酸素事件・東京高判昭和54年ほか判例の積み重ね):
  1. 人員削減の必要性
  2. 解雇回避努力義務の履行(配転・出向・希望退職募集を先に尽くす)
  3. 被解雇者選定の合理性
  4. 手続の妥当性(労組・労働者への説明協議)
- 近年は「4要素」として総合考慮する裁判例が主流だが、正社員の指名解雇のハードルが米国(随意雇用 at-will)と比べ格段に高い構造は不変。
- 含意: 「AIで仕事が減った」だけでは正社員解雇は困難。→ 調整は希望退職募集・配転・採用抑制・賃金停滞で起きる(§7参照)。

### 労働移動の国際比較(実測)
- 平均勤続年数(OECDデータ、2023年頃):
  - 日本 12.4〜12.8年、米国 3.9年、英国 9.4年、ドイツ 10.1年、フランス 10.3年、スウェーデン 8.0年、デンマーク 7.0年
  - 出典: 東洋経済(OECD引用) https://toyokeizai.net/articles/-/900776 / JILPTデータブック国際労働比較2025 https://www.jil.go.jp/kokunai/statistics/databook/2025/index.html
- 転職率: 日本の平均転職率は5.1%(2022年、雇用動向調査ベース)。20代・サービス業・非正規で高い。
  - 出典: https://crexgroup.com/ja/tenshoku/career-growth/japan-job-turnover-rate-2/ / e-Stat 雇用動向調査 https://www.e-stat.go.jp/stat-search/files?tclass=000001008247&cycle=0
- OECD雇用見通し2025 日本カントリーノート: https://www.oecd.org/en/publications/2025/07/oecd-employment-outlook-2025-country-notes_5f33b4c5/japan_fa8fbc74.html
- 労働生産性(日本生産性本部「労働生産性の国際比較2025」、2025-12-22公表、2024年実績):
  - 時間当たり 60.1ドル(5,720円、PPP) → OECD38カ国中28位(前年から2つ下げ、G7最下位継続)
  - 一人当たり 98,344ドル(935万円) → 38カ国中29位
  - 実質上昇率 2024年 -0.6%(38カ国中33位)、2023年 +0.1%(16位)
  - 出典: https://www.jpc-net.jp/research/detail/007846.html

---

## 2. 日本企業のAI導入率と国際比較(総務省 令和7年版情報通信白書、2025-07公表、2024年度調査)

### 個人の生成AI利用率
- 日本 26.7%(2023年度 9.1% → 約3倍、+17.6pt)
- 中国 81.2%、米国 68.8%、ドイツ 59.2%
- 日本の年代別: 20代 44.7%、40代 29.6%、30代 23.8%、50代 19.9%、60代 15.5%
- 利用しない理由: 「生活や業務に必要ない」4割超で最多、「使い方がわからない」約4割
- 出典: https://www.soumu.go.jp/johotsusintokei/whitepaper/ja/r07/html/nd112210.html (フェッチ確認済み)

### 企業の生成AI利用
- 日本企業の活用方針「(積極的に)活用する」: 49.7%(2023年度 42.7%)。中国・米国・ドイツは7〜9割。
- 業務で使用中(いずれかの業務): 日本 55.2%。「メール・議事録・資料作成等の補助」47.3%。
- 海外企業の業務利用率: 中国 95.8%、米国 90.6%、ドイツ 90.3%
- 出典: https://www.soumu.go.jp/johotsusintokei/whitepaper/ja/r07/html/nd112220.html (フェッチ確認済み) / 概要PDF https://www.soumu.go.jp/main_content/001019264.pdf / 報道 https://ledge.ai/articles/generative_ai_personal_use_japan_2025 , https://www.nikkei.com/article/DGXZQOUA045CP0U5A700C2000000/

### 生産性への含意
- 白書は導入率の差を示すが、日本での企業レベル生産性効果の頑健な実証はまだ乏しい(推定と実測の区別に注意)。
- デンマークの実証(§6)では時間節約は平均3%にとどまり、賃金・労働時間への効果はゼロ近傍 → 「導入率が低い=生産性で即負け」とは限らない点に留意。

---

## 3. 人口動態・人手不足とAI導入の追い風

### 人手不足倒産(帝国データバンク、実測)
- 2025年度(2025/4〜2026/3): 441件、前年度350件の約1.3倍。年度で初の400件超、3年連続過去最多。
- 業種別: 建設業112件(全体の25.4%)、道路貨物運送業55件、老人福祉事業22件、飲食店21件、労働者派遣業12件 — 労働集約型で軒並み業種別過去最多。
- 「従業員退職型」倒産も過去最多(2025年暦年124件)。
- 2024年問題(建設・物流の時間外上限規制、2024年4月〜)が直撃。
- 出典: https://www.tdb.co.jp/report/economic/20260409-laborshortage-br25fy/ / 暦年版 https://www.tdb.co.jp/report/economic/20260108-laborshortage-br2025/

### 外国人労働者(厚労省「外国人雇用状況」届出、実測)
- 2025年10月末: 257万1,037人(前年比+26万8,450人、+11.7%)、過去最多。3年連続2桁増。
- 国籍別: ベトナム60.6万(23.6%)、中国43.2万(16.8%)、フィリピン26.1万(10.1%)
- 産業別: 製造業59.8万(26.0%)が最多。医療・福祉は前年比+28.1%で急増、5年連続20%超の増加、4年間で2.5倍以上。
- 出典: https://www.mhlw.go.jp/stf/newpage_68794.html / https://www.nikkei.com/article/DGXZQOUA2785N0X20C26A1000000/
- 推移(届出ベース、各年10月末): 2022年 182.3万 → 2023年 204.9万 → 2024年 230.3万 → 2025年 257.1万(2022〜2024は学習知識、2025は検索確認)

### 含意
- 米国の「AI失業」議論と正反対に、日本の現場系(建設・物流・介護・飲食)は人が足りずに企業が倒れている。AI・ロボットによる省力化は「雇用を奪う」のでなく「倒産を防ぐ」文脈で受容されやすい。
- ただし人手不足はホワイトカラー事務職ではなく現場系に偏在。生成AIが直撃する事務職には余剰感があり(§7)、二極化する。

---

## 4. EU AI Act の施行状況と域内AI産業

### 施行タイムライン(実測、欧州委員会)
- 2024-08-01 発効。2025-02-02 禁止AI・AIリテラシー義務適用。2025-08-02 GPAI(汎用AIモデル)義務適用(執行は1年猶予、既存モデルは2027-08-02まで)。
- 2025-07 GPAIガイドライン、GPAI行動規範(Code of Practice)、学習データ要約テンプレート公表。
- 出典: https://digital-strategy.ec.europa.eu/en/policies/regulatory-framework-ai / https://artificialintelligenceact.eu/

### Digital Omnibus による大幅後退(2026-05-07 暫定合意) ← 重要
- Annex III 高リスクAI(用途ベース)義務: 2026-08-02 → 2027-12-02 に16か月延期
- Annex I 高リスクAI(製品規制型): 2027-08-02 → 2028-08-02 に1年延期
- 合成コンテンツの透明性(AI生成表示)義務: 2026-08-02 → 2026-12-02 に4か月延期
- 各国規制サンドボックス設置義務: 2026-08-02 → 2027-08-02 に延期
- 新規禁止(2026-12-02〜): 非同意の性的画像・CSAM生成を目的/合理的に予見可能な帰結とするAI
- AI Office への監督権限集中(GPAIベースのシステム等はEUレベルで排他的監督)、高リスクは欧州委の事前評価義務化
- 出典: Covington https://www.insideglobaltech.com/2026/05/28/eu-ai-act-update-timeline-relief-targeted-simplification-and-new-prohibitions/ (フェッチ確認済み) / https://www.globalpolicywatch.com/2026/05/eu-ai-act-update-timeline-relief-targeted-simplification-and-new-prohibitions/
- 解釈: EUは「世界初の包括AI規制」を誇ったが、産業界の圧力と競争力懸念(ドラギ報告以降)で施行前に自ら緩和・延期。規制先行戦略の限界を示す事例。

### Mistral AI(欧州の旗艦、実測)
- 2025-09: シリーズC 17億ユーロ調達、評価額117億ユーロ(約137億ドル)。ASMLが13億ユーロをリード出資し完全希薄化ベース11%株主に。NVIDIA、a16z、Bpifrance等も参加。
- 前ラウンド(2024): 評価額58億ユーロ → 1年で倍増。
- 2026年時点: 約30億ユーロを評価額200億ユーロで調達交渉中。自前データセンター建設、2030年までに1GWの計算容量目標。
- 出典: https://mistral.ai/news/mistral-ai-raises-1-7-b-to-accelerate-technological-progress-with-ai/ / https://www.cnbc.com/2025/09/09/ai-firm-mistral-valued-at-14-billion-as-asml-takes-major-stake.html / https://www.asml.com/en/news/press-releases/2025/asml-mistral-ai-enter-strategic-partnership / https://techfundingnews.com/mistral-ai-3b-euro-20b-valuation-data-centres/
- 比較: 同時期のOpenAI(数千億ドル)・Anthropic(千億ドル級)と1桁以上の差。欧州最大手でも米中フロンティアとは資本規模で別リーグ。ASML出資は「欧州主権AI」の象徴的動き。

---

## 5. 日本のAI政策

### AI推進法(人工知能関連技術の研究開発及び活用の推進に関する法律)
- 2025-06-04 公布・一部施行、2025-09-01 全面施行。理念法・推進法であり罰則なし(EUの規制型と対照的な「世界で最も開発に優しい」設計)。
- 出典: 内閣府 https://www.cao.go.jp/press/new_wave/20251003.html / 法案 https://www.shugiin.go.jp/internet/itdb_gian.nsf/html/gian/honbun/houan/g21709029.htm / 解説 https://keiyaku-watch.jp/media/hourei/2025-ai-law/

### AI基本計画(法定計画)
- 2025-12-23 閣議決定。「信頼できるAIによる日本再起」。AI法18条に基づく法定計画で、政府全体に予算確保・施策実行の義務。
- 出典: https://www8.cao.go.jp/cstp/ai/ai_plan/aiplan_20251223.pdf / 解説 https://gen-ai-media.guga.or.jp/knowledge/knowledge-6993/
- 2026-02-12 内閣府・経産省 AI・半導体WG始動: https://www.meti.go.jp/policy/mono_info_service/joho/conference/seichosenryakuwg/aisemicon01/shiryo04.pdf

### GENIAC(経産省・NEDO、2024-02〜)
- 基盤モデル開発への計算資源補助。第1〜3期の公募総額339億円、採択延べ30件(2026-01時点公表ベース)。
- 第3期: 24テーマ採択(2025-07-15) https://www.meti.go.jp/press/2025/07/20250715001/20250715001.html
- 第4期: 16テーマ採択(2026-06-04)。Preferred Networks が領域特化型LLMで採択。 https://www.meti.go.jp/press/2026/06/20260604003/20260604003.html
- 公式: https://www.meti.go.jp/policy/mono_info_service/geniac/index.html
- 規模感の注意: 339億円(約2.3億ドル)は米フロンティア1社の年間計算投資(数百億ドル)の1/100以下。

### 国内プレイヤー
- Sakana AI: 2025-11-17 シリーズB約200億円調達(三菱UFJ FG、Khosla、NEA、Lux等)。企業価値約4,000億円で国内未上場スタートアップ過去最高。累計調達約520億円。防衛・エッジ・特化型ポジション。
  - 出典: https://www.nikkei.com/article/DGXZQOUC137OW0T11C25A1000000/ / https://aismiley.co.jp/ai_news/sakana-ai-series-b/
  - 批判的見方(バブル論): https://note.com/shin_sasaki/n/n471da0760b02
- PFN: GENIAC第4期採択(領域特化LLM)。ABEJA等もGENIAC参加組。政府向け「ガバメントAI源内」が行政向けLLMのリファレンス市場に。
  - 出典: https://www.ai-souken.com/article/japanese-homegrown-ai-overview
- 構図: 日本勢はフロンティア競争でなく「特化・エッジ・主権(政府・防衛)」ニッチに収斂しつつある。

---

## 6. 労働流動性とAIショック吸収力(研究)

### デンマーク(高流動性・flexicurityの国)の実証
- Humlum & Vestergaard "Large Language Models, Small Labor Market Effects"(NBER WP 33777 / シカゴ大BFI WP 2025-56)
- 25,000人・7,000職場・11職種の大規模調査×行政記録のマッチング。差の差分析。
- 結果: ChatGPT登場2年後時点で、賃金・労働時間への効果は精密なゼロ(2%超の効果を棄却)。ヘビーユーザー・早期導入職場・若手でも同じ。平均の時間節約はわずか3%。
- タスク再構成・職種転換は観察されるが、純雇用効果なし。
- 出典: https://bfi.uchicago.edu/working-papers/large-language-models-small-labor-market-effects/ / https://www.nber.org/system/files/working_papers/w33777/w33777.pdf / 続編 "Still Waters, Rapid Currents" https://papers.ssrn.com/sol3/papers.cfm?abstract_id=5250742
- 含意: 勤続7.0年・手厚い失業給付のデンマークでは、AI導入が摩擦なく吸収され「静かな変化」にとどまる。流動性が高い国では調整が速く、失業スパイクとして観測されにくい。

### 米国(最高流動性)の実証
- Brynjolfsson, Chandar & Chen "Canaries in the Coal Mine?"(Stanford Digital Economy Lab、2025-08初版→2025-11改訂)
- ADP給与データ(米最大の給与計算業者)の高頻度個票。
- 22〜25歳のAI曝露度最高位の職種で相対雇用16%減(初版13%→改訂16%)。ソフトウェア開発の若手は2022年末ピークから約20%減。経験者・低曝露職は横ばい〜増。
- 調整は賃金でなく雇用(採用)を通じて発生。自動化的利用の職種で減、補完的利用の職種は全年齢で増。
- 出典: https://digitaleconomy.stanford.edu/publication/canaries-in-the-coal-mine-six-facts-about-the-recent-employment-effects-of-artificial-intelligence/ (フェッチ確認済み) / PDF https://digitaleconomy.stanford.edu/app/uploads/2025/11/CanariesintheCoalMine_Nov25.pdf
- スウェーデン研究(第一生命経済研レポート引用): 生成AI曝露の高い職業で22〜25歳の採用が2025年初頭までに5.5%減、50歳以上の雇用は+1.3%。

### 制度比較の論点
- OECD雇用見通し(2023〜)や各種レビュー: AI効果は高曝露職のエントリーレベルに集中、大量解雇でなくタスク再配分・企業内生産性向上で調整という評価。導入データ不足で「曝露プロキシ」依存の限界も指摘。
  - https://www.oecd.org/en/publications/oecd-employment-outlook-2023_08785bba-en/full-report/ensuring-trustworthy-artificial-intelligence-in-the-workplace-countries-policy-action_c01b9e49.html
  - レビュー: https://laweconcenter.org/resources/ai-productivity-and-labor-markets-a-review-of-the-empirical-evidence/
  - クロスカントリー職業移動分析: https://economia.lse.ac.uk/articles/10.31389/eco.451
- 仮説整理: 流動性の高い国(米)はショックが速く可視化される(若年失業)が再配分も速い。流動性の低い国(日)はショックが遅く不可視(採用凍結・社内失業・賃金停滞)だが、再配分の遅れが生産性格差として蓄積するリスク。

---

## 7. 「AI失業」の現れ方の制度依存性(日本での実証・観察)

### 日本の特殊性: 新卒採用は堅調、調整は中高年と事務職に
- 第一生命経済研究所・星野卓也レポート(フェッチ確認済み): https://www.dlri.co.jp/report/macro/617768.html
  - 米国: NY連銀データで22〜27歳大卒失業率5.6%(2026年3月) > 全体4.2%。2023年以降、大卒新卒の失業率が全体を逆転。
  - 日本: 2026年3月卒の大卒就職率98.0%で高止まり。売り手市場継続。
  - 理由: 欧米は「エントリーレベル職の担い手=若者」だが、日本のメンバーシップ型では新卒は「将来の幹部・専門人材の育成投資」であり、AIが代替するエントリー業務と新卒採用が直結しない。
  - 日本でAIの影響を先に受けるのは: (a)余剰感のある中高年(社内失業層)、(b)事務職の担い手である女性・非正規。
  - 実測: 2025年度の上場企業の希望退職募集人数は2万781人で前年度の約2.5倍(対象の多くが中高年)。
- 一方で変化の兆し(2026年春の報道):
  - 人事担当779人調査: 6割超が新卒採用のやり方を変える必要を感じ、約4割が「AI活用で新卒採用数は減る」と回答。 https://business.nikkei.com/atcl/gen/19/00863/040700004/
  - AI活用を全社推進する企業では約9割が採用戦略を見直し、約6割が採用数削減方向。 https://monoist.itmedia.co.jp/mn/articles/2604/11/news019.html
  - 個別事例: 大和ハウス工業が2026年卒採用を前年669人→約150人へ大幅減。SBIホールディングス北尾会長が採用大幅抑制を表明。ENEOS・クボタも2027卒削減を発表。 https://business.nikkei.com/atcl/gen/19/00081/051800943/
- 総合すると: 日本では「AI失業」は失業率でなく (1)新卒・中途の採用計画縮小、(2)中高年の希望退職増、(3)非正規・派遣の契約非更新、(4)実質賃金の停滞として現れる。整理解雇4要件がある限り、米国型の「若年層の雇用喪失スパイク」は統計に出にくい。
- 研究上の含意: 日本のAI雇用効果を測るには失業率でなく「求人数・新卒採用計画・希望退職・配転」を見る必要がある。

---

## 横断的な示唆(レポート用)

1. 日本は「規制で開発を縛らない(AI推進法)」×「人手不足でAI歓迎」×「解雇規制で雇用ショックが遅延・不可視化」という、AI導入の社会的摩擦が世界で最も小さい部類の制度環境。ただし導入率(企業活用方針49.7% vs 米中独7〜9割)と資本規模(GENIAC 339億円)が決定的に見劣り。
2. EUは規制先行(AI Act)だったが2026年のDigital Omnibusで自ら延期・緩和に転換。「ブリュッセル効果」でAI産業は育たず、Mistral(評価額117億→200億ユーロ交渉)ですら米フロンティアの1/10以下。
3. 実証研究は二層構造: 経済全体では効果ほぼゼロ(デンマーク)、高曝露職の若年入職口では明確なマイナス(米国16%減)。制度がどちらの層でショックを受け止めるかを決める。
4. 日本の「AIショック」は2026年時点で中高年希望退職(2.5倍増)と新卒採用計画の縮小(大和ハウス669→150人)として観測され始めた — 解雇でなく入口と出口の調整という予測どおりの現れ方。

## 未解決の問い
- 日本企業のAI導入が生産性(TFP・付加価値)に与えた効果の因果推定はまだない(白書は導入率のみ)。
- 希望退職増のうちAI起因の寄与度は未分離(業績要因・株主圧力との交絡)。
- EU Digital Omnibus後の域内AI投資が実際に回復するかは2026年後半以降のデータ待ち。
- 外国人労働者の増加(257万人)とAI省力化投資が代替関係になるか補完関係になるか。
