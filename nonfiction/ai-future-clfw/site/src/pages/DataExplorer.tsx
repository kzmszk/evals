import { FIGURES } from '../components/charts/registry'

// 全データセットをテーマ別に一覧する。チャートは記事と同じ registry を共有。
const SECTIONS: { title: string; ids: string[] }[] = [
  {
    title: '能力トレンド',
    ids: ['metr-horizon', 'bench-race', 'ai-code-share', 'price-decline', 'mythos-exploits'],
  },
  { title: '投資と計算資源', ids: ['capex-total', 'nvidia-dc', 'stargate'] },
  { title: '電力', ids: ['power-2030', 'china-us-power'] },
  { title: '雇用', ids: ['canaries', 'unemployment-gap', 'rct-effects', 'layoffs'] },
  {
    title: '予測の検証と経済効果',
    ids: ['agi-forecasts', 'ai2027-scorecard', 'growth-estimates', 'okun'],
  },
  {
    title: 'フィジカルAI',
    ids: [
      'robot-installs',
      'robot-countries',
      'humanoid-shipments',
      'humanoid-prices',
      'humanoid-forecast',
    ],
  },
  { title: '中国の政策と供給網', ids: ['rare-earth', 'magnet-exports', 'china-supply', 'ascend'] },
  { title: '日本・EU', ids: ['genai-adoption', 'tenure', 'labor-shortage'] },
]

export default function DataExplorer() {
  return (
    <div className="page">
      <h1>参照データ一覧</h1>
      <p className="page-lead">
        両論考とシミュレータが参照する全データセット。各図表の脚注に出典・時点・精度の注意を記載している。
        調査ノート全文はリポジトリの <code>nonfiction/ai-future/research/</code> を参照。
      </p>
      {SECTIONS.map((sec) => (
        <section key={sec.title} className="data-section">
          <h2>{sec.title}</h2>
          <div className="data-grid">
            {sec.ids.map((id) => {
              const fig = FIGURES[id]
              return fig ? <fig.Component key={id} /> : null
            })}
          </div>
        </section>
      ))}
    </div>
  )
}
