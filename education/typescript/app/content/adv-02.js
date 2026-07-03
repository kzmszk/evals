// 応用編 Ch.2 — union と narrowing(コースの心臓部)
window.COURSE.register({
  id: 'adv-02',
  part: 'advanced',
  title: 'union と narrowing — TS プログラミングの基本動作',
  minutes: 90,
  goal: 'union 型を型ガードで絞り込む制御フロー解析を体得し、Java なら class 階層で書く設計を discriminated union + never 網羅性チェックで型安全に書き直せる。型述語と assertion function で narrowing を関数に切り出せる。',
  sections: [
    {
      title: 'narrowing — if の中で型が変わる',
      body: `基礎編 Ch.4 で union 型(\`string | number\`)を学びました。応用編ではこれが主役になります。union を受け取ったら、**分岐で可能性を削って型を確定させてから使う** — この動作を **narrowing(絞り込み)** と呼び、TS プログラミングの「基本動作」です。この章を身につけると、TS のコードの書き方・読み方が根本から変わります。

Java 経験者へ: Java 16+ のパターンマッチング \`if (obj instanceof String s)\` は**新しい変数 s を導入する**仕組みでしたね。TS は違います。**同じ変数の静的型が、コードの場所によって変わります**。\`if (typeof value === "number")\` の中では value は number、その外では string | number。コンパイラがすべての分岐・return・代入を追跡してこれを計算します(**control flow analysis / 制御フロー解析**)。

Python 経験者へ: mypy が \`isinstance(x, str)\` の中で x を str 扱いするのと同じ仕組みです。TS はこれを言語の中心に据えていて、追跡の精度が非常に高い。

重要なのは **else 側や early return の後も絞られる**ことです。「number なら return した。だからこの行に来たなら string」という消去法をコンパイラがやってくれます。下のコードをエディタで開き、各所の value にカーソルを合わせて、場所ごとに表示される型が変わるのを確認してください。この「if の中で型が変わる」体験が本章のすべての土台です。`,
      code: `function format(value: string | number): string {
  // ここでは value: string | number
  // value.toFixed(2) と書くとコンパイルエラー(string かもしれないから)

  if (typeof value === "number") {
    // ここでは value: number — number のメソッドが使える
    return value.toFixed(2);
  }

  // ここでは value: string(number は上で return 済み — 消去法)
  return value.toUpperCase();
}

console.log(format(3.14159)); // 3.14
console.log(format("hello")); // HELLO`,
    },
    {
      title: 'typeof・in・instanceof — 3つの型ガード',
      body: `narrowing の引き金になる式を**型ガード(type guard)**と呼びます。基本は3つ:

- \`typeof x === "string"\` — プリミティブの判別。返る文字列は "string" / "number" / "boolean" / "undefined" / "object" / "function" / "symbol" / "bigint" の8種だけ
- \`"prop" in x\` — プロパティの存在でオブジェクトの union を判別。Python の \`hasattr\` に相当
- \`x instanceof C\` — class のインスタンス判別。**class にしか使えない**

instanceof は基礎編 Ch.1 の回収です。interface や type は実行時に消えているので \`x instanceof MyInterface\` は書けません。Java で染み付いた「型 = instanceof で判別できるもの」という直感は、TS では「実行時に残る class(Error のサブクラスなど)だけ」に縮みます。オブジェクトの形の判別には \`in\` か、次節の discriminated union を使います。

そして typeof には JS 由来の有名な罠があります: **\`typeof null\` は "object" を返します**(1995 年から直せずにいる歴史的仕様)。TS はこの仕様を正確に知っているので、\`typeof x === "object"\` で絞り込むと**候補に null が残ります**。下のコードの show 関数で確認してください。

このほか、\`x === null\` などの等値比較、truthiness チェック \`if (x)\`(ただし "" や 0 も falsy として落とすので注意)も型ガードとして機能します。`,
      code: `type TextMsg = { text: string };
type ImageMsg = { url: string; width: number };

// "in" でオブジェクト union を判別する(interface に instanceof は使えない)
function render(msg: TextMsg | ImageMsg): string {
  if ("text" in msg) {
    return msg.text; // ここでは TextMsg
  }
  return msg.url + " (" + msg.width + "px)"; // ここでは ImageMsg
}

console.log(render({ text: "こんにちは" }));
console.log(render({ url: "cat.png", width: 300 }));

// typeof の罠: null も "object"
function show(x: string | string[] | null): string {
  if (typeof x === "object") {
    // ここでは x: string[] | null — null が候補に残ることに注意!
    return x === null ? "(なし)" : x.join(", ");
  }
  return x; // ここでは string
}

console.log(show(["a", "b"]));
console.log(show(null));
console.log(show("単体"));`,
    },
    {
      title: 'discriminated union — タグ付き union という設計',
      body: `「円・長方形・三角形があり、それぞれ面積の計算が違う」— Java ならほぼ反射的にこう書くはずです:

\`\`\`java
// Java の反射神経
sealed interface Shape permits Circle, Rect, Triangle {}
record Circle(double radius) implements Shape { /* area() ... */ }
\`\`\`

TS での定石は全く違います。**discriminated union(タグ付き union)**: 各 variant に共通名のプロパティ(**タグ**。慣習では \`kind\` か \`type\`)を持たせ、その値を**リテラル型**にしたオブジェクト型の union を作ります。\`switch (s.kind)\` の各 case の中で、コンパイラが s をその variant の型に絞り込むので、\`s.radius\` に安全にアクセスできます。前節の型ガードの「オブジェクト版決定打」です。

class 階層との違いは**データと処理の分離**です。処理(area)は型の外の**ただの関数**で、分岐はポリモーフィズムではなく switch。関数型言語の代数的データ型(ADT)+ パターンマッチの TS 版だと思ってください。「型はそのままに処理を追加する」のが得意で(関数を足すだけ)、Java で visitor パターンを持ち出していた問題が最初から起きません。設計論としての深掘りは Ch.7「継承より union」でやります。

Python 経験者へ: \`dataclass\` の union + \`match\` 文(構造的パターンマッチ)に相当します。mypy でも同じ設計が推奨されています。

ルールは1つだけ: **タグはリテラル型であること**。\`kind: string\` のような広い型は判別子として機能しません(確認テストで体験します)。`,
      code: `type Shape =
  | { kind: "circle"; radius: number }
  | { kind: "rect"; width: number; height: number }
  | { kind: "triangle"; base: number; height: number };

function area(s: Shape): number {
  switch (s.kind) {
    case "circle":
      return Math.PI * s.radius ** 2; // ここでは circle に確定
    case "rect":
      return s.width * s.height; // ここでは rect に確定
    case "triangle":
      return (s.base * s.height) / 2; // ここでは triangle に確定
  }
}

const shapes: Shape[] = [
  { kind: "circle", radius: 1 },
  { kind: "rect", width: 3, height: 4 },
];

for (const s of shapes) {
  console.log(s.kind, area(s).toFixed(2));
}`,
    },
    {
      title: 'never と網羅性チェック — case 漏れをコンパイルエラーにする',
      body: `discriminated union に variant を追加したとき、**switch の case を書き足し忘れたら**どうなるか。Java 21 の sealed interface + switch 式なら、言語がコンパイルエラーにしてくれます。TS の switch は素の JS の switch なので、そのままでは**黙って素通り**します。これを Java 並みに強制するのが \`never\` を使った**網羅性チェック(exhaustiveness check)**です。

\`never\` は「値が一つも存在しない型」。narrowing で全可能性を消し終えた変数の型は never になります。そこで default 節で「変数を never 型の引数を取る関数に渡す」コードを書いておくと:

- 全 case を処理済み → default に来る型は never → 代入 OK、何も起きない
- case 漏れがある → default に来る型は**漏れた variant** → never に代入できず**コンパイルエラー**

「未来の自分が union に variant を足した瞬間、直すべき switch が全部赤くなる」— これが discriminated union 運用の生命線です。

Python 経験者へ: \`typing.assert_never\`(Python 3.11+ / mypy)と完全に同じイディオムです。TS ではライブラリ関数すらなく、自分で 3 行書きます。

なお「戻り値型を注釈しておけば case 漏れで return が抜けてエラーになる」という簡易版もありますが、void 関数では効かないので assertNever 方式を標準にしてください。下のコードで、Command に \`{ kind: "close" }\` を足してみてください — \`assertNever(cmd)\` が即座に赤くなります。`,
      code: `type Command =
  | { kind: "open"; path: string }
  | { kind: "save"; path: string }
  | { kind: "quit" };

// 網羅性チェック用のヘルパー(プロジェクトに1つ置く定番コード)
function assertNever(x: never): never {
  throw new Error("未処理の variant: " + JSON.stringify(x));
}

function run(cmd: Command): string {
  switch (cmd.kind) {
    case "open":
      return "開く: " + cmd.path;
    case "save":
      return "保存: " + cmd.path;
    case "quit":
      return "終了";
    default:
      // 全 case 処理済みなら、ここでの cmd は never — 渡せる
      // case を書き忘れると cmd がその variant 型になり、ここが赤くなる
      return assertNever(cmd);
  }
}

console.log(run({ kind: "open", path: "a.txt" }));
console.log(run({ kind: "quit" }));

// 試そう: Command に { kind: "close" } を追加 → assertNever(cmd) がエラーになる`,
    },
    {
      title: '型述語 x is T — narrowing を関数に切り出す',
      body: `「この判定、あちこちで使うから関数にしたい」— 自然な欲求ですが、素朴にやると narrowing が壊れます。戻り値を \`boolean\` と注釈した関数は、呼び出し側では「真偽値が返ってくる」以上の意味を持ちません。**コンパイラは関数の境界を越えて実装を読まない**からです。

そこで戻り値型専用の構文 **型述語(type predicate)** \`r is Ok\` を使います。「この関数が true を返したら、r は Ok 型である」という宣言で、if の条件に使うと**呼び出し側で** narrowing が起きます。

注意点が2つ:

- **保証するのはあなた**です。実装が嘘をついていても(極端な話 \`return true;\` とだけ書いても)コンパイラは信じます。\`as\` に似た「コンパイラへの申告」の一種だと自覚して、実装は正直に書くこと
- 最近の TS(5.5+)は、注釈を省略した単純な関数なら型述語を**推論**してくれることもあります。ただし \`: boolean\` と明示した瞬間に消えます。公開する判定関数には型述語を明示するのが基本です

型述語の真価は2つあります。\`Array.prototype.filter\` に渡すと**結果の配列の型ごと絞られる**こと。そして \`unknown\` から具体型への絞り込み — \`JSON.parse\` の結果のような「型が消えた実行時境界」の検証に使えることです(後者は Ch.6 の主題として本格的にやります)。`,
      code: `type Ok = { kind: "ok"; body: string };
type Err = { kind: "err"; code: number };
type Reply = Ok | Err;

// 戻り値型「r is Ok」が型述語。true なら r は Ok、とコンパイラに約束する
function isOk(r: Reply): r is Ok {
  return r.kind === "ok";
}

const replies: Reply[] = [
  { kind: "ok", body: "hello" },
  { kind: "err", code: 404 },
  { kind: "ok", body: "world" },
];

// filter に渡すと結果の型が Ok[] になる(boolean 戻り値ではこうならない)
const oks = replies.filter(isOk);
for (const r of oks) {
  console.log(r.body); // r は Ok — body に安全にアクセスできる
}

// unknown からの絞り込みにも使える(JSON など実行時境界の主戦場 — Ch.6 で詳しく)
function isStringArray(x: unknown): x is string[] {
  return Array.isArray(x) && x.every((v) => typeof v === "string");
}

const data: unknown = JSON.parse('["a","b","c"]');
if (isStringArray(data)) {
  console.log(data.map((s) => s.toUpperCase()).join(" "));
}`,
    },
    {
      title: 'assertion function — 「通ったら確定」させる関数',
      body: `型述語は if とセットで使う「質問形」でした。もう1つの形が **assertion function** — 「この関数が**例外を投げずに戻ったら**、以降 x は T である」という宣言 \`asserts x is T\` です。if を書かずに、呼び出した行より下で x の静的型が変わります。

Java 経験者へ: \`Objects.requireNonNull(x)\` に似ていますが、決定的な違いは**戻り値を使わない**ことです。requireNonNull は「非 null な値を返す」関数ですが、TS の assertion function は「**その後の行の静的型を書き換える**」関数です。制御フロー解析(1節)があるからこそ成立する形です。

Python 経験者へ: mypy が \`assert isinstance(x, str)\` の後で x を str 扱いするのと同型です。TS では assert が文ではなく普通の関数なので、自分で定義します。

条件式だけを保証する \`asserts cond\` という形もあります(Node.js の assert がこの型)。\`assert(s !== null, ...)\` のように呼ぶと、**引数に書いた式の内容**で narrowing が起きます。

罠を2つ: ① assertion function は**型注釈からしか認識されません**。推論はされないので、定義には必ず \`asserts ...\` を書くこと。② ここでも実行時チェックの本体(throw)を書くのは**あなた**です。tsc が型注釈から実行時コードを生成することはありません(type erasure — 基礎編 Ch.1 の世界観はここでも一貫しています)。`,
      code: `function assertIsString(x: unknown): asserts x is string {
  if (typeof x !== "string") {
    throw new Error("string ではありません: " + typeof x);
  }
}

function shout(input: unknown): string {
  assertIsString(input);
  // 例外を投げずにここへ到達した = チェック済み。以降 input は string
  return input.toUpperCase();
}

console.log(shout("quiet please"));

// 「条件が真」を保証する形: asserts cond(Node の assert と同じ発想)
function assert(cond: unknown, msg: string): asserts cond {
  if (!cond) throw new Error(msg);
}

function firstChar(s: string | null): string {
  assert(s !== null, "null は渡せません");
  return s.charAt(0); // ここでは s: string(assert が null を除外した)
}

console.log(firstChar("TypeScript"));`,
    },
  ],
  exercise: {
    instructions: `### 演習: 図形の面積 — class 階層を discriminated union で書き直す

Java なら反射的にこう書く題材です:

\`\`\`java
abstract class Shape { abstract double area(); }
class Circle extends Shape { double radius; /* ... */ }
class Rect extends Shape { /* ... */ }
\`\`\`

これを TS の定石 **discriminated union + switch + never 網羅性チェック** で書きます。starter の TODO を上から順に:

1. \`Shape\` 型に \`rect\`(width, height)と \`triangle\`(base, height)の variant を追加する
2. \`area\` の switch に case を追加する(\`default\` の \`assertNever\` は**残す**こと — これが網羅性チェック)
3. 型エラーがすべて消えたら「▶ 実行」→「判定」

途中経過を観察してください: variant を追加した瞬間に \`assertNever(s)\` が赤くなり、case を書き足すと消えます。これが「case 追加漏れがコンパイルエラーになる」体験です。

制約: \`class\` / \`instanceof\` / \`any\` / \`as\` は使用禁止(判定で落とします)。

期待される出力:

\`\`\`
circle: 12.57
rect: 12.00
triangle: 15.00
\`\`\``,
    starter: `// Java なら abstract class + 継承 + オーバーライドで書く題材を、
// discriminated union + 関数で書く。

// 1. Shape 型を完成させる(kind をタグにした 3 variant の union)
//    TODO: rect(width, height)と triangle(base, height)を追加
type Shape = { kind: "circle"; radius: number };

// 2. 網羅性チェック用ヘルパー(完成済み。変更不要)
function assertNever(x: never): never {
  throw new Error("未知の形: " + JSON.stringify(x));
}

// 3. area を完成させる
//    TODO: rect と triangle の case を追加(default は残す)
function area(s: Shape): number {
  switch (s.kind) {
    case "circle":
      return Math.PI * s.radius * s.radius;
    default:
      return assertNever(s); // ← 全 case を書くまでここがエラーになる
  }
}

// 4. 動作確認(変更不要。型エラーが消えれば動く)
const shapes: Shape[] = [
  { kind: "circle", radius: 2 },
  { kind: "rect", width: 3, height: 4 },
  { kind: "triangle", base: 6, height: 5 },
];

for (const s of shapes) {
  console.log(s.kind + ": " + area(s).toFixed(2));
}
`,
    check: {
      noErrors: true,
      mustMatch: ['switch\\s*\\(', 'assertNever\\(', ':\\s*never'],
      forbid: ['\\bany\\b', '\\bas\\b', '\\bclass\\b', '\\binstanceof\\b'],
      output: 'circle: 12.57\nrect: 12.00\ntriangle: 15.00',
    },
  },
  quiz: [
    // ---- easy (d:1) ----
    {
      d: 1,
      type: 'choice',
      prompt: '次の関数の (A) と (B) の位置での `x` の型は?',
      code: `function f(x: string | number) {
  if (typeof x === "string") {
    // (A)
  } else {
    // (B)
  }
}`,
      options: [
        '(A) string、(B) number — else 側も消去法で絞られる',
        '(A) string、(B) string | number — else 側では絞られない',
        'どちらも string | number — 変数の型は宣言時に固定される',
        '(A) string、(B) はコンパイルエラーになる',
      ],
      answer: 0,
      explanation: '制御フロー解析は if 側だけでなく else 側にも働きます。「string なら if 側に行った。だから else 側は残りの number」という消去法をコンパイラが計算します。「宣言時に固定」は Java の変数の感覚で、TS では同じ変数の静的型が場所によって変わります。else 側は合法なコードでありエラーにはなりません。',
      review: 'narrowing — if の中で型が変わる',
    },
    {
      d: 1,
      type: 'choice',
      prompt: 'discriminated union の「タグ」(判別子)プロパティが満たすべき条件として正しいのは?',
      options: [
        '全 variant で共通の名前を持ち、値がリテラル型(例: "circle")であること',
        'プロパティ名が必ず kind でなければならない',
        'string 型のプロパティであれば何でもよい',
        '定義は不要 — TS が実行時に自動でタグを付与してくれる',
      ],
      answer: 0,
      explanation: 'タグの条件は「共通の名前 + リテラル型」の2点です。kind という名前は慣習にすぎず、type や status でも機能します。逆に `kind: string` のような広い型は「どの variant か」を特定できないため判別子になりません(hard 問題で体験します)。「実行時に自動付与」は type erasure に反します — TS は実行時に何もしません。タグはあなたがデータに実際に持たせる普通のプロパティです。',
      review: 'discriminated union — タグ付き union という設計',
    },
    {
      d: 1,
      type: 'choice',
      prompt: '網羅性チェックに `never` が使われる理由として正しいのは?',
      options: [
        'never は「値が存在しない」型で、全 variant を処理し終えた変数の型が never になる。処理漏れがあると never にならず、代入がコンパイルエラーになるから',
        'never は null と undefined をまとめた型で、未処理の値を受け止められるから',
        'never 型の変数は実行時に自動で例外を投げるから',
        'never は any の別名で、どんな variant でも代入できるから',
      ],
      answer: 0,
      explanation: 'never は「この地点に来る値は存在しないはず」を型で表現します。switch で全 case を処理し終えると default での変数は never になり、never 引数の関数に渡せます。漏れがあると変数は「漏れた variant の型」になり、never に代入できずエラー — これが検出の仕組みです。null | undefined とは無関係、実行時の自動例外もありません(throw は自分で書く)。any の別名どころか正反対で、never には何も代入できません。',
      review: 'never と網羅性チェック — case 漏れをコンパイルエラーにする',
    },
    {
      d: 1,
      type: 'choice',
      prompt: '`if (isCircle(s))` の中で `s` が Circle に絞り込まれるようにしたい。isCircle の正しいシグネチャは?',
      code: `type Circle = { kind: "circle"; radius: number };
type Rect = { kind: "rect"; width: number; height: number };
type Shape = Circle | Rect;`,
      options: [
        'function isCircle(s: Shape): s is Circle',
        'function isCircle(s: Shape): boolean',
        'function isCircle(s: Shape): Circle',
        'function isCircle(s is Circle): boolean',
      ],
      answer: 0,
      explanation: '型述語 `s is Circle` は戻り値型の位置に書き、「true を返したら s は Circle」とコンパイラに伝えます。`: boolean` と明示すると narrowing 情報はゼロで、if の中でも s は Shape のままです。`: Circle` は「Circle の値を返す」という意味で真偽判定に使えません。引数の位置に is を書く構文は存在しません(構文エラー)。',
      review: '型述語 x is T — narrowing を関数に切り出す',
    },
    // ---- medium (d:2) ----
    {
      d: 2,
      type: 'choice',
      prompt: 'コメント位置での `x` の型は?',
      code: `function f(x: string | string[] | null) {
  if (typeof x === "object") {
    // ここでの x の型は?
  }
}`,
      options: [
        'string[] | null — typeof null は "object" なので null が候補に残る',
        'string[] — 配列だけに絞られる',
        'null — null だけに絞られる',
        'object — typeof の結果がそのまま型になる',
      ],
      answer: 0,
      explanation: 'JS では `typeof null === "object"`(歴史的仕様)であり、TS はこれを正確に織り込んで narrowing します。よって "object" 分岐には string[] と null の両方が残り、`x.join(...)` を呼ぶ前にさらに null チェックが必要です。「string[] だけ」と思い込むのが最頻出の事故です。typeof ガードは型を「object という名前の型」にするのではなく、union の候補を仕分けします。',
      review: 'typeof・in・instanceof — 3つの型ガード',
    },
    {
      d: 2,
      type: 'choice',
      prompt: 'switch の**後ろ**、コメント位置での `s` の型は?',
      code: `type Shape =
  | { kind: "circle"; radius: number }
  | { kind: "rect"; width: number; height: number }
  | { kind: "triangle"; base: number; height: number };

function f(s: Shape) {
  switch (s.kind) {
    case "circle":
      return "円";
    case "rect":
      return "長方形";
  }
  // ここでの s の型は?
}`,
      options: [
        '{ kind: "triangle"; base: number; height: number } — 処理済みの variant が消去法で消える',
        'Shape のまま — switch を抜けたら narrowing はリセットされる',
        'never — switch の後は必ず never になる',
        'rect と triangle の union — 最後の case だけが消える',
      ],
      answer: 0,
      explanation: 'circle と rect の case は return で関数を抜けるため、switch の後ろに到達できるのは triangle だけ — コンパイラはこの消去法を正確に追跡します。「switch を抜けたらリセット」は誤りで、narrowing は制御フロー全体で継続します。never になるのは**全** case を処理し終えた場合だけです(それが網羅性チェックの原理)。case を通過した variant は消えるので「最後の case だけ消える」も誤りです。',
      review: 'discriminated union — タグ付き union という設計',
    },
    {
      d: 2,
      type: 'choice',
      prompt: '`v.toUpperCase()` の行はどうなる?',
      code: `function isStr(x: unknown): boolean {
  return typeof x === "string";
}

function f(v: unknown) {
  if (isStr(v)) {
    console.log(v.toUpperCase());
  }
}`,
      options: [
        'コンパイルエラー — 戻り値型を boolean と明示すると narrowing 情報が消え、v は unknown のまま',
        '通る — コンパイラが isStr の実装を読んで narrowing してくれる',
        '通る — if の条件が真なら v は自動的に string になる',
        'コンパイルは通るが、実行時に必ず例外が出る',
      ],
      answer: 0,
      explanation: 'コンパイラは関数の境界を越えて実装を読みません(明示的な型注釈がすべて)。`: boolean` は「真偽値が返る」以上の情報を持たないため、if の中でも v は unknown のままで `v.toUpperCase()` はエラーです。修正は戻り値型を `x is string` にすること。なお最近の TS(5.5+)は注釈を**省略**した単純な関数なら型述語を推論することがありますが、boolean と明示するとその推論も打ち消されます。実行時には正しく動くコードなので「実行時に必ず例外」も誤りで、これは純粋にコンパイル時の問題です。',
      review: '型述語 x is T — narrowing を関数に切り出す',
    },
    {
      d: 2,
      type: 'choice',
      prompt: '`v.toFixed(1)` がコンパイルできる理由として正しいのは?',
      code: `function assertIsNumber(x: unknown): asserts x is number {
  if (typeof x !== "number") throw new Error("not a number");
}

function f(v: unknown) {
  assertIsNumber(v);
  console.log(v.toFixed(1));
}`,
      options: [
        'assertIsNumber が「例外を投げずに戻ったら x は number」と宣言しているため、呼び出し行より下で v の静的型が number になる',
        'assertIsNumber が v を実行時に number 型へ変換するため',
        'asserts と書くと tsc が実行時チェックコードを自動生成するため',
        'assertion function を通した変数は any になり、何でも呼べるため',
      ],
      answer: 0,
      explanation: '`asserts x is number` は「この関数が正常に return したら x は number」という制御フローへの宣言で、呼び出し以降の v の静的型を書き換えます。値の変換は起きません(v はそのまま)。tsc がチェックコードを生成することもありません — throw を書くのはあなたで、型注釈は実行時に消えます(type erasure)。any になるわけでもなく、number という具体型に絞られるからこそ toFixed が呼べます。Java の requireNonNull が「値を返す」のに対し、こちらは「後続行の型を変える」のが決定的な違いです。',
      review: 'assertion function — 「通ったら確定」させる関数',
    },
    // ---- hard (d:3) ----
    {
      d: 3,
      type: 'code',
      prompt: '次のコードは "quit" の処理が漏れているのに default が握りつぶしており、実行時エラーでしか気づけません。① `case "quit"` を追加して "終了" を返す ② default を **never を使った網羅性チェック**に書き換え、今後の case 追加漏れがコンパイルエラーになるようにせよ(any / as 禁止)。',
      starter: `type Command =
  | { kind: "open"; path: string }
  | { kind: "save"; path: string }
  | { kind: "quit" };

function run(cmd: Command): string {
  switch (cmd.kind) {
    case "open":
      return "開く: " + cmd.path;
    case "save":
      return "保存: " + cmd.path;
    default:
      // ↓ これでは漏れがあっても実行するまで気づけない
      throw new Error("未知のコマンド");
  }
}

console.log(run({ kind: "quit" }));
`,
      check: {
        noErrors: true,
        mustMatch: ['case\\s+[\'"]quit', ':\\s*never'],
        forbid: ['\\bany\\b', '\\bas\\b'],
        output: '終了',
      },
      explanation: '模範解答は `case "quit": return "終了";` を追加し、default を `const _exhaustive: never = cmd; throw new Error(...)` (または never 引数の assertNever 関数呼び出し)に置き換えます。default で throw するだけのコードは、variant 追加時にコンパイラが何も言えず、漏れが本番の実行時エラーになります。cmd を never に代入しておけば「ここに到達する型は残っていないはず」を静的に表明でき、漏れた瞬間に代入エラーで検出されます。',
      review: 'never と網羅性チェック — case 漏れをコンパイルエラーにする',
    },
    {
      d: 3,
      type: 'code',
      prompt: '`isPoint` の**戻り値型**を型述語に変えて、if の中で `data` を Point として使えるようにせよ。実装本体と if の中身は変更不要(any / as 禁止)。',
      starter: `type Point = { x: number; y: number };

// unknown を安全に調べる定石(in + typeof のチェーン)
function isPoint(v: unknown): boolean {
  return (
    typeof v === "object" && v !== null &&
    "x" in v && typeof v.x === "number" &&
    "y" in v && typeof v.y === "number"
  );
}

const data: unknown = JSON.parse('{"x": 3, "y": 4}');

if (isPoint(data)) {
  // 原点からの距離を出したいが、data が unknown のままでエラーになる
  console.log(Math.sqrt(data.x * data.x + data.y * data.y));
}
`,
      check: {
        noErrors: true,
        mustMatch: ['is\\s+Point', 'Math\\.sqrt'],
        forbid: ['\\bany\\b', '\\bas\\b', 'data:\\s*Point'],
        output: '5',
      },
      explanation: '修正は1箇所: 戻り値型 `: boolean` を `: v is Point` に変えます。これで true 側の分岐で data が Point に絞られ、data.x / data.y に安全にアクセスできます。boolean のままでは判定結果の意味が関数の外に伝わりません。実装本体の `typeof v === "object" && v !== null && "x" in v && ...` は、unknown を as なしで安全に調べる定石チェーンです(in ガードが unknown 由来の object にも効く)。JSON.parse の結果を検証するこのパターンは Ch.6 で zod に発展します。',
      review: '型述語 x is T — narrowing を関数に切り出す',
    },
    {
      d: 3,
      type: 'choice',
      prompt: 'コメント位置での `m` の型は?',
      code: `type Msg =
  | { kind: string; body: string }
  | { kind: "ping" };

function f(m: Msg) {
  if (m.kind === "ping") {
    // ここでの m の型は?
  }
}`,
      options: [
        'Msg のまま(絞られない)— 1つ目の variant の kind が string という広い型のため、判別子として機能しない',
        '{ kind: "ping" } に絞られる — kind の比較は常に discriminated union として働く',
        '{ kind: string; body: string } に絞られる — string は "ping" を含むから',
        'コンパイルエラー — union のプロパティ比較は禁止されている',
      ],
      answer: 0,
      explanation: 'discriminated union のタグは**全 variant でリテラル型**でなければなりません。1つ目の variant の kind は string なので、その値が "ping" である可能性を否定できず、比較しても両方の variant が候補に残ります(m.body へのアクセスはエラーのまま)。「常に働く」は誤りで、働くのはタグがリテラル型のときだけ。「1つ目に絞られる」も誤りで、2つ目の kind: "ping" も当然候補です。比較自体は合法なのでコンパイルエラーにもなりません。設計時に `kind: string` と書いてしまうのが Java の「String type フィールド」の直感による典型的な事故です。',
      review: 'discriminated union — タグ付き union という設計',
    },
    {
      d: 3,
      type: 'choice',
      prompt: 'Java 21 の sealed interface + switch 式に慣れた開発者が、TS の discriminated union + switch を使う。両者の違いとして**正しい**のは?',
      options: [
        'TS の switch は素の JS の switch なので、そのままでは case 漏れがあっても黙って通りうる。網羅性の強制は never への代入(assertNever)などを自分で仕込んで実現する',
        'TS でも union に対する switch は言語仕様として網羅が強制されるため、case 漏れは常にコンパイルエラーになる',
        'TS の switch は実行時に union の型情報を参照し、未知の variant を自動で例外にする',
        'TS では instanceof チェーンを使えば interface に対しても網羅性チェックが言語機能として働く',
      ],
      answer: 0,
      explanation: 'Java 21 では sealed + switch 式の網羅性を**言語が**強制しますが、TS の switch はただの JS の switch で、デフォルトでは漏れても素通りします(void 関数なら戻り値チェックにも引っかからない)。だから never イディオムを opt-in で仕込みます。「実行時に union の型情報を参照」は type erasure に真っ向から反します — 実行時に union は存在しません。instanceof は class 専用で interface には使えず(基礎編 Ch.1)、網羅性チェックの言語機能もありません。',
      review: 'never と網羅性チェック — case 漏れをコンパイルエラーにする',
    },
  ],
});
