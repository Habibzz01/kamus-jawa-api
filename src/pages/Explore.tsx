import { useEffect, useMemo, useState } from "react";
import { AnimatedContent, FadeUp } from "../components/reactbits";
import { api } from "../lib/api";

const LETTERS = "abcdefghijklmnopqrstuvwxyz".split("");

export default function Explore() {
  const [letter, setLetter] = useState("a");
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const limit = 30;

  useEffect(() => {
    setLoading(true);
    api
      .entries({ letter, q: q || undefined, page, limit })
      .then((r) => setData(r))
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, [letter, q, page]);

  useEffect(() => setPage(1), [letter, q]);

  const rows: any[] = useMemo(() => data?.data || [], [data]);
  const meta = data?.meta;

  return (
    <div className="container" style={{ paddingTop: 44 }}>
      <AnimatedContent>
        <h1 style={{ marginTop: 0 }}>Jelajah Kata</h1>
        <p style={{ color: "var(--body)", marginTop: -6 }}>Telusuri entri kamus per huruf. Data dimuat langsung dari <code>/api/entries</code>.</p>
      </AnimatedContent>

      {/* Letter picker */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6, margin: "22px 0" }}>
        {LETTERS.map((l) => (
          <button
            key={l}
            onClick={() => setLetter(l)}
            style={{
              width: 40, height: 40, borderRadius: 12, cursor: "pointer", fontFamily: "var(--sans)", fontWeight: 600, fontSize: 18,
              border: letter === l ? "1px solid var(--primary)" : "1px solid var(--hairline)",
              background: letter === l ? "var(--surface-strong)" : "var(--surface-card)",
              color: letter === l ? "var(--ink)" : "var(--body)",
            }}
          >
            {l.toUpperCase()}
          </button>
        ))}
      </div>

      {/* Search */}
      <div style={{ display: "flex", gap: 10, marginBottom: 20 }}>
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={`Cari dalam huruf ${letter.toUpperCase()}…`}
          style={{ flex: 1, maxWidth: 420, padding: "11px 16px", borderRadius: 999, border: "1px solid var(--hairline-strong)", background: "var(--surface-card)", color: "var(--ink)", outline: "none" }}
        />
        <span className="badge badge-gold" style={{ alignSelf: "center" }}>
          {meta?.total ?? "…"} entri
        </span>
      </div>

      {loading ? (
        <p style={{ color: "var(--muted)" }}>Memuat…</p>
      ) : (
        <>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 300px), 1fr))", gap: 12 }}>
            {rows.map((e, i) => (
              <FadeUp key={e.id} delay={Math.min(i, 8) * 0.04}>
                <div className="card" style={{ padding: "16px 18px" }}>
                  <div style={{ display: "flex", gap: 10, alignItems: "baseline" }}>
                    <b style={{ fontFamily: "var(--sans)", fontSize: "1.1rem", color: "var(--ink)" }}>{e.word}</b>
                    <span className="badge badge-muted">{e.level}</span>
                  </div>
                  <div style={{ color: "var(--body)", fontSize: "0.9rem", marginTop: 4 }}>{e.meaning}</div>
                  {(e.krama || e.krama_inggil) && (
                    <div style={{ marginTop: 8, display: "flex", gap: 8, flexWrap: "wrap" }}>
                      {e.krama && <span className="badge badge-green">krama: {e.krama}</span>}
                      {e.krama_inggil && <span className="badge badge-gold">inggil: {e.krama_inggil}</span>}
                    </div>
                  )}
                </div>
              </FadeUp>
            ))}
          </div>

          {meta && meta.pages > 1 && (
            <div style={{ display: "flex", gap: 10, justifyContent: "center", marginTop: 26 }}>
              <button className="btn" disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>← Sebelumnya</button>
              <span style={{ alignSelf: "center", color: "var(--body)", fontSize: "0.9rem" }}>
                Halaman {page} / {meta.pages}
              </span>
              <button className="btn" disabled={page >= meta.pages} onClick={() => setPage((p) => Math.min(meta.pages, p + 1))}>Berikutnya →</button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
