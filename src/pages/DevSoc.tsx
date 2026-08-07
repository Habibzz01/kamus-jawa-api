import { AnimatedContent, FadeUp, SpotlightCard } from "../components/reactbits";
import { ArrowUpRight } from "../components/Icon";
import { usePageMeta } from "../lib/usePageMeta";

// Ikon sosial media — Ko-fi menggunakan ikon "Coffee cup" dan Saweria
// menggunakan ikon "Heart" (tidak tersedia ikon brand resmi keduanya).
const PLATFORMS = [
  {
    name: "GitHub",
    handle: "github.com/XbibzOfficial777",
    url: "https://github.com/XbibzOfficial777",
    desc: "Kode sumber dan proyek open source",
    img: "github",
  },
  {
    name: "YouTube",
    handle: "youtube.com/@XbibzOfficial",
    url: "https://youtube.com/@XbibzOfficial",
    desc: "Video tutorial dan konten",
    img: "youtube",
  },
  {
    name: "Telegram",
    handle: "t.me/xbibzofc",
    url: "https://t.me/xbibzofc",
    desc: "Channel pengumuman dan komunitas",
    img: "telegram",
  },
  {
    name: "Ko-fi",
    handle: "ko-fi.com/xbibzofficial",
    url: "https://ko-fi.com/xbibzofficial",
    desc: "Dukung karya dengan traktiran kopi",
    img: "kofi",
  },
  {
    name: "Saweria",
    handle: "saweria.co/xbibzofficial",
    url: "https://saweria.co/xbibzofficial",
    desc: "Dukung kreator Indonesia",
    img: "saweria",
  },
  {
    name: "TikTok",
    handle: "tiktok.com/@xbibzofficial",
    url: "https://tiktok.com/@xbibzofficial",
    desc: "Konten pendek dan tren",
    img: "tiktok",
  },
];

export default function DevSoc() {
  usePageMeta("Social Media Developer — Kamus Jawa API", "Ikuti dan dukung karya developer: GitHub, YouTube, Telegram, Ko-fi, Saweria, TikTok.");
  return (
    <div className="container" style={{ paddingTop: 44, maxWidth: 980 }}>
      <AnimatedContent>
        <h1 style={{ marginTop: 0 }}>Social Media Developer</h1>
        <p style={{ color: "var(--body)", maxWidth: 640, marginTop: -6 }}>
          Ikuti dan dukung karya developer di berbagai platform.
        </p>
      </AnimatedContent>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 280px), 1fr))",
          gap: 16,
          marginTop: 26,
        }}
      >
        {PLATFORMS.map((pl, i) => (
          <FadeUp key={pl.name} delay={i * 0.06}>
            <a
              href={pl.url}
              target="_blank"
              rel="noreferrer"
              style={{ textDecoration: "none", display: "block", height: "100%" }}
            >
              <SpotlightCard
                className="card"
                style={{ padding: "22px 24px", height: "100%", display: "flex", flexDirection: "column" }}
              >
                <div style={{ display: "flex", alignItems: "flex-start", gap: 14 }}>
                  <span
                    style={{
                      width: 46, height: 46, borderRadius: 12, display: "grid", placeItems: "center",
                      background: "#ffffff", border: "1px solid var(--hairline-strong)", flexShrink: 0,
                    }}
                  >
                    <img
                      src={`/assets/icons/${pl.img}.png`}
                      alt={`Ikon ${pl.name}`}
                      width={26}
                      height={26}
                      style={{ objectFit: "contain", display: "block" }}
                    />
                  </span>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontWeight: 700, fontSize: "1.05rem", fontFamily: "var(--sans)", color: "var(--ink)" }}>
                      {pl.name}
                    </div>
                    <div
                      style={{
                        color: "var(--body)", fontSize: "0.8rem", marginTop: 2,
                        overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                      }}
                    >
                      {pl.handle}
                    </div>
                  </div>
                  <ArrowUpRight size={17} style={{ color: "var(--muted)", marginLeft: "auto", flexShrink: 0, marginTop: 4 }} />
                </div>
                <p style={{ color: "var(--body)", fontSize: "0.88rem", margin: "12px 0 0", flex: 1 }}>
                  {pl.desc}
                </p>
              </SpotlightCard>
            </a>
          </FadeUp>
        ))}
      </div>
    </div>
  );
}
