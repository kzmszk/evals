import { useMemo, useState } from 'react'
import LineChart, { type LineSeries } from '../components/charts/LineChart'
import { COUNTRIES, DEFAULT_SCENARIO } from '../model/calibration'
import { simulate } from '../model/engine'
import type { CountryId, Scenario, YearResult } from '../model/types'

const COUNTRY_COLORS: Record<CountryId, string> = {
  us: 'var(--series-1)',
  china: 'var(--series-2)',
  japan: 'var(--series-3)',
  eu: 'var(--series-4)',
}

const PRESETS: { label: string; scenario: Scenario; desc: string }[] = [
  {
    label: '中位シナリオ',
    scenario: DEFAULT_SCENARIO,
    desc: 'AGI中点2031年・穏当な再分配(記事の基準ケース)',
  },
  {
    label: '緩慢な進化',
    scenario: {
      ...DEFAULT_SCENARIO,
      agiMidYear: 2036,
      capabilitySlope: 0.3,
      cognitiveCap: 0.65,
    },
    desc: 'スケーリング鈍化・自動化上限も低い',
  },
  {
    label: '急速AGI・無策',
    scenario: {
      ...DEFAULT_SCENARIO,
      agiMidYear: 2028,
      capabilitySlope: 0.9,
      cognitiveCap: 0.95,
      redistribution: 0,
    },
    desc: '2028年に能力中点、再分配が政治的に成立しない',
  },
  {
    label: '急速AGI・手厚い再分配',
    scenario: {
      ...DEFAULT_SCENARIO,
      agiMidYear: 2028,
      capabilitySlope: 0.9,
      cognitiveCap: 0.95,
      redistribution: 1,
    },
    desc: '同じ能力進化に、迅速なUBI型給付で応じる',
  },
]

interface SliderSpec {
  key: keyof Scenario
  label: string
  min: number
  max: number
  step: number
  format: (v: number) => string
  hint: string
}

const SLIDERS: SliderSpec[] = [
  {
    key: 'agiMidYear',
    label: 'AGI到達時期(能力中点の年)',
    min: 2027,
    max: 2040,
    step: 1,
    format: (v) => `${v}年`,
    hint: '認知タスクの自動化可能率が上限の半分に達する年',
  },
  {
    key: 'capabilitySlope',
    label: '進化の急峻さ',
    min: 0.2,
    max: 1.2,
    step: 0.05,
    format: (v) => v.toFixed(2),
    hint: '大きいほど知能爆発的(1.0で中点前後の1年に約25pt進む)',
  },
  {
    key: 'cognitiveCap',
    label: '認知タスク自動化の上限',
    min: 0.5,
    max: 0.98,
    step: 0.02,
    format: (v) => `${Math.round(v * 100)}%`,
    hint: '規制・物理制約・人間選好で自動化されずに残る仕事の裏返し',
  },
  {
    key: 'physicalLagYears',
    label: 'フィジカルAIの遅延',
    min: 3,
    max: 12,
    step: 1,
    format: (v) => `${v}年`,
    hint: '身体タスクの自動化が認知タスクに遅れる年数',
  },
  {
    key: 'redistribution',
    label: '再分配政策の積極度',
    min: 0,
    max: 1,
    step: 0.05,
    format: (v) => `${Math.round(v * 100)}%`,
    hint: 'UBI等の給付が立ち上がる速さと厚み(0で無策)',
  },
  {
    key: 'chinaExportControl',
    label: '中国のロボット部品輸出規制',
    min: 0,
    max: 1,
    step: 0.05,
    format: (v) => `${Math.round(v * 100)}%`,
    hint: '強いほど中国以外のフィジカルAI導入が遅れる(最大4年)',
  },
]

type Metric = {
  key: keyof YearResult
  title: string
  subtitle: string
  formatY: (v: number) => string
  yZero?: boolean
}

const METRICS: Metric[] = [
  {
    key: 'gdpIndex',
    title: '実質GDP指数',
    subtitle: '2026年=100',
    formatY: (v) => String(Math.round(v)),
  },
  {
    key: 'unemployment',
    title: '失業率',
    subtitle: '顕在失業のみ(採用凍結などの潜在調整は含まない)',
    formatY: (v) => `${v.toFixed(1)}%`,
    yZero: true,
  },
  {
    key: 'stability',
    title: '社会安定性指数',
    subtitle: '100=平時。40未満で不安定化(斜線)',
    formatY: (v) => String(Math.round(v)),
    yZero: true,
  },
  {
    key: 'wageIndex',
    title: '実質賃金指数',
    subtitle: '2026年=100。潜在調整は賃金停滞として現れる',
    formatY: (v) => String(Math.round(v)),
  },
]

export default function Simulator() {
  const [scenario, setScenario] = useState<Scenario>(DEFAULT_SCENARIO)
  const result = useMemo(() => simulate(scenario), [scenario])

  const seriesFor = (metric: Metric): LineSeries[] =>
    COUNTRIES.map((c) => ({
      id: c.id,
      label: c.name,
      color: COUNTRY_COLORS[c.id],
      points: result[c.id].years.map((y) => ({
        x: y.year,
        y: y[metric.key] as number,
      })),
    }))

  const events = COUNTRIES.flatMap((c) => {
    const run = result[c.id]
    const out: { country: string; text: string; kind: 'ubi' | 'crisis' }[] = []
    if (run.ubiYear) {
      out.push({ country: c.name, text: `${run.ubiYear}年 本格的な給付(UBI型)開始`, kind: 'ubi' })
    }
    if (run.crisisYear) {
      out.push({ country: c.name, text: `${run.crisisYear}年 社会不安定化の閾値を突破`, kind: 'crisis' })
    }
    return out
  })

  return (
    <div className="page sim-page">
      <h1>国別マクロ経済シミュレータ</h1>
      <p className="sim-lead">
        タスクベースのマクロモデル(設計は <code>src/model/DESIGN.md</code>、係数の出典は{' '}
        <code>src/model/calibration.ts</code>)で、AIの進化速度と政策対応が国別の
        GDP・失業率・社会安定性をどう分岐させるかを試せる。
        精密予測ではなく「どの仮定がどの分岐を生むか」を掴むための道具。
      </p>

      <div className="sim-presets">
        {PRESETS.map((p) => (
          <button
            key={p.label}
            type="button"
            className={
              JSON.stringify(p.scenario) === JSON.stringify(scenario)
                ? 'preset active'
                : 'preset'
            }
            title={p.desc}
            onClick={() => setScenario(p.scenario)}
          >
            {p.label}
          </button>
        ))}
      </div>

      <div className="sim-layout">
        <div className="sim-controls">
          {SLIDERS.map((s) => (
            <label key={s.key} className="sim-slider">
              <span className="slider-head">
                <span>{s.label}</span>
                <strong>{s.format(scenario[s.key])}</strong>
              </span>
              <input
                type="range"
                min={s.min}
                max={s.max}
                step={s.step}
                value={scenario[s.key]}
                onChange={(e) =>
                  setScenario({ ...scenario, [s.key]: Number(e.target.value) })
                }
              />
              <span className="slider-hint">{s.hint}</span>
            </label>
          ))}
          {events.length > 0 && (
            <div className="sim-events">
              <p className="events-title">このシナリオで起きるイベント</p>
              {events.map((e) => (
                <p key={`${e.country}-${e.text}`} className={`event event-${e.kind}`}>
                  <strong>{e.country}</strong> {e.text}
                </p>
              ))}
            </div>
          )}
        </div>

        <div className="sim-charts">
          {METRICS.map((m) => (
            <LineChart
              key={m.key}
              title={m.title}
              subtitle={m.subtitle}
              series={seriesFor(m)}
              height={220}
              yZero={m.yZero}
              formatY={m.formatY}
              formatValue={m.formatY}
              annotations={[{ x: scenario.agiMidYear, label: 'AGI中点' }]}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
