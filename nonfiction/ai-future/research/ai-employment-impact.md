# AIの雇用への影響(実データ中心、2023〜2026)調査ノート

調査日: 2026-07-06。学習知識カットオフ(2026-01)以降の数値はすべてWeb検索/フェッチで確認。

## 1. 米国の若年層・エントリーレベル雇用

### Stanford Digital Economy Lab「Canaries in the Coal Mine」(Brynjolfsson, Chandar, Chen)
- 出典: https://digitaleconomy.stanford.edu/publication/canaries-in-the-coal-mine-six-facts-about-the-recent-employment-effects-of-artificial-intelligence/ (2025-11-13公開)
- データ: ADP(米最大の給与計算プロバイダ)の月次ペイロールデータ、数百万人規模。
- 主要ファクト:
  - 22〜25歳のAI高曝露職種の雇用は生成AI普及後に**相対16%減**(2025年10月時点。7月時点の前回分析では13%減)。
  - 22〜25歳のソフトウェア開発者は2022年末以降**約20%減**。
  - 同じ職種でも経験豊富な労働者の雇用は横ばい〜増加。
  - 調整は賃金でなく**雇用量**で起こっている。
  - 減少は「AIが自動化する」職種に集中、「augment(補助)する」職種では起きていない。
  - テック企業・リモート可能職を除いても頑健。
- 2026年2月アップデート(金利・タイミング検証): https://digitaleconomy.stanford.edu/news/canaries-interest-rates-and-timinga-more-on-recent-drivers-of-employment-changes-for-young-workers/
  - AI曝露が高い職種はむしろ金利感応度が低い(金利説を棄却)。
  - 最も厳しい統制(企業×時点固定効果)では、AI曝露職の雇用減が統計的に有意になるのは**2024年から**。2022〜23年の減少は他要因も混在。
- Canaries Dashboard(2026-07-01更新、データは2026年4月まで): https://digitaleconomy.stanford.edu/project/indicators/canaries-dashboard/
  - 2026年4月時点: AI最高曝露職種は前年比-0.2%、最低曝露職種は+0.1%(Fortune 2026-06-27: https://fortune.com/2026/06/27/what-is-ai-impact-entry-level-jobs-stanford-adp-canaries-brynjolfsson-richardson/)
  - ソフトウェア開発者: 22-25歳で大幅減、26-30歳で小幅減、それ以上の年齢層は増加。カスタマーサービス担当も同パターン。

### 新卒失業率(NY連銀・EPI)
- NY Fed「Labor Market for Recent College Graduates」: 2026年Q1の新卒(recent college grads)失業率**約5.7%**、不完全就業率(underemployment)**41.5%**。https://www.newyorkfed.org/research/college-labor-market
- EPI(Class of 2026): 若年大卒失業率は2023年7月の底4.0%→2026年3月に5.3%(+1.3pt)。ただし**非大卒の若年層も同様に悪化**しており「AIが大卒だけを直撃」という解釈は時期尚早と指摘。採用率(hires rate)の低迷が主因。https://www.epi.org/blog/class-of-2026-young-college-graduates-face-a-weaker-labor-market-but-a-more-mixed-picture-than-the-headlines-suggest/
- 22-27歳の新卒は経験者の2倍超の失業率、専攻によっては7.5%(CNBC 2026-04-06: https://www.cnbc.com/2026/04/06/college-graduates-job-market-unemployment.html)

### 求人データ(Indeed Hiring Lab)
- ジュニア職タイトルの求人: 2024年8月→2025年8月で**-7%**、シニア職は+4%(「experience creep」)。経験2-4年枠の求人シェア46%(2022年中頃)→40%(2025年中頃)、5年以上要求は37%→42%。https://fortune.com/2026/04/03/experience-creep-jobs-ai-entry-level/
- AIに言及する米求人シェア: 2025年12月に**4.2%**(過去最高)。AI言及求人数は2020年2月比+134%。全体の求人は横ばい〜減少で、雇用がAI関連スキルに集中。https://www.hiringlab.org/2026/01/22/january-labor-market-update-jobs-mentioning-ai-are-growing-amid-broader-hiring-weakness/
- テック求人は2026年トレンドレポートでコロナ前比約1/3減。https://www.hiringlab.org/2025/11/20/indeed-2026-us-jobs-hiring-trends-report/

### SignalFire State of Tech Talent Report 2025/2026
- ビッグテックの新卒採用は**2019年比50%超減**。Magnificent 7に入る新卒の割合は2022年比半減以下。
- 新卒はビッグテック採用の**7%**、スタートアップでは6%未満。
- https://www.signalfire.com/blog/signalfire-state-of-talent-report-2025 / https://www.signalfire.com/blog/signalfire-state-of-talent-report-2026

## 2. 職種別のAI曝露と実雇用変化

- **カスタマーサービス**: BLS OESベースで2024年5月→2025年5月に**-130,180人(-4.8%)**。https://www.thecooldown.com/green-business/ai-job-market-trend-us-labor-data/ (BLS OESデータの分析)
- **翻訳・通訳**: BLSは2024-2034年の成長見通しを3%→2%以下に下方修正(2026年時点の職業展望では+1.7%、+1.3k人)。ILO 2025年生成AI曝露指数で「very high」。Google翻訳の普及地域で翻訳者雇用が減少したとの研究(CEPR: https://cepr.org/voxeu/columns/lost-translation-ais-impact-translators-and-foreign-language-skills、Slator: https://slator.com/us-bureau-of-labor-statistics-job-outlook-for-translators-interpreters-worsens/)
- **プログラマ**: 22-25歳ソフトウェア開発者はADPデータで2022年末比約20%減(上記Canaries)。ソフトウェアエンジニア全体では経験層は堅調。
- BLSが2024年に挙げたAI関連縮小職種18: パラリーガル、グラフィックデザイナー、通訳・翻訳、調達事務、営業担当、事務アシスタント、カスタマーサービス等。https://www.bls.gov/opub/ted/2025/ai-impacts-in-bls-employment-projections.htm
- AI高曝露職種全体: 2024年5月→2025年5月に-0.2%(全体雇用は+0.8%)。2026年4月時点でも最高曝露-0.2% vs 最低曝露+0.1%(前年比)。

## 3. 生産性研究(RCT・フィールド実験)

| 研究 | 対象 | 結果 |
|---|---|---|
| Brynjolfsson, Li & Raymond (2023)「Generative AI at Work」 | コールセンター5,000人超 | 生産性(時間あたり解決数)**+14%**、新人・低スキル層は**+34%**、熟練者はほぼ効果なし。https://arxiv.org/pdf/2304.11771 |
| Noy & Zhang (2023, Science) | 大卒専門職453人の文書作成 | 作業時間**-40%**、品質**+18%**。https://www.science.org/doi/10.1126/science.adh2586 |
| GitHub Copilot RCT (Peng et al. 2023) | プログラマ(HTTPサーバ実装) | 完了時間**-55.8%**。 |
| **METR RCT (2025-07)** | 経験豊富なOSS開発者16人、自身のリポジトリ | AI(Cursor+Claude)使用で**+19%遅く**なった。開発者自身は「20%速くなった」と認識(予測は+24%)。レビュー・修正に総時間の9%。https://thezvi.substack.com/p/on-metrs-ai-coding-rct |

含意: 生産性向上は「新人・定型タスク」で大きく、「熟練者・複雑な既存コードベース」では小さいか逆効果。認識と実測の乖離が大きい。

## 4. 失業率・労働市場指標(2026年時点の最新値)

- **米国**: 失業率**4.2%**(2026年6月、前月4.3%から低下。ただし労働参加率が61.5%に低下した影響大)。非農業部門雇用者数+57,000(6月)。https://www.cnbc.com/2026/07/02/jobs-report-june-2026-.html / https://www.bls.gov/news.release/empsit.nr0.htm
- **ユーロ圏**: 失業率**6.2%**(2026年5月、季調値。前年同月6.3%)。EU全体の失業者1,316万人。https://ec.europa.eu/eurostat/web/products-euro-indicators/w/3-02072026-ap
- **日本**: 完全失業率**2.5%**(2026年5月、季調値)。有効求人倍率**1.17倍**(2026年5月)。完全失業者数は2026年4月に193万人で9か月連続増。https://www.nikkei.com/article/DGXZQOUA294TF0Z20C26A6000000/ / https://www.stat.go.jp/data/roudou/sokuhou/tsuki/index.html
- 3地域ともマクロ失業率は歴史的低水準圏で、AIの影響はマクロ指標にはまだ現れず、若年層・特定職種のミクロレベルに集中。

## 5. UBI・再分配実験

### OpenResearch(Sam Altman出資)3年RCT
- 2020年開始、イリノイ・テキサスの3,000人に月$1,000×3年(対照2,000人は月$50)。対象は連邦貧困線300%以下(平均年収$29,000未満)。
- 結果: 労働時間**週-1.3時間**、求職活動は**+10%**活発化。支出+$310/月(食費・家賃・交通)。医療(歯科・専門医)利用増、身体的健康の有意な改善はなし。
- https://www.openresearchlab.org/studies/unconditional-cash-study/study / https://qz.com/sam-altman-openai-free-money-basic-income-study-1851600997

### フィンランド(2017-2018、失業者2,000人に月€560)
- 就業日数は対照群比**+6日**(78日 vs 72日)と小さい。1年目は統計的に有意差なし。幸福度・制度への信頼・将来への自信は改善。
- https://stm.fi/en/-/perustulokokeilun-tulokset-tyollisyysvaikutukset-vahaisia-toimeentulo-ja-psyykkinen-terveys-koettiin-paremmaksi / https://www.aeaweb.org/articles?id=10.1257%2Fpol.20200143

### ケニアGiveDirectly(2017〜、$30M、195村・約23,000人、最長12年)
- 「現金給付は労働意欲を削ぐ」という懸念に反する結果。一括給付(lump-sum)群が起業・事業収入で最良。月次給付群も労働供給は減らず。
- https://www.givedirectly.org/2023-ubi-results / https://poverty-action.org/effects-universal-basic-income-kenya

## 6. AI起因レイオフ公表事例(2025-2026)

- 集計: 2025年に米国で**約55,000人**がAI起因レイオフ(Challenger等の集計に基づくトラッカー)。2026年上半期は15万人超の削減(AI言及を含む大規模テックレイオフ計、AI単独起因とは限らない点に注意)。https://founderreports.com/ai-layoffs-tracker/
- 主要事例(TechCrunch 2026-06-22の「AIを理由に挙げた2026年レイオフ」リスト: https://techcrunch.com/2026/06/22/the-running-list-major-tech-layoffs-in-2026-where-employers-cited-ai/):
  - Oracle: 21,000人(2026年3-6月、13%)「AI導入の結果」
  - Amazon: 16,000人(2026年1月、約9%)+ 14,000人(2025年10月)「AIエージェントによる効率化」
  - Dell: 11,000人(2026年1月、10%)
  - Meta: 8,000人(2026年5月、10%)
  - PayPal: 4,500人超(2026年5月、20%)「積極的AI導入」
  - Block: 4,000人(2026年2月、40%)
  - Cisco: 4,000人(2026年5月)、Intuit: 3,000人(2026年5月、17%)
  - Salesforce: 2025年にサポート4,000人削減(Benioff「AIエージェントが顧客対応の約50%を処理」)+2026年2月に1,000人弱
  - IBM: 累計15,000人超(2024年9月以降)、HR約200職をAIエージェントで代替
  - Cloudflare: 1,100人(20%)「AIで中間管理職が不要に」
- 逆行事例: **Klarna**は2024年にAIで700人相当のサポート代替を喧伝→品質低下を認め2025年5月に再雇用へ転換(「行き過ぎた」)。https://www.digitalapplied.com/blog/ai-first-layoff-trend-10-corporations-amazon-to-klarna
- パターン: 各社とも過去最高収益とレイオフが併存。AI設備投資(2026年ビッグテック計$725B規模との報道)の原資として人件費削減という側面も。https://invezz.com/news/2026/05/04/is-big-techs-725b-ai-splurge-being-funded-by-mass-layoffs/

## 未解決の論点
- AI起因と金利・パンデミック後正常化・オフショアリングの寄与分解(Stanfordも2024年以前は識別困難と認める)
- 「AI理由」のレイオフ公表がどこまで実態か(投資家向けナラティブの可能性)
- METRの結果(熟練者は遅くなる)と企業のCopilot導入効果の矛盾の解消
- 日本・EUでの職種別AI雇用効果の実証データはまだ乏しい
