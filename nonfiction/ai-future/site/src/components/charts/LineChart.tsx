import { useMemo, useRef, useState, type ReactNode } from 'react'
import { extent, formatPow10, linearScale, logScale, niceTicks } from './scale'
import { useMeasuredWidth } from './useMeasuredWidth'

export interface LinePoint {
  x: number
  y: number
  /** ツールチップに出す補足(モデル名など) */
  label?: string
}

export interface LineSeries {
  id: string
  label: string
  color: string
  points: LinePoint[]
  dashed?: boolean
}

interface Props {
  title: string
  subtitle?: string
  series: LineSeries[]
  height?: number
  /** y軸を対数スケールにする */
  yLog?: boolean
  /** y軸の下限を0に固定する(線形時) */
  yZero?: boolean
  formatX?: (x: number) => string
  formatY?: (y: number) => string
  /** ツールチップ内の値表示(軸より精度を上げたいとき) */
  formatValue?: (y: number) => string
  annotations?: { x: number; label: string }[]
  /** 出典などの脚注 */
  note?: ReactNode
}

// コンテナの実幅を測って等倍で描画する(文字サイズを画面上のpxと一致させるため)
const M = { top: 12, bottom: 28, left: 56 }
const RIGHT_LABELED = 84 // 直接ラベル分の右余白
const RIGHT_PLAIN = 20

const defaultFormatX = (x: number) => String(Math.round(x))

export default function LineChart({
  title,
  subtitle,
  series,
  height = 300,
  yLog = false,
  yZero = false,
  formatX = defaultFormatX,
  formatY,
  formatValue,
  annotations = [],
  note,
}: Props) {
  const plotRef = useRef<HTMLDivElement>(null)
  const [hoverX, setHoverX] = useState<number | null>(null)
  const vbw = useMeasuredWidth(plotRef)

  // 空の系列は描画・ラベル計算の対象から外す(空配列でのクラッシュ防止)
  const drawable = series.filter((s) => s.points.length > 0)

  const showEndLabels = drawable.length >= 2 && drawable.length <= 6
  const mRight = showEndLabels ? RIGHT_LABELED : RIGHT_PLAIN
  const vbh = height + M.top + M.bottom
  const allXs = useMemo(
    () => [...new Set(drawable.flatMap((s) => s.points.map((p) => p.x)))].sort((a, b) => a - b),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [series],
  )
  const allYs = drawable.flatMap((s) => s.points.map((p) => p.y))

  const x = linearScale(
    [allXs[0] ?? 0, allXs[allXs.length - 1] ?? 1],
    [M.left, vbw - mRight],
    6,
  )
  const y = yLog
    ? logScale([Math.min(...allYs), Math.max(...allYs)], [M.top + height, M.top])
    : linearScale(
        yZero ? [0, extent(allYs)[1]] : extent(allYs),
        [M.top + height, M.top],
      )
  const fmtY = formatY ?? (yLog ? formatPow10 : (v: number) => String(v))
  const fmtVal = formatValue ?? fmtY

  if (allXs.length === 0) {
    return (
      <div className="chart-card">
        <p className="chart-title">{title}</p>
        <p className="chart-subtitle">表示できるデータがありません</p>
      </div>
    )
  }
  // 目盛り数は実幅から決める(ラベル1つあたり最低80px確保)。
  // 小数年を丸めて表示するため、表示文字列が重複する目盛りは間引く。
  const xTickCount = Math.max(3, Math.floor((vbw - M.left - mRight) / 80))
  const xTicks = niceTicks(x.domain[0], x.domain[1], xTickCount)
    .filter((t) => t >= x.domain[0] && t <= x.domain[1])
    .filter((t, i, arr) => i === 0 || formatX(t) !== formatX(arr[i - 1]))

  // 直接ラベル: 最終点の高さに置き、14px間隔で衝突回避
  const endLabels = drawable
    .map((s) => {
      const p = s.points[s.points.length - 1]
      return { label: s.label, color: s.color, yPos: y(p.y) }
    })
    .sort((a, b) => a.yPos - b.yPos)
  for (let i = 1; i < endLabels.length; i++) {
    if (endLabels[i].yPos - endLabels[i - 1].yPos < 14) {
      endLabels[i].yPos = endLabels[i - 1].yPos + 14
    }
  }

  const showLegend = drawable.length >= 2

  const onMove = (e: React.PointerEvent) => {
    const rect = plotRef.current?.getBoundingClientRect()
    if (!rect) return
    const vx = ((e.clientX - rect.left) / rect.width) * vbw
    let nearest = allXs[0]
    for (const cand of allXs) {
      if (Math.abs(x(cand) - vx) < Math.abs(x(nearest) - vx)) nearest = cand
    }
    setHoverX(nearest)
  }

  // キーボード操作: ←→でデータ点を移動、Escで解除(ツールチップへの代替経路)
  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setHoverX(null)
      return
    }
    if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return
    e.preventDefault()
    const idx = hoverX === null ? -1 : allXs.indexOf(hoverX)
    const next =
      e.key === 'ArrowRight'
        ? Math.min(allXs.length - 1, idx + 1)
        : Math.max(0, idx === -1 ? allXs.length - 1 : idx - 1)
    setHoverX(allXs[next])
  }

  const hoverRows =
    hoverX === null
      ? []
      : drawable
          .map((s) => ({
            label: s.label,
            color: s.color,
            point: s.points.find((p) => p.x === hoverX),
          }))
          .filter((r) => r.point !== undefined)

  const tooltipLeftPct = hoverX === null ? 0 : (x(hoverX) / vbw) * 100
  const flipTooltip = tooltipLeftPct > 62

  return (
    <div className="chart-card">
      <p className="chart-title">{title}</p>
      {subtitle && <p className="chart-subtitle">{subtitle}</p>}
      {showLegend && (
        <div className="chart-legend">
          {series.map((s) => (
            <span key={s.id}>
              <span className="swatch" style={{ background: s.color }} />
              {s.label}
            </span>
          ))}
        </div>
      )}
      <div
        ref={plotRef}
        className="chart-plot"
        tabIndex={0}
        role="application"
        aria-label={`${title}(左右キーでデータ点を移動)`}
        onPointerMove={onMove}
        onPointerLeave={() => setHoverX(null)}
        onKeyDown={onKeyDown}
        onBlur={() => setHoverX(null)}
      >
        <svg viewBox={`0 0 ${vbw} ${vbh}`} role="img" aria-label={title}>
          {/* グリッド(控えめ) */}
          {y.ticks.map((t) => (
            <line
              key={`gy-${t}`}
              x1={M.left}
              x2={vbw - mRight}
              y1={y(t)}
              y2={y(t)}
              stroke="var(--viz-grid)"
              strokeWidth={1}
            />
          ))}
          {/* 軸ラベル */}
          {y.ticks.map((t) => (
            <text
              key={`ty-${t}`}
              x={M.left - 8}
              y={y(t) + 4}
              textAnchor="end"
              fontSize={11}
              fill="var(--viz-muted)"
              style={{ fontVariantNumeric: 'tabular-nums' }}
            >
              {fmtY(t)}
            </text>
          ))}
          {xTicks.map((t) => (
            <text
              key={`tx-${t}`}
              x={x(t)}
              y={M.top + height + 18}
              textAnchor="middle"
              fontSize={11}
              fill="var(--viz-muted)"
              style={{ fontVariantNumeric: 'tabular-nums' }}
            >
              {formatX(t)}
            </text>
          ))}
          {/* ベースライン */}
          <line
            x1={M.left}
            x2={vbw - mRight}
            y1={M.top + height}
            y2={M.top + height}
            stroke="var(--viz-axis)"
            strokeWidth={1}
          />
          {/* 注釈(縦線) */}
          {annotations.map((a) => (
            <g key={a.label}>
              <line
                x1={x(a.x)}
                x2={x(a.x)}
                y1={M.top}
                y2={M.top + height}
                stroke="var(--viz-muted)"
                strokeWidth={1}
                strokeDasharray="3 4"
              />
              <text
                x={x(a.x) + 5}
                y={M.top + 12}
                fontSize={10.5}
                fill="var(--viz-muted)"
              >
                {a.label}
              </text>
            </g>
          ))}
          {/* 系列 */}
          {series.map((s) => (
            <path
              key={s.id}
              d={s.points
                .map((p, i) => `${i === 0 ? 'M' : 'L'}${x(p.x)},${y(p.y)}`)
                .join(' ')}
              fill="none"
              stroke={s.color}
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeDasharray={s.dashed ? '5 5' : undefined}
            />
          ))}
          {/* 直接ラベル */}
          {showEndLabels &&
            endLabels.map((l) => (
              <text
                key={l.label}
                x={vbw - mRight + 8}
                y={l.yPos + 4}
                fontSize={11.5}
                fill={l.color}
                fontWeight={600}
              >
                {l.label}
              </text>
            ))}
          {/* ホバー: クロスヘア+マーカー */}
          {hoverX !== null && (
            <g>
              <line
                x1={x(hoverX)}
                x2={x(hoverX)}
                y1={M.top}
                y2={M.top + height}
                stroke="var(--viz-ink-2)"
                strokeWidth={1}
                opacity={0.5}
              />
              {hoverRows.map((r) => (
                <circle
                  key={r.label}
                  cx={x(hoverX)}
                  cy={y(r.point!.y)}
                  r={4.5}
                  fill={r.color}
                  stroke="var(--viz-surface)"
                  strokeWidth={2}
                />
              ))}
            </g>
          )}
        </svg>
        {hoverX !== null && hoverRows.length > 0 && (
          <div
            className="chart-tooltip"
            style={{
              left: `${tooltipLeftPct}%`,
              top: 8,
              transform: flipTooltip ? 'translateX(calc(-100% - 12px))' : 'translateX(12px)',
            }}
          >
            <div className="tt-title">{formatX(hoverX)}</div>
            {hoverRows.map((r) => (
              <div key={r.label}>
                <span className="swatch" style={{ background: r.color }} />
                {r.label}: {fmtVal(r.point!.y)}
                {r.point!.label && (
                  <span className="tt-detail"> — {r.point!.label}</span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
      {note && <p className="chart-note">{note}</p>}
    </div>
  )
}
