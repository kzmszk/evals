import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import llm from "../articles/llm.md?raw";
import physical from "../articles/physical.md?raw";
import Capability from "./Capability";
import { EvidenceCharts } from "./Evidence";
import { SourceLink } from "./SourceLink";
function ReadingProgress() {
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    const update = () => {
      const h = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(h > 0 ? Math.min(100, (window.scrollY / h) * 100) : 0);
    };
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    update();
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, []);
  return (
    <div className="reading-progress" aria-hidden="true">
      <span style={{ width: `${progress}%` }} />
    </div>
  );
}
export default function Article({ kind }: { kind: "llm" | "physical" }) {
  const body = kind === "llm" ? llm : physical;
  const split = body.split(/^## /m);
  const intro = split[0].replace(/^# .*\n/, "");
  const sections = split.slice(1).map((s, i) => ({
    title: s.split("\n")[0].replace(/^\d+．/, ""),
    text: s.slice(s.indexOf("\n") + 1),
    id: `section-${i + 1}`,
  }));
  const title =
    kind === "llm"
      ? "知能の進歩は、\n暮らしをどう変えるか。"
      : "賢い機械が、\n現場に届くまで。";
  const deck =
    kind === "llm"
      ? "AGI、研究の自動化、雇用、再分配。能力の先にある社会の条件を、一つずつほどく。"
      : "電力、ロボット、供給網。物理世界の制約から、日本の次の10年を考える。";
  return (
    <>
      <ReadingProgress />
      <header className={`article-hero ${kind}`}>
        <span className="eyebrow">
          {kind === "llm" ? "ESSAY 01 / 知能と仕事" : "ESSAY 02 / 身体と産業"}
        </span>
        <h1>
          {title.split("\n").map((line, i) => (
            <span key={line}>
              {line}
              {i === 0 && <br />}
            </span>
          ))}
        </h1>
        <p>{deck}</p>
        <div className="article-meta">
          <span>ASTREA 編集</span>
          <span>2026年9月9日</span>
          <span>
            約{(Math.round(body.length / 1000) * 1000).toLocaleString()}字
          </span>
          <span>読了目安 {Math.ceil(body.length / 650)}分</span>
          <button className="link-button" onClick={() => window.print()}>
            印刷 / PDF保存 ↗
          </button>
        </div>
      </header>
      <div className="article-layout">
        <aside className="toc">
          <span className="eyebrow">CONTENTS / 目次</span>
          <a href="#article-summary" className="toc-summary">
            まず、要点を読む
          </a>
          {sections.map((s, i) => (
            <a key={s.id} href={`#${s.id}`}>
              <span>{String(i + 1).padStart(2, "0")}</span>
              {s.title}
            </a>
          ))}
          <Link to="/evidence" className="toc-evidence">
            出典とデータを確認 ↗
          </Link>
        </aside>
        <article className="article-body">
          <section id="article-summary" className="article-summary">
            <span className="eyebrow">3分でつかむ</span>
            <h2>
              {kind === "llm"
                ? "技術の到達年より、社会への伝わり方を見る。"
                : "「作れる」と「使い続けられる」の距離。"}
            </h2>
            <ul>
              {(kind === "llm"
                ? [
                    "評価課題での能力向上は観測できる。ただし、長期の研究・職業全体への転用には検証が要る。",
                    "個別業務の生産性向上と、経済全体の雇用減少は同じ数字ではない。",
                    "日本・米国・中国・EUの違いは、導入、雇用調整、供給網、利益の分配から考える。",
                  ]
                : [
                    "AIの普及には計算だけでなく、電力接続・部品・保守・業務設計が必要になる。",
                    "産業用ロボット、物流機械、介護支援、ヒューマノイドは成熟度も評価の物差しも違う。",
                    "米国の電力と非中国のロボット供給は、設備の完成時期と上流の依存関係が分岐になる。",
                  ]
              ).map((s) => (
                <li key={s}>{s}</li>
              ))}
            </ul>
            <p className="small">
              本文の未来像は、公開資料を踏まえた条件付きの考察です。
            </p>
          </section>
          <div className="prose">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{intro}</ReactMarkdown>
          </div>
          {sections.map((s, i) => (
            <section key={s.id} id={s.id} className="article-section">
              <div className="chapter-number">
                {String(i + 1).padStart(2, "0")} /
              </div>
              <h2>{s.title}</h2>
              <div className="prose">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={{
                    a: ({ children, href }) => (
                      <a
                        href={href}
                        target={href?.startsWith("http") ? "_blank" : undefined}
                        rel="noreferrer"
                      >
                        {children}
                      </a>
                    ),
                  }}
                >
                  {s.text}
                </ReactMarkdown>
              </div>
              {kind === "llm" && s.title.includes("時間地平線") && (
                <Capability />
              )}
              {kind === "physical" && i === 1 && <EvidenceCharts />}
              {kind === "llm" && s.title.includes("雇用") && i < 12 && (
                <ExposureFigure />
              )}
            </section>
          ))}
          <div className="reading-next">
            <div>
              <span className="eyebrow">READ → EXPLORE</span>
              <h2>読むだけでなく、条件を変える。</h2>
              <p>雇用調整と再分配が、結果をどう変えるか。</p>
            </div>
            <Link className="button" to="/simulator">
              未来を試す ↗
            </Link>
          </div>
        </article>
      </div>
    </>
  );
}
export function ExposureFigure() {
  return (
    <figure className="exposure-figure">
      <span className="tag">曝露推計 / 失業予測ではない</span>
      <div className="exposure-content">
        <strong>
          1<span>/4</span>
        </strong>
        <p>
          世界の労働者の約4人に1人が、
          <br />
          生成AIの影響を受けうる職業に就く。
        </p>
      </div>
      <div className="dot-grid" aria-hidden="true">
        {Array.from({ length: 40 }, (_, i) => (
          <i key={i} className={i < 10 ? "exposed" : ""} />
        ))}
      </div>
      <figcaption>
        職業の一部のタスクが変わる可能性を示します。4人に1人が失業する、という意味ではありません。
        <SourceLink id="ilo" />
      </figcaption>
    </figure>
  );
}
