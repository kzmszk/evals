// 基礎編 Ch.2 — JS の癖
window.COURSE.register({
  id: 'basic-02',
  part: 'basic',
  title: 'JS の癖 — Python/Java 経験者の最初の壁',
  minutes: 50,
  goal: 'let/const・truthiness・null と undefined・this の束縛など、Java / Python の直感が通用しない JavaScript の挙動を予測でき、メソッド切り出しで this が壊れるコードを見抜いて直せる。',
  sections: [
    {
      title: 'let / const とブロックスコープ',
      body: `変数宣言は \`let\`(再代入する)と \`const\`(再代入しない)の2つだけ使います。古い \`var\` は関数スコープや巻き上げなど罠が多いので、このコースでは**一度も使いません**。見かけたら古いコードだと思ってください。

Java 経験者へ: \`const\` は \`final\` なローカル変数と同じ感覚です。**再代入が禁止されるだけで、オブジェクトの中身は変更できます**。\`final List\` に \`add\` できるのと同じですね。スコープも Java と同じブロックスコープなので、直感どおりに動きます。

Python 経験者へ: ここは Python と大きく違う点です。Python は関数スコープで、\`if\` ブロックの中で作った変数が外でも見えましたが、TS の \`let\` / \`const\` は **\`{ }\` の外からは見えません**。また Python に定数宣言はありませんでしたが、TS では「再代入しないなら \`const\`」が基本です。

使い分けの実務指針は単純で、**まず \`const\` で書き、再代入が必要になったときだけ \`let\` に変える**。実際のコードベースでは9割が \`const\` になります。`,
      code: `const user = { name: "田中", age: 30 };
user.age = 31; // OK: const は「再代入禁止」であって「不変」ではない
// user = { name: "佐藤", age: 20 }; // エラー: 再代入はできない

let total = 0; // 再代入するので let
for (const n of [100, 200, 300]) {
  total += n;
}
console.log(user.name, user.age, total);

if (total > 0) {
  const message = "合計は正の数";
  console.log(message);
}
// console.log(message); // エラー: message はブロックの外からは見えない`,
    },
    {
      title: '=== と truthiness — null と undefined の二重存在',
      body: `**比較は常に \`===\` / \`!==\` を使います**。JS の \`==\` は比較の前に暗黙の型変換を行う歴史的な失敗作で、\`0 == ""\` が true になるような世界です。幸い TS は型が重ならない値同士の \`==\` をコンパイルエラーにしてくれますが、ルールとして「\`==\` は書かない」で統一してください。例外は1つだけ、後述の \`x == null\` です。

次に **truthiness**。\`if (x)\` と書いたとき、falsy(偽扱い)になるのは \`false\`, \`0\`, \`""\`, \`null\`, \`undefined\`, \`NaN\` だけです。Python 経験者は要注意: **空配列 \`[]\` と空オブジェクト \`{}\` は truthy です**。Python の \`if not items:\` の感覚で \`if (!items)\` と書いても空配列を検出できません。長さは \`items.length === 0\` で判定します。

そして最大の癖が「無」が2つあること。Java の \`null\`、Python の \`None\` は1種類でしたが、JS には:

- **\`undefined\`** — 言語が自動的に入れる「無」。未代入の変数、存在しないプロパティ、\`return\` しない関数の戻り値
- **\`null\`** — プログラマが意図的に置く「無」。「探したが見つからなかった」など

\`\`\`ts
let a: number | undefined;       // 未代入 → undefined(自動)
const hit: string | null = null; // 意図的な不在 → null(手動)
\`\`\`

TS の型システム上も \`string | undefined\` と \`string | null\` は**別の型**です。実務指針: 自分が書くコードでは \`undefined\` に寄せる(そもそも \`null\` を作らない)チームが多数派です。ただし \`JSON.parse\` や DOM API は \`null\` を返すので、両方を一度に判定したい場面では唯一の公認イディオム **\`x == null\`**(null と undefined の両方に一致)を使います。`,
      code: `// falsy は false, 0, "", null, undefined, NaN のみ
const zero = 0;
const emptyStr = "";
const zeroStr = "0";
const items: number[] = [];
console.log(zero ? "truthy" : "falsy");     // falsy
console.log(emptyStr ? "truthy" : "falsy"); // falsy
console.log(zeroStr ? "truthy" : "falsy");  // truthy(空でない文字列)
console.log(items ? "truthy" : "falsy");    // truthy! Python と違い空配列は真
console.log(items.length === 0);            // true — 空判定は length で行う

// TS は型が重ならない == をコンパイルエラーにしてくれる
// console.log(1 == "1"); // エラー: This comparison appears to be unintentional

// 唯一の公認イディオム: == null は null と undefined の両方に一致する
console.log(null == undefined); // true
console.log(null === undefined); // false(=== では別物)`,
    },
    {
      title: '関数は値 — 関数宣言・関数式・アロー関数',
      body: `Java ではメソッドは必ずクラスの中に書くもので、メソッド単体を変数に入れて持ち運ぶことはできませんでした(Java 8 のラムダをご存知ならそれが例外ですが、**知らなくてもここからの説明で困りません**)。JS では発想が違います: **関数はそれ自体がひとつの「値」**で、数値や文字列と同じように変数に入れたり、他の関数に渡したりできます。

書き方は3段階で理解してください。

**① 関数宣言** — いちばん見慣れた形。名前を付けて定義します:

\`\`\`ts
function double(x: number): number {
  return x * 2;
}
\`\`\`

**② 関数式** — 「関数という値」を作って変数に代入する形。\`function\` の後ろに名前がない(**無名関数**)ことに注目してください。名前は左辺の変数が担うからです:

\`\`\`ts
const double = function (x: number): number {
  return x * 2;
};
\`\`\`

**③ アロー関数** — ②の関数式を短く書くための記法です。\`function\` キーワードを消して、引数と本体を \`=>\`(矢印)でつなぎます:

\`\`\`ts
const double = (x: number): number => {
  return x * 2;
};
// さらに: 本体が return 1行だけなら { } と return も省略できる
const double2 = (x: number) => x * 2;
\`\`\`

つまり**アロー関数は「無名関数の短縮記法」**です(Python の \`lambda\` に似ていますが、複数文でも何でも書ける点が違います)。

なぜこんな書き方が要るのか? 「関数を他の関数に渡す」場面(コールバック)が JS では非常に多いからです。配列の \`filter\` / \`map\` が代表例で、Java の拡張 for 文でやっていた処理をメソッドに関数を渡す形で書きます。下のコードで試してください。

なお、①と③は書き方だけの違いではなく **\`this\` の扱い**という重要な違いがあります(この章の後半で扱います)。先に結論だけ: **コールバックにはアロー関数を使う**のが現代の標準です。`,
      code: `// ① 関数宣言
function double(x: number): number {
  return x * 2;
}

// ③ アロー関数(②の関数式の短縮形)
const triple = (x: number): number => x * 3;

// 関数は「値」なので、他の関数に渡せる
function applyTwice(f: (x: number) => number, v: number): number {
  return f(f(v)); // 受け取った関数を2回適用
}
console.log(applyTwice(double, 5)); // 20
console.log(applyTwice(triple, 1)); // 9

// コールバックの典型: 配列の filter / map
// (Java なら拡張 for 文 + if + 結果リストへの add で書いていた処理)
const nums = [1, 2, 3, 4, 5, 6];
const evens = nums.filter((n) => n % 2 === 0).map((n) => n * 2);
console.log(evens.join(", ")); // 4, 8, 12`,
    },
    {
      title: 'class は糖衣構文',
      body: `Java では「すべては class から始まる」世界でしたが、JS ではオブジェクトを**リテラルでいきなり**作れます。

\`\`\`ts
const point = { x: 3, y: 4 }; // class 定義なしで作れる
\`\`\`

Python 経験者へ: 見た目は dict に似ていますが、アクセスは \`point.x\` と属性形式です。「その場で属性を持つオブジェクトを作れる」と思ってください。

では \`class\` は何かというと、ES2015 で追加された**糖衣構文**です。実体は昔ながらの「コンストラクタ関数 + プロトタイプ」で、\`typeof Rectangle\` は \`"function"\` を返します。プロトタイプの仕組みに深入りする必要はありません。覚えるべき帰結は2つ:

1. **class は必須ではない**。オブジェクトリテラルと関数で済む場面が多く、TS らしい設計ではむしろ class を使わない選択が増えます(応用編 Ch.7 で扱います)
2. class も実行時には「ただの関数」なので、Java のような実行時型情報(リフレクション)は期待できません — Ch.1 の type erasure の話と地続きです

なお TS では class を定義すると「値(コンストラクタ)」と「型(インスタンスの形)」の両方が作られます。今は気に留める程度で構いません。`,
      code: `// Java なら class を書かないとオブジェクトを作れないが……
const point = { x: 3, y: 4 }; // いきなり作れる({ x: number; y: number } と推論)
console.log(point.x + point.y); // 7

// class ももちろん書ける(ES2015 で追加された糖衣構文)
class Rectangle {
  width: number;
  height: number;
  constructor(width: number, height: number) {
    this.width = width;
    this.height = height;
  }
  area(): number {
    return this.width * this.height;
  }
}

const r = new Rectangle(3, 4);
console.log(r.area());         // 12
console.log(typeof Rectangle); // "function" — class の実体はコンストラクタ関数`,
    },
    {
      title: 'this は呼び出し方で決まる — メソッド切り出しの罠',
      body: `この章で最も重要な罠です。**JS の \`this\` は「どう定義したか」ではなく「どう呼び出されたか」で決まります**。

- Python: \`obj.method\` を変数に入れると**束縛メソッド**が返り、\`self\` は付いてくる。切り出しても壊れない
- Java: \`obj::method\` のメソッド参照もレシーバを保持する。壊れない
- JS: \`obj.method\` は**ただの関数**を取り出すだけ。\`this\` は呼び出しの瞬間に決まり、\`obj.method()\` の形なら \`obj\`、裸の \`f()\` なら **\`undefined\`**(strict モード)

つまりメソッドを変数に代入して呼ぶと、実行時に \`TypeError: Cannot read properties of undefined\` で落ちます。しかも **TS のコンパイルは通ります** — 型チェッカーはこの誤りを検出できません。「コンパイルが通った = 安全」が崩れる、数少ない有名な穴です。下のコードを実行して、最後の行で実際に落ちるのを確認してください。

対処は2つ覚えれば十分です:

\`\`\`ts
const inc1 = () => counter.increment();        // ① アロー関数で包む(推奨)
const inc2 = counter.increment.bind(counter);  // ② bind で this を固定
\`\`\`

①が効くのは、**アロー関数が自分の \`this\` を持たず、定義された場所の \`this\` をそのまま使う**(レキシカル束縛)からです。呼び出し方に左右される通常の関数と違い、アロー関数の \`this\` は書いた時点で確定します。コールバックにアロー関数を使え、と前節で言った最大の理由がこれです。イベントハンドラやコールバックにメソッドを渡すとき(\`items.forEach(logger.log)\` など)も同じ罠を踏むので、必ずアロー関数で包んでください。`,
      code: `class Counter {
  count = 0;
  increment(): number {
    this.count += 1;
    return this.count;
  }
}

const counter = new Counter();
console.log(counter.increment()); // 1 — counter.increment() の形なら this は counter

const inc = counter.increment; // 型エラーは出ない(TS は検出できない)
console.log("ここまでは動く");
console.log(inc()); // 実行時 TypeError! 裸の呼び出しでは this が undefined

// 修正するなら: const inc = () => counter.increment();`,
    },
    {
      title: '分割代入・スプレッド・?. / ??',
      body: `最後に、モダン JS の頻出構文をまとめて押さえます。どれも読めないとライブラリのサンプルコードが読めません。

**分割代入** — Python のタプルアンパックのオブジェクト版です。プロパティ名で取り出します。関数の引数でも使え、Python のキーワード引数の代役として多用されます。

**スプレッド \`...\`** — Python の \`*\` / \`**\` に相当します。\`{ ...defaults, port: 3000 }\` は Python の \`{**defaults, "port": 3000}\` と同じで、**後に書いたものが勝ち**ます。元のオブジェクトを変更せずコピーを作るので、イミュータブル志向のコードで頻出します。

**テンプレートリテラル** — バッククォート文字列の中に \`\${式}\` を埋め込めます。Python の f-string 相当です。

**オプショナルチェーン \`?.\`** — \`a?.b\` は「\`a\` が null / undefined なら例外を出さず undefined を返し、そうでなければ \`a.b\`」。Java で \`Optional.map\` を連ねる代わり、Python で \`if a is not None and a.b is not None ...\` と書く代わりの1文字です。

**null 合体 \`??\`** — \`x ?? 既定値\` は「\`x\` が null / undefined **のときだけ**既定値」。よく似た \`||\` は falsy 全部(\`0\` や \`""\` も!)で右辺に落ちるため、「0 は正当な値」の場面でバグになります。**既定値の補完には \`||\` ではなく \`??\`** と覚えてください。`,
      code: `const config = { url: "http://localhost", timeout: 3000, debug: true };
const { url, timeout } = config; // 分割代入: プロパティ名で取り出す
console.log(\`\${url} (timeout: \${timeout}ms)\`); // テンプレートリテラル = f-string

const defaults = { retries: 3, timeout: 1000 };
const merged = { ...defaults, timeout: 5000 }; // Python の {**defaults, "timeout": 5000}
console.log(merged.retries, merged.timeout); // 3 5000

type User = { name: string; address?: { city: string } };
const u: User = { name: "佐藤" };
console.log(u.address?.city);            // undefined(例外にならない)
console.log(u.address?.city ?? "未登録"); // ?? は null/undefined のときだけ右辺

const retryCount = 0; // 0 は「リトライしない」という正当な設定値
console.log(retryCount || 999); // 999 — || は falsy 全部で右辺に落ちる(罠)
console.log(retryCount ?? 999); // 0   — ?? は null/undefined のときだけ(こちらを使う)`,
    },
  ],
  exercise: {
    instructions: `### 演習: カートの合計金額を直す

下のコードは実行すると**実行時エラーで落ち**、さらに落ちない状態にしても**合計金額が間違います**。バグは2つ(コード内のコメント「バグ1」「バグ2」の箇所):

1. **バグ1**: 価格の既定値補完に \`||\` を使っているため、**0円の無料サンプルが500円で計上**される
2. **バグ2**: \`total\` メソッドを**変数に切り出して**呼んでいるため、\`this\` が undefined になり実行時 TypeError になる(コンパイルは通ることに注目)

この章で学んだ道具(\`??\`、アロー関数)で2箇所を直してください。**class 本体の \`add\` と \`total\` のロジック構造は変えず**、\`||\` は使わないこと。

期待される出力(1200 + 0 + 500):

\`\`\`
合計: 1700円
\`\`\``,
    starter: `type Product = { name: string; price?: number };

class Cart {
  private products: Product[] = [];

  add(product: Product): void {
    this.products.push(product);
  }

  total(): number {
    let sum = 0;
    for (const p of this.products) {
      sum += p.price || 500; // バグ1: 0円の商品が500円で計上される
    }
    return sum;
  }
}

const cart = new Cart();
cart.add({ name: "コーヒー", price: 1200 });
cart.add({ name: "無料サンプル", price: 0 });
cart.add({ name: "紅茶" }); // price 未指定 → 既定の500円

const showTotal = cart.total; // バグ2: メソッド切り出しで this が壊れる
console.log("合計: " + showTotal() + "円");
`,
    check: {
      noErrors: true,
      mustMatch: ['\\?\\?', 'showTotal\\(\\)'],
      forbid: ['\\|\\|', '\\bany\\b', '\\bas\\b'],
      output: '合計: 1700円',
    },
  },
  quiz: [
    // ---- easy (d:1) ----
    {
      d: 1,
      type: 'choice',
      prompt: '`const` で宣言したオブジェクトについて正しいのは?',
      options: [
        '再代入はできないが、プロパティの変更はできる(Java の final 参照と同じ感覚)',
        'オブジェクト全体が不変になる(Python の tuple のように凍結される)',
        '再代入もプロパティ変更も自由にできる',
        'プロパティの読み取りはできるが、メソッドは呼べなくなる',
      ],
      answer: 0,
      explanation: '`const` が禁止するのは**変数への再代入**だけで、オブジェクトの中身(プロパティ)は自由に変更できます。Java の `final List` に `add` できるのと同じです。「凍結」は `Object.freeze` という別の仕組みで、`const` にその効果はありません。メソッド呼び出しにも一切影響しません。',
      review: 'let / const とブロックスコープ',
    },
    {
      d: 1,
      type: 'choice',
      prompt: '次のうち、if 文の条件に置いたとき **truthy** と評価されるのは?',
      options: [
        '`[]`(空配列)',
        '`0`',
        '`""`(空文字列)',
        '`undefined`',
      ],
      answer: 0,
      explanation: 'falsy は `false`, `0`, `""`, `null`, `undefined`, `NaN` だけで、**空配列と空オブジェクトは truthy** です。Python では `if not items:` で空リストを検出できましたが、JS では常に真になるため `items.length === 0` で判定します。`0` / `""` / `undefined` はいずれも falsy の代表例です。',
      review: '=== と truthiness — null と undefined の二重存在',
    },
    {
      d: 1,
      type: 'choice',
      prompt: '`let x: number | undefined;` と宣言だけして何も代入していない変数 `x` の値は?',
      options: [
        '`undefined`',
        '`null`',
        '`0`',
        '未初期化変数の参照はコンパイルエラーになるので値はない',
      ],
      answer: 0,
      explanation: '未代入の変数に言語が自動で入れる「無」は `undefined` です。`null` はプログラマが意図的に置かない限り現れません(Java の参照型の既定値が null なのとは逆)。数値の既定値 0 のような仕組みもありません。型に `undefined` を含めて宣言しているため、代入前に参照しても strict でコンパイルエラーにはなりません。',
      review: '=== と truthiness — null と undefined の二重存在',
    },
    {
      d: 1,
      type: 'choice',
      prompt: '「x を受け取って 2倍を返す関数」を作り、変数 `double` に代入したい。アロー関数での正しい書き方は?',
      options: [
        '`const double = (x: number) => x * 2;`',
        '`const double = x -> x * 2;`',
        '`const double = lambda x: x * 2;`',
        '`const double = function => (x) { return x * 2 };`',
      ],
      answer: 0,
      explanation: 'アロー関数は「引数リスト `=>` 本体」の形で、本体が式1個なら `{ return }` を省略できます。`->` は Java、`lambda` は Python の記法で、JS/TS には存在しません。`function` キーワードを使う場合の正しい形(関数式)は `const double = function (x: number) { return x * 2; };` です。',
      review: '関数は値 — 関数宣言・関数式・アロー関数',
    },
    // ---- medium (d:2) ----
    {
      d: 2,
      type: 'choice',
      prompt: '次のコードをコンパイル・実行するとどうなる?',
      code: `class Counter {
  count = 0;
  increment(): number {
    this.count += 1;
    return this.count;
  }
}

const c = new Counter();
const inc = c.increment;
console.log(inc());`,
      options: [
        'コンパイルは通るが、実行時に TypeError になる(this が undefined のため)',
        '1 と出力される(Python の束縛メソッドと同様、c が this として保持される)',
        'コンパイルエラーになる(this を使うメソッドは切り出せない)',
        'NaN と出力される(this.count が数値でなくなるため)',
      ],
      answer: 0,
      explanation: 'JS の `this` は呼び出し方で決まるため、`c.increment` の切り出しは「ただの関数」を取り出すだけで、裸の `inc()` では this が undefined になり `this.count` の参照で TypeError になります。Python の束縛メソッドの直感は通用しません。そして **TS はこの誤りを検出できない**ため、コンパイルは通ってしまいます。修正は `() => c.increment()` と包むか `bind` です。',
      review: 'this は呼び出し方で決まる — メソッド切り出しの罠',
    },
    {
      d: 2,
      type: 'choice',
      prompt: '次のコードの出力は?',
      code: `const timeout = 0;
const a = timeout || 30;
const b = timeout ?? 30;
console.log(a, b);`,
      options: [
        '30 0',
        '0 0',
        '30 30',
        '0 30',
      ],
      answer: 0,
      explanation: '`||` は左辺が **falsy 全部**(0 も含む)で右辺に落ちるため `a` は 30。`??` は左辺が **null / undefined のときだけ**右辺に落ちるため、0 は正当な値として残り `b` は 0 です。「0 や空文字列が正当な値になりうる既定値補完」で `||` を使うのが典型的なバグで、常に `??` を使うべき理由がこれです。',
      review: '分割代入・スプレッド・?. / ??',
    },
    {
      d: 2,
      type: 'choice',
      prompt: '次のコードの出力は?',
      code: `let count = 1;
if (true) {
  let count = 2;
  count += 10;
}
console.log(count);`,
      options: [
        '1',
        '12',
        '2',
        'コンパイルエラー(同名変数の再宣言は不可)',
      ],
      answer: 0,
      explanation: '`let` はブロックスコープなので、if 内の `count` は外の `count` とは**別の変数**(シャドーイング)です。内側でいくら変更しても外の `count` は 1 のまま。Java では内側ブロックでの同名再宣言はコンパイルエラーですが、JS/TS では合法です(別スコープなら再宣言できる)。12 になるのは同一変数だった場合の値です。',
      review: 'let / const とブロックスコープ',
    },
    {
      d: 2,
      type: 'choice',
      prompt: '変数 `x`(型 `string | null | undefined`)が null と undefined の**どちらでもない**ことを1回の比較で確かめる慣用句は?',
      options: [
        '`x != null`(== / != は null と undefined を同一視するため、両方を一度に除外できる)',
        '`x !== null`(厳密比較なので undefined も同時に除外される)',
        '`x !== undefined`(null は undefined の一種なので同時に除外される)',
        '`typeof x !== "null"`(typeof で判定するのが最も確実)',
      ],
      answer: 0,
      explanation: '`==` / `!=` は null と undefined を互いに等しいとみなすため、`x != null` だけが両方を一度に除外できる公認イディオムです(「== は使わない」ルールの唯一の例外)。`!== null` は undefined を素通しし、`!== undefined` は null を素通しします(null と undefined は別の値です)。`typeof null` は歴史的バグで `"object"` を返し、`"null"` という結果は存在しません。',
      review: '=== と truthiness — null と undefined の二重存在',
    },
    {
      d: 2,
      type: 'choice',
      prompt: '次のコードの出力は?',
      code: `class Rectangle {
  width = 10;
}
console.log(typeof Rectangle);`,
      options: [
        '"function"',
        '"class"',
        '"object"',
        'コンパイルエラー(型である class を typeof に渡せない)',
      ],
      answer: 0,
      explanation: '`class` は糖衣構文で、実行時の実体は**コンストラクタ関数**です。だから `typeof` は `"function"` を返します。`"class"` という typeof の結果は存在しません。またクラス宣言は「値(コンストラクタ)」と「型」の両方を作るので、値として `typeof` に渡すのは合法です。Java のように class が実行時に特別な型情報を持つわけではない、という type erasure の世界観の一部です。',
      review: 'class は糖衣構文',
    },
    // ---- hard (d:3) ----
    {
      d: 3,
      type: 'code',
      prompt: '次のコードはコンパイルは通りますが、実行すると TypeError で落ちます。**class 本体は変更せず**、`greetFn` の定義を直して「こんにちは、鈴木さん」と出力させてください。',
      starter: `class Greeter {
  name = "鈴木";
  greet(): string {
    return "こんにちは、" + this.name + "さん";
  }
}

const g = new Greeter();
const greetFn = g.greet; // ← この行を直す
console.log(greetFn());
`,
      check: {
        noErrors: true,
        mustMatch: ['greetFn\\(\\)'],
        forbid: ['\\bany\\b', '\\bas\\b', 'greet\\s*=\\s*\\('],
        output: 'こんにちは、鈴木さん',
      },
      explanation: '`g.greet` の切り出しは this を持たない「ただの関数」を取り出すため、裸の `greetFn()` では this が undefined になります。修正は `const greetFn = () => g.greet();`(アロー関数で包む、推奨)か `const greetFn = g.greet.bind(g);`(bind で固定)。アロー関数版が効くのは、呼び出しが常に `g.greet()` の形になるからです。',
      review: 'this は呼び出し方で決まる — メソッド切り出しの罠',
    },
    {
      d: 3,
      type: 'choice',
      prompt: 'Java の `list.forEach(logger::log)` の感覚で書いた次のコードはどうなる?',
      code: `class Logger {
  prefix = "[app]";
  log(msg: string): void {
    console.log(this.prefix + " " + msg);
  }
}

const logger = new Logger();
["a", "b"].forEach(logger.log);`,
      options: [
        'コンパイルは通るが、実行時に TypeError になる(log 内の this が undefined のため)',
        '"[app] a" "[app] b" と出力される(Java のメソッド参照と同様、レシーバが保持される)',
        'コンパイルエラーになる(forEach のコールバック型とメソッドの this 型が合わない)',
        '"a" "b" と出力される(this.prefix が空文字列として評価される)',
      ],
      answer: 0,
      explanation: 'Java の `logger::log` はレシーバを保持しますが、JS の `logger.log` は this を持たない裸の関数を渡すだけです。forEach が呼び出すとき this は undefined なので `this.prefix` で TypeError になります。TS はシグネチャ(引数の型)しか見ないためコンパイルは通ります — 引数が少ない関数をコールバックに渡すのは合法なのでエラーになりません。正しくは `["a", "b"].forEach((m) => logger.log(m))` とアロー関数で包みます。',
      review: 'this は呼び出し方で決まる — メソッド切り出しの罠',
    },
    {
      d: 3,
      type: 'choice',
      prompt: '前問と似ていますが、メソッドを**クラスフィールド + アロー関数**で定義しました。実行するとどうなる?',
      code: `class Timer {
  seconds = 0;
  tick = (): number => {
    this.seconds += 1;
    return this.seconds;
  };
}

const t = new Timer();
const tick = t.tick;
console.log(tick());`,
      options: [
        '1 と出力される(アロー関数の this はインスタンス生成時に確定していて、切り出しても壊れない)',
        '実行時に TypeError になる(裸の呼び出しでは this が undefined になる)',
        'コンパイルエラーになる(クラスフィールドに関数は代入できない)',
        'undefined と出力される(this.seconds が見つからないため)',
      ],
      answer: 0,
      explanation: 'アロー関数は自分の this を持たず、**定義された場所の this を固定で使います**(レキシカル束縛)。クラスフィールドの初期化はインスタンス生成時に走るため、`tick` の this はそのインスタンスに確定しており、切り出して裸で呼んでも壊れません。通常のメソッド構文(前問)との違いがまさにこれで、コールバックに渡す前提のメソッドをアロー関数フィールドで書くのは実務の定石です。クラスフィールドへの関数代入はもちろん合法で、コンパイルエラーにはなりません。',
      review: 'this は呼び出し方で決まる — メソッド切り出しの罠',
    },
  ],
});
