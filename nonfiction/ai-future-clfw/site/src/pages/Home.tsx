import { Link } from 'react-router-dom'
import { FIGURES } from '../components/charts/registry'

const HEADLINES = [
  {
    stat: '2031年',
    label: 'AGI到達の中央値',
    desc: 'トップ研究者級の仕事を自律遂行するAI。2029年以前の確率25%',
  },
  {
    stat: '約4ヶ月',
    label: 'AIがこなせるタスク長の倍増周期',
    desc: 'METR実測。2023年の7ヶ月から加速中',
  },
  {
    stat: '-16%',
    label: '米国の若年AI高曝露職の雇用',
    desc: '2022年末比。マクロ失業率は歴史的低水準のまま',
  },
  {
    stat: '8倍',
    label: '中国と米国の発電容量新設ペース差',
    desc: '2025年実績。電力がAI進化の律速になる',
  },
]

const MetrFig = FIGURES['metr-horizon'].Component

export default function Home() {
  return (
    <div className="page home">
      <section className="hero">
        <h1>
          機械が仕事を覚える速度
          <span className="hero-sub">データで読むAIの10年予測</span>
        </h1>
        <p className="hero-lead">
          AGIはいつ来るのか。知能爆発と産業爆発は起きるのか。仕事はどの国で、どう壊れるのか——
          Situational Awareness や AI 2027 など過去の予測の「答え合わせ」から系統誤差を抽出し、
          2026年7月時点の公開データで2036年までを予測する。すべての図表に出典を付け、
          国別の未来はブラウザ内のマクロ経済モデルで自分の仮定を試せる。
        </p>
        <div className="headline-grid">
          {HEADLINES.map((h) => (
            <div key={h.label} className="headline-card">
              <div className="headline-stat">{h.stat}</div>
              <div className="headline-label">{h.label}</div>
              <div className="headline-desc">{h.desc}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="home-nav">
        <Link to="/llm" className="nav-card">
          <h2>論考Ⅰ — LLMの10年</h2>
          <p>
            ベンチマークの死、19日間の輸出管理、予測の大圧縮。AGI・知能爆発・産業爆発・
            国別雇用シナリオまでを2万字で。
          </p>
          <span className="nav-cta">読む →</span>
        </Link>
        <Link to="/physical" className="nav-card">
          <h2>論考Ⅱ — フィジカルAI</h2>
          <p>
            エスプレッソ13時間と国境の税関ロボット。VLAモデル、価格崩壊、
            レアアースの地政学、10年の3フェーズ予測を1万字で。
          </p>
          <span className="nav-cta">読む →</span>
        </Link>
        <Link to="/simulator" className="nav-card">
          <h2>シミュレータ</h2>
          <p>
            AGI到達時期・再分配・輸出規制をスライダーで動かし、日米中EUの
            GDP・失業率・社会安定性の分岐を実験する。
          </p>
          <span className="nav-cta">試す →</span>
        </Link>
        <Link to="/data" className="nav-card">
          <h2>参照データ</h2>
          <p>28の図表と出典の一覧。METRのタスク長からレアアース月次輸出まで。</p>
          <span className="nav-cta">見る →</span>
        </Link>
      </section>

      <section className="home-teaser">
        <MetrFig />
        <p className="teaser-note">
          この曲線が本サイト全体の主旋律。「人間の専門家なら何分かかる仕事を、AIが50%の確率で完遂できるか」——
          直近の倍増周期は約4ヶ月まで加速している。
        </p>
      </section>
    </div>
  )
}
