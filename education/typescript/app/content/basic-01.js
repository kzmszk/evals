// 基礎編 Ch.1 — オリエンテーション
window.COURSE.register({
  id: 'basic-01',
  part: 'basic',
  title: 'オリエンテーション — TS は「JS + 型」である',
  minutes: 25,
  goal: 'JS と TS の違いが「型」だけであることを把握し、型注釈の基本の書き方と「型はコンパイル時に消える」ことを理解して、型エラーメッセージを読んで直す最初の一歩を踏み出せる。',
  sections: [
    {
      title: 'JS と TS はどこが違うのか — 足されたのは「型」だけ',
      body: `最初に全体地図を描きます。TypeScript は JavaScript と**別の言語ではありません**。JavaScript のコードに「**型の情報を書き足せるようにしたもの**」が TypeScript です。文法の9割は JS そのままで、正しい JS のコードは(ほぼ)そのまま正しい TS でもあります。

TS が JS に**足したもの**は、突き詰めると3つだけです:

1. **型注釈** — 変数や引数に \`: string\` のように型を書ける(次の節でやります)
2. **型を定義する構文** — \`interface\` や \`type\` で「この形のオブジェクト」に名前を付けられる(Ch.4)
3. **ジェネリクス** — 型を引数にできる仕組み(応用編)

逆に言うと、それ以外 — \`if\` / \`for\` / 関数 / オブジェクト / クラス / 非同期処理 — は**すべて JS の文法そのもの**です。だからこのコースの基礎編は「JS の文法(Ch.2〜3)」と「TS が足した型(Ch.4)」の両方を扱います。JS をほとんど知らなくても、このコースの中で身につくので大丈夫です。

下のコードは型注釈を1つも書いていない「ただの JS」ですが、そのまま TS としても正しく動きます。「▶ エディタで試す」で開いて実行してみてください。`,
      code: `// 型注釈ゼロ。これは JS であり、同時に正しい TS でもある
const items = ["りんご", "みかん", "バナナ"];
let total = 0;
for (const item of items) {
  console.log(item + " を買いました");
  total = total + 1;
}
console.log(total + " 品です");

// エディタで items や total にカーソルを乗せてみてください。
// 注釈を書いていなくても、TS が型を「推論」しています
// (items は string[]、total は number)`,
    },
    {
      title: '型の指定の仕方 — 名前のあとに「: 型」を付けるだけ',
      body: `型注釈の基本ルールはひとつだけです: **名前のあとにコロンを置き、型を書く**。

\`\`\`ts
const age: number = 30;          // 変数
function greet(name: string): string {  // 引数と、( ) の後ろに戻り値
  return "こんにちは、" + name;
}
\`\`\`

Java と語順が逆な点に注意してください。Java は \`String name\`(型が先)、TS は \`name: string\`(名前が先)です。

まず覚える型はこれだけで足ります:

- \`string\` — 文字列。Java と違い \`String\` ではなく小文字
- \`number\` — 数値。int と double の区別はなく、数はすべて \`number\`
- \`boolean\` — 真偽値
- \`string[]\` / \`number[]\` — 配列。「要素の型 + \`[]\`」
- \`{ name: string; age: number }\` — オブジェクト。「この名前のプロパティがこの型で存在する」という**形**をそのまま書く

なお、前の節で見たとおり TS は代入された値から型を**推論**できるので、実は \`const age = 30\` と書くだけでも \`age\` は \`number\` になります。ただし**関数の引数だけは例外**です — 呼ばれるまで値が来ないので推論のしようがなく、strict モードでは注釈が必須です(書かないと \`implicitly has an 'any' type\` というエラーになります)。「どこに書いて、どこは推論に任せるか」の使い分けは Ch.4 でじっくりやります。`,
      code: `// 基本の型注釈を一通り試す
const userName: string = "田中";
const age: number = 30;
const isActive: boolean = true;
const scores: number[] = [80, 92, 75];

// オブジェクトは「形」をそのまま型として書く
const user: { name: string; age: number } = { name: userName, age: age };

function describe(u: { name: string; age: number }): string {
  return u.name + "(" + u.age + "歳)";
}

console.log(describe(user), scores.length + "科目");

// 試しに age に文字列を入れてみてください → 即座に赤線が出ます
// const age2: number = "30";`,
    },
    {
      title: '型は実行時に消える',
      body: `ここで、TS の仕組みで**いちばん大事な事実**をひとつ。あなたが書いた \`: string\` や \`interface\` は、**プログラムが実行されるときには存在しません**。

TS のコンパイラ(\`tsc\`)がやることは2つです:

1. 実行**前**に、型の整合性をチェックしてエラーを報告する
2. 型注釈を**すべて削除**して、素の JavaScript を出力する

つまり型注釈は「実行前の検査にだけ使われるメモ書き」で、検査が終わったら消しゴムで消されます。実行時の動作は、型を書いても書かなくても**まったく同じ**です。この仕組みには **type erasure(型消去)** という名前がついています(用語は「検索するときに便利」程度で OK です)。

この帰結として、Java の感覚だと「できるはず」のことがいくつかできません:

- \`x instanceof MyInterface\` は書けない(interface は実行時に存在しないので、実行時の検査には使えない)
- \`JSON.parse\` で読んだデータが本当にその型かは、型注釈を書いても**保証されない**(実行時には誰も検査していない)

Java ではクラスの型情報が実行時にも残っていて \`instanceof\` で調べられますが、TS では全部消えます。「じゃあ型を書く意味は?」— 実行**前**に間違いの大半を潰せるからです。実行時の検証が必要な場面(API レスポンスなど)の扱いは応用編 Ch.6 で徹底的にやります。

下のコードで「型注釈があってもなくても実行結果は同じ」を確かめてください。`,
      code: `// 型注釈は実行時の挙動を一切変えない
const price: number = 1200;
const label: string = "コーヒー";

function total(unit: number, count: number): number {
  return unit * count;
}

console.log(label, total(price, 3));
// この TS から生成される JS には ": number" も ": string" も残らない。
// 試しに注釈を全部消して実行しても、結果は同じ`,
    },
    {
      title: 'ツールチェーンの分業 — tsc は型チェック係',
      body: `Java では \`javac\` がコンパイルし、JVM が実行します。TS の世界は分業がもう少し細かい:

- **tsc(TypeScript コンパイラ)** — 型チェックと JS への変換。実行はしない
- **Node.js / ブラウザ** — 生成された JS を実行する
- **tsx / esbuild / Vite など** — 開発時に「変換して即実行」を高速にやる道具(実は多くが**型チェックを省略**して変換だけする)

重要な帰結: **型エラーがあっても JS は生成できます**。TS のエラーは Java のコンパイルエラーのような「絶対的な停止」ではなく、デフォルトでは警告に近い扱いです(このアプリの「実行」ボタンも、型エラーがあっても実行します。試してみてください)。

実務では \`tsconfig.json\` の \`strict: true\` を必ず有効にします。このコースの演習環境も常に strict です。理由は簡単で、strict でない TS は型チェックの穴が多すぎて学ぶ価値が半減するからです。`,
    },
    {
      title: '型エラーを読む — 最初のスキル',
      body: `TS 学習の実務スキルとして最初に身につけるべきは、文法よりも**エラーメッセージを読む力**です。もっとも頻出するのはこの形:

\`\`\`
Type 'X' is not assignable to type 'Y'
\`\`\`

「X 型の値を、Y 型が要求される場所に入れようとした」という意味です。**X が「実際に渡したもの」、Y が「要求されているもの」**。この順番を覚えるだけでエラーの8割は読めます。

下のコードには型エラーが2つあります。「▶ エディタで試す」で開くと、エディタが赤線でエラーを示します。カーソルを合わせてメッセージを読み、どちらが「実際」でどちらが「要求」かを確認してください(直すのは演習でやります)。`,
      code: `function greet(name: string): string {
  return "こんにちは、" + name + "さん";
}

const message: string = greet(42); // エラー: number は string に代入できない
const count: number = greet("鈴木"); // エラー: string は number に代入できない
console.log(message, count);`,
    },
  ],
  exercise: {
    instructions: `### 演習: 型エラーを読んで直す

下のコードには型エラーが**3箇所**あります。エディタの赤線とエラーメッセージを手がかりに、**関数側は変えず、呼び出し側と変数側を**直してください。

- \`Type 'X' is not assignable to type 'Y'\` の X(実際)と Y(要求)を意識して読むこと
- 直し終わったら「▶ 実行」で動作を確認し、「判定」でクリア判定

期待される出力:

\`\`\`
田中さんの合計: 3600円
\`\`\``,
    starter: `function formatTotal(name: string, unitPrice: number, count: number): string {
  return name + "さんの合計: " + unitPrice * count + "円";
}

// ↓ この3行を直す(formatTotal 自体は変更しない)
const result: number = formatTotal("田中", 1200, 3);
const bad1 = formatTotal(1200, "田中", 3);
console.log(result);
`,
    check: {
      noErrors: true,
      mustMatch: ['formatTotal\\('],
      forbid: ['\\bany\\b', '\\bas\\b'],
      output: '田中さんの合計: 3600円',
    },
  },
  quiz: [
    // ---- easy (d:1) ----
    {
      d: 1,
      type: 'choice',
      prompt: '引数 `name` が文字列で、戻り値が数値の関数。TypeScript の正しい書き方は?',
      options: [
        '`function f(name: string): number { ... }`',
        '`function f(String name): number { ... }`',
        '`number function f(name: string) { ... }`',
        '`function f(name = string) -> number { ... }`',
      ],
      answer: 0,
      explanation: '型注釈は「名前のあとに `: 型`」。引数は `name: string`、戻り値は `( )` の直後に `: number` です。Java のように型を名前の前に書く語順(`String name`)や、戻り値型を先頭に書く形は TS では文法エラーになります。`->` は TS の記法ではありません。',
      review: '型の指定の仕方 — 名前のあとに「: 型」を付けるだけ',
    },
    {
      d: 1,
      type: 'choice',
      prompt: 'JavaScript と TypeScript の関係の説明として正しいのは?',
      options: [
        'TS は JS に型の仕組みを足したもので、それ以外の文法は JS と共通',
        'TS と JS は文法が大きく異なる別々の言語',
        'TS は JS を高速化するためのコンパイラ最適化言語',
        'JS は TS から型を学んで進化した後継言語',
      ],
      answer: 0,
      explanation: 'TS が JS に足したのは型注釈・型定義構文(interface / type)・ジェネリクスなど「型」に関するものだけで、if / for / 関数 / オブジェクトなどの文法は JS そのままです。実行速度にも影響しません(型は実行前に消されるため)。JS が TS の後継という関係でもありません。',
      review: 'JS と TS はどこが違うのか — 足されたのは「型」だけ',
    },
    {
      d: 1,
      type: 'choice',
      prompt: 'TypeScript の型注釈(`: string` など)は、コンパイル後の JavaScript にどう反映される?',
      options: [
        'すべて削除され、JS には一切残らない',
        '実行時チェックを行うコードに変換される',
        'コメントとして JS に埋め込まれる',
        'クラスの型情報だけは実行時に残る',
      ],
      answer: 0,
      explanation: '型注釈はコンパイル時にすべて消えます(type erasure)。実行時チェックへの変換は行われません — これが「型を書いても API レスポンスの安全は保証されない」理由です。Java ではクラス型情報が実行時に残りますが、TS では interface もクラスの型としての側面も消えます。',
      review: '型は実行時に消える',
    },
    {
      d: 1,
      type: 'choice',
      prompt: '型エラー `Type \'number\' is not assignable to type \'string\'` の正しい読み方は?',
      options: [
        'string が要求される場所に、number 型の値を渡した',
        'number が要求される場所に、string 型の値を渡した',
        'number 型と string 型は演算できない',
        'number 型の変数が未初期化である',
      ],
      answer: 0,
      explanation: '`Type X is not assignable to type Y` は「X(実際に渡したもの)を Y(要求)の場所に入れられない」。前が実際、後ろが要求です。この順番を覚えるだけでエラーの大半が読めるようになります。',
      review: '型エラーを読む — 最初のスキル',
    },
    // ---- medium (d:2) ----
    {
      d: 2,
      type: 'choice',
      prompt: '「点数の配列」を受け取る引数の型注釈として正しいのは?',
      options: [
        '`scores: number[]`',
        '`scores: array`',
        '`scores: [number]`',
        '`scores: List<number>`',
      ],
      answer: 0,
      explanation: '配列は「要素の型 + `[]`」で `number[]` です。`array` という型名はありません。`[number]` は「要素がちょうど1個のタプル」という別の意味になります。`List` は Java のコレクションで、TS には存在しません(配列は言語組み込みです)。',
      review: '型の指定の仕方 — 名前のあとに「: 型」を付けるだけ',
    },
    {
      d: 2,
      type: 'choice',
      prompt: 'TypeScript のコンパイラ `tsc` がやること2つの組み合わせとして正しいのは?',
      options: [
        '型チェック + 型を消した JS の出力',
        '型チェック + プログラムの実行',
        'JS の実行 + パフォーマンス最適化',
        '型チェック + 実行時型検証コードの挿入',
      ],
      answer: 0,
      explanation: '`tsc` は型チェックと JS への変換(型の削除)を行い、実行はしません。実行するのは Node.js やブラウザです。実行時型検証コードの挿入も行いません — 実行時の検証が必要なら自分で書く必要があります(応用編で扱います)。',
      review: 'ツールチェーンの分業 — tsc は型チェック係',
    },
    {
      d: 2,
      type: 'choice',
      prompt: '次のコードはコンパイル時・実行時にどうなる?',
      code: `interface User { name: string }

function check(x: unknown) {
  if (x instanceof User) {
    console.log("User です");
  }
}`,
      options: [
        'コンパイルエラーになる(interface は実行時に存在しないため instanceof に使えない)',
        '正常にコンパイルされ、x が User の形なら "User です" と出力される',
        '正常にコンパイルされるが、実行時に必ず例外が出る',
        'コンパイルは通るが instanceof は常に false になる',
      ],
      answer: 0,
      explanation: 'interface は型消去で実行時に存在しないため、`instanceof` の右辺には使えず「\'User\' only refers to a type, but is being used as a value here」というコンパイルエラーになります。Java の `instanceof MyInterface` の感覚が通用しない代表例です。実行時に形を確かめたい場合はプロパティの存在チェックなどで行います(応用編の narrowing で学びます)。',
      review: '型は実行時に消える',
    },
    {
      d: 2,
      type: 'choice',
      prompt: '型エラーが1件あるファイルを `tsc` でコンパイルした。デフォルト設定(noEmitOnError なし)での結果は?',
      options: [
        'エラーは報告されるが、JS ファイルは生成される',
        'Java と同様、エラーがある限り JS は一切生成されない',
        'エラー行だけが削除された JS が生成される',
        'エラーが警告に自動変換され、報告されない',
      ],
      answer: 0,
      explanation: 'TS はデフォルトでは型エラーがあっても JS を出力します(`noEmitOnError` を有効にすれば止められます)。「型チェック」と「変換」が独立した処理だからで、Java のコンパイルエラーとは性格が違います。tsx や esbuild などの開発ツールが型チェックを省略して変換だけ行えるのも、この分離のおかげです。',
      review: 'ツールチェーンの分業 — tsc は型チェック係',
    },
    {
      d: 2,
      type: 'choice',
      prompt: 'API から受け取った JSON を次のように処理した。`user.name.length` の行で実行時エラーが起きる可能性は?',
      code: `const user: { name: string } = JSON.parse(response);
console.log(user.name.length);`,
      options: [
        'ある。型注釈は実行時の中身を保証しないため、name が無ければ実行時エラーになる',
        'ない。型注釈があるので name の存在はコンパイラが保証する',
        'ない。JSON.parse が型注釈に合わせて検証してくれる',
        'ある。ただし tsc が警告を出すので気づける',
      ],
      answer: 0,
      explanation: '型は実行時に消えるため、`JSON.parse` が実際に返す値の形は誰も検証していません。name プロパティが無い JSON が来れば `user.name` は undefined になり、`.length` で実行時エラーです。しかも tsc はこのコードに警告を出しません(JSON.parse の戻り値が any のため)。外部から来るデータの境界では実行時バリデーションが必要になります — 応用編 Ch.6 の主題です。',
      review: '型は実行時に消える',
    },
    // ---- hard (d:3) ----
    {
      d: 3,
      type: 'code',
      prompt: '次のコードには型エラーが2箇所あります。**関数 `describe` は変更せず**、呼び出し側だけを直して、出力が `商品A は 500円` になるようにしてください。',
      starter: `function describe(name: string, price: number): string {
  return name + " は " + price + "円";
}

const line: number = describe(500, "商品A");
console.log(line);
`,
      check: {
        noErrors: true,
        mustMatch: ['describe\\('],
        forbid: ['\\bany\\b', '\\bas\\b', 'function describe\\(name: number'],
        output: '商品A は 500円',
      },
      explanation: '直すのは2点: ① 引数の順序(`describe("商品A", 500)` — string, number の順)② 受け取る変数の型(戻り値は string なので `const line: string` にするか、注釈を消して推論に任せる)。エラーメッセージの「実際」と「要求」を読めば機械的に直せます。',
      review: '型エラーを読む — 最初のスキル',
    },
    {
      d: 3,
      type: 'choice',
      prompt: 'Java 経験者が書いた次の主張のうち、TypeScript について**正しい**ものはどれ?',
      options: [
        '「ジェネリクスの型引数も interface も実行時には消えるので、リフレクション的な仕組みは型には使えない」',
        '「クラスを使えば Java 同様、実行時に型引数の情報を取得できる」',
        '「strict モードなら型注釈が実行時アサーションに変換される」',
        '「tsc が通ったコードは、実行時に型起因のエラーを起こさないことが保証される」',
      ],
      answer: 0,
      explanation: 'TS ではジェネリクスも interface も型注釈もすべて消えます。クラスは実行時に存在しますが「値としてのクラス」だけで、型引数の情報は残りません。strict モードは型チェックの厳しさの設定であり、実行時の挙動には無関係です。そして tsc が通っても、外部データ(JSON など)や `any` の混入があれば実行時エラーは起こりえます — 「コンパイルが通れば実行時も安全」は境界の内側でのみ成り立つ近似です。',
      review: '型は実行時に消える',
    },
    {
      d: 3,
      type: 'choice',
      prompt: '`tsx` や `esbuild` で TS ファイルを直接実行して開発しているプロジェクトがある。このワークフローの落とし穴として正しいのは?',
      options: [
        'これらのツールは多くの場合、型チェックを省略して変換だけ行うため、型エラーに気づかないまま実行できてしまう',
        'これらのツールは型注釈を JS に残すため、実行速度が低下する',
        'これらのツールは strict モードを強制するため、既存コードが動かなくなる',
        '型エラーがあると実行前に必ず停止するため、開発速度が落ちる',
      ],
      answer: 0,
      explanation: 'tsx / esbuild は高速化のために「型を剥がして JS にする」変換だけを行い、型チェックをしないのが普通です。だから実行できてしまう = 型が正しい、ではありません。実務では CI や editor で `tsc --noEmit` による型チェックを別途走らせます。「変換」と「チェック」が別の仕事であることを理解しているかを問う問題でした。',
      review: 'ツールチェーンの分業 — tsc は型チェック係',
    },
  ],
});
