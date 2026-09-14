import { getSource } from "./evidence";
export function SourceLink({ id }: { id: string }) {
  const s = getSource(id);
  return (
    <a className="source-link" href={s.url} target="_blank" rel="noreferrer">
      {s.org} · {s.date} ↗
    </a>
  );
}
