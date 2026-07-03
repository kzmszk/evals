# TypeScript 速習コース 学習アプリ設計書

[curriculum.md](../curriculum.md) のカリキュラムをブラウザ上で学習できるアプリの設計。この文書単体で実装・コンテンツ執筆を完遂できる詳細度で書く。

## 全体構成

```
education/typescript/
├── curriculum.md          # カリキュラム(章立て・到達目標)
├── docs/01-app-design.md  # 本書
└── app/
    ├── index.html         # プラットフォーム本体(単一 HTML、CSS/JS インライン)
    └── content/           # 章コンテンツ(1章 = 1ファイル、classic script)
        ├── basic-01.js … basic-05.js      # 基礎編
        ├── adv-01.js … adv-08.js          # 応用編
        └── bridge-01.js                   # 橋渡し章(React プレビュー)
```

- **`file://` で直接開けること**。コンテンツは `fetch` ではなく `<script src>` の classic script で読み込む(ESM は `file://` で動かないため使わない)。各コンテンツファイルは `window.COURSE.register({...})` を呼ぶ。
- 外部依存は Monaco Editor(jsdelivr CDN)のみ。Monaco の TypeScript worker が型チェック(セマンティック診断)と JS への emit を担う。ネットワーク必須なのは Monaco のみで、オフライン時はエディタ以外(解説・選択式テスト)は動作する設計にする。
- ダークテーマ、`<html lang="ja">`、日本語 UI。

## プラットフォーム(index.html)の機能

### 画面構成

- 左サイドバー: コース目次(基礎編 / 応用編 / 橋渡しのグループ)。章ごとに進捗バッジ(読了 / 演習 / テスト合否)。
- メイン領域: ホーム(コース概要 + 全体進捗)と章ビュー。章ビューは3タブ:
  1. **解説** — sections を Markdown レンダリングして縦に表示。`code` 付きセクションは「▶ エディタで試す」ボタンで演習タブのエディタに転送。末尾に「読了にする」ボタン。
  2. **演習** — 課題文 + Monaco エディタ + 「実行」「判定」ボタン + コンソール出力ペイン + 診断(型エラー)一覧。
  3. **確認テスト** — 適応型テスト(後述)。

### TypeScript 実行基盤

- Monaco は AMD loader(`loader.js`)で CDN から読み込み。worker はクロスオリジンのため Blob URL プロキシ(`importScripts` で CDN の `workerMain.js` を読む)を `MonacoEnvironment.getWorkerUrl` に設定。
- コンパイラオプション: `strict: true`, `noUncheckedIndexedAccess: true`, `target: ES2020`, `lib: [es2020, dom]`。コースの「strict は非交渉」方針をアプリ自体が体現する。
- 診断: `getTypeScriptWorker()` → `getSyntacticDiagnostics` + `getSemanticDiagnostics`。
- 実行: `getEmitOutput` で得た JS を sandbox iframe(`srcdoc`)に注入し、`console.log/warn/error` と `window.onerror` を `postMessage` で親に転送してコンソールペインに表示。5秒でタイムアウト破棄(無限ループ対策)。
- トップレベル `await` は非対応。非同期の演習は `async function main() { ... } main();` の形で書かせる(カリキュラム上もその方が教育的)。

### 適応型テストエンジン

README 要件「理解度に応じて難易度が自動で上がる/問題数は人によって違う」の実装:

- 各章の問題プールは難易度 `d: 1(easy) / 2(medium) / 3(hard)` でタグ付け。**各難易度3問以上**(計9問以上)用意する。
- 状態: 現在レベル(1開始)、連続正解数、連続誤答数。
  - 連続2問正解 → レベル +1(上限3)、ストリークリセット
  - 連続2問誤答 → レベル -1(下限1)、ストリークリセット
- 出題: 現在レベルの未出題問題からランダム。枯渇したら近い難易度から借りる。
- 終了条件(いずれか): ① レベル3で累計2問正解(**マスター**) ② 出題数が12問に到達 ③ プール枯渇。
- 判定: 終了時レベル3 → **合格**、レベル2 → **もう少し**、レベル1 → **要復習**。誤答した問題の `review` フィールド(章内セクション名)を集めて「復習すべき節」として提示する。
- 進捗は `localStorage`(キー `ts-course-progress-v1`)に章 ID 単位で保存: `{ read, exerciseDone, quiz: {result, asked, correct} }`。

### テスト問題の2形式

1. **choice** — 選択式。コード片を提示して挙動・型・可否を問う。
2. **code** — 実技式。型エラーを含む(または不完全な)コードを Monaco 上で修正させ、`check` 条件で自動採点する。採点条件は演習と共通のスキーマ:
   - `noErrors: true` — 診断ゼロであること
   - `expectErrors: true` — 診断が1件以上あること(「エラーを再現せよ」問題用)
   - `mustMatch: [regex]` — コードが満たすべきパターン(全消し・チート防止)
   - `forbid: [regex]` — 禁止パターン(例: `\bany\b`, `\bas\b` で逃げるのを防ぐ)
   - `output: string` — 実行して console 出力(trim 済み改行結合)が一致すること

## コンテンツスキーマ(章ファイルの書き方)

各 `content/*.js` は classic script で、次の形で1章を登録する。**お手本は `content/basic-01.js`** — 文体・分量・問題の粒度はこれに合わせる。

```js
window.COURSE.register({
  id: 'basic-01',            // ファイル名と一致させる
  part: 'basic',             // 'basic' | 'advanced' | 'bridge'
  title: 'オリエンテーション — TS は「JS + 静的解析」である',
  minutes: 20,               // curriculum.md の所要時間
  goal: '章の到達目標(1〜2文)',
  sections: [
    {
      title: '節タイトル',
      body: `Markdown 本文。`,   // 対応記法: 見出し(###)・段落・**強調**・`code`・fenced code・箇条書き・引用
      code: `// 省略可。「エディタで試す」に転送される実行可能な TS`,
    },
  ],
  exercise: {
    instructions: `課題文(Markdown)`,
    starter: `// エディタ初期コード`,
    check: { noErrors: true, mustMatch: ['...'], output: '...' },
  },
  quiz: [
    {
      d: 1,
      type: 'choice',
      prompt: '問題文(Markdown)',
      code: `// 省略可: 提示コード`,
      options: ['選択肢1', '選択肢2', '選択肢3', '選択肢4'],
      answer: 0,               // 正解 index
      explanation: '解説(Markdown)。なぜ他が誤りかにも触れる',
      review: '節タイトル',     // 誤答時に復習を促す節(sections[].title と一致させる)
    },
    {
      d: 3,
      type: 'code',
      prompt: '次のコードの型エラーを、any や as を使わずに修正せよ',
      starter: `...`,
      check: { noErrors: true, forbid: ['\\bany\\b', '\\bas\\b'] },
      explanation: '...',
      review: '...',
    },
  ],
});
```

### コンテンツ執筆の規約

- ターゲットは Python/Java 経験者。**概念の一般説明をせず、常に Java / Python との対比(差分)で教える**。
- **Java の知識は Java 7 相当までしか仮定しない**(ラムダ・Stream・Optional・var は既知としない。使う場合は一言説明を添える)。専門用語(type erasure 等)は概念を平易に説明してから名付ける。
- 型はランタイムに消える(type erasure)という世界観を全編で一貫させる。
- コード例はすべて上記コンパイラオプション(strict + noUncheckedIndexedAccess)で意図どおりに動く/エラーになること。「エラーになる例」は本文中にその旨を明記する。
- quiz は各難易度3問以上・計9問以上。easy は知識確認、medium は挙動・型の予測、hard は罠(Java/Python の直感だと間違える例)や実技修正。
- `explanation` は正解の理由だけでなく誤答選択肢の誤りにも触れる。
- 執筆後は `node --check <file>` で構文検証し、`node content/validate.mjs` でスキーマ整合性(id/ファイル名一致・難易度内訳・review と節タイトルの一致)を検証すること。テンプレートリテラル内に生の `${...}` を書くとプラットフォーム側で意図せず評価される点に注意(TS コード例でテンプレートリテラルを見せるときはバッククォートのエスケープ `\`` と `\${` を使う)。
