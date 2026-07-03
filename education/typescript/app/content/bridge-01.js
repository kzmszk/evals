// 橋渡し章 — React プレビュー
// この章は確認テスト・演習なし(モチベーション設計の章)。quiz / exercise フィールドは意図的に持たない。
// React/JSX はこのアプリの実行環境では動かないため、コード例はすべて body 内の fenced code block で示す。
window.COURSE.register({
  id: 'bridge-01',
  part: 'bridge',
  title: '橋渡し章 — React プレビュー',
  minutes: 30,
  goal: 'このコースで学んだ型システムが React 開発でそのまま通用することを確認し、フロントエンド開発コースに安心して進める状態になる。',
  sections: [
    {
      title: 'React の型付けに「新しい型システム」はない',
      body: `お疲れさまでした。基礎編と応用編を終えたあなたに、最後に見せたいものがあります。**React のコードです**。

この章は React を教えません(それはフロントエンド開発コースの仕事です)。ここでやるのは答え合わせだけです — 「React の型付け」と呼ばれているものの正体が、**あなたがすでに学んだ型システムの適用にすぎない**ことを確認します。

まず世界観の確認から。React のコンポーネントはこう書きます:

\`\`\`tsx
function Price(props: { amount: number }) {
  return <span>{props.amount}円</span>;
}
\`\`\`

HTML のようなものが式の中に現れる \`<span>...</span>\` の記法が **JSX** です。ここで Java / Python 経験者が最初に持つべき正しい認識は:

**JSX は JSP や Jinja2 のようなテンプレートエンジンではありません**。JSP のテンプレートは「文字列にプレースホルダを埋める別言語」で、型チェッカーの外側にありました。JSX は違います — 上のコードの \`<span>{props.amount}円</span>\` は **TypeScript の式そのもの**で、関数の戻り値です。だから \`{props.amount}\` の部分にも型チェックが**貫通します**。\`props.amount.toUpperCase()\` と書けば、number に toUpperCase はないというお馴染みのコンパイルエラーが出ます。

型がコード全体を貫くこの感覚は、基礎編 Ch.1 からずっとやってきたことです。舞台が UI に変わるだけで、ルールは何も変わりません。`,
    },
    {
      title: 'props の型定義は「ただの関数引数の型」',
      body: `React の入門記事には「props に型を付ける方法」という章がよくあります。身構える必要はありません。**コンポーネントは関数、props はその第一引数**。つまり props の型定義とは、基礎編 Ch.4 でやった**関数引数の型注釈そのもの**です。

\`\`\`tsx
type UserCardProps = {
  name: string;
  age: number;
  isAdmin?: boolean; // オプショナルプロパティ — 基礎編 Ch.4 のまま
};

function UserCard(props: UserCardProps) {
  return (
    <div>
      {props.name}({props.age})
      {props.isAdmin && <span>管理者</span>}
    </div>
  );
}
\`\`\`

呼び出し側(JSX でコンポーネントを使う側)ではこうなります:

\`\`\`tsx
<UserCard name="田中" age={30} />          // OK
<UserCard name="田中" />                    // エラー: age がない
<UserCard name="田中" age={30} role="x" /> // エラー: 知らないプロパティ
\`\`\`

2つ目のエラーは必須引数の欠落、3つ目は応用編 Ch.1 でやった **excess property check** です(JSX の属性はオブジェクトリテラル直渡しに相当するので、厳しいチェックが働きます)。「props のスペルミスや渡し忘れがコンパイル時に全部捕まる」— React で TS が絶賛される理由の筆頭は、あなたにとってはもう当たり前の挙動です。

\`isAdmin?\` のようなオプショナル、union 型の props(\`variant: 'primary' | 'danger'\` でボタンの見た目を切り替える等)、すべて既習の道具がそのまま使われます。新しい文法は JSX だけです。`,
    },
    {
      title: 'useState — 推論に任せる、はここでも正解',
      body: `React でコンポーネントに状態を持たせる \`useState\` という関数(フック)があります。中身はフロントエンド開発コースに譲るとして、**型の観点**だけ見てください:

\`\`\`tsx
const [count, setCount] = useState(0);
// count: number / setCount: (value: number) => void と推論される

setCount(count + 1); // OK
setCount("many");    // エラー: string は number に代入できない
\`\`\`

型注釈をひとつも書いていないのに、\`count\` は number になり、\`setCount\` に文字列を渡すとエラーになる。なぜか — \`useState\` は**ジェネリック関数**で、初期値 \`0\` から型引数が \`number\` と推論されているからです。応用編 Ch.4 でやった「呼び出し時の型引数推論」がそのまま働いています。戻り値の \`[count, setCount]\` を受けているのは基礎編 Ch.4 の**タプル型と分割代入**です。

推論が効かない場面だけ、型引数を明示します。「最初は null で、あとから User が入る」状態がその典型です:

\`\`\`tsx
const [user, setUser] = useState<User | null>(null);

// user は User | null なので、そのまま user.name はエラー
if (user !== null) {
  console.log(user.name); // narrowing 後なので OK
}
\`\`\`

初期値 \`null\` だけからは「あとで User が入る」ことを推論できないので \`<User | null>\` を明示する — Java のダイヤモンド演算子で型を書き足す感覚に近いですが、必要な場面が圧倒的に少ないのは応用編 Ch.4 で見たとおりです。そして \`User | null\` を安全に扱う方法は、\`strictNullChecks\` と narrowing としてすでに手の中にあります。`,
    },
    {
      title: 'ローディング状態は discriminated union — 応用編 Ch.2 の直接適用',
      body: `ここがこの章のハイライトです。フロントエンドの実務で最頻出のパターン —「データを取得中 / 成功 / 失敗」の3状態を持つ画面 — を型でどう表現するか。

素朴に書くと、booleanとnullableの寄せ集めになります:

\`\`\`ts
// アンチパターン: あり得ない状態が表現できてしまう
type State = {
  isLoading: boolean;
  data: User[] | null;
  error: Error | null;
};
// isLoading: true かつ data あり、data と error が両方ある…
// 実在しない組み合わせをコンパイラが許してしまう
\`\`\`

これを見て「タグ付き union で書き直せ」と反射的に思ったなら、応用編 Ch.2 は完全に身についています。React コミュニティが推奨する書き方は、まさにそれです:

\`\`\`ts
type FetchState<T> =
  | { status: 'loading' }
  | { status: 'ok'; data: T }
  | { status: 'error'; err: Error };
\`\`\`

**新しい概念はひとつもありません**。discriminated union(応用編 Ch.2)にジェネリクス(応用編 Ch.4)を組み合わせただけです。使う側も、あなたが図形の面積計算で書いた switch そのものです:

\`\`\`tsx
function UserList({ state }: { state: FetchState<User[]> }) {
  switch (state.status) {
    case 'loading':
      return <p>読み込み中…</p>;
    case 'ok':
      return <ul>{state.data.map((u) => <li key={u.id}>{u.name}</li>)}</ul>;
    case 'error':
      return <p>エラー: {state.err.message}</p>;
  }
}
\`\`\`

\`case 'ok'\` の中でだけ \`state.data\` に触れる(narrowing)、\`case 'error'\` の中でだけ \`state.err\` に触れる。「loading なのに data を参照する」バグは**型エラーとして書けなくなる**。状態を1つ追加すれば(例: \`{ status: 'refreshing'; data: T }\`)、\`never\` の網羅性チェックで分岐の書き漏れも捕まえられます。

Java なら State パターンのクラス階層で書いていた設計が、union + switch で完結する — 応用編 Ch.7 の「継承より union」も、フロントエンドでこそ毎日使う指針になります。`,
    },
    {
      title: 'ジェネリックコンポーネントと、この先の話',
      body: `最後にもうひとつだけ。「どんな型の配列でも表示できるリスト」のような部品は、**コンポーネント自体をジェネリックに**して作ります:

\`\`\`tsx
type ListProps<T> = {
  items: T[];
  render: (item: T) => string;
};

function List<T>(props: ListProps<T>) {
  return <ul>{props.items.map((item) => <li>{props.render(item)}</li>)}</ul>;
}

// 使う側: T は items から推論され、render の引数 item も同じ T になる
<List items={users} render={(u) => u.name} />
//                           ^ u は User と推論される。u.nmae はコンパイルエラー
\`\`\`

型引数を持つ関数を書き、制約と推論を設計する — 応用編 Ch.4 で \`pick\` や \`groupBy\` を自作したときの筋肉がそのまま使われます。\`items\` に User[] を渡せば \`render\` のコールバック引数が自動的に User になる推論の連鎖も、複数箇所から型引数が推論される流れとして経験済みのはずです。

さらにその先、React のライブラリの型定義ファイルを開くと、mapped types や conditional types(応用編 Ch.5)がふんだんに出てきます。かつては呪文に見えたはずのそれが、いまは「読める」— それがこのコースの到達点です。

### 続きはフロントエンド開発コースで

このコースで扱わなかったのは React **そのもの** — コンポーネントのライフサイクル、フックのルール、レンダリングの仕組み、状態管理の設計 — です。それらは**フロントエンド開発コース**で学んでください。

そこで登場する型は、今日見たとおり、あなたがすでに持っている道具です。学ぶべき新しいことは「React の考え方」であって「React の型システム」ではありません。型の心配はもう要らない、という手土産を持って、次のコースへ進んでください。`,
    },
  ],
});
