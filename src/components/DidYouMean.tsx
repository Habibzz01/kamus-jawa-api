// "Mungkin kamu mencari: ..." — saran autocorrect (tanpa emoji)
import { Sparkles } from "./Icon";

export default function DidYouMean({
  items,
  onPick,
  label = "Mungkin kamu mencari:",
}: {
  items: string[];
  onPick: (w: string) => void;
  label?: string;
}) {
  if (!items.length) return null;
  return (
    <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center", marginTop: 10 }}>
      <span
        style={{
          color: "var(--muted)",
          fontSize: "0.85rem",
          display: "inline-flex",
          gap: 6,
          alignItems: "center",
        }}
      >
        <Sparkles size={15} style={{ color: "var(--text-link)", flexShrink: 0 }} />
        {label}
      </span>
      {items.map((w) => (
        <button
          key={w}
          className="badge"
          onClick={() => onPick(w)}
          style={{
            cursor: "pointer",
            fontSize: "0.8rem",
            textTransform: "none",
            letterSpacing: 0,
            color: "var(--text-link)",
            background: "rgba(13,116,206,0.06)",
            borderColor: "rgba(13,116,206,0.22)",
          }}
        >
          {w}
        </button>
      ))}
    </div>
  );
}
