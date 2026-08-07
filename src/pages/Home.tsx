import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { AnimatedContent, SplitText, GradientText, NumberTicker, FadeUp, Magnetic, SpotlightCard } from "../components/reactbits";
import SpecularButton from "../components/reactbits/SpecularButton";
import DidYouMean from "../components/DidYouMean";
import { api } from "../lib/api";

export default function Home() {
  const [counts, setCounts] = useState<any>(null);
  const [q, setQ] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);
  const [searched, setSearched] = useState(false);
  const [suggests, setSuggests] = useState<string[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    api.meta().then((m) => setCounts(m.data?.counts)).catch(() => {});
  }, []);

  async function doSearch(e?: React.FormEvent, term?: string) {
    e?.preventDefault();
    const query = (term ?? q).trim();
    if (!query) return;
    setSearching(true);
    setSearched(true);
    try {
      const r = await api.search(query, { limit: 6 });
      setResults(r.data || []);
      if ((r.data || []).length === 0) {
        try {
          const sug = await api.suggest(query);
          setSuggests(sug.data || []);
        } catch {
          setSuggests([]);
        }
      } else {
        setSuggests([]);
      }
    } catch {
      setResults([]);
      setSuggests([]);
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
      {/* HERO — gradasi langit ala Expo */}
      <section className="container hero-band" style={{ paddingTop: 88, paddingBottom: 56, textAlign: "center" }}>

        <SplitText text="Kamus Lengkap Basa Jawa" style={{ fontSize: "clamp(2.2rem, 6vw, 4rem)", margin: 0 }} />
        <AnimatedContent delay={0.3}>
          <p style={{ fontFamily: "var(--sans)", fontStyle: "italic", fontSize: "1.25rem", color: "var(--body)", margin: "10px 0 26px" }}>
            Ngoko · Krama · Krama <GradientText>Inggil</GradientText> — dalam satu API.
          </p>
        </AnimatedContent>

        {/* Quick search */}
        <AnimatedContent delay={0.42}>
          <form onSubmit={doSearch} style={{ display: "flex", gap: 10, maxWidth: 560, margin: "0 auto 20px", width: "100%" }}>
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Coba: abang, mangan, tuku, gedhe…"
              style={{
                flex: 1, minWidth: 0, padding: "0 18px", height: 44, borderRadius: 8, border: "1px solid var(--hairline-strong)",
                background: "var(--surface-card)", color: "var(--ink)", fontSize: "1rem", outline: "none",
              }}
            />
            <SpecularButton
              type="submit"
              size="md"
              radius={8}
              textColor="#ffffff"
              lineColor="#ffffff"
              baseColor="#171717"
              tint="#ffffff"
              tintOpacity={0.08}
              intensity={1}
              shineSize={14}
              shineFade={46}
              thickness={1.2}
              followMouse
              proximity={260}
              disabled={searching}
            >
              {searching ? "Mencari…" : "Cari"}
            </SpecularButton>
          </form>
        </AnimatedContent>

        {searched && (
          <div style={{ maxWidth: 560, margin: "0 auto", textAlign: "left" }}>
            {results.length === 0 ? (
              <div>
                <p style={{ color: "var(--muted)", fontSize: "0.9rem" }}>Tidak ditemukan. Coba kata lain.</p>
                {searched && (
                  <DidYouMean
                    items={suggests}
                    onPick={(w) => {
                      setQ(w);
                      doSearch(undefined, w);
                    }}
                  />
                )}
              </div>
            ) : (
              results.map((e, i) => (
                <FadeUp key={e.id} delay={i * 0.05}>
                  <div className="card" style={{ padding: "10px 16px", marginBottom: 8, display: "flex", gap: 12, alignItems: "baseline" }}>
                    <b style={{ color: "var(--ink)", fontFamily: "var(--sans)", fontSize: "1.05rem", minWidth: 110 }}>{e.word}</b>
                    <span className="badge badge-muted">{e.level}</span>
                    <span style={{ color: "var(--body)", fontSize: "0.9rem" }}>— {e.meaning}</span>
                  </div>
                </FadeUp>
              ))
            )}
          </div>
        )}
      </section>

      {/* STATS */}
      <section className="container" style={{ paddingBottom: 60 }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 200px), 1fr))", gap: 14 }}>
          {stats.map((s, i) => (
            <FadeUp key={s.label} delay={i * 0.08}>
              <SpotlightCard className="card" style={{ padding: "22px 24px", textAlign: "center" }}>
                <div style={{ fontFamily: "var(--sans)", fontSize: "2.4rem", fontWeight: 700, color: "var(--ink)" }}>
                  <NumberTicker value={s.value} />
                </div>
                <div style={{ color: "var(--body)", fontSize: "0.9rem", marginTop: 4 }}>{s.label}</div>
              </SpotlightCard>
            </FadeUp>
          ))}
        </div>
      </section>

      {/* FITUR */}
      <section className="container" style={{ paddingBottom: 30 }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 260px), 1fr))", gap: 16 }}>
          {[
            { to: "/docs", t: "Dokumentasi Lengkap", d: "Semua endpoint, parameter, contoh kode (curl, JavaScript, Python), format respons & error." },
            { to: "/test", t: "API Tester Interaktif", d: "Coba setiap endpoint langsung dari browser: isi parameter, kirim, lihat status & respons JSON." },
            { to: "/explore", t: "Jelajah Kata A–Z", d: "Telusuri ribuan entri per huruf dengan pencarian & paginasi." },
            { to: "/api/openapi", t: "OpenAPI 3.0", d: "Spesifikasi OpenAPI siap diimpor ke Postman, Insomnia, atau Swagger UI." },
          ].map((f, i) => (
            <FadeUp key={f.to} delay={i * 0.08}>
              {f.to === "/docs" ? (
                <SpotlightCard className="card" style={{ padding: "26px 26px", height: "100%", display: "flex", flexDirection: "column" }}>
                  <h3 style={{ marginTop: 0, color: "var(--ink)" }}>{f.t}</h3>
                  <p style={{ color: "var(--body)", fontSize: "0.92rem", margin: 0, flex: 1 }}>{f.d}</p>
                  <div style={{ marginTop: 16 }}>
                    <SpecularButton
                      size="sm"
                      radius={8}
                      textColor="#ffffff"
                      lineColor="#ffffff"
                      baseColor="#171717"
                      tint="#ffffff"
                      tintOpacity={0.08}
                      intensity={1}
                      shineSize={14}
                      shineFade={46}
                      thickness={1.1}
                      followMouse
                      proximity={220}
                      onClick={() => navigate("/docs")}
                    >
                      Buka Dokumentasi
                    </SpecularButton>
                  </div>
                </SpotlightCard>
              ) : (
                <Link to={f.to} style={{ textDecoration: "none" }}>
                  <SpotlightCard className="card" style={{ padding: "26px 26px", height: "100%", display: "block" }}>
                    <h3 style={{ marginTop: 0, color: "var(--ink)" }}>{f.t}</h3>
                    <p style={{ color: "var(--body)", fontSize: "0.92rem", margin: 0 }}>{f.d}</p>
                  </SpotlightCard>
                </Link>
              )}
            </FadeUp>
          ))}
        </div>
      </section>
    </div>
  );
}
