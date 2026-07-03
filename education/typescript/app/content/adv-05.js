// 応用編 Ch.5 — 型レベルプログラミング
window.COURSE.register({
  id: 'adv-05',
  part: 'advanced',
  title: '型レベルプログラミング — utility types を自作できるところまで',
  minutes: 90,
  goal: 'keyof・mapped types・conditional types・infer・template literal types を組み合わせて型を「計算」でき、Partial / Pick / ReturnType など標準 utility types の定義を白紙から自作・読解できる。',
  sections: [
    {
      title: '型の世界の演算子 — keyof / typeof / T[K]',
      body: `Java のジェネリクスは型を「受け取って埋め込む」ことしかできません。\`List<T>\` の T から「T のフィールド名一覧」や「T を全部 Optional にした型」を**計算する**手段は Java にはなく、リフレクション(実行時)か注釈プロセッサ(コード生成)に頼るしかありませんでした。TS は違います。**TS の型システムは、型を入力に型を出力する、それ自体がひとつの言語**です。この章はその言語の文法を学びます。

まず、型の世界の基本演算子が3つ:

- **\`keyof T\`** — T のプロパティ名を**リテラル union** として取り出す。\`keyof { host: string; port: number }\` は \`"host" | "port"\`。Java でいえば「フィールド名の集合をコンパイル時に型として得る」操作で、対応物がありません
- **\`typeof x\`** — **値** x から型を取り出す(型の文脈で使ったときだけ。JS の実行時演算子 \`typeof\` とは別物で、こちらは type erasure の対象です)
- **\`T[K]\`(indexed access)** — 型 T をプロパティ名の型 K で引く。\`Config["port"]\` は \`number\`。K に union を渡せば値型の union が返る

この3つは Ch.4 のジェネリクスで見た \`getProp<T, K extends keyof T>(obj: T, key: K): T[K]\` にすべて登場しています。あのシグネチャが「読める」ことを、下のコードで確かめてください。`,
      code: `const dbConfig = {
  host: "localhost",
  port: 5432,
  secure: true,
};

// typeof: 値から型を取り出す(JS の実行時 typeof とは別物)
type DbConfig = typeof dbConfig;
// { host: string; port: number; secure: boolean }

// keyof: プロパティ名のリテラル union
type ConfigKey = keyof DbConfig; // "host" | "port" | "secure"

// indexed access: 型をプロパティ名で引く
type Port = DbConfig["port"];                // number
type ConfigValue = DbConfig[keyof DbConfig]; // string | number | boolean

// Ch.4 の getProp を「型の目」で読み直す
function getProp<T, K extends keyof T>(obj: T, key: K): T[K] {
  return obj[key];
}

const p = getProp(dbConfig, "port"); // p は number と推論される
console.log(p);

// 存在しないキーはコンパイルエラー(コメントを外して確認)
// const bad = getProp(dbConfig, "user");`,
    },
    {
      title: 'mapped types — 型を変換するループ',
      body: `\`{ [K in keyof T]: ... }\` は **mapped type**。「T の各キー K についてプロパティを作る」という、型の世界の for ループです。Java で「User の全フィールドを Optional にした UserDraft クラス」が欲しければ手書きかコード生成でしたが、TS は型システムの中で導出できます。

\`\`\`
type Draft = { [K in keyof Article]?: Article[K] };
\`\`\`

読み方: 「Article の各キー K について、\`?\` 付きで、元の値型 \`Article[K]\` のプロパティを持つ」。これはまさに \`Partial<Article>\` の定義そのものです。

modifier(\`?\` と \`readonly\`)は**付けるだけでなく剥がせる**のがポイント:

- \`[K in keyof T]?:\` — 省略可能にする(\`+?\` の略記)
- \`[K in keyof T]-?:\` — 省略可能を**剥がす**。このとき optional 由来の \`undefined\` も型から除去される(\`Required\` の定義)
- \`readonly [K in keyof T]:\` / \`-readonly [K in keyof T]:\` — 読み取り専用の付与と剥奪

もうひとつ重要な仕様: \`in\` の右辺は \`keyof T\` に限らず、**任意の文字列リテラル union** が置けます。\`{ [K in "id" | "name"]: T[K] }\` のように「選んだキーだけでループする」ことができ、これが後で作る \`Pick\` の心臓部になります。`,
      code: `type Article = {
  title: string;
  body: string;
  likes: number;
};

// 値型をすべて string に置き換える
type Stringified = { [K in keyof Article]: string };

// ? を付ける = Partial 相当
type Draft = { [K in keyof Article]?: Article[K] };

// readonly を付ける = Readonly 相当
type Frozen = { readonly [K in keyof Article]: Article[K] };

// modifier は剥がすこともできる
type Complete = { [K in keyof Draft]-?: Draft[K] };      // Required 相当
type Thawed = { -readonly [K in keyof Frozen]: Frozen[K] };

// 使ってみる: Draft は全プロパティ省略可
const draft: Draft = { title: "型レベルプログラミング" };
console.log(draft.title);

const frozen: Frozen = { title: "t", body: "b", likes: 0 };
// frozen.likes = 1; // エラー: readonly(コメントを外して確認)
console.log(frozen.likes);`,
    },
    {
      title: 'conditional types と infer — 型の世界の if 文',
      body: `\`T extends U ? X : Y\` は **conditional type**。「T が U に代入可能なら X、さもなくば Y」という、型の世界の三項演算子です。Java の \`instanceof\` パターンマッチは実行時の分岐ですが、これは**コンパイル時**に解決される分岐で、実行される JS には痕跡すら残りません(type erasure は型レベルプログラミングにも貫かれています)。

\`\`\`
type IsString<T> = T extends string ? true : false;
type A = IsString<"hello">; // true
type B = IsString<42>;      // false
\`\`\`

そして conditional type の \`extends\` 節の中でだけ使える最強のキーワードが **\`infer\`** です。「この位置に来る型を変数に**束縛して取り出せ**」という、型のパターンマッチ(分割代入)です:

\`\`\`
type ElementOf<T> = T extends (infer E)[] ? E : never;
\`\`\`

読み方: 「T が『何かの配列』の形にマッチするなら、その要素型を E と名付けて返す。マッチしなければ never」。関数型にもマッチできます — \`F extends (...args: any) => infer R ? R : never\` は「F が関数なら戻り値の型を R として取り出す」。これが標準の \`ReturnType\` の心臓部です。マッチ失敗側に \`never\`(値が存在しない型 — Ch.3)を置くのは型レベルプログラミングの定石で、「該当なし」の印として使います。`,
      code: `// conditional type: 型の三項演算子(コンパイル時に解決される)
type IsString<T> = T extends string ? true : false;

type A = IsString<"hello">; // true
type B = IsString<42>;      // false

// infer: パターンマッチで型を「取り出す」
type ElementOf<T> = T extends (infer E)[] ? E : never;

type C = ElementOf<string[]>;          // string
type D = ElementOf<{ ok: boolean }[]>; // { ok: boolean }
type E = ElementOf<number>;            // never(配列でないので else 側)

// 関数の戻り値を取り出す = ReturnType の心臓部
type MyReturnType<F> = F extends (...args: any) => infer R ? R : never;

const load = (id: number) => ({ id, found: true });
type LoadResult = MyReturnType<typeof load>; // { id: number; found: boolean }

// 型はすべて消えるので、実行される JS はこの1行だけ
console.log("conditional types はコンパイル時に解決される");`,
    },
    {
      title: 'union の分配 — 落とし穴にして最強の武器',
      body: `conditional type には、知らないと必ずハマる特別ルールがあります。**\`extends\` の左辺が裸の型パラメータのとき、union は分配される**(distributive conditional types)。つまり \`T = A | B\` なら、条件が union 全体に一度ではなく、**メンバーごとに**適用されて結果が union で束ねられます。

\`\`\`
type ToArray<T> = T extends unknown ? T[] : never;
type R = ToArray<string | number>;
// (string | number)[] ではなく string[] | number[]
\`\`\`

Java/Python 的な直感では「string | number をまとめて配列にした」と読みたくなりますが、実際は \`ToArray<string> | ToArray<number>\` に展開されます。分配を**止めたい**ときはタプルで包むのが定石です: \`[T] extends [unknown] ? T[] : never\` — 左辺が裸の型パラメータでなくなるため分配されず、\`(string | number)[]\` が得られます。

この分配は落とし穴であると同時に、union を**フィルタする**武器になります。標準の \`Exclude\` の定義は驚くほど短い:

\`\`\`
type Exclude<T, U> = T extends U ? never : T;
type T1 = Exclude<"a" | "b" | "c", "a">; // "b" | "c"
\`\`\`

各メンバーが U にマッチしたら \`never\` に潰され、union の中の \`never\` は自動的に消える — 「union から要素を取り除く」がこの2行で実現します。最後に上級者向けの罠をひとつ: \`never\` は「空の union」なので、裸の T に \`never\` を渡すと**分配対象が0個**になり、条件式ごと評価されず結果は常に \`never\` になります(確認テストに出します)。`,
    },
    {
      title: 'template literal types — 文字列を計算する型',
      body: `Java でも Python でも、文字列の中身はコンパイラ/型チェッカーにとってただの文字列です。TS は違います。**テンプレートリテラル型**で、文字列リテラル型を型レベルで連結・展開できます:

\`\`\`
type Lang = "ja" | "en";
type Path = \\\`/\\\${Lang}/home\\\`; // "/ja/home" | "/en/home"
\`\`\`

union を埋め込むと**全組み合わせに展開される**のがポイントです(前節の分配の親戚)。複数の union を埋め込めばデカルト積になります。

実用の定番が**イベント名の型付け**です。\`"click"\` というイベント名から \`"onClick"\` というハンドラ名を型レベルで導出できます。道具は2つ:

- 組み込みの文字列操作型: \`Capitalize<S>\` / \`Uppercase<S>\` / \`Lowercase<S>\` / \`Uncapitalize<S>\`(これらはコンパイラ組み込みの intrinsic 型で、自作はできません)
- mapped type の **key remapping**: \`[K in keyof T as 新しいキーの型]\` — \`as\` 句でキー名そのものを計算して付け替える

これで「イベント定義を1箇所に書けば、ハンドラの名前と引数の型が全部導出される」設計ができます。ライブラリの型定義(Vue や各種イベントエミッタ)で頻出するパターンなので、下のコードは必ず手を動かして確認してください。なお \`as \\\`on\\\${Capitalize<K & string>}\\\`\` のような \`& string\` は、\`keyof T\` に number / symbol キーが混ざりうるため「string のキーだけに絞る」ためのイディオムです。`,
      code: `type UiEvent = "click" | "focus" | "change";

// union は自動で全組み合わせに展開される
type HandlerName = \`on\${Capitalize<UiEvent>}\`;
// "onClick" | "onFocus" | "onChange"

// key remapping(as)と組み合わせ: イベント定義 → ハンドラ型を導出
type Payloads = {
  click: { x: number; y: number };
  change: { value: string };
};

type Handlers = {
  [K in keyof Payloads as \`on\${Capitalize<K>}\`]: (payload: Payloads[K]) => void;
};
// { onClick: (payload: { x; y }) => void; onChange: (payload: { value }) => void }

const handlers: Handlers = {
  onClick: (p) => console.log("click at", p.x, p.y),
  onChange: (p) => console.log("changed to", p.value),
};

handlers.onClick({ x: 10, y: 20 });
handlers.onChange({ value: "TS" });

// キー名も payload の型もすべて導出済み(コメントを外して確認)
// handlers.onScroll(() => {});          // エラー: そんなハンドラはない
// handlers.onChange({ value: 123 });    // エラー: value は string`,
    },
    {
      title: '総仕上げ — Partial / Pick / ReturnType を白紙から作る',
      body: `道具は揃いました。標準 utility types を白紙から組み立てます。

**Partial** — 「各キーに \`?\` を付ける」。mapped type そのまま:

\`\`\`
type MyPartial<T> = { [P in keyof T]?: T[P] };
\`\`\`

**Pick** — 「選んだキーだけでループする」。\`in\` の右辺に keyof T の**部分集合** K を置き、K が確かにキーであることを \`extends keyof T\` で制約する(Ch.4 の制約の実践):

\`\`\`
type MyPick<T, K extends keyof T> = { [P in K]: T[P] };
\`\`\`

**ReturnType** — 「関数型にパターンマッチして戻り値を infer で取り出す」:

\`\`\`
type MyReturnType<F> = F extends (...args: any) => infer R ? R : never;
\`\`\`

ここまで来ると、TypeScript 標準ライブラリの utility types の定義が**全部読めます**。実物(lib.es5.d.ts)はこうなっています:

\`\`\`
type Partial<T>  = { [P in keyof T]?: T[P] };
type Required<T> = { [P in keyof T]-?: T[P] };
type Readonly<T> = { readonly [P in keyof T]: T[P] };
type Pick<T, K extends keyof T> = { [P in K]: T[P] };
type Record<K extends keyof any, T> = { [P in K]: T };
type Exclude<T, U> = T extends U ? never : T;
type Extract<T, U> = T extends U ? T : never;
type Omit<T, K extends keyof any> = Pick<T, Exclude<keyof T, K>>;
type NonNullable<T> = T extends null | undefined ? never : T;
type ReturnType<T extends (...args: any) => any> =
  T extends (...args: any) => infer R ? R : any;
type Parameters<T extends (...args: any) => any> =
  T extends (...args: infer P) => any ? P : never;
\`\`\`

読みどころ: \`Record\` と \`Omit\` の \`keyof any\` は「キーになれる型すべて」= \`string | number | symbol\` の慣用句。\`Omit\` は \`Exclude\`(分配で union からキーを除く)と \`Pick\`(残ったキーで拾う)の**合成**で、この章の内容が2段重ねになっています。\`Parameters\` は infer が引数位置に来ただけ。もう黒魔術には見えないはずです(なお最近の lib では \`NonNullable<T> = T & {}\` に最適化されていますが、意味は同じです)。`,
      code: `// 標準ライブラリの定義を My プレフィックスで再現(全部この章の道具だけでできている)
type MyPartial<T> = { [P in keyof T]?: T[P] };
type MyRequired<T> = { [P in keyof T]-?: T[P] };
type MyReadonly<T> = { readonly [P in keyof T]: T[P] };
type MyPick<T, K extends keyof T> = { [P in K]: T[P] };
type MyExclude<T, U> = T extends U ? never : T;
type MyOmit<T, K extends keyof T> = MyPick<T, MyExclude<keyof T, K>>;
type MyReturnType<F extends (...args: any) => any> =
  F extends (...args: any) => infer R ? R : never;

type User = { id: number; name: string; email: string };

type T1 = MyPartial<User>;         // 全プロパティ ?
type T2 = MyPick<User, "id" | "name">;
type T3 = MyOmit<User, "email">;   // { id: number; name: string }

const summary: T3 = { id: 1, name: "佐藤" };
console.log(summary);

const findUser = (id: number) => ({ id, name: "佐藤", email: "s@example.com" });
type Found = MyReturnType<typeof findUser>; // User と同じ形
const u: Found = findUser(1);
console.log(u.name);`,
    },
  ],
  exercise: {
    instructions: `### 演習: utility types を自作する(type-challenges 形式)

型パズルの定番 [type-challenges] と同じ形式です。エディタ下部の**検証行(\`_t1\`〜\`_t5\`)の型エラーがすべて消えたら正解**。「判定」ボタンで自動採点されます。

実装するのは3つ(各 \`unknown\` を置き換える):

1. **\`MyPartial<T>\`** — T の全プロパティを省略可能にする(標準 \`Partial\` 相当。mapped type + \`?\`)
2. **\`MyExclude<T, U>\`** — union 型 T から U に代入可能なメンバーを取り除く(標準 \`Exclude\` 相当。分配 + \`never\`)
3. **\`MyGetters<T>\`** — 各プロパティをゲッター関数に変換する: \`{ id: number }\` → \`{ getId: () => number }\`(key remapping \`as\` + テンプレートリテラル型 + \`Capitalize\`)

ルール:

- 検証ヘルパー(\`Expect\` / \`Equal\`)と検証行は**変更・コメントアウト禁止**
- 標準の \`Partial\` / \`Exclude\` をそのまま使うのは禁止(\`Capitalize\` などの文字列操作型は使用可)
- \`Equal\` は \`any\` によるごまかしも検出します — 正攻法で`,
    starter: `// ==== 検証ヘルパー(変更しないこと) ====
type Expect<T extends true> = T;
type Equal<A, B> = (<T>() => T extends A ? 1 : 2) extends (<T>() => T extends B ? 1 : 2) ? true : false;

// ==== 課題 1: MyPartial ====
// T の全プロパティを省略可能にする(標準の Partial 相当)
type MyPartial<T> = unknown; // ← ここを実装

// ==== 課題 2: MyExclude ====
// union 型 T から、U に代入できるメンバーを取り除く(標準の Exclude 相当)
type MyExclude<T, U> = unknown; // ← ここを実装

// ==== 課題 3: MyGetters ====
// 各プロパティ K を「get + K の先頭大文字」のゲッター関数に変換する
// 例: { id: number } → { getId: () => number }
type MyGetters<T> = unknown; // ← ここを実装

// ==== 検証(型エラーがすべて消えたら「判定」を押す) ====
type User = { id: number; name: string };

type _t1 = Expect<Equal<MyPartial<User>, { id?: number; name?: string }>>;
type _t2 = Expect<Equal<MyPartial<{ likes: number }>, { likes?: number }>>;
type _t3 = Expect<Equal<MyExclude<"a" | "b" | "c", "a">, "b" | "c">>;
type _t4 = Expect<Equal<MyExclude<string | number | boolean, boolean>, string | number>>;
type _t5 = Expect<Equal<MyGetters<User>, { getId: () => number; getName: () => string }>>;

console.log("型チェックが通れば合格です");
`,
    check: {
      noErrors: true,
      mustMatch: [
        'type MyPartial<T>',
        'type MyExclude<T, U>',
        'type MyGetters<T>',
        'T extends A \\? 1 : 2',
        'Expect<Equal<MyPartial<User>',
        'Expect<Equal<MyExclude<"a" \\| "b" \\| "c", "a">',
        'Expect<Equal<MyGetters<User>',
      ],
      forbid: ['\\bPartial<', '\\bExclude<', '\\bOmit<', '//\\s*type _t', '/\\*'],
    },
  },
  quiz: [
    // ---- easy (d:1) ----
    {
      d: 1,
      type: 'choice',
      prompt: '次の型 `K` は何になる?',
      code: `type Book = { title: string; price: number };
type K = keyof Book;`,
      options: [
        '"title" | "price"(プロパティ名のリテラル union)',
        'string(キーは文字列だから)',
        '["title", "price"](キー名の配列型)',
        'string | number(プロパティ値の型の union)',
      ],
      answer: 0,
      explanation: '`keyof` はプロパティ名を**リテラル union** として取り出します。`string` では広すぎて「Book に実在するキーだけ」という情報が失われます。配列はランタイムの概念で(`Object.keys` の仕事)、型の世界の keyof とは別物。値の型の union が欲しければ `Book[keyof Book]`(indexed access との組み合わせ)です。',
      review: '型の世界の演算子 — keyof / typeof / T[K]',
    },
    {
      d: 1,
      type: 'choice',
      prompt: '型の文脈で使う `typeof` について。次の型 `P` は何になる?',
      code: `const point = { x: 10, y: 20 };
type P = typeof point;`,
      options: [
        '{ x: number; y: number }',
        '"object"(JS の typeof と同じく文字列を返す)',
        '{ x: 10; y: 20 }(リテラル型がそのまま保たれる)',
        'object',
      ],
      answer: 0,
      explanation: '型の文脈の `typeof` は値の**静的な型**を取り出します。JS の実行時演算子 `typeof`(文字列 "object" を返す)とは名前が同じだけの別物です。オブジェクトリテラルのプロパティは widening されるため `x: 10` ではなく `x: number` になります(リテラルのまま保ちたければ Ch.3 の `as const`)。`object` はプロパティ情報を持たない型で、typeof の結果としては具体的すぎる情報を捨てており誤りです。',
      review: '型の世界の演算子 — keyof / typeof / T[K]',
    },
    {
      d: 1,
      type: 'choice',
      prompt: '標準ライブラリの定義 `type Partial<T> = { [P in keyof T]?: T[P] };` の説明として正しいのは?',
      options: [
        'T の各キーでループし、元の値型のまま全プロパティに ? を付けた型を作る',
        'T の全プロパティの値型を undefined に置き換える',
        'T のオブジェクトから実行時にプロパティを削除できるようにする',
        'T のプロパティ名の union を返す',
      ],
      answer: 0,
      explanation: 'mapped type `[P in keyof T]` が「各キーでループ」、`?` が「省略可能の付与」、`T[P]` が「元の値型の維持」です。値型を undefined に置き換えるなら `{ [P in keyof T]: undefined }` と書きます。実行時の挙動は型では一切変わりません(type erasure)。プロパティ名の union は `keyof T` 単体の仕事です。',
      review: 'mapped types — 型を変換するループ',
    },
    {
      d: 1,
      type: 'code',
      prompt: '`MyReadonly<T>`(T の全プロパティを readonly にする型)を実装し、検証行の型エラーをすべて消してください。標準の `Readonly` の使用は禁止です。',
      starter: `type Expect<T extends true> = T;
type Equal<A, B> = (<T>() => T extends A ? 1 : 2) extends (<T>() => T extends B ? 1 : 2) ? true : false;

// T の全プロパティを readonly にする型を実装せよ
type MyReadonly<T> = unknown; // ← ここを実装

// ---- 検証(エラーが消えれば正解) ----
type Todo = { title: string; done: boolean };
type _t1 = Expect<Equal<MyReadonly<Todo>, { readonly title: string; readonly done: boolean }>>;
type _t2 = Expect<Equal<MyReadonly<{ n: number }>, { readonly n: number }>>;
`,
      check: {
        noErrors: true,
        mustMatch: ['type MyReadonly<T>', 'T extends A \\? 1 : 2', 'Expect<Equal<MyReadonly<Todo>'],
        forbid: ['\\bReadonly<', '//\\s*type _t', '/\\*'],
      },
      explanation: '模範解答: `type MyReadonly<T> = { readonly [K in keyof T]: T[K] };` — mapped type で各キーをループし、`readonly` modifier を付けるだけです。標準の `Readonly<T>` の定義そのものであり、これが書ければ「utility type は読むもの」から「作れるもの」に変わります。',
      review: 'mapped types — 型を変換するループ',
    },
    // ---- medium (d:2) ----
    {
      d: 2,
      type: 'choice',
      prompt: '`-?` modifier を使った次の型 `Complete` は何になる?',
      code: `type Draft = { title?: string; tags?: string[] };
type Complete = { [K in keyof Draft]-?: Draft[K] };`,
      options: [
        '{ title: string; tags: string[] } — ? が外れ、optional 由来の undefined も型から除去される',
        '{ title: string | undefined; tags: string[] | undefined } — ? は外れるが undefined は残る',
        '{ title?: string; tags?: string[] } — 変化なし(- は無効な記号)',
        'コンパイルエラー(-? という構文は存在しない)',
      ],
      answer: 0,
      explanation: '`-?` は「optional modifier を剥がす」構文で、標準の `Required` の定義に使われています。このとき optional であることに由来する `undefined` も値型から取り除かれるのがポイントで、`string | undefined` は残りません。`-?` はれっきとした公式構文なのでエラーにも無視にもなりません。逆方向(付与)は `?` または `+?` です。',
      review: 'mapped types — 型を変換するループ',
    },
    {
      d: 2,
      type: 'choice',
      prompt: 'indexed access に union を渡した。型 `V` は何になる?',
      code: `type User = { id: number; name: string; active: boolean };
type V = User["id" | "name"];`,
      options: [
        'number | string',
        'number & string',
        '"id" | "name"',
        'コンパイルエラー(インデックスに union は使えない)',
      ],
      answer: 0,
      explanation: 'indexed access `T[K]` の K に union を渡すと、**各キーの値型の union** が返ります(`User["id"] | User["name"]` = `number | string`)。交差(&)にはなりません。`"id" | "name"` はキー側の型であって、`T[K]` はそれで「引いた」値側の型です。union インデックスは正式にサポートされており、`T[keyof T]`(全値型の union)はこの応用です。',
      review: '型の世界の演算子 — keyof / typeof / T[K]',
    },
    {
      d: 2,
      type: 'choice',
      prompt: 'テンプレートリテラル型に union を埋め込んだ。型 `Path` は何になる?',
      code: `type Lang = "ja" | "en";
type Page = "home" | "about";
type Path = \`/\${Lang}/\${Page}\`;`,
      options: [
        '"/ja/home" | "/ja/about" | "/en/home" | "/en/about"(全組み合わせ4通り)',
        '"/ja/home" | "/en/about"(union の位置ごとに1対1で対応)',
        'string(テンプレートを含むと widening される)',
        'コンパイルエラー(型のテンプレートリテラルに union は埋め込めない)',
      ],
      answer: 0,
      explanation: 'テンプレートリテラル型に union を埋め込むと**デカルト積(全組み合わせ)**に展開されます。2 × 2 = 4 通り。「位置ごとに1対1」のようなペアリングは行われません。結果は具体的な文字列リテラル union であり `string` には widening されません(だからこそ型安全なイベント名やパスが作れます)。union の埋め込みは正式な機能です。',
      review: 'template literal types — 文字列を計算する型',
    },
    {
      d: 2,
      type: 'code',
      prompt: '`MyPick<T, K>`(T からキー K のプロパティだけを選び出す型)を実装し、検証行の型エラーをすべて消してください。標準の `Pick` の使用は禁止です。',
      starter: `type Expect<T extends true> = T;
type Equal<A, B> = (<T>() => T extends A ? 1 : 2) extends (<T>() => T extends B ? 1 : 2) ? true : false;

// T からキー K のプロパティだけを選び出す型を実装せよ
// ヒント: in の右辺は keyof T でなくてもよい
type MyPick<T, K extends keyof T> = unknown; // ← ここを実装

// ---- 検証(エラーが消えれば正解) ----
type User = { id: number; name: string; email: string };
type _t1 = Expect<Equal<MyPick<User, "id" | "name">, { id: number; name: string }>>;
type _t2 = Expect<Equal<MyPick<User, "email">, { email: string }>>;
`,
      check: {
        noErrors: true,
        mustMatch: ['type MyPick<T, K extends keyof T>', 'T extends A \\? 1 : 2', 'Expect<Equal<MyPick<User, "id" \\| "name">'],
        forbid: ['\\bPick<', '\\bOmit<', '//\\s*type _t', '/\\*'],
      },
      explanation: '模範解答: `type MyPick<T, K extends keyof T> = { [P in K]: T[P] };` — ポイントは `in` の右辺に `keyof T` ではなく **K そのもの**を置くこと。「選ばれたキーだけでループする」形になります。`K extends keyof T` の制約(Ch.4)があるので `T[P]` のアクセスは常に安全です。これは標準 `Pick` の定義そのものです。',
      review: '総仕上げ — Partial / Pick / ReturnType を白紙から作る',
    },
    // ---- hard (d:3) ----
    {
      d: 3,
      type: 'code',
      prompt: '`MyReturnType<F>`(関数型 F の戻り値の型を取り出す型)を実装し、検証行の型エラーをすべて消してください。標準の `ReturnType` の使用は禁止です。ヒント: conditional type と infer。',
      starter: `type Expect<T extends true> = T;
type Equal<A, B> = (<T>() => T extends A ? 1 : 2) extends (<T>() => T extends B ? 1 : 2) ? true : false;

// 関数型 F の戻り値の型を取り出す型を実装せよ
type MyReturnType<F> = unknown; // ← ここを実装

// ---- 検証(エラーが消えれば正解) ----
const loadUser = (id: number) => ({ id, found: true });

type _t1 = Expect<Equal<MyReturnType<() => string>, string>>;
type _t2 = Expect<Equal<MyReturnType<typeof loadUser>, { id: number; found: boolean }>>;
type _t3 = Expect<Equal<MyReturnType<(x: number, y: number) => number[]>, number[]>>;
`,
      check: {
        noErrors: true,
        mustMatch: ['type MyReturnType<F>', 'T extends A \\? 1 : 2', 'Expect<Equal<MyReturnType<typeof loadUser>'],
        forbid: ['\\bReturnType<', '//\\s*type _t', '/\\*'],
      },
      explanation: '模範解答: `type MyReturnType<F> = F extends (...args: any) => infer R ? R : never;` — 「F が関数の形にマッチするなら、戻り値の位置の型を R と名付けて取り出す」。引数の個数や型を問わず受けるために `(...args: any)` を置くのが定石です(`(...args: never) => infer R` でも通ります — 引数は反変なので never が最も寛容)。マッチしない場合の else 側は「該当なし」の印 `never` にします。',
      review: 'conditional types と infer — 型の世界の if 文',
    },
    {
      d: 3,
      type: 'choice',
      prompt: 'union の分配に関する罠。型 `R` は何になる?',
      code: `type IsNever<T> = T extends never ? true : false;
type R = IsNever<never>;`,
      options: [
        'never(never は空の union なので分配対象が0個になり、条件式が一度も評価されない)',
        'true(never extends never は成り立つから)',
        'false',
        'boolean(true と false の両方になりうるから)',
      ],
      answer: 0,
      explanation: '「never extends never だから true」という直感は自然ですが誤りです。裸の型パラメータ T への union は**メンバーごとに分配**され、never は「空の union」なので分配対象が0個 — 条件分岐は一度も走らず、0個の結果を束ねた `never` が返ります。true にも false にも到達しないので `boolean` でもありません。正しく判定したければ分配を止めて `type IsNever<T> = [T] extends [never] ? true : false;` とタプルで包みます。type-challenges 頻出の罠です。',
      review: 'union の分配 — 落とし穴にして最強の武器',
    },
    {
      d: 3,
      type: 'choice',
      prompt: 'イベントハンドラ型を導出する次のコードで、`K & string` と交差している理由として正しいのは?',
      code: `type Getters<T> = {
  [K in keyof T as \`get\${Capitalize<K & string>}\`]: () => T[K];
};`,
      options: [
        'keyof T には number や symbol のキーも含まれうるため、string と交差して Capitalize が受け取れる string 部分だけに絞っている',
        '実行時にキーを文字列へ変換するコードを生成させるため',
        'K のリテラル情報を捨てて string へ widening するため',
        'この & string は冗長であり、削除してもどんな T でも常にコンパイルが通る',
      ],
      answer: 0,
      explanation: '`keyof T` は一般に `string | number | symbol` のメンバーを含みえますが、`Capitalize<S>` の S は `string` に制約されています。`K & string` は交差によって string 側のキーだけを残すイディオムで、`"id" & string` は `"id"` のまま — リテラル情報は**保たれます**(widening ではありません)。型は実行時に消えるので「変換コードの生成」はありえません。削除すると K が Capitalize の制約を満たせずジェネリック定義の時点でコンパイルエラーになるため「常に通る」も誤りです。',
      review: 'template literal types — 文字列を計算する型',
    },
    {
      d: 3,
      type: 'choice',
      prompt: 'infer と分配の合わせ技。型 `R` は何になる?',
      code: `type Flatten<T> = T extends (infer E)[] ? E : T;
type R = Flatten<string[] | number>;`,
      options: [
        'string | number(メンバーごとに分配され、string[] は string に、number はそのまま)',
        'string(配列にマッチした string[] だけが結果に残る)',
        'string[] | number(union 全体は「配列」の形にマッチしないので else 側)',
        'never',
      ],
      answer: 0,
      explanation: '裸の T なので union はメンバーごとに分配されます: `Flatten<string[]>` は配列にマッチして `E = string`、`Flatten<number>` はマッチせず else 側で `T` 自身つまり `number`。束ねて `string | number` です。「union 全体で一度だけ判定」(選択肢3)は分配を止めた `[T] extends [(infer E)[]]` の挙動。number が消える(選択肢2)のは else 側を `never` にした場合で、このコードは `T` を返すので消えません。',
      review: 'union の分配 — 落とし穴にして最強の武器',
    },
  ],
});
