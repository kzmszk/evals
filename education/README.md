# 教材

## typescript 速習

python や java など経験者向けに typescript のマスターコースを作成する。詳細な章立ては [typescript/curriculum.md](typescript/curriculum.md)、学習アプリの技術設計は [typescript/docs/01-app-design.md](typescript/docs/01-app-design.md) を参照。

### 学習アプリの起動

[typescript/app/index.html](typescript/app/index.html) をブラウザで直接開く(`file://` で動作)。エディタ(Monaco)の読み込みにのみネットワークが必要。

```sh
open education/typescript/app/index.html
# またはローカルサーバー経由
python3 -m http.server 8000
```

### ターゲット

- Python または Java での開発経験がある(静的型付け・クラス・インターフェースの概念は既知)
- JavaScript / TypeScript は未経験〜軽く触った程度
- 想定される障壁は「型の概念」ではなく「JS の動的な文化」(this、イベントループ、プロトタイプ)と「nominal → structural の頭の切り替え」

### 要件

- ブラウザ上で学習できる
- 基礎編(約3時間)では基本的な文法を学び、簡単なコードを作成することができる
- 応用編(約8時間)では型システムを徹底的に学ぶ(narrowing・ジェネリクス・型レベルプログラミングまで)
- 確認テストがあり、理解度を判断できる
- 確認テストは受講者の理解度に応じて自動的に難易度があがる(簡単な問題ばかりたくさん出たり、難しい問題ばかりにならない。人によって問題数は違って良い)
- 演習は CLI・API クライアント・型パズル(type-challenges 形式)で構成し、フレームワークに依存しない

### スコープ外

React 等のフロントエンドフレームワークは扱わない(**フロントエンド開発コースとして別教材に分離**)。本コースの最終章に約30分の「React で TS がどう活きるか」プレビューを置き、橋渡しとする。
