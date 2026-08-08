import { useEffect, useRef, useState } from "react";
import { AnimatedContent, FadeUp, NumberTicker } from "../components/reactbits";
import { usePageMeta } from "../lib/usePageMeta";
import {
  Activity, RefreshCw, Pause, Play, Cpu, Clock, Server, Database, BarChart3,
  ShieldCheck, Radio, Wifi, Check, AlertTriangle, XCircle,
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

interface Probe { name: string; path: string; ok: boolean; latency: number; code?: number; errMsg?: string; checkedAt: number }
interface LogEntry { time: string; label: string; ok: boolean; latency: number }
interface Issue {
  id: string;
  source: string;
  title: string;
  detail: string;
  code?: string;
  started: string;
  resolved?: string;
}

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
  usePageMeta("Status Server — Kamus Jawa API", "Pemantauan status server Kamus Jawa API secara realtime: uptime, latensi, issue, log, dan kesehatan sistem.");

  const [auto, setAuto] = useState(true);
  const [intervalMs, setIntervalMs] = useState(3000);
  const [lastUpdate, setLastUpdate] = useState<string | null>(null);
  const [probing, setProbing] = useState(false);

  const [server, setServer] = useState<any>(null);
  const [probes, setProbes] = useState<Probe[]>([]);
  const [series, setSeries] = useState<number[]>([]);
  const [perEndpoint, setPerEndpoint] = useState<Record<string, number[]>>({});
  const [log, setLog] = useState<LogEntry[]>([]);
  const [issues, setIssues] = useState<Issue[]>([]);

  const [totalChecks, setTotalChecks] = useState(0);
  const [okChecks, setOkChecks] = useState(0);

  const mounted = useRef(true);
  const issuesRef = useRef<Issue[]>([]);
  issuesRef.current = issues;

  /* Deteksi timezone klien */
  const [clientTz, setClientTz] = useState("—");
  useEffect(() => {
    try {
      setClientTz(Intl.DateTimeFormat().resolvedOptions().timeZone || "—");
    } catch {
      setClientTz("—");
    }
  }, []);

  const nowLocal = () => new Date().toLocaleTimeString("id-ID", { hour12: false });

  /* Kelola issue (muncul saat gagal, hilang saat pulih) */
  function upsertIssue(src: string, title: string, detail: string, code?: string) {
    const id = src;
    setIssues((prev) => {
      const ex = prev.find((i) => i.id === id);
      if (ex) return prev;
      return [{ id, source: src, title, detail, code, started: nowLocal() }, ...prev].slice(0, 12);
    });
  }
  function resolveIssue(src: string) {
    setIssues((prev) => prev.map((i) => (i.id === src && !i.resolved ? { ...i, resolved: nowLocal() } : i)));
  }

  async function tick() {
    setProbing(true);
    const stamp = nowLocal();

    // 1) snapshot server (health check internal + detail error)
    let srv: any = null;
    try {
      const r = await api.status();
      srv = r.data;
    } catch {
      srv = null;
    }
    setServer(srv);

    if (srv && srv.status !== "operational") {
      const detail = (srv.issues || []).map((x: any) => `${x.check}: ${x.message}`).join(" · ") || srv.message;
      upsertIssue("server", "Server tidak sehat", detail, "500");
    } else if (srv) {
      resolveIssue("server");
    } else {
      upsertIssue("server", "Server tidak merespons", "Permintaan ke /api/status gagal — server mungkin down atau timeout.", "—");
    }

    // 2) probe endpoint dari browser (latensi nyata + detail error)
    const results = await Promise.all(
      TARGETS.map(async (tg) => {
        const t0 = performance.now();
        let probe: Probe;
        try {
          const res = await fetch(tg.path);
          const ok = res.ok;
          probe = { name: tg.name, path: tg.path, ok, latency: Math.round(performance.now() - t0), code: res.status, checkedAt: Date.now() };
          if (ok) {
            resolveIssue(tg.path);
          } else {
            upsertIssue(tg.path, `Endpoint ${tg.name} bermasalah`, `HTTP ${res.status} pada ${tg.path}`, String(res.status));
          }
        } catch (e: any) {
          probe = { name: tg.name, path: tg.path, ok: false, latency: -1, errMsg: e?.message || "Network error", checkedAt: Date.now() };
          upsertIssue(tg.path, `Endpoint ${tg.name} gagal`, (e?.message || "Network error") + ` pada ${tg.path}`, "NET");
        }
        return probe;
      })
    );
    setProbes(results);

    const okN = results.filter((r) => r.ok).length;
    setOkChecks((v) => v + okN);
    setTotalChecks((v) => v + results.length);

    // series latensi rata-rata
    const okLat = results.filter((r) => r.ok && r.latency >= 0);
    const avg = okLat.length ? Math.round(okLat.reduce((a, r) => a + r.latency, 0) / okLat.length) : 0;
    setSeries((prev) => [...prev, avg].slice(-MAX_SERIES));

    // per-endpoint history
    setPerEndpoint((prev) => {
      const next: Record<string, number[]> = { ...prev };
      for (const r of results) {
        if (r.ok && r.latency >= 0) next[r.path] = [...(next[r.path] || []), r.latency].slice(-14);
      }
      return next;
    });

    // log streaming (hanya yang gagal + ringkasan per siklus)
    const entries: LogEntry[] = [];
    if (srv) entries.push({ time: stamp, label: "Server health", ok: srv.status === "operational", latency: srv.latencyMs });
    for (const r of results) {
      if (!r.ok) entries.push({ time: stamp, label: r.name, ok: false, latency: r.latency });
    }
    if (entries.length === 0) {
      entries.push({ time: stamp, label: "Semua endpoint OK", ok: true, latency: avg });
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
  const activeIssues = issues.filter((i) => !i.resolved);
  const overall = activeIssues.length
    ? "degraded"
    : probes.length
      ? "operational"
      : "checking";

  const overallColor = overall === "operational" ? "var(--ok)" : overall === "degraded" ? "var(--amber, #c98f3f)" : "var(--err)";
  const overallLabel = overall === "operational" ? "Operasional" : overall === "degraded" ? "Ada Masalah" : "Memeriksa…";

  return (
    <div className="container" style={{ paddingTop: 44, maxWidth: 1080 }}>
      <AnimatedContent>
        <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
          <span style={{ width: 44, height: 44, borderRadius: 12, display: "grid", placeItems: "center", background: "var(--surface-strong)", color: "var(--text-link)" }}>
            <Activity size={22} />
          </span>
          <div>
            <h1 style={{ margin: 0 }}>Status Server</h1>
            <p style={{ color: "var(--body)", margin: "2px 0 0" }}>
              Pemantauan realtime · zona waktu <b style={{ color: "var(--ink)" }}>{clientTz}</b> (waktu lokal Anda)
            </p>
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
            {activeIssues.length
              ? `${activeIssues.length} masalah aktif — detail di bawah`
              : "Semua sistem berjalan normal"}
            {" · "}terakhir {lastUpdate ?? "…"} <span style={{ color: "var(--muted)" }}>({clientTz})</span>
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

      {/* PANEL ISSUES */}
      <AnimatedContent delay={0.1}>
        <div
          className="card"
          style={{
            marginTop: 16, padding: "16px 20px",
            borderColor: activeIssues.length ? "var(--err)" : "var(--hairline-strong)",
            background: activeIssues.length ? "rgba(226,124,111,0.04)" : undefined,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: activeIssues.length ? 12 : 0 }}>
            {activeIssues.length ? (
              <XCircle size={18} style={{ color: "var(--err)" }} />
            ) : (
              <Check size={18} style={{ color: "var(--ok)" }} />
            )}
            <b style={{ fontFamily: "var(--sans)" }}>Issue</b>
            <span
              className="badge"
              style={{
                textTransform: "none", letterSpacing: 0, fontSize: "0.78rem",
                color: activeIssues.length ? "var(--err)" : "var(--ok)",
                background: activeIssues.length ? "rgba(226,124,111,0.1)" : "rgba(22,163,74,0.08)",
                borderColor: activeIssues.length ? "rgba(226,124,111,0.3)" : "rgba(22,163,74,0.2)",
              }}
            >
              {activeIssues.length ? `${activeIssues.length} aktif` : "Tidak ada masalah"}
            </span>
          </div>

          {activeIssues.length === 0 ? (
            <p style={{ color: "var(--body)", fontSize: "0.88rem", margin: 0 }}>
              Tidak ada masalah terdeteksi pada server maupun API. Issue akan muncul otomatis di sini beserta detail errornya.
            </p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {activeIssues.map((iss) => (
                <div
                  key={iss.id}
                  style={{
                    display: "flex", gap: 12, alignItems: "flex-start", flexWrap: "wrap",
                    padding: "12px 14px", borderRadius: 10, border: "1px solid rgba(226,124,111,0.35)",
                    background: "rgba(226,124,111,0.06)",
                  }}
                >
                  <span style={{ width: 10, height: 10, borderRadius: 999, background: "var(--err)", flexShrink: 0, marginTop: 5 }} />
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                      <b style={{ fontFamily: "var(--sans)", fontSize: "0.95rem", color: "var(--err)" }}>{iss.title}</b>
                      {iss.code && (
                        <span className="badge" style={{ textTransform: "none", letterSpacing: 0, fontSize: "0.72rem", color: "var(--err)", background: "rgba(226,124,111,0.12)", borderColor: "rgba(226,124,111,0.3)" }}>
                          {iss.code}
                        </span>
                      )}
                    </div>
                    <div style={{ color: "var(--body)", fontSize: "0.85rem", marginTop: 3 }}>{iss.detail}</div>
                    <div style={{ color: "var(--muted)", fontSize: "0.75rem", marginTop: 4, fontFamily: "var(--mono)" }}>
                      sejak {iss.started} · {iss.source}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </AnimatedContent>

      {/* Statistik */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 200px), 1fr))", gap: 14, marginTop: 18 }}>
        {[
          { label: "Uptime", value: uptime, suffix: "%", icon: ShieldCheck, color: "var(--ok)" },
          { label: "Latensi rata-rata", value: avgLatency, suffix: " ms", icon: Clock, color: "var(--text-link)" },
          { label: "Endpoint OK", value: probes.filter((p) => p.ok).length, suffix: `/${probes.length}`, icon: Check, color: "var(--ok)" },
          { label: "Issue aktif", value: activeIssues.length, suffix: "", icon: AlertTriangle, color: activeIssues.length ? "var(--err)" : "var(--ok)" },
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
                    <NumberTicker value={s.value} /><span style={{ fontSize: "0.9rem", color: "var(--body)" }}>{s.suffix}</span>
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
                    <div key={p.path} style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap", padding: "9px 12px", borderRadius: 10, background: "var(--canvas-soft)", border: "1px solid var(--hairline)" }}>
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
                        {p.ok ? (p.latency >= 0 ? `${p.latency} ms` : "OK") : (p.code ? `HTTP ${p.code}` : "Gagal")}
                      </span>
                      {!p.ok && p.errMsg && (
                        <span style={{ color: "var(--muted)", fontSize: "0.72rem", fontFamily: "var(--mono)" }}>{p.errMsg}</span>
                      )}
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
                  <code>{server?.serverTime ? new Date(server.serverTime).toLocaleTimeString("id-ID", { hour12: false }) : "…"}</code>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
                  <span style={{ color: "var(--body)", display: "inline-flex", gap: 6, alignItems: "center" }}><Clock size={14} /> Waktu lokal Anda</span>
                  <code>{nowLocal()} · {clientTz}</code>
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
          Status diperbarui otomatis setiap {intervalMs / 1000} detik · waktu ditampilkan dalam zona waktu perangkat Anda ({clientTz}) · latensi diukur dari browser ke server.
        </p>
      </AnimatedContent>
    </div>
  );
}
