import { NavLink, Route, Routes } from 'react-router-dom'
import Home from './pages/Home'
import LlmFuture from './pages/LlmFuture'
import PhysicalAi from './pages/PhysicalAi'
import Simulator from './pages/Simulator'
import DataExplorer from './pages/DataExplorer'

const NAV = [
  { to: '/', label: 'ホーム', end: true },
  { to: '/llm', label: 'LLMの10年' },
  { to: '/physical', label: 'フィジカルAI' },
  { to: '/simulator', label: 'シミュレータ' },
  { to: '/data', label: 'データ' },
]

export default function App() {
  return (
    <div className="app">
      <header className="site-header">
        <NavLink to="/" className="brand">
          AIの未来 <span className="brand-sub">データで読む10年予測</span>
        </NavLink>
        <nav>
          {NAV.map((n) => (
            <NavLink key={n.to} to={n.to} end={n.end}>
              {n.label}
            </NavLink>
          ))}
        </nav>
      </header>
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/llm" element={<LlmFuture />} />
          <Route path="/physical" element={<PhysicalAi />} />
          <Route path="/simulator" element={<Simulator />} />
          <Route path="/data" element={<DataExplorer />} />
        </Routes>
      </main>
      <footer className="site-footer">
        <p>
          2026年7月時点の公開データに基づく分析。各図表の出典はデータページに記載。
        </p>
      </footer>
    </div>
  )
}
