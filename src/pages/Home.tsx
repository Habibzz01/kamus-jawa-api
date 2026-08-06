import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { AnimatedContent, SplitText, GradientText, NumberTicker, FadeUp, Magnetic, SpotlightCard } from "../components/reactbits";
import { api } from "../lib/api";

export default function Home() {
  const [counts, setCounts] = useState<any>(null);
  const [q, setQ] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);
  const [searched, setSearched] = useState(false);

  useEffect(() => {
    api.meta().then((m) => setCounts(m.data?.counts)).catch(() => {});
  }, []);

  async function doSearch(e?: React.FormEvent) {
    e?.preventDefault();
    if (!q.trim()) return;
    setSearching(true);
    setSearched(true);
    try {
      const r = await api.search(q.trim(), { limit: 6 });
      setResults(r.data || []);
    } catch {
      setResults([]);
    } finally {
      setSearching(false);
    }
  }

  const stats = [
    { label: "Entri kamus A–Z", value: counts?.entries ?? 3029 },
    { label: "Kata turunan", value: counts?.turunan ?? 4753 },
    { label: "Kalimat 3 tingkat", value: counts?.sentences_3levels ?? 388 },
    { label: "Latihan soal", value: counts?.latihan_soal ?? 160 },
  ];

  return (
    <div>
      {/* HERO */}
      <section className="container" style={{ paddingTop: 70, paddingBottom: 50, textAlign: "center" }}>
        <AnimatedContent>
          <div style={{ display: "flex", gap: 8, justifyContent: "center", marginBottom: 18 }}>
            <span className="badge badge-gold">REST API Dinamis</span>
            <span className="badge badge-green">CORS Enabled</span>
            <span className="badge badge-muted">TypeScript</span>
          </div>
        </AnimatedContent>

        <SplitText text="Kamus Lengkap Basa Jawa" style={{ fontSize: "clamp(2.2rem, 6vw, 4rem)", margin: 0 }} />
        <AnimatedContent delay={0.3}>
          <p style={{ fontFamily: "var(--serif)", fontStyle: "italic", fontSize: "1.25rem", color: "var(--text-2)", margin: "10px 0 26px" }}>
            Ngoko · Krama · Krama <GradientText>Inggil</GradientText> — dalam satu API.
          </p>
        </AnimatedContent>

        {/* Quick search */}
        <AnimatedContent delay={0.42}>
          <form onSubmit={doSearch} style={{ display: "flex", gap: 10, maxWidth: 560, margin: "0 auto 20px" }}>
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Coba: abang, mangan, tuku, gedhe…"
              style={{
                flex: 1, padding: "13px 18px", borderRadius: 999, border: "1px solid var(--line)",
                background: "var(--card)", color: "var(--text)", fontSize: "1rem", outline: "none",
              }}
            />
            <Magnetic>
              <button type="submit" className="btn btn-primary" style={{ height: "100%" }}>
                {searching ? "…" : "Cari"}
              </button>
            </Magnetic>
          </form>
        </AnimatedContent>

        {searched && (
          <div style={{ maxWidth: 560, margin: "0 auto", textAlign: "left" }}>
            {results.length === 0 ? (
              <p style={{ color: "var(--text-3)", fontSize: "0.9rem" }}>Tidak ditemukan. Coba kata lain.</p>
            ) : (
              results.map((e, i) => (
                <FadeUp key={e.id} delay={i * 0.05}>
                  <div className="card" style={{ padding: "10px 16px", marginBottom: 8, display: "flex", gap: 12, alignItems: "baseline" }}>
                    <b style={{ color: "var(--gold-2)", fontFamily: "var(--serif)", fontSize: "1.05rem", minWidth: 110 }}>{e.word}</b>
                    <span className="badge badge-muted">{e.level}</span>
                    <span style={{ color: "var(--text-2)", fontSize: "0.9rem" }}>— {e.meaning}</span>
                  </div>
                </FadeUp>
              ))
            )}
          </div>
        )}
      </section>

      {/* STATS */}
      <section className="container" style={{ paddingBottom: 60 }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 14 }}>
          {stats.map((s, i) => (
            <FadeUp key={s.label} delay={i * 0.08}>
              <SpotlightCard className="card" style={{ padding: "22px 24px", textAlign: "center" }}>
                <div style={{ fontFamily: "var(--serif)", fontSize: "2.4rem", fontWeight: 700, color: "var(--gold-2)" }}>
                  <NumberTicker value={s.value} />
                </div>
                <div style={{ color: "var(--text-2)", fontSize: "0.9rem", marginTop: 4 }}>{s.label}</div>
              </SpotlightCard>
            </FadeUp>
          ))}
        </div>
      </section>

      {/* FITUR */}
      <section className="container" style={{ paddingBottom: 30 }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 16 }}>
          {[
            { to: "/docs", t: "Dokumentasi Lengkap", d: "Semua endpoint, parameter, contoh kode (curl, JavaScript, Python), format respons & error." },
            { to: "/test", t: "API Tester Interaktif", d: "Coba setiap endpoint langsung dari browser: isi parameter, kirim, lihat status & respons JSON." },
            { to: "/explore", t: "Jelajah Kata A–Z", d: "Telusuri ribuan entri per huruf dengan pencarian & paginasi." },
            { to: "/api/openapi", t: "OpenAPI 3.0", d: "Spesifikasi OpenAPI siap diimpor ke Postman, Insomnia, atau Swagger UI." },
          ].map((f, i) => (
            <FadeUp key={f.to} delay={i * 0.08}>
              <Link to={f.to} style={{ textDecoration: "none" }}>
                <SpotlightCard className="card" style={{ padding: "26px 26px", height: "100%", display: "block" }}>
                  <h3 style={{ marginTop: 0, color: "var(--gold-2)" }}>{f.t}</h3>
                  <p style={{ color: "var(--text-2)", fontSize: "0.92rem", margin: 0 }}>{f.d}</p>
                </SpotlightCard>
              </Link>
            </FadeUp>
          ))}
        </div>
      </section>
    </div>
  );
}
