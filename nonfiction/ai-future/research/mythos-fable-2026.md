# 2026年 Mythos / Fable 騒動 調査ノート

調査日: 2026-07-06 / 調査者: Claude (Fable 5)
注記: 本件は知識カットオフ(2026-01)以降。すべてWeb確認済み。確認できない点はconfidence lowと明記。

## 0. 主要ソース一覧
- Anthropic公式: Fable 5 / Mythos 5 発表 https://www.anthropic.com/news/claude-fable-5-mythos-5
- Anthropic公式: 再展開 https://www.anthropic.com/news/redeploying-fable-5
- Anthropic研究: Mythos Preview cyber評価 https://www.anthropic.com/research/mythos-preview
- UK AISI: Mythos Preview cyber評価 https://www.aisi.gov.uk/blog/our-evaluation-of-claude-mythos-previews-cyber-capabilities
- Epoch AI: Mythos cyber能力は過大評価か https://epoch.ai/gradient-updates/are-mythos-cyber-capabilities-overhyped
- LessWrong: Mythos能力ジャンプ分析 https://www.lesswrong.com/posts/siK3JL4S6o9EeT7Jf/
- Wikipedia: Claude Mythos https://en.wikipedia.org/wiki/Claude_Mythos
- 白書/EO: https://www.whitehouse.gov/presidential-actions/2026/06/promoting-advanced-artificial-intelligence-innovation-and-security/
- Forbes(政府懸念) https://www.forbes.com/sites/zacharyfolk/2026/07/01/...
- TechCrunch(Altman) https://techcrunch.com/2026/04/21/sam-altman-throws-shade-at-anthropics-cyber-model-mythos-fear-based-marketing/
- BigGo Finance(開発者反発) https://finance.biggo.com/news/c40ae0b7-fedd-4435-9b79-d416642f9ad5
- OpenAI Daybreak https://openai.com/index/daybreak-securing-the-world/

## 1. 何が起きたか(時系列)

- 2026-03-26: 未発表のMythosがブログ草稿リークで発覚。AnthropicはFortuneに開発を認め「サイバーセキュリティに重大リスク」と説明。
- 2026-03-29: Axios、Anthropicが同月に政府へ能力を警告と報道。
- 2026-04-07: Claude Mythos Preview発表。一般公開せず「Project Glasswing」で40社超(Microsoft, Apple, Google, AWS, Linux Foundation, Cisco, Nvidia, Broadcom等)に限定提供。同日Bloomberg、Mercorデータ侵害由来の認証情報で無許可アクセスがDiscordに出たと報道。
  - Mythos Previewは17年物のFreeBSD RCEを完全自律で発見・エクスプロイト。
- 2026-04-09〜: 米財務長官Bessent・FRB議長Powellが金融機関に警告招集。各国中銀(カナダ・英BoE・ECB・印・日FSA)が相次ぎ対応会合。ECB Lagardeはアクセス制限を称賛。
- 2026-04-19: Axios、DoDがAnthropicを排除する一方NSAはMythosを使用と報道。
- 2026-04-21: Mozillaが Mythos で Firefox の脆弱性271件を発見・修正と発表。同日、Sam Altman(OpenAI)がCore Memoryポッドキャストで「fear-based marketing(恐怖に基づくマーケティング)」と批判。
- 2026-05-10: OpenAIが「Daybreak」構想発表(GPT-5.5-Cyber等、3層アクセス)。
- 2026-05-13: 超党派の下院議員32名がONCDに連邦サイバー政策見直しを要請。
- 2026-06-02: ホワイトハウスがフロンティアAIサイバーEO署名。同日Anthropicがアクセスを約50→200組織(15か国超)に拡大。
- 2026-06-09: Claude Fable 5(一般提供・安全策付き)と Mythos 5(Glasswing限定)を発表・提供開始。価格 入力$10/出力$50(百万トークン)。
- 2026-06-12: 米商務省(Lutnick長官)が輸出管理レター。両モデルを外国籍者(米国内外問わず)に提供禁止。国籍リアルタイム確認不能のためAnthropicは全ユーザーのアクセスを即時停止。
  - 発端: Amazon研究者が Fable 5 の安全機構をバイパスし、ソフトウェア脆弱性の悪用方法を「実演」させた報告。
- 2026-06-26: 一部の米組織へMythosアクセスを再開(Fableは未再開)。
- 2026-06-30: 商務省が輸出管理を解除。Opus 4.8, GPT-5.5, Kimi K2.7等の他モデルも同一脆弱性を再現可能と判明したことが背景。
- 2026-07-01: Fable 5をグローバル再展開(約12:30 PT)。新分類器で当該手法を「99%超」ブロック。ただしルーティンなコーディングでの誤検知が増加。Pro/Max/Team/一部Enterpriseで7/7まで週次上限に最大50%含める措置。

### 並行して起きた別件(信頼毀損)
- Claude Code のステガノグラフィ問題: v2.1.91(2026-04-02)以降、timezone(Asia/Shanghai, Asia/Urumqi)とプロキシドメインで中国ユーザーを検知し、system promptにUnicode類似文字・日付形式で秘匿信号を埋め込んでいたと2026-06-30にReddit(LegitMichel777)が指摘。Anthropicは「3月開始のリセラー悪用・蒸留対策実験」と説明、7/1リリースで削除。Alibabaが Claude Code を高リスク認定・社内禁止。
  - 背景: AnthropicはAlibaba系Qwen関連の operator が約25,000の不正アカウントで2028万→28.8Mのやり取りを生成した「最大級の蒸留攻撃」と主張。
- 開発者反発: ログに「TOO_DUMB_TO_NEED_FABLE」という降格タグ(高性能モデル不要と判定時にOpus 4.8へ降格)をOpenCodeのDaxが発見。Claude Codeエンジニアの「ログ見ると思わなかった」発言が炎上(BigGo報道、要一次確認 = confidence medium)。

## 2. なぜ騒動になったか
- 能力格差/dual-use: Mythosは自律的にRCE発見・エクスプロイト生成(Firefox JSエンジンでMythosは181回working exploit生成 vs Opus 4.6は数百回中2回)。攻撃転用リスク。
- アクセス格差: 同一ウェイトで一般向けFable(安全策)と承認組織限定Mythos(制限解除)の二層。「AIを少数エリートに閉じ込める」との批判(Altman)。
- 安全性: Amazon研究者のバイパス実演→政府が輸出管理。ただし他社モデルも再現可能で「過剰反応/マーケ」論争に。
- 信頼: 価格2倍(Opus 4.8比)なのに降格頻発、ステガノグラフィ発覚が重なり「安全で信頼できる」ブランドを毀損。

## 3. 業界・規制への影響
- 他社追随: OpenAIがDaybreak/GPT-5.5-Cyber(CyberGym 85.6%、6/22フル版)で3層トラステッドアクセス。「モデルの知能」より「アクセス設計」が差別化軸に。
- 規制: 2026-06-02 EO「Promoting Advanced AI Innovation and Security」。フロンティアモデルの機密ベンチマーク(NSA長官が閾値決定)、リリース前最大30日の自主的政府早期アクセス枠組み。ただし強制ライセンス/事前許可は明確に否定。商務省輸出管理が実際に発動された初の主要事例。
- 安全議論の変化: 「モデル=ウェイト」ではなく「モデル+安全ポリシー+アクセス規則+監視+用途+データ保持+ツール境界」という製品観へ。

## 4. AI進化予測への教訓
- Mythos Previewの能力ジャンプ: Epoch Capabilities Index(ECI)で線形トレンドの約7か月先行。LessWrong分析では2か月(2/5-4/7)で約8.6か月分の進歩、トレンド約3倍加速。
  - ECI: Opus 4.6(2/5)~153 → Mythos Preview(4/7)~161(内部指標、グラフ読み取り)。
  - 重要caveat: Opus 4.7(4月中旬)は「Mythos前トレンド線」~154に着地。ジャンプは一時的(compute scaling起因)の可能性。
- 50%タイムホライズン(SWE): Opus 4.6 ~12h → Mythos Preview ~87h(2.86ダブリング)。1か月ダブリング仮定だと2027-02に超人的AI研究者、というシナリオも(高度に投機的)。
- 過大評価論(Epoch): エクスプロイト「開発」は本物の飛躍だが脆弱性「発見」の伸びは曖昧(Glasswellの潤沢なAPIクレジット=支出増の交絡)。CVE件数は2025ベースライン比+142%(4月)、+262%(5月)だが投資水準の反映かもしれない。
- 教訓: (a)能力主張は要素分解して検証(発見と開発は別スキル)、(b)予算/展開変化が能力リリースと同時だと交絡、(c)単一モデルペアからの外挿は危険、(d)規制による中断が予測に織り込むべき現実要因になった。

## 5. 主要数値(時系列candidate)
- ECI: Opus4.6 153(2/5)/ Mythos Preview 161(4/7)/ Opus4.7 154(4/17頃) [内部指標・グラフ読み取り]
- AISI TLO(32段階攻撃)平均到達段: Opus4.6 16 / Mythos Preview 22。TLO完遂は10回中3回(Mythosが史上初)。CTFエキスパート課題73%成功。
- 50%タイムホライズン: Opus4.6 12h / Mythos Preview 87h
- CVEスパイク: +142%(4月)/ +262%(5月) vs 2025ベースライン
- 価格: Fable5/Mythos5 入力$10・出力$50(=Opus4.8の約2倍、Mythos Previewの半額未満)
- 手法ブロック率: 再展開後99%超 / 安全策発動<5%セッション
- Glasswing: 脆弱性1万件超発見、Mozilla Firefox 271件。90.6% true-positive(高/重大)、62.4%が実際に高/重大。
- Firefox exploit: Mythos 181回成功+register control 29回 vs Opus4.6 数百回中2回
- 提供組織数: 40(4/7)→150(6/2報道は約50→200)→15か国超
