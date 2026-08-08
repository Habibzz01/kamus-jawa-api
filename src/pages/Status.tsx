import { useEffect, useRef, useState } from "react";
import { AnimatedContent, FadeUp, NumberTicker } from "../components/reactbits";
import { usePageMeta } from "../lib/usePageMeta";
import {
  Activity, RefreshCw, Pause, Play, Cpu, Clock, Server, Database, BarChart3,
  ShieldCheck, Radio, Wifi, Check,
} from "../components/Icon";
import { api } from "../lib/api";

/* Endpoint inti yang diprobes dari browser (latensi jaringan nyata) */
const TARGETS: { path: string; name: string }[] = [
  { path: "/api/meta", name: "Metadata" },
  { path: "/api/entries?letter=k&limit=1", name: "Entri" },
  { path: "/api/search?q=mangan&limit=1", name: "Pencarian" },
  { path: "/api/translate?q=abang&dir=jv-id&limit=1", name: "Terjemah" },
  { path: "/api/proverbs?type=saloka&limit=1", name: "Peribahasa" },
  { path: "/api/cangkriman?limit=1", name: "Cangkriman" },
  { path: "/api/suggest?q=abng&limit=2", name: "Saran" },
  { path: "/api/openapi", name: "OpenAPI" },
];

interface Probe { name: string; path: string; ok: boolean; latency: number; checkedAt: number }
interface LogEntry { time: string; label: string; ok: boolean; latency: number }

const STORE_KEY = "kamus-status-hist";
const MAX_SERIES = 60;

function latencyColor(ms: number) {
  if (ms < 250) return "var(--ok)";
  if (ms < 700) return "var(--amber, #c98f3f)";
  return "var(--err)";
}

/* Sparkline SVG kecil */
function Spark({ data, color }: { data: number[]; color: string }) {
  const w = 100, h = 26;
  if (data.length < 2) {
    return (
      <svg width={w} height={h} style={{ display: "block" }}>
        <line x1="0" y1={h / 2} x2={w} y2={h / 2} stroke="var(--hairline-strong)" strokeWidth="1" />
      </svg>
    );
  }
  const max = Math.max(...data, 1);
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * w;
    const y = h - 2 - (v / max) * (h - 6);
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  });
  return (
    <svg width={w} height={h} style={{ display: "block" }}>
      <polyline points={pts.join(" ")} fill="none" stroke={color} strokeWidth="2" strokeLinejoin="round" />
    </svg>
  );
}

export default function Status() {
  usePageMeta("Status Server — Kamus Jawa API", "Pemantauan status server Kamus Jawa API secara realtime: uptime, latensi per endpoint, log, dan kesehatan sistem.");

  const [auto, setAuto] = useState(true);
  const [intervalMs, setIntervalMs] = useState(3000);
  const [lastUpdate, setLastUpdate] = useState<string | null>(null);
  const [probing, setProbing] = useState(false);

  const [server, setServer] = useState<any>(null);
  const [probes, setProbes] = useState<Probe[]>([]);
  const [series, setSeries] = useState<number[]>([]);
  const [perEndpoint, setPerEndpoint] = useState<Record<string, number[]>>({});
  const [log, setLog] = useState<LogEntry[]>([]);

  const [totalChecks, setTotalChecks] = useState(0);
  const [okChecks, setOkChecks] = useState(0);

  const mounted = useRef(true);

  async function tick() {
    setProbing(true);
    const t = Date.now();
    const stamp = new Date().toLocaleTimeString("id-ID");

    // 1) snapshot server (health check internal)
    let srv: any = null;
    try {
      const r = await api.status();
      srv = r.data;
    } catch {
      srv = null;
    }
    setServer(srv);

    // 2) probe endpoint dari browser (latensi nyata)
    const results = await Promise.all(
      TARGETS.map(async (tg) => {
        const t0 = performance.now();
        try {
          const res = await fetch(tg.path);
          const ok = res.ok;
          return { name: tg.name, path: tg.path, ok, latency: Math.round(performance.now() - t0), checkedAt: t } as Probe;
        } catch {
          return { name: tg.name, path: tg.path, ok: false, latency: -1, checkedAt: t } as Probe;
        }
      })
    );
    setProbes(results);

    const okN = results.filter((r) => r.ok).length;
    setOkChecks((v) => v + okN);
    setTotalChecks((v) => v + results.length);

    // series latensi rata-rata
    const avg = results.filter((r) => r.ok && r.latency >= 0).reduce((a, r) => a + r.latency, 0) /
      Math.max(1, results.filter((r) => r.ok).length);
    setSeries((prev) => [...prev, Math.round(avg)].slice(-MAX_SERIES));

    // per-endpoint history
    setPerEndpoint((prev) => {
      const next: Record<string, number[]> = { ...prev };
      for (const r of results) {
        if (r.ok && r.latency >= 0) next[r.path] = [...(next[r.path] || []), r.latency].slice(-14);
      }
      return next;
    });

    // log streaming
    const entries: LogEntry[] = [];
    if (srv) entries.push({ time: stamp, label: "Server health", ok: srv.status === "operational", latency: srv.latencyMs });
    for (const r of results) {
      entries.push({ time: stamp, label: r.name, ok: r.ok, latency: r.latency });
    }
    setLog((prev) => [...entries, ...prev].slice(0, 30));

    setLastUpdate(stamp);
    setProbing(false);
  }

  useEffect(() => {
    mounted.current = true;
    tick();
    return () => {
      mounted.current = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!auto) return;
    const id = setInterval(tick, intervalMs);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [auto, intervalMs]);

  const uptime = totalChecks ? Math.round((okChecks / totalChecks) * 1000) / 10 : 100;
  const avgLatency = series.length ? Math.round(series.reduce((a, b) => a + b, 0) / series.length) : 0;
  const overall = probes.length
    ? probes.every((p) => p.ok) && server
      ? "operational"
      : probes.some((p) => p.ok)
        ? "degraded"
        : "down"
    : "checking";

  const overallColor = overall === "operational" ? "var(--ok)" : overall === "degraded" ? "var(--amber, #c98f3f)" : "var(--err)";
  const overallLabel = overall === "operational" ? "Operasional" : overall === "degraded" ? "Gangguan Sebagian" : overall === "down" ? "Tidak Tersedia" : "Memeriksa…";

  return (
    <div className="container" style={{ paddingTop: 44, maxWidth: 1080 }}>
      <AnimatedContent>
        <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
          <span style={{ width: 44, height: 44, borderRadius: 12, display: "grid", placeItems: "center", background: "var(--surface-strong)", color: "var(--text-link)" }}>
            <Activity size={22} />
          </span>
          <div>
            <h1 style={{ margin: 0 }}>Status Server</h1>
            <p style={{ color: "var(--body)", margin: "2px 0 0" }}>Pemantauan realtime layanan Kamus Jawa API</p>
          </div>
        </div>
      </AnimatedContent>

      {/* Banner status keseluruhan */}
      <AnimatedContent delay={0.08}>
        <div
          className="card"
          style={{
            marginTop: 20, padding: "18px 22px", display: "flex", gap: 16, alignItems: "center", flexWrap: "wrap",
            borderColor: overallColor,
          }}
        >
          <span style={{ position: "relative", display: "inline-flex" }}>
            <span style={{ width: 12, height: 12, borderRadius: 999, background: overallColor, display: "block" }} />
            <span
              style={{
                position: "absolute", inset: -5, borderRadius: 999, border: `2px solid ${overallColor}`, opacity: 0.5,
                animation: "pulse 1.6s ease-out infinite",
              }}
            />
          </span>
          <div style={{ fontWeight: 700, fontSize: "1.1rem" }}>{overallLabel}</div>
          <div style={{ color: "var(--body)", fontSize: "0.9rem" }}>
            Semua sistem {overall === "operational" ? "berjalan normal" : "perlu perhatian"} — terakhir diperbarui {lastUpdate ?? "…"}
          </div>
          <div style={{ marginLeft: "auto", display: "flex", gap: 8, flexWrap: "wrap" }}>
            <button className="btn" onClick={() => setAuto((a) => !a)} style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
              {auto ? <Pause size={15} /> : <Play size={15} />} {auto ? "Jeda" : "Lanjut"}
            </button>
            <button className="btn" onClick={tick} disabled={probing} style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
              <RefreshCw size={15} className={probing ? "spin" : ""} /> Segarkan
            </button>
            <select
              value={intervalMs}
              onChange={(e) => setIntervalMs(Number(e.target.value))}
              style={{ padding: "0 10px", borderRadius: 8, border: "1px solid var(--hairline-strong)", background: "var(--surface-card)", color: "var(--ink)", fontSize: "0.85rem" }}
              aria-label="Interval pembaruan"
            >
              <option value={2000}>2 dtk</option>
              <option value={3000}>3 dtk</option>
              <option value={5000}>5 dtk</option>
              <option value={10000}>10 dtk</option>
            </select>
          </div>
          <style>{`@keyframes pulse { 0% { transform: scale(0.8); opacity: 0.7 } 100% { transform: scale(1.9); opacity: 0 } } .spin { animation: rspin 0.9s linear infinite } @keyframes rspin { to { transform: rotate(360deg) } }`}</style>
        </div>
      </AnimatedContent>

      {/* Statistik */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 200px), 1fr))", gap: 14, marginTop: 18 }}>
        {[
          { label: "Uptime", value: uptime, suffix: "%", icon: ShieldCheck, color: "var(--ok)" },
          { label: "Latensi rata-rata", value: avgLatency, suffix: " ms", icon: Clock, color: "var(--text-link)" },
          { label: "Endpoint OK", value: probes.filter((p) => p.ok).length, suffix: `/${probes.length}`, icon: Check, color: "var(--ok)" },
          { label: "Total pemeriksaan", value: totalChecks, suffix: "", icon: BarChart3, color: "var(--accent-preview)" },
        ].map((s, i) => {
          const Icon = s.icon;
          return (
            <FadeUp key={s.label} delay={i * 0.06}>
              <div className="card" style={{ padding: "18px 20px", display: "flex", gap: 14, alignItems: "center" }}>
                <span style={{ width: 40, height: 40, borderRadius: 10, display: "grid", placeItems: "center", background: "var(--surface-strong)", color: s.color, flexShrink: 0 }}>
                  <Icon size={20} />
                </span>
                <div>
                  <div style={{ fontSize: "1.5rem", fontWeight: 700, fontFamily: "var(--sans)", lineHeight: 1.1 }}>
                    {s.value !== 100 || s.label !== "Uptime" ? <NumberTicker value={s.value} /> : "100"}<span style={{ fontSize: "0.9rem", color: "var(--body)" }}>{s.suffix}</span>
                  </div>
                  <div style={{ color: "var(--body)", fontSize: "0.82rem" }}>{s.label}</div>
                </div>
              </div>
            </FadeUp>
          );
        })}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1.4fr) minmax(0, 1fr)", gap: 18, marginTop: 18, alignItems: "start" }}>
        {/* Kiri: grafik latensi + endpoint */}
        <div style={{ display: "flex", flexDirection: "column", gap: 18, minWidth: 0 }}>
          <FadeUp>
            <div className="card" style={{ padding: "18px 20px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                <BarChart3 size={18} style={{ color: "var(--text-link)" }} />
                <b style={{ fontFamily: "var(--sans)" }}>Latensi realtime</b>
                <span style={{ color: "var(--muted)", fontSize: "0.78rem", marginLeft: "auto" }}>
                  {series.length ? `${series[series.length - 1]} ms terakhir` : "mengumpulkan…"}
                </span>
              </div>
              <svg viewBox="0 0 600 160" width="100%" height={160} preserveAspectRatio="none" style={{ display: "block" }}>
                <defs>
                  <linearGradient id="latg" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--text-link)" stopOpacity="0.35" />
                    <stop offset="100%" stopColor="var(--text-link)" stopOpacity="0.02" />
                  </linearGradient>
                </defs>
                {series.length > 1 ? (
                  <>
                    <polygon
                      points={`0,160 ${series.map((v, i) => `${(i / (series.length - 1)) * 600},${160 - 4 - (v / Math.max(...series, 1)) * 140}`).join(" ")} 600,160`}
                      fill="url(#latg)"
                    />
                    <polyline
                      points={series.map((v, i) => `${(i / (series.length - 1)) * 600},${160 - 4 - (v / Math.max(...series, 1)) * 140}`).join(" ")}
                      fill="none" stroke="var(--text-link)" strokeWidth="2.5" strokeLinejoin="round"
                    />
                  </>
                ) : (
                  <text x="300" y="82" textAnchor="middle" fill="var(--muted)" fontSize="13">Menunggu data…</text>
                )}
              </svg>
            </div>
          </FadeUp>

          <FadeUp delay={0.06}>
            <div className="card" style={{ padding: "18px 20px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                <Database size={18} style={{ color: "var(--accent-preview)" }} />
                <b style={{ fontFamily: "var(--sans)" }}>Endpoint</b>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {probes.length === 0 && <p style={{ color: "var(--muted)", fontSize: "0.85rem", margin: 0 }}>Memeriksa endpoint…</p>}
                {probes.map((p) => {
                  const hist = perEndpoint[p.path] || [];
                  const color = p.ok ? (p.latency >= 0 ? latencyColor(p.latency) : "var(--ok)") : "var(--err)";
                  return (
                    <div key={p.path} style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap", padding: "9px 12px", borderRadius: 10, background: "var(--bg-soft, var(--canvas-soft))", border: "1px solid var(--hairline)" }}>
                      <span style={{ width: 9, height: 9, borderRadius: 999, background: color, flexShrink: 0 }} />
                      <div style={{ minWidth: 110 }}>
                        <div style={{ fontWeight: 600, fontSize: "0.9rem" }}>{p.name}</div>
                        <div style={{ color: "var(--muted)", fontSize: "0.72rem", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 180 }}>{p.path}</div>
                      </div>
                      <span
                        className="badge"
                        style={{
                          textTransform: "none", letterSpacing: 0, fontSize: "0.75rem", color,
                          background: "transparent", borderColor: "color-mix(in srgb, " + color + " 40%, transparent)",
                        }}
                      >
                        {p.ok ? (p.latency >= 0 ? `${p.latency} ms` : "OK") : "Gagal"}
                      </span>
                      <div style={{ marginLeft: "auto" }}>
                        <Spark data={hist} color={color} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </FadeUp>
        </div>

        {/* Kanan: info sistem + log */}
        <div style={{ display: "flex", flexDirection: "column", gap: 18, minWidth: 0 }}>
          <FadeUp delay={0.04}>
            <div className="card" style={{ padding: "18px 20px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
                <Server size={18} style={{ color: "var(--ok)" }} />
                <b style={{ fontFamily: "var(--sans)" }}>Info Sistem</b>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 9, fontSize: "0.88rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
                  <span style={{ color: "var(--body)", display: "inline-flex", gap: 6, alignItems: "center" }}><Cpu size={14} /> Runtime</span>
                  <code>{server?.runtime ?? "…"}</code>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
                  <span style={{ color: "var(--body)", display: "inline-flex", gap: 6, alignItems: "center" }}><Radio size={14} /> Region</span>
                  <code>{server?.region ?? "…"}</code>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
                  <span style={{ color: "var(--body)", display: "inline-flex", gap: 6, alignItems: "center" }}><Wifi size={14} /> Versi API</span>
                  <code>{server?.version ?? "…"}</code>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
                  <span style={{ color: "var(--body)", display: "inline-flex", gap: 6, alignItems: "center" }}><Clock size={14} /> Waktu server</span>
                  <code>{server?.serverTime ? new Date(server.serverTime).toLocaleTimeString("id-ID") : "…"}</code>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
                  <span style={{ color: "var(--body)", display: "inline-flex", gap: 6, alignItems: "center" }}><Database size={14} /> Entri / Turunan</span>
                  <code>{server?.counts?.entries ?? "…"} / {server?.counts?.turunan ?? "…"}</code>
                </div>
              </div>

              <div style={{ marginTop: 14, paddingTop: 12, borderTop: "1px solid var(--hairline)" }}>
                <div style={{ color: "var(--muted)", fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 8 }}>Pemeriksaan server</div>
                {!server && <p style={{ color: "var(--muted)", fontSize: "0.85rem", margin: 0 }}>Memuat…</p>}
                {(server?.checks || []).map((c: any) => (
                  <div key={c.name} style={{ display: "flex", gap: 10, alignItems: "center", padding: "5px 0", fontSize: "0.85rem" }}>
                    <span style={{ width: 8, height: 8, borderRadius: 999, background: c.ok ? "var(--ok)" : "var(--err)", flexShrink: 0 }} />
                    <span style={{ color: "var(--body)", minWidth: 90 }}>{c.name}</span>
                    <span style={{ color: "var(--muted)", fontSize: "0.78rem", marginLeft: "auto" }}>{c.detail}</span>
                  </div>
                ))}
              </div>
            </div>
          </FadeUp>

          <FadeUp delay={0.08}>
            <div className="card" style={{ padding: "18px 20px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                <Activity size={18} style={{ color: "var(--accent-preview)" }} />
                <b style={{ fontFamily: "var(--sans)" }}>Log streaming</b>
                <span style={{ color: "var(--muted)", fontSize: "0.75rem", marginLeft: "auto" }}>{log.length} entri</span>
              </div>
              <div style={{ maxHeight: 260, overflowY: "auto", display: "flex", flexDirection: "column", gap: 6, paddingRight: 4 }}>
                {log.length === 0 && <p style={{ color: "var(--muted)", fontSize: "0.85rem", margin: 0 }}>Menunggu data…</p>}
                {log.map((l, i) => (
                  <div key={`${l.time}-${l.label}-${i}`} style={{ display: "flex", gap: 10, alignItems: "center", fontSize: "0.82rem", padding: "6px 10px", borderRadius: 8, background: "var(--canvas-soft)", border: "1px solid var(--hairline)" }}>
                    <span style={{ width: 8, height: 8, borderRadius: 999, background: l.ok ? "var(--ok)" : "var(--err)", flexShrink: 0 }} />
                    <span style={{ color: "var(--muted)", fontFamily: "var(--mono)", fontSize: "0.72rem", flexShrink: 0 }}>{l.time}</span>
                    <span style={{ color: "var(--ink)", fontWeight: 600 }}>{l.label}</span>
                    <span style={{ marginLeft: "auto", color: l.ok ? "var(--body)" : "var(--err)", fontFamily: "var(--mono)", fontSize: "0.75rem" }}>
                      {l.latency >= 0 ? `${l.latency} ms` : l.ok ? "OK" : "GAGAL"}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </FadeUp>
        </div>
      </div>

      <AnimatedContent>
        <p style={{ color: "var(--muted)", fontSize: "0.8rem", marginTop: 20, textAlign: "center" }}>
          Status diperbarui otomatis setiap {intervalMs / 1000} detik. Latensi diukur dari browser ke server (kondisi jaringan nyata).
        </p>
      </AnimatedContent>
    </div>
  );
}
