/** Illustrative mechanism model. None of these regional parameters are statistical estimates. */
export type RegionId = "us" | "jp" | "cn" | "eu";
export interface Region {
  id: RegionId;
  name: string;
  label: string;
  color: string;
  growth: number;
  adoption: number;
  mobility: number;
  reabsorb: number;
  productivity: number;
  capitalShift: number;
  physicalShare: number;
}
export const regions: Region[] = [
  {
    id: "us",
    name: "米国",
    label: "導入・雇用調整が速い型",
    color: "#215b9a",
    growth: 0.018,
    adoption: 0.45,
    mobility: 0.85,
    reabsorb: 0.35,
    productivity: 0.3,
    capitalShift: 0.3,
    physicalShare: 0.3,
  },
  {
    id: "jp",
    name: "日本",
    label: "社内調整が多い型",
    color: "#c0643c",
    growth: 0.008,
    adoption: 0.25,
    mobility: 0.3,
    reabsorb: 0.2,
    productivity: 0.25,
    capitalShift: 0.15,
    physicalShare: 0.4,
  },
  {
    id: "cn",
    name: "中国",
    label: "製造業の導入が速い型",
    color: "#8a4d83",
    growth: 0.03,
    adoption: 0.4,
    mobility: 0.6,
    reabsorb: 0.25,
    productivity: 0.3,
    capitalShift: 0.2,
    physicalShare: 0.5,
  },
  {
    id: "eu",
    name: "EU",
    label: "中程度の導入・調整型",
    color: "#2a7960",
    growth: 0.012,
    adoption: 0.3,
    mobility: 0.45,
    reabsorb: 0.28,
    productivity: 0.25,
    capitalShift: 0.15,
    physicalShare: 0.35,
  },
];
export interface Scenario {
  mid: number;
  speed: number;
  cap: number;
  lag: number;
  exposure: number;
  replacement: number;
  ubi: number;
  tax: number;
  supply: number;
  retraining: number;
}
export const defaults: Scenario = {
  mid: 2031,
  speed: 0.7,
  cap: 0.85,
  lag: 5,
  exposure: 0.3,
  replacement: 0.4,
  ubi: 0,
  tax: 0.2,
  supply: 0,
  retraining: 0,
};
export const bounds: Record<keyof Scenario, [number, number]> = {
  mid: [2027, 2040],
  speed: [0.2, 1.2],
  cap: [0, 0.98],
  lag: [0, 10],
  exposure: [0, 0.6],
  replacement: [0, 0.9],
  ubi: [0, 0.3],
  tax: [0, 0.6],
  supply: [0, 4],
  retraining: [0, 0.3],
};
export function validateScenario(input: unknown): Scenario {
  if (!input || typeof input !== "object" || Array.isArray(input))
    throw Error("条件はオブジェクトで指定してください");
  const result = { ...defaults };
  for (const [key, value] of Object.entries(input)) {
    if (!(key in bounds)) throw Error(`不明な条件: ${key}`);
    const [lo, hi] = bounds[key as keyof Scenario];
    if (
      typeof value !== "number" ||
      !Number.isFinite(value) ||
      value < lo ||
      value > hi
    )
      throw Error(`条件の範囲外: ${key}`);
    result[key as keyof Scenario] = value;
  }
  return result;
}
export interface Point {
  year: number;
  adoption: number;
  physical: number;
  gdp: number;
  reference: number;
  unemployment: number;
  latent: number;
  wage: number;
  income: number;
  incomeReference: number;
  stress: number;
  transfers: number;
  balance: number;
  fiscalDifference: number;
  labor: number;
  capital: number;
  household: number;
  taxes: number;
  benefits: number;
  employed: number;
  displaced: number;
  released: number;
  latentReleased: number;
  latentInflow: number;
  overtInflow: number;
  unemployedStock: number;
  latentStock: number;
  rawIncome: number;
  referenceRawIncome: number;
}
const sig = (x: number) => 1 / (1 + Math.exp(-x));
const clamp = (v: number, l: number, h: number) => Math.min(h, Math.max(l, v));
function capability(t: number, s: Scenario, lag = 0) {
  const initial = sig(s.speed * (2026 - s.mid - lag));
  return (
    s.cap *
    Math.max(
      0,
      (sig(s.speed * (2026 + t - s.mid - lag)) - initial) / (1 - initial),
    )
  );
}
/** N=100 fixed labor force, E0=95. Income uses fixed default-policy 2026 denominator across scenarios. */
export function simulate(r: Region, input: Scenario, enabled = true): Point[] {
  const s = validateScenario(input);
  let cog = 0,
    phy = 0,
    unemployed = 0,
    latent = 0;
  const out: Point[] = [];
  const baseWage = (0.6 * 100) / 95;
  const baseMarket = 0.6 * 100 + 0.6 * 0.4 * 100;
  const baseDisposable =
    baseMarket * (1 - defaults.tax) + defaults.replacement * baseWage * 5;
  for (let t = 0; t <= 10; t++) {
    const lastA = (1 - r.physicalShare) * cog + r.physicalShare * phy;
    const previousE = 95 - unemployed;
    let displaced = 0,
      released = 0,
      latentReleased = 0,
      latentInflow = 0,
      overtInflow = 0;
    if (t > 0) {
      cog += r.adoption * ((enabled ? capability(t, s) : 0) - cog);
      phy +=
        r.adoption *
        0.8 *
        ((enabled
          ? capability(t, s, s.lag + (r.id === "cn" ? 0 : s.supply))
          : 0) -
          phy);
      const newA = (1 - r.physicalShare) * cog + r.physicalShare * phy;
      displaced = Math.min(
        Math.max(0, previousE - latent),
        95 * s.exposure * Math.max(0, newA - lastA),
      );
      overtInflow = displaced * r.mobility;
      latentInflow = displaced * (1 - r.mobility);
      released =
        clamp(r.reabsorb + s.retraining, 0, 1) * (unemployed + overtInflow);
      latentReleased =
        clamp(0.12 + s.retraining, 0, 1) * (latent + latentInflow);
      unemployed += overtInflow - released;
      latent += latentInflow - latentReleased;
    }
    const adoption = (1 - r.physicalShare) * cog + r.physicalShare * phy;
    const employed = 95 - unemployed;
    const reference = 100 * (1 + r.growth) ** t;
    const effective = employed - 0.35 * latent;
    const gdp =
      reference *
      Math.exp(r.productivity * adoption) *
      (effective / 95) ** 0.65;
    const labor = 0.6 * (1 - r.capitalShift * adoption) * gdp;
    const capital = gdp - labor;
    const household = labor + 0.6 * capital;
    const refWage = (0.6 * reference) / 95;
    const phase = Math.min(1, t / 3);
    const benefits =
      s.replacement * refWage * (5 + unemployed) +
      phase * s.ubi * refWage * 100;
    const taxes = s.tax * household;
    const rawIncome = household - taxes + benefits;
    const referenceH = 0.84 * reference;
    const referenceB =
      s.replacement * refWage * 5 + phase * s.ubi * refWage * 100;
    const referenceRawIncome = referenceH * (1 - s.tax) + referenceB;
    const balance = taxes - benefits;
    const referenceBalance = s.tax * referenceH - referenceB;
    const stress =
      100 *
      (0.45 * Math.min(1, unemployed / 95 / 0.15) +
        0.25 * Math.min(1, latent / 95 / 0.15) +
        0.3 *
          Math.min(1, Math.max(0, 1 - rawIncome / referenceRawIncome) / 0.1));
    out.push({
      year: 2026 + t,
      adoption,
      physical: phy,
      gdp,
      reference,
      unemployment: 5 + unemployed,
      latent: (latent / 95) * 100,
      wage: (labor / employed / baseWage) * 100,
      income: (rawIncome / baseDisposable) * 100,
      incomeReference: (referenceRawIncome / baseDisposable) * 100,
      stress,
      transfers: (benefits / gdp) * 100,
      balance: (balance / gdp) * 100,
      fiscalDifference: ((balance - referenceBalance) / reference) * 100,
      labor,
      capital,
      household,
      taxes,
      benefits,
      employed,
      displaced,
      released,
      latentReleased,
      latentInflow,
      overtInflow,
      unemployedStock: unemployed,
      latentStock: latent,
      rawIncome,
      referenceRawIncome,
    });
  }
  return out;
}
export const presets = [
  {
    name: "緩やかな普及",
    note: "能力の伸びと導入がゆっくり進む",
    scenario: { ...defaults, mid: 2036, speed: 0.35, cap: 0.65 },
  },
  {
    name: "中位の仮定",
    note: "能力中点2031年を置く比較の出発点",
    scenario: defaults,
  },
  {
    name: "急速な普及",
    note: "能力が先行し、追加給付は行わない",
    scenario: { ...defaults, mid: 2028, speed: 1, cap: 0.95 },
  },
  {
    name: "急速＋移行支援",
    note: "再就職を支え、基準賃金の10%を一律給付",
    scenario: {
      ...defaults,
      mid: 2028,
      speed: 1,
      cap: 0.95,
      ubi: 0.1,
      retraining: 0.15,
    },
  },
];
