// 可視化データの共通型。すべてのデータセットは出典と取得時点を持つ。

export interface SourceRef {
  title: string
  url: string
  /** データの時点(調査日ではなく対象データの最終時点) */
  asOf: string
  /** 精度に関する注意(グラフ読み取り・概数・予測値など) */
  caveat?: string
}

/** 折れ線用。x は小数年(例: 2025.5 = 2025年7月) */
export interface XYPoint {
  x: number
  y: number
  label?: string
}

/** 棒グラフ用 */
export interface NamedValue {
  label: string
  value: number
  detail?: string
}

export interface LineDataset {
  kind: 'line'
  id: string
  title: string
  unit: string
  series: { id: string; label: string; points: XYPoint[]; dashed?: boolean }[]
  source: SourceRef
}

export interface BarDataset {
  kind: 'bar'
  id: string
  title: string
  unit: string
  items: NamedValue[]
  source: SourceRef
}

export type Dataset = LineDataset | BarDataset

/** "2025-08" → 2025.58 のような小数年に変換 */
export function ym(s: string): number {
  const [y, m] = s.split('-').map(Number)
  return y + ((m ?? 6) - 0.5) / 12
}
