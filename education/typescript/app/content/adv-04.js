// 応用編 Ch.4 — ジェネリクス
window.COURSE.register({
  id: 'adv-04',
  part: 'advanced',
  title: 'ジェネリクス — 型を受け取る関数',
  minutes: 60,
  goal: 'ジェネリック関数を型引数の明示なしで使いこなし、extends 制約と keyof を組み合わせた型安全な API(getProp / groupBy など)を自作できる。',
  sections: [
    {
      title: '型引数の基本 — 呼び出し側の値が型を決める',
      body: `ジェネリクスの構文自体は Java とほぼ同じ発想です。Java の \`<T> T first(List<T> list)\` は、TS では関数名の直後に型引数を書きます:

\`\`\`
function first<T>(arr: T[]): T | undefined
\`\`\`

Python 経験者へ: \`TypeVar\` や Python 3.12 の \`def first[T](items: list[T]) -> T\`(PEP 695)と同じものです。

Java との最初の違いは**明示指定の頻度**です。Java では推論が代入先や diamond 演算子頼みで、\`Collections.<String>emptyList()\` のような明示(type witness)がそれなりに必要でした。TS の型引数は**呼び出し時に、渡された引数の値から**推論されます。だから実務の TS でジェネリック関数を \`first<number>([1, 2, 3])\` と呼ぶことはまずありません。\`first([1, 2, 3])\` と書けば \`T = number\` が決まります。

明示が必要なのは**推論の手がかりが無いとき**だけです。典型は2つ:

- 空配列を渡すとき(\`first([])\` では T を決めようがない)
- 引数に T が現れない関数(戻り値だけがジェネリックな関数)

もうひとつ、このコースのコンパイラ設定(\`noUncheckedIndexedAccess\`)では \`arr[0]\` の型が \`T | undefined\` になる点に注意してください。空配列かもしれない以上 \`first\` の戻り値も \`T | undefined\` にするのが正直な型です。下のコードで、各変数にカーソルを当てて推論結果を確認してください。`,
      code: `function first<T>(arr: T[]): T | undefined {
  return arr[0]; // noUncheckedIndexedAccess により T | undefined
}

const n = first([1, 2, 3]);    // n: number | undefined — T = number と推論
const s = first(["a", "b"]);   // s: string | undefined — T = string と推論
const e = first<string>([]);   // 空配列は手がかりが無いので、ここだけ明示
console.log(n, s, e);`,
    },
    {
      title: 'extends による制約 — 「使う操作」を型で宣言する',
      body: `制約なしの \`T\` は「何が来るか分からない」型なので、T 型の値に対してできる操作はほぼありません。Java で生の \`T\` が \`Object\` のメソッドしか呼べないのと同じ感覚です。\`.length\` を使いたければ、\`extends\` で「T はこの形を満たす」と宣言します。

ここで Java と決定的に違うのが、制約の判定が**構造的**であることです。Java の \`<T extends Comparable<T>>\` は「Comparable を \`implements\` したクラス」に限定されます(nominal)。TS の \`<T extends { length: number }>\` は、**\`length: number\` を持ってさえいれば**、string でも配列でも自作オブジェクトでも通ります。implements 宣言は要りません — 応用編 Ch.1 でやった構造的型付けが、そのままジェネリクスの制約にも効くわけです。

\`extends\` という単語に「継承」を連想しないでください。意味は「**T は右辺の形に代入可能である**」という部分集合の宣言です。

下のコードで \`longest("hello", "hi")\` の戻り値が(\`{ length: number }\` ではなく)\`string\` と推論されることも確認してください。制約は入口の条件にすぎず、T 自体は呼び出しごとの具体的な型を保ちます。最後の行のコメントを外すと、number は制約を満たさないためコンパイルエラーになります。`,
      code: `function longest<T extends { length: number }>(a: T, b: T): T {
  return a.length >= b.length ? a : b;
}

console.log(longest("hello", "hi"));               // T = string
console.log(longest([1, 2, 3], [4, 5]).join("-")); // T = number[]

// ↓ コメントを外すとエラー: number は { length: number } を満たさない
// longest(10, 20);`,
    },
    {
      title: 'keyof との組み合わせ — プロパティ名まで型安全にする',
      body: `「オブジェクトとプロパティ名を受け取って、その値を返す」関数を考えます。Java でこれをやるとリフレクション + キャストになり、型安全は完全に諦めることになります。TS では2つの部品で解決できます。

- \`keyof T\` — T のプロパティ名の union 型。\`{ name: string; age: number }\` なら \`"name" | "age"\`
- \`T[K]\` — indexed access 型。「T の K プロパティの値の型」(詳しくは次章)

この2つをジェネリクスの制約に組み込んだのが、TS の頻出イディオム \`getProp<T, K extends keyof T>\` です。

推論の動きが面白いところで、\`getProp(user, "name")\` と呼ぶと K は string ではなく**リテラル型 \`"name"\`** に推論されます。だから戻り値は \`T["name"]\` = \`string\` とプロパティ単位で正確に決まり、存在しないキーを渡せばコンパイルエラーになります。値(文字列リテラル)からリテラル型のレベルまで推論が効く — Java の推論との差が一番はっきり出る場面です。

ライブラリの型定義(lodash の \`get\`、\`Object.keys\` 系ユーティリティなど)でこのパターンは頻出します。読めるようになると、複雑に見えた型定義の大半が「制約付き型引数の組み合わせ」だと分かります。`,
      code: `function getProp<T, K extends keyof T>(obj: T, key: K): T[K] {
  return obj[key];
}

const user = { name: "佐藤", age: 28 };

const n = getProp(user, "name"); // n: string — K は "name" と推論される
const a = getProp(user, "age");  // a: number
console.log(n, a);

// ↓ コメントを外すとエラー: "email" は "name" | "age" に代入できない
// getProp(user, "email");`,
    },
    {
      title: '複数型引数の推論とデフォルト型引数',
      body: `型引数が複数あっても、推論は引数の間を流れるように進みます。\`map\` を例に:

\`\`\`
function map<T, U>(arr: T[], fn: (x: T) => U): U[]
\`\`\`

\`map(["a", "bb"], (s) => s.length)\` と呼ぶと、① 第1引数から \`T = string\` が確定 → ② その T がコールバックに流れ、\`s\` は注釈なしで string になる(contextual typing)→ ③ コールバックの戻り値から \`U = number\` が確定。Java なら型引数の明示やラムダ引数の型注釈が必要になりがちな場面が、TS では全部推論で通ります。

もうひとつ、TS には**デフォルト型引数**があります:

\`\`\`
interface ApiResponse<T = unknown> {
  status: number;
  body: T;
}
\`\`\`

\`ApiResponse\` と型引数を省略すると \`T = unknown\` が使われます。Java 経験者は注意 — Java で \`List<String>\` の型引数を省略すると **raw type** という「型チェックが緩む別物」になりますが、TS に raw type は存在しません。デフォルトがあれば省略可、なければ型引数の省略は単なるコンパイルエラーです。Python では PEP 696(3.13)でようやく同等の機能が入りました。

デフォルト型引数が効くのは主に型・インターフェースの定義側です。関数呼び出しでは前節までの通り推論が働くので、デフォルトの出番はほぼありません。`,
      code: `function map<T, U>(arr: T[], fn: (x: T) => U): U[] {
  const out: U[] = [];
  for (const x of arr) out.push(fn(x));
  return out;
}

// s は注釈なしで string(T が流れてくる)、戻り値から U = number
const lens = map(["a", "bb", "ccc"], (s) => s.length);
console.log(lens.join(",")); // 1,2,3

interface ApiResponse<T = unknown> {
  status: number;
  body: T;
}
const r1: ApiResponse = { status: 200, body: "型引数を省略 → T = unknown" };
const r2: ApiResponse<string[]> = { status: 200, body: ["a", "b"] };
console.log(r1.status, r2.body.length);`,
    },
    {
      title: 'Java ジェネリクスとの差分 — 消去は同じ、推論と変性が違う',
      body: `章の締めに、Java ジェネリクスとの差分を3点で整理します。

**① 消去(erasure)は同じ — むしろ TS の方が徹底している。** どちらも型引数は実行時に消えます。Java 同様、TS でも \`new T()\` は書けません。Java では \`Class<T>\` を引数で受け取る慣用がありますが、TS の対応物は**コンストラクタを値として受け取る**ことです: \`function create<T>(ctor: new () => T): T\`。そして Ch.1 の復習ですが、TS は型引数どころか interface も型注釈も**すべて**消えます。

**② 推論力が違う。** Java の推論は代入先(target typing)と diamond 頼みで、ラムダが絡むと型注釈や witness が必要になりがちです。TS は引数の値から、リテラル型のレベル(\`"name"\`)まで推論します。「型引数の明示がほぼ不要」という体験の差はここから来ています。

**③ 変性(variance)の扱いが違う。** Java のジェネリック型は**不変**(\`List<Dog>\` は \`List<Animal>\` に代入不可)で、使用側で \`? extends\` / \`? super\` を付けて緩めます。TS にワイルドカードはありません。構造的な互換性で判定され、配列やジェネリック型のプロパティは基本**共変**として扱われます:

\`\`\`
const dogs: Dog[] = [new Dog()];
const animals: Animal[] = dogs; // Java では不可。TS では通る(共変)
animals.push(new Cat());        // 型は通るが、dogs に Cat が混入!
\`\`\`

これは理論的には**不健全(unsound)**です。TS は「配列の読み出しが圧倒的多数」という実用性を優先してこの穴を許容しました。書き込みの穴を塞ぎたければ \`readonly Animal[]\` で受ければ \`push\` 自体ができなくなります。なお関数の**引数**の位置は逆に反変で厳密にチェックされます(\`strictFunctionTypes\`)— この深掘りは Ch.8 でやります。`,
    },
  ],
  exercise: {
    instructions: `### 演習: 型安全な groupBy を自作する

配列を「キー関数」でグループ分けする \`groupBy\` を完成させてください。\`groupBy(people, (p) => p.dept)\` のように使い、\`{ dev: [...], sales: [...] }\` の形を返します。

要件:

- どんな要素型でも使えるよう**ジェネリック**にする。シグネチャはこの形:
  \`groupBy<T>(items: T[], keyFn: (item: T) => string): Record<string, T[]>\`
- \`any\` / \`as\` は禁止(判定で落ちます)
- **noUncheckedIndexedAccess に注意**: \`result[key]\` の型は \`T[] | undefined\` です。\`const bucket = result[key] ?? [];\` のように「無ければ新しい配列」で受けると素直に書けます(push した bucket を \`result[key]\` に入れ直すのを忘れずに)

期待される出力:

\`\`\`
佐藤,高橋
1
\`\`\`

完成したら、呼び出し側の \`(p: Person)\` の注釈を \`(p)\` に変えても型が通ることを確認してみてください — T が Person に推論され、コールバックへ流れてくるはずです。`,
    starter: `// TODO: groupBy をジェネリックにして実装を完成させる(いまは引数に型が付いておらずエラー)
function groupBy(items, keyFn) {
  const result = {};
  for (const item of items) {
    const key = keyFn(item);
    // TODO: result[key] に item を追加(キーがまだ無ければ新しい配列を作る)
  }
  return result;
}

type Person = { name: string; dept: string };
const people: Person[] = [
  { name: "佐藤", dept: "dev" },
  { name: "鈴木", dept: "sales" },
  { name: "高橋", dept: "dev" },
];

const byDept = groupBy(people, (p: Person) => p.dept);
console.log((byDept.dev ?? []).map((p: Person) => p.name).join(","));
console.log((byDept.sales ?? []).length);
`,
    check: {
      noErrors: true,
      mustMatch: ['groupBy<\\s*T\\b'],
      forbid: ['\\bany\\b', '\\bas\\b'],
      output: '佐藤,高橋\n1',
    },
  },
  quiz: [
    // ---- easy (d:1) ----
    {
      d: 1,
      type: 'choice',
      prompt: 'TypeScript でジェネリック関数を呼ぶとき、型引数の扱いとして最も普通なのは?',
      options: [
        '明示せず、渡した引数の値から推論させる(明示が要るのは空配列など手がかりが無い場合だけ)',
        'Java と同様、`f<string>(...)` のように呼び出しごとに明示するのが基本',
        'tsconfig.json でプロジェクト全体の型引数を一括指定する',
        '実行時に型引数を引数として渡す',
      ],
      answer: 0,
      explanation: 'TS の型引数は呼び出し時に引数の値から推論されるため、明示指定はほぼ書きません。Java でも推論はありますが diamond や target typing 頼みで明示が必要な場面が多く、その感覚を持ち込む必要はありません。tsconfig に型引数の設定はなく、型は実行時に消えるので「実行時に渡す」も不可能です。',
      review: '型引数の基本 — 呼び出し側の値が型を決める',
    },
    {
      d: 1,
      type: 'choice',
      prompt: '`function f<T extends { length: number }>(x: T)` の `extends` の意味として正しいのは?',
      options: [
        'T は `{ length: number }` という形を構造的に満たす型に限る(implements 宣言は不要)',
        'T は `{ length: number }` を継承(extends)したクラスに限る',
        '実行時に x の length プロパティの存在チェックが行われる',
        'T のデフォルト型を `{ length: number }` にする',
      ],
      answer: 0,
      explanation: 'ジェネリクスの `extends` は「T は右辺に代入可能な型である」という構造的な制約です。Java と違い、interface を implements している必要はなく、形が合えば string でも配列でも通ります。継承関係の宣言ではなく、実行時チェックでもありません(型は消えます)。デフォルト型引数は `=` で書きます(`<T = string>`)。',
      review: 'extends による制約 — 「使う操作」を型で宣言する',
    },
    {
      d: 1,
      type: 'choice',
      prompt: '`getProp<T, K extends keyof T>` における `K extends keyof T` の意味は?',
      options: [
        'K は「T のプロパティ名のリテラル型の union」に含まれる型である',
        'K は T のプロパティの「値の型」のいずれかである',
        'K は T を継承した型である',
        'K は任意の string である',
      ],
      answer: 0,
      explanation: '`keyof T` は T のプロパティ名の union(`{ name: string; age: number }` なら `"name" | "age"`)で、`K extends keyof T` は K をその範囲に制約します。「値の型」の union は `T[keyof T]` であって keyof ではありません。任意の string を許したら存在しないキーを弾けないので、わざわざ制約する意味はそこにあります。',
      review: 'keyof との組み合わせ — プロパティ名まで型安全にする',
    },
    // ---- medium (d:2) ----
    {
      d: 2,
      type: 'choice',
      prompt: '次のコードで `result` に推論される型は?',
      code: `function map<T, U>(arr: T[], fn: (x: T) => U): U[] {
  const out: U[] = [];
  for (const x of arr) out.push(fn(x));
  return out;
}

const result = map([1, 2, 3], (n) => String(n));`,
      options: [
        'string[]',
        'number[]',
        '(string | number)[]',
        'unknown[](コールバックの n に型注釈が無いため)',
      ],
      answer: 0,
      explanation: '推論の流れは ① `[1, 2, 3]` から T = number ② その T がコールバックに流れて n は注釈なしで number(contextual typing)③ `String(n)` の戻り値から U = string。よって戻り値は string[] です。number[] は入力側、(string | number)[] はどこにも現れません。注釈が無くても unknown にはならないのが TS の推論力で、Java ならラムダ引数の型が決まらずコンパイルエラーになりがちな場面です。',
      review: '複数型引数の推論とデフォルト型引数',
    },
    {
      d: 2,
      type: 'choice',
      prompt: '次のコードで `v` に推論される型は?',
      code: `function getProp<T, K extends keyof T>(obj: T, key: K): T[K] {
  return obj[key];
}

const user = { name: "佐藤", age: 28 };
const v = getProp(user, "age");`,
      options: [
        'number',
        'string | number',
        'unknown',
        '"age"',
      ],
      answer: 0,
      explanation: '`"age"` を渡すと K は string ではなく**リテラル型 `"age"`** に推論され、戻り値は `T["age"]` = number になります。string | number になるのは K が `keyof T` 全体に広がった場合で、リテラルを直接渡す限りそうはなりません。`"age"` は K に推論される型であって v の型ではなく、unknown はどこにも出てきません。',
      review: 'keyof との組み合わせ — プロパティ名まで型安全にする',
    },
    {
      d: 2,
      type: 'choice',
      prompt: '次のコードの最終行がコンパイルエラーになる理由は?',
      code: `function longest<T extends { length: number }>(a: T, b: T): T {
  return a.length >= b.length ? a : b;
}

longest(10, 20); // エラー`,
      options: [
        'T = number と推論されるが、number は制約 `{ length: number }` を満たさない',
        '数値の比較には `Comparable` の実装が必要だから',
        '型引数を `longest<number>(10, 20)` と明示していないから',
        'longest は同じ型の引数を2つ取れないから',
      ],
      answer: 0,
      explanation: '推論自体は T = number まで進みますが、number に length プロパティは無いので制約違反でエラーになります(`Argument of type \'number\' is not assignable to parameter of type \'{ length: number; }\'`)。Comparable は Java の発想で、TS の制約は構造的な形の一致だけです。型引数の明示は不要ですし、明示しても制約違反は消えません。同じ型の引数を2つ取ること自体は何の問題もありません。',
      review: 'extends による制約 — 「使う操作」を型で宣言する',
    },
    {
      d: 2,
      type: 'choice',
      prompt: '次のコードの `b.value` に推論される型は?',
      code: `interface Box<T = string> {
  value: T;
}

const b: Box = { value: "hello" };
const c: Box<number> = { value: 42 };`,
      options: [
        'string(型引数を省略するとデフォルト型引数が使われる)',
        'unknown(型引数の省略は常に unknown になる)',
        'any(Java の raw type と同様、型チェックが緩む)',
        '型引数の省略はコンパイルエラーになる',
      ],
      answer: 0,
      explanation: '`Box<T = string>` にはデフォルト型引数があるので、`Box` は `Box<string>` の意味になり value は string です。unknown になるのはデフォルトを `= unknown` と書いた場合だけ。TS に Java の raw type(型チェックが緩む省略形)は存在しません。デフォルトが**無い**ジェネリック型で省略すればコンパイルエラーですが、この Box にはデフォルトがあります。',
      review: '複数型引数の推論とデフォルト型引数',
    },
    // ---- hard (d:3) ----
    {
      d: 3,
      type: 'code',
      prompt: '次のコードは `Type \'K\' cannot be used to index type \'T\'` というエラーになります。`pluck` の型引数に**制約を追加して**エラーを解消してください(`any` / `as` は禁止。実装本体と呼び出し側は変更不要)。',
      starter: `function pluck<T, K>(items: T[], key: K): T[K][] {
  return items.map((item) => item[key]);
}

const users = [
  { name: "佐藤", age: 28 },
  { name: "鈴木", age: 31 },
];

console.log(pluck(users, "name").join(","));
`,
      check: {
        noErrors: true,
        mustMatch: ['extends\\s+keyof', 'pluck\\('],
        forbid: ['\\bany\\b', '\\bas\\b'],
        output: '佐藤,鈴木',
      },
      explanation: '`<T, K extends keyof T>` にするのが正解です。無制約の K は「T のキーである保証が無い」ため、コンパイラは `T[K]` も `item[key]` も許しません。制約を付ければ K は T のプロパティ名に限定され、呼び出し側では `"name"` がリテラル型として推論されて戻り値は string[] になります。`as` でエラーを黙らせるのは存在しないキーの混入を許すだけなので、制約で解くのが正しい設計です。',
      review: 'keyof との組み合わせ — プロパティ名まで型安全にする',
    },
    {
      d: 3,
      type: 'choice',
      prompt: 'Java では `List<Dog>` を `List<Animal>` に代入できない(不変)。TypeScript での最終行の扱いは?',
      code: `class Animal { name = ""; }
class Dog extends Animal { bark() { console.log("わん"); } }

const dogs: Dog[] = [new Dog()];
const animals: Animal[] = dogs;`,
      options: [
        '通る。TS の配列は共変として扱われる(ただし animals 経由で別種の Animal を push すると dogs に混入する穴がある)',
        'Java と同様に通らない。ジェネリック型は不変だから',
        '`Array<Dog>` と書いたときだけ通り、`Dog[]` 記法では通らない',
        '`readonly Animal[]` で受けたときだけ通る',
      ],
      answer: 0,
      explanation: 'TS は構造的互換性で判定し、配列を含むジェネリック型のプロパティは基本共変なのでこの代入は通ります。理論的には不健全(animals.push(new Cat()) が型チェックを通ってしまう)ですが、実用性を優先した設計です。`Dog[]` と `Array<Dog>` は完全に同じ型なので記法で挙動は変わりません。`readonly Animal[]` で受けるのは書き込みの穴を塞ぐ改善策であって、通るための条件ではありません(そのままでも通ります)。Java の不変 + ワイルドカードという世界観からの一番大きな乗り換えポイントです。',
      review: 'Java ジェネリクスとの差分 — 消去は同じ、推論と変性が違う',
    },
    {
      d: 3,
      type: 'choice',
      prompt: 'Java 経験者が TypeScript のジェネリクスについて述べた次の主張のうち、**正しい**ものはどれ?',
      options: [
        '「TS でも型引数は消去されるので `new T()` は書けない。インスタンスを作りたければ `ctor: new () => T` のようにコンストラクタを値として受け取る」',
        '「TS はコンパイル時に型情報を JS に埋め込むので、実行時に T の中身を検査できる」',
        '「Java と違い、TS のジェネリクスは実行時に具象化(reify)される」',
        '「`typeof T` と書けば実行時に型引数の名前が文字列で取れる」',
      ],
      answer: 0,
      explanation: 'TS も Java 同様に型引数は消去され、`new T()` は不可能です。Java の `Class<T>` を渡す慣用に相当するのが、コンストラクタ(これは実行時に存在する値)を `new () => T` 型の引数として受け取るパターンです。型情報の埋め込みや具象化(C# のような reified generics)は行われません — むしろ TS は interface まで全部消える分、消去は Java より徹底しています。`typeof` が型引数に対して使えるのは型の文脈だけで、実行時の値は得られません。',
      review: 'Java ジェネリクスとの差分 — 消去は同じ、推論と変性が違う',
    },
    {
      d: 3,
      type: 'choice',
      prompt: 'オブジェクトから指定キーだけを取り出す `pick` を設計する。「存在しないキーを渡すとコンパイルエラー」「戻り値は取り出したキーだけを持つ型」にしたい。最適なシグネチャは?',
      options: [
        'function pick<T, K extends keyof T>(obj: T, keys: K[]): Pick<T, K>',
        'function pick<T>(obj: T, keys: string[]): Partial<T>',
        'function pick<T, K>(obj: T, keys: K[]): Pick<T, K>',
        'function pick(obj: Record<string, unknown>, keys: string[]): Record<string, unknown>',
      ],
      answer: 0,
      explanation: '要件を両方満たすのは `K extends keyof T` + `Pick<T, K>` の組み合わせだけです。keys にリテラル(`["name"]`)を渡すと K がそのリテラル型に推論され、戻り値は選んだキーだけの型になります。2番目は keys が任意の string を許す(存在しないキーが通る)うえ、戻り値 `Partial<T>` は「全プロパティが optional」で広すぎます。3番目は K が無制約なので `Pick<T, K>` 自体がコンパイルエラー(K は keyof T を満たす保証が無い)。4番目は入力も出力も型情報が消えて、ジェネリクスを使う意味がありません。',
      review: 'keyof との組み合わせ — プロパティ名まで型安全にする',
    },
  ],
});
