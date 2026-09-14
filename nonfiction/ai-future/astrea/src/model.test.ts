import { describe, it, expect } from "vitest";
import {
  regions,
  simulate,
  defaults,
  presets,
  validateScenario,
} from "./model";
describe("scenario accounting and boundaries", () => {
  it("base year matches reference and all indices start at 100", () => {
    for (const r of regions) {
      const p = simulate(r, defaults)[0];
      for (const k of ["gdp", "reference", "wage", "income"] as const)
        expect(p[k]).toBeCloseTo(100);
      expect(p.stress).toBeCloseTo(0);
    }
  });
  it("no new AI diffusion is exactly the counterfactual", () => {
    for (const r of regions)
      for (const p of simulate(r, defaults, false)) {
        expect(p.gdp).toBeCloseTo(p.reference);
        expect(p.income).toBeCloseTo(p.incomeReference);
        expect(p.fiscalDifference).toBeCloseTo(0);
        expect(p.stress).toBeCloseTo(0);
      }
  });
  it("worker flows and fiscal/income accounts conserve under extremes", () => {
    for (const r of regions)
      for (const s of [
        ...presets.map((p) => p.scenario),
        {
          ...defaults,
          cap: 0.98,
          exposure: 0.6,
          speed: 1.2,
          mid: 2027,
          lag: 0,
          ubi: 0.3,
          tax: 0.6,
          replacement: 0.9,
        },
      ]) {
        const points = simulate(r, s);
        for (let i = 0; i < points.length; i++) {
          const p = points[i];
          Object.values(p).forEach((v) =>
            expect(Number.isFinite(v)).toBe(true),
          );
          expect(p.labor + p.capital).toBeCloseTo(p.gdp);
          expect(p.household - p.taxes + p.benefits).toBeCloseTo(p.rawIncome);
          expect(p.employed + p.unemployment).toBeCloseTo(100);
          expect(p.stress).toBeGreaterThanOrEqual(0);
          expect(p.stress).toBeLessThanOrEqual(100);
          expect(p.adoption).toBeLessThanOrEqual(s.cap);
          expect(p.employed - p.latentStock).toBeGreaterThan(0);
          if (i) {
            const prev = points[i - 1];
            expect(p.unemployedStock - prev.unemployedStock).toBeCloseTo(
              p.overtInflow - p.released,
            );
            expect(p.latentStock - prev.latentStock).toBeCloseTo(
              p.latentInflow - p.latentReleased,
            );
          }
        }
      }
  });
  it("universal benefits cost exactly their cash value and do not create output", () => {
    for (const r of regions) {
      const a = simulate(r, defaults).at(-1)!;
      const b = simulate(r, { ...defaults, ubi: 0.1 }).at(-1)!;
      expect(b.gdp).toBe(a.gdp);
      const cost = ((0.1 * 0.6 * a.reference) / 95) * 100;
      expect(b.benefits - a.benefits).toBeCloseTo(cost);
      expect(b.rawIncome - a.rawIncome).toBeCloseTo(cost);
      expect(((b.balance - a.balance) / 100) * a.gdp).toBeCloseTo(-cost);
    }
  });
  it("no exposure means no displaced workers; no capability is reference", () => {
    for (const r of regions) {
      for (const p of simulate(r, { ...defaults, exposure: 0 }))
        expect(p.unemployment).toBe(5);
      for (const p of simulate(r, { ...defaults, cap: 0 }))
        expect(p.gdp).toBeCloseTo(p.reference);
    }
  });
  it("higher taxes reduce fixed-base income; supply delays exclude China", () => {
    for (const r of regions) {
      const a = simulate(r, defaults).at(-1)!;
      const b = simulate(r, { ...defaults, tax: 0.6 }).at(-1)!;
      expect(b.income).toBeLessThan(a.income);
      expect(b.taxes - a.taxes).toBeCloseTo(0.4 * a.household);
      const delayed = simulate(r, { ...defaults, supply: 4 }).at(-1)!;
      if (r.id === "cn") expect(delayed).toEqual(a);
      else expect(delayed.physical).toBeLessThan(a.physical);
    }
  });
  it("rejects invalid and unknown parameters", () => {
    for (const s of [
      { mid: 1900 },
      { cap: NaN },
      { exposure: -1 },
      { unknown: 1 },
      null,
    ])
      expect(() => validateScenario(s)).toThrow();
  });
});
