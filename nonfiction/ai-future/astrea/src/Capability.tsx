import { useState } from "react";
import data from "./data/metr.json";
import { SourceLink } from "./SourceLink";
const colors: Record<string, string> = {
  Anthropic: "#b76741",
  OpenAI: "#286e58",
  Google: "#42759b",
};
const duration = (m: number) =>
  m >= 60 ? `${(m / 60).toFixed(1)}時間` : `${m.toFixed(1)}分`;
export default function Capability() {
  const [rate, setRate] = useState<"p50" | "p80">("p50");
  const [selected, setSelected] = useState(data.rows.at(-1)!.id);
  const row = data.rows.find((r) => r.id === selected)!;
  const metric = row[rate];
  const start = Date.parse("2023-01-01"),
    end = Date.parse("2026-07-01");
  const x = (d: string) => 65 + ((Date.parse(d) - start) / (end - start)) * 665;
  const y = (m: number) =>
    290 - ((Math.log10(Math.max(0.1, m)) + 1) / (Math.log10(4096) + 1)) * 250;
  return (
    <figure className="capability-figure">
      <div className="figure-top">
        <span className="tag">METR / TH 1.1 公開データ</span>
        <span>測定ページ更新 2026.05.08</span>
      </div>
      <h3>長い課題へ進む能力。成功率を上げると、見え方が変わる。</h3>
      <p>
        人間の専門家の所要時間で測った、AIが成功できる課題の難しさ。縦軸は対数目盛です。
      </p>
      <div className="capability-controls">
        <div className="metric-tabs">
          <button
            aria-pressed={rate === "p50"}
            className={rate === "p50" ? "active" : ""}
            onClick={() => setRate("p50")}
          >
            50%成功
          </button>
          <button
            aria-pressed={rate === "p80"}
            className={rate === "p80" ? "active" : ""}
            onClick={() => setRate("p80")}
          >
            80%成功
          </button>
        </div>
        <label>
          モデルを詳しく見る
          <select
            value={selected}
            onChange={(e) => setSelected(e.target.value)}
          >
            {data.rows.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name}
              </option>
            ))}
          </select>
        </label>
      </div>
      <svg
        viewBox="0 0 790 345"
        className="capability-chart"
        role="img"
        aria-label={`2023〜2026年に公開されたモデルの${rate === "p50" ? "50" : "80"}%成功時間地平線。数値と不確実性範囲は表でも確認できます。`}
      >
        <rect x="65" y="40" width="665" height={y(960) - 40} fill="#f1e9dc" />
        {[1, 10, 60, 240, 960, 3840].map((t) => (
          <g key={t}>
            <line
              x1="65"
              x2="730"
              y1={y(t)}
              y2={y(t)}
              stroke="#d5ded0"
              strokeDasharray={t === 960 ? "5 5" : undefined}
            />
            <text x="55" y={y(t) + 4} textAnchor="end">
              {t < 60 ? `${t}分` : `${t / 60}時間`}
            </text>
          </g>
        ))}
        {["2023-01-01", "2024-01-01", "2025-01-01", "2026-01-01"].map((d) => (
          <text key={d} x={x(d)} y="320" textAnchor="middle">
            {d.slice(0, 4)}
          </text>
        ))}
        <text x="720" y="29" textAnchor="end">
          16時間超は測定が不安定
        </text>
        {data.rows.map((r) => (
          <g key={r.id}>
            <line
              x1={x(r.date)}
              x2={x(r.date)}
              y1={y(r[rate].ci_low)}
              y2={y(r[rate].ci_high)}
              stroke={colors[r.vendor]}
              opacity={r.id === selected ? 1 : 0.22}
              strokeWidth={r.id === selected ? 2 : 1}
            />
            <circle
              cx={x(r.date)}
              cy={y(r[rate].estimate)}
              r={r.id === selected ? 6 : 3.5}
              fill={colors[r.vendor]}
              stroke={r.id === selected ? "#152e26" : "none"}
              strokeWidth="2"
            >
              <title>
                {r.name} / {r.date}: {duration(r[rate].estimate)} (
                {duration(r[rate].ci_low)}〜{duration(r[rate].ci_high)})
              </title>
            </circle>
          </g>
        ))}
      </svg>
      <div className="legend">
        {Object.entries(colors).map(([n, c]) => (
          <span key={n}>
            <i style={{ background: c }} />
            {n}
          </span>
        ))}
        <span>縦線：元資料の不確実性範囲</span>
      </div>
      <div className="selected-measure">
        <div>
          <span>
            {row.name} / 公開日 {row.date}
          </span>
          <strong>{duration(metric.estimate)}</strong>
        </div>
        <p>
          {rate === "p50" ? "半分" : "80%"}
          の成功率に対応する推定値。元データの範囲は{duration(metric.ci_low)}〜
          {duration(metric.ci_high)}。
          {metric.estimate > 960 && (
            <b>
              {" "}
              中心推定が16時間を超えるため、METRが信頼性の限界を明示しています。
            </b>
          )}
        </p>
      </div>
      <figcaption>
        AIが連続して働ける時間ではありません。主にソフトウェア課題で、実際の職業全体への外挿はできません。2023年以降の収録モデルを表示し、将来への回帰線は引いていません。元YAML取得日：2026年9月9日。
        <SourceLink id="metr" />
        <a
          className="source-link"
          href={data.source}
          target="_blank"
          rel="noreferrer"
        >
          測定値の元データ（YAML） ↗
        </a>
      </figcaption>
      <details className="data-table">
        <summary>測定値を表で確認する</summary>
        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>モデル / 公開日</th>
                <th>50%成功</th>
                <th>80%成功</th>
              </tr>
            </thead>
            <tbody>
              {data.rows.map((r) => (
                <tr key={r.id}>
                  <th>
                    {r.name}
                    <small className="table-date">{r.date}</small>
                  </th>
                  <td>
                    {duration(r.p50.estimate)}
                    <small className="table-date">
                      {duration(r.p50.ci_low)}–{duration(r.p50.ci_high)}
                    </small>
                  </td>
                  <td>
                    {duration(r.p80.estimate)}
                    <small className="table-date">
                      {duration(r.p80.ci_low)}–{duration(r.p80.ci_high)}
                    </small>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </details>
    </figure>
  );
}
