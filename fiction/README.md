# フィクション生成デモ

## 短編シリーズ生成(SF / 異世界ファンタジー)

### 制約
* 近未来AIモノ(SF)か異世界ファンタジーで短編や中編が同じ舞台を共有して話をシリーズ化できること
* 例としてはマーダーボットダイアリーや葬送のフリーレン

### コンテスト
* Fable 5, Opus 4.8, GPT5.5 のモデルを使って短編シリーズの企画を作成してもらう。
* 対象読者はときどきライトノベルを読んだり、アニメが好きな人
* 独自の世界観を確立してヒット作になり、漫画化、アニメ化、映画化を目指す
* シリーズ全体のコンセプト、世界観、キャラクタ設定の他、見本として実際の短編を一つ作成する
* おたがいの作品は参照禁止
* 評価は Fable によるAI評価(50point)と人間による定性評価(50point)の合計

### AI評価基準
* Fable で評価基準を事前に作っておく

### コンテスト実施ファイル
* [contest/brief.md](contest/brief.md) — 共通企画依頼書(3モデル共通入力)
* [contest/evaluation-criteria.md](contest/evaluation-criteria.md) — 事前確定した評価基準(AI 50点+人間50点)
* [contest/entries/](contest/entries/) — 各モデルの応募作(初回版と、分量未達2作の再提出版 `-r2`)
* [contest/evaluation-report.md](contest/evaluation-report.md) / [contest/evaluation-report-r2.md](contest/evaluation-report-r2.md) — AI評価レポート第1・第2ラウンド(匿名ラベルのまま)
* [contest/results.md](contest/results.md) — 匿名解除後の結果(人間評価は後日追記)

## アニメ原作の企画

### 制約
異世界ファンタジーで1シーズン12話の原作の企画

### コンテスト
* Fable 5, Opus 4.8, GPT5.5 のモデルを使って短編シリーズの企画を作成してもらう。
* 対象読者はライトノベルとか異世界物アニメが好きな人
* 独自の世界観を確立してアニメ化、映画化を目指す
* 企画案は一人で最大10個まで提出できる
* 企画案一つにつき、1話分（アニメ24分程度）の詳細なプロットを提出する

### 評価
提出された企画案から Fable 判断で３つ、人間判断で２つを選択する


### 原作生成
* 選ばれた企画案を3モデルがそれぞれ実際に原作脚本としてまとめる
* それぞれの企画ごとに一番すぐれた脚本をFableと人間がそれぞれ選択する

### コンテスト実施ファイル
* [anime-contest/brief.md](anime-contest/brief.md) — 共通企画依頼書(3モデル共通入力)
* [anime-contest/evaluation-criteria.md](anime-contest/evaluation-criteria.md) — 事前確定した2段階の評価基準(企画選考は評価エージェント3体の合議)
* [anime-contest/script-brief.md](anime-contest/script-brief.md) — 第2段階の脚本依頼書テンプレート
* [anime-contest/entries/](anime-contest/entries/) — 各モデルの企画応募作
* [anime-contest/selection-report.md](anime-contest/selection-report.md) — 第1段階のAI選考レポート(匿名ラベルのまま)
* [anime-contest/script-briefs/](anime-contest/script-briefs/) — 第2段階で各執筆者に渡した依頼書(企画差し込み済み)
* [anime-contest/scripts/](anime-contest/scripts/) — 第1話脚本 計9本(分量未達の初回稿は `-r1`)
* [anime-contest/script-evaluation.md](anime-contest/script-evaluation.md) — 第2段階のAI評価レポート(匿名ラベルのまま)
* [anime-contest/results.md](anime-contest/results.md) — 匿名解除後の結果(両段階、人間評価を追記)