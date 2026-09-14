import { useRef, useState, type ReactNode } from 'react'
import { linearScale } from './scale'
import { useMeasuredWidth } from './useMeasuredWidth'

export interface BarItem {
  label: string
  value: number
  /** 省略時は --series-1 */
  color?: string
  /** ツールチップの補足行 */
  detail?: string
}

interface Props {
  title: string
  subtitle?: string
  items: BarItem[]
  formatValue?: (v: number) => string
  note?: ReactNode
}

// 横棒: カテゴリ比較用。値ラベルは棒の端に直接表示する。負値にも対応。
const ROW = 30
const M = { top: 6, right: 84, bottom: 6, left: 190 }

export default function BarChart({
  title,
  subtitle,
  items,
  formatValue = (v) => String(v),
  note,
}: Props) {
  const plotRef = useRef<HTMLDivElement>(null)
  const [hover, setHover] = useState<number | null>(null)
  const vbw = useMeasuredWidth(plotRef)

  const vbh = M.top + items.length * ROW + M.bottom
  const min = Math.min(0, ...items.map((i) => i.value))
  const max = Math.max(0, ...items.map((i) => i.value))
  const x = linearScale([min, max], [M.left, vbw - M.right])
  const x0 = x(0)

  // キーボード操作: ↑↓で行を移動、Escで解除(ツールチップへの代替経路)
  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setHover(null)
      return
    }
    if (e.key !== 'ArrowUp' && e.key !== 'ArrowDown') return
    e.preventDefault()
    const idx = hover ?? -1
    const next =
      e.key === 'ArrowDown'
        ? Math.min(items.length - 1, idx + 1)
        : Math.max(0, idx === -1 ? items.length - 1 : idx - 1)
    setHover(next)
  }

  return (
    <div className="chart-card">
      <p className="chart-title">{title}</p>
      {subtitle && <p className="chart-subtitle">{subtitle}</p>}
      <div
        ref={plotRef}
        className="chart-plot"
        tabIndex={0}
        role="application"
        aria-label={`${title}(上下キーで項目を移動)`}
        onKeyDown={onKeyDown}
        onBlur={() => setHover(null)}
      >
        <svg viewBox={`0 0 ${vbw} ${vbh}`} role="img" aria-label={title}>
          {items.map((item, i) => {
            const yTop = M.top + i * ROW + 5
            const h = ROW - 10
            const end = x(item.value)
            const barX = Math.min(x0, end)
            const w = Math.max(2, Math.abs(end - x0))
            const color = item.color ?? 'var(--series-1)'
            const positive = item.value >= 0
            return (
              <g
                key={item.label}
                onPointerEnter={() => setHover(i)}
                onPointerLeave={() => setHover(null)}
              >
                {/* ホバー用の透明ヒット領域(棒より大きい) */}
                <rect
                  x={0}
                  y={M.top + i * ROW}
                  width={vbw}
                  height={ROW}
                  fill="transparent"
                />
                <text
                  x={M.left - 10}
                  y={yTop + h / 2 + 4}
                  textAnchor="end"
                  fontSize={12}
                  fill="var(--viz-ink-2)"
                >
                  {item.label}
                </text>
                <rect
                  x={barX}
                  y={yTop}
                  width={w}
                  height={h}
                  rx={4}
                  fill={color}
                  opacity={hover === null || hover === i ? 1 : 0.45}
                />
                <text
                  x={positive ? barX + w + 8 : barX - 8}
                  y={yTop + h / 2 + 4}
                  textAnchor={positive ? 'start' : 'end'}
                  fontSize={11.5}
                  fill="var(--viz-ink)"
                  style={{ fontVariantNumeric: 'tabular-nums' }}
                >
                  {formatValue(item.value)}
                </text>
              </g>
            )
          })}
          {/* ゼロ軸 */}
          <line
            x1={x0}
            x2={x0}
            y1={M.top}
            y2={vbh - M.bottom}
            stroke="var(--viz-axis)"
            strokeWidth={1}
          />
        </svg>
        {hover !== null && items[hover].detail && (
          <div
            className="chart-tooltip"
            style={{
              left: `${(M.left / vbw) * 100}%`,
              top: `${((M.top + hover * ROW) / vbh) * 100}%`,
              transform: 'translateY(-110%)',
            }}
          >
            <div className="tt-title">{items[hover].label}</div>
            <div>{items[hover].detail}</div>
          </div>
        )}
      </div>
      {note && <p className="chart-note">{note}</p>}
    </div>
  )
}
