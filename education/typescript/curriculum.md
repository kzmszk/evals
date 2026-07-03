# TypeScript 速習コース カリキュラム

Python / Java 経験者向け。合計約 11.5 時間(基礎編 3h + 応用編 8h + 橋渡し 0.5h)。

前提として一貫させる設計思想:

- **既知の概念は対比で教える**。「静的型付けとは何か」の説明はしない。常に「Java / Python ではこうだったが、TS ではこうなる」の形で差分だけを教える。
- **Java の知識は Java 7 相当までしか仮定しない**。ラムダ・Stream・Optional・var などモダン Java の機能は「知っていれば通じる補足」としてのみ使い、説明の本筋はそれらを知らなくても追える形にする(関数を値として扱う概念などは JS 側でゼロから教える)。
- **専門用語は概念を平易に説明してから名付ける**。type erasure などの用語をいきなり出さず、「何が起きるか」を先に見せて「これには◯◯という名前がある」の順で導入する。
- **型はランタイムに存在しない(type erasure)** を全編の背骨にする。基礎編 Ch.1 で宣言し、応用編 Ch.6 で回収する。
- 各章は「解説 → 手を動かす演習 → 確認テスト」の3部構成。コードはすべてブラウザ内エディタ(TypeScript Playground 相当)で実行・型チェックできること。

---

## 基礎編(約3時間)

到達目標: 素の TypeScript で数十行規模のプログラム(CLI 的なロジック、簡単な API クライアント)を、strict モードでエラーなく書ける。

### Ch.1 オリエンテーション — TS は「JS + 型」である(25分)

- JS と TS の差分の全体像: TS が足したのは「型」だけ(型注釈・interface/type・ジェネリクス)。それ以外の文法はすべて JS と共通で、JS のコードはそのまま TS として動く
- 型の指定の仕方の基本: 「名前のあとに `: 型`」。変数・引数・戻り値・配列・オブジェクト型の書き方を最初に体験させる(使い分けの詳細は Ch.4)
- 型は実行時に消える: 概念を平易に説明してから type erasure と名付ける。帰結(`instanceof` に interface は使えない、JSON.parse は保証されない)は Java との対比で
- ツールチェーンの分業: `tsc` は型チェック、実行は Node / tsx / バンドラ(詳細は Ch.5)
- 最初の一歩: Playground で型エラーを出し、エラーメッセージを読む

**確認テスト観点**: 「TS の型注釈は実行時の挙動を変えるか」「コンパイルエラーがあっても JS は生成されうるか」など世界観を問う ○× / 選択問題。

### Ch.2 JS の癖 — Python/Java 経験者の最初の壁(50分)

- `let` / `const`(`var` は使わない)、ブロックスコープ
- `===` と `==`、truthiness(`0`・`''`・`null`・`undefined` が falsy)、`null` と `undefined` の二重存在
- 関数は値: 関数宣言 → 関数式(無名関数)→ アロー関数(短縮記法)の3段階で教える。Java のラムダは既知と仮定せず、「メソッドはクラスに属する」世界からのアンラーニングとして扱う
- オブジェクトリテラルとプロトタイプ: class は糖衣構文であること(深入りはしない)
- `this` の束縛: メソッド切り出しで壊れる例、アロー関数がなぜ安全か(Python の `self`・Java の `this` と対比)
- 分割代入・スプレッド・テンプレートリテラル・オプショナルチェーン `?.` / `??`

**確認テスト観点**: `this` が `undefined` になるコード片の挙動予測、`==` の落とし穴、falsy 判定。難問枠はメソッド参照渡し + `this` の組み合わせ。

### Ch.3 非同期 — スレッドではなくイベントループ(40分)

- シングルスレッド + イベントループのモデル(Java のスレッド・Python の GIL/threading との対比)
- Promise の三状態、`then` チェーン
- `async` / `await`、エラーハンドリング(`try/catch`)、`Promise.all`
- `fetch` を使った小さな API クライアント演習(この演習は応用編 Ch.6 で再登場させ、レスポンスの型安全性を問い直す)

**確認テスト観点**: 実行順序の予測(同期コード → マイクロタスク)、`await` 忘れの型エラー(`Promise<string>` と `string` の混同)。

### Ch.4 TS の基本文法 — 型を書く・推論に任せる(50分)

- プリミティブ型・配列・タプル・オブジェクト型・関数型の注釈
- **型推論を信頼する**: どこに注釈を書き、どこは推論に任せるか(関数の引数と公開 API の戻り値には書く、ローカル変数には書かない)。Java 出身者の「全部に書く」癖をここで矯正する
- union 型とリテラル型: `'success' | 'error'` — Java の enum との対比(ただし TS の `enum` は教えない。理由は応用編 Ch.7)
- `null` / `undefined` と `strictNullChecks`: 「Optional が言語に組み込まれている」と説明する
- `interface` と `type` の初歩(使い分けの詳細は応用編 Ch.7 へ)

**確認テスト観点**: 推論される型を答える問題、`strictNullChecks` 下でエラーになる行の特定、余計な型注釈を削るリファクタ問題。

### Ch.5 モジュールとツールチェーン(30分)

- ES Modules: `import` / `export`(Java の package / Python の import と対比)
- `tsconfig.json` 最小構成: `strict: true` は非交渉であること
- `tsc` / `tsx` / バンドラの役割分担、`.d.ts` と `@types/*`(DefinitelyTyped)の存在
- 基礎編総合演習: 小さな CLI ツール(例: JSON を読んで集計して整形出力)を strict モードで完成させる

**確認テスト観点**: 「型チェックを担うのはどれか」「`@types/node` は何を提供するか」。基礎編の総合テストをここに置き、Ch.1〜5 を横断出題する。

---

## 応用編(約8時間)

到達目標: 型を「注釈」ではなく「設計の道具」として使える。ライブラリの複雑な型定義が読め、`Partial` 相当の utility type を自作でき、実行時境界を型安全に処理できる。

### Ch.1 構造的型付け — nominal からのアンラーニング(45分)

- 「形が合えば同じ型」: `implements` なしで interface を満たす実例
- 型の互換性は部分集合関係: プロパティが多い方が代入できる
- excess property check(オブジェクトリテラル直渡しのときだけ厳しくなる)の理屈
- 意図的に nominal に寄せたいときの branded type(紹介レベル)

**確認テスト観点**: 「この代入は通るか」を形だけで判定する問題群。Java 的直感だと間違える例(名前が違う interface 同士の代入可否)を難問枠に。

### Ch.2 union と narrowing — TS プログラミングの基本動作(90分)

コースの心臓部。ここだけ時間を厚く取る。

- `typeof` / `in` / `instanceof` による型ガード、制御フロー解析(if の中で型が変わる、という体験)
- **discriminated union**: タグ付き union の設計と switch での分岐
- `never` を使った網羅性チェック(case 追加漏れをコンパイルエラーにする)
- 型述語 `x is T`、assertion function `asserts x is T`
- 演習: 「Java なら class 階層で書く」題材(図形の面積計算、イベント処理)を discriminated union で書き直す

**確認テスト観点**: narrowing 後の型を答える問題、網羅性チェックが漏れを検出するコードの完成、型述語の正しいシグネチャ選択。適応型テストの効果が最も出る章なので問題プールを厚くする。

### Ch.3 危険な型 — any / unknown / never / as / satisfies(45分)

- `any` は型チェックの放棄、`unknown` は安全な受け皿(narrowing しないと使えない)
- `never` の意味論(値が存在しない型)と出現場面
- `as`(型アサーション)がなぜ危険か: コンパイラへの「黙れ」であって変換ではない(Java のキャストとの違い — 実行時チェックがない)
- `satisfies`: 型を検査しつつ推論結果を保つ。`as` との使い分け
- `as const` と literal widening

**確認テスト観点**: 「`any` / `unknown` / `as` / `satisfies` のうちこの場面で正しいのはどれか」の場面判断問題。実行時に落ちる `as` の誤用例を見抜く問題を難問枠に。

### Ch.4 ジェネリクス — 型を受け取る関数(60分)

- 型引数の基本、呼び出し時の推論(明示指定がほぼ不要なこと — Java のダイヤモンド演算子より強力)
- `extends` による制約、`keyof` との組み合わせ(`getProp<T, K extends keyof T>`)
- デフォルト型引数、複数型引数の推論の流れ
- Java のジェネリクスとの差分: 消去は同じだが、変性の扱いと推論力が違う
- 演習: 型安全な `pick` / `groupBy` を自作する

**確認テスト観点**: 推論される型引数を答える、制約エラーの原因特定、シグネチャ設計の選択問題。

### Ch.5 型レベルプログラミング — utility types を自作できるところまで(90分)

- `keyof` / `typeof` / indexed access `T[K]`
- mapped types: `{ [K in keyof T]: ... }`、modifier(`?` / `readonly` の付け外し)
- conditional types と `infer`、union の分配
- template literal types(紹介 + 実用例: イベント名の型付け)
- 総仕上げ: `Partial` / `Pick` / `ReturnType` を白紙から自作 → 標準 utility types 一覧を「もう全部読める」状態で提示
- 演習: type-challenges の easy〜medium を数問

**確認テスト観点**: type-challenges 形式(型が期待通りに解決されるよう穴埋め)。適応型で easy → medium → hard に昇格させる。

### Ch.6 実行時境界 — 型が消える世界で生きる(45分)

- type erasure の帰結を回収する章。`JSON.parse` が返す `any`、`fetch` レスポンスの正体
- 境界(API・ファイル・ユーザー入力)では型注釈は安全を**保証しない**こと
- 手書き validation 関数(型述語の実践)→ zod によるスキーマ定義と `z.infer` の流れ
- 基礎編 Ch.3 の API クライアント演習を zod で武装し直す

**確認テスト観点**: 「この `as` は安全か」「バリデーションが必要な境界はどこか」の判断問題。

### Ch.7 設計 — TS らしいコードとレガシー機能(60分)

- **継承より union**: Java なら abstract class + 継承で書く設計を discriminated union + 関数で書く。両方を並べて比較する
- `interface` vs `type` の使い分け指針、declaration merging(存在を知る程度)
- 避けるべき機能とその理由: `enum`(literal union で代替、erasableSyntaxOnly の潮流)、`namespace`、parameter properties、デコレータの現状
- readonly と immutability 志向、エラー設計(例外 vs Result 型 union)

**確認テスト観点**: リファクタ選択問題(「この Java 風コードの TS らしい書き直しはどれか」)、enum を literal union に置換する問題。

### Ch.8 tsconfig 深掘りと型エラーの読み方(45分)

- `strict` ファミリーが個々に何を守るか(`strictNullChecks` / `noImplicitAny` / `strictFunctionTypes`)、`noUncheckedIndexedAccess`
- 関数型の変性: 引数は反変、メソッド記法の bivariance(なぜ配列の共変性が穴になるか)
- **型エラーメッセージの読み方**を独立スキルとして訓練: 長いエラーの読む順番(最後から)、`Type 'X' is not assignable to type 'Y'` の分解、エラーの再現最小化
- 応用編総合テスト: Ch.1〜8 横断

**確認テスト観点**: エラーメッセージを見て原因コードを特定する問題、tsconfig フラグと防げるバグの対応付け。

---

## 橋渡し章: React プレビュー(30分)

フロントエンド開発コース(別教材)への接続。**ここでは React を教えない**。学んだ型システムが React でどう活きるかだけを見せる。

- props の型定義は「ただの関数引数の型」であること
- `useState` の推論、discriminated union で表現するローディング状態(`{status:'loading'} | {status:'ok', data:T} | {status:'error', err:E}`)— 応用編 Ch.2 の直接適用であることを明示
- ジェネリックコンポーネントの存在(応用編 Ch.4 の適用)
- 「続きはフロントエンド開発コースで」の案内

確認テストなし(モチベーション設計の章のため)。

---

## 確認テストの設計(適応型)

README の要件「理解度に応じて難易度が自動で上がる」の実装方針:

- 各章の問題プールを難易度3段階(easy / medium / hard)でタグ付けし、正答が続けば昇格・誤答が続けば降格する単純な階段方式から始める(IRT のような本格的な適応は後回しでよい)
- 終了条件は「hard 帯で規定数正答」または「medium 帯で安定」など習熟判定ベースにし、**問題数は人によって変わる**ことを許容する
- 誤答時は解説だけでなく「どの章のどの節に戻るべきか」を提示する
- 型を問う問題は選択式でなく「Playground 上で型エラーを消す / 期待する型に合わせる」実技形式を優先する(type-challenges 形式が採点も自動化しやすい)
