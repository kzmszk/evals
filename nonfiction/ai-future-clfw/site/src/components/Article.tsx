import Markdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { FIGURES } from './charts/registry'

// 記事 Markdown 中の「::figure{chart-id}」行を registry のチャートに置き換える。
const FIGURE_LINE = /^::figure\{([a-z0-9-]+)\}\s*$/

type Segment = { kind: 'md'; text: string } | { kind: 'figure'; id: string }

export function splitArticle(source: string): Segment[] {
  const segments: Segment[] = []
  let buf: string[] = []
  const flush = () => {
    if (buf.length > 0) {
      segments.push({ kind: 'md', text: buf.join('\n') })
      buf = []
    }
  }
  for (const line of source.split('\n')) {
    const m = line.match(FIGURE_LINE)
    if (m) {
      flush()
      segments.push({ kind: 'figure', id: m[1] })
    } else {
      buf.push(line)
    }
  }
  flush()
  return segments
}

function Figure({ id }: { id: string }) {
  const fig = FIGURES[id]
  if (!fig) {
    return (
      <div className="figure-block figure-missing">
        図表が見つかりません: {id}
      </div>
    )
  }
  return (
    <figure className="figure-block">
      <fig.Component />
    </figure>
  )
}

export default function Article({ source }: { source: string }) {
  return (
    <article className="article">
      {splitArticle(source).map((seg, i) =>
        seg.kind === 'figure' ? (
          <Figure key={`fig-${seg.id}-${i}`} id={seg.id} />
        ) : (
          <Markdown key={i} remarkPlugins={[remarkGfm]}>
            {seg.text}
          </Markdown>
        ),
      )}
    </article>
  )
}
