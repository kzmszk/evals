// 基礎編 Ch.4 — TS の基本文法
window.COURSE.register({
  id: 'basic-04',
  part: 'basic',
  title: 'TS の基本文法 — 型を書く・推論に任せる',
  minutes: 50,
  goal: '基本的な型注釈(プリミティブ・配列・タプル・オブジェクト・関数)を書けるようになり、同時に「どこに書き、どこは推論に任せるか」の判断基準を身につける。union / リテラル型と strictNullChecks で「限られた値」「無いかもしれない値」を型で表現できる。',
  sections: [
    {
      title: '型注釈の書き方 — プリミティブ・配列・タプル・オブジェクト',
      body: `型注釈の第一印象は「Java と逆」です。Java は \`String name\`、TS は \`name: string\` — **名前が先、型が後ろ**。Python の型ヒント \`name: str\` と同じ語順なので、Python 経験者には見慣れた形のはずです。

覚える型は少なめです。

- **プリミティブ**: \`string\` / \`number\` / \`boolean\`。**int と double の区別はありません**。整数も小数も \`number\` ひとつです(Python の int / float の区別すらない)
- **配列**: \`number[]\`(\`Array<number>\` とも書ける)。Java の \`List<Integer>\` に相当しますが、リテラル \`[1, 2, 3]\` でそのまま作れます
- **タプル**: \`[string, number]\` — 位置ごとに型が違う固定長の配列。Python のタプルに相当します(Java には対応物がない)
- **オブジェクト型**: \`{ name: string; age: number }\` — **クラスを定義せず、その場で「形」を書けます**。Java ならクラスか record を作らされる場面。Python の TypedDict に近い感覚です

ひとつ注意: 下のコード例は説明のため**すべての変数に注釈を書いています**が、これはお手本ではありません。次の節で「実はほとんど書かなくてよい」ことが分かります。`,
      code: `// プリミティブ: int/double の区別はなく number ひとつ
const price: number = 1980;
const title: string = "TS入門";
const done: boolean = false;

// 配列: Java の List<Integer> 相当。リテラルで書ける
const scores: number[] = [80, 92, 75];

// タプル: 位置ごとに型が違う固定長配列(Python のタプルに近い)
const entry: [string, number] = ["鈴木", 30];

// オブジェクト型: クラス定義なしでその場に「形」を書ける
const user: { name: string; age: number } = { name: "田中", age: 28 };

console.log(title, price, done);
console.log(scores.join(","), entry[0], user.name);`,
    },
    {
      title: '型推論を信頼する — 書く場所・書かない場所',
      body: `Java 出身者が TS で最初にやりがちなのが「全部の変数に型を書く」ことです(Java 10 の \`var\` を使ってこなかった人ほど顕著)。TS は逆で、**推論できる場所には書かないのが標準スタイル**です。TS の推論は強力で、初期化子・文脈・戻り値から型をほぼ正確に導きます。

指針はこれだけです。

- **関数の引数 — 必ず書く**。引数だけは推論のしようがなく、strict モードでは注釈なしの引数は \`Parameter 'x' implicitly has an 'any' type\` エラーになります
- **公開 API(export する関数)の戻り値 — 書く**。推論にも任せられますが、書いておくと「実装をいじったら戻り値の型が意図せず変わった」をシグネチャの位置で検出できます
- **ローカル変数 — 書かない**。\`const price = 1980\` で \`number\` と推論されます。\`const price: number = 1980\` は情報量ゼロのノイズです
- **コールバックの引数 — 書かない**。\`[1, 2, 3].map((n) => n * 2)\` の \`n\` は文脈から \`number\` と推論されます(contextual typing)

\`const price: number = 1980\` と書いても間違いではありませんが、コードレビューで「注釈を削ってください」と言われる世界だと思ってください。mypy を使う Python でもローカル変数にいちいち注釈は書きませんよね。同じ感覚です。

エディタで変数にカーソルを合わせると推論された型が見えます。「注釈を書かない = 型がない」ではなく、**注釈を書かなくても型は常にある**のです。`,
      code: `// ローカル変数: 注釈不要。カーソルを合わせると推論結果が見える
const price = 1980;           // number と推論
const title = "TS入門";        // string と推論
const scores = [80, 92, 75];  // number[] と推論

// 引数は推論できないので必ず書く。戻り値は公開 API なら書く
function average(values: number[]): number {
  let sum = 0;                // number と推論(注釈不要)
  for (const v of values) {   // v も number と推論
    sum += v;
  }
  return sum / values.length;
}

// コールバックの引数 s は文脈から string と推論される
const lengths = ["a", "bb", "ccc"].map((s) => s.length);

console.log(title, price, average(scores), lengths);`,
    },
    {
      title: 'union 型とリテラル型 — enum の代わり',
      body: `Java で「限られた値のどれか」を表すなら enum を定義しますね。TS では**文字列リテラルそのものを型にする**のが標準のやり方です。

- **リテラル型**: \`'pending'\` は「値が \`'pending'\` である文字列」だけを含む型。**値がそのまま型になる**
- **union 型**: \`|\` で型を合成する。\`'pending' | 'shipped'\` は「どちらか」
- \`type\` で名前を付ける: \`type Status = 'pending' | 'shipped' | 'delivered'\`

Java の enum と比べたときの特徴:

- 実体は**ただの文字列**。型は実行時に消え(type erasure)、ランタイムには \`"pending"\` という文字列が流れているだけ
- \`Status.PENDING\` のような参照は不要。\`'pending'\` と書けばよく、エディタが補完してくれる
- タイポはコンパイルエラー: \`label('shiped')\` は \`Argument of type '"shiped"' is not assignable ...\` で止まる

さらに union は異なる種類の型も混ぜられます: \`string | number\` は「文字列または数値」。Java に直接の対応物がない表現力で、応用編 Ch.2(narrowing)の主役になります。

なお TS にも \`enum\` キーワードが存在しますが、**このコースでは教えませんし、使いません**。「型は実行時に消える」原則の例外としてランタイムコードを生成するなどの問題があり、現代の TS では literal union で代替するのが主流です(詳しい理由は応用編 Ch.7 で)。`,
      code: `// Java なら enum を作る場面。TS では文字列リテラルの union
type Status = 'pending' | 'shipped' | 'delivered';

function statusLabel(status: Status): string {
  if (status === 'pending') return "未発送";
  if (status === 'shipped') return "発送済み";
  return "配達完了";
}

console.log(statusLabel('shipped'));
// console.log(statusLabel('canceled')); // エラー: 'canceled' は Status に代入できない

// union は異なる種類の型も混ぜられる
function formatId(id: string | number): string {
  return "ID-" + id;
}
console.log(formatId(42), formatId("A7"));`,
    },
    {
      title: 'strictNullChecks — Optional が言語に組み込まれている',
      body: `Java 最大の実行時エラーは NullPointerException です。Java 8 以降には対策として \`Optional<T>\`(「値が無いかもしれない」ことを型で表す入れ物クラス)が後付けされました — ご存知なくても大丈夫、いま括弧内で説明した理解で十分です。TS(strictNullChecks 有効時)では、**この「無いかもしれないことを型で表す」仕組みが型システムに最初から組み込まれています**。

- \`string\` 型に \`null\` / \`undefined\` は**含まれません**。\`const s: string = null\` はコンパイルエラー
- 「無いかもしれない値」は型に明示する: \`string | null\`、\`User | undefined\`。ただの union です — 専用の Optional クラスは不要
- \`undefined\` の可能性がある値のプロパティに触ると、その場でコンパイルエラー(\`'x' is possibly 'undefined'\`)
- \`if\` でチェックすると、そのブロック内では型から \`undefined\` が**取り除かれます**(制御フロー解析 — 応用編 Ch.2 の主役)

Python の \`str | None\` + mypy と同じモデルですが、TS では標準の strict 設定で強制される点が違います。Ch.2 で学んだ \`?.\` と \`??\` は、この型システムと組み合わさって真価を発揮します。

もうひとつ。この演習環境では \`noUncheckedIndexedAccess\` も有効なので、**配列の添字アクセス \`arr[0]\` の型は \`T\` ではなく \`T | undefined\`** になります(範囲外アクセスは undefined を返すため、これが正直な型です)。\`for-of\` で回す分にはこの問題は起きません。`,
      code: `const users = [
  { name: "田中", age: 28 },
  { name: "鈴木", age: 35 },
];

// find は「見つからない」可能性があるので {…} | undefined を返す
const found = users.find((u) => u.name === "田中");
// console.log(found.age); // エラー: 'found' is possibly 'undefined'

if (found !== undefined) {
  console.log(found.name, found.age); // このブロック内では undefined が消えている
}

// ?. と ?? は strictNullChecks と相性抜群
const missing = users.find((u) => u.name === "佐藤");
console.log(missing?.age ?? "見つかりません");

// noUncheckedIndexedAccess: 添字アクセスは | undefined 付きになる
const first = users[0]; // { name: string; age: number } | undefined
console.log(first?.name);`,
    },
    {
      title: 'interface と type — 型に名前を付ける',
      body: `オブジェクトの「形」に名前を付ける方法は2つあります。

- \`interface Book { title: string; price: number }\`
- \`type Book = { title: string; price: number }\`

Java の interface との決定的な違い: **\`implements\` が要りません**。形が合っていれば、その型として扱われます(構造的型付け — 応用編 Ch.1 の主題)。オブジェクトリテラルをそのまま渡せるので、Java のように「この interface のためだけの実装クラス」を用意する必要がないのです。

使い分けの初歩:

- オブジェクトの形なら**どちらでもよい**(チームの規約に従う)
- union やタプル、プリミティブに名前を付けられるのは \`type\` **だけ**(\`type Status = 'a' | 'b'\` は interface では書けない)

詳細な使い分け(declaration merging など)は応用編 Ch.7 で扱います。今は「どちらもクラスではなく、**実行時に消える純粋な型の名前**」と押さえてください。Python でいえば dataclass よりも TypedDict + 型エイリアスに近い存在です。`,
      code: `interface Book {
  title: string;
  price: number;
}

// union に名前を付けられるのは type だけ
type BookStatus = 'draft' | 'published';

type Article = {
  title: string;
  status: BookStatus;
};

function describeBook(b: Book): string {
  return b.title + "(" + b.price + "円)";
}

// implements 不要 — 形が合えばそのまま Book として渡せる
console.log(describeBook({ title: "TS入門", price: 2980 }));

const a: Article = { title: "推論の話", status: 'draft' };
console.log(a.title, a.status);`,
    },
  ],
  exercise: {
    instructions: `### 演習: 注文集計を strict で通す

通販の注文を集計するコードがあります。型エラーを直し、Java 癖の余計な注釈を削ってください。直す箇所は3つ:

1. \`totalOf\` の**引数に型注釈を付ける**(\`orders\` は \`Order[]\`、\`target\` は \`Status\`)。strict モードでは注釈なしの引数はエラーです
2. \`totalOf\` 内の \`let total: number = 0\` — この注釈は**不要なので削る**(推論に任せる)
3. \`describeOrder\` の \`find\` は \`Order | undefined\` を返すため、そのままプロパティに触るとエラー。**見つからなかった場合は \`"注文なし"\` を返す**処理を足す

期待される出力:

\`\`\`
未発送合計: 2000円
注文2: 3400円
注文なし
\`\`\``,
    starter: `type Status = 'pending' | 'shipped' | 'delivered';

interface Order {
  id: number;
  status: Status;
  amount: number;
}

const orders: Order[] = [
  { id: 1, status: 'pending', amount: 1200 },
  { id: 2, status: 'shipped', amount: 3400 },
  { id: 3, status: 'pending', amount: 800 },
];

// ① 引数に型注釈を付ける ② total の余計な注釈を削る
function totalOf(orders, target) {
  let total: number = 0;
  for (const o of orders) {
    if (o.status === target) total += o.amount;
  }
  return total;
}

// ③ 見つからない場合(undefined)の処理を足す
function describeOrder(orders: Order[], id: number): string {
  return "注文" + orders.find((o) => o.id === id).id + ": " + orders.find((o) => o.id === id).amount + "円";
}

console.log("未発送合計: " + totalOf(orders, 'pending') + "円");
console.log(describeOrder(orders, 2));
console.log(describeOrder(orders, 99));
`,
    check: {
      noErrors: true,
      mustMatch: ['orders:\\s*Order\\[\\]', 'target:\\s*Status'],
      forbid: ['\\bany\\b', '\\bas\\b', 'total:\\s*number'],
      output: '未発送合計: 2000円\n注文2: 3400円\n注文なし',
    },
  },
  quiz: [
    // ---- easy (d:1) ----
    {
      d: 1,
      type: 'choice',
      prompt: 'strict モードの TypeScript で、型注釈を書かないと**コンパイルエラーになる**のはどれ?',
      options: [
        '文脈から推論できない関数の引数',
        'すべてのローカル変数',
        'すべての関数の戻り値',
        '初期値付きの const 宣言',
      ],
      answer: 0,
      explanation: '関数の引数だけは推論のしようがなく、注釈がないと `implicitly has an \'any\' type` エラーになります(コールバックのように文脈から推論できる場合を除く)。ローカル変数は初期化子から、戻り値は return 文から推論されるので注釈は任意 — むしろローカル変数には書かないのが TS の標準スタイルです。',
      review: '型推論を信頼する — 書く場所・書かない場所',
    },
    {
      d: 1,
      type: 'choice',
      prompt: '`type OrderStatus = \'pending\' | \'shipped\';` という定義について正しいのは?',
      options: [
        'OrderStatus 型の変数には \'pending\' と \'shipped\' の2つの文字列しか代入できず、違反はコンパイルエラーになる',
        'Java の enum と同様、実行時に OrderStatus というオブジェクトが生成される',
        '任意の string が代入できる(リテラルはただのドキュメント)',
        '値は OrderStatus.pending のように型名経由で参照する',
      ],
      answer: 0,
      explanation: 'リテラル型の union は「この2つの値だけを許す string」という型で、他の文字列を代入するとコンパイルエラーです。Java の enum と違って実行時の実体はなく(type erasure)、ランタイムにはただの文字列が流れています。だから `OrderStatus.pending` のような参照も不要で、`\'pending\'` と直接書きます。',
      review: 'union 型とリテラル型 — enum の代わり',
    },
    {
      d: 1,
      type: 'choice',
      prompt: 'strictNullChecks が有効なとき、`const userName: string = null;` はどうなる?',
      options: [
        'コンパイルエラー。null を許容したいなら string | null と書く必要がある',
        'Java の参照型と同様、問題なく代入できる',
        'コンパイルは通るが実行時に例外が出る',
        'null は不可だが undefined なら代入できる',
      ],
      answer: 0,
      explanation: 'strictNullChecks 下では `string` に null / undefined は含まれず、代入はコンパイルエラーです(undefined でも同じ)。「null かもしれない」は `string | null` と型に明示します — Java で Optional が後付けで担った役割が、TS では型システムに最初から組み込まれています。実行時例外ではなくコンパイル時に止まるのがポイントです。',
      review: 'strictNullChecks — Optional が言語に組み込まれている',
    },
    // ---- medium (d:2) ----
    {
      d: 2,
      type: 'choice',
      prompt: '次の `lengths` に推論される型は?',
      code: `const lengths = ["a", "bb", "ccc"].map((s) => s.length);`,
      options: [
        'number[]',
        'string[]',
        'any[](コールバック引数 s に注釈がないため)',
        '(number | undefined)[]',
      ],
      answer: 0,
      explanation: '`s` は `string[].map` の文脈から string と推論され(contextual typing)、`s.length` は number、よって全体は `number[]` です。注釈がなくても any にはなりません — コールバック引数は「書かなくてよい」場所の代表です。`| undefined` が付くのは添字アクセスの話(noUncheckedIndexedAccess)であり、map の結果には付きません。',
      review: '型推論を信頼する — 書く場所・書かない場所',
    },
    {
      d: 2,
      type: 'choice',
      prompt: 'strictNullChecks 下で、次のコードのうち**コンパイルエラーになる行**は?',
      code: `const items = [{ id: 1, name: "ペン" }];
const hit = items.find((it) => it.id === 2);
console.log("A: " + items.length);   // A行
console.log("B: " + hit.name);       // B行
console.log("C: " + (hit === undefined)); // C行`,
      options: [
        'B行のみ(hit は undefined の可能性があるため)',
        'B行とC行',
        'どの行もエラーにならず、実行時に落ちるだけ',
        'A行(items が空配列の可能性があるため)',
      ],
      answer: 0,
      explanation: '`find` の戻り値は「見つからない」可能性を含む `{...} | undefined` 型なので、チェックなしで `.name` に触るB行が `\'hit\' is possibly \'undefined\'` エラーになります。C行は undefined と比較しているだけなので合法(むしろ推奨されるチェック)。A行の `.length` は配列自体のプロパティで、要素アクセスではないので問題ありません。',
      review: 'strictNullChecks — Optional が言語に組み込まれている',
    },
    {
      d: 2,
      type: 'choice',
      prompt: '`const entry = ["鈴木", 30];` — 注釈を書かなかったとき、entry に推論される型は?',
      options: [
        '(string | number)[]',
        '[string, number](タプル)',
        'any[]',
        'string[] になり、30 の箇所がコンパイルエラー',
      ],
      answer: 0,
      explanation: '配列リテラルは「string か number が並ぶ可変長配列」= `(string | number)[]` と推論され、**タプルには推論されません**。タプルが欲しいときは `const entry: [string, number] = ...` と注釈を書きます — 「ローカル変数には書かない」原則の数少ない例外です。any[] にはなりませんし、異なる型の混在は union として扱われるのでエラーにもなりません(Java の配列の直感とは違う)。',
      review: '型注釈の書き方 — プリミティブ・配列・タプル・オブジェクト',
    },
    {
      d: 2,
      type: 'choice',
      prompt: '`\'draft\' | \'published\'` という union 型に名前を付けたい。使えるのは?',
      options: [
        'type のみ',
        'interface のみ',
        'type と interface のどちらでも可',
        'どちらも不可(enum が必要)',
      ],
      answer: 0,
      explanation: '`type BookStatus = \'draft\' | \'published\'` と書けるのは type だけです。interface が名前を付けられるのはオブジェクトの形だけで、union やプリミティブには使えません。enum は不要どころか、このコースでは使いません — literal union がその役割を果たします。オブジェクトの形に限れば type と interface のどちらでも書けます。',
      review: 'interface と type — 型に名前を付ける',
    },
    // ---- hard (d:3) ----
    {
      d: 3,
      type: 'code',
      prompt: 'Java 出身者が書いた次のコードは動きますが、**不要な型注釈だらけ**です。推論に任せられる注釈をすべて削ってください。ただし必要な注釈(関数の引数と戻り値)は残すこと。出力は `合計: 2500円` のまま変わらないこと。',
      starter: `function sumPrices(prices: number[]): number {
  let total: number = 0;
  for (const p of prices) {
    total += p;
  }
  return total;
}

const cart: number[] = [1200, 800, 500];
const total: number = sumPrices(cart);
const message: string = "合計: " + total + "円";
console.log(message);
`,
      check: {
        noErrors: true,
        mustMatch: ['prices:\\s*number\\[\\]', '\\):\\s*number'],
        forbid: ['total:\\s*number', 'cart:\\s*number', 'message:\\s*string', '\\bany\\b', '\\bas\\b'],
        output: '合計: 2500円',
      },
      explanation: '削るのは4箇所: `let total: number = 0`(0 から number と推論)、`const cart: number[]`(配列リテラルから推論)、`const total: number`(sumPrices の戻り値から推論)、`const message: string`(文字列連結から推論)。残すのは引数 `prices: number[]`(推論不可能)と戻り値 `: number`(公開 API のシグネチャ固定)。「書かなくても型はある」— エディタで削った変数にカーソルを合わせて確認してください。',
      review: '型推論を信頼する — 書く場所・書かない場所',
    },
    {
      d: 3,
      type: 'choice',
      prompt: '次のコードは最後の行でコンパイルエラーになる。理由として正しいのは?',
      code: `function ship(status: 'pending' | 'shipped'): void {
  console.log(status);
}

let current = 'pending';
ship(current); // エラー!`,
      options: [
        'let で宣言したため current は string に広げて推論され(widening)、string はリテラル union に代入できない。const なら \'pending\' 型に推論されて通る',
        'リテラル型の引数には変数を渡せず、常に \'pending\' のような直書きが必要だから',
        '\'pending\' は値であって型ではないので、union 型と比較できないから',
        'let 変数は再代入の可能性があるため、いかなる関数にも渡せないから',
      ],
      answer: 0,
      explanation: '`let` は再代入前提なので、`current` は `\'pending\'` ではなく **string に広げて(widening)推論**されます。string には \'canceled\' なども含まれるため、リテラル union には代入できません。`const current = \'pending\'` なら再代入がないのでリテラル型 `\'pending\'` に推論され、そのまま通ります(`let current: \'pending\' | \'shipped\'` と注釈する手もあります)。変数が渡せないわけでも、let が特別に禁止されているわけでもありません — 推論される型が違うだけです。',
      review: 'union 型とリテラル型 — enum の代わり',
    },
    {
      d: 3,
      type: 'choice',
      prompt: 'この演習環境(strict + noUncheckedIndexedAccess)で、次のコードはどうなる?',
      code: `const members: string[] = ["田中", "鈴木"];
const first = members[0];
console.log(first.toUpperCase());`,
      options: [
        '3行目がコンパイルエラー。members[0] は string | undefined と推論されるため、チェックなしで toUpperCase() を呼べない',
        '問題なくコンパイルされ "田中" が出力される。添字 0 の存在は配列リテラルから明らかなため',
        '2行目がコンパイルエラー。添字アクセスには必ず境界チェックの記述が必要なため',
        'members[0] は any と推論されるので、コンパイルは通るが型安全ではない',
      ],
      answer: 0,
      explanation: 'noUncheckedIndexedAccess 下では、配列の添字アクセスの型は `string` ではなく `string | undefined` になります(範囲外なら undefined が返るという実行時の事実を型が正直に表現)。なので `first.toUpperCase()` は `\'first\' is possibly \'undefined\'` エラーです。`string[]` 型は「長さ2以上」を保証しないため、リテラルで初期化していてもコンパイラは添字の存在を認めません。添字アクセス自体(2行目)は合法で、エラーになるのは undefined の可能性を無視した3行目。`first?.toUpperCase()` や if チェック、あるいは for-of で回避します。',
      review: 'strictNullChecks — Optional が言語に組み込まれている',
    },
    {
      d: 3,
      type: 'choice',
      prompt: '`setLevel(level)` は通るのに、`setLevel(config.level)` はエラーになる。理由として正しいのは?',
      code: `type Level = 'low' | 'high';
function setLevel(l: Level): void {
  console.log(l);
}

const level = 'low';
const config = { level: 'low' };

setLevel(level);        // OK
setLevel(config.level); // エラー: Argument of type 'string' is not assignable to parameter of type 'Level'`,
      options: [
        "const 変数は 'low' というリテラル型に推論されるが、オブジェクトのプロパティは後から書き換えられるため string に widening されるから",
        'オブジェクトのプロパティは関数の引数に直接渡せない仕様だから',
        "config が const でないから。const にすればプロパティもリテラル型になる",
        'type で定義した型は変数経由の値を受け取れず、interface が必要だから',
      ],
      answer: 0,
      explanation: "`const level = 'low'` は再代入不可能なのでリテラル型 `'low'` に推論されます。一方オブジェクトのプロパティは `config.level = 'なんでも'` と後から書き換え可能なため、let と同じく **string に widening** されます — config 自体が const でも、プロパティの再代入は防げないからです(選択肢3の誤り)。直すには `const config: { level: Level } = { level: 'low' }` と注釈するのが基本です。プロパティを引数に渡すこと自体は当然可能で、type / interface の違いも無関係 — 問題はあくまで「推論された型が string か Level か」だけです。",
      review: 'union 型とリテラル型 — enum の代わり',
    },
  ],
});
