import { useMemo, useState } from "react";
import { AnimatedContent } from "../components/reactbits";
import { Play } from "../components/Icon";
import { api } from "../lib/api";

interface ParamDef { name: string; placeholder?: string; desc?: string; default?: string }

interface TesterEndpoint {
  id: string;
  method: string;
  path: string;
  title: string;
  desc: string;
  params: ParamDef[];
  run: (vals: Record<string, string>) => Promise<any>;
}

const ENDPOINTS: TesterEndpoint[] = [
  { id: "meta", method: "GET", path: "/api/meta", title: "Metadata", desc: "Info & jumlah data", params: [], run: () => api.meta() },
  { id: "overview", method: "GET", path: "/api", title: "Ikhtisar API", desc: "Daftar endpoint", params: [], run: () => api.overview() },
  {
    id: "entries", method: "GET", path: "/api/entries", title: "Entri Kamus",
    desc: "Filter huruf / pencarian / tingkat tutur", params: [
      { name: "letter", placeholder: "k", desc: "a–z" },
      { name: "q", placeholder: "abang", desc: "cari teks" },
      { name: "level", placeholder: "krama", desc: "ngoko | krama | krama_inggil" },
      { name: "page", placeholder: "1" },
      { name: "limit", placeholder: "10" },
    ],
    run: (v) => api.entries({ letter: v.letter, q: v.q, level: v.level, page: v.page ? Number(v.page) : undefined, limit: v.limit ? Number(v.limit) : undefined }),
  },
  {
    id: "search", method: "GET", path: "/api/search", title: "Pencarian Global",
    desc: "Cari kata di semua entri", params: [
      { name: "q", placeholder: "mangan", desc: "wajib" },
      { name: "limit", placeholder: "5" },
    ],
    run: (v) => api.search(v.q || "mangan", { limit: v.limit ? Number(v.limit) : undefined }),
  },
  {
    id: "turunan", method: "GET", path: "/api/turunan", title: "Kata Turunan",
    desc: "Cari kata turunan", params: [{ name: "q", placeholder: "nulis" }, { name: "limit", placeholder: "10" }],
    run: (v) => api.turunan({ q: v.q, limit: v.limit ? Number(v.limit) : undefined }),
  },
  { id: "thematic", method: "GET", path: "/api/thematic", title: "Tematik", desc: "Tabel kosa kata", params: [{ name: "slug", placeholder: "angka" }], run: (v) => api.thematic(v.slug) },
  {
    id: "proverbs", method: "GET", path: "/api/proverbs", title: "Peribahasa",
    desc: "Paribasan, bebasan, saloka…", params: [
      { name: "type", placeholder: "paribasan", desc: "paribasan | bebasan | saloka | tembung_entar | pepatah | pitutur_luhur" },
      { name: "q", placeholder: "becik" },
    ],
    run: (v) => api.proverbs({ type: v.type, q: v.q }),
  },
  { id: "cangkriman", method: "GET", path: "/api/cangkriman", title: "Cangkriman", desc: "Teka-teki + jawaban", params: [{ name: "q", placeholder: "geni" }], run: (v) => api.cangkriman(v.q) },
  { id: "dialogs", method: "GET", path: "/api/dialogs", title: "Pacelathon", desc: "Percakapan", params: [], run: () => api.dialogs() },
  { id: "geguritan", method: "GET", path: "/api/geguritan", title: "Geguritan", desc: "Puisi Jawa", params: [], run: () => api.geguritan() },
  { id: "sentences", method: "GET", path: "/api/sentences", title: "Kalimat 3 Tingkat", desc: "Ngoko–krama–krama alus", params: [{ name: "limit", placeholder: "5" }], run: (v) => api.sentences({ limit: v.limit ? Number(v.limit) : undefined }) },
  { id: "saku", method: "GET", path: "/api/saku", title: "Kamus Saku", desc: "Ngoko ke krama", params: [{ name: "q", placeholder: "abang" }], run: (v) => api.saku({ q: v.q }) },
  { id: "reverse", method: "GET", path: "/api/reverse", title: "Kamus Balik", desc: "Indonesia ke Jawa", params: [{ name: "q", placeholder: "makan" }], run: (v) => api.reverse(v.q) },
  { id: "tanya", method: "GET", path: "/api/tanya-jawab", title: "Tanya-Jawab", desc: "30 dialog harian", params: [], run: () => api.tanyaJawab() },
  { id: "extra", method: "GET", path: "/api/extra", title: "Daftar Ekstra", desc: "Ucapan, kerabat, warna…", params: [], run: () => api.extra() },
  { id: "latihan", method: "GET", path: "/api/latihan", title: "Latihan Soal", desc: "160 soal + kunci", params: [], run: () => api.latihan() },
  { id: "rencana", method: "GET", path: "/api/rencana", title: "Rencana Belajar", desc: "140 hari", params: [], run: () => api.rencana() },
  { id: "unggah", method: "GET", path: "/api/unggah-ungguh", title: "Unggah-Ungguh", desc: "Panduan tata krama", params: [], run: () => api.unggahUngguh() },
  { id: "openapi", method: "GET", path: "/api/openapi", title: "OpenAPI 3.0", desc: "Spesifikasi lengkap", params: [], run: () => api.openapi() },
];

interface HistoryItem { label: string; url: string; status: number; ms: number; body: string; time: string }

export default function Test() {
  const [selected, setSelected] = useState<TesterEndpoint>(ENDPOINTS[0]);
  const [values, setValues] = useState<Record<string, string>>({});
  const [result, setResult] = useState<{ status: number; ms: number; body: string } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<HistoryItem[]>([]);

  const activeParams = useMemo(() => selected.params, [selected]);

  async function run() {
    setLoading(true);
    setError(null);
    const start = performance.now();
    try {
      const r = await selected.run(values);
      const ms = Math.round(performance.now() - start);
      const body = JSON.stringify(r, null, 2);
      setResult({ status: 200, ms, body });
      setHistory((h) => [{ label: selected.path, url: selected.path, status: 200, ms, body, time: new Date().toLocaleTimeString() }, ...h].slice(0, 8));
    } catch (e: any) {
      const ms = Math.round(performance.now() - start);
      setResult(null);
      setError(e?.message || String(e));
      setHistory((h) => [{ label: selected.path, url: selected.path, status: 0, ms, body: JSON.stringify({ error: e?.message }, null, 2), time: new Date().toLocaleTimeString() }, ...h].slice(0, 8));
    } finally {
      setLoading(false);
    }
  }

  function select(ep: TesterEndpoint) {
    setSelected(ep);
    setValues({});
    setResult(null);
    setError(null);
  }

  return (
    <div className="container" style={{ paddingTop: 44 }}>
      <AnimatedContent>
        <h1 style={{ marginTop: 0 }}>API Tester</h1>
        <p style={{ color: "var(--body)" }}>
          Pilih endpoint, isi parameter, lalu kirim. Respons ditampilkan langsung — tanpa perlu curl.
        </p>
      </AnimatedContent>

      <div className="tester-grid">
        {/* Daftar endpoint */}
        <div className="tester-list">
          {ENDPOINTS.map((ep) => (
            <button
              key={ep.id}
              onClick={() => select(ep)}
              style={{
                display: "block", width: "100%", textAlign: "left", cursor: "pointer", marginBottom: 8,
                padding: "11px 14px", borderRadius: 12, border: "1px solid",
                borderColor: selected.id === ep.id ? "var(--primary)" : "var(--hairline)",
                background: selected.id === ep.id ? "var(--surface-strong)" : "var(--surface-card)",
                color: "var(--ink)",
              }}
            >
              <div style={{ fontSize: "0.82rem", display: "flex", gap: 8, alignItems: "center" }}>
                <span className={`m-${ep.method.toLowerCase()}`} style={{ fontWeight: 700 }}>{ep.method}</span>
                <code style={{ fontSize: "0.78rem", padding: "2px 6px" }}>{ep.path}</code>
              </div>
              <div style={{ fontSize: "0.82rem", color: "var(--body)", marginTop: 3 }}>{ep.title}</div>
            </button>
          ))}
        </div>

        {/* Panel utama */}
        <div>
          <div className="card" style={{ padding: "22px 24px" }}>
            <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
              <span className="badge badge-green m-get" style={{ textTransform: "none", fontSize: "0.85rem" }}>{selected.method}</span>
              <code style={{ fontSize: "1rem" }}>{selected.path}</code>
              <span style={{ color: "var(--muted)", fontSize: "0.88rem" }}>— {selected.desc}</span>
            </div>

            {activeParams.length > 0 && (
              <div style={{ marginTop: 18, display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 200px), 1fr))", gap: 10 }}>
                {activeParams.map((p) => (
                  <label key={p.name} style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                    <span style={{ fontSize: "0.78rem", color: "var(--muted)" }}>
                      <code>{p.name}</code> {p.desc && <span style={{ opacity: 0.7 }}>· {p.desc}</span>}
                    </span>
                    <input
                      value={values[p.name] ?? ""}
                      placeholder={p.placeholder || ""}
                      onChange={(e) => setValues((v) => ({ ...v, [p.name]: e.target.value }))}
                      style={{ padding: "9px 12px", borderRadius: 10, border: "1px solid var(--hairline-strong)", background: "var(--canvas)", color: "var(--ink)", outline: "none" }}
                    />
                  </label>
                ))}
              </div>
            )}

            <button className="btn btn-primary" onClick={run} disabled={loading} style={{ marginTop: 18 }}>
              {loading ? "Mengirim…" : <><Play size={16} /> Kirim Request</>}
            </button>
          </div>

          {/* Respons */}
          <div className="card" style={{ padding: "20px 24px", marginTop: 16 }}>
            <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 12, flexWrap: "wrap" }}>
              <h3 style={{ margin: 0, fontSize: "1.05rem" }}>Respons</h3>
              {result && (
                <>
                  <span className={`badge ${result.status < 300 ? "badge-green" : "badge-gold"}`}>HTTP {result.status}</span>
                  <span className="badge badge-muted">{result.ms} ms</span>
                </>
              )}
              {error && <span className="badge" style={{ background: "rgba(226,124,111,0.12)", color: "var(--err)", border: "1px solid rgba(226,124,111,0.3)" }}>Error</span>}
            </div>
            {error ? (
              <p style={{ color: "var(--err)", margin: 0, fontSize: "0.92rem" }}>{error}</p>
            ) : result ? (
              <pre style={{ maxHeight: "46vh", margin: 0 }}>{result.body}</pre>
            ) : (
              <p style={{ color: "var(--muted)", margin: 0, fontSize: "0.92rem" }}>Belum ada request. Klik "Kirim Request".</p>
            )}
          </div>

          {/* Riwayat */}
          {history.length > 0 && (
            <div className="card" style={{ padding: "18px 24px", marginTop: 16 }}>
              <h3 style={{ margin: "0 0 10px", fontSize: "1rem" }}>Riwayat</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {history.map((h, i) => (
                  <button
                    key={i}
                    onClick={() => setResult({ status: h.status, ms: h.ms, body: h.body })}
                    style={{ textAlign: "left", cursor: "pointer", background: "var(--canvas)", border: "1px solid var(--hairline)", borderRadius: 10, padding: "8px 12px", color: "var(--ink)", display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}
                  >
                    <span className={`badge ${h.status < 300 ? "badge-green" : "badge-gold"}`} style={{ textTransform: "none" }}>{h.status || "ERR"}</span>
                    <code style={{ fontSize: "0.8rem" }}>{h.label}</code>
                    <span style={{ color: "var(--muted)", fontSize: "0.78rem" }}>{h.ms} ms · {h.time}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

    </div>
  );
}
