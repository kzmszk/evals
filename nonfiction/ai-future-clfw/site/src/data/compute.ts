import { type BarDataset, type LineDataset } from './types'

// 計算資源・投資・電力。research/compute-datacenter-semiconductor.md,
// power-datacenter.md 参照。

/** NVIDIA データセンタ四半期売上(暦年ベースの期央を x に) */
export const nvidiaDc: LineDataset = {
  kind: 'line',
  id: 'nvidia-dc',
  title: 'NVIDIA データセンタ部門の四半期売上',
  unit: '十億ドル',
  series: [
    {
      id: 'nvda',
      label: 'NVIDIA DC売上',
      points: [
        { x: 2024.25, y: 22.6, label: 'FY25Q1' },
        { x: 2024.5, y: 26.3, label: 'FY25Q2' },
        { x: 2024.75, y: 30.8, label: 'FY25Q3' },
        { x: 2025.0, y: 35.6, label: 'FY25Q4' },
        { x: 2025.25, y: 39.1, label: 'FY26Q1' },
        { x: 2025.5, y: 41.1, label: 'FY26Q2' },
        { x: 2025.75, y: 51.2, label: 'FY26Q3' },
        { x: 2026.0, y: 62.3, label: 'FY26Q4' },
        { x: 2026.25, y: 75.2, label: 'FY27Q1' },
      ],
    },
  ],
  source: {
    title: 'NVIDIA 決算プレスリリース',
    url: 'https://nvidianews.nvidia.com/news/nvidia-announces-financial-results-for-first-quarter-fiscal-2027',
    asOf: '2026-05',
    caveat: 'x軸は各四半期の期央(暦年換算)。',
  },
}

/** ハイパースケーラー4社の年間設備投資 */
export const hyperscalerCapex: BarDataset = {
  kind: 'bar',
  id: 'capex-total',
  title: 'ハイパースケーラー4社合計の設備投資(Amazon+Microsoft+Alphabet+Meta)',
  unit: '十億ドル/年',
  items: [
    { label: '2024年(実績)', value: 230 },
    { label: '2025年(実績)', value: 410 },
    {
      label: '2026年(計画)',
      value: 725,
      detail: 'Amazon 200 / Microsoft 190 / Alphabet 185 / Meta 135(いずれも計画・概数)。報道により690〜725Bの幅',
    },
  ],
  source: {
    title: '各社決算 / Tom\'s Hardware 集計',
    url: 'https://www.tomshardware.com/tech-industry/big-tech/big-techs-ai-spending-plans-reach-725-billion',
    asOf: '2026-02',
  },
}

/** Stargate: 計画 vs 稼働(「計画先行」の実態) */
export const stargate: BarDataset = {
  kind: 'bar',
  id: 'stargate',
  title: 'OpenAI Stargate 各サイトの計画容量と、実際に稼働している容量',
  unit: 'GW',
  items: [
    { label: 'Abilene TX(計画)', value: 1.2, detail: '完成予定 2026Q4' },
    { label: 'Abilene TX(稼働中)', value: 0.3, detail: '2026年4月時点で唯一の稼働サイト。5月末に0.6GW予定' },
    { label: 'Doña Ana NM(計画)', value: 2.2, detail: '稼働 0。完成予定 2028Q4' },
    { label: 'Shackelford TX(計画)', value: 2.0, detail: '稼働 0' },
    { label: 'Saline MI(計画)', value: 1.4, detail: '稼働 0' },
    { label: 'Port Washington WI(計画)', value: 1.3, detail: '稼働 0' },
    { label: 'Milam TX(計画)', value: 1.2, detail: '稼働 0' },
  ],
  source: {
    title: 'Epoch AI: OpenAI Stargate — where the US sites stand',
    url: 'https://epoch.ai/publications/openai-stargate-where-the-us-sites-stand',
    asOf: '2026-04',
    caveat: '計画9GW超に対し稼働は0.3GW(約3%)。',
  },
}

/** 2030年の米国データセンタ電力予測(機関間比較) */
export const power2030: BarDataset = {
  kind: 'bar',
  id: 'power-2030',
  title: '2030年の米国データセンタ電力消費の予測(機関別)',
  unit: 'TWh/年',
  items: [
    { label: 'EPRI 低シナリオ', value: 380, detail: '全米消費の約9%' },
    { label: 'IEA(2024年比+130%)', value: 425, detail: '概算逆算値' },
    { label: 'LBNL 下限', value: 521 },
    { label: 'EPRI 中シナリオ', value: 590, detail: '全米の約13%' },
    { label: 'LBNL 参照ケース', value: 649, detail: '全米の約11.8%' },
    { label: 'EPRI 高シナリオ', value: 790, detail: '全米の約17%' },
    { label: 'LBNL 上限', value: 843 },
  ],
  source: {
    title: 'LBNL 2025 Update / EPRI Powering Intelligence 2026 / IEA Energy and AI',
    url: 'https://escholarship.org/uc/item/33m6w3x0',
    asOf: '2026-06',
    caveat: '2024年実績は192TWh(全米の4.7%)。機関ごとに定義・手法が異なる。IEA値は概算逆算。',
  },
}

/** 2025年 発電容量新設の中米比較 */
export const chinaUsCapacity: BarDataset = {
  kind: 'bar',
  id: 'china-us-power',
  title: '2025年の発電容量の新設ペース: 中国 vs 米国',
  unit: 'GW/年',
  items: [
    { label: '中国 純増合計', value: 540 },
    { label: '中国 風力+太陽光', value: 430, detail: '太陽光累計1.2TW(+35%)' },
    { label: '米国 全技術(計画値)', value: 63, detail: 'EIA計画ベース' },
    { label: '米国 事業用太陽光(実績)', value: 25.6 },
    { label: '米国 風力(実績)', value: 4.9 },
  ],
  source: {
    title: 'Ember China Energy Transition Review 2025 / EIA',
    url: 'https://ember-energy.org/latest-insights/china-energy-transition-review-2025/',
    asOf: '2025-12',
    caveat: 'ガスタービン納期は約3年(GE Vernova契約100GW)、大型変圧器の納期は約4年に伸びている。',
  },
}
