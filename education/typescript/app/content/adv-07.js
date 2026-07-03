// 応用編 Ch.7 — 設計: TS らしいコードとレガシー機能
window.COURSE.register({
  id: 'adv-07',
  part: 'advanced',
  title: '設計 — TS らしいコードとレガシー機能',
  minutes: 60,
  goal: 'Java の設計常識(継承・enum・例外)を TS 流(union・literal union・Result 型)に置き換えられる。enum / namespace / parameter properties などのレガシー機能を「なぜ避けるか」まで説明できる。',
  sections: [
    {
      title: '継承より union — class 階層のアンラーニング',
      body: `Java の設計常識では「種類ごとに振る舞いが違う」ものは抽象クラス + 継承 + ポリモーフィズムで表現しますね。TS でも同じコードは書けます(下のコード前半)。しかし TS ネイティブの書き方は、同じ問題を **discriminated union + 関数**で解きます(後半)。応用編 Ch.2 で学んだタグ付き union は、narrowing の練習台ではなく、**継承の代替となる設計の主役**です。

両者を比べると、TS で union が選ばれる理由がはっきりします。

- **操作の追加が楽**: class 階層で「面積の次は周長も」となると全サブクラスを修正。union なら関数を**1個書き足すだけ**で、既存の型定義には触りません。
- **種類の追加が安全**: union に新しい kind を足すと、\`never\` による網羅性チェック(応用編 Ch.2)が効いていれば**すべての switch がコンパイルエラー**になり、対応漏れがゼロになります。Java で同等のことは sealed interface + switch パターンマッチ(Java 17+)でようやく可能になりましたが、TS では最初からこれが標準スタイルです。
- **データがプレーンオブジェクト**: \`JSON.stringify\` / \`JSON.parse\` とそのまま往復できます。class インスタンスは stringify した瞬間メソッドを失い、parse しても二度と class には戻りません。API 境界だらけの TS アプリでは、これが決定的な差になります。
- **\`new\` が要らない**: テストデータもリテラルをポンと書くだけです。

誤解しないでほしいのは「class を絶対に使うな」ではないこと。内部状態と不変条件を隠蔽したい長寿命のオブジェクト(コネクション、キャッシュなど)には class が適所です。**デフォルトを union + 関数にして、class は選ぶ理由があるときだけ選ぶ** — これが TS の感覚です。`,
      code: `// ===== Java の常識: abstract class + 継承 =====
abstract class ShapeClass {
  abstract area(): number;
}
class CircleClass extends ShapeClass {
  radius: number;
  constructor(radius: number) {
    super();
    this.radius = radius;
  }
  area(): number {
    return Math.PI * this.radius ** 2;
  }
}
class RectClass extends ShapeClass {
  width: number;
  height: number;
  constructor(width: number, height: number) {
    super();
    this.width = width;
    this.height = height;
  }
  area(): number {
    return this.width * this.height;
  }
}

// ===== TS の常識: discriminated union + 関数 =====
type Shape =
  | { kind: "circle"; radius: number }
  | { kind: "rect"; width: number; height: number };

function area(s: Shape): number {
  switch (s.kind) {
    case "circle":
      return Math.PI * s.radius ** 2;
    case "rect":
      return s.width * s.height;
  }
}

// 同じ結果。ただし union 版は new 不要・JSON と往復可能・網羅性チェック付き
console.log(new CircleClass(2).area().toFixed(2));
console.log(area({ kind: "circle", radius: 2 }).toFixed(2));`,
    },
    {
      title: 'interface vs type と declaration merging',
      body: `基礎編 Ch.4 で先送りにした「\`interface\` と \`type\` のどちらを使うか」に決着をつけます。まず事実関係から。オブジェクトの形を表すだけなら**どちらでも書けて、ほぼ等価**です。違いは端っこにあります。

\`\`\`ts
// type にしかできない: union やタプルに名前を付ける
type Status = "active" | "suspended";
type Pair = [number, number];

// interface にしかできない: declaration merging(同名宣言の自動マージ)
interface Point { x: number }
interface Point { y: number }
// ここで Point は { x: number; y: number } になっている
\`\`\`

**使い分けの指針**: この章で見てきたとおり、TS らしい設計の中心は union です。union・mapped type・conditional type はすべて \`type\` でしか書けないので、**迷ったら \`type\` に統一**しておけば表現力で困ることがありません。interface を選ぶ合理的な理由は「declaration merging が必要なとき」— つまりライブラリの拡張ポイントを作る/使うときです。チームの規約が interface 優先ならそれに従えばよく、宗教戦争をする価値はありません。

**declaration merging は「存在を知る」程度で十分**です。用途はほぼ一つで、他人の型定義を外から拡張すること — \`window\` にプロパティを生やす、Express の \`Request\` にフィールドを足す、といった場面で威力を発揮します。裏を返すと、自分のコードで同名 interface をうっかり2回定義しても**エラーにならず静かにマージされる**ということでもあります(\`type\` なら Duplicate identifier エラーで気づけます)。

Java 経験者への注意: TS の interface は Java の interface とは別物です。応用編 Ch.1 でやったとおり TS は構造的型付けなので、\`implements\` と書かなくても形が合えば interface を満たします。「interface = 実装契約を強制する道具」という Java の直感は捨ててください。ここでは interface はただの「オブジェクトの形の名前」です。`,
    },
    {
      title: 'enum は literal union で置き換える',
      body: `Java の \`enum\` は名作でした。だから TS にも \`enum\` があると知ると Java 出身者は飛びつきます — が、**新規コードでは使わないのが現代の TS の主流**です。今の実行環境でも enum は問題なくコンパイルできて動きます。避けるのはコンパイルエラーになるからではなく、**設計判断**です。理由は2つ。

1. **「型は消える」原則の例外だから**。基礎編 Ch.1 以来、「TS の型構文はコンパイル時にすべて消える」を背骨にしてきました。enum はこの原則を破り、**実行時に JS オブジェクトを生成します**(数値 enum は逆引き用のマッピングまで生成します)。型のつもりで書いたものがランタイムコードになる、TS の中でも特異な機能です。
2. **erasableSyntaxOnly の潮流**。Node.js は TS ファイルを「型注釈を剥がすだけ」で直接実行できるようになりました(type stripping)。この方式では enum のような「コード生成が必要な構文」は実行できません。TypeScript 5.8 で追加された \`erasableSyntaxOnly\` フラグを有効にすると enum はコンパイルエラーになります。エコシステム全体が「消せる構文だけ書く」方向に動いています。

代替は基礎編 Ch.4 からずっと使ってきた **literal union** です。\`type Role = "admin" | "member"\` は enum と同じタイプセーフティ(変な文字列を渡せばコンパイルエラー)をランタイムコストゼロで提供し、しかも使う側は \`Role.Admin\` ではなく \`"admin"\` と書くだけ。import も不要です。

「でも enum は値の一覧を実行時にも持てるじゃないか」— そのとおり。一覧が実行時にも必要なときは、下のコード③の \`as const\` オブジェクト + \`typeof\` / \`keyof\` パターンが定番です。値と型に**同じ名前**を付けられる(TS では値と型の名前空間が別)ので、使い心地は enum とほぼ同じになります。`,
      code: `// ① enum: 今の環境でもコンパイルできて動く。だが…
enum RoleEnum {
  Admin = "admin",
  Member = "member",
}
// 実行時にオブジェクトが存在する = 「型は消える」原則の例外
console.log(Object.keys(RoleEnum));

// ② literal union: 同じ安全性をランタイムコストゼロで
type Role = "admin" | "member";

function canDelete(role: Role): boolean {
  return role === "admin";
}
console.log(canDelete("admin"));
// canDelete("root"); // ← コメントを外すとエラー: "root" は Role に代入不可

// ③ 値の一覧が実行時にも欲しいとき: as const オブジェクトが enum の完全代替
const Priority = {
  Low: 1,
  High: 2,
} as const;
type Priority = (typeof Priority)[keyof typeof Priority]; // 1 | 2

function describePriority(p: Priority): string {
  return p === Priority.High ? "急ぎ" : "通常";
}
console.log(describePriority(Priority.High));`,
    },
    {
      title: '避けるべき機能 — namespace・parameter properties・デコレータ',
      body: `enum 以外にも、TS には「JS に構文が存在しなかった時代」に生まれた独自機能が残っています。既存コードで読めれば十分で、新規に書くべきではないものたちです。

**namespace** — Java の package や Python のモジュール階層に見えますが、正体は ES Modules(2015年)**以前**にコードを整理するための仕組みです。今は基礎編 Ch.5 でやった \`import\` / \`export\` がその役割を完全に担います。古いライブラリの \`.d.ts\` で \`declare namespace\` を見かけたら「昔のモジュールだな」と読み流してください。自分で書く場面はありません。

**parameter properties** — \`constructor(private readonly repo: UserRepo) {}\` のように、コンストラクタ引数に修飾子を付けるとフィールド宣言と代入が自動生成される構文です。Kotlin や Scala 風で魅力的に見えますが、これも enum と同じく**型注釈を剥がすだけでは JS にならない**コード生成構文で、\`erasableSyntaxOnly\` では禁止されます。class を書くときはフィールド宣言とコンストラクタでの代入を明示的に書きましょう。数行増えますが、それはただの JS です。

**デコレータ** — \`@Component\` のような構文は Java のアノテーションに見えますが、性格が違います(Java のアノテーションは受動的なメタデータ、TS のデコレータは実行時に走る関数です)。さらに歴史的事情で、長年使われてきた \`experimentalDecorators\`(legacy 版)と TC39 で標準化が進む新仕様の**2系統が混在**しており、挙動に互換性がありません。Angular や NestJS などデコレータ必須のフレームワークではその流儀に従えばよいですが、**自分の設計で新規採用する機能ではない**、が現状の評価です。

見分け方の原則はシンプルです: **「その構文、型を消すだけで JS になるか?」** — ならない(実行時コードを生む)TS 独自機能は、enum・namespace・parameter properties のいずれも避ける方向にエコシステムが動いています。interface・type・ジェネリクスなど純粋に消える構文は安心して使ってください。`,
    },
    {
      title: 'readonly と immutability',
      body: `Java で \`final\` フィールドを使い、Python で「タプルは不変」を意識してきたあなたなら、immutability の価値は説明不要でしょう。TS の道具は \`readonly\` です。ただし性格をひとつだけ正確に押さえてください: **readonly は完全にコンパイル時の契約で、実行時には何もしません**。type erasure の原則どおり、生成される JS からは消えます。凍結したければ実行時の道具 \`Object.freeze\` が別にあります(こちらも浅い凍結です)。

- **プロパティの readonly**: \`readonly host: string\` は Java の \`final\` フィールドとほぼ同じ意味論 — 再代入の禁止です。参照先オブジェクトの中身まで守る deep immutability ではありません(readonly は**浅い**)。
- **配列の readonly**: \`readonly number[]\`(または \`ReadonlyArray<number>\`)にすると、\`push\` \`splice\` など破壊的メソッドが**型から消えます**。関数の引数をこれで受けると「この関数はあなたの配列を変更しません」という契約が型に現れる — Java にはない表現力です。なお \`number[]\` は \`readonly number[]\` に代入できますが、**逆は不可**です(readonly を勝手に外せたら契約が破れるため)。
- **\`Readonly<T>\`**: 全プロパティを readonly 化する utility type。応用編 Ch.5 で自作した mapped type そのものです。
- **\`as const\`**: 応用編 Ch.3 で学んだとおり、リテラル全体を deep に readonly + リテラル型にします。定数テーブルの定義はこれ一択です。

TS らしい設計の作法は「守りの readonly」より「そもそも変更しない」です。オブジェクトを書き換える代わりにスプレッド構文で**新しい値を作って返す**(\`{ ...user, name: "新名" }\`)。この文化は React などフロントエンドの主要ライブラリが変更検知をオブジェクト同一性で行うことともかみ合っています。`,
      code: `type ServerConfig = {
  readonly host: string;
  readonly port: number;
};

const config: ServerConfig = { host: "localhost", port: 8080 };
// config.port = 3000; // ← コメントを外すとエラー: Cannot assign to 'port'

// readonly 配列 = 破壊的メソッドが型から消えた配列
function sum(nums: readonly number[]): number {
  let total = 0;
  for (const n of nums) total += n;
  return total;
}
const scores: readonly number[] = [90, 80, 70];
// scores.push(100); // ← エラー: readonly 配列に push は存在しない
console.log(sum(scores));

// 変更ではなく「新しい値を作る」のが TS 流
const base = { host: "localhost", port: 8080 };
const prod = { ...base, host: "example.com" };
console.log(prod.host + ":" + prod.port);

// ただし readonly は実行時には消える。凍結したいなら Object.freeze(別物・実行時)`,
    },
    {
      title: 'エラー設計 — 例外か Result 型か',
      body: `Java の checked exception(\`throws IOException\`)は評判こそ悪かったものの、「**呼び出し側にエラー処理を型で強制する**」という思想自体は正しいものでした。TS の \`throw\` にはそれがありません。関数シグネチャのどこにも「何を投げうるか」は現れず、何でも throw でき、\`catch (e)\` の \`e\` は \`unknown\` 型です(strict に含まれる \`useUnknownInCatchVariables\` の効果)。つまり TS の例外は Python の例外に近い「何が飛んでくるか型では分からない」世界です。

そこで TS らしいエラー設計では、エラーを2種類に分けます。

1. **ドメイン上、予期される失敗**(入力が不正、対象が見つからない、残高不足…)— これは例外ではなく**戻り値**で表現します。使う道具は、もうお馴染みの discriminated union です: \`{ ok: true; value: T } | { ok: false; reason: E }\`。いわゆる **Result 型**で、Rust の \`Result\` や Java の \`Optional\` の思想を union で実現したものです。
2. **予期しないバグ・回復不能な異常**(不変条件の破壊、想定外の状態)— こちらは従来どおり \`throw\` して、境界(リクエストハンドラなど)でまとめて捕まえます。

Result 型の威力は、**呼び出し側が narrowing しない限り値に触れない**ことです。\`r.ok\` を確認する前に \`r.value\` へアクセスするとコンパイルエラー — 「エラー処理を忘れる」ことが型的に不可能になります。checked exception が実行規律で強制したことを、TS は制御フロー解析(応用編 Ch.2)で強制するわけです。

ひとつ設計上の注意: 判別用プロパティは \`ok: boolean\` ではなく**リテラル型**(\`ok: true\` / \`ok: false\`)で書くこと。boolean のままでは discriminated union として認識されず、narrowing が効きません。`,
      code: `// 予期される失敗は throw せず、Result 型 union で返す
type ParseResult =
  | { ok: true; value: number }
  | { ok: false; reason: string };

function parsePrice(input: string): ParseResult {
  const n = Number(input);
  if (Number.isNaN(n)) return { ok: false, reason: "数値ではない: " + input };
  if (n < 0) return { ok: false, reason: "負の価格: " + input };
  return { ok: true, value: n };
}

const r = parsePrice("1200");
// console.log(r.value); // ← コメントを外すとエラー: narrowing 前は value に触れない
if (r.ok) {
  console.log("価格:", r.value); // ここでは { ok: true; value: number } に絞られている
} else {
  console.log("失敗:", r.reason); // ここでは reason にしかアクセスできない
}

const bad = parsePrice("abc");
if (!bad.ok) {
  console.log(bad.reason);
}`,
    },
  ],
  exercise: {
    instructions: `### 演習: Java 風の class 階層を TS らしく書き直す

下のコードは Java の設計常識(enum + 抽象クラス + 継承)で書かれた決済処理です。**挙動(出力)を変えずに**、この章で学んだ TS らしいスタイルに全面的に書き直してください。

1. \`enum PayMethod\` を廃止し、判別子はリテラル型(\`"card"\` / \`"bank"\`)にする
2. class 階層を廃止し、\`type Payment = ...\` を **discriminated union** として定義する(判別用プロパティ名は \`method\`)
3. \`describe\` は \`Payment\` を受け取る**1つの関数**にし、\`switch\` で分岐する。\`default\` 節に \`never\` を使った網羅性チェックを入れること
4. 配列はプレーンオブジェクトのリテラルで作る(\`new\` は使わない)

注意: 判定では \`enum\` / \`class\` / \`extends\` / \`abstract\` / \`new\` が**コメント内も含めて**禁止ワードです。書き直したら残骸を消し切ってください。

期待される出力:

\`\`\`
card **** 4242 : 1200円
bank みずほ : 98000円
\`\`\``,
    starter: `// Java の設計常識で書かれた決済処理。TS らしく書き直そう。
enum PayMethod {
  Card = "card",
  Bank = "bank",
}

abstract class Payment {
  amount: number;
  constructor(amount: number) {
    this.amount = amount;
  }
  abstract describe(): string;
}

class CardPayment extends Payment {
  last4: string;
  constructor(amount: number, last4: string) {
    super(amount);
    this.last4 = last4;
  }
  describe(): string {
    return PayMethod.Card + " **** " + this.last4 + " : " + this.amount + "円";
  }
}

class BankPayment extends Payment {
  bankName: string;
  constructor(amount: number, bankName: string) {
    super(amount);
    this.bankName = bankName;
  }
  describe(): string {
    return PayMethod.Bank + " " + this.bankName + " : " + this.amount + "円";
  }
}

const payments: Payment[] = [
  new CardPayment(1200, "4242"),
  new BankPayment(98000, "みずほ"),
];
for (const p of payments) {
  console.log(p.describe());
}
`,
    check: {
      noErrors: true,
      mustMatch: ['\\btype Payment\\b', '\\bswitch\\b', '\\bnever\\b', 'describe\\('],
      forbid: ['\\benum\\b', '\\bclass\\b', '\\bextends\\b', '\\babstract\\b', '\\bnew\\b', '\\bany\\b', '\\bas\\b'],
      output: 'card **** 4242 : 1200円\nbank みずほ : 98000円',
    },
  },
  quiz: [
    // ---- easy (d:1) ----
    {
      d: 1,
      type: 'choice',
      prompt: '`interface` と `type` の違いとして正しいのはどれ?',
      options: [
        'union 型やタプルに名前を付けられるのは type だけで、declaration merging ができるのは interface だけ',
        'interface は実行時に型情報が残るが、type は消える',
        'type ではオブジェクトの形を表現できない',
        'interface は strict モードでは使えない',
      ],
      answer: 0,
      explanation: 'オブジェクトの形を表すだけならどちらでもほぼ等価で、違いは端にあります: `type A = B | C` のような union・タプルの命名は type のみ、同名宣言の自動マージ(declaration merging)は interface のみ。interface も type erasure で実行時には消えます(残るなら「型は消える」原則の例外になってしまいます)。type でもオブジェクトの形は普通に書けますし、strict モードと interface の可否は無関係です。',
      review: 'interface vs type と declaration merging',
    },
    {
      d: 1,
      type: 'choice',
      prompt: '現代の TS で新規コードに `enum` を使わないことが推奨される、最も本質的な理由は?',
      options: [
        '型のための構文なのに実行時コードを生成する「型は消える」原則の例外であり、literal union なら同じ安全性をランタイムコストゼロで得られるから',
        'enum は strict モードではコンパイルエラーになるから',
        'enum では文字列を値にできないから',
        'enum は Java にない機能で、Java 経験者が混乱するから',
      ],
      answer: 0,
      explanation: 'enum は実行時に JS オブジェクトを生成する、TS の中でも特異な機能です。literal union(`type Role = "admin" | "member"`)は同じタイプセーフティをコストゼロで提供します。enum は今の環境でも普通にコンパイルできて動くので「strict でエラーになる」は誤り(避けるのはあくまで設計判断です。ただし erasableSyntaxOnly を有効にした環境ではエラーになります)。文字列 enum は存在しますし、enum はむしろ Java 由来で馴染み深いからこそ注意が必要、という話でした。',
      review: 'enum は literal union で置き換える',
    },
    {
      d: 1,
      type: 'choice',
      prompt: '`readonly` プロパティへの再代入は、いつ・どのように検出される?',
      options: [
        'コンパイル時のみ。実行時にはチェックも凍結もされない',
        '実行時に例外が投げられる',
        'コンパイル時に検出され、さらに実行時にも凍結される',
        'Object.freeze が自動的に適用される',
      ],
      answer: 0,
      explanation: 'readonly は完全にコンパイル時の契約で、type erasure の原則どおり生成される JS からは消えます。実行時の例外も凍結も起こりません(だから型を欺く経路で書き換わる可能性は残ります)。実行時に凍結したい場合は自分で `Object.freeze` を呼ぶ必要があり、自動適用はされません。「readonly = final のコンパイル時版、freeze とは別物」と覚えてください。',
      review: 'readonly と immutability',
    },
    // ---- medium (d:2) ----
    {
      d: 2,
      type: 'choice',
      prompt: 'Java 出身者が書いた次のコードを「TS らしく」リファクタリングする方針として最も適切なのは?',
      code: `abstract class UserEvent {
  abstract handle(): string;
}
class LoginEvent extends UserEvent {
  userId: string;
  constructor(userId: string) { super(); this.userId = userId; }
  handle(): string { return "login: " + this.userId; }
}
class LogoutEvent extends UserEvent {
  userId: string;
  constructor(userId: string) { super(); this.userId = userId; }
  handle(): string { return "logout: " + this.userId; }
}`,
      options: [
        '`type UserEvent = { kind: "login"; userId: string } | { kind: "logout"; userId: string }` と定義し、handle は switch で分岐する1つの関数にする',
        'イベント種別を表す enum EventKind を導入し、各クラスにフィールドとして持たせる',
        'クラス群を namespace で囲み、関連するコードをひとまとめに整理する',
        '抽象クラスをやめて interface UserEvent を定義し、各クラスに implements させる',
      ],
      answer: 0,
      explanation: 'discriminated union + 関数への書き換えが TS の定石です。データがプレーンオブジェクトになり(JSON と往復可能・new 不要)、種類を追加すれば never の網羅性チェックで全 switch がエラーになって漏れを防げます。enum の追加は避けるべき機能を増やすだけで方向が逆。namespace は ES Modules 以前の遺物で整理の道具になりません。implements への変更は「class 階層 + 実行時の分岐」という構図が変わらず、本質的な改善になりません。',
      review: '継承より union — class 階層のアンラーニング',
    },
    {
      d: 2,
      type: 'choice',
      prompt: '次のコードをコンパイルするとどうなる?',
      code: `interface Point { x: number }
interface Point { y: number }

const p: Point = { x: 1, y: 2 };`,
      options: [
        'コンパイルが通る。2つの宣言はマージされ、Point は { x: number; y: number } になる',
        'Duplicate identifier エラーになる',
        '後の宣言が前を上書きし、p の初期化は「x は存在しない」エラーになる',
        'コンパイルは通るが、y は excess property としてエラーになる',
      ],
      answer: 0,
      explanation: 'これが declaration merging です。同名の interface は自動的にマージされ、Point は両方のプロパティを持ちます(type で同じことをすると Duplicate identifier エラー)。上書きではなく合成なので x も y も有効で、excess property check の問題も起きません。この仕組みは window やライブラリの型を外から拡張するためにあり、裏を返せば「うっかり同名 interface を作ってもエラーにならず静かにマージされる」ことに注意が必要です。',
      review: 'interface vs type と declaration merging',
    },
    {
      d: 2,
      type: 'choice',
      prompt: 'Java の checked exception(throws 節)が持っていた「呼び出し側にエラー処理を型で強制する」性質を、TS で実現する標準的な方法は?',
      options: [
        '戻り値を `{ ok: true; value: T } | { ok: false; reason: E }` の discriminated union にする。呼び出し側は narrowing しないと value に触れない',
        '関数シグネチャに throws 節を書き、投げうる例外の型を宣言する',
        'tsconfig で try/catch の記述を必須にするフラグを有効にする',
        'Error を継承したカスタム例外クラスを作れば、catch 時に型チェックが強制される',
      ],
      answer: 0,
      explanation: 'Result 型 union が正解です。r.ok を確認する前に r.value へアクセスするとコンパイルエラーになるため、「エラー処理を忘れる」ことが型的に不可能になります。TS に throws 節は存在せず、throw される型はシグネチャに一切現れません。try/catch を強制する tsconfig フラグも存在しません。カスタム例外クラスを作っても catch (e) の e は unknown のままで、何が飛んでくるかを型は保証しません。',
      review: 'エラー設計 — 例外か Result 型か',
    },
    {
      d: 2,
      type: 'choice',
      prompt: 'TypeScript 5.8 の `erasableSyntaxOnly` フラグ(Node.js が TS を型剥がしだけで直接実行する潮流を受けたもの)が禁止する構文の組み合わせはどれ?',
      options: [
        'enum・namespace・parameter properties(constructor(private x: number) の形)',
        'interface・type エイリアス',
        'ジェネリクスを含む、すべての型注釈',
        'async/await と for-of ループ',
      ],
      answer: 0,
      explanation: 'erasableSyntaxOnly は「型を剥がすだけで JS になる構文」だけを許すフラグです。enum・namespace・parameter properties はいずれも実行時コードを生成する TS 独自構文なので禁止されます。interface / type / ジェネリクスは純粋に消える構文なのでもちろん許可されます(これらを禁止したら TS の意味がありません)。async/await や for-of はただの JavaScript であり、TS のフラグとは無関係です。',
      review: '避けるべき機能 — namespace・parameter properties・デコレータ',
    },
    {
      d: 2,
      type: 'choice',
      prompt: '次のコードでコンパイルエラーになる行はどれ?',
      code: `function sum(nums: readonly number[]): number {
  let total = 0;
  for (const n of nums) total += n;
  return total;
}

const data: number[] = [1, 2, 3];
const frozen: readonly number[] = [4, 5, 6];

sum(data);    // (A)
sum(frozen);  // (B)
const back: number[] = frozen; // (C)`,
      options: [
        '(C) のみ。readonly を「外す」向きの代入は許されないが、「付ける」向きは許される',
        '(A) のみ。可変配列は readonly 引数に渡せない',
        '(B) と (C)。readonly 配列は一切代入に使えない',
        'どの行もエラーにならない',
      ],
      answer: 0,
      explanation: '`number[]` → `readonly number[]` は「できることが減る」だけなので安全で、(A) も (B) も通ります。逆の (C) は readonly の契約を勝手に破棄して push などが可能になってしまうため、「The type is readonly and cannot be assigned to the mutable type」エラーになります。関数引数を readonly にしておくと可変・不変どちらの配列も受け取れる、というのが「守りの readonly」の実務的な使い方です。',
      review: 'readonly と immutability',
    },
    // ---- hard (d:3) ----
    {
      d: 3,
      type: 'code',
      prompt: '次のコードを、**挙動(出力)を変えずに** enum を使わない形に書き直してください。`OrderStatus` は literal union の型として定義し直すこと。',
      starter: `enum OrderStatus {
  Pending = "pending",
  Shipped = "shipped",
  Delivered = "delivered",
}

function nextStatus(s: OrderStatus): OrderStatus {
  switch (s) {
    case OrderStatus.Pending:
      return OrderStatus.Shipped;
    case OrderStatus.Shipped:
      return OrderStatus.Delivered;
    case OrderStatus.Delivered:
      return OrderStatus.Delivered;
  }
}

console.log(nextStatus(OrderStatus.Pending));
console.log(nextStatus(OrderStatus.Shipped));
`,
      check: {
        noErrors: true,
        mustMatch: ['\\btype OrderStatus\\b', 'nextStatus\\('],
        forbid: ['\\benum\\b', '\\bany\\b', '\\bas\\b'],
        output: 'shipped\ndelivered',
      },
      explanation: '`type OrderStatus = "pending" | "shipped" | "delivered"` と定義し、case をリテラル(`case "pending": return "shipped";` など)に、呼び出しを `nextStatus("pending")` に置き換えます。文字列 enum の値はそのまま文字列なので出力は変わらず、実行時のオブジェクト生成だけがなくなります。switch は union の全メンバーを網羅しているので、戻り値型 OrderStatus のまま「return し忘れ」エラーも出ません。',
      review: 'enum は literal union で置き換える',
    },
    {
      d: 3,
      type: 'choice',
      prompt: 'Result 型のつもりで書いた次のコードは `console.log(r.value)` の行でコンパイルエラーになる。原因は?',
      code: `type FetchResult =
  | { ok: boolean; value: string }
  | { ok: boolean; error: string };

function show(r: FetchResult) {
  if (r.ok) {
    console.log(r.value); // エラー!
  }
}`,
      options: [
        'ok が両メンバーとも boolean 型(リテラル型でない)ため判別子として機能せず、if (r.ok) で narrowing されない。ok: true / ok: false に直せば通る',
        'if の条件を r.ok === true と書かなかったため、narrowing が発動しない',
        'union 型の値ではいかなるプロパティにもアクセスできないから',
        'value をオプショナル(value?: string)にしていないから',
      ],
      answer: 0,
      explanation: 'discriminated union として narrowing が効くには、判別用プロパティが各メンバーで異なる**リテラル型**である必要があります。両方 `ok: boolean` では区別がつかないため if を通っても r は union のままで、片方にしかない value へのアクセスがエラーになります。`ok: true` / `ok: false` に直すのが正解です。`=== true` と書いても boolean のままでは判別子にならず解決しません。union でも共通プロパティ(この r.ok 自体)にはアクセスできますし、value を optional にするのはエラーを握りつぶすだけで設計として誤りです。',
      review: 'エラー設計 — 例外か Result 型か',
    },
    {
      d: 3,
      type: 'choice',
      prompt: 'enum の代替としてこのパターンを書いた。`Role` はどの型になる?',
      code: `const ROLES = {
  admin: 0,
  editor: 1,
  viewer: 2,
} as const;

type Role = keyof typeof ROLES;`,
      options: [
        '"admin" | "editor" | "viewer"',
        '0 | 1 | 2',
        '{ readonly admin: 0; readonly editor: 1; readonly viewer: 2 }',
        'string',
      ],
      answer: 0,
      explanation: '`typeof ROLES` は値 ROLES の型(readonly な `{ admin: 0; editor: 1; viewer: 2 }`)で、そこに `keyof` を適用するとキー名の union `"admin" | "editor" | "viewer"` になります。値の union(`0 | 1 | 2`)が欲しい場合は `(typeof ROLES)[keyof typeof ROLES]` と indexed access まで書きます(選択肢2はその結果)。選択肢3は keyof を付けなかった場合の typeof ROLES 自体。string に広がらないのは as const がリテラル型を保持しているためで、これが外れると keyof の結果は変わりませんが値の型は number に widening されます。',
      review: 'enum は literal union で置き換える',
    },
  ],
});
