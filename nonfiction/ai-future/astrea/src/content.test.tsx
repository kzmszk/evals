import { describe, it, expect } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { MemoryRouter } from "react-router-dom";
import Article from "./Article";
import Simulator from "./Simulator";
import Policy from "./Policy";
import Evidence from "./Evidence";
import Method from "./Method";
import Capability from "./Capability";
import data from "./data/metr.json";
import { sources } from "./evidence";

describe("content and route integration", () => {
  it("all reading and interactive routes render without missing sources or import cycles", () => {
    for (const content of [
      <Article kind="llm" />,
      <Article kind="physical" />,
      <Simulator />,
      <Policy />,
      <Evidence />,
      <Method />,
      <Capability />,
    ]) {
      const html = renderToStaticMarkup(<MemoryRouter>{content}</MemoryRouter>);
      expect(html.length).toBeGreaterThan(1000);
      expect(html).not.toMatch(/NaN|undefined/);
    }
  });
  it("every generated article table-of-contents link points to its section", () => {
    for (const kind of ["llm", "physical"] as const) {
      const html = renderToStaticMarkup(
        <MemoryRouter>
          <Article kind={kind} />
        </MemoryRouter>,
      );
      const ids = [...html.matchAll(/id="(section-\d+)"/g)].map((m) => m[1]);
      expect(new Set(ids).size).toBe(ids.length);
      expect(ids.length).toBeGreaterThan(8);
      for (const id of ids) expect(html).toContain(`href="#${id}"`);
    }
  });
  it("measurement provenance and interval bounds are intact", () => {
    expect(data.units).toBe("minutes");
    expect(data.sha256).toMatch(/^[a-f0-9]{64}$/);
    for (const row of data.rows) {
      for (const rate of ["p50", "p80"] as const) {
        expect(row[rate].ci_low).toBeLessThanOrEqual(row[rate].estimate);
        expect(row[rate].ci_high).toBeGreaterThanOrEqual(row[rate].estimate);
      }
      expect(row.p80.estimate).toBeLessThan(row.p50.estimate);
    }
    expect(new Set(sources.map((s) => s.id)).size).toBe(sources.length);
  });
});
