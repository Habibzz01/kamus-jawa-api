// Highlight — menyorot bagian teks yang cocok dengan kata kunci
// Defensif: aman untuk text/query null, undefined, atau bukan string.
export default function Highlight({ text, query }: { text?: string | null; query?: string | null }) {
  if (text == null) return null;
  const t = String(text);
  const q = query == null ? "" : String(query).trim().toLowerCase();
  if (!q) return <>{t}</>;
  const lower = t.toLowerCase();
  if (!lower.includes(q)) return <>{t}</>;

  const parts: React.ReactNode[] = [];
  let i = 0;
  let idx = lower.indexOf(q);
  let key = 0;
  while (idx !== -1) {
    if (idx > i) parts.push(<span key={key++}>{t.slice(i, idx)}</span>);
    parts.push(
      <mark
        key={key++}
        style={{
          background: "rgba(13,116,206,0.16)",
          color: "inherit",
          borderRadius: 3,
          padding: "0 1px",
        }}
      >
        {t.slice(idx, idx + q.length)}
      </mark>
    );
    i = idx + q.length;
    idx = lower.indexOf(q, i);
  }
  if (i < t.length) parts.push(<span key={key++}>{t.slice(i)}</span>);
  return <>{parts}</>;
}
