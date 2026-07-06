import type { ComponentType } from 'react'
import BarChart from './BarChart'
import LineChart from './LineChart'
import type { BarDataset, LineDataset, SourceRef } from '../../data/types'
import * as cap from '../../data/capability'
import * as comp from '../../data/compute'
import * as emp from '../../data/employment'
import * as fc from '../../data/forecasts'
import * as phys from '../../data/physical'
import * as cn from '../../data/china'
import * as jp from '../../data/japan'

// 記事から「::figure{id}」で参照できるチャートの登録簿。
// データ本体は src/data/、描画部品は LineChart / BarChart。

const SERIES_COLORS = [
  'var(--series-1)',
  'var(--series-2)',
  'var(--series-3)',
  'var(--series-4)',
  'var(--series-5)',
  'var(--series-6)',
]

function SourceNote({ source }: { source: SourceRef }) {
  return (
    <>
      出典:{' '}
      <a href={source.url} target="_blank" rel="noreferrer">
        {source.title}
      </a>
      ({source.asOf}時点)
      {source.caveat && <> — {source.caveat}</>}
    </>
  )
}

interface LineOpts {
  yLog?: boolean
  yZero?: boolean
  height?: number
  formatY?: (v: number) => string
  formatValue?: (v: number) => string
  annotations?: { x: number; label: string }[]
}

function lineFig(ds: LineDataset, opts: LineOpts = {}): ComponentType {
  return function Fig() {
    return (
      <LineChart
        title={ds.title}
        subtitle={ds.unit ? `単位: ${ds.unit}` : undefined}
        series={ds.series.map((s, i) => ({
          ...s,
          color: SERIES_COLORS[i % SERIES_COLORS.length],
        }))}
        note={<SourceNote source={ds.source} />}
        {...opts}
      />
    )
  }
}

function barFig(
  ds: BarDataset,
  formatValue?: (v: number) => string,
  colorFor?: (label: string) => string | undefined,
): ComponentType {
  return function Fig() {
    return (
      <BarChart
        title={ds.title}
        subtitle={ds.unit ? `単位: ${ds.unit}` : undefined}
        items={ds.items.map((it) => ({
          ...it,
          color: colorFor?.(it.label),
        }))}
        formatValue={formatValue}
        note={<SourceNote source={ds.source} />}
      />
    )
  }
}

const pct = (v: number) => `${v}%`
const num = (v: number) => v.toLocaleString('ja-JP')
const usd = (v: number) => `$${v.toLocaleString('en-US')}`
const minutes = (v: number) =>
  v >= 60 ? `${Math.round((v / 60) * 10) / 10}時間` : `${v}分`

export const FIGURES: Record<string, { Component: ComponentType }> = {
  // --- 能力トレンド ---
  'metr-horizon': {
    Component: lineFig(cap.metrHorizon, {
      yLog: true,
      height: 320,
      formatY: minutes,
      formatValue: minutes,
    }),
  },
  'bench-race': {
    Component: lineFig(cap.benchmarkRace, { yZero: true, formatY: pct, height: 320 }),
  },
  'ai-code-share': { Component: barFig(cap.aiCodeShare, pct) },
  'price-decline': { Component: barFig(cap.priceDecline, (v) => `${v}倍`) },
  'mythos-exploits': {
    Component: barFig(cap.mythosExploits, (v) => `${v}回`, (label) =>
      label.includes('Mythos') ? 'var(--series-2)' : 'var(--series-1)',
    ),
  },
  // --- 計算資源・電力 ---
  'nvidia-dc': {
    Component: lineFig(comp.nvidiaDc, { yZero: true, formatY: (v) => `$${v}B` }),
  },
  'capex-total': { Component: barFig(comp.hyperscalerCapex, (v) => `$${v}B`) },
  stargate: {
    Component: barFig(comp.stargate, (v) => `${v} GW`, (label) =>
      label.includes('稼働') ? 'var(--series-5)' : 'var(--series-1)',
    ),
  },
  'power-2030': { Component: barFig(comp.power2030, (v) => `${v} TWh`) },
  'china-us-power': {
    Component: barFig(comp.chinaUsCapacity, (v) => `${v} GW`, (label) =>
      label.startsWith('中国') ? 'var(--series-2)' : 'var(--series-1)',
    ),
  },
  // --- 雇用 ---
  canaries: {
    Component: lineFig(emp.canaries, { formatY: pct, formatValue: pct }),
  },
  'rct-effects': { Component: barFig(emp.rctEffects, (v) => `${v > 0 ? '+' : ''}${v}%`) },
  layoffs: { Component: barFig(emp.layoffs, (v) => `${num(v)}人`) },
  'unemployment-gap': { Component: barFig(emp.unemploymentGap, pct) },
  // --- 予測の検証・経済効果 ---
  'agi-forecasts': {
    Component: lineFig(fc.agiForecasts, {
      height: 320,
      formatY: (v) => `${Math.round(v)}年`,
      formatValue: (v) => `${Math.round(v * 10) / 10}年`,
    }),
  },
  'ai2027-scorecard': { Component: barFig(fc.ai2027Tracker, (v) => `${v}件`) },
  'growth-estimates': { Component: barFig(fc.growthEstimates, (v) => `+${v}pt`) },
  okun: { Component: barFig(fc.okun, (v) => `${v}pt`) },
  // --- フィジカルAI ---
  'robot-installs': {
    Component: lineFig(phys.robotInstalls, { yZero: true, formatY: (v) => `${v}千台` }),
  },
  'robot-countries': { Component: barFig(phys.robotCountries, (v) => `${num(v)}台`) },
  'humanoid-shipments': { Component: barFig(phys.humanoidShipments, (v) => `${num(v)}台`) },
  'humanoid-prices': { Component: barFig(phys.humanoidPrices, usd) },
  'humanoid-forecast': { Component: barFig(phys.humanoidForecast, (v) => `${num(v)}台`) },
  // --- 中国 ---
  'rare-earth': { Component: barFig(cn.rareEarthShare, pct, () => 'var(--series-2)') },
  'magnet-exports': {
    Component: lineFig(cn.magnetExports, { yZero: true, formatY: (v) => `${num(v)}t` }),
  },
  'china-supply': { Component: barFig(cn.chinaSupplyChain, pct, () => 'var(--series-2)') },
  ascend: { Component: barFig(cn.ascendChips, (v) => `${v}万個`) },
  // --- 日本・EU ---
  'genai-adoption': { Component: barFig(jp.genAiAdoption, pct) },
  tenure: { Component: barFig(jp.tenure, (v) => `${v}年`) },
  'labor-shortage': {
    Component: lineFig(jp.laborShortage, { yZero: true, formatY: (v) => `${v}万人` }),
  },
}
