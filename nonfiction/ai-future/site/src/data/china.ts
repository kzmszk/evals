import { ym, type BarDataset, type LineDataset } from './types'

// 中国の政策・供給網。research/china-ai-robot-policy.md 参照。

/** 中国のレアアース供給網シェア */
export const rareEarthShare: BarDataset = {
  kind: 'bar',
  id: 'rare-earth',
  title: 'レアアース供給網に占める中国のシェア(工程別)',
  unit: '%',
  items: [
    { label: '採掘', value: 70 },
    { label: '分離・精製', value: 90 },
    { label: '永久磁石製造', value: 93, detail: 'ロボット用アクチュエータの必須部材' },
  ],
  source: {
    title: 'CSIS: China\'s New Rare Earth and Magnet Restrictions',
    url: 'https://www.csis.org/analysis/chinas-new-rare-earth-and-magnet-restrictions-threaten-us-defense-supply-chains',
    asOf: '2025-10',
  },
}

/** 対米レアアース磁石輸出の月次推移(2025年規制の威力) */
export const magnetExports: LineDataset = {
  kind: 'line',
  id: 'magnet-exports',
  title: '中国のレアアース磁石輸出: 2025年4月の規制で何が起きたか',
  unit: 'トン/月',
  series: [
    {
      id: 'world',
      label: '世界向け',
      points: [
        { x: ym('2024-06'), y: 5150, label: '前年基準(逆算)' },
        { x: ym('2025-05'), y: 1238, label: '規制直撃' },
        { x: ym('2025-06'), y: 3188, label: '首脳合意で部分回復' },
      ],
    },
    {
      id: 'us',
      label: '米国向け',
      points: [
        { x: ym('2025-03'), y: 500, label: '平常月の目安' },
        { x: ym('2025-05'), y: 46, label: '平常の1割未満' },
        { x: ym('2025-06'), y: 353 },
      ],
    },
  ],
  source: {
    title: '中国税関総署データ(Discovery Alert / China Briefing 経由)',
    url: 'https://discoveryalert.com.au/china-rare-earth-magnet-exports-us-2025-surge/',
    asOf: '2025-07',
    caveat:
      '一部は増減率からの逆算値。米欧の自動車・モーター工場が一時停止。2026年2月時点でも対米イットリウム輸出は規制前の3割、中国外価格は最大6倍。',
  },
}

/** ロボット・EVの中国供給網支配 */
export const chinaSupplyChain: BarDataset = {
  kind: 'bar',
  id: 'china-supply',
  title: 'フィジカルAIの部材供給に占める中国のシェア',
  unit: '%',
  items: [
    { label: 'ヒューマノイド生産(2025年)', value: 90, detail: '世界約13,300台のうち中国勢が約9割' },
    { label: 'レアアース磁石製造', value: 93 },
    { label: 'EV電池搭載量(中国6社計)', value: 68.9, detail: 'CATL 39.2% + BYD 16.4% を含む' },
    { label: 'ヒューマノイド部品網(推定)', value: 65, detail: '減速機・アクチュエータ等の6〜7割' },
    { label: '産業用ロボット設置(2024年)', value: 54 },
  ],
  source: {
    title: 'MERICS / SNE Research / IFR / CSIS',
    url: 'https://cnevpost.com/2026/02/04/global-ev-battery-market-share-2025/',
    asOf: '2026-02',
    caveat: '「部品網の6〜7割」は複数レポートの推定レンジの中央。',
  },
}

/** 中国の半導体自給: Huawei Ascend 出荷 */
export const ascendChips: BarDataset = {
  kind: 'bar',
  id: 'ascend',
  title: 'Huawei Ascend AIチップの出荷数',
  unit: '万個',
  items: [
    { label: '2024年(主に910B)', value: 50.7 },
    { label: '2025年(910C 65万個含む)', value: 80.5 },
    { label: '2026年 計画(最大ダイ数)', value: 160, detail: '実現は国産HBM調達に依存(910C換算25〜30万個分がボトルネック)' },
  ],
  source: {
    title: 'SemiAnalysis: Huawei Ascend Production Ramp',
    url: 'https://newsletter.semianalysis.com/p/huawei-ascend-production-ramp',
    asOf: '2026-01',
    caveat: 'SMICの7nm級は2026年に月6万枚へ倍増予定。中国AIモデルの対米遅延はEpoch計測で平均7ヶ月。',
  },
}
