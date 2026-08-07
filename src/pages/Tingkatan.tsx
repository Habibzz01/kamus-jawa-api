import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { AnimatedContent, FadeUp, SpotlightCard, NumberTicker } from "../components/reactbits";
import { GraduationCap, BookOpen, Sparkles, Check, ChevronRight, Code, ArrowRightLeft } from "../components/Icon";
import { api } from "../lib/api";

interface Tier {
  key: string;
  name: string;
  desc: string;
  icon: any;
  color: string;
  topics: string[];
  countKey?: string;
  cta: { to: string; label: string; icon?: any }[];
}

const TIERS: Tier[] = [
  {
    key: "dasar",
    name: "Dasar",
    desc: "Fondasi bertutur bahasa Jawa sehari-hari: sapaan, kata ganti, angka, dan kosakata inti.",
    icon: GraduationCap,
    color: "var(--ok)",
    topics: [
      "Unggah-ungguh: ngoko, krama, krama inggil",
      "Sapaan dan ungkapan sehari-hari",
      "Kata ganti orang dan kata tanya",
      "Angka 1–100",
      "100 kosakata inti",
      "Kamus saku ngoko ke krama",
    ],
    countKey: "saku",
    cta: [
      { to: "/explore", label: "Jelajah kosakata", icon: ChevronRight },
      { to: "/docs", label: "Panduan", icon: ChevronRight },
    ],
  },
  {
    key: "menengah",
    name: "Menengah",
    desc: "Bangun kalimat dan perluas kosa kata: tiga tingkat tutur, kata turunan, dan tema.",
    icon: BookOpen,
    color: "var(--text-link)",
    topics: [
      "Kalimat tiga tingkat (ngoko–krama–krama alus)",
      "Kata turunan (tembung andhahan)",
      "Kosa kata tematik: keluarga, tubuh, makanan, warna",
      "Kata kerja dan kata sifat tiga tingkat",
      "Tanya-jawab harian (30 dialog)",
      "Pacelathon: di pasar, sekolah, rumah sakit",
    ],
    countKey: "sentences_3levels",
    cta: [
      { to: "/terjemah", label: "Terjemah dua arah", icon: ArrowRightLeft },
      { to: "/explore", label: "Telusuri entri", icon: ChevronRight },
    ],
  },
  {
    key: "lanjut",
    name: "Lanjut",
    desc: "Kedalaman budaya dan sastra: peribahasa, teka-teki, puisi, tembang, dan uji kemampuan.",
    icon: Sparkles,
    color: "var(--accent-preview)",
    topics: [
      "Paribasan, bebasan, dan saloka",
      "Cangkriman (teka-teki Jawa)",
      "Geguritan dan tembang macapat",
      "Tembung entar dan pepatah luhur",
      "Unggah-ungguh mendalam (krama andhap, inggil)",
      "Latihan soal 160 + rencana belajar 140 hari",
    ],
    countKey: "latihan_soal",
    cta: [
      { to: "/test", label: "Uji di API Tester", icon: Code },
      { to: "/docs", label: "Semua endpoint", icon: ChevronRight },
    ],
  },
];

const CHEAT: [string, string, string, string][] = [
  ["saya", "aku", "kula", "dalem"],
  ["kamu", "kowe", "sampeyan", "panjenengan"],
  ["makan", "mangan", "nedha", "dhahar"],
  ["tidur", "turu", "tilem", "sare"],
  ["pergi", "lunga", "kesah", "tindak"],
  ["datang", "teka", "dugi", "rawuh"],
  ["melihat", "ndelok", "ningali", "mirsani"],
  ["memberi", "menehi", "nyukani", "maringi"],
  ["membeli", "tuku", "tumbas", "mundhut"],
  ["rumah", "omah", "griya", "dalem"],
];

export default function Tingkatan() {
  const [counts, setCounts] = useState<any>(null);

  useEffect(() => {
    api.meta().then((m) => setCounts(m.data?.counts)).catch(() => {});
  }, []);

  return (
    <div className="container" style={{ paddingTop: 44 }}>
      <AnimatedContent>
        <h1 style={{ marginTop: 0 }}>Tingkatan Belajar</h1>
        <p style={{ color: "var(--body)", maxWidth: 720, marginTop: -6 }}>
          Jalur belajar bahasa Jawa yang terstruktur — dari Dasar hingga Lanjut. Setiap tingkat
          menyajikan materi yang bisa langsung dipelajari lewat halaman dan API.
        </p>
      </AnimatedContent>

      {/* Tiga tingkatan */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 300px), 1fr))", gap: 16, marginTop: 24 }}>
        {TIERS.map((tier, i) => {
          const Icon = tier.icon;
          const count = counts?.[tier.countKey ?? ""];
          return (
            <FadeUp key={tier.key} delay={i * 0.08}>
              <SpotlightCard className="card" style={{ padding: "26px", height: "100%", display: "flex", flexDirection: "column" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
                  <span
                    style={{
                      width: 44, height: 44, borderRadius: 12, display: "grid", placeItems: "center",
                      background: "var(--surface-strong)", color: tier.color,
                    }}
                  >
                    <Icon size={22} />
                  </span>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: "1.15rem", fontFamily: "var(--sans)" }}>{tier.name}</div>
                    <div style={{ fontSize: "0.78rem", color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                      {i + 1} dari 3
                    </div>
                  </div>
                </div>

                <p style={{ color: "var(--body)", fontSize: "0.92rem", margin: "0 0 14px" }}>{tier.desc}</p>

                <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: 9, flex: 1 }}>
                  {tier.topics.map((t) => (
                    <li key={t} style={{ display: "flex", gap: 10, alignItems: "flex-start", fontSize: "0.9rem", color: "var(--ink)" }}>
                      <span style={{ color: tier.color, marginTop: 2, flexShrink: 0 }}><Check size={16} /></span>
                      <span>{t}</span>
                    </li>
                  ))}
                </ul>

                {count !== undefined && count !== null && (
                  <div style={{ marginTop: 14, color: "var(--muted)", fontSize: "0.85rem" }}>
                    Materi tersedia:{" "}
                    <b style={{ color: tier.color, fontFamily: "var(--sans)" }}>
                      <NumberTicker value={count} />
                    </b>
                  </div>
                )}

                <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 16 }}>
                  {tier.cta.map((c) => {
                    const CI = c.icon;
                    return (
                      <Link key={c.to} to={c.to} className="btn" style={{ padding: "8px 14px", fontSize: "0.82rem" }}>
                        {c.label}
                        {CI && <CI size={14} />}
                      </Link>
                    );
                  })}
                </div>
              </SpotlightCard>
            </FadeUp>
          );
        })}
      </div>

      {/* Cheatsheet tingkat tutur */}
      <AnimatedContent>
        <div style={{ marginTop: 36 }}>
          <h2 style={{ fontSize: "1.4rem" }}>Referensi Cepat Tingkat Tutur</h2>
          <p style={{ color: "var(--body)", marginTop: -4 }}>
            Kata kunci yang paling sering dipakai, dari ngoko (dasar) hingga krama inggil (paling halus).
          </p>
          <div className="card" style={{ overflowX: "auto", padding: 0, marginTop: 12 }}>
            <table style={{ width: "100%", minWidth: 520, borderCollapse: "collapse", fontSize: "0.9rem" }}>
              <thead>
                <tr>
                  <th style={{ textAlign: "left", padding: "12px 16px", borderBottom: "1px solid var(--hairline-strong)", color: "var(--ink)" }}>Indonesia</th>
                  <th style={{ textAlign: "left", padding: "12px 16px", borderBottom: "1px solid var(--hairline-strong)", color: "var(--body)" }}>Ngoko (dasar)</th>
                  <th style={{ textAlign: "left", padding: "12px 16px", borderBottom: "1px solid var(--hairline-strong)", color: "var(--body)" }}>Krama (menengah)</th>
                  <th style={{ textAlign: "left", padding: "12px 16px", borderBottom: "1px solid var(--hairline-strong)", color: "var(--accent-preview)" }}>Krama inggil (lanjut)</th>
                </tr>
              </thead>
              <tbody>
                {CHEAT.map((row) => (
                  <tr key={row[0]}>
                    <td style={{ padding: "9px 16px", borderBottom: "1px solid var(--hairline)", fontWeight: 600 }}>{row[0]}</td>
                    <td style={{ padding: "9px 16px", borderBottom: "1px solid var(--hairline)" }}>{row[1]}</td>
                    <td style={{ padding: "9px 16px", borderBottom: "1px solid var(--hairline)" }}>{row[2]}</td>
                    <td style={{ padding: "9px 16px", borderBottom: "1px solid var(--hairline)", color: "var(--accent-preview)" }}>{row[3]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </AnimatedContent>
    </div>
  );
}
