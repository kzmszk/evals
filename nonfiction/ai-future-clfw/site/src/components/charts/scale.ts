// 軽量スケール・目盛りユーティリティ。d3 を入れるほどの規模ではないので自前実装。

export interface Scale {
  (v: number): number
  domain: [number, number]
  range: [number, number]
  ticks: number[]
}

export function linearScale(
  domain: [number, number],
  range: [number, number],
  tickCount = 5,
): Scale {
  const [d0, d1] = domain
  const [r0, r1] = range
  const f = ((v: number) => r0 + ((v - d0) / (d1 - d0 || 1)) * (r1 - r0)) as Scale
  f.domain = domain
  f.range = range
  f.ticks = niceTicks(d0, d1, tickCount)
  return f
}

export function logScale(
  domain: [number, number],
  range: [number, number],
): Scale {
  const l0 = Math.log10(domain[0])
  const l1 = Math.log10(domain[1])
  const [r0, r1] = range
  const f = ((v: number) =>
    r0 + ((Math.log10(v) - l0) / (l1 - l0 || 1)) * (r1 - r0)) as Scale
  f.domain = domain
  f.range = range
  const ticks: number[] = []
  for (let e = Math.ceil(l0); e <= Math.floor(l1); e++) ticks.push(10 ** e)
  f.ticks = ticks
  return f
}

/** キリのよい目盛りを生成する */
export function niceTicks(min: number, max: number, count = 5): number[] {
  if (min === max) return [min]
  const span = max - min
  const step0 = span / Math.max(1, count)
  const mag = 10 ** Math.floor(Math.log10(step0))
  const step =
    [1, 2, 2.5, 5, 10].map((m) => m * mag).find((s) => span / s <= count) ??
    10 * mag
  const start = Math.ceil(min / step) * step
  const ticks: number[] = []
  for (let v = start; v <= max + step * 1e-9; v += step) {
    ticks.push(Math.round(v * 1e9) / 1e9)
  }
  return ticks
}

/** データ範囲に少し余白を持たせた [min, max] を返す */
export function extent(values: number[], padRatio = 0.06): [number, number] {
  let min = Math.min(...values)
  let max = Math.max(...values)
  if (min === max) {
    min -= 1
    max += 1
  }
  const pad = (max - min) * padRatio
  return [min - pad, max + pad]
}

const JP_UNITS: Array<[number, string]> = [
  [1e12, '兆'],
  [1e8, '億'],
  [1e4, '万'],
]

/** 1234000000 → 「12.3億」のような日本語単位の短縮表記 */
export function formatJp(v: number, digits = 1): string {
  const abs = Math.abs(v)
  for (const [unit, label] of JP_UNITS) {
    if (abs >= unit) {
      const x = v / unit
      return `${x >= 100 ? Math.round(x) : x.toFixed(digits)}${label}`
    }
  }
  if (abs >= 1000) return v.toLocaleString('ja-JP')
  return `${Math.round(v * 10 ** digits) / 10 ** digits}`
}

/** 10^n を「10⁶」風の表記にする(対数軸ラベル用) */
export function formatPow10(v: number): string {
  const e = Math.round(Math.log10(v))
  const sup = '⁰¹²³⁴⁵⁶⁷⁸⁹'
  const digits = String(Math.abs(e))
    .split('')
    .map((d) => sup[Number(d)])
    .join('')
  return `10${e < 0 ? '⁻' : ''}${digits}`
}
