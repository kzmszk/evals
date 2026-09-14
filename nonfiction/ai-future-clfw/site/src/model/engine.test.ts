import { describe, expect, it } from 'vitest'
import { DEFAULT_SCENARIO } from './calibration'
import { frontierPhysical, simulate, simulateCountry } from './engine'
import { COUNTRIES } from './calibration'
import type { Scenario } from './types'

const NO_AI: Scenario = {
  ...DEFAULT_SCENARIO,
  cognitiveCap: 0.001,
  redistribution: 0,
}

const FAST_AGI: Scenario = {
  ...DEFAULT_SCENARIO,
  agiMidYear: 2028,
  capabilitySlope: 0.9,
  cognitiveCap: 0.95,
}

const us = COUNTRIES.find((c) => c.id === 'us')!
const japan = COUNTRIES.find((c) => c.id === 'japan')!
const china = COUNTRIES.find((c) => c.id === 'china')!

const last = <T>(xs: T[]) => xs[xs.length - 1]

describe('simulate', () => {
  it('全出力が有限で範囲内に収まる', () => {
    for (const s of [NO_AI, DEFAULT_SCENARIO, FAST_AGI]) {
      for (const run of Object.values(simulate(s))) {
        for (const y of run.years) {
          for (const v of Object.values(y)) {
            expect(Number.isFinite(v)).toBe(true)
          }
          expect(y.unemployment).toBeGreaterThanOrEqual(0)
          expect(y.unemployment).toBeLessThanOrEqual(30)
          expect(y.stability).toBeGreaterThanOrEqual(0)
          expect(y.stability).toBeLessThanOrEqual(100)
          expect(y.gdpIndex).toBeGreaterThan(0)
        }
      }
    }
  })

  it('決定的である(同じ入力は同じ出力)', () => {
    expect(simulate(DEFAULT_SCENARIO)).toEqual(simulate(DEFAULT_SCENARIO))
  })

  it('AIなしシナリオでは失業率がほぼ動かず、成長は基準値近傍', () => {
    const run = simulateCountry(us, NO_AI)
    const final = last(run.years)
    expect(Math.abs(final.unemployment - us.u0)).toBeLessThan(1.5)
    expect(Math.abs(final.growth - (us.baselineGrowth + us.popGrowth * 0.4))).toBeLessThan(0.5)
    expect(run.crisisYear).toBeNull()
  })

  it('急速なAGIはGDPを押し上げる(中位比)', () => {
    const mid = last(simulateCountry(us, DEFAULT_SCENARIO).years).gdpIndex
    const fast = last(simulateCountry(us, FAST_AGI).years).gdpIndex
    expect(fast).toBeGreaterThan(mid)
  })

  it('労働流動性の低い日本は顕在失業でなく潜在調整として現れる', () => {
    const jp = simulateCountry(japan, FAST_AGI)
    const usRun = simulateCountry(us, FAST_AGI)
    const jpFinal = last(jp.years)
    const usFinal = last(usRun.years)
    // 失業率の上昇幅は米国の方が大きい
    expect(usFinal.unemployment - us.u0).toBeGreaterThan(jpFinal.unemployment - japan.u0)
    // 潜在スラックは日本の方が大きい
    expect(jpFinal.latentSlack).toBeGreaterThan(usFinal.latentSlack)
  })

  it('再分配は急速シナリオでの社会安定性を改善する', () => {
    const noRedist = simulateCountry(us, { ...FAST_AGI, redistribution: 0 })
    const fullRedist = simulateCountry(us, { ...FAST_AGI, redistribution: 1 })
    expect(last(fullRedist.years).stability).toBeGreaterThan(last(noRedist.years).stability)
  })

  it('中国の輸出規制は非中国のフィジカルAIだけを遅らせる', () => {
    const noCtrl: Scenario = { ...DEFAULT_SCENARIO, chinaExportControl: 0 }
    const ctrl: Scenario = { ...DEFAULT_SCENARIO, chinaExportControl: 1 }
    expect(frontierPhysical(2032, ctrl, us)).toBeLessThan(frontierPhysical(2032, noCtrl, us))
    expect(frontierPhysical(2032, ctrl, china)).toBe(frontierPhysical(2032, noCtrl, china))
  })

  it('無策の急速シナリオでは、手厚い再分配より安定性が低い年が生じる', () => {
    // 給付のラグが解消した後(2030年以降)の「谷」で比較する
    const after2030 = (ys: { year: number; stability: number }[]) =>
      Math.min(...ys.filter((y) => y.year >= 2030).map((y) => y.stability))
    const brutal = simulateCountry(us, { ...FAST_AGI, redistribution: 0 })
    const cushioned = simulateCountry(us, { ...FAST_AGI, redistribution: 1 })
    expect(after2030(brutal.years)).toBeLessThan(after2030(cushioned.years) - 3)
  })
})
