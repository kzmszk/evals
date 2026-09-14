import { useLayoutEffect, useState, type RefObject } from 'react'

/**
 * コンテナの実幅(px)を返す。SVGを実幅の viewBox で描くことで、
 * 文字サイズが画面上のpxと一致し、どの列幅でも読める大きさになる。
 */
export function useMeasuredWidth(ref: RefObject<HTMLDivElement | null>) {
  const [width, setWidth] = useState(720)
  useLayoutEffect(() => {
    const el = ref.current
    if (!el) return
    const ro = new ResizeObserver(() => {
      if (el.clientWidth > 0) setWidth(el.clientWidth)
    })
    ro.observe(el)
    return () => ro.disconnect()
  }, [ref])
  return width
}
