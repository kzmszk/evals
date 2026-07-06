import { ym, type BarDataset, type LineDataset } from './types'

// LLM系AIの能力トレンド。research/llm-capability-trends.md 参照。

/** METR 50%成功タスク長(人間専門家換算・分)。対数軸で直線=指数成長 */
export const metrHorizon: LineDataset = {
  kind: 'line',
  id: 'metr-horizon',
  title: 'AIが50%の成功率でこなせるタスクの長さ(人間の作業時間換算)',
  unit: '分',
  series: [
    {
      id: 'frontier',
      label: 'フロンティアモデル',
      points: [
        { x: ym('2023-03'), y: 3.5, label: 'GPT-4' },
        { x: ym('2023-11'), y: 3.6, label: 'GPT-4 Turbo' },
        { x: ym('2025-02'), y: 60, label: 'Claude Sonnet 3.7' },
        { x: ym('2025-04'), y: 121, label: 'o3' },
        { x: ym('2025-08'), y: 214, label: 'GPT-5' },
        { x: ym('2025-11'), y: 320, label: 'Claude Opus 4.5' },
        { x: ym('2026-02'), y: 720, label: 'Claude Opus 4.6(報道値・参考)' },
      ],
    },
  ],
  source: {
    title: 'METR Time Horizon 1.1',
    url: 'https://metr.org/blog/2026-1-29-time-horizon-1-1/',
    asOf: '2026-02',
    caveat:
      '倍増周期は全期間196日、2024年以降89日。信頼区間は広い(Opus 4.5で170〜729分)。Opus 4.6の12時間は二次報道による参考値。',
  },
}

/** 主要ベンチマークの飽和レース */
export const benchmarkRace: LineDataset = {
  kind: 'line',
  id: 'bench-race',
  title: '「解けない」はずのベンチマークが次々に飽和する',
  unit: '%(最高スコア)',
  series: [
    {
      id: 'swe',
      label: 'SWE-bench Verified',
      points: [
        { x: ym('2024-08'), y: 33, label: 'GPT-4o' },
        { x: ym('2024-10'), y: 49, label: 'Claude 3.5 Sonnet' },
        { x: ym('2025-05'), y: 72.5, label: 'Claude Opus 4' },
        { x: ym('2025-12'), y: 80.9, label: 'Claude Opus 4.5' },
        { x: ym('2026-04'), y: 87.6, label: 'Claude Opus 4.7' },
        { x: ym('2026-07'), y: 95.0, label: 'Claude Fable 5' },
      ],
    },
    {
      id: 'arc2',
      label: 'ARC-AGI-2',
      points: [
        { x: ym('2024-08'), y: 0.1, label: '公開時のフロンティア' },
        { x: ym('2025-06'), y: 10, label: '2025年央(近似)' },
        { x: ym('2026-04'), y: 83.3, label: 'GPT-5.4 Pro' },
        { x: ym('2026-06'), y: 85, label: 'GPT-5.5(非公式)' },
      ],
    },
    {
      id: 'hle',
      label: "Humanity's Last Exam",
      points: [
        { x: ym('2025-01'), y: 9, label: '公開時最良' },
        { x: ym('2025-07'), y: 25, label: '2025年央' },
        { x: ym('2026-07'), y: 64.7, label: 'Claude Mythos Preview' },
      ],
    },
  ],
  source: {
    title: 'llm-stats / ARC Prize / agi.safe.ai の各リーダーボード',
    url: 'https://llm-stats.com/benchmarks/swe-bench-verified',
    asOf: '2026-07',
    caveat:
      '中間点の一部はグラフ・記事からの読み取り近似。ARC-AGI-2のGPT-5.5(85%)は公式検証前の報告値。HLEの人間専門家水準は約90%。',
  },
}

/** 大手テック企業のAI生成コード比率(公表値) */
export const aiCodeShare: BarDataset = {
  kind: 'bar',
  id: 'ai-code-share',
  title: '大手テック企業の「AIが書いたコード」比率(公表値)',
  unit: '%',
  items: [
    { label: 'Google(2024年10月)', value: 25, detail: '新規コードのAI生成比率' },
    { label: 'Microsoft(2025年4月)', value: 30, detail: 'リポジトリ内コードのAI寄与' },
    { label: 'Google(2025年10月)', value: 50, detail: '新規コードのAI生成比率' },
    { label: 'Google(2026年6月)', value: 75, detail: '新規コードのAI生成比率' },
    { label: 'Anthropic(2026年5月)', value: 80, detail: 'マージされたコードのAI起筆比率(80%超)' },
  ],
  source: {
    title: 'Anthropic Institute / 各社公表(Fortune, DevOps.com)',
    url: 'https://www.anthropic.com/institute/recursive-self-improvement',
    asOf: '2026-06',
    caveat: '各社で定義が異なる(新規コード比率/マージコード比率など)ため厳密な比較はできない。',
  },
}

/** Mythos Preview のエクスプロイト生成能力(騒動の核心データ) */
export const mythosExploits: BarDataset = {
  kind: 'bar',
  id: 'mythos-exploits',
  title: 'Firefox JSエンジンに対する動作するエクスプロイトの生成回数',
  unit: '回',
  items: [
    { label: 'Claude Opus 4.6', value: 2, detail: '数百回の試行中2回' },
    { label: 'Claude Mythos Preview', value: 181, detail: 'ほかにレジスタ制御29回。AISIの32段階攻撃(TLO)を史上初完遂' },
  ],
  source: {
    title: 'Anthropic Mythos Preview cyber assessment / UK AISI 評価',
    url: 'https://www.anthropic.com/research/mythos-preview',
    asOf: '2026-04',
  },
}

/** 同等能力あたりの推論価格の年間下落倍率 */
export const priceDecline: BarDataset = {
  kind: 'bar',
  id: 'price-decline',
  title: '同じ能力を使うための推論価格は年に何倍下がるか',
  unit: '倍/年',
  items: [
    { label: '全期間の中央値(6ベンチマーク)', value: 50 },
    { label: '2024年1月以降の中央値', value: 200 },
    { label: 'GPT-4水準のGPQA固定', value: 40 },
    { label: 'Sonnet 3.5水準のGPQA-D固定', value: 300, detail: '200〜400倍レンジの中央' },
  ],
  source: {
    title: 'LLM inference price trends | Epoch AI',
    url: 'https://epoch.ai/data-insights/llm-inference-price-trends',
    asOf: '2026-01',
    caveat: 'フラッグシップの絶対価格は下がっていない(Fable 5は入力$10/出力$50と前世代の約2倍)。',
  },
}
