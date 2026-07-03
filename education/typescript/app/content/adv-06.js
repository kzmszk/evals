// 応用編 Ch.6 — 実行時境界
window.COURSE.register({
  id: 'adv-06',
  part: 'advanced',
  title: '実行時境界 — 型が消える世界で生きる',
  minutes: 45,
  goal: 'API・ファイル・ユーザー入力などの「境界」では型注釈が安全を保証しないことを理解し、unknown + 型述語による手書きバリデーション(および zod)で境界を型安全に処理できる。',
  sections: [
    {
      title: '境界 — 型注釈が保証を失う場所',
      body: `基礎編 Ch.1 で「型はコンパイル時に消える」と宣言しました。この章はその**伏線回収**です。型消去のツケを実際に払わされる場所 — それが**実行時境界**です。

Java 経験者へ: Jackson や Gson で \`mapper.readValue(json, User.class)\` と書くと、JSON が実行時に**検証・変換**されますね。数値であるべき場所に文字列が来れば例外が飛ぶ。これができるのは、\`User.class\` という**実行時の型情報**が JVM に残っているからです。TS にはこれに相当するものが**言語として存在しません**。\`User\` という interface は実行時には跡形もなく消えていて、「User とは何か」を実行時に照合する材料がないのです。

Python 経験者へ: pydantic が実行時にモデル定義を使って検証するのと同じことを、TS の型注釈は**やりません**。型注釈は mypy 用のコメントに近い存在です。

では「境界」とはどこか。**コンパイラの監視が届かない外の世界から値が入ってくる場所**すべてです:

- API レスポンス(\`fetch\`)
- ファイル・\`localStorage\` から読んだ JSON
- ユーザー入力(フォーム、URL クエリパラメータ)
- \`postMessage\` など別プロセス・別ウィンドウからのデータ

境界の**内側**(自分のコードが構築し、自分のコードに渡す値)では、コンパイルが通れば型は信頼できます。しかし境界を越えて入ってくる値の形は、**サーバーの仕様変更ひとつで裏切られます**。そこに型注釈を書いても、それはただの「願望の表明」です。`,
    },
    {
      title: 'JSON.parse と fetch の正体 — any は境界から漏れ出す',
      body: `境界の代表選手 \`JSON.parse\` の標準ライブラリでの宣言はこうです:

\`\`\`
JSON.parse(text: string): any
\`\`\`

戻り値は **\`any\`**。応用編 Ch.3 でやった通り、any は「型チェックの放棄」であり、**どんな型の変数にも警告なしで代入できます**。つまりこう書けてしまう:

\`\`\`
const user: User = JSON.parse(response); // コンパイルエラーは出ない
\`\`\`

この \`: User\` は検証ではなく、**根拠のない主張**です。\`fetch\` も同罪で、\`res.json()\` の戻り値は \`Promise<any>\`。基礎編 Ch.3 の API クライアント演習で書いた \`const user: User = await res.json();\` は、実は何ひとつ確かめていませんでした。

「じゃあ \`as User\` と書けば?」— 応用編 Ch.3 の復習ですが、\`as\` はコンパイラへの「黙れ」であって変換ではありません。Java のキャストは実行時に検査されて \`ClassCastException\` を投げますが、TS の \`as\` は**実行時には何も起きません**。嘘の主張がそのまま通ります。

下のコードを実行してみてください。**コンパイルエラーはゼロ**なのに、実行時にクラッシュします。エラーが起きる場所も嫌らしい: 境界(\`JSON.parse\`)から離れた \`toFixed\` の行で爆発するため、原因の特定が遅れます。any の毒は境界から静かに漏れ出し、遠くで発症するのです。`,
      code: `interface User {
  id: number;
  name: string;
  age: number;
}

// サーバーが仕様変更で age を返さなくなった、という想定
const response = '{"id": 1, "name": "田中"}';

// JSON.parse は any を返すので、この「主張」は無検査で通る
const user: User = JSON.parse(response);

console.log(user.name); // ここまでは動く
console.log(user.age.toFixed(0)); // 実行時エラー! age は undefined
// コンパイルエラーは 0 件。型注釈は実行時の中身を何も保証しない`,
    },
    {
      title: 'unknown で受け、型述語で通す',
      body: `正しい構えはこうです: **境界から来た値は \`unknown\` で受ける**。

\`\`\`
const data: unknown = JSON.parse(response);
\`\`\`

any と違い、unknown は narrowing するまで**一切使えません**(応用編 Ch.3)。\`data.name\` と書いた瞬間コンパイルエラーです。この「不便さ」こそが安全装置で、コンパイラが「検証してから使え」と強制してくれます。

検証には応用編 Ch.2 で学んだ**型述語**(\`value is User\`)を使います。unknown からオブジェクトの形を確かめる narrowing には決まった型ダンスがあります:

1. \`typeof value === "object"\` — ただし **\`typeof null\` も \`"object"\`** という JS の古傷があるので、
2. \`value !== null\` を必ず併せる。ここで value は \`object\` になる
3. \`"name" in value\` — プロパティの存在確認。TS はこれで \`value.name\` へのアクセスを許す(型は \`unknown\`)
4. \`typeof value.name === "string"\` — 中身の型を確認

この4段活用を User の全プロパティに適用したのが下のコードです。\`if (isUser(data))\` の中では data が User に絞り込まれ、補完もフルに効きます。

ひとつ重要な注意: **型述語の中身が正しいかどうかを、コンパイラは検証しません**(戻り値が boolean であることしか見ない)。プロパティの確認をサボった述語は「検証のふりをした as」です。述語の実装の正しさはあなたの責任 — この負担を肩代わりするのが次々節の zod です。`,
      code: `interface User {
  id: number;
  name: string;
  age: number;
}

// 型述語: true を返したら「value は User だ」とコンパイラに伝える
function isUser(value: unknown): value is User {
  return (
    typeof value === "object" &&
    value !== null &&
    "id" in value && typeof value.id === "number" &&
    "name" in value && typeof value.name === "string" &&
    "age" in value && typeof value.age === "number"
  );
}

const good: unknown = JSON.parse('{"id": 1, "name": "田中", "age": 28}');
const bad: unknown = JSON.parse('{"id": 1, "name": "佐藤"}');

for (const data of [good, bad]) {
  if (isUser(data)) {
    // この中では data は User。安心してプロパティに触れる
    console.log(data.name + " (" + data.age + "歳)");
  } else {
    console.log("検証に失敗しました");
  }
}`,
    },
    {
      title: 'API クライアントを検証付きで作り直す',
      body: `基礎編 Ch.3 で書いた API クライアントを、学んだ武器で作り直しましょう。方針は3つ:

1. 境界関数(fetch する側)の戻り値を **\`unknown\` と注釈**し、any をそこから漏らさない
2. 使う側は**型述語で検証してから**触る
3. 結果は応用編 Ch.2 の **discriminated union** で表現する — 「成功」「検証失敗」「通信エラー」は別物であり、呼び出し側に switch で処理を強制できる

Java なら検査例外(checked exception)で表現していた「失敗しうる」という情報を、TS では**戻り値の型**に載せるのが定石です。

下のコードでは実ネットワークの代わりに疑似 fetch を使っていますが、本物の \`res.json()\` が \`Promise<any>\` を返す構造は同じです。細部にも学んだことが詰まっています:

- \`routes[url]\` は \`noUncheckedIndexedAccess\` により \`string | undefined\` になるので、undefined チェックが強制される(応用編 Ch.3)
- strict モードでは \`catch (e)\` の e は \`unknown\` なので、\`e instanceof Error\` で narrowing してから \`.message\` に触る — catch 節もまた「何が飛んでくるか分からない境界」です`,
      code: `interface User {
  id: number;
  name: string;
}

function isUser(value: unknown): value is User {
  return (
    typeof value === "object" && value !== null &&
    "id" in value && typeof value.id === "number" &&
    "name" in value && typeof value.name === "string"
  );
}

// 疑似 fetch。戻り値を unknown と宣言し、any を外に漏らさない
async function fakeFetchJson(url: string): Promise<unknown> {
  const routes: Record<string, string> = {
    "/api/user/1": '{"id": 1, "name": "田中"}',
    "/api/user/2": '{"id": "2", "name": "佐藤"}', // id が文字列(サーバーのバグ)
  };
  const body = routes[url]; // noUncheckedIndexedAccess: string | undefined
  if (body === undefined) throw new Error("404: " + url);
  return JSON.parse(body);
}

// 結果は discriminated union で表現する(応用編 Ch.2 の実戦投入)
type FetchUserResult =
  | { status: "ok"; user: User }
  | { status: "invalid"; raw: unknown }
  | { status: "error"; message: string };

async function fetchUser(url: string): Promise<FetchUserResult> {
  try {
    const data = await fakeFetchJson(url);
    return isUser(data)
      ? { status: "ok", user: data }
      : { status: "invalid", raw: data };
  } catch (e) {
    return { status: "error", message: e instanceof Error ? e.message : String(e) };
  }
}

async function main() {
  for (const url of ["/api/user/1", "/api/user/2", "/api/user/9"]) {
    const result = await fetchUser(url);
    switch (result.status) {
      case "ok":
        console.log("OK: " + result.user.name);
        break;
      case "invalid":
        console.log("検証失敗: " + JSON.stringify(result.raw));
        break;
      case "error":
        console.log("通信エラー: " + result.message);
        break;
    }
  }
}
main();`,
    },
    {
      title: 'zod — スキーマを一度書けば型もついてくる',
      body: `手書きの型述語には構造的な弱点があります。\`interface User\` と \`isUser\` という**2つの情報源**を人力で同期させ続けなければならないことです。User にプロパティを1つ足して \`isUser\` の更新を忘れても、コンパイラは何も言いません(述語の中身は検証されないので)。ネストしたオブジェクトや配列、optional なプロパティが増えるほど、述語は長く、ズレやすくなります。

この問題を解くのが **zod** です(実務のデファクト。同系統に valibot などもあります)。発想の転換は「型からバリデータを書く」のではなく、**「スキーマという実行時の値を書き、そこから型を導出する」**こと:

\`\`\`ts
import { z } from "zod";

const UserSchema = z.object({
  id: z.number(),
  name: z.string(),
  age: z.number().int().min(0),
  email: z.string().optional(),
});

// interface User を手書きしない — スキーマから導出する
type User = z.infer<typeof UserSchema>;
// => { id: number; name: string; age: number; email?: string | undefined }

const data: unknown = JSON.parse(response);

const user = UserSchema.parse(data); // 検証 OK なら User、ダメなら ZodError を throw

const result = UserSchema.safeParse(data); // throw しない版
if (result.success) {
  console.log(result.data.name); // result.data は User
} else {
  console.log(result.error.issues); // どこがどうダメかの詳細
}
\`\`\`

- \`UserSchema\` は**実行時に存在する普通のオブジェクト**。だから実行時検証ができる(型消去の影響を受けない)
- \`z.infer\` は**コンパイル時の型演算**。スキーマの形から静的型を計算する(応用編 Ch.5 の型レベルプログラミングの成果物)
- 情報源はスキーマ**ただ1つ**。型と検証ロジックがズレようがない

Jackson との対比が綺麗です: Jackson は「実行時に残った型情報」から検証を作る(型 → 実行時)。zod は逆に「実行時の値」から型を作る(実行時 → 型)。型消去という制約を、方向を逆転させて出し抜くわけです。ネストは \`z.object\` の入れ子、配列は \`z.array(UserSchema)\` と書くだけで、手書き述語の苦労が消えます。

なお、**この章のエディタでは zod を import できません**(外部パッケージを読み込めないため)。演習と実技問題は手書きの型述語で行いますが、それは「zod が内部でやってくれていること」を手で理解するためでもあります。実務の境界では zod を使ってください。`,
    },
  ],
  exercise: {
    instructions: `### 演習: API クライアントを検証付きに作り直す

基礎編 Ch.3 では \`const user: User = await res.json();\` と書いていました。この章で学んだ通り、それは無検証の「主張」です。fetch の代わりにレスポンスを文字列で模擬したコードを、**unknown + 型述語**で安全に作り直してください。

やること:

1. 型述語 \`isUser(value: unknown): value is User\` を実装する(\`typeof\` / \`!== null\` / \`in\` の4段活用。id は number、name は string、age は number)
2. \`parseUser\` を完成させる: \`JSON.parse\` の結果を **\`unknown\` で受け**、\`isUser\` で検証して、通れば User を、ダメなら null を返す

ルール: \`any\` と型アサーション(\`as\`)は使用禁止(判定で自動チェックされます)。

期待される出力:

\`\`\`
田中 (28歳)
不正なレスポンス
\`\`\``,
    starter: `interface User {
  id: number;
  name: string;
  age: number;
}

// サーバーからのレスポンス(fetch の代わりの模擬データ)
const goodResponse = '{"id": 1, "name": "田中", "age": 28}';
const badResponse = '{"id": "abc", "name": "佐藤"}'; // id が文字列で age が無い

// TODO(1): 型述語 isUser を実装する
// function isUser(value: unknown): value is User { ... }

// TODO(2): JSON.parse の結果を unknown で受け、isUser で検証する
function parseUser(json: string): User | null {
  // ...
  return null;
}

for (const res of [goodResponse, badResponse]) {
  const user = parseUser(res);
  if (user === null) {
    console.log("不正なレスポンス");
  } else {
    console.log(user.name + " (" + user.age + "歳)");
  }
}
`,
    check: {
      noErrors: true,
      mustMatch: ['is\\s+User', '\\bunknown\\b', 'JSON\\.parse'],
      forbid: ['\\bany\\b', '\\bas\\s'],
      output: '田中 (28歳)\n不正なレスポンス',
    },
  },
  quiz: [
    // ---- easy (d:1) ----
    {
      d: 1,
      type: 'choice',
      prompt: '標準ライブラリの `JSON.parse` の戻り値の型は?',
      options: [
        'any — どんな型の変数にも無検査で代入できてしまう',
        'unknown — narrowing しないと使えない',
        'object — プロパティアクセスには型注釈が必要',
        'string — パース前の文字列がそのまま返る',
      ],
      answer: 0,
      explanation: '`JSON.parse` の宣言は歴史的経緯で `any` を返します。any は型チェックの放棄なので、`const user: User = JSON.parse(s)` が無検証で通ってしまう — これが境界問題の入口です。unknown なら安全でしたが標準ライブラリはそうなっていないため、受け取る側で `const data: unknown = JSON.parse(s)` と自衛するのが定石です。object や string を返すわけではありません(パース結果は数値や null のこともあります)。',
      review: 'JSON.parse と fetch の正体 — any は境界から漏れ出す',
    },
    {
      d: 1,
      type: 'choice',
      prompt: '基礎編 Ch.3 の API クライアントではこう書いていた。この型注釈 `: User` の実際の効果は?',
      code: `const res = await fetch("/api/user/1");
const user: User = await res.json();`,
      options: [
        '何も検証されない。res.json() は Promise<any> を返すため、注釈は無検査の「主張」にすぎない',
        'レスポンスの形が User と一致するかを tsc がチェックしてくれる',
        'fetch がレスポンスを User 型に合わせて変換してくれる',
        '形が違う場合、await の時点で例外が投げられる',
      ],
      answer: 0,
      explanation: '`res.json()` の戻り値は `Promise<any>` なので、any → User の代入は無条件で通り、実行時にも何のチェックも走りません。tsc は文字列リテラルや通信内容の中身を検査できませんし、fetch は JSON をパースするだけで型への変換はしません。例外も投げられません — 形が違ってもそのまま流れて、離れた場所で実行時エラーになります。',
      review: 'JSON.parse と fetch の正体 — any は境界から漏れ出す',
    },
    {
      d: 1,
      type: 'choice',
      prompt: 'Java では Jackson の `mapper.readValue(json, User.class)` が実行時に JSON を検証・変換できる。TypeScript で同じことが言語機能だけではできない根本理由は?',
      options: [
        '型情報がコンパイル時にすべて消え、実行時に「User とは何か」を照合する材料が残らないため',
        'TS の JSON パーサが Java より低機能なため',
        'TS には class 構文が存在しないため',
        'strict モードが実行時チェックを無効化するため',
      ],
      answer: 0,
      explanation: 'Jackson は `User.class` という実行時のリフレクション情報を使って検証します。TS は type erasure により interface も型注釈も実行時に消えるため、照合すべき「型」が存在しません。JSON パーサの性能の問題ではなく、TS にも class 構文はあります(ただし interface や型引数の情報は残りません)。strict はコンパイル時チェックの厳しさの設定で、実行時の挙動には無関係です。',
      review: '境界 — 型注釈が保証を失う場所',
    },
    // ---- medium (d:2) ----
    {
      d: 2,
      type: 'choice',
      prompt: '次のコードのコンパイル結果と実行結果の組み合わせとして正しいのは?',
      code: `interface User { name: string; age: number }

const user = JSON.parse('{"name": "田中"}') as User;
console.log(user.age.toFixed(0));`,
      options: [
        'コンパイルは通り、実行時に TypeError(user.age が undefined のため toFixed を呼べない)',
        'as の行でコンパイルエラー(JSON に age が無いことを tsc が検出する)',
        'as が実行時チェックを行い、その行で例外が投げられる',
        'コンパイルは通り、"NaN" と出力される',
      ],
      answer: 0,
      explanation: '`as` はコンパイル時だけの「黙れ」であり、tsc は JSON 文字列の中身までは検査しないのでコンパイルは通ります。Java のキャストと違って実行時チェックも一切ないため、as の行では何も起きず、undefined になった age に `.toFixed` を呼んだ瞬間 TypeError で落ちます。undefined.toFixed() は NaN を返すのではなく例外です。境界から離れた行で爆発する、any/as の典型的な事故パターンです。',
      review: 'JSON.parse と fetch の正体 — any は境界から漏れ出す',
    },
    {
      d: 2,
      type: 'choice',
      prompt: '`if (isUser(v)) { v.name }` のように if の中で v を User に narrowing させたい。`function isUser(v: unknown): ???` の ??? に入れるべき戻り値の型は?',
      options: [
        'v is User — 型述語。true を返したら v は User だとコンパイラに伝える',
        'boolean — true / false を返すのだから boolean でよい',
        'User — 検証済みの値を返すべきだから',
        'true — 検証が通ることを型で表現する',
      ],
      answer: 0,
      explanation: '`v is User` という型述語だけが narrowing を引き起こします。boolean と書いても関数は同じ動きをしますが、コンパイラは呼び出し結果と v の型を関連づけないので if の中でも v は unknown のままです。User を返す設計(パース関数)もありえますが、それは述語ではなく別のシグネチャになります。`true` を戻り値型にすると false を返せなくなり検証関数として成立しません。',
      review: 'unknown で受け、型述語で通す',
    },
    {
      d: 2,
      type: 'choice',
      prompt: '次のコードは `"name" in x` の行でコンパイルエラーになる。原因は?',
      code: `function show(x: unknown) {
  if (typeof x === "object" && "name" in x) {
    console.log(x.name);
  }
}`,
      options: [
        'typeof x === "object" では null が除外されない(typeof null も "object")ため、x が null の可能性が残っている',
        'unknown に対して in 演算子はいかなる場合も使えないため',
        'name プロパティがどの interface にも宣言されていないため',
        'strict モードでは in 演算子の使用が禁止されているため',
      ],
      answer: 0,
      explanation: 'JS の古傷で `typeof null === "object"` なので、この時点の x は object | null。in の右辺に null が来ると実行時エラーになるため tsc が止めます。`typeof x === "object" && x !== null && "name" in x` と null チェックを挟めば通ります。in 演算子は object に narrowing 済みの値になら unknown 由来でも使えますし、宣言されていないプロパティの存在確認こそが in の役目です。strict が in を禁止することもありません。',
      review: 'unknown で受け、型述語で通す',
    },
    // ---- hard (d:3) ----
    {
      d: 3,
      type: 'code',
      prompt: '次の関数は JSON.parse の結果を検証せずに使っており、2回目の呼び出しで「みかん: undefined円」という壊れた出力を黙って返す。**型アサーションを使わずに** unknown + narrowing で検証を入れ、出力が「りんご: 120円」「invalid」となるように直せ。',
      starter: `interface Product {
  name: string;
  price: number;
}

function describeProduct(json: string): string {
  const data = JSON.parse(json); // 検証していない
  return data.name + ": " + data.price + "円";
}

console.log(describeProduct('{"name":"りんご","price":120}'));
console.log(describeProduct('{"name":"みかん"}'));
`,
      check: {
        noErrors: true,
        mustMatch: ['\\bunknown\\b'],
        forbid: ['\\bany\\b', '\\bas\\s'],
        output: 'りんご: 120円\ninvalid',
      },
      explanation: '`const data: unknown = JSON.parse(json)` と受けると、data.name の行がコンパイルエラーになり検証が強制されます。あとは4段活用 — `typeof data === "object" && data !== null && "name" in data && typeof data.name === "string" && "price" in data && typeof data.price === "number"` — で絞り込み、通れば整形して返し、ダメなら "invalid" を返します。型述語 isProduct に切り出しても、if に直接書いても構いません。',
      review: 'unknown で受け、型述語で通す',
    },
    {
      d: 3,
      type: 'choice',
      prompt: '次の4つの型アサーションのうち、**実行時に「嘘」になる危険がない**ものはどれ?',
      options: [
        'JSON.parse(s) as unknown — どんな値でも unknown には当てはまる',
        'JSON.parse(s) as User — パース結果を User として扱う',
        '(await res.json()) as User[] — レスポンスを配列として扱う',
        'localStorage.getItem("user") as string — 取得結果を文字列として扱う',
      ],
      answer: 0,
      explanation: 'unknown は「すべての値の集合」なので、any を unknown に広げる主張はどんな実行時の値に対しても真であり、嘘になりようがありません(むしろ any を封じる安全化テクニックです)。残り3つは「外から来た値は特定の形をしている」という無検証の絞り込みで、サーバーの応答次第で嘘になります。特に localStorage.getItem の戻り値は string | null で、キーが未保存なら null — 実際に起こりうるケースを as がもみ消す典型例です。',
      review: 'JSON.parse と fetch の正体 — any は境界から漏れ出す',
    },
    {
      d: 3,
      type: 'choice',
      prompt: '次の型述語について正しい記述はどれ?',
      code: `interface User { name: string; age: number }

function isUser(v: unknown): v is User {
  return typeof v === "object" && v !== null; // プロパティを何も確認していない
}`,
      options: [
        'コンパイルは通り narrowing も効くが、実装が不十分なので実行時の安全は保証されない — 述語の中身の正しさはプログラマの責任',
        'return 式が v の User 性を証明していないため、コンパイルエラーになる',
        'コンパイルは通るが、実装が不十分な述語では narrowing は発動しない',
        'strict モードなら tsc が述語の実装とプロパティの対応を検証してくれる',
      ],
      answer: 0,
      explanation: 'tsc が検証するのは「return 式が boolean であること」だけで、実装が主張(v is User)を本当に証明しているかは見ません。この述語は `{}` にも true を返すので、narrowing は効くのに実行時には User でない値が素通りします — いわば「検証のふりをした as」です。コンパイルエラーにはならず、narrowing は述語のシグネチャだけで発動し、strict にも実装検証機能はありません。この「述語の中身のズレ」を構造的に防ぐのが、スキーマを単一の情報源にする zod です。',
      review: 'unknown で受け、型述語で通す',
    },
    {
      d: 3,
      type: 'choice',
      prompt: 'zod を使った次の構成が、手書きの interface + 型述語より優れている点として最も適切なのは?',
      code: `const UserSchema = z.object({ id: z.number(), name: z.string() });
type User = z.infer<typeof UserSchema>;

const user = UserSchema.parse(JSON.parse(body));`,
      options: [
        'スキーマという実行時の値から型を導出するため、型と検証ロジックの二重管理(と食い違い)が構造的に起きない',
        'z.infer が実行時に型情報を復元するため、type erasure が起きなくなる',
        'parse がコンパイル時に body の中身を検査するため、実行前に不正が分かる',
        'zod を経由すると as による型アサーションが実行時チェック付きになる',
      ],
      answer: 0,
      explanation: '手書きでは interface と述語という2つの情報源を人力で同期させる必要があり、片方の更新漏れをコンパイラは検出できません。zod はスキーマ(実行時に存在する値)を唯一の情報源にし、静的型は z.infer で機械的に導出するのでズレようがありません。z.infer はコンパイル時の型演算であり、type erasure 自体は起きたままです。parse は実行時の検証で、コンパイル時に通信内容は分かりません。as の意味論も変わりません — zod は as を「使わずに済む」ようにする道具です。',
      review: 'zod — スキーマを一度書けば型もついてくる',
    },
  ],
});
