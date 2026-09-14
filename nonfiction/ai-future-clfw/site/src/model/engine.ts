import { COUNTRIES, DYNAMICS as D, SIM_END, SIM_START } from './calibration'
import type {
  CountryParams,
  CountryRun,
  Scenario,
  SimulationResult,
  YearResult,
} from './types'

// タスクベースの簡易マクロモデル。仕組みの解説は DESIGN.md を参照。
// すべて純関数で、同じ入力には同じ出力を返す。

const clamp = (x: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, x))

/** 認知タスクの自動化可能率(フロンティア)。ロジスティック曲線 */
export function frontierCognitive(year: number, s: Scenario): number {
  return s.cognitiveCap / (1 + Math.exp(-s.capabilitySlope * (year - s.agiMidYear)))
}

/** 身体タスクの自動化可能率。認知に遅行し、輸出規制が非中国の導入を遅らせる */
export function frontierPhysical(year: number, s: Scenario, c: CountryParams): number {
  // 規制は部品供給を通じて「実質的な追加遅延」として効く(最大+4年)
  const controlLag = c.exposedToChinaControls ? 4 * s.chinaExportControl : 0
  return frontierCognitive(year - s.physicalLagYears - controlLag, s)
}

export function simulateCountry(c: CountryParams, s: Scenario): CountryRun {
  const years: YearResult[] = []

  // 状態変数
  let aCog = 0.04 // 2026年時点で既に導入済みの認知自動化(暫定)
  let aPhy = 0.01
  let u = c.u0
  let latent = 0
  let gdpIndex = 100
  let wageIndex = 100
  let transfer = 0
  let stability = 78 - (c.u0 - c.uFloor) * 2 // 初期値: 現状の失業水準を織り込む

  let ubiYear: number | null = null
  let crisisYear: number | null = null

  for (let year = SIM_START; year <= SIM_END; year++) {
    const λ = c.laborFlexibility

    // --- 導入(フロンティアへの追随) ---
    const fCog = frontierCognitive(year, s)
    const fPhy = frontierPhysical(year, s, c)
    const dACog = c.adoptionSpeed * Math.max(0, fCog - aCog)
    const dAPhy = c.adoptionSpeed * 0.8 * Math.max(0, fPhy - aPhy)
    aCog += dACog
    aPhy += dAPhy

    // 曝露加重の有効自動化率と、その年の新規自動化フロー
    const exposure = c.cognitiveExposure + c.physicalExposure
    const effA =
      (aCog * c.cognitiveExposure + aPhy * c.physicalExposure) / exposure
    const dEmploymentAutomated =
      dACog * c.cognitiveExposure + dAPhy * c.physicalExposure // 雇用シェア単位

    // --- 置換の分岐: 顕在失業 vs 潜在調整(採用凍結・賃金停滞) ---
    const displacementPct = dEmploymentAutomated * 100
    const overtFlow = displacementPct * λ
    const latentFlow = displacementPct * (1 - λ)

    // 復権効果(新タスク創出)と再吸収
    const reinstatementPct = displacementPct * D.reinstatement
    const reabsorb =
      D.reabsorptionBase * λ * (1 - effA) * Math.max(0, u - c.uFloor)

    // 人口項は労働供給経路: 生産年齢人口の減少(popGrowth<0)は労働需給を
    // 逼迫させ失業率を押し下げる(日本の人手不足の表現)
    const uPrev = u
    u = clamp(
      u + overtFlow - reinstatementPct * λ - reabsorb + c.popGrowth * D.popGrowthToU,
      c.uFloor,
      30,
    )
    const dU = u - uPrev

    // 潜在スラック: 流入 − 自然解消 − 復権による吸収
    latent = clamp(
      latent + latentFlow * D.latentInflow - latent * D.latentRelease - reinstatementPct * (1 - λ),
      0,
      100,
    )

    // --- 再分配(政治の内生反応) ---
    const wageStress = Math.max(0, 100 - wageIndex) / 10
    const stress = Math.max(0, u - c.u0 - D.transferTriggerDu) + wageStress + latent / 25
    if (stress > 0 && s.redistribution > 0) {
      const ramp = D.transferRampMax * s.redistribution * c.fiscalSpace
      transfer = clamp(transfer + ramp * Math.min(1, stress / 3), 0, 1)
    }
    if (ubiYear === null && transfer > 0.5) ubiYear = year

    // --- GDP ---
    // 潜在調整が残る国は自動化してもコスト削減が実現しにくい
    const realization = D.latentTfpRealization + (1 - D.latentTfpRealization) * λ
    const tfpGain =
      dEmploymentAutomated * D.costSavingPerTask * 100 * realization
    const capitalGain = D.capitalDeepening * (dACog + dAPhy)
    const cover = clamp(transfer + c.safetyNet, 0, 1)
    const demandDrag = D.demandPenalty * Math.max(0, dU) * (1 - cover)
    const growth =
      c.baselineGrowth + c.popGrowth * D.popGrowthToGdp + tfpGain + capitalGain - demandDrag
    gdpIndex *= 1 + growth / 100

    // --- 賃金 ---
    // 置換圧力で下押し、生産性・給付・新タスクで上支え
    const wageGrowth =
      growth * D.wagePassthrough -
      D.wagePressure * (overtFlow + latentFlow) +
      transfer * D.wageTransferBoost +
      reinstatementPct * D.wageReinstatement
    wageIndex *= 1 + wageGrowth / 100

    // --- 社会安定性 ---
    const w = D.stability
    const uExcess = Math.max(0, u - c.uFloor)
    const stressScore =
      w.uLevel * uExcess +
      w.uQuad * uExcess * uExcess +
      w.uDelta * Math.max(0, dU) +
      w.latent * latent +
      w.wageDecline * Math.max(0, 100 - wageIndex)
    const relief = w.transferRelief * transfer + w.growthRelief * Math.max(0, growth)
    const target = clamp(100 - stressScore + relief, 0, 100)
    // 悪化は速く、回復は遅い
    stability =
      target < stability ? stability + (target - stability) * 0.6
      : stability + (target - stability) * w.recovery
    if (crisisYear === null && stability < D.crisisThreshold) crisisYear = year

    years.push({
      year,
      frontierCognitive: fCog,
      effectiveAutomation: effA,
      gdpIndex,
      growth,
      unemployment: u,
      latentSlack: latent,
      wageIndex,
      transferLevel: transfer,
      stability,
    })
  }

  return { country: c.id, years, ubiYear, crisisYear }
}

export function simulate(s: Scenario): SimulationResult {
  const result = {} as SimulationResult
  for (const c of COUNTRIES) {
    result[c.id] = simulateCountry(c, s)
  }
  return result
}
