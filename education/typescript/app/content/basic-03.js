// 基礎編 Ch.3 — 非同期
window.COURSE.register({
  id: 'basic-03',
  part: 'basic',
  title: '非同期 — スレッドではなくイベントループ',
  minutes: 40,
  goal: 'シングルスレッド + イベントループという JS の実行モデルを理解し、Promise / async / await / Promise.all を使った小さな API クライアントを strict モードで書ける。await 忘れを型エラーとして読み取れる。',
  sections: [
    {
      title: 'スレッドは無い — イベントループという実行モデル',
      body: `Java でサーバーを書くなら、並行処理の基本はスレッドです(\`new Thread\`、\`ExecutorService\`、そして \`synchronized\` やロック)。Python にも \`threading\` はありますが、GIL のせいで CPU 処理は同時に1スレッドしか進みません。

JavaScript はさらに割り切っています。**あなたのコードを実行するスレッドは、最初から1本しかありません**。並行処理は「イベントループ」という仕組みで実現します。

- 同期コードは**最後まで中断されずに**実行されます(run-to-completion)。実行中に他のコードが割り込んで変数を書き換えることは起こりえないので、ロックも \`synchronized\` も存在しません
- I/O やタイマーは「終わったら呼んでほしい関数(コールバック)」を登録して、**待たずに即座に**次へ進みます
- 登録されたコールバックは、実行中の同期コードが終わってからキュー経由で実行されます

キューには優先度の違う2種類があります。実行順は常にこうです:

1. **同期コード** — 今走っているコードが最後まで
2. **マイクロタスク** — Promise のコールバック(\`then\` / \`await\` の続き)。溜まっていれば**全部**
3. **マクロタスク** — \`setTimeout\` などのコールバックを1つ。その後またマイクロタスクへ

Java 経験者へ: \`Thread.sleep\` に相当する「ブロックして待つ」手段はありません。\`setTimeout\` は sleep ではなく「後で呼んで」という**予約**で、呼び出し自体は一瞬で戻ります。

Python 経験者へ: \`asyncio\` のイベントループと同じモデルです。ただし JS ではループは常に動いていて \`asyncio.run()\` のような起動は不要。「同期の世界と非同期の世界」の分断もなく、すべてのコードがこの1本のループの上で動きます。

下のコードで順序を体感してください。\`setTimeout(..., 0)\` ですら同期コードより後になります。`,
      code: `console.log("1: 同期コードが最初に最後まで走る");

setTimeout(() => {
  console.log("4: マクロタスク(setTimeout)は最後。0ms 指定でも同期より先には走らない");
}, 0);

Promise.resolve().then(() => {
  console.log("3: マイクロタスク(Promise の then)は同期コードの直後");
});

console.log("2: 同期コードが続く");`,
    },
    {
      title: 'Promise — 三状態と then チェーン',
      body: `Promise は「未来のどこかで**1回だけ**決まる値」の入れ物です。Java の \`CompletableFuture\`、Python の \`asyncio\` の Future/Task に相当します。状態はちょうど3つ:

- **pending** — まだ決まっていない
- **fulfilled** — 値を持って成功した
- **rejected** — エラーを持って失敗した

pending から fulfilled か rejected のどちらかに一度遷移したら(settled)、**二度と変わりません**。また、標準の Promise にキャンセルはありません — Java の \`Future.cancel()\` の感覚は持ち込めません。

Java との決定的な違いは、\`Future.get()\` のような「**ブロックして値を取り出す**」手段が存在しないことです。スレッドが1本しかないので、ブロックしたらイベントループごと止まってしまうからです。できるのは \`then\` でコールバックを**登録する**ことだけです。

- \`then\` は**新しい Promise を返す**ので、チェーンできます
- \`then\` の中で Promise を返すと、それが解決するまで次の \`then\` は待ちます
- チェーンのどこで失敗しても、エラーは最初の \`catch\` まで流れます

この演習環境はネットワークが遮断されているので、\`setTimeout\` で API 呼び出しを模擬した \`fakeFetchUser\` を使います(実物の \`fetch\` は次の節で紹介します)。`,
      code: `type User = { id: number; name: string };

// setTimeout で「100ms かかる API 呼び出し」を模擬
function fakeFetchUser(id: number): Promise<User> {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (id >= 1) {
        resolve({ id, name: "ユーザー" + id });
      } else {
        reject(new Error("不正な ID: " + id));
      }
    }, 100);
  });
}

fakeFetchUser(1)
  .then((user) => {
    console.log("取得:", user.name);
    return fakeFetchUser(user.id + 1); // Promise を返すと、次の then はそれを待つ
  })
  .then((next) => console.log("続けて取得:", next.name))
  .catch((err) => console.log("どこかで失敗:", err));
// fakeFetchUser(1) を fakeFetchUser(-1) に変えて catch に流れるのを確認してみよう`,
    },
    {
      title: 'async / await と try/catch',
      body: `\`then\` チェーンは動きますが、分岐やループが絡むと読みにくくなります。そこで \`async\` / \`await\` — 見た目は Python の \`asyncio\` とほぼ同じです。

- \`async\` 関数の \`return\` 値は**自動で Promise に包まれます**(\`return "a"\` なら戻り値の型は \`Promise<string>\`)
- \`await\` は Promise が settled になるまで**その関数の実行だけ**を中断します。スレッドはブロックされず、その間イベントループは他の仕事を進めます
- \`await\` した Promise が fulfilled なら値が返り、rejected なら**例外として throw** されます。だから同期コードと同じ \`try/catch\` がそのまま使えます
- async 関数は呼び出されると**最初の \`await\` までは同期的に**実行され、続きはマイクロタスクとして再開されます(確認テストで問います)

2つ、Java/Python の直感と違う注意点があります。

1. strict モードでは \`catch (err)\` の \`err\` は \`unknown\` 型です。Java の \`catch (IOException e)\` のように型を指定できません(throw は何でも投げられるため)。\`err instanceof Error\` で絞ってから \`.message\` を読みます
2. \`await\` を付けずに呼んだ Promise の失敗は、\`try/catch\` では**捕まりません**(catch ブロックを抜けた後に rejection が起きるため)

実際の API クライアントでは、ブラウザ / Node 組み込みの \`fetch\` を使います:

\`\`\`ts
// 参考: 実物の fetch(この演習環境ではネットワーク不可のため動かない)
async function loadUser(id: number): Promise<unknown> {
  const res = await fetch("https://api.example.com/users/" + id);
  if (!res.ok) {
    throw new Error("HTTP " + res.status);
  }
  return res.json(); // res.json() も Promise を返す
}
\`\`\`

\`res.json()\` の戻り値の型が何になるのか — この不穏な問いは応用編 Ch.6 で回収します(型はランタイムに存在しない、を思い出してください)。

もう1つ環境の話: この演習環境ではトップレベル(関数の外)で \`await\` は使えません。**\`async function main() { ... }\` を定義して最後に \`main();\` で起動する**のが定石です。演習でもこの形を使います。`,
      code: `type User = { id: number; name: string };

function fakeFetchUser(id: number): Promise<User> {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (id >= 1) {
        resolve({ id, name: "ユーザー" + id });
      } else {
        reject(new Error("不正な ID: " + id));
      }
    }, 100);
  });
}

// トップレベル await は使えないので main に包んで起動する
async function main(): Promise<void> {
  try {
    const user = await fakeFetchUser(1);
    console.log("取得:", user.name);
    await fakeFetchUser(-1); // ここで reject → 例外として throw され catch へ
    console.log("この行は実行されない");
  } catch (err) {
    // strict では err は unknown 型。instanceof で絞ってから使う
    if (err instanceof Error) {
      console.log("捕捉:", err.message);
    }
  }
}
main();`,
    },
    {
      title: 'Promise.all — 並行実行と直列 await の罠',
      body: `\`await\` は便利すぎて、罠が1つあります。**互いに独立な処理を \`await\` で並べると、所要時間が足し算になる**のです。

\`\`\`ts
const a = await fakeFetchUser(1); // 100ms 待つ
const b = await fakeFetchUser(2); // さらに 100ms 待つ → 合計 200ms
\`\`\`

Promise は**作られた瞬間に走り出す**ので、先に全部作ってからまとめて待てば同時に進みます。それをやってくれるのが \`Promise.all\` です。Java の \`CompletableFuture.allOf\` / \`invokeAll\`、Python の \`asyncio.gather\` に相当しますが、**結果の型がタプルとして保たれる**のが TS らしいところです:

- \`Promise.all([Promise<A>, Promise<B>])\` を \`await\` すると \`[A, B]\` が得られる
- 1つでも rejected になると、**全体が即座に reject** します(fail-fast)。成功していた分の結果は捨てられます
- 失敗も含めて全部の結果が欲しいなら \`Promise.allSettled\`(紹介のみ)

注意: この「並行」はスレッド並列ではありません。1本のスレッドが**待ち時間を重ねている**だけです。I/O 待ちには絶大な効果がありますが、CPU を使う重い計算は速くなりません — この性質は Python の \`asyncio\` とまったく同じです。`,
      code: `function delay(ms: number, label: string): Promise<string> {
  return new Promise((resolve) => {
    setTimeout(() => resolve(label), ms);
  });
}

async function main(): Promise<void> {
  // 直列: await を並べると足し算(約 200ms)
  const t1 = Date.now();
  await delay(100, "a");
  await delay(100, "b");
  console.log("直列:", Date.now() - t1, "ms くらい");

  // 並行: 先に走らせてまとめて待つ(約 100ms)
  const t2 = Date.now();
  const [x, y] = await Promise.all([delay(100, "x"), delay(100, "y")]);
  console.log("並行:", x, y, Date.now() - t2, "ms くらい");
}
main();`,
    },
    {
      title: 'await 忘れ — Promise<string> は string ではない',
      body: `Python で \`await\` を忘れるとどうなるか、覚えていますか? 実行時に \`RuntimeWarning: coroutine 'f' was never awaited\` — つまり**実行するまで気づけません**。

TS では \`Promise<string>\` と \`string\` は**別の型**なので、await 忘れの多くは**コンパイル時に**捕まります。典型的なエラーメッセージは2パターン:

\`\`\`
Property 'toUpperCase' does not exist on type 'Promise<string>'
\`\`\`

Promise のまま中身のメソッドを呼ぼうとした形。そして:

\`\`\`
Type 'Promise<string>' is not assignable to type 'string'
\`\`\`

Promise のまま \`string\` を要求する場所に渡した形。Ch.1 で学んだ「前が実際、後ろが要求」で読めば、**実際に持っているのは Promise(まだ届いていない包み)**だと分かります。親切なことに、TS はエラーの末尾に \`Did you forget to use 'await'?\` と直接聞いてくることもあります。

ただし型チェックも万能ではありません。**戻り値を使わない**呼び出し(\`boom();\` とだけ書いて await しない)は型エラーになりません。失敗しても \`try/catch\` に掛からず「未処理の rejection」として漏れる罠で、確認テストで扱います。

下のコードでエラーを実際に見てください(1つ目の \`console.log\` が**意図的にエラーになる例**です)。`,
      code: `async function fetchTitle(): Promise<string> {
  return "event loop"; // async 関数の return 値は自動で Promise<string> に包まれる
}

async function main(): Promise<void> {
  const title = fetchTitle(); // await を忘れた! title の型は Promise<string>
  console.log(title.toUpperCase()); // エラー: Property 'toUpperCase' does not exist on type 'Promise<string>'

  const ok = await fetchTitle(); // ok の型は string
  console.log(ok.toUpperCase()); // こちらは OK
}
main();`,
    },
  ],
  exercise: {
    instructions: `### 演習: 疑似 API クライアントを書く

\`setTimeout\` で API を模擬した \`fakeFetchUser\`(1回約 100ms)が用意してあります。**この関数は変更せず**、その下に \`async function main\` を実装して、最後に \`main();\` で起動してください。main の中でやることは3つ:

1. \`fakeFetchUser(1)\` を \`await\` で取得し、その \`name\` を出力する
2. \`fakeFetchUser(2)\` と \`fakeFetchUser(3)\` を **\`Promise.all\` で同時に**取得し、\`ユーザー2 と ユーザー3\` の形式で**1行に**出力する
3. \`fakeFetchUser(0)\` を \`try/catch\` で囲んで呼び、失敗を捕捉して \`エラー: \` + エラーメッセージを出力する(strict では catch の変数は \`unknown\` 型 — \`instanceof Error\` で絞ること)

期待される出力:

\`\`\`
ユーザー1
ユーザー2 と ユーザー3
エラー: ID は 1 以上: 0
\`\`\``,
    starter: `// ---- 疑似 API(この部分は変更しない)----
type User = { id: number; name: string };

function fakeFetchUser(id: number): Promise<User> {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (id >= 1) {
        resolve({ id, name: "ユーザー" + id });
      } else {
        reject(new Error("ID は 1 以上: " + id));
      }
    }, 100);
  });
}

// ---- ここから下を実装する ----
// async function main を定義し、最後に main(); で起動すること
`,
    check: {
      noErrors: true,
      mustMatch: [
        'async function main',
        '\\bawait\\b',
        'Promise\\.all\\(',
        '\\btry\\b',
        'fakeFetchUser\\(0\\)',
        'main\\(\\);',
      ],
      forbid: ['\\bany\\b', '\\bas\\b'],
      output: 'ユーザー1\nユーザー2 と ユーザー3\nエラー: ID は 1 以上: 0',
    },
  },
  quiz: [
    // ---- easy (d:1) ----
    {
      d: 1,
      type: 'choice',
      prompt: 'Promise が取りうる3つの状態の正しい組み合わせは?',
      options: [
        'pending / fulfilled / rejected',
        'pending / resolved / cancelled',
        'waiting / done / failed',
        'created / running / completed',
      ],
      answer: 0,
      explanation: 'Promise は pending(未確定)から fulfilled(成功)か rejected(失敗)のどちらかに一度だけ遷移し、以後変わりません(settled)。標準の Promise にキャンセルは存在しないので cancelled を含む選択肢は誤り — Java の Future.cancel() の感覚は通用しません。waiting/done や created/running はスレッドやジョブ実行の用語で、Promise の状態名ではありません。',
      review: 'Promise — 三状態と then チェーン',
    },
    {
      d: 1,
      type: 'choice',
      prompt: 'JavaScript の実行モデルについて正しい説明はどれ?',
      options: [
        'コードを実行するスレッドは1本で、実行中の同期コードに他のコールバックが割り込むことはない',
        'Python と同様、GIL によって同時実行が制限されているだけで、スレッド自体は複数ある',
        'setTimeout はコールバック実行用の新しいスレッドを起動する',
        'Java と同様、開発者が明示的にスレッドを起動して並行処理を書くのが基本である',
      ],
      answer: 0,
      explanation: 'JS はシングルスレッド + イベントループです。同期コードは最後まで中断されずに走る(run-to-completion)ため、ロックや synchronized が言語に存在しません。GIL は「複数スレッドの実行を絞る」Python の仕組みで、そもそもスレッドが1本の JS とはモデルが違います。setTimeout はスレッドを作らず、コールバックをマクロタスクとして予約するだけです。',
      review: 'スレッドは無い — イベントループという実行モデル',
    },
    {
      d: 1,
      type: 'choice',
      prompt: '次の関数 `f` の戻り値の型は?',
      code: `async function f() {
  return "hello";
}`,
      options: ['Promise<string>', 'string', 'Promise<void>', 'unknown'],
      answer: 0,
      explanation: 'async 関数の return 値は自動で Promise に包まれるため、`return "hello"` なら戻り値の型は Promise<string> です。string と答えると await 忘れの型エラー(Promise<string> is not assignable to string)を読めなくなります。Promise<void> は return が無い(または値なし)場合、unknown は推論放棄の型でここでは出てきません。',
      review: 'await 忘れ — Promise<string> は string ではない',
    },
    // ---- medium (d:2) ----
    {
      d: 2,
      type: 'choice',
      prompt: '次のコードの出力順は?',
      code: `console.log("A");
setTimeout(() => console.log("B"), 0);
Promise.resolve().then(() => console.log("C"));
console.log("D");`,
      options: ['A → D → C → B', 'A → B → C → D', 'A → D → B → C', 'A → C → D → B'],
      answer: 0,
      explanation: '実行順は「同期 → マイクロタスク → マクロタスク」。まず同期コードが最後まで走り(A, D)、次にマイクロタスク(Promise の then: C)、最後にマクロタスク(setTimeout: B)です。0ms 指定でも setTimeout が同期コードや then より先に走ることはありません。A→B→C→D は「書いた順に待つ」という誤解、A→D→B→C はマイクロタスクとマクロタスクの優先順位が逆です。',
      review: 'スレッドは無い — イベントループという実行モデル',
    },
    {
      d: 2,
      type: 'choice',
      prompt: '次のコードをコンパイルするとどうなる?',
      code: `async function getMessage(): Promise<string> {
  return "hi";
}

async function main(): Promise<void> {
  const msg: string = getMessage();
  console.log(msg);
}
main();`,
      options: [
        'コンパイルエラー: Type \'Promise<string>\' is not assignable to type \'string\'(await 忘れ)',
        '正常にコンパイルされ、"hi" と出力される',
        '正常にコンパイルされ、"[object Promise]" と出力される',
        'コンパイルエラー: async 関数を await なしで呼ぶこと自体が禁止されている',
      ],
      answer: 0,
      explanation: 'getMessage() の戻り値は Promise<string> で、string を要求する msg には代入できません。「前が実際、後ろが要求」— 実際に持っているのはまだ届いていない Promise です。await を付ければ直ります。素の JS なら Promise がそのまま出力されて実行時まで気づけませんが、TS は型でコンパイル時に止めてくれます。なお await なしで async 関数を呼ぶこと自体は合法です(だからこそ型で捕まえる価値があります)。',
      review: 'await 忘れ — Promise<string> は string ではない',
    },
    {
      d: 2,
      type: 'choice',
      prompt: '`fakeFetchUser` は1回あたり約 100ms かかる。次のコード(async 関数内)の所要時間に最も近いのは?',
      code: `const users = await Promise.all([
  fakeFetchUser(1),
  fakeFetchUser(2),
  fakeFetchUser(3),
]);`,
      options: [
        '約 100ms — 3つの Promise は作られた時点で同時に走り出す',
        '約 300ms — Promise.all は配列の先頭から順に実行する',
        'スレッドプールのサイズに依存する',
        '約 100ms だが、3つのスレッドで並列実行されるため CPU 負荷が3倍になる',
      ],
      answer: 0,
      explanation: 'Promise は作られた瞬間に走り出すので、配列リテラルの時点で3つの待ち時間が重なり、全体は約 100ms です。Promise.all は「順に実行する」のではなく「全部の完了を待つ」だけです。スレッドプールもスレッド並列もありません — 1本のスレッドが待ち時間を重ねているだけで、これは Python の asyncio.gather と同じ性質です。',
      review: 'Promise.all — 並行実行と直列 await の罠',
    },
    {
      d: 2,
      type: 'choice',
      prompt: '次のコードの出力は?',
      code: `Promise.resolve(2)
  .then((n) => n * 3)
  .then((n) => n + 1)
  .then((n) => console.log(n));`,
      options: ['7', '6', '2', 'Promise { 7 }'],
      answer: 0,
      explanation: 'then は「前の then の戻り値」を持った新しい Promise を返すため、値が 2 → 6 → 7 とチェーンを流れて 7 が出力されます。6 は最後の +1 を見落とし、2 は「then は元の Promise の値を毎回渡す」という誤解です。Promise { 7 } が出るのは console.log(promise) と Promise 自体を出力した場合で、then のコールバックには中身の値が渡ってきます。',
      review: 'Promise — 三状態と then チェーン',
    },
    // ---- hard (d:3) ----
    {
      d: 3,
      type: 'choice',
      prompt: '次のコードを実行するとどうなる?(コンパイルは通る)',
      code: `async function boom(): Promise<void> {
  throw new Error("失敗");
}

function run(): void {
  try {
    boom();
  } catch (err) {
    console.log("捕捉した");
  }
  console.log("終了");
}
run();`,
      options: [
        '"終了" だけが出力される。エラーは catch されず、未処理の rejection になる',
        '"捕捉した" → "終了" の順に出力される',
        '"終了" → "捕捉した" の順に出力される',
        '何も出力されず、throw の時点でプログラムが停止する',
      ],
      answer: 0,
      explanation: 'async 関数の中の throw は同期的な例外にはならず、rejected な Promise が返るだけです。boom() を await していないので、try ブロックは何事もなく通過し、rejection は catch ブロックが終わった後に「未処理」として漏れます。捕捉するには run を async にして await boom() と書く必要があります。「終了 → 捕捉した」もありえません — catch ブロックが後から実行されることはありません。戻り値を使わない await 忘れは型エラーにもならない、型チェックの死角です。',
      review: 'async / await と try/catch',
    },
    {
      d: 3,
      type: 'choice',
      prompt: '次のコードの出力順は?',
      code: `async function main(): Promise<void> {
  console.log("B");
  await Promise.resolve();
  console.log("D");
}

console.log("A");
main();
console.log("C");`,
      options: ['A → B → C → D', 'A → C → B → D', 'A → B → D → C', 'B → A → C → D'],
      answer: 0,
      explanation: 'async 関数は呼び出された瞬間から最初の await までは同期的に実行されます(A の後すぐ B)。await で中断すると制御が呼び出し元に戻り(C)、await の続きはマイクロタスクとして同期コード完了後に再開されます(D)。A→C→B→D は「async 関数は全体が後で実行される」という誤解、A→B→D→C は「await はその場でブロックして待つ」という Java の Future.get 的な誤解です。',
      review: 'async / await と try/catch',
    },
    {
      d: 3,
      type: 'choice',
      prompt: '`fakeFetchUser(-1)` だけが reject する(各 100ms)。次のコード(async 関数の try 内)の挙動として正しいのは?',
      code: `const results = await Promise.all([
  fakeFetchUser(1),
  fakeFetchUser(-1),
  fakeFetchUser(2),
]);
console.log(results.length);`,
      options: [
        'Promise.all 全体が reject して例外が throw され、console.log は実行されない。成功した2件の結果は得られない',
        '成功した2件だけを含む配列が返り、"2" と出力される',
        '失敗は undefined として配列に入り、"3" と出力される',
        '最初の1件が失敗した時点で、残りの Promise の実行がキャンセルされる',
      ],
      answer: 0,
      explanation: 'Promise.all は fail-fast です。1つでも reject すると全体が即座に reject し、await 地点で例外が throw されるため、成功していた分の結果は捨てられます。成功分だけ返す・undefined で埋めるという動作はありません(Python の asyncio.gather(return_exceptions=True) のような救済オプションも Promise.all にはなく、全結果が欲しければ Promise.allSettled を使います)。また Promise にキャンセルは無いので、残りの Promise 自体は裏で走り続けます — 「実行がキャンセルされる」も誤りです。',
      review: 'Promise.all — 並行実行と直列 await の罠',
    },
    {
      d: 3,
      type: 'code',
      prompt: '次のコードには await 忘れによる型エラーが1箇所あります。`.then` を使わずに修正し、出力が `EVENT LOOP` になるようにしてください。',
      starter: `function fakeFetchTitle(): Promise<string> {
  return new Promise((resolve) => {
    setTimeout(() => resolve("event loop"), 100);
  });
}

async function main(): Promise<void> {
  const title = fakeFetchTitle();
  console.log(title.toUpperCase());
}
main();
`,
      check: {
        noErrors: true,
        mustMatch: ['\\bawait\\b', 'toUpperCase'],
        forbid: ['\\bany\\b', '\\bas\\b', '\\.then\\('],
        output: 'EVENT LOOP',
      },
      explanation: 'title の型が Promise<string> のままなので toUpperCase が呼べません(Property \'toUpperCase\' does not exist on type \'Promise<string>\')。`const title = await fakeFetchTitle();` と await を付ければ title は string になり、エラーが消えて実行結果も正しくなります。main が async 関数なのは await を使うための前提条件です。',
      review: 'await 忘れ — Promise<string> は string ではない',
    },
  ],
});
