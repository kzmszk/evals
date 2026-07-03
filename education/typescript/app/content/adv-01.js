// 応用編 Ch.1 — 構造的型付け
window.COURSE.register({
  id: 'adv-01',
  part: 'advanced',
  title: '構造的型付け — nominal からのアンラーニング',
  minutes: 45,
  goal: 'Java の「名前ベース(nominal)」の直感を捨て、「この代入は通るか」を型の名前ではなく形(構造の部分集合関係)だけで判定できる。excess property check の発動条件と、branded type で意図的に nominal に寄せる方法を説明できる。',
  sections: [
    {
      title: 'implements はもう要らない — 「形」が契約になる',
      body: `Java で interface を満たすには \`implements\` を**宣言**する必要がありました。宣言していないクラスは、たとえ全メソッドが揃っていても互換ではない — 型の同一性を**名前**で判定する、nominal typing の世界です。

TypeScript は逆です。**宣言は一切見ず、形(構造)だけを見ます**。\`log(message: string): void\` を持つ値は、それがクラスのインスタンスだろうがただのオブジェクトリテラルだろうが、誰にも許可を求めることなく \`Logger\` として通用します。これを **structural typing(構造的型付け)** と呼びます。

Python 経験者へ: これは要するに duck typing です。「アヒルのように鳴くならアヒル」。ただし判定が実行時ではなく**コンパイル時**に行われます。Python の \`typing.Protocol\` を知っていれば、TS では**すべての型が Protocol** だと思ってください。

なぜこの設計なのか? TS は「すでに存在する JS」に型を付けるための言語だからです。JS の世界は \`implements\` を書いていないオブジェクトで満ちており、名前ベースの判定ではそれらに型を付けられません。

下のコードでは、\`ConsoleLogger\` クラスも素のオブジェクト \`plain\` も \`implements Logger\` とは一言も書いていませんが、どちらも \`Logger\` を要求する関数に渡せます。`,
      code: `interface Logger {
  log(message: string): void;
}

// implements と書いていないクラス
class ConsoleLogger {
  log(message: string): void {
    console.log("[console] " + message);
  }
}

// ただのオブジェクトリテラル
const plain = {
  log(message: string): void {
    console.log("[plain] " + message);
  },
};

function runWith(logger: Logger): void {
  logger.log("構造が合えば通る");
}

runWith(new ConsoleLogger()); // OK: implements なしで Logger を満たす
runWith(plain);               // OK: クラスですらなくてよい`,
    },
    {
      title: '互換性は部分集合 — プロパティが多い方が代入できる',
      body: `構造的型付けの互換性ルールは1行で言えます: **要求されるプロパティをすべて(互換な型で)持っていれば代入できる**。余分に持っている分には構いません。

集合として考えると腑に落ちます。型は「その形を満たす値の集合」です。\`Point3D\`(x, y, z を持つ)の値は、必ず \`Point2D\`(x, y を持つ)の条件も満たします。つまり **Point3D の値集合は Point2D の値集合の部分集合**であり、部分集合の側 → 大きい集合の側への代入は常に安全です。

Java 経験者はここで方向を間違えがちです。「Point3D の方がプロパティが多い = 大きい型」ではありません。**条件が厳しいほど、満たす値は少ない = 集合としては小さい**。\`extends\` を宣言していなくても、TS は「Point3D は事実上 Point2D のサブタイプ」と構造から勝手に認定します。

逆方向(\`Point2D\` の値を \`Point3D\` が要求される場所へ)は \`z\` が欠けるのでエラーです。エラーメッセージは \`Property 'z' is missing in type 'Point2D'\` — 基礎編で学んだ「実際 / 要求」の読み方がそのまま使えます。`,
      code: `interface Point2D { x: number; y: number }
interface Point3D { x: number; y: number; z: number }
// extends の宣言はどこにもない、ことに注目

const p3: Point3D = { x: 1, y: 2, z: 3 };
const p2: Point2D = p3; // OK: x, y を持っているので Point2D の条件を満たす
console.log(p2.x, p2.y);

function distanceFromOrigin(p: Point2D): number {
  return Math.hypot(p.x, p.y);
}
console.log(distanceFromOrigin(p3)); // OK: Point3D は Point2D として通用する

// 逆方向はエラー(コメントを外して確認)
// const q3: Point3D = p2; // Property 'z' is missing in type 'Point2D'`,
    },
    {
      title: '型の名前は互換性に関係ない — Cat が Dog になる世界',
      body: `構造的型付けの帰結として、Java 経験者が最初に「気持ち悪い」と感じる現象が起きます。**名前がまったく違う型どうしでも、形が同じなら区別されない**のです。

\`\`\`ts
interface Cat { name: string; legs: number }
interface Dog { name: string; legs: number }

const tama: Cat = { name: "たま", legs: 4 };
const pochi: Dog = tama; // OK。エラーにならない
\`\`\`

Java なら \`Cat\` と \`Dog\` は無関係な2つの型で、この代入は絶対に通りません。TS では \`Cat\` と \`Dog\` は**同じ形に付けた2つの別名**にすぎず、互換性判定において名前は一切参照されません。「interface を宣言する」とは新しい壁を作ることではなく、既存の形に**ラベルを貼る**ことです。

では \`implements\` を書く意味は? TS でも \`class ConsoleLogger implements Logger\` と書くことは**できます**。ただし意味が Java と違い、互換性の判定には影響しません。「このクラスは Logger の形を満たすはずだ」という宣言をその場でチェックさせる、**早期エラー + ドキュメント**のための道具です。書かなくても形が合えば Logger として使えるし、書いても nominal にはなりません。

「UserId と PostId はどちらも string だが混ぜたくない」— この気持ち悪さへの対処は本章の最後で扱います(branded type)。まずは「**名前は飾り、形がすべて**」を徹底的に頭に入れてください。`,
    },
    {
      title: 'excess property check — リテラル直渡しだけ厳しくなる',
      body: `前節までのルールに従うと、余分なプロパティを持つ値の代入は常に OK のはずです。ところが、次のコードは**エラーになります**。

\`\`\`ts
interface Config { host: string; port: number }
const c: Config = { host: "localhost", port: 8080, debgu: true };
// エラー: 'debgu' does not exist in type 'Config'
\`\`\`

「部分集合なら通るのでは?」— はい、通常は通ります。しかしここには**例外ルール**が1つあります。**オブジェクトリテラルをその場で直接**代入・引数渡ししたときだけ、TS は余分なプロパティを許さず即エラーにします。これが **excess property check** です。

理屈はこうです。変数経由で渡ってくる値の余分なプロパティは「他の用途で使われているかもしれない」ので許容するしかない。しかし**その場で書いたリテラル**の余分なプロパティは、他の誰も参照しようがない、つまり**書き損じかミスである可能性が極めて高い**。上の例の \`debgu\` はまさに \`debug\` のタイポで、構造的型付けを素朴に適用するとこのタイポは**検出されずに握り潰されます**(optional プロパティなら特に)。それを防ぐための、実用主義的な特例です。

境界を正確に覚えてください: **リテラル直渡しなら検査される、いったん変数に入れれば通常の部分集合判定に戻る**。関数の引数でも、\`return\` に直接書いたリテラルでも同じです。下のコードで両方を確認できます。`,
      code: `interface Config { host: string; port: number }

// リテラル直渡し: excess property check が働く → エラー(赤線を確認)
const c1: Config = { host: "localhost", port: 8080, debgu: true };

// まったく同じ中身でも、変数を経由すると通常の部分集合判定に戻る → OK
const raw = { host: "localhost", port: 8080, debgu: true };
const c2: Config = raw;

console.log(c2.host, c2.port);
// c1 のエラーは「debgu はタイポでは?」というコンパイラからの指摘。
// 実行自体はできる(型は消えるので)が、直すべきコード`,
    },
    {
      title: 'branded type — わざと nominal に寄せる',
      body: `構造的型付けには実務上の弱点があります。\`UserId\` と \`PostId\` を両方 \`type UserId = string\` のような別名にしても、形が同じ(ただの string)なので**混ぜてもエラーになりません**。Java なら \`UserId\` クラスを作れば混同はコンパイルエラーになる — nominal が欲しい場面です。

TS の慣用的な解決策が **branded type**(branded / opaque type)です。本物の string に「存在しないタグプロパティ」を型レベルだけで貼り付けます:

\`\`\`ts
type UserId = string & { readonly __brand: "UserId" };
type PostId = string & { readonly __brand: "PostId" };
\`\`\`

こうすると \`UserId\` と \`PostId\` は \`__brand\` の型が異なるため、構造的に**非互換**になります。ただの string も \`__brand\` を持たないので \`UserId\` には代入できません。構造的型付けのルールはそのままに、**わざと形を変えて名前の代わりにする**トリックです。

値を作るには、境界となる関数を1つ用意して、そこでだけ \`as\` で認定します(\`as\` の危険性は応用編 Ch.3 で扱いますが、branded type の生成箇所は数少ない正当な用途です)。

重要な注意: \`__brand\` プロパティは**実行時には存在しません**。基礎編 Ch.1 の type erasure そのままで、実行時の値は正真正銘ただの string です。Java の「UserId ラッパークラスのインスタンス」のような実行時の実体は**何もない**、コンパイル時だけの護符です。本章では紹介まで — 実務では zod 等のライブラリが brand 機能を提供しており、応用編 Ch.6 で再会します。`,
      code: `type UserId = string & { readonly __brand: "UserId" };
type PostId = string & { readonly __brand: "PostId" };

// 生成の境界を1箇所に絞り、そこでだけ as で認定する
function userId(raw: string): UserId {
  return raw as UserId;
}

function fetchUser(id: UserId): void {
  console.log("fetch user: " + id);
}

const uid = userId("u_42");
fetchUser(uid); // OK

// どちらもエラー(コメントを外して確認)
// fetchUser("u_42");        // ただの string は __brand を持たない
// const pid: PostId = uid;  // brand が違うので非互換

console.log(typeof uid); // "string" — brand は実行時には消えている`,
    },
  ],
  exercise: {
    instructions: `### 演習: 「通る形」に直す

下のコードには型エラーが**3箇所**あります。excess property check の性質(リテラル直渡しだけ厳しい/変数経由なら部分集合判定)を使って、**\`any\` / \`as\` を使わず**、**interface \`Summary\` も \`printSummary\` も変更せず**に直してください。

- (1) と (3): \`urgent\` / \`draft\` プロパティは**削除せずに**エラーを解消すること(ヒント: 変数に切り出す)
- (2): 不足しているプロパティを補うこと(count は 12)
- 直し終わったら「▶ 実行」で出力を確認し、「判定」でクリア判定

期待される出力:

\`\`\`
未読: 3件
既読: 12件
下書き: 5件
\`\`\``,
    starter: `interface Summary { title: string; count: number }

function printSummary(s: Summary): void {
  console.log(s.title + ": " + s.count + "件");
}

// (1) リテラル直渡しで excess property check に引っかかっている
//     urgent は消さずにエラーを解消せよ
printSummary({ title: "未読", count: 3, urgent: true });

// (2) プロパティが足りない(count: 12 を補う)
const read = { title: "既読" };
printSummary(read);

// (3) return に直接書いたリテラルも excess property check の対象
//     draft は消さずにエラーを解消せよ
function makeDraftSummary(): Summary {
  return { title: "下書き", count: 5, draft: true };
}
printSummary(makeDraftSummary());
`,
    check: {
      noErrors: true,
      mustMatch: ['printSummary\\(', 'urgent', 'draft'],
      forbid: ['\\bany\\b', '\\bas\\b', 'urgent\\s*\\?', 'draft\\s*\\?'],
      output: '未読: 3件\n既読: 12件\n下書き: 5件',
    },
  },
  quiz: [
    // ---- easy (d:1) ----
    {
      d: 1,
      type: 'choice',
      prompt: 'TypeScript が2つの型の互換性(代入できるか)を判定するとき、基準にするのは?',
      options: [
        '型の形(構造)。宣言された名前や継承関係は見ない',
        '型の宣言名。名前が違えば形が同じでも非互換',
        'implements / extends の宣言があるかどうか',
        'クラスかオブジェクトリテラルかの区別',
      ],
      answer: 0,
      explanation: 'TS は structural typing(構造的型付け)で、互換性は形だけで決まります。名前や implements / extends 宣言で判定するのは Java などの nominal typing の考え方であり、TS では宣言は互換性に影響しません。クラスかリテラルかの区別も無関係で、形さえ合えばどちらも同じ型として通用します。',
      review: 'implements はもう要らない — 「形」が契約になる',
    },
    {
      d: 1,
      type: 'choice',
      prompt: 'Java では interface を満たすために `implements` の宣言が必須だった。TypeScript でオブジェクトやクラスが interface を満たす条件は?',
      options: [
        'interface が要求するプロパティ・メソッドを形として備えていること。宣言は不要',
        'implements を宣言していること(Java と同じ)',
        'interface と同名のクラスであること',
        'オブジェクトリテラルであること(クラスは interface を満たせない)',
      ],
      answer: 0,
      explanation: '形が合っていればそれだけで interface を満たします。implements は書いてもよいですが「宣言時点で形をチェックさせる」道具にすぎず、必須ではありません。同名クラスである必要もなく(名前は判定に使われない)、クラス・リテラルのどちらでも満たせます。Python の Protocol のコンパイル時版と考えると近いです。',
      review: 'implements はもう要らない — 「形」が契約になる',
    },
    {
      d: 1,
      type: 'choice',
      prompt: 'excess property check(余分なプロパティの検査)が働くのはどんなとき?',
      options: [
        'オブジェクトリテラルを代入先・引数・return に直接書いたとき',
        'すべての代入(変数経由でも常に働く)',
        '変数を経由した代入のときだけ',
        'クラスのインスタンスを渡したとき',
      ],
      answer: 0,
      explanation: 'excess property check はリテラルを「その場で直接」使ったときだけ働く特例です。変数を経由すると通常の部分集合判定に戻る(余分なプロパティは許容)ので、選択肢2・3は逆です。クラスのインスタンスはリテラルではないので対象外です。リテラルの余分なプロパティは誰にも参照されようがなく、タイポの可能性が高い — だから特別に厳しくする、という理屈でした。',
      review: 'excess property check — リテラル直渡しだけ厳しくなる',
    },
    // ---- medium (d:2) ----
    {
      d: 2,
      type: 'choice',
      prompt: '次のコードの最終行は通る?(extends の宣言はどこにもないことに注意)',
      code: `interface Point2D { x: number; y: number }
interface Point3D { x: number; y: number; z: number }

const p3: Point3D = { x: 1, y: 2, z: 3 };
const p2: Point2D = p3;`,
      options: [
        '通る。Point3D は Point2D の要求(x, y)をすべて満たすので、宣言がなくても代入できる',
        '通らない。Point3D extends Point2D の宣言がないため無関係な型どうしになる',
        '通らない。z が余分なので excess property check でエラーになる',
        '通らない。プロパティが多い型を少ない型に入れることはできない',
      ],
      answer: 0,
      explanation: '構造的型付けでは、要求されるプロパティを持っていれば代入できます。extends 宣言の有無は判定に関係ありません(選択肢2は Java の直感)。excess property check はリテラル直渡しのときの特例で、変数 p3 を経由するここでは働きません(選択肢3)。選択肢4は部分集合関係の方向を逆に捉えています — プロパティが多い方が「条件が厳しい = 値集合として小さい」ので、少ない方へ代入できるのです。',
      review: '互換性は部分集合 — プロパティが多い方が代入できる',
    },
    {
      d: 2,
      type: 'choice',
      prompt: 'ア〜エのうち、型エラーになるのはどれ?',
      code: `interface Config { host: string; port: number }
const obj = { host: "a", port: 80, debug: true };
function setup(c: Config): void { console.log(c.host); }

const c1: Config = { host: "a", port: 80, debug: true }; // ア
const c2: Config = obj;                                  // イ
setup({ host: "a", port: 80, debug: true });             // ウ
setup(obj);                                              // エ`,
      options: [
        'アとウ(リテラル直渡しの2つ)',
        'アイウエすべて(debug は Config にないため)',
        'どれもエラーにならない(部分集合なので)',
        'アだけ(引数渡しでは excess property check は働かない)',
      ],
      answer: 0,
      explanation: '中身は4つとも同一ですが、excess property check は「リテラルを直接書いたか」で発動が決まります。ア(代入に直書き)とウ(引数に直書き)はエラー、イ・エは変数 obj 経由なので通常の部分集合判定となり通ります。選択肢2は特例を全代入に適用した誤り、選択肢3は特例の存在を忘れた誤り、選択肢4は誤りで、引数渡しでも return でもリテラル直書きなら検査されます。',
      review: 'excess property check — リテラル直渡しだけ厳しくなる',
    },
    {
      d: 2,
      type: 'choice',
      prompt: '次のコードのコンパイル・実行結果は?',
      code: `interface Greeter { greet(): string }

class JapaneseGreeter {
  greet(): string { return "こんにちは"; }
}

function run(g: Greeter): void {
  console.log(g.greet());
}

run(new JapaneseGreeter());`,
      options: [
        'コンパイルが通り、「こんにちは」と出力される',
        'コンパイルエラー。JapaneseGreeter が implements Greeter を宣言していない',
        'コンパイルは通るが、実行時に型チェックで例外が出る',
        'コンパイルエラー。クラスのインスタンスは interface 型の引数に渡せない',
      ],
      answer: 0,
      explanation: 'JapaneseGreeter は greet(): string を持つので、implements 宣言なしで構造的に Greeter を満たします(選択肢2は Java の直感)。選択肢3は type erasure に反します — 型は実行時に存在しないので、実行時の型チェックというもの自体がありません。選択肢4のような区別もなく、形が合えばクラスのインスタンスも interface 型として通用します。',
      review: 'implements はもう要らない — 「形」が契約になる',
    },
    {
      d: 2,
      type: 'choice',
      prompt: 'branded type を次のように定義した。最終行はどうなる?',
      code: `type UserId = string & { readonly __brand: "UserId" };

const id: UserId = "u_42";`,
      options: [
        '型エラー。ただの string は __brand プロパティ(の型)を持たず、UserId の条件を満たさない',
        '通る。UserId の実体は string なので string リテラルを代入できる',
        '型エラー。string と object の交差型は常に never になるため',
        '通るが、実行時に __brand が undefined なので警告が出る',
      ],
      answer: 0,
      explanation: 'UserId は「string かつ __brand を持つ」型なので、ただの string リテラルは構造的に条件を満たせず代入できません — これが brand の狙いで、生成箇所を userId() のような認定関数に強制できます。選択肢2は brand を貼った意味を無視しています。string との交差型は never にはなりません(選択肢3)。選択肢4は type erasure に反します — 型は実行時に消えるので実行時の警告は存在しえません。',
      review: 'branded type — わざと nominal に寄せる',
    },
    // ---- hard (d:3) ----
    {
      d: 3,
      type: 'choice',
      prompt: 'Cat / Dog / Snake は互いに無関係に宣言された interface である。ア〜ウのうち型エラーになるのはどれ?',
      code: `interface Cat { name: string; legs: number }
interface Dog { name: string; legs: number }
interface Snake { name: string }

const tama: Cat = { name: "たま", legs: 4 };
const pochi: Dog = tama;   // ア
const shiro: Snake = tama; // イ
const back: Cat = shiro;   // ウ`,
      options: [
        'ウだけ(Snake には legs がないため)。アとイは通る',
        'アイウすべて(Cat / Dog / Snake は別の名前の型なので相互に代入できない)',
        'アだけ通り、イとウはエラー(部分的な形の一致は認められない)',
        'どれもエラーにならない(すべて name を持つため)',
      ],
      answer: 0,
      explanation: '名前は判定に使われないので、形が同一の Cat → Dog(ア)は通ります — Java の直感(選択肢2)が最も裏切られる例です。Cat → Snake(イ)も、Cat は Snake の要求(name)を満たすので通ります。しかし Snake → Cat(ウ)は legs が欠けているのでエラー。「要求をすべて満たすか」という部分集合の方向だけが問題で、名前の異同(選択肢2)や完全一致か否か(選択肢3)は関係ありません。選択肢4は方向を無視しています — ウでは Cat が legs を要求しています。',
      review: '型の名前は互換性に関係ない — Cat が Dog になる世界',
    },
    {
      d: 3,
      type: 'code',
      prompt: '次のコードは excess property check でエラーになる。**interface Product と関数 show は変更せず**、**stock の情報も削除せず**、any / as も使わずにエラーを解消し、出力を `ペン: 120円` にせよ。',
      starter: `interface Product { name: string; price: number }

function show(p: Product): void {
  console.log(p.name + ": " + p.price + "円");
}

show({ name: "ペン", price: 120, stock: 8 });
`,
      check: {
        noErrors: true,
        mustMatch: ['show\\(', 'stock'],
        forbid: ['\\bany\\b', '\\bas\\b', 'stock\\s*\\?', 'stock\\s*:\\s*number'],
        output: 'ペン: 120円',
      },
      explanation: 'excess property check はリテラル直渡しのときだけ働くので、いったん変数に切り出せば解消します: `const pen = { name: "ペン", price: 120, stock: 8 }; show(pen);`。変数経由では通常の部分集合判定に戻り、stock を余分に持っていても Product の要求(name, price)を満たすので通ります。interface に stock を足す・as Product で黙らせる・stock を消す、はいずれも今回の縛りで禁止 — 特に as は「タイポかもしれない」という検査ごと握り潰す点で最悪の選択です。',
      review: 'excess property check — リテラル直渡しだけ厳しくなる',
    },
    {
      d: 3,
      type: 'choice',
      prompt: 'branded type の UserId(`string & { readonly __brand: "UserId" }`)について、Java 経験者の次の理解のうち**正しい**ものは?',
      code: `type UserId = string & { readonly __brand: "UserId" };

function userId(raw: string): UserId {
  return raw as UserId;
}

const uid = userId("u_42");`,
      options: [
        '実行時の uid はただの string で、__brand プロパティはどこにも存在しない',
        'uid は { value: "u_42", __brand: "UserId" } のようなラッパーオブジェクトになる',
        'userId() の as が実行時チェックのコードに変換され、不正な文字列なら例外が出る',
        'typeof uid は実行時に "UserId" を返す',
      ],
      answer: 0,
      explanation: 'brand は型レベルだけの存在で、type erasure によりコンパイル後には跡形もなく消えます。実行時の uid は "u_42" というただの string で、typeof uid は "string" です(選択肢4は誤り)。Java なら UserId ラッパークラスのインスタンスという実行時の実体がありますが、TS の branded type にはそれがなく(選択肢2)、as も実行時には何もしない(選択肢3 — as はコンパイラへの宣言であって変換やチェックではない。詳細は応用編 Ch.3)。コストゼロで nominal の安全性だけを得るのが branded type の設計です。',
      review: 'branded type — わざと nominal に寄せる',
    },
    {
      d: 3,
      type: 'choice',
      prompt: 'TypeScript で `class FileLogger implements Logger { ... }` と implements を明示的に書いた。Java との違いとして正しい説明は?',
      options: [
        'クラス宣言の時点で Logger の形を満たすかチェックされるだけで、互換性判定は構造のまま。書かなくても形が合えば Logger として使える',
        'implements を書いたクラスだけが Logger 型の引数に渡せるようになる(nominal になる)',
        'implements を書くと実行時に instanceof Logger が使えるようになる',
        'TS の implements は構文として存在するが、型チェックへの影響は一切ない',
      ],
      answer: 0,
      explanation: 'TS の implements は「このクラスは Logger の形を満たすはず」という宣言時アサーションで、満たしていなければクラス定義の場所で早期にエラーが出ます。しかし互換性判定はあくまで構造的で、implements の有無で通る/通らないは変わりません(選択肢2は Java の意味論)。interface は実行時に存在しないので instanceof には使えず、implements を書いてもそれは変わりません(選択肢3)。選択肢4は「一切ない」が誤りで、宣言時点の形チェックという効果は実際にあります — ドキュメントとタイポ早期検出のために書く価値はあります。',
      review: '型の名前は互換性に関係ない — Cat が Dog になる世界',
    },
  ],
});
