import { useState } from "react";
import { Link } from "react-router-dom";
import Capability from "./Capability";
import { sources } from "./evidence";
import { SourceLink } from "./SourceLink";
export function EvidenceCharts() {
  return (
    <div className="evidence-charts">
      <figure className="data-figure">
        <div className="figure-top">
          <span className="tag">将来推計を含む</span>
          <span>01 / ENERGY</span>
        </div>
        <h3>計算の成長には、電力が要る。</h3>
        <p>世界のデータセンター電力消費（TWh）</p>
        <div className="bars">
          <div>
            <span>2025年</span>
            <i style={{ width: "51.05%" }} />
            <strong>
              485 <small>推計</small>
            </strong>
          </div>
          <div>
            <span>2030年</span>
            <i className="projected" style={{ width: "100%" }} />
            <strong>
              950 <small>中心見通し</small>
            </strong>
          </div>
        </div>
        <figcaption>
          AI以外のサーバー・冷却等も含む。2030年は世界の電力需要の約3%となる見通し。
          <SourceLink id="iea" />
        </figcaption>
      </figure>
      <figure className="data-figure">
        <div className="figure-top">
          <span className="tag">2024年の設置実績</span>
          <span>02 / ROBOTICS</span>
        </div>
        <h3>ロボットの導入は、中国に集まる。</h3>
        <p>世界の産業用ロボット新規設置に占める割合</p>
        <div
          className="stacked"
          role="img"
          aria-label="中国約54%、日本約8%、その他約38%"
        >
          <span style={{ width: "54.4%" }}>54%</span>
          <span style={{ width: "8.2%" }} />
          <span style={{ width: "37.4%" }}>38%</span>
        </div>
        <div className="legend">
          <span>
            <i style={{ background: "#183d35" }} />
            中国 54%
          </span>
          <span>
            <i style={{ background: "#aac879" }} />
            日本 8%
          </span>
          <span>
            <i style={{ background: "#dce3d7" }} />
            その他 38%
          </span>
        </div>
        <figcaption>
          世界約54.2万台。これは設置先の比率で、製造国のシェアでもヒューマノイドの普及率でもない。
          <SourceLink id="ifr" />
        </figcaption>
      </figure>
    </div>
  );
}
export default function Evidence() {
  const [topic, setTopic] = useState("すべて");
  const [query, setQuery] = useState("");
  const filtered = sources.filter(
    (s) =>
      (topic === "すべて" || s.topic === topic) &&
      `${s.title} ${s.org} ${s.finding} ${s.limit}`
        .toLowerCase()
        .includes(query.toLowerCase()),
  );
  return (
    <div className="page">
      <div className="page-heading">
        <div>
          <span className="eyebrow">EVIDENCE DESK / 根拠とデータ</span>
          <h1>数字の意味まで、確かめる。</h1>
          <p>観測・推計・予測を分け、出典の定義と限界を一緒に読む。</p>
        </div>
        <Link className="text-link" to="/method">
          シミュレータの数式 →
        </Link>
      </div>
      <EvidenceCharts />
      <Capability />
      <div className="notice">
        編集基準日：2026年9月9日。公開資料の利用可能な版を記載しています。統計の対象年は資料ごとに異なり、すべてが2026年の実績ではありません。リアルタイム更新ではありません。
      </div>
      <div className="source-tools">
        <label>
          出典を検索
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="雇用、METR、電力…"
          />
        </label>
        <label>
          領域
          <select value={topic} onChange={(e) => setTopic(e.target.value)}>
            {["すべて", ...new Set(sources.map((s) => s.topic))].map((t) => (
              <option key={t}>{t}</option>
            ))}
          </select>
        </label>
        <span aria-live="polite">{filtered.length}件の資料</span>
      </div>
      <div className="source-list">
        {filtered.map((s) => (
          <article className="source-card" key={s.id} id={s.id}>
            <div className="source-meta">
              <span className="tag">{s.kind}</span>
              <span>{s.org}</span>
              <span>{s.date}</span>
            </div>
            <h2>
              <a href={s.url} target="_blank" rel="noreferrer">
                {s.title} ↗
              </a>
            </h2>
            <p>{s.finding}</p>
            <dl>
              <div>
                <dt>対象・期間</dt>
                <dd>{s.period}</dd>
              </div>
              <div>
                <dt>読み違えないために</dt>
                <dd>{s.limit}</dd>
              </div>
            </dl>
          </article>
        ))}
      </div>
      {filtered.length === 0 && (
        <p className="empty">
          一致する資料がありません。検索語か領域を変えてください。
        </p>
      )}
      <section className="reading-note">
        <h2>資料の選び方</h2>
        <p>
          能力評価は測定者の資料、雇用は原著論文、公的な統計は統計機関、将来見通しは予測者の原文を優先しました。企業のデモ、投資発表、政策目標は実装の実績と区別します。モデル名だけで能力を推定せず、再現可能な評価と導入実績を確認します。
        </p>
        <p>
          本サイトの国別シミュレータは、これらの資料の推計を再現したものではありません。公開研究が示す仕組みを参考に、すべての係数を開示した説明用モデルを別に実装しています。
        </p>
      </section>
    </div>
  );
}
