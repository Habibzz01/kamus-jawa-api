import { useEffect, useState } from "react";
import { AnimatedContent, FadeUp } from "../components/reactbits";
import DidYouMean from "../components/DidYouMean";
import Highlight from "../components/Highlight";
import { ArrowRightLeft, Search, ChevronRight } from "../components/Icon";
import { api } from "../lib/api";
import { useDebounce } from "../lib/useDebounce";

type Dir = "jv-id" | "id-jv";

const EXAMPLES: { label: string; q: string; dir: Dir }[] = [
  { label: "abang", q: "abang", dir: "jv-id" },
  { label: "mangan", q: "mangan", dir: "jv-id" },
  { label: "gedhe", q: "gedhe", dir: "jv-id" },
  { label: "makan", q: "makan", dir: "id-jv" },
  { label: "terima kasih", q: "terima kasih", dir: "id-jv" },
  { label: "rumah", q: "rumah", dir: "id-jv" },
];

export default function Terjemah() {
  const [dir, setDir] = useState<Dir>("jv-id");
  const [q, setQ] = useState("");
  const dq = useDebounce(q, 300);
  const [data, setData] = useState<any[] | null>(null);
  const [meta, setMeta] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searched, setSearched] = useState(false);
  const [suggests, setSuggests] = useState<string[]>([]);

  async function doSearch(term?: string, d?: Dir) {
    const query = (term ?? q).trim();
    const direction = d ?? dir;
    if (!query) return;
    setLoading(true);
    setError(null);
    setSearched(true);
    try {
      const r = await api.translate(query, direction);
      setData(r.data || []);
      setMeta(r);
      if ((r.data || []).length === 0) {
        try {
          const sg = await api.suggest(query, direction);
          setSuggests(sg.data || []);
        } catch {
          setSuggests([]);
        }
      } else {
        setSuggests([]);
      }
    } catch (e: any) {
      setData([]);
      setError(e?.message || "Terjadi kesalahan");
      setSuggests([]);
    } finally {
      setLoading(false);
    }
  }

  // Pencarian realtime saat mengetik (debounce 300ms), mengikuti arah aktif
  useEffect(() => {
    if (dq.trim()) {
      doSearch(dq, dir);
    } else {
      setData(null);
      setSearched(false);
      setSuggests([]);
      setError(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dq, dir]);

  function swap() {
    setDir((d) => (d === "jv-id" ? "id-jv" : "jv-id"));
    setData(null);
    setSearched(false);
    setQ("");
    setSuggests([]);
  }

  return (
    <div className="container" style={{ paddingTop: 44, maxWidth: 860 }}>
      <AnimatedContent>
        <h1 style={{ marginTop: 0 }}>Terjemah</h1>
        <p style={{ color: "var(--body)", marginTop: -6 }}>
          Cari padanan kata dua arah — Jawa ke Indonesia, atau Indonesia ke Jawa.
        </p>
      </AnimatedContent>

      {/* Segmented direction */}
      <AnimatedContent delay={0.08}>
        <div
          style={{
            display: "inline-flex", gap: 4, padding: 4, borderRadius: 10,
            background: "var(--surface-strong)", border: "1px solid var(--hairline)",
            margin: "18px 0 14px",
          }}
        >
          <button
            onClick={() => { setDir("jv-id"); setData(null); setSearched(false); }}
            style={{
              display: "inline-flex", alignItems: "center", gap: 8, cursor: "pointer",
              padding: "9px 16px", borderRadius: 8, border: 0, fontSize: "0.875rem", fontWeight: 600,
              background: dir === "jv-id" ? "var(--primary)" : "transparent",
              color: dir === "jv-id" ? "var(--on-primary)" : "var(--body)",
              transition: "all 0.18s ease",
            }}
          >
            Jawa ke Indonesia
          </button>
          <button
            onClick={() => { setDir("id-jv"); setData(null); setSearched(false); }}
            style={{
              display: "inline-flex", alignItems: "center", gap: 8, cursor: "pointer",
              padding: "9px 16px", borderRadius: 8, border: 0, fontSize: "0.875rem", fontWeight: 600,
              background: dir === "id-jv" ? "var(--primary)" : "transparent",
              color: dir === "id-jv" ? "var(--on-primary)" : "var(--body)",
              transition: "all 0.18s ease",
            }}
          >
            Indonesia ke Jawa
          </button>
        </div>
      </AnimatedContent>

      {/* Search bar */}
      <AnimatedContent delay={0.12}>
        <form
          onSubmit={(e) => { e.preventDefault(); doSearch(); }}
          style={{ display: "flex", gap: 10, width: "100%" }}
        >
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={dir === "jv-id" ? "Ketik kata Jawa… hasil otomatis (mis. abang)" : "Ketik kata Indonesia… hasil otomatis (mis. makan)"}
            style={{ flex: 1, minWidth: 0, padding: "0 16px", height: 46, borderRadius: 8, border: "1px solid var(--hairline-strong)", background: "var(--surface-card)", color: "var(--ink)", outline: "none", fontSize: "1rem" }}
          />
          <button type="submit" className="btn btn-primary" style={{ height: 46, padding: "0 22px" }}>
            <Search size={17} /> Cari
          </button>
          <button type="button" className="btn" onClick={swap} title="Balik arah" style={{ height: 46, width: 46, padding: 0, justifyContent: "center" }}>
            <ArrowRightLeft size={18} />
          </button>
        </form>

        {/* Contoh */}
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 12 }}>
          {EXAMPLES.map((ex) => (
            <button
              key={ex.label}
              onClick={() => { setDir(ex.dir); setQ(ex.q); doSearch(ex.q, ex.dir); }}
              className="badge"
              style={{ cursor: "pointer", fontSize: "0.8rem", textTransform: "none", letterSpacing: 0 }}
            >
              {ex.label}
            </button>
          ))}
        </div>
      </AnimatedContent>

      {/* Hasil */}
      <div style={{ marginTop: 22 }}>
        {loading && <p style={{ color: "var(--body)" }}>Mencari…</p>}
        {error && <p style={{ color: "var(--err)" }}>{error}</p>}

        {searched && !loading && !error && data && data.length === 0 && (
          <div>
            <p style={{ color: "var(--muted)" }}>Tidak ditemukan. Coba kata lain.</p>
            <DidYouMean
              items={suggests}
              onPick={(w) => {
                setQ(w);
                doSearch(w, dir);
              }}
            />
          </div>
        )}

        {data && data.length > 0 && (
          <>
            <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 12 }}>
              <span className="badge badge-muted" style={{ textTransform: "none", letterSpacing: 0, fontSize: "0.8rem" }}>
                {meta?.total ?? data.length} hasil
              </span>
              <span className="badge badge-muted" style={{ textTransform: "none", letterSpacing: 0, fontSize: "0.8rem" }}>
                {dir === "jv-id" ? "Jawa ke Indonesia" : "Indonesia ke Jawa"}
              </span>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {data.map((item, i) => (
                <FadeUp key={i} delay={Math.min(i, 8) * 0.04}>
                  <div className="card" style={{ padding: "16px 18px" }}>
                    {dir === "jv-id" ? (
                      <div style={{ display: "flex", gap: 14, alignItems: "baseline", flexWrap: "wrap" }}>
                        <b style={{ fontFamily: "var(--sans)", fontSize: "1.15rem", color: "var(--ink)" }}><Highlight text={item.jawa} query={dq} /></b>
                        <ChevronRight size={15} style={{ color: "var(--muted)", alignSelf: "center" }} />
                        <span style={{ color: "var(--body)", fontSize: "1rem" }}><Highlight text={item.indonesia} query={dq} /></span>
                        <span className="badge badge-muted" style={{ textTransform: "none", letterSpacing: 0, fontSize: "0.72rem" }}>{item.level}</span>
                        {(item.krama || item.krama_inggil) && (
                          <span style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                            {item.krama && <span className="badge badge-green" style={{ textTransform: "none", letterSpacing: 0, fontSize: "0.72rem" }}>krama: {item.krama}</span>}
                            {item.krama_inggil && <span className="badge" style={{ textTransform: "none", letterSpacing: 0, fontSize: "0.72rem" }}>inggil: {item.krama_inggil}</span>}
                          </span>
                        )}
                      </div>
                    ) : (
                      <div style={{ display: "flex", gap: 14, alignItems: "baseline", flexWrap: "wrap" }}>
                        <b style={{ fontFamily: "var(--sans)", fontSize: "1.15rem", color: "var(--ink)" }}><Highlight text={item.indonesia} query={dq} /></b>
                        <ChevronRight size={15} style={{ color: "var(--muted)", alignSelf: "center" }} />
                        <span style={{ color: "var(--body)", fontSize: "1rem" }}><Highlight text={item.ngoko} query={dq} /></span>
                        <span className="badge badge-green" style={{ textTransform: "none", letterSpacing: 0, fontSize: "0.72rem" }}>krama: {item.krama}</span>
                      </div>
                    )}
                    {item.example && (
                      <div style={{ marginTop: 8, color: "var(--muted)", fontSize: "0.85rem", fontStyle: "italic" }}>
                        {item.example?.jv}
                        {item.example.id && <span style={{ color: "var(--muted)" }}> — {item.example.id}</span>}
                      </div>
                    )}
                  </div>
                </FadeUp>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
