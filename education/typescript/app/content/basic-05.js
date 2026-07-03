// 基礎編 Ch.5 — モジュールとツールチェーン
window.COURSE.register({
  id: 'basic-05',
  part: 'basic',
  title: 'モジュールとツールチェーン',
  minutes: 30,
  goal: 'ES Modules の import/export を Java/Python の流儀と対比して読み書きでき、tsconfig.json・tsc/tsx/バンドラ・.d.ts の役割分担を説明できる。仕上げに、基礎編の知識を総動員して strict な集計プログラムを完成させる。',
  sections: [
    {
      title: 'ES Modules — ファイルがモジュールになる',
      body: `TS(と現代の JS)のモジュールシステムは **ES Modules(ESM)** です。Python 経験者にはなじみやすく、Java 経験者には発想の転換が要ります。

- **Python**: ファイル = モジュール。TS も同じです
- **Java**: クラスが単位で、\`package\` 宣言 + ディレクトリ構造で名前空間を作る。TS に package 宣言はなく、**ファイルパスがそのまま名前空間**です

Python との最大の違いは公開範囲の考え方です。Python はモジュール内の名前が全部見え(\`_\` は紳士協定)、Java は \`public\` を付けます。ESM は **\`export\` を付けたものだけが外から見える**、明示的公開のスタイルです。

\`\`\`ts
// math.ts — export したものだけが公開される
export function sum(values: number[]): number {
  let total = 0;
  for (const v of values) total += v;
  return total;
}
export const TAX_RATE = 0.1;

function helper() { /* export なし = このファイル専用 */ }
\`\`\`

使う側は **named import(波括弧)** が基本形です:

\`\`\`ts
// main.ts
import { sum, TAX_RATE } from "./math";

console.log(sum([100, 200]) * (1 + TAX_RATE));
\`\`\`

Python の \`import math\` のように「モジュールごと受け取って \`math.sum(...)\` と使う」スタイルもあります:

\`\`\`ts
import * as math from "./math";
console.log(math.sum([1, 2, 3]));
\`\`\`

もうひとつ **default export**(\`export default function parse() {...}\` → \`import parse from "./parser"\`)がありますが、import 側が好きな名前を付けられてしまい typo にも気づきにくいので、実務では named export を優先する流儀が多数派です。Java 風の \`import com.example.math.*;\` や Python 風の \`from math import sqrt\` 構文はどちらも無効です。

なお、**この学習環境は単一ファイルの playground なので import/export は実行できません**。構文はここで目に焼き付け、この章の演習はモジュールなしで完結する形でやります。`,
    },
    {
      title: 'tsconfig.json — strict: true は非交渉',
      body: `\`tsconfig.json\` はプロジェクトの型チェック設定です。Java の \`javac\` オプションや Python の \`mypy.ini\` に相当しますが、決定的に重要な点がひとつ: **TS の型チェックの厳しさは設定次第で大きく変わる**ということです。最小構成はこの程度です:

\`\`\`json
{
  "compilerOptions": {
    "strict": true,
    "target": "es2020",
    "module": "esnext",
    "moduleResolution": "bundler"
  }
}
\`\`\`

\`strict: true\` は単一のオプションではなく、**厳格チェック群の一括スイッチ**です。主な中身:

- \`noImplicitAny\` — 型注釈のない引数などを暗黙の \`any\` にしない(any = 型チェックの放棄)
- \`strictNullChecks\` — \`null\` / \`undefined\` を型で区別する。Ch.4 でやった「Optional が言語に組み込まれている」体験は、実はこのフラグの仕事
- \`strictFunctionTypes\` ほか(応用編 Ch.8 で深掘り)

そして **strict は非交渉です**。strict でない TS は、null 安全がなく any が野放しになり、Java でいえば全変数が \`Object\` 型のようなもの。Python でいえば mypy を \`--strict\` なしで飾りとして走らせている状態です。新規プロジェクトで strict を切る合理的な理由はほぼありません(後から有効にするコストは膨大です)。

このコースの実行環境は加えて \`noUncheckedIndexedAccess: true\` を有効にしています。strict ファミリーの外にある追加フラグで、配列や \`Record\` への添字アクセス \`arr[i]\` の型を \`T\` ではなく \`T | undefined\` にします。「範囲外アクセスは undefined を返す」という JS の実態(Java なら例外、Python なら IndexError になる場面)を型に反映する、誠実なフラグです。この帰結は最後の節で実際に体験します。`,
    },
    {
      title: 'ツールチェーンの分業 — 検査・実行・束ねる',
      body: `Java は \`javac\` がコンパイルして JVM が実行する一本道、Python は \`python\` コマンド一発です。TS のツールチェーンは Ch.1 で見たとおり「型チェック」と「変換・実行」が分離していて、役者を整理するとこうなります:

- **tsc** — 型チェック係。CI やコミット前には \`tsc --noEmit\`(JS を出力せずチェックだけ)を走らせるのが定石。Python でいう \`mypy\` のポジション
- **tsx** — 開発中に TS ファイルを Node.js で「そのまま」実行するツール(\`tsx main.ts\`)。内部では型を剥がして JS にしてから実行しており、**型チェックはしない**。Python でいう \`python\` コマンドのポジション
- **バンドラ(Vite / esbuild / webpack)** — 何十・何百のモジュールを、ブラウザ配布用に少数のファイルへ束ねて最適化する。これも**型チェックはしない**

つまり実務の TS 開発は「実行・配布の経路には型チェックが乗っていない」構造です。tsx でアプリが動き、テストが全部通っていても、型エラーが残っている可能性は普通にあります。だから **\`tsc --noEmit\` を CI に必ず入れる**。エディタの赤線(これも内部で tsc 相当が動いている)と CI の tsc が防波堤で、tsx とバンドラはスピード担当 — この分業が腹落ちしていれば、ツール選びのニュースに振り回されなくなります。

Java との対比で言えば、「コンパイルが通らなければ実行できない」という安心感は TS のデフォルトにはなく、**自分でパイプラインに組み込んで初めて手に入る**ものだ、ということです。`,
    },
    {
      title: '.d.ts と @types — 型定義だけを配る仕組み',
      body: `npm のライブラリの大半はもともと素の JavaScript です。型のない JS ライブラリを TS から安全に使うための仕組みが **型宣言ファイル(\`.d.ts\`)** — 実装を一切含まず、「この形の関数・値が存在する」という宣言だけを書いたファイルです。

\`\`\`ts
// @types/lodash に入っている型定義の一部(イメージ)
export function chunk<T>(array: T[], size?: number): T[][];
// 本体(実装)は lodash パッケージの JS。ここには型だけがある
\`\`\`

Python 経験者なら一発で通じます: **\`.pyi\` スタブファイルとまったく同じ発想**です。そして Python の typeshed に相当するのが **DefinitelyTyped** — コミュニティが有名 JS ライブラリの型定義を集積している巨大リポジトリで、npm では \`@types/*\` という名前で配布されています。

\`\`\`sh
npm install lodash            # 実装(素の JS)
npm install -D @types/lodash  # 型定義(DefinitelyTyped から)
\`\`\`

代表格が \`@types/node\` です。\`fs\` や \`path\` といった **Node.js 組み込み API の「型定義だけ」**を提供します(Node.js 本体は別途インストールされているもの。@types/node を入れても Node が動くようにはなりません)。

なお最近のライブラリは TS で書かれて型定義を同梱していることが多く、その場合 \`@types/*\` は不要です。import して「Could not find a declaration file for module 'xxx'」と怒られたら \`@types/xxx\` を探す、と覚えておけば実務は回ります。`,
    },
    {
      title: '総合演習に向けて — strict で書く集計パターン',
      body: `基礎編の仕上げとして、「型付きデータ配列を集計して整形出力する」プログラムを strict で書きます。実務の CLI ツールの最小骨格であり、Ch.2(for-of・テンプレートリテラル)、Ch.4(type・リテラル型・推論)の総動員です。パターンは3段階:

1. **データに型を付ける** — \`type\` でレコードの形を宣言し、配列リテラルに \`: Xxx[]\` を注釈する。カテゴリのような有限の値は \`"a" | "b"\` のリテラル union に(Ch.4)
2. **for-of + Record で集計する** — ここに本コース環境の罠があります。\`noUncheckedIndexedAccess\` により \`Record<string, number>\` の読み出し \`totals[key]\` は \`number | undefined\` 型。「まだ無いキーなら 0 から」を \`?? 0\` で型に対して誠実に書きます(Ch.2 の \`??\`)
3. **Object.entries で整形出力** — エントリ配列を for-of で回せば添字アクセスを避けられます

下のコードが型チェックを全部通る見本です。「▶ エディタで試す」で開いて、\`?? 0\` を消すとどんな型エラーが出るかも確認してください。

ひとつ予告を。実務ではこの \`items\` はファイルや API から JSON で届きます。そして \`JSON.parse\` の戻り値は **\`any\`** — Ch.1 でやったとおり型は実行時に消えているので、パース結果が本当にその形かは誰も検証しておらず、\`any\` はプロパティ名の typo すら素通りさせます。外から来るデータの境界をどう守るかは応用編 Ch.6 の主題です。今日はデータをコード内リテラルで持つので、プログラム全域が型チェックの守備範囲にあります。`,
      code: `// 集計パターンの見本(strict + noUncheckedIndexedAccess で型エラーなし)
type Item = { name: string; category: "fruit" | "vegetable"; price: number };

const items: Item[] = [
  { name: "りんご", category: "fruit", price: 150 },
  { name: "トマト", category: "vegetable", price: 120 },
  { name: "バナナ", category: "fruit", price: 100 },
];

// カテゴリ別に合計する。totals[key] は number | undefined なので ?? 0 で受ける
const totals: Record<string, number> = {};
for (const item of items) {
  totals[item.category] = (totals[item.category] ?? 0) + item.price;
}

// Object.entries なら添字アクセスなしで [キー, 値] を取り出せる
for (const [category, total] of Object.entries(totals)) {
  console.log(category + ": " + total + "円");
}

// 予告: JSON.parse は any を返す(型チェックが素通りする危険地帯)
const parsed = JSON.parse('{"price": 100}');
console.log(typeof parsed.prise); // typo なのにコンパイルエラーにならない!`,
    },
  ],
  exercise: {
    instructions: `### 基礎編総合演習: 売上集計レポート

カフェの売上データ(型付き配列)から**カテゴリ別の売上合計と総合計**を集計し、レポートを整形出力してください。基礎編で学んだことだけで完成します。

やること(スターターの TODO に対応):

1. 売上1件の金額(\`unitPrice * quantity\`)を返す関数 \`amount\` を書く(引数・戻り値の型を明示 — Ch.4)
2. \`for-of\` と \`Record<string, number>\` でカテゴリ別合計を集計する(\`totals[key]\` は \`number | undefined\` になるので \`?? 0\` で受ける)
3. \`Object.entries\` でカテゴリ別の行を出力し、最後に総合計を出力する

期待される出力(この4行に完全一致させること):

\`\`\`
coffee: 2390円
tea: 1160円
snack: 1200円
合計: 4750円
\`\`\`

ルール: \`any\` と \`as\` は禁止。合計の数値を直接コードに書くのも禁止(必ず \`sales\` から計算すること)。型エラーゼロ + 出力一致でクリアです。`,
    starter: `// 基礎編総合演習: 売上集計レポート
type Sale = {
  product: string;
  category: "coffee" | "tea" | "snack";
  unitPrice: number;
  quantity: number;
};

const sales: Sale[] = [
  { product: "ブレンド", category: "coffee", unitPrice: 450, quantity: 3 },
  { product: "カフェラテ", category: "coffee", unitPrice: 520, quantity: 2 },
  { product: "煎茶", category: "tea", unitPrice: 400, quantity: 1 },
  { product: "クッキー", category: "snack", unitPrice: 300, quantity: 4 },
  { product: "ほうじ茶", category: "tea", unitPrice: 380, quantity: 2 },
];

// TODO 1: 売上1件の金額を返す関数 amount を書く

// TODO 2: for-of でカテゴリ別合計を集計する(?? 0 を忘れずに)

// TODO 3: カテゴリ別の行と総合計を出力する
//   出力形式は課題文の「期待される出力」に完全一致させる(数値のハードコードは禁止)
`,
    check: {
      noErrors: true,
      mustMatch: ['type Sale', '\\bamount\\s*\\(', 'of sales\\b|sales\\.(reduce|forEach|map)\\s*\\('],
      forbid: ['\\bany\\b', '\\bas\\b', '2390', '1160', '1200', '4750'],
      output: 'coffee: 2390円\ntea: 1160円\nsnack: 1200円\n合計: 4750円',
    },
  },
  quiz: [
    // ---- easy (d:1) ----
    {
      d: 1,
      type: 'choice',
      prompt: '`math.ts` が `export function sum(values: number[]): number {...}` を公開している。`sum` を使うための正しい import 文は?',
      options: [
        'import { sum } from "./math";',
        'import sum from "./math";',
        'import math.sum;',
        'from "./math" import sum;',
      ],
      answer: 0,
      explanation: 'named export(export function sum)を受け取るのは波括弧の named import です。`import sum from ...` は default import で、`export default` がある場合にしか使えません。`import math.sum;` は Java 風、`from ... import ...` は Python 風の構文で、どちらも TS/JS には存在しません。',
      review: 'ES Modules — ファイルがモジュールになる',
    },
    {
      d: 1,
      type: 'choice',
      prompt: 'tsconfig.json の `strict: true` がやることとして正しいのは?',
      options: [
        'noImplicitAny や strictNullChecks などの厳格チェック群を一括で有効にする',
        '型注釈を実行時のバリデーションコードに変換する',
        'コンパイルを高速化する最適化を有効にする',
        'var の使用を構文エラーにする',
      ],
      answer: 0,
      explanation: 'strict は単一機能ではなく厳格チェックフラグ群の一括スイッチです。実行時の挙動は一切変わりません — 型は消えるので、実行時バリデーションへの変換は原理的に行われません(Ch.1 の type erasure)。コンパイル速度とも無関係で、var の禁止は型チェックではなく linter の仕事です。',
      review: 'tsconfig.json — strict: true は非交渉',
    },
    {
      d: 1,
      type: 'choice',
      prompt: 'npm パッケージ `@types/node` が提供するものは?',
      options: [
        'fs や path など Node.js 組み込み API の型定義(実装は含まない)',
        'Node.js の実行エンジン本体',
        'Node.js を TypeScript 対応にする実行時パッチ',
        'tsc の Node.js 向け高速版',
      ],
      answer: 0,
      explanation: '@types/* は DefinitelyTyped 由来の「型定義だけ」のパッケージで、@types/node は Node.js API の宣言(.d.ts)を提供します。実装は Node.js 本体にあり、これを入れても Node が動くようになるわけでも、実行時の何かが変わるわけでもありません。tsc とも別物です。',
      review: '.d.ts と @types — 型定義だけを配る仕組み',
    },
    // ---- medium (d:2) ----
    {
      d: 2,
      type: 'choice',
      prompt: 'tsc / tsx / esbuild / Node.js のうち、**型チェックを担う**のはどれ?',
      options: [
        'tsc(エディタの赤線も内部では tsc 相当が動いている)',
        'tsx(実行前に必ず型チェックする)',
        'esbuild(バンドル時に型チェックする)',
        'Node.js(実行時に型チェックする)',
      ],
      answer: 0,
      explanation: '型チェックは tsc の仕事です。tsx と esbuild は高速化のため「型を剥がして JS にする」変換だけを行い、型チェックはしません。Node.js は生成された JS を実行するだけで、そのころには型は消えています(type erasure)。だから CI に `tsc --noEmit` を入れない限り、型エラーは検出されないまま動き続けます。',
      review: 'ツールチェーンの分業 — 検査・実行・束ねる',
    },
    {
      d: 2,
      type: 'choice',
      prompt: 'Python の `import math` して `math.sqrt(2)` と使うスタイルに最も近い TS の import は?',
      options: [
        'import * as math from "./math";',
        'import { math } from "./math";',
        'import math from "./math";',
        'import "./math";',
      ],
      answer: 0,
      explanation: '`import * as math` は namespace import で、モジュールの全 export を math オブジェクトとして受け取ります — Python の `import math` に相当します。`import { math }` は「math という名前の named export」を探すので別物。`import math from ...` は default export 専用。`import "./math";` は名前を何も束縛しない副作用 import です。',
      review: 'ES Modules — ファイルがモジュールになる',
    },
    {
      d: 2,
      type: 'choice',
      prompt: '素の JavaScript 製ライブラリ foo を import したら「Could not find a declaration file for module \'foo\'」というエラーが出た。定石の対処は?',
      options: [
        'npm install -D @types/foo で DefinitelyTyped の型定義を追加する',
        'tsconfig.json で strict: false にする',
        '@types/node をインストールする',
        'foo を TypeScript で書き直す',
      ],
      answer: 0,
      explanation: '型定義を同梱しない JS ライブラリには、DefinitelyTyped(@types/*)の型宣言を開発依存として追加するのが定石です。strict を切るのは型チェック全体を弱める最悪手で非交渉ルールに反します。@types/node は Node.js API の型であって foo とは無関係。ライブラリの書き直しは現実的ではありません(それが不要になるための .d.ts です)。',
      review: '.d.ts と @types — 型定義だけを配る仕組み',
    },
    {
      d: 2,
      type: 'choice',
      prompt: 'strict: true なのに、次のプロパティ名の typo(cuont)がコンパイルエラーにならない。なぜ?',
      code: `const data = JSON.parse('{"count": 3}');
console.log(data.cuont + 1); // 実行すると NaN`,
      options: [
        'JSON.parse の戻り値が any 型で、any へのプロパティアクセスは何でも通ってしまうから',
        'strict モードは JSON 関連のコードを検査対象外にするから',
        'data が unknown 型に推論され、自動的に narrowing されるから',
        'console.log の引数は型チェックの対象外だから',
      ],
      answer: 0,
      explanation: 'JSON.parse の戻り値型は any で、any は型チェックの放棄 — 存在しないプロパティへのアクセスも素通りし、undefined + 1 で NaN になります。strict に「JSON を検査しない」という機能はありません。unknown ならむしろ逆で、narrowing するまで一切のプロパティアクセスがエラーになります(応用編 Ch.3)。console.log の引数も通常どおり型チェックされます。',
      review: '総合演習に向けて — strict で書く集計パターン',
    },
    // ---- hard (d:3) ----
    {
      d: 3,
      type: 'code',
      prompt: '単語の出現回数を数えるコードに、noUncheckedIndexedAccess 由来の型エラーが1箇所あります。**`?? 0` を使って**(any / as は禁止)修正し、出力を `ts: 3` `js: 2` `node: 1` の3行にしてください。',
      starter: `const words = ["ts", "js", "ts", "node", "ts", "js"];

const counts: Record<string, number> = {};
for (const w of words) {
  counts[w] = counts[w] + 1; // エラー: counts[w] は number | undefined
}

for (const [word, count] of Object.entries(counts)) {
  console.log(word + ": " + count);
}
`,
      check: {
        noErrors: true,
        mustMatch: ['\\?\\?'],
        forbid: ['\\bany\\b', '\\bas\\b'],
        output: 'ts: 3\njs: 2\nnode: 1',
      },
      explanation: 'noUncheckedIndexedAccess 下では `counts[w]` の読み出しが `number | undefined` になるため、そのまま `+ 1` はできません。`counts[w] = (counts[w] ?? 0) + 1;` と「まだ無いキーなら 0 から」を明示すれば、型にも実行時の実態にも誠実なコードになります。代入側(左辺)はチェック対象外なので、直すのは読み出し側だけです。',
      review: '総合演習に向けて — strict で書く集計パターン',
    },
    {
      d: 3,
      type: 'choice',
      prompt: '【基礎編総合】集計プログラムの設定読み込みでこう書いた。実行結果は?',
      code: `function getTimeout(config: { timeout?: number }): number {
  return config.timeout || 3000;
}

console.log(getTimeout({ timeout: 0 }));`,
      options: [
        '3000 と出力される(0 は falsy なので || が右辺を返してしまう)',
        '0 と出力される(timeout は明示的に渡されているから)',
        'コンパイルエラーになる(timeout が undefined の可能性があるから)',
        '実行時エラーになる(undefined と比較できないから)',
      ],
      answer: 0,
      explanation: 'Ch.2 の falsy の罠です。`||` は「左辺が falsy なら右辺」で、0 も "" も falsy なので、明示的に渡した 0 が握りつぶされて 3000 になります。「timeout: 0(即時)」を尊重したいなら `config.timeout ?? 3000`(null/undefined のときだけ右辺)が正解。コンパイルは通ります — `||` が undefined を除去して number を返すことを TS は理解するので、型としては正しいのに挙動が意図とずれる、型チェックでは捕まらないバグの典型です。',
      review: '総合演習に向けて — strict で書く集計パターン',
    },
    {
      d: 3,
      type: 'choice',
      prompt: '【基礎編総合】集計結果のラベルを非同期で取得するコード。結果はどうなる?',
      code: `async function loadLabel(): Promise<string> {
  return "月次レポート";
}

async function main() {
  const label = loadLabel();
  console.log(label.length);
}
main();`,
      options: [
        'コンパイルエラー: label は Promise<string> 型で length プロパティが存在しない(await 忘れ)',
        '6 と出力される(文字列の長さ)',
        'undefined と出力される',
        'コンパイルは通るが、実行時に例外で停止する',
      ],
      answer: 0,
      explanation: 'Ch.3 でやった await 忘れです。`loadLabel()` の戻り値は Promise<string> であり、await しない限り string にはなりません。strict な TS は Promise<string> と string を型で区別するので、`.length` の行が「Property \'length\' does not exist on type \'Promise<string>\'」というコンパイルエラーになります。`const label = await loadLabel();` が修正。Python の asyncio でコルーチンを await し忘れても実行時警告どまりなのに対し、TS は実行前に捕まえてくれる好例です。',
      review: 'ツールチェーンの分業 — 検査・実行・束ねる',
    },
    {
      d: 3,
      type: 'choice',
      prompt: '【基礎編総合】チームの CI は「tsx でテストを実行し、全部パスしたらデプロイ」という構成で、strict: true の tsconfig.json もある。型安全性について**正しい**指摘は?',
      options: [
        'tsx は型チェックをしないので、tsc --noEmit を CI に追加しない限り型エラーが残ったままデプロイされうる',
        'tsx は実行前に tsconfig.json を読んで型チェックするので、この構成で型安全は保証される',
        'テストが全部通っている以上、型エラーは存在しえない',
        'strict: true にしてあれば、どのツールで実行しても型チェックが強制される',
      ],
      answer: 0,
      explanation: 'Ch.1 と本章の核心の合わせ技です。tsx は型を剥がして実行するだけで型チェックをしません。tsconfig.json の strict は「tsc が検査するときの厳しさ」の設定であり、検査しないツール(tsx・esbuild・バンドラ)には効力がありません。テストの通過は実行時挙動の確認であって型の整合とは別問題 — any 経由の型崩れなどはテストをすり抜けます。だから CI には tsc --noEmit をテストと並べて入れるのが定石です。',
      review: 'ツールチェーンの分業 — 検査・実行・束ねる',
    },
  ],
});
