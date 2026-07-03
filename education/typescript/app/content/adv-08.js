// 応用編 Ch.8 — tsconfig 深掘りと型エラーの読み方
window.COURSE.register({
  id: 'adv-08',
  part: 'advanced',
  title: 'tsconfig 深掘りと型エラーの読み方',
  minutes: 45,
  goal: 'strict ファミリーの各フラグが何を守るかを説明でき、関数型の変性(反変)と配列の共変性の穴を理解し、長い型エラーメッセージを「最後から読んで」原因を特定・最小再現できる。',
  sections: [
    {
      title: 'strict は1つのスイッチではない — フラグの束を分解する',
      body: `\`strict: true\` は単一のチェックではなく、複数の個別フラグをまとめて有効にする**プリセット(束)**です。中身を知らないと「strict にしたのに検出されない」「このエラーはどのフラグの仕事?」が分からなくなります。主要な3つ:

- **noImplicitAny** — 型が推論できず暗黙に \`any\` に落ちる場所(典型: 注釈のない関数引数)をエラーにする。Python で \`mypy --strict\` が型注釈のない \`def\` を拒むのと同じ発想、Java で言えば raw type の使用を警告でなくエラーにする感覚です。これが無効だと、書き忘れた引数がすべて \`any\` になり、型チェックが**静かに**無効化されていきます。
- **strictNullChecks** — \`null\` / \`undefined\` をすべての型から分離する。基礎編 Ch.4 で「Optional が言語に組み込まれている」と説明したものの正体がこのフラグです。Java で言えば、全参照型がデフォルト \`@NonNull\` になり、null を持ちうる値だけ \`T | null\` と明示する世界。NullPointerException 系のバグをコンパイル時に検出します。
- **strictFunctionTypes** — 関数型の引数を**反変**でチェックする(詳細は後の節)。これが無効だと、引数の型が合わない関数の代入が素通りします。

そして重要な注意が2つあります。

1. **noUncheckedIndexedAccess は strict に含まれません**。別途有効化が必要です(次節。この演習環境では有効にしてあります)。
2. **\`any\` はすべてのフラグを素通りします**。strict をどれだけ固めても、\`any\` が1つ紛れ込めばその下流のチェックは全滅します(応用編 Ch.3 の回収)。noImplicitAny が禁止するのは「**暗黙の**」any だけで、\`JSON.parse\` のように**明示的に any を返す** API は止められません(応用編 Ch.6 で見た「境界」の問題)。

Java 経験者へ: \`javac\` にはこうした「厳しさのダイヤル」はほぼありませんね。TS はゆるい JS との互換のためチェックがオプトイン式に増えてきた歴史があり、tsconfig がプロジェクトの「型安全性の契約書」になっています。新規プロジェクトで \`strict: true\` が非交渉であることは、このコースの一貫した立場です。`,
    },
    {
      title: 'noUncheckedIndexedAccess — 添字アクセスは信用しない',
      body: `Python で \`xs[99]\` は \`IndexError\`、Java では \`ArrayIndexOutOfBoundsException\` — **その場で例外が飛ぶ**ので、範囲外アクセスにはすぐ気づけました。JS は違います。範囲外アクセスは黙って \`undefined\` を返し、離れた場所で \`TypeError: Cannot read properties of undefined\` として爆発します。例外文化から来た移民が最初に踏む地雷です。

TS のデフォルト(strict でも!)は、この JS の挙動に対して楽観的で、\`number[]\` の要素アクセスを常に \`number\` 型とみなします。\`noUncheckedIndexedAccess\` を有効にすると、添字アクセスの型が \`T | undefined\` になり、strictNullChecks の narrowing 義務が生じます。

- 対象: 配列の添字アクセス、\`Record<string, T>\` などの index signature 経由のアクセス、配列の分割代入
- 対象外: \`for...of\` / \`map\` / \`forEach\` など添字を経由しないアクセス、そして**タプルの固定添字**(\`[string, number]\` の \`t[0]\` は長さが型で保証されているため \`string\` のまま)

「毎回 undefined チェックは面倒では?」— その通り面倒です。だからこそ設計が変わります: 添字でランダムアクセスする書き方を減らし、\`for...of\` や \`map\` を使う、存在が保証できる場面では \`??\` でフォールバックを書く。面倒さは「JS の添字アクセスが本質的に安全でない」ことの正直な反映です。

下のコードで実際の型を確認してください(この演習環境は noUncheckedIndexedAccess 有効です)。`,
      code: `const scores = [90, 80, 70];

const first = scores[0]; // 型は number | undefined(範囲外の可能性)
// console.log(first.toFixed(1)); // エラー: 'first' is possibly 'undefined'

// 対処1: ?? でフォールバック
console.log((scores[0] ?? 0).toFixed(1));

// 対処2: narrowing(undefined を除外してから使う)
const last = scores[scores.length - 1];
if (last !== undefined) {
  console.log("last =", last.toFixed(1));
}

// 添字を経由しないアクセスは影響を受けない(要素型は number のまま)
for (const s of scores) console.log(s);

// オブジェクトの index signature も同じ扱い
const stock: Record<string, number> = { apple: 3 };
const banana = stock["banana"]; // number | undefined — そして実際に undefined!
console.log("banana:", banana);`,
    },
    {
      title: '関数の引数は反変 — そして配列の共変性という穴',
      body: `\`Dog\` が \`Animal\` の部分型のとき、\`(d: Dog) => void\` と \`(a: Animal) => void\` はどちらがどちらに代入できるでしょうか。Java の共変の直感(「Dog は Animal の一種だから Dog 側が代入できる」)は、**引数の位置では逆転**します。

- \`(a: Animal) => void\` は \`(d: Dog) => void\` が要求される場所に**代入できる**。どんな Animal でも扱える関数は、Dog を渡されても困らないからです。
- 逆はエラー。Dog 前提の関数は \`bark()\` を呼ぶかもしれず、Animal を渡されると壊れます。

この「引数の型は部分型関係が逆向きになる」性質を**反変(contravariant)**と呼び、strictFunctionTypes がこのチェックを担っています。ただし TS には意図的な例外があります。**メソッド記法で宣言された関数だけは双方向(bivariant)に緩くチェックされる**のです:

\`\`\`ts
interface HandlerM { handle(a: Animal): void }     // メソッド記法 → bivariant(緩い)
interface HandlerP { handle: (a: Animal) => void } // 関数型プロパティ記法 → 反変(厳密)

const dogOnly = { handle: (d: Dog) => d.bark() };
const m: HandlerM = dogOnly; // 通ってしまう(不健全!)
const p: HandlerP = dogOnly; // エラー: strictFunctionTypes の反変チェック
\`\`\`

なぜこんな例外を残したのか。**配列のため**です。\`Array<T>\` の \`push(item: T)\` などはすべてメソッド記法で宣言されており、これを厳密に反変チェックすると \`Dog[]\` を \`Animal[]\` に代入できなくなり(不変になり)、現実の JS コードがほぼ書けなくなります。つまり TS の配列は**利便性のために意図的に共変**であり、そこが型システムの公認の穴です。

Java 経験者へ: Java も配列は共変ですね。\`Animal[] animals = dogs\` のあと間違った要素を格納すると **ArrayStoreException** が実行時に飛ぶ — 配列が実行時に要素型を覚えているからです。TS は型消去(基礎編 Ch.1)により**実行時の防御が一切ない**ため、混入は沈黙し、ずっと後の「使った瞬間」に無関係な場所で TypeError になります。Java のジェネリクスが不変でワイルドカード(\`List<? extends Animal>\`)を使うのに対し、TS は「共変 + 防御なし」を選んだ、と整理してください。

下のコードは最後の行で実行時エラーになります(それが狙いです)。実行して、型チェックが通るのに壊れる様子を確認してください。`,
      code: `type Animal = { name: string };
type Dog = { name: string; bark(): void };

// 関数型: 引数は「反変」— 部分型の向きが逆転する
let onAnimal: (a: Animal) => void = (a) => console.log(a.name + " が来た");
let onDog: (d: Dog) => void = (d) => d.bark();

onDog = onAnimal; // OK: どんな Animal も扱える関数は Dog も扱える
// onAnimal = onDog; // エラー: Dog 前提の関数に Animal が来ると bark() が無い

// 配列は「共変」— そしてここに穴がある
const dogs: Dog[] = [{ name: "ポチ", bark: () => console.log("ワン!") }];
const animals: Animal[] = dogs; // TS はこれを許す(Java の配列と同じ共変)
animals.push({ name: "タマ" }); // 型上は合法。だが dogs に「bark の無い犬」が混入

// Java なら格納の瞬間に ArrayStoreException。TS は型が消えているので…
dogs.forEach((d) => d.bark()); // ここで初めて実行時 TypeError!`,
    },
    {
      title: '型エラーは最後の行から読む',
      body: `\`javac\` のエラーはたいてい1行ですが、TS のエラーは型の**構造を掘り下げた過程**を丸ごと吐き出すため、複数行・ときに数十行になります。読む順番を知らないと圧倒されますが、構造は常に同じです:

\`\`\`
Argument of type '{ server: { host: string; port: string; }; retries: number; }'
  is not assignable to parameter of type 'ServerConfig'.
  The types of 'server.port' are incompatible between these types.
    Type 'string' is not assignable to type 'number'.
\`\`\`

- **最後の行が根本原因**: string を number の場所に入れた。
- **中間の行が経路**: どこで? → \`server.port\` プロパティ。インデントの深さは「型の構造を掘った深さ」です。
- **先頭の行は事件の現場**: どの代入・呼び出しで起きたか(場所は分かるが、原因はまだ分からない)。

Python 経験者へ: traceback を最後から読む習慣がありますね。あれと同じです。**下から上へ**、原因 → 経路 → 現場の順で読みます。そして基礎編 Ch.1 の鉄則「\`Type 'X' is not assignable to type 'Y'\` の X が実際、Y が要求」は、どの深さの行でも不変です。

エラー本文以外の**補足ヒント**も情報の宝庫です:

- \`Did you mean 'timeout'?\` — typo の検出(excess property check、応用編 Ch.1)
- \`The expected type comes from property 'port' which is declared here.\` — 「要求」側がどこで宣言されたかへのジャンプ台
- union 型(応用編 Ch.2)が絡むと「どの枝でも失敗した」ことを枝ごとに列挙してきます。全部読む必要はなく、**自分が意図した枝**のエラーだけ読めば十分です。

下のコードで、上の例のエラーを実際に発生させて全文を読んでみてください。`,
      code: `type ServerConfig = {
  server: { host: string; port: number };
  retries: number;
};

function connect(config: ServerConfig): void {
  console.log("connect to", config.server.host + ":" + config.server.port);
}

// port を文字列にしてしまった(ありがちなミス)
const raw = {
  server: { host: "localhost", port: "8080" },
  retries: 3,
};

connect(raw); // エラー: カーソルを合わせてメッセージを最後の行から読もう`,
    },
    {
      title: 'エラーの再現を最小化する',
      body: `ジェネリクス(Ch.4)や conditional types(Ch.5)が絡むと、エラーは数十行に膨らみ「最後から読む」だけでは太刀打ちできないことがあります。そこで使うのが、実行時デバッグで print を挟むのと同じ**切り分け**の技術です。

1. **式を分解する** — メソッドチェーンや巨大なオブジェクトリテラルを中間変数に切り出すと、エラーが「どの部分式で発生したか」に局所化されます。中間変数を hover すれば各段階の推論型が見えます。

\`\`\`ts
// Before: 1行に詰まっていてエラーが巨大・どこが悪いのか不明
const result = process(input.map(normalize).filter(isValid));

// After: 分解すれば、どの段階で型がズレたか一目で分かる
const normalized = input.map(normalize);  // hover: ここまでは意図通り?
const valid = normalized.filter(isValid); // hover: ここで型が崩れた!
const result2 = process(valid);           // エラーはここに出るが原因は上流
\`\`\`

2. **期待を注釈で固定する** — 中間変数に「こうなっているはず」の型注釈を書くと、期待と現実のズレが**その行の**小さなエラーとして現れます。二分探索の要領で、注釈を置く位置を動かして原因の行を挟み撃ちにします。

3. **最小再現を作る** — 無関係なプロパティ・分岐・import を削って、エラーが再現する最小のコードを Playground に作ります。削っている途中でエラーが消えたら、直前に削ったものが原因です。他人に質問するときに貼るのもこれです(数十行のエラー全文を貼るより、10行の再現コードのほうが何倍も早く解決します)。

やってはいけないのは \`as any\` で黙らせて先へ進むこと(応用編 Ch.3)。エラーは消えるのではなく、実行時に移動するだけです。型エラーは「コンパイラが見つけてくれたバグ報告」であり、報告者を黙らせてもバグは残ります。`,
    },
  ],
  exercise: {
    instructions: `### 演習: noUncheckedIndexedAccess のエラーを直す

この演習環境では \`noUncheckedIndexedAccess\` が有効です(この章の主題そのもの)。下のコードには添字アクセス起因の型エラーが**2箇所**あります。

- **エラー①** \`counts[w]\` の型は \`number | undefined\`。初出の単語では**実際に** undefined であり、このフラグが無ければコンパイルが通って \`undefined + 1 = NaN\` → 「ts: NaN回」と出力される実バグです。\`??\` でフォールバックして直してください。
- **エラー②** \`sorted[0]\` は空配列の可能性があるため \`[string, number] | undefined\`。narrowing で undefined を除外してください(空なら \`"単語なし"\` などを返せばよい)。

\`!\`(non-null assertion)・\`any\`・\`as\` は禁止。関数のシグネチャ(引数・戻り値の型)は変えないこと。

期待される出力:

\`\`\`
ts: 3回
\`\`\``,
    starter: `// 単語の出現回数を数えて、最頻出の単語を報告する
function countWords(words: string[]): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const w of words) {
    counts[w] = counts[w] + 1; // エラー①: Object is possibly 'undefined'.
  }
  return counts;
}

function report(words: string[]): string {
  const counts = countWords(words);
  const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);
  const top = sorted[0]; // 添字アクセス → [string, number] | undefined
  return top[0] + ": " + top[1] + "回"; // エラー②: 'top' is possibly 'undefined'
}

console.log(report(["ts", "js", "ts", "ts", "js"]));
`,
    check: {
      noErrors: true,
      mustMatch: ['Record<string, number>', 'countWords\\(words: string\\[\\]\\)'],
      forbid: ['\\bany\\b', '\\bas\\b', '\\]\\s*!', '!\\s*\\['],
      output: 'ts: 3回',
    },
  },
  quiz: [
    // ---- easy (d:1) ----
    {
      d: 1,
      type: 'choice',
      prompt: 'tsconfig の `strict: true` について正しい説明は?',
      options: [
        'strictNullChecks や noImplicitAny など複数の個別フラグをまとめて有効にするプリセット(束)である',
        '型チェックを厳しくする単一の独立したチェックである',
        'noUncheckedIndexedAccess を含む、すべての型チェックフラグを有効にする',
        'コンパイル後の JS に実行時の null チェックコードを挿入する',
      ],
      answer: 0,
      explanation: '`strict` は個別フラグの束で、中身を分解して理解するのがこの章の出発点です。単一のチェックではありません。また noUncheckedIndexedAccess は strict に**含まれず**、別途有効化が必要です(この演習環境では有効)。実行時コードの挿入もしません — 型はコンパイル時に消えるので、どのフラグも実行時の挙動には影響しません(type erasure)。',
      review: 'strict は1つのスイッチではない — フラグの束を分解する',
    },
    {
      d: 1,
      type: 'choice',
      prompt: 'この演習環境(noUncheckedIndexedAccess 有効)で、`x` の型は?',
      code: `const xs = [1, 2, 3];
const x = xs[0];`,
      options: [
        'number | undefined',
        'number',
        'number | null',
        'unknown',
      ],
      answer: 0,
      explanation: '添字アクセスは範囲外の可能性があるため、noUncheckedIndexedAccess 下では要素型に undefined が union されます。フラグ無効なら number になりますが、それは「範囲外なら黙って undefined を返す」JS の実態を無視した楽観です。null ではありません — JS の範囲外アクセスが返すのは undefined です(Python の IndexError のような例外も飛びません)。unknown は「何も分からない値」の型で、要素型が分かっている配列には使われません。',
      review: 'noUncheckedIndexedAccess — 添字アクセスは信用しない',
    },
    {
      d: 1,
      type: 'choice',
      prompt: '10行を超える長い型エラーメッセージが出た。まずどこを読むべき?',
      options: [
        '最後の行 — インデントが最も深い行が根本原因を示す',
        '最初の行 — そこにすべての要約が書かれている',
        '中間の行 — 前後は定型文なので飛ばしてよい',
        '読まずに再コンパイルする — 長いエラーは一時的なもの',
      ],
      answer: 0,
      explanation: 'TS のエラーは「現場(先頭)→ 経路(中間)→ 根本原因(最後)」の構造で、Python の traceback と同じく下から読むのが鉄則です。先頭行は巨大な型がまるごと引用されるため「どこで起きたか」しか分かりません。中間行は原因への経路(どのプロパティを掘ったか)なので、飛ばしてよいどころか2番目に重要です。再コンパイルで消えることはありません — 型エラーは決定的(deterministic)です。',
      review: '型エラーは最後の行から読む',
    },
    // ---- medium (d:2) ----
    {
      d: 2,
      type: 'choice',
      prompt: '次のコードの A・B の問題を検出するフラグの組み合わせとして正しいのは?',
      code: `declare function getName(): string | null;

function firstChar(s) {        // A: 引数 s に注釈がない
  return s[0];
}

const userName = getName();
console.log(userName.length);  // B: null かもしれない値のプロパティ参照`,
      options: [
        'A は noImplicitAny、B は strictNullChecks が検出する',
        'A は strictNullChecks、B は noImplicitAny が検出する',
        'A も B も strictFunctionTypes が検出する',
        'A は noUncheckedIndexedAccess、B は noImplicitAny が検出する',
      ],
      answer: 0,
      explanation: 'A は注釈のない引数が暗黙の any に落ちるケースで noImplicitAny の担当(「Parameter \'s\' implicitly has an \'any\' type」)。B は null かもしれない値の参照で strictNullChecks の担当(「\'userName\' is possibly \'null\'」)。strictFunctionTypes は関数型の代入時の引数チェック(反変)を担当し、どちらにも関係しません。noUncheckedIndexedAccess は添字アクセスの undefined を守るフラグで、A の暗黙 any は検出できません。フラグと守備範囲の対応を知っていると、エラーメッセージからどの設定の仕事かを逆引きできます。',
      review: 'strict は1つのスイッチではない — フラグの束を分解する',
    },
    {
      d: 2,
      type: 'choice',
      prompt: 'strictFunctionTypes 有効(この演習環境)のとき、① と ② のどちらがエラーになる?',
      code: `type Animal = { name: string };
type Dog = { name: string; bark(): void };

let f: (a: Animal) => void = (a) => console.log(a.name);
let g: (d: Dog) => void = (d) => d.bark();

f = g; // ①
g = f; // ②`,
      options: [
        '① のみエラー(Dog 前提の g に Animal が渡ると bark() が無い)',
        '② のみエラー(Animal 用の f を Dog 用の場所に入れるのは型の縮小)',
        '両方エラー(引数の型が一致しない代入はすべて不可)',
        'どちらも通る(Dog は Animal の部分型なので相互に代入できる)',
      ],
      answer: 0,
      explanation: '引数は反変です。② の f はどんな Animal でも扱えるので、Dog しか来ない場所に置いても安全 — これは通ります。① の g は bark() を呼ぶ可能性があり、Animal(bark を持たない)が渡ると壊れるのでエラーです。「Dog は Animal の部分型だから Dog 側の関数が代入できるはず」という Java 的な共変の直感は、引数の位置では逆転します。「両方エラー(不変)」は Java のジェネリクスの挙動で、TS の関数引数はそこまで厳しくありません。',
      review: '関数の引数は反変 — そして配列の共変性という穴',
    },
    {
      d: 2,
      type: 'choice',
      prompt: '次のエラーメッセージが出た。直すべき箇所として正しいのは?',
      code: `// Argument of type '{ server: { host: string; port: string; }; retries: number; }'
//   is not assignable to parameter of type 'ServerConfig'.
//   The types of 'server.port' are incompatible between these types.
//     Type 'string' is not assignable to type 'number'.`,
      options: [
        '渡したオブジェクトの server.port が string("8080" など)になっている。number に直す',
        'オブジェクト全体の形が ServerConfig と違うので、最初から作り直す必要がある',
        'retries の型が number で合っていない',
        'ServerConfig 型の引数の個数が足りていない',
      ],
      answer: 0,
      explanation: '最後の行が根本原因(string を number の場所に入れた)、中間行が経路(server.port プロパティ)、先頭行は現場です。下から読めば「server.port を number に直す」と一意に特定できます。先頭行だけ見て「オブジェクト全体が違う」と作り直すのは典型的な読み間違いで、実際に違うのは1プロパティだけです。retries はエラーメッセージのどこにも登場しません(先頭行の引用に含まれているのは「現物の型を丸ごと引用しているから」で、問題があるという意味ではない)。引数の個数の問題なら「Expected N arguments, but got M」という別のメッセージになります。',
      review: '型エラーは最後の行から読む',
    },
    {
      d: 2,
      type: 'choice',
      prompt: '次のコードで `r.value` の行に「Property \'value\' does not exist on type \'Result\'. Property \'value\' does not exist on type \'{ ok: false; error: string; }\'.」というエラーが出た。2行目が示している正しい修正方針は?',
      code: `type Result =
  | { ok: true; value: number }
  | { ok: false; error: string };

declare function parse(s: string): Result;

const r = parse("42");
console.log(r.value); // エラー`,
      options: [
        'union の一方(ok: false の枝)に value が無いのが原因。`if (r.ok)` で narrowing してから value を使う',
        'Result 型の両方の枝に value プロパティを追加して、常にアクセスできるようにする',
        '`(r as { ok: true; value: number }).value` とアサーションして枝を確定させる',
        '`console.log(r.value ?? 0)` に変えて undefined の場合に備える',
      ],
      answer: 0,
      explanation: 'エラーの2行目は「union のどの枝で失敗したか」を教えてくれています。ok: false の枝に value が無いのだから、discriminated union の定石(応用編 Ch.2)どおり `if (r.ok)` で narrowing するのが正解です。両方の枝に value を足すのは「失敗時にも value がある」ことになり設計の破壊。as は失敗ケースを黙殺するだけで、実際に ok: false だった場合 value は undefined になり実行時バグ(応用編 Ch.3)。`??` は型エラーの解決になりません — value プロパティが型上存在しない以上、`r.value` と書いた時点でエラーです。',
      review: '型エラーは最後の行から読む',
    },
    {
      d: 2,
      type: 'choice',
      prompt: 'ジェネリクスの絡む数十行の型エラーが出て、最後の行を読んでも原因の場所が分からない。「次の一手」として最も有効なのは?',
      options: [
        'エラーが出た式を中間変数に分解し、各段階の推論型を hover で確認して、どこで型がズレたかを絞り込む',
        '`as any` を挟んでエラーを消し、実行して動作を確認する',
        'tsconfig の strict を一時的に false にして、エラーが減るかどうかを見る',
        'エラーの先頭行に書かれた2つの型を交換してみる',
      ],
      answer: 0,
      explanation: '長いエラーには実行時デバッグと同じ「切り分け」で挑みます。式を分解すればエラーが部分式に局所化され、hover で「どの段階までは意図通りか」を二分探索できます。`as any` はエラーを消すのではなく実行時に移動させるだけ(応用編 Ch.3)。strict を切るのは全チェックの放棄であり、原因特定には繋がらないうえチームの tsconfig を触るのは論外です。先頭行は「現場」の型を丸ごと引用しているだけなので、そこに書かれた型を機械的に交換しても原因(最後の行)には対処できません。',
      review: 'エラーの再現を最小化する',
    },
    // ---- hard (d:3) ----
    {
      d: 3,
      type: 'code',
      prompt: '`logger: Logger = logStr` の行に反変性のエラーが出ています。**Logger 型と最後の3行は変えずに**、logStr の実装を修正してください。`typeof` による narrowing を使い、string なら大文字化して出力、number ならそのまま出力すること(any / as 禁止)。',
      starter: `// Logger は string と number の両方を受け取れる必要がある
type Logger = (msg: string | number) => void;

const logStr = (msg: string) => console.log(msg.toUpperCase());

const logger: Logger = logStr; // エラー: 引数の反変性に違反

logger("hello");
logger(42);
`,
      check: {
        noErrors: true,
        mustMatch: ['typeof', 'const logger: Logger = logStr'],
        forbid: ['\\bany\\b', '\\bas\\b'],
        output: 'HELLO\n42',
      },
      explanation: 'Logger が要求する `string | number` に対し、logStr は string しか受け取れない — 引数は反変なので、代入するには logStr の引数を**広げる**必要があります。`(msg: string | number) => { if (typeof msg === "string") { console.log(msg.toUpperCase()); } else { console.log(msg); } }` のように、引数を union で受けて typeof で narrowing(応用編 Ch.2)すれば、string 側の枝では toUpperCase が安全に呼べます。変性(この章)と narrowing(Ch.2)の合わせ技で、「呼び出され得るすべての入力を扱えるようにしてから代入する」のが反変性への正しい応答です。',
      review: '関数の引数は反変 — そして配列の共変性という穴',
    },
    {
      d: 3,
      type: 'choice',
      prompt: 'Java では `Animal[] animals = dogs;` のあと不正な要素を格納すると ArrayStoreException が実行時に飛ぶ。次の TS コードの挙動として正しいのは?',
      code: `type Animal = { name: string };
type Dog = { name: string; bark(): void };

const dogs: Dog[] = [{ name: "ポチ", bark: () => {} }];
const animals: Animal[] = dogs; // TS はこれを許す
animals.push({ name: "タマ" });
dogs.forEach((d) => d.bark());`,
      options: [
        'push は型チェックも実行時チェックも通り、forEach 内の d.bark() が実行時 TypeError で落ちる',
        'push の行で実行時例外が飛ぶ(Java の ArrayStoreException と同様)',
        '`const animals: Animal[] = dogs` の行がコンパイルエラーになる',
        'forEach の行がコンパイルエラーになる(d が Animal に widening されるため)',
      ],
      answer: 0,
      explanation: 'TS の配列は共変なので代入は通り(Array のメソッドがメソッド記法で宣言されており bivariant にチェックされるため)、push も Animal[] への Animal の追加として型上合法です。しかし型は実行時に消えている(基礎編 Ch.1)ので、Java と違って配列は自分の要素型を覚えておらず、格納の瞬間に守ってくれる ArrayStoreException に相当するものは**存在しません**。壊れたデータは沈黙して混入し、離れた場所で「使った瞬間」に TypeError になります — 混入箇所と爆発箇所が離れるのが型消去世界の怖さです。代入がコンパイルエラーになる(不変)のは Java のジェネリクス(List<Dog> → List<Animal> 不可)の挙動で、TS の配列はそちらを選びませんでした。forEach の d は Dog のままで widening は起きません。',
      review: '関数の引数は反変 — そして配列の共変性という穴',
    },
    {
      d: 3,
      type: 'choice',
      prompt: 'strict + noUncheckedIndexedAccess のこの演習環境でも、次のコードは**一切エラーにならない**。正しい説明と対処は?',
      code: `const data = JSON.parse(text);
const port: number = data.config.port; // エラーも警告も出ない`,
      options: [
        'JSON.parse は any を返し、any はすべてのフラグを素通りする。unknown で受けて narrowing またはスキーマ検証(zod 等)してから使うべき',
        '`JSON.parse(text) as Config` と書き換えれば、コンパイル時も実行時も安全になる',
        'noUncheckedIndexedAccess が data.config へのアクセスを undefined チェックしてくれるので、実はこのままで安全',
        '`const data: Config = JSON.parse(text)` と型注釈を付ければ、実行時に Config の形かどうか検証される',
      ],
      answer: 0,
      explanation: '応用編の総まとめです。JSON.parse の戻り値は any(Ch.3)で、any には noUncheckedIndexedAccess を含む**どのフラグも作用しません** — strict を固めても any の混入点が防御線の穴になります。正解は境界で unknown として受け、narrowing か zod などのスキーマ検証(Ch.6)を通すこと。`as Config` はコンパイラを黙らせるだけで実行時検証はゼロ(Ch.3 — Java のキャストと違い実行時チェックがない)。型注釈も同じく実行時には消える(type erasure、基礎編 Ch.1)ので何も検証されません。noUncheckedIndexedAccess は「型が分かっている」配列や index signature への添字アクセスを守るフラグで、any には無力です。',
      review: 'strict は1つのスイッチではない — フラグの束を分解する',
    },
    {
      d: 3,
      type: 'choice',
      prompt: '① は「Object literal may only specify known properties, but \'timeOut\' does not exist in type \'Options\'. Did you mean to write \'timeout\'?」というエラーになり、② は通る。この挙動の正しい説明は?',
      code: `type Options = { url: string; timeout?: number; retries?: number };
declare function connect(opts: Options): void;

connect({ url: "db://x", timeOut: 3000 });   // ① エラー
const o = { url: "db://x", timeOut: 3000 };
connect(o);                                  // ② 通ってしまう`,
      options: [
        '① はオブジェクトリテラル直渡しにだけ働く excess property check。② は変数経由なので通常の構造的部分型判定に戻り、余分なプロパティを持つ o も Options に適合する — timeout は未設定のまま typo が沈黙する',
        '② もエラーになるはずで、通るのは TS のバージョンが古いバグである',
        '① のエラーは `as Options` を付けて黙らせるのが正しい解決である',
        'プロパティ名の大文字小文字は無視して照合されるので、①②とも timeout が 3000 に設定される',
      ],
      answer: 0,
      explanation: '応用編 Ch.1 の excess property check の総復習です。オブジェクトリテラルを**直接**渡すときだけ TS は「余分なプロパティ」を疑い、"Did you mean" ヒント付きで typo を検出してくれます。変数を経由すると通常の構造的部分型判定に戻ります: o は url を持つので Options の部分型として適合し、余分な timeOut は問題視されません — timeout は undefined のままで、typo は実行時まで沈黙します(②のほうが危険)。バージョンによるバグではなく仕様です。`as Options` は①のエラーを黙らせますが typo というバグはそのまま残るので、エラーメッセージの Did you mean ヒントに従って直すのが正解。プロパティ名の照合は大文字小文字を区別します。',
      review: '型エラーは最後の行から読む',
    },
  ],
});
