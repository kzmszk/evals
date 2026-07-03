// 応用編 Ch.3 — 危険な型
window.COURSE.register({
  id: 'adv-03',
  part: 'advanced',
  title: '危険な型 — any / unknown / never / as / satisfies',
  minutes: 45,
  goal: '型チェックを迂回する道具(any / as)の危険性を実行時の挙動レベルで理解し、unknown + narrowing と satisfies による安全な代替を使い分けられる。',
  sections: [
    {
      title: 'any — 型チェックの放棄、そして汚染',
      body: `\`any\` は Java の \`Object\` と混同されがちですが、性質はまったく違います。\`Object\` 型の変数は「何でも入る」ものの、**使うときはキャストしないとメソッドを呼べません** — 入口は緩くても出口に検査がある。\`any\` は入口も出口も無検査です。存在しないプロパティへのアクセスも、関数でない値の呼び出しも、どんな型の変数への代入も、すべてコンパイルが通ります。Python で言えば、型ヒントを全部消した素の動的型付けに戻った状態です。

さらに厄介なのが**伝染性**です。\`any\` の値に触れた式はまた \`any\` になります。\`data\` が \`any\` なら \`data.count\` も \`any\` で、それを \`number\` 型の変数に代入しても通ってしまう — この瞬間、**嘘が「検査済みの型」として固定化**され、以降のコードはその嘘を信じて型チェックされます。1つの \`any\` がモジュール全体の型安全を静かに剥がしていくのです。

\`any\` はどこから湧くか: \`JSON.parse\` の戻り値、型注釈のない引数(これは strict の \`noImplicitAny\` がエラーにしてくれます)、型定義の古いライブラリ。方針はシンプルで、**自分では書かない。外から受け取ってしまったら、即座に \`unknown\` に受け直す**(次節)。

下のコードは型チェックが全部通りますが、実行すると落ちます。「▶ エディタで試す」で確認してください。`,
      code: `// any はコンパイラとの契約解除。以下はすべて「型チェックOK」
const value: any = "hello";

const n: number = value;   // 実行時の中身は string なのに、通る(嘘の固定化)
console.log(n.toFixed(2)); // number のメソッドだから通る — だが実行時エラーで落ちる
// TypeError: n.toFixed is not a function`,
    },
    {
      title: 'unknown — 安全な受け皿',
      body: `\`unknown\` も \`any\` と同じく「どんな値でも代入できる」型です。違いは**出口**にあります。\`unknown\` の値は、narrowing(\`typeof\` / \`instanceof\` / プロパティ検査)で型を証明するまで、プロパティアクセスも演算も一切できません。「入れるのは自由、使うには証明が必要」。

Java の \`Object\` の感覚に近いのは、実は \`any\` ではなくこちらです。ただし取り出し方が違います。Java はキャスト(実行時検査つき)で取り出しますが、TS は**実行時に本当に走る検査コード**(\`typeof x === "string"\` など)を書くと、コンパイラが制御フローを解析して型を絞ってくれます。前章(Ch.2)で学んだ narrowing がそのまま武器になるわけです。型は消えても、\`typeof\` は素の JS なので実行時に残る — type erasure の世界で唯一信用できるのは「実行時に走るコード」だけ、という一貫した理屈です。

使いどころ: \`JSON.parse\` の結果の受け皿、\`catch\` した例外、なんでも受け取るユーティリティ関数の引数。**「外から来た正体不明の値は \`unknown\` で受けて、使う前に検査する」**が strict 時代の作法です。`,
      code: `function describeValue(x: unknown): string {
  // return x.toUpperCase(); // エラー: 'x' is of type 'unknown' — 証明なしでは触れない
  if (typeof x === "string") {
    return "文字列: " + x.toUpperCase(); // ここでは x は string に絞られている
  }
  if (typeof x === "number") {
    return "数値: " + x.toFixed(1);
  }
  return "その他: " + String(x);
}

console.log(describeValue("hello"));
console.log(describeValue(3.14159));
console.log(describeValue(null));`,
    },
    {
      title: 'never — 値が存在しない型',
      body: `\`never\` は「この型の値は**一つも存在しない**」ことを表す型です。Python の \`typing.Never\`(旧 \`NoReturn\`)に相当し、Java に直接の対応物はありません。

\`void\` との違いに注意してください。\`void\` の関数は**普通に戻ってきます**(返す値に意味がないだけ)。\`never\` の関数は**決して戻りません** — 必ず throw するか、無限ループするかです。

出現場面は主に3つ:

1. **決して戻らない関数の戻り値**: \`function fail(msg: string): never { throw new Error(msg); }\`
2. **narrowing で全可能性を潰した残り**: \`string | number\` を string と number の両方で処理し終えた else では、値の型は \`never\` になる
3. **網羅性チェック**(Ch.2 の回収): discriminated union の switch の default 節で \`never\` に代入する

\`\`\`ts
type AppEvent = { type: "click" } | { type: "scroll" };

function handle(e: AppEvent): void {
  switch (e.type) {
    case "click": return;
    case "scroll": return;
    default: {
      const _exhaustive: never = e; // 全ケース処理済みなら e は never なので通る。
      throw new Error("unreachable"); // union にケースを追加して処理を忘れると、ここが型エラーになる
    }
  }
}
\`\`\`

集合で考えると腑に落ちます。\`never\` は**空集合**です。空集合はあらゆる集合の部分集合なので、\`never\` は**どんな型にも代入できます**。逆に \`never\` 型の変数には(\`never\` 以外)何も代入できません。全集合である \`unknown\`(何でも入るが、どこにも代入できない)とちょうど対になる存在です。`,
    },
    {
      title: 'as は変換ではない — Java のキャストとの決定的な違い',
      body: `この章の核心です。Java のキャスト \`(User) obj\` は、**JVM が実行時に型を検査**し、合わなければ \`ClassCastException\` を**その行で**投げます。落ちた場所 = 間違えた場所。だからキャストの失敗はすぐ見つかります。

TS の \`as\` は違います。**コンパイラに「黙れ、私を信じろ」と言うだけ**です。type erasure により、コンパイル後の JS から \`as User\` は一文字残らず消えます。検査もなければ、値の変換もない。Python 経験者には「\`typing.cast()\` と完全に同じ no-op」と言えば一発で伝わるでしょう。

危険の本質はここです: **嘘をついた行では何も起きません**。嘘を信じてプロパティに触った**遠くの行**で \`TypeError\` が出るか、もっと悪いと \`undefined\` のまま静かにデータが壊れて先へ進みます。スタックトレースから \`as\` の行へ遡るのは困難で、これが「as はデバッグ不能なバグの製造機」と呼ばれる理由です。

正当な用途は少数だけあります: \`document.getElementById\` の戻り値を具体的な要素型にする(DOM の構造は TS から見えない)、TS の推論がどうしても及ばないと**自分が確信できる**限定場面、テストコードのモック。なお \`x as unknown as T\` という二段アサーションはどんな型変換でも通せる最終兵器で、コードレビューでは赤信号と思ってください。`,
      code: `type User = { name: string; age: number };

const raw = JSON.parse('{"name": "田中"}'); // any(age は入っていない)
const user = raw as User; // Java ならここで検査が走る。TS では何も起きない

console.log(user.name);           // "田中"
console.log(user.age);            // undefined — 型上は number のはずなのに
console.log(user.age.toFixed(0)); // 嘘から2行離れたここで、初めて実行時エラー`,
    },
    {
      title: 'satisfies — 検査しつつ、推論を保つ',
      body: `オブジェクトに型を与える道具は3つあり、「検査するか」「推論の詳細を保つか」で区別できます。

- **型注釈** \`const c: Config = {...}\` — 検査**する**。ただし変数の型は \`Config\` に固定され、推論された詳細(このプロパティは string だ、等)は捨てられる
- **\`as Config\`** — 検査**しない**(大きく形が違わない限り黙って通る)。型は \`Config\` になる
- **\`satisfies Config\`**(TS 4.9+)— 検査**する**。しかも変数の型は**推論結果のまま**

Java にはこの区別自体が存在しません(変数の型は常に宣言した型)。TS には「宣言型」と「推論された詳細な型」の2レイヤーがあり、\`satisfies\` は後者を殺さずに前者の検査だけを行う道具です。\`as\` と同じく実行時には消えますが、安全性は正反対 — 嘘をつくのではなく、検査を**追加**します。

主戦場は設定オブジェクトや定数テーブルです。「\`Config\` の形に合っているか確認したい。でも \`theme.accent\` が string だという推論は保ちたい(union に広げられると \`.toUpperCase()\` が呼べなくなる)」という場面で効きます。下のコードで型注釈版との違いを確かめてください。`,
      code: `type RGB = [number, number, number];

// 型注釈: 検査はされるが、各プロパティの型が RGB | string に「広がる」
const theme1: Record<string, RGB | string> = {
  primary: [0, 120, 255],
  accent: "#ff8800",
};
// theme1.accent.toUpperCase();
// ↑ エラー: accent の型は RGB | string | undefined(noUncheckedIndexedAccess も効く)

// satisfies: 同じ検査をしつつ、推論された詳細な型が残る
const theme2 = {
  primary: [0, 120, 255],
  accent: "#ff8800",
} satisfies Record<string, RGB | string>;

console.log(theme2.accent.toUpperCase()); // OK — accent は string と推論済み
console.log(theme2.primary[0]);           // OK — primary は RGB タプル`,
    },
    {
      title: 'as const と literal widening',
      body: `TS では文字列リテラル \`"GET"\` が2つの顔を持ちます。\`"GET"\` というリテラル型と、\`string\` 型。どちらとして推論されるかを決めるのが **literal widening(リテラル拡大)** のルールです:

- \`const m = "GET"\` — 再代入できないので、リテラル型 \`"GET"\` を保つ
- \`let m = "GET"\` — 再代入できるので、\`string\` に広がる
- \`const req = { method: "GET" }\` — **広がる**。\`const\` は参照の再代入を禁じるだけで、プロパティは後から書き換えられるから(Java の \`final\` と同じ理屈です — 参照の固定であって中身の固定ではない)

3つ目が実務でハマるポイントです。\`"GET" | "POST"\` のような literal union を引数に取る関数へ、オブジェクトのプロパティ経由で値を渡すと、widening のせいで \`string\` になっていてエラーになります。

ここで **\`as const\`** の出番です。式の末尾に付けると、すべてのプロパティが \`readonly\` + リテラル型に固定され、配列は readonly タプルになります(Python で list を tuple に変えて「もう変更しない」と宣言する感覚の、型版だと思ってください)。

\`as const\` は \`as\` と名前が似ていますが、危険性は正反対です。\`as User\` は「この型だと信じろ」という**嘘**になり得ますが、\`as const\` は「推論をこれ以上広げるな」という**指示**であり、嘘のつきようがありません。安心して使えます。`,
      code: `function send(url: string, method: "GET" | "POST"): void {
  console.log(method, url);
}

const m1 = "GET";                        // 型は "GET"(リテラル型を保つ)
let m2 = "GET";                          // 型は string に広がる
const req = { method: "GET" };           // method の型は string(プロパティは可変)
const reqC = { method: "GET" } as const; // { readonly method: "GET" }

send("/a", m1);   // OK
// send("/b", m2);         // エラー: string は "GET" | "POST" に渡せない
// send("/c", req.method); // エラー: 同上
send("/d", reqC.method);   // OK — リテラル型 "GET" が保たれている

console.log(m2, req.method);`,
    },
  ],
  exercise: {
    instructions: `### 演習: any を unknown + narrowing に書き直す

下の \`formatInput\` は外部入力(API レスポンスやフォーム値)を整形する関数ですが、引数が \`any\` のため型チェックが完全に無効化されています。実際、\`formatInput(true)\` は実行時にクラッシュします(まず「▶ 実行」で落ちることを確認してみてください)。

1. 引数の型を \`any\` から \`unknown\` に変える — 型エラーが出るはずです
2. \`typeof\` による narrowing で分岐し、エラーを解消する
   - 文字列 → \`"文字列: "\` + trim した値
   - 数値 → \`"数値: "\` + \`toFixed(2)\` した値
   - それ以外 → \`"その他: "\` + \`String(input)\`

期待される出力:

\`\`\`
文字列: TypeScript
数値: 3.14
その他: true
その他: null
\`\`\`

条件: \`any\` と \`as\` を使わないこと(使うと判定で弾かれます)。`,
    starter: `// 外部入力を整形する関数。引数の型が原因で、型チェックが働いていない。
// 引数の型を unknown に変え、typeof の narrowing でエラーを解消せよ。
function formatInput(input: any): string {
  if (typeof input === "string") {
    return "文字列: " + input.trim();
  }
  return "数値: " + input.toFixed(2); // 数値以外が来たら実行時にクラッシュ
}

console.log(formatInput("  TypeScript  "));
console.log(formatInput(3.14159));
console.log(formatInput(true)); // ← 現状、ここで実行時エラー
console.log(formatInput(null));
`,
    check: {
      noErrors: true,
      mustMatch: ['\\bunknown\\b', 'typeof', 'formatInput\\('],
      forbid: ['\\bany\\b', '\\bas\\b'],
      output: '文字列: TypeScript\n数値: 3.14\nその他: true\nその他: null',
    },
  },
  quiz: [
    // ---- easy (d:1) ----
    {
      d: 1,
      type: 'choice',
      prompt: '`any` と `unknown` はどちらも「どんな値でも代入できる」。両者の違いとして正しいのは?',
      options: [
        'unknown は narrowing で型を証明するまで一切の操作ができないが、any は無検査で何でもできてしまう',
        'any は null を受け入れないが、unknown は受け入れる',
        'unknown は実行時に型チェックが走るが、any は走らない',
        '違いはなく、unknown は any の新しい別名である',
      ],
      answer: 0,
      explanation:
        'unknown は「入れるのは自由、使うには証明(narrowing)が必要」、any は入口も出口も無検査で、触れた式に伝染します。null の受け入れはどちらも同じです。実行時の型チェックはどちらにもありません — 型は実行時に消える(type erasure)ので、実行時に走るのはあなたが書いた typeof などの検査コードだけです。別名でもありません(挙動が正反対)。',
      review: 'unknown — 安全な受け皿',
    },
    {
      d: 1,
      type: 'choice',
      prompt: '`const user = data as User;` の `as User` が実行時に行うことは?',
      options: [
        '何もしない。コンパイル後の JS からは消え、検査も変換も一切行われない',
        'Java のキャストと同様、型が合うか実行時に検査し、合わなければ例外を投げる',
        'data を User 型のオブジェクトに変換(コピー)する',
        'User に足りないプロパティを undefined で補って新しいオブジェクトを作る',
      ],
      answer: 0,
      explanation:
        'as はコンパイラを黙らせるだけの構文で、type erasure により実行時には跡形もなく消えます。Python の typing.cast() と同じ no-op です。Java の (User) obj は実行時に JVM が検査して ClassCastException を投げますが、TS にその仕組みはありません。変換もコピーもプロパティの補完も行われない — だから嘘をつくと、使った場所で初めて壊れます。',
      review: 'as は変換ではない — Java のキャストとの決定的な違い',
    },
    {
      d: 1,
      type: 'choice',
      prompt: '`never` 型の説明として正しいのは?',
      options: [
        '「値が一つも存在しない型」。必ず throw する関数の戻り値や、narrowing で全可能性を潰した後に現れる',
        'null と undefined だけを含む型',
        'void の別名で、戻り値のない関数に付ける',
        'どんな値でも代入できる型',
      ],
      answer: 0,
      explanation:
        'never は空集合に相当する型で、Python の typing.Never(旧 NoReturn)に対応します。void とは別物です — void の関数は普通に戻ってきます(値が無意味なだけ)が、never の関数は決して戻りません。null / undefined はそれぞれ独立した型です。「どんな値でも代入できる」のは unknown(と any)であり、never は逆に(never 以外)何も代入できません。',
      review: 'never — 値が存在しない型',
    },
    // ---- medium (d:2) ----
    {
      d: 2,
      type: 'choice',
      prompt: '次の関数はどうなる?',
      code: `function len(x: unknown): number {
  return x.length;
}`,
      options: [
        "コンパイルエラー。'x' is of type 'unknown' — narrowing で絞るまでプロパティに触れない",
        'コンパイルは通り、x に length が無ければ実行時に undefined が返る',
        'コンパイルは通る。unknown は any と同様に何でも許すから',
        '実行時に型チェックが走り、length の無い値なら例外が投げられる',
      ],
      answer: 0,
      explanation:
        'unknown は使う前に証明が必要な型で、narrowing なしのプロパティアクセスはコンパイルエラーです(typeof x === "string" で絞れば x.length が通ります)。any なら無検査で通ってしまう — それが unknown を選ぶ理由です。「実行時に型チェックが走る」選択肢は type erasure に反します: 実行時検査は自分で書いた JS コードだけです。',
      review: 'unknown — 安全な受け皿',
    },
    {
      d: 2,
      type: 'choice',
      prompt: '`style.color.toUpperCase()` の行はどうなる?',
      code: `type Style = Record<string, string | number>;

const style = {
  width: 100,
  color: "red",
} satisfies Style;

console.log(style.color.toUpperCase());`,
      options: [
        '通る。satisfies は Style への適合を検査するだけで、color は推論どおり string 型のまま',
        'エラー。color の型は string | number なので toUpperCase は呼べない',
        'エラー。style は Style 型になるため、noUncheckedIndexedAccess で undefined の可能性が付く',
        '通るが、satisfies が実行時に型変換を行うぶん遅くなる',
      ],
      answer: 0,
      explanation:
        'satisfies は「Style を満たすか」を検査しつつ、変数の型は推論結果 { width: number; color: string } のまま保ちます。だから color は string で、toUpperCase が呼べます。もし型注釈 const style: Style = ... と書いていたら、color の型は string | number | undefined(Record への添字アクセス + noUncheckedIndexedAccess)になり、まさに選択肢2・3の状況でエラーでした。satisfies は as と同様に実行時には消えるので、コストもゼロです。',
      review: 'satisfies — 検査しつつ、推論を保つ',
    },
    {
      d: 2,
      type: 'choice',
      prompt: '最終行の `setMode(config.mode)` はどうなる?',
      code: `function setMode(mode: "dark" | "light"): void {}

const config = { mode: "dark" };
setMode(config.mode);`,
      options: [
        'エラー。config.mode は string に widening されるため、"dark" | "light" に渡せない',
        '通る。config は const で宣言されているので mode は "dark" リテラル型を保つ',
        '通る。TS は実行時の値が "dark" であることを見て判断する',
        'エラー。オブジェクトのプロパティを関数の引数には渡せない',
      ],
      answer: 0,
      explanation:
        'const はオブジェクトへの「参照」の再代入を禁じるだけで、config.mode = "light" という書き換えは可能です(Java の final と同じ)。だからプロパティの型は string に広がり、literal union に渡せずエラーになります。const 宣言でリテラル型が保たれるのはプリミティブを直接入れた場合だけです。修正は { mode: "dark" } as const。「実行時の値を見て判断」は type erasure の世界ではあり得ません(チェックはすべてコンパイル時)。',
      review: 'as const と literal widening',
    },
    {
      d: 2,
      type: 'choice',
      prompt: 'default 節の `const rest: never = e;` で型エラーが出た。このエラーが意味するのは?',
      code: `type AppEvent =
  | { type: "click" }
  | { type: "scroll" }
  | { type: "keydown" };

function handle(e: AppEvent): void {
  switch (e.type) {
    case "click": return;
    case "scroll": return;
    default: {
      const rest: never = e; // ← ここで型エラー
    }
  }
}`,
      options: [
        'union に未処理のケース("keydown")が残っており、default に到達しうることをコンパイラが検出した',
        'never 型の変数はそもそも宣言できない',
        'switch の default 節では変数宣言が禁止されている',
        'e が実行時に never になることはないので、この行は常にエラーになる',
      ],
      answer: 0,
      explanation:
        '全ケースを処理し終えていれば、default での e は narrowing により never に絞られ、never への代入が通ります。ここでは "keydown" が未処理なので e の型は { type: "keydown" } のままで、never には代入できずエラー — つまりこのエラーは「case の追加漏れ」を教えてくれる網羅性チェック(Ch.2)そのものです。never 型の変数宣言も default 節での宣言も文法上は合法で、case "keydown" を足せばこのコードはエラーなく通ります。',
      review: 'never — 値が存在しない型',
    },
    // ---- hard (d:3) ----
    {
      d: 3,
      type: 'choice',
      prompt: 'このコードをコンパイル・実行するとどうなる?',
      code: `type Order = { id: number; items: string[] };

const order = JSON.parse('{"id": 1}') as Order;
console.log(order.items.length);`,
      options: [
        'コンパイルは通り、実行時に TypeError で落ちる(items は undefined なので .length が読めない)',
        'as の行で実行時例外が出る(Java の ClassCastException に相当)',
        'コンパイルエラー。items プロパティが無いことを tsc が検出する',
        '"undefined" と出力されて正常終了する',
      ],
      answer: 0,
      explanation:
        'as は無検査なのでコンパイルは通り、order.items は型上 string[] でも実行時は undefined です。undefined.length で TypeError — 嘘をついた as の行ではなく、信じて使った行で落ちるのが TS 流の壊れ方です。Java なら不正キャストの行で ClassCastException が出ますが、TS に実行時検査はありません。tsc が JSON 文字列の中身を検査することもできません(型は実行時に存在せず、逆に文字列の中身はコンパイル時の型の世界から見えない)。「undefined と出力」されるのは order.items 自体を log した場合で、.length を読んだ瞬間に例外です。',
      review: 'as は変換ではない — Java のキャストとの決定的な違い',
    },
    {
      d: 3,
      type: 'code',
      prompt:
        '次のコードは `as` がコンパイラを黙らせているため、`timeout` の書き忘れに気づけません(実行すると `timeout=undefined` と表示されます)。`as` を `satisfies` に書き換えて欠落をコンパイルエラーとして発覚させ、`timeout: 3000` を追加して、出力を `localhost:8080 timeout=3000` にしてください。',
      starter: `type Config = { host: string; port: number; timeout: number };

const config = {
  host: "localhost",
  port: 8080,
} as Config;

console.log(config.host + ":" + config.port + " timeout=" + config.timeout);
`,
      check: {
        noErrors: true,
        mustMatch: ['satisfies', 'timeout'],
        forbid: ['\\bas\\b'],
        output: 'localhost:8080 timeout=3000',
      },
      explanation:
        'as Config は「Config → 書いたリテラル型」の向きで代入可能なら黙って通すため、プロパティの欠落を検出できません(Config の値は { host, port } の形も満たすので通ってしまう)。satisfies Config に変えると通常の代入と同じ向きで検査され、timeout の欠落が Property \'timeout\' is missing というエラーとして発覚します。timeout: 3000 を足せばエラーが消え、推論型も保たれます。これが「黙らせる as」と「検査を足す satisfies」の実戦での違いです。',
      review: 'satisfies — 検査しつつ、推論を保つ',
    },
    {
      d: 3,
      type: 'choice',
      prompt: 'このコードをコンパイル・実行した結果は?',
      code: `const data = JSON.parse('{"count": "10"}');
const count: number = data.count;
console.log(count + 1);`,
      options: [
        '"101" と出力される。any が型チェックを黙らせており、実行時の count は文字列 "10" なので + は連結になる',
        '11 と出力される。count: number という注釈が値を数値に変換する',
        'コンパイルエラー。string を number 型の変数に代入できない',
        '実行時エラー。number 型の変数に文字列を入れた時点で例外が出る',
      ],
      answer: 0,
      explanation:
        'JSON.parse の戻り値は any なので、data.count も any になり、number への代入という嘘が通ります(any の伝染)。型注釈は変換をしません(type erasure — 実行時には消えるだけ)し、実行時に代入を検査する仕組みもありません。実行時の count は文字列 "10" のままで、"10" + 1 は JS の暗黙変換により文字列連結 "101" になります。Python なら "10" + 1 は TypeError、Java なら代入の時点でコンパイルエラー — JS はどちらの安全網も持たず、TS の安全網は any が切ってしまった、という問題でした。',
      review: 'any — 型チェックの放棄、そして汚染',
    },
  ],
});
