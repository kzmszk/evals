import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  bounds,
  defaults,
  presets,
  regions,
  simulate,
  validateScenario,
  type Scenario,
  type Point,
  type RegionId,
} from "./model";
const specs: {
  key: keyof Scenario;
  title: string;
  step: number;
  unit: string;
  hint: string;
}[] = [
  {
    key: "mid",
    title: "能力の伸びが最も速い年",
    step: 1,
    unit: "年",
    hint: "AGIの実現年ではなく、自動化能力曲線の仮定",
  },
  {
    key: "speed",
    title: "能力が進歩する速さ",
    step: 0.1,
    unit: "",
    hint: "大きいほど短期間に能力が高まる",
  },
  {
    key: "cap",
    title: "自動化能力の上限",
    step: 0.05,
    unit: "%",
    hint: "技術的に扱えるタスクの上限",
  },
  {
    key: "lag",
    title: "身体タスクの遅れ",
    step: 1,
    unit: "年",
    hint: "認知タスクに対する追加の時間差",
  },
  {
    key: "exposure",
    title: "雇用が代替にさらされる強さ",
    step: 0.05,
    unit: "%",
    hint: "自動化の進行が仕事の代替につながる係数",
  },
  {
    key: "supply",
    title: "非中国への供給遅延",
    step: 0.5,
    unit: "年",
    hint: "部品供給の遅れを仮定。輸出規制の予測ではない",
  },
  {
    key: "retraining",
    title: "再就職・社内移行の支援",
    step: 0.05,
    unit: "pt",
    hint: "年間の再吸収率に加算。政策効果は仮定",
  },
  {
    key: "replacement",
    title: "失業給付の所得補償率",
    step: 0.1,
    unit: "%",
    hint: "基準賃金に対する給付。既存失業者も含む",
  },
  {
    key: "ubi",
    title: "一律給付の水準",
    step: 0.025,
    unit: "%",
    hint: "基準賃金比。全労働力に3年で段階導入",
  },
  {
    key: "tax",
    title: "家計市場所得への税率",
    step: 0.05,
    unit: "%",
    hint: "同じ税・給付設定を比較基準にも適用",
  },
];
const fmt = (v: number) => v.toFixed(1);
type Metric = "gdp" | "unemployment" | "income" | "stress";
const metrics: { key: Metric; title: string; unit: string }[] = [
  { key: "gdp", title: "実質GDP", unit: "2026年=100" },
  { key: "unemployment", title: "失業率", unit: "%・初期値は全地域共通の仮定" },
  {
    key: "income",
    title: "家計の可処分所得",
    unit: "標準政策の2026年=100・労働力1人当たり",
  },
  { key: "stress", title: "移行ストレス", unit: "0–100・仮定による合成指標" },
];
export function Chart({
  series,
  metric,
  reference,
}: {
  series: { name: string; color: string; points: Point[] }[];
  metric: Metric;
  reference?: Point[];
}) {
  const vals = series.flatMap((s) => s.points.map((p) => p[metric]));
  if (reference && (metric === "gdp" || metric === "income"))
    vals.push(
      ...reference.map((p) =>
        metric === "gdp" ? p.reference : p.incomeReference,
      ),
    );
  let lo =
    metric === "gdp" || metric === "income"
      ? Math.floor(Math.min(...vals) / 10) * 10
      : 0;
  const hi =
    metric === "stress"
      ? 100
      : Math.ceil(Math.max(...vals) / (metric === "unemployment" ? 2 : 10)) *
        (metric === "unemployment" ? 2 : 10);
  const max = Math.max(lo + 1, hi);
  const x = (i: number) => 55 + i * 58;
  const y = (v: number) => 245 - ((v - lo) / (max - lo)) * 200;
  const line = (points: Point[], ref = false) =>
    points
      .map(
        (p, i) =>
          `${i ? "L" : "M"}${x(i)} ${y(ref ? (metric === "gdp" ? p.reference : p.incomeReference) : p[metric])}`,
      )
      .join(" ");
  return (
    <svg
      className="chart"
      viewBox="0 0 675 285"
      role="img"
      aria-label={`${metrics.find((m) => m.key === metric)?.title}の2026〜2036年シナリオ比較。数値は下の表で確認できます。`}
    >
      {[0, 1, 2, 3, 4].map((i) => (
        <g key={i}>
          <line
            x1="55"
            x2="635"
            y1={45 + i * 50}
            y2={45 + i * 50}
            stroke="#dce2db"
          />
          <text x="43" y={50 + i * 50} textAnchor="end">
            {fmt(max - ((max - lo) * i) / 4)}
          </text>
        </g>
      ))}
      {[0, 2, 4, 6, 8, 10].map((i) => (
        <text key={i} x={x(i)} y="273" textAnchor="middle">
          {2026 + i}
        </text>
      ))}
      {reference && (metric === "gdp" || metric === "income") && (
        <path
          d={line(reference, true)}
          fill="none"
          stroke="#829087"
          strokeWidth="2"
          strokeDasharray="5 5"
        />
      )}
      {series.map((s) => (
        <g key={s.name}>
          <path
            d={line(s.points)}
            fill="none"
            stroke={s.color}
            strokeWidth="2.8"
          />
          {s.points.map((p, i) => (
            <circle key={i} cx={x(i)} cy={y(p[metric])} r="3" fill={s.color}>
              <title>
                {s.name} {p.year}年: {fmt(p[metric])}
              </title>
            </circle>
          ))}
        </g>
      ))}
    </svg>
  );
}
export default function Simulator() {
  const [scenario, setScenario] = useState<Scenario>(defaults);
  const [country, setCountry] = useState<RegionId>("jp");
  const [metric, setMetric] = useState<Metric>("gdp");
  const [compare, setCompare] = useState(false);
  const [off, setOff] = useState(false);
  const runs = useMemo(
    () => regions.map((r) => ({ ...r, points: simulate(r, scenario, !off) })),
    [scenario, off],
  );
  const chosen = runs.find((r) => r.id === country)!;
  const end = chosen.points[10];
  const [saved, setSaved] = useState("");
  useEffect(() => {
    const context = (
      document as Document & {
        modelContext?: {
          registerTool: (
            tool: unknown,
            options: { signal: AbortSignal },
          ) => void | Promise<void>;
        };
      }
    ).modelContext;
    if (!context) return;
    const controller = new AbortController();
    const tool = {
      name: "configure_ai_scenario",
      description:
        "AIの追加普及シナリオを設定し、4地域の2036年の結果を返す。入力は仮定であり予測ではない。",
      inputSchema: {
        type: "object",
        properties: Object.fromEntries(
          Object.entries(bounds).map(([k, [minimum, maximum]]) => [
            k,
            { type: "number", minimum, maximum },
          ]),
        ),
        additionalProperties: false,
      },
      annotations: { readOnlyHint: false },
      execute: (input: unknown) => {
        const next = validateScenario(input);
        setScenario(next);
        setOff(false);
        return {
          assumptions: next,
          results: regions.map((r) => ({
            region: r.name,
            ...simulate(r, next).at(-1),
          })),
        };
      },
    };
    try {
      Promise.resolve(
        context.registerTool(tool, { signal: controller.signal }),
      ).catch(() => {});
    } catch {}
    return () => controller.abort();
  }, []);
  function download() {
    const fields = [
      "year",
      "gdp",
      "reference",
      "unemployment",
      "latent",
      "wage",
      "income",
      "incomeReference",
      "stress",
      "transfers",
      "balance",
      "fiscalDifference",
    ] as const;
    const assumptions = Object.entries(scenario).map(([k, v]) => `# ${k},${v}`);
    const csv = [
      "# ASTREA 仮定に基づく例示モデル。国別の実績・予測ではありません。",
      `# AI追加普及,${!off}`,
      ...assumptions,
      ["region", ...fields].join(","),
      ...runs.flatMap((r) =>
        r.points.map((p) => [r.name, ...fields.map((k) => p[k])].join(",")),
      ),
    ].join("\n");
    const url = URL.createObjectURL(
      new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8" }),
    );
    const a = document.createElement("a");
    a.href = url;
    a.download = "astrea-scenario.csv";
    a.click();
    URL.revokeObjectURL(url);
    setSaved("仮定と年次結果をCSVに出力しました。");
  }
  return (
    <div className="page">
      <div className="page-heading">
        <div>
          <span className="eyebrow">SCENARIO LAB / 仮定を動かす</span>
          <h1>未来は、条件で変わる。</h1>
          <p>
            同じAIでも、導入の速さと移行支援によって、暮らしへの届き方は変わります。
          </p>
        </div>
        <span className="outline-tag">2026 → 2036</span>
      </div>
      <div className="notice">
        <strong>これは予測ではなく、仕組みを考える実験です。</strong>{" "}
        国・地域の係数と失業率の初期値は例示用の仮定です。灰色の破線は「2026年以降にAIの追加普及がない場合」。将来の事件やUBI導入年を算出するものではありません。{" "}
        <Link to="/method">計算方法と限界 →</Link>
      </div>
      <div className="preset-grid">
        {presets.map((p) => (
          <button
            key={p.name}
            aria-pressed={
              !off && JSON.stringify(scenario) === JSON.stringify(p.scenario)
            }
            className={
              JSON.stringify(scenario) === JSON.stringify(p.scenario)
                ? "preset selected"
                : "preset"
            }
            onClick={() => {
              setScenario({ ...p.scenario });
              setOff(false);
            }}
          >
            <strong>{p.name}</strong>
            <span>{p.note}</span>
          </button>
        ))}
      </div>
      <div className="lab">
        <aside className="controls">
          <div className="control-head">
            <h2>条件を設定</h2>
            <button
              className="link-button"
              onClick={() => {
                setScenario({ ...defaults });
                setOff(false);
              }}
            >
              リセット
            </button>
          </div>
          <label className="switch">
            <input
              type="checkbox"
              checked={off}
              onChange={(e) => setOff(e.target.checked)}
            />{" "}
            AIの追加普及を止める
          </label>
          {specs.map((spec) => (
            <label className="slider" key={spec.key}>
              <span>
                {spec.title}
                <output>
                  {spec.unit === "%" || spec.unit === "pt"
                    ? Math.round(scenario[spec.key] * 100)
                    : scenario[spec.key]}
                  {spec.unit}
                </output>
              </span>
              <input
                type="range"
                min={bounds[spec.key][0]}
                max={bounds[spec.key][1]}
                step={spec.step}
                value={scenario[spec.key]}
                onChange={(e) =>
                  setScenario({
                    ...scenario,
                    [spec.key]: Number(e.target.value),
                  })
                }
              />
              <small>{spec.hint}</small>
            </label>
          ))}
          <p className="small">
            家計所得指数は標準政策の2026年を固定基準にします。税率・失業給付を変えると初期値も変わります。給付は家計所得と財政に反映します。消費刺激・増税の成長効果、移行支援の事業費は計算に含みません。
          </p>
        </aside>
        <div className="results">
          <div className="country-tabs" aria-label="地域を選択">
            {regions.map((r) => (
              <button
                key={r.id}
                aria-pressed={country === r.id}
                className={country === r.id ? "active" : ""}
                onClick={() => setCountry(r.id)}
              >
                {r.name}
              </button>
            ))}
          </div>
          <div className="results-heading">
            <div>
              <span className="eyebrow">
                {chosen.name} / {chosen.label}
              </span>
              <h2>2036年の姿を比較する</h2>
            </div>
            <label className="switch">
              <input
                type="checkbox"
                checked={compare}
                onChange={(e) => setCompare(e.target.checked)}
              />
              4地域を重ねる
            </label>
          </div>
          <div className="stat-grid">
            <div>
              <span>GDP・追加普及なし比</span>
              <strong>
                {end.gdp / end.reference >= 1 ? "+" : ""}
                {fmt((end.gdp / end.reference - 1) * 100)}
                <small>%</small>
              </strong>
            </div>
            <div>
              <span>失業率・初期値との差</span>
              <strong>
                +{fmt(end.unemployment - 5)}
                <small>pt</small>
              </strong>
            </div>
            <div>
              <span>家計所得・追加普及なし比</span>
              <strong>
                {end.income / end.incomeReference >= 1 ? "+" : ""}
                {fmt((end.income / end.incomeReference - 1) * 100)}
                <small>%</small>
              </strong>
            </div>
          </div>
          <div className="metric-tabs">
            {metrics.map((m) => (
              <button
                key={m.key}
                aria-pressed={metric === m.key}
                onClick={() => setMetric(m.key)}
                className={metric === m.key ? "active" : ""}
              >
                {m.title}
              </button>
            ))}
          </div>
          <div className="chart-heading">
            <strong>{metrics.find((m) => m.key === metric)!.title}</strong>
            <span>{metrics.find((m) => m.key === metric)!.unit}</span>
          </div>
          <Chart
            metric={metric}
            series={compare ? runs : [chosen]}
            reference={!compare ? chosen.points : undefined}
          />
          <div className="legend">
            {(compare ? runs : [chosen]).map((r) => (
              <span key={r.id}>
                <i style={{ background: r.color }} />
                {r.name}
              </span>
            ))}
            {!compare && (metric === "gdp" || metric === "income") && (
              <span>
                <i className="dash" />
                追加普及なし
              </span>
            )}
          </div>
          {compare && (
            <p className="small">
              国ごとの背景成長率も仮定です。地域間のGDP指数の大小を、AIの効果の差と読み替えないでください。
            </p>
          )}
          {metric === "stress" && (
            <p className="notice">
              移行ストレスは失業増・社内調整・所得減を合成した説明用の点数です。暴動や政変の確率、実測された社会安定性を意味しません。
            </p>
          )}
          <div className="interpretation">
            <span className="eyebrow">結果の読み方</span>
            <h3>
              {Math.abs(end.gdp - end.reference) < 1e-8
                ? "AIの追加普及がない比較基準と、同じ経路です。"
                : end.gdp > end.reference
                  ? "経済が大きくなっても、移行は残る。"
                  : "移行の損失が、生産性の利益を上回ることもある。"}
            </h3>
            <p>
              この仮定では{chosen.name}の失業率は{fmt(end.unemployment)}
              %、採用凍結・配置転換などの社内調整は初期就業者の{fmt(end.latent)}
              %に相当します。就業者の平均賃金指数は{fmt(end.wage)}
              、給付と税を含む家計所得指数は{fmt(end.income)}
              です。両者は対象も意味も異なります。
            </p>
            <p>
              給付総額はGDP比{fmt(end.transfers)}
              %。モデル内の税収から給付を引いた収支はGDP比{fmt(end.balance)}
              %、追加普及なしとの差は基準GDP比{fmt(end.fiscalDifference)}
              ポイントです。医療・教育・年金などを含む政府全体の財政収支ではありません。
            </p>
          </div>
          <details className="data-table">
            <summary>年次データを確認する</summary>
            <div className="table-scroll">
              <table>
                <caption>{chosen.name} — 現在の条件</caption>
                <thead>
                  <tr>
                    <th>年</th>
                    <th>GDP指数</th>
                    <th>比較基準</th>
                    <th>失業率 %</th>
                    <th>家計所得指数</th>
                    <th>ストレス</th>
                  </tr>
                </thead>
                <tbody>
                  {chosen.points.map((p) => (
                    <tr key={p.year}>
                      <th>{p.year}</th>
                      <td>{fmt(p.gdp)}</td>
                      <td>{fmt(p.reference)}</td>
                      <td>{fmt(p.unemployment)}</td>
                      <td>{fmt(p.income)}</td>
                      <td>{fmt(p.stress)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </details>
          <div className="lab-footer">
            <button className="button" onClick={download}>
              仮定と結果をCSVで保存 ↓
            </button>
            <Link to="/method">全係数と数式を見る →</Link>
          </div>
          <p role="status" className="small">
            {saved}
          </p>
        </div>
      </div>
    </div>
  );
}
