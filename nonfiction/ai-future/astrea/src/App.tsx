import React, { useEffect, lazy, Suspense } from "react";
import { Link, NavLink, Route, Routes, useLocation } from "react-router-dom";
const Article = lazy(() => import("./Article"));
const Simulator = lazy(() => import("./Simulator"));
import Evidence, { EvidenceCharts } from "./Evidence";
import { SourceLink } from "./SourceLink";
const Policy = lazy(() => import("./Policy"));
const Method = lazy(() => import("./Method"));
const nav = [
  ["/", "概観"],
  ["/llm", "知能と仕事"],
  ["/physical", "身体と産業"],
  ["/simulator", "未来を試す"],
  ["/policy", "政策ブリーフ"],
  ["/evidence", "根拠と方法"],
];
function ScrollReset() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
    document.title = `${nav.find((n) => n[0] === pathname)?.[1] ?? "計算方法"} | ASTREA AI FUTURES`;
  }, [pathname]);
  return null;
}
export default function App() {
  return (
    <>
      <ScrollReset />
      <a className="skip-link" href="#main">
        本文へ移動
      </a>
      <header className="header">
        <Link className="brand" to="/">
          <span className="brand-mark">A</span> ASTREA{" "}
          <small>AI FUTURES OBSERVATORY</small>
        </Link>
        <nav>
          {nav.map(([to, title]) => (
            <NavLink key={to} to={to} end={to === "/"}>
              {title}
            </NavLink>
          ))}
        </nav>
        <span className="edition">2026 — 2036</span>
      </header>
      <main id="main">
        <Suspense
          fallback={
            <div className="page" role="status">
              ページを読み込んでいます…
            </div>
          }
        >
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/llm" element={<Article kind="llm" />} />
            <Route path="/physical" element={<Article kind="physical" />} />
            <Route path="/simulator" element={<Simulator />} />
            <Route path="/policy" element={<Policy />} />
            <Route path="/evidence" element={<Evidence />} />
            <Route path="/method" element={<Method />} />
            <Route
              path="*"
              element={
                <div className="page">
                  <h1>ページが見つかりません。</h1>
                  <Link to="/">概観に戻る →</Link>
                </div>
              }
            />
          </Routes>
        </Suspense>
      </main>
      <footer>
        <strong>ASTREA / AI FUTURES</strong>
        <span>根拠を確かめ、仮定を動かし、選択を考える。</span>
        <span>
          編集基準日 2026.09.09 <Link to="/evidence">出典</Link> /{" "}
          <Link to="/method">方法</Link>
        </span>
      </footer>
    </>
  );
}
function Home() {
  return (
    <>
      <section className="hero">
        <div>
          <div className="eyebrow">THE NEXT DECADE / AIと社会の10年</div>
          <h1>
            AIの未来を、
            <br />
            社会の<span>選択</span>へ。
          </h1>
          <p className="hero-intro">
            知能が進歩する。その先で、暮らしは豊かになるか。
            <br />
            仕事、電力、ロボット、分配。
            <br />
            技術の可能性と社会の準備を、分けて考える。
          </p>
          <div className="hero-links">
            <Link className="button" to="/llm">
              知能と仕事を読む <b>↗</b>
            </Link>
            <Link className="text-link" to="/policy">
              政策の要点から読む →
            </Link>
          </div>
          <p className="small hero-note">
            観測された事実 / 条件付きの見通し / 政策の選択肢
          </p>
        </div>
        <div
          className="horizon"
          aria-label="能力の進歩と社会への普及には時間差がある概念図"
        >
          <div className="diagram-label">同じ未来にも、違う速度。</div>
          <svg viewBox="0 0 520 350" role="img">
            <title>
              能力、導入、分配は異なる速度で進む概念図。数値予測ではない。
            </title>
            <defs>
              <linearGradient id="fade" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#abcf6a" stopOpacity=".25" />
                <stop offset="100%" stopColor="#abcf6a" stopOpacity="0" />
              </linearGradient>
            </defs>
            {[75, 150, 225, 300].map((y) => (
              <line key={y} x1="25" y1={y} x2="490" y2={y} stroke="#ffffff20" />
            ))}
            <path
              d="M25 295 C120 290 130 50 270 50 L490 50 L490 320 L25 320Z"
              fill="url(#fade)"
            />
            <path
              d="M25 295 C120 290 130 50 270 50 L490 50"
              stroke="#cfed98"
              strokeWidth="3"
              fill="none"
            />
            <path
              d="M25 305 C210 305 210 130 340 125 L490 125"
              stroke="#80bfc0"
              strokeWidth="3"
              fill="none"
            />
            <path
              d="M25 310 C280 310 310 213 490 205"
              stroke="#e9bd84"
              strokeWidth="3"
              fill="none"
              strokeDasharray="7 6"
            />
            <text x="400" y="36">
              AIの能力
            </text>
            <text x="400" y="111">
              現場への導入
            </text>
            <text x="389" y="191">
              暮らしの改善
            </text>
            <text x="25" y="343">
              いま
            </text>
            <text x="461" y="343">
              10年後
            </text>
          </svg>
          <div className="diagram-foot">
            <span>能力 ≠ 導入 ≠ 分配</span>
            <small>関係を示す概念図・予測値ではありません</small>
          </div>
        </div>
      </section>
      <section className="section">
        <div className="section-heading">
          <span className="eyebrow">01 / 読み解くための視点</span>
          <h2>三つの問いを、混ぜない。</h2>
        </div>
        <div className="three-grid">
          {[
            [
              "01",
              "AIは、何ができるか。",
              "評価課題の成績と、責任を伴う実務の完遂は別の問題。AGIの時期を語る前に、何をもって到達とするかを定める。",
            ],
            [
              "02",
              "社会は、どこまで使えるか。",
              "電力、設備投資、業務の再設計。ソフトウェアの速さが、産業全体の成長速度になるとは限らない。",
            ],
            [
              "03",
              "利益は、誰に届くか。",
              "GDPが増えても、すべての人の賃金が増えるとは限らない。雇用の入口と、移行期を支える制度を見つめる。",
            ],
          ].map(([n, h, p]) => (
            <article className="idea" key={n}>
              <span className="number">{n}</span>
              <h3>{h}</h3>
              <p>{p}</p>
            </article>
          ))}
        </div>
      </section>
      <HomeMore />
    </>
  );
}
function HomeMore() {
  return (
    <>
      <section className="section essays">
        <div className="section-heading">
          <span className="eyebrow">02 / 二つの論考</span>
          <h2>画面の中から、社会の現場へ。</h2>
        </div>
        <div className="essay-grid">
          <Link to="/llm" className="essay-card">
            <span className="eyebrow">ESSAY 01 — INTELLIGENCE</span>
            <h3>
              知能の進歩は、
              <br />
              暮らしをどう変えるか。
            </h3>
            <p>
              AGIの定義から、研究の自動化、雇用、再分配まで。能力の向上が社会へ伝わる道筋を読む。
            </p>
            <div>
              <span>長編論考 / 約2万字</span>
              <b>↗</b>
            </div>
          </Link>
          <Link to="/physical" className="essay-card physical-card">
            <span className="eyebrow">ESSAY 02 — PHYSICAL WORLD</span>
            <h3>
              賢い機械が、
              <br />
              現場に届くまで。
            </h3>
            <p>
              電力、工場、物流、介護、供給網。物理世界の制約から、ロボットの次の10年を読む。
            </p>
            <div>
              <span>長編論考 / 約1万字</span>
              <b>↗</b>
            </div>
          </Link>
        </div>
      </section>
      <section className="section">
        <div className="section-heading">
          <span className="eyebrow">03 / 観測から始める</span>
          <h2>二つの数字、二つの注意点。</h2>
        </div>
        <EvidenceCharts />
        <Link to="/evidence" className="text-link">
          出典・対象年・限界を一覧で見る →
        </Link>
      </section>
      <section className="section timeline-section">
        <div className="section-heading">
          <span className="eyebrow">04 / 条件付きの見通し</span>
          <h2>2036年までの、分岐点。</h2>
        </div>
        <p className="section-intro">
          以下は編集上の中心見通しです。確定した日程ではなく、条件が崩れれば見直す仮説として置きます。
        </p>
        <div className="timeline">
          <article>
            <span>2026 — 2029</span>
            <h3>補助から、業務の組み替えへ。</h3>
            <p>
              検証しやすい仕事でAIの担当範囲が広がる。能力の伸びだけでなく、採用・訓練・実導入の変化を見る。
            </p>
            <small>確認する条件</small>
            <strong>人間の確認を含む費用が下がるか</strong>
          </article>
          <article>
            <span>2030 — 2033</span>
            <h3>広がる利益と、残る制約。</h3>
            <p>
              設備と業務の更新が進む地域で生産性が上がる一方、電力や技能の不足が導入の差を生む。
            </p>
            <small>確認する条件</small>
            <strong>電力・保守・再就職が追いつくか</strong>
          </article>
          <article>
            <span>2034 — 2036</span>
            <h3>成長の果実を、生活へ。</h3>
            <p>
              研究自動化が再現可能なら上振れもある。どの能力水準でも、利益の帰属と所得への経路が問われる。
            </p>
            <small>確認する条件</small>
            <strong>所得・労働時間・公共サービスが改善するか</strong>
          </article>
        </div>
      </section>
      <section className="section forecast-audit">
        <div className="section-heading">
          <span className="eyebrow">05 / 過去の予測を読む</span>
          <h2>当たった、の前に。何を予測したか。</h2>
        </div>
        <div className="audit-row">
          <div>
            <span className="tag">2024年の論考</span>
            <h3>Situational Awareness</h3>
            <SourceLink id="sa" />
          </div>
          <p>
            計算量・効率・研究自動化が進む経路を重視。投資や能力の進歩だけで、研究者水準の自律性まで証明されたとは言えない。
          </p>
          <strong className="verdict">最終到達点は未判定</strong>
        </div>
        <div className="audit-row">
          <div>
            <span className="tag">2025年のシナリオ</span>
            <h3>AI 2027</h3>
            <SourceLink id="ai2027" />
          </div>
          <p>
            2027年に研究自動化が加速する具体的な経路。物語の日付、著者の中央値、その後の改訂を分けて読む。
          </p>
          <strong className="verdict">シナリオとして評価</strong>
        </div>
        <p className="small">
          基準日は2026年9月9日。未来の到達点は成功・失敗を判定できません。本文では定義、観測範囲、前提の違いを点検します。
        </p>
      </section>
      <section className="lab-invite">
        <div>
          <span className="eyebrow">SCENARIO LAB</span>
          <h2>
            同じAIでも、
            <br />
            同じ未来にはならない。
          </h2>
          <p>
            4地域の制度を表す仮定で、GDP、失業、家計所得を比較。
            <br />
            AIの進化と政策の条件を、自分で変えて確かめる。
          </p>
          <Link to="/simulator" className="button">
            未来を試す ↗
          </Link>
        </div>
        <div className="invite-diagram">
          <span>AIの追加普及</span>
          <b>↓</b>
          <div>
            <span>生産性の利益</span>
            <span>雇用の移行</span>
          </div>
          <b>↓</b>
          <span>税・給付・再就職の速さ</span>
          <b>↓</b>
          <strong>家計へ、どれだけ届くか。</strong>
        </div>
      </section>
      <section className="section glossary">
        <div className="section-heading">
          <span className="eyebrow">言葉をほどく</span>
          <h2>知っておきたい、六つの区別。</h2>
        </div>
        <div className="three-grid">
          {[
            [
              "AGI",
              "幅広い知的仕事を自律的に行うAI。共通の測定定義はまだなく、ここではトップ研究者・技術者の仕事を継続して遂行できることを重視。",
            ],
            [
              "知能爆発",
              "AIがAI研究を加速し、能力向上がさらに研究を加速する循環。実験・評価・計算資源が追いつくかが条件。",
            ],
            [
              "産業爆発",
              "生産や供給能力が急速に拡大すること。知能の進歩に加え、設備、電力、人材、需要が必要。",
            ],
            [
              "曝露（影響の可能性）",
              "仕事の一部がAIで変わりうる度合い。現実の導入率でも、失業する確率でもない。",
            ],
            [
              "生産性",
              "同じ資源でどれだけの価値を生むか。個人の作業時間短縮と、国全体のGDP増加は区別する。",
            ],
            [
              "再分配",
              "税と給付などで所得の配分を変えること。UBIは一つの方式で、給付の範囲と財源を同時に考える。",
            ],
          ].map(([h, p]) => (
            <article key={h}>
              <h3>{h}</h3>
              <p>{p}</p>
            </article>
          ))}
        </div>
      </section>
    </>
  );
}
