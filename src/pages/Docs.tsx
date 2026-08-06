import { useEffect, useState } from "react";
import { AnimatedContent, FadeUp } from "../components/reactbits";
import { api } from "../lib/api";

interface Endpoint {
  method: string;
  path: string;
  title: string;
  desc: string;
  params?: { name: string; type: string; req?: boolean; desc: string }[];
  example: string;
  note?: string;
}

const ENDPOINTS: Endpoint[] = [
  {
    method: "GET", path: "/api", title: "Ikhtisar API",
    desc: "Mengembalikan nama, versi, jumlah data, dan daftar seluruh endpoint.",
    example: `curl https://kamus-api.vercel.app/api`,
  },
  {
    method: "GET", path: "/api/meta", title: "Metadata",
    desc: "Informasi kamus: judul, versi, jumlah entri, kata turunan, tematik, dsb.",
    example: `curl https://kamus-api.vercel.app/api/meta`,
  },
  {
    method: "GET", path: "/api/entries", title: "Entri Kamus",
    desc: "Semua entri kamus. Mendukung filter huruf, pencarian, tingkat tutur, dan paginasi.",
    params: [
      { name: "letter", type: "string", desc: "Filter per huruf (a–z). Contoh: letter=k" },
      { name: "q", type: "string", desc: "Pencarian teks pada kata, arti, krama, krama inggil." },
      { name: "level", type: "string", desc: "Filter tingkat tutur: ngoko, krama, krama_inggil, madya, krama_andhap." },
      { name: "page", type: "integer", desc: "Nomor halaman (default 1)." },
      { name: "limit", type: "integer", desc: "Jumlah per halaman (default 50, maks 500)." },
    ],
    example: `curl "https://kamus-api.vercel.app/api/entries?letter=k&limit=5"`,
    note: "Respons menyertakan meta paginasi + daftar huruf & level yang tersedia.",
  },
  {
    method: "GET", path: "/api/search", title: "Pencarian Global",
    desc: "Pencarian kata di seluruh entri kamus.",
    params: [
      { name: "q", type: "string", req: true, desc: "Kata kunci pencarian (wajib)." },
      { name: "level", type: "string", desc: "Filter tingkat tutur." },
      { name: "page", type: "integer", desc: "Nomor halaman (default 1)." },
      { name: "limit", type: "integer", desc: "Jumlah per halaman (default 20)." },
    ],
    example: `curl "https://kamus-api.vercel.app/api/search?q=mangan"`,
  },
  {
    method: "GET", path: "/api/turunan", title: "Kata Turunan",
    desc: "Kamus kata turunan (tembung andhahan) dengan pencarian & paginasi.",
    params: [
      { name: "q", type: "string", desc: "Cari kata turunan atau artinya." },
      { name: "page", type: "integer", desc: "Halaman (default 1)." },
      { name: "limit", type: "integer", desc: "Jumlah per halaman (default 50)." },
    ],
    example: `curl "https://kamus-api.vercel.app/api/turunan?q=nandur"`,
  },
  {
    method: "GET", path: "/api/thematic", title: "Kosa Kata Tematik",
    desc: "Tabel tematik (kata ganti, angka, anggota tubuh, warna, dll.)",
    params: [{ name: "slug", type: "string", desc: "Filter berdasarkan slug judul tabel." }],
    example: `curl "https://kamus-api.vercel.app/api/thematic"`,
  },
  {
    method: "GET", path: "/api/proverbs", title: "Peribahasa",
    desc: "Paribasan, bebasan, saloka, tembung entar, pepatah, dan pitutur luhur.",
    params: [
      { name: "type", type: "string", desc: "paribasan | bebasan | saloka | tembung_entar | pepatah | pitutur_luhur" },
      { name: "q", type: "string", desc: "Pencarian teks." },
    ],
    example: `curl "https://kamus-api.vercel.app/api/proverbs?type=paribasan"`,
  },
  {
    method: "GET", path: "/api/cangkriman", title: "Cangkriman (Teka-Teki)",
    desc: "Kumpulan teka-teki Jawa lengkap dengan jawabannya.",
    params: [{ name: "q", type: "string", desc: "Pencarian soal/jawaban." }],
    example: `curl "https://kamus-api.vercel.app/api/cangkriman"`,
  },
  {
    method: "GET", path: "/api/dialogs", title: "Pacelathon (Percakapan)",
    desc: "Dialog percakapan dalam berbagai tingkat tutur, lengkap dengan terjemahan.",
    example: `curl "https://kamus-api.vercel.app/api/dialogs"`,
  },
  {
    method: "GET", path: "/api/geguritan", title: "Geguritan (Puisi)",
    desc: "Puisi Jawa modern beserta terjemahannya.",
    example: `curl "https://kamus-api.vercel.app/api/geguritan"`,
  },
  {
    method: "GET", path: "/api/sentences", title: "Kalimat Tiga Tingkat",
    desc: "Kalimat sejajar ngoko–krama–krama alus. Paginasi: page, limit (default 30).",
    example: `curl "https://kamus-api.vercel.app/api/sentences?limit=10"`,
  },
  {
    method: "GET", path: "/api/saku", title: "Kamus Saku",
    desc: "Pasangan ngoko→krama kata umum. Pencarian & paginasi.",
    params: [
      { name: "q", type: "string", desc: "Cari ngoko/krama/arti." },
      { name: "page", type: "integer", desc: "Halaman (default 1)." },
      { name: "limit", type: "integer", desc: "Jumlah per halaman (default 50)." },
    ],
    example: `curl "https://kamus-api.vercel.app/api/saku?q=abang"`,
  },
  {
    method: "GET", path: "/api/reverse", title: "Kamus Balik (Indonesia→Jawa)",
    desc: "Cari padanan ngoko & krama dari kata bahasa Indonesia.",
    params: [{ name: "q", type: "string", desc: "Kata Indonesia (contoh: q=makan)." }],
    example: `curl "https://kamus-api.vercel.app/api/reverse?q=makan"`,
  },
  {
    method: "GET", path: "/api/tanya-jawab", title: "Tanya-Jawab Harian",
    desc: "30 pasang tanya-jawab sehari-hari dalam ngoko dan krama.",
    example: `curl "https://kamus-api.vercel.app/api/tanya-jawab"`,
  },
  {
    method: "GET", path: "/api/extra", title: "Daftar Ekstra",
    desc: "Ucapan selamat, panggilan kerabat, adat nikah, pertanian, kawi, warna, rumah, dapur, sekolah, olahraga, dsb.",
    example: `curl "https://kamus-api.vercel.app/api/extra"`,
  },
  {
    method: "GET", path: "/api/latihan", title: "Latihan Soal",
    desc: "160 soal pilihan ganda + kunci jawaban.",
    example: `curl "https://kamus-api.vercel.app/api/latihan"`,
  },
  {
    method: "GET", path: "/api/rencana", title: "Rencana Belajar",
    desc: "Rencana belajar bahasa Jawa selama 140 hari.",
    example: `curl "https://kamus-api.vercel.app/api/rencana"`,
  },
  {
    method: "GET", path: "/api/unggah-ungguh", title: "Panduan Unggah-Ungguh",
    desc: "Panduan tata krama bertutur: cheatsheet, kata kunci, dan bab-bab lengkap.",
    example: `curl "https://kamus-api.vercel.app/api/unggah-ungguh"`,
  },
  {
    method: "GET", path: "/api/openapi", title: "Spesifikasi OpenAPI 3.0",
    desc: "Spesifikasi OpenAPI lengkap — bisa diimpor langsung ke Postman / Insomnia / Swagger UI.",
    example: `curl "https://kamus-api.vercel.app/api/openapi"`,
  },
];

function CodeBlock({ code }: { code: string }) {
  return (
    <pre style={{ margin: "10px 0 0" }}>
      <code>{code}</code>
    </pre>
  );
}

export default function Docs() {
  const [openapi, setOpenapi] = useState<any>(null);

  useEffect(() => {
    api.openapi().then((r) => setOpenapi(r.data)).catch(() => {});
  }, []);

  return (
    <div className="container" style={{ paddingTop: 44 }}>
      <AnimatedContent>
        <h1 style={{ marginTop: 0 }}>Dokumentasi API</h1>
        <p style={{ color: "var(--body)", maxWidth: 720 }}>
          Seluruh endpoint menggunakan <b style={{ color: "var(--ink)" }}>GET</b> dan mengembalikan JSON.
          Respons selalu berbentuk <code>{"{ ok, data, ... }"}</code>; kesalahan berbentuk{" "}
          <code>{"{ ok: false, error: { status, message } }"}</code>.
          CORS diaktifkan (<code>Access-Control-Allow-Origin: *</code>), sehingga bisa dipanggil dari
          aplikasi mana pun — browser, Node.js, Python, dsb.
        </p>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 10 }}>
          <span className="badge badge-green">Tanpa autentikasi</span>
          <span className="badge badge-green">CORS: *</span>
          <span className="badge badge-muted">Cache: 60 dtk (CDN 300 dtk)</span>
        </div>
      </AnimatedContent>

      {/* Contoh dasar */}
      <AnimatedContent delay={0.1}>
        <div className="card" style={{ padding: "20px 22px", marginTop: 26 }}>
          <h3 style={{ marginTop: 0 }}>Contoh Panggilan</h3>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 14 }}>
            <CodeBlock code={`// JavaScript (fetch)\nconst res = await fetch("/api/search?q=abang");\nconst { data } = await res.json();`} />
            <CodeBlock code={`# Python (requests)\nimport requests\nr = requests.get("https://kamus-api.vercel.app/api/entries?letter=k")\ndata = r.json()["data"]`} />
            <CodeBlock code={`$ curl "https://kamus-api.vercel.app/api/proverbs?type=saloka"`} />
          </div>
        </div>
      </AnimatedContent>

      {/* Daftar endpoint */}
      <h2 style={{ marginTop: 46 }}>Daftar Endpoint</h2>
      <p style={{ color: "var(--body)", marginTop: -6 }}>
        Klik salah satu untuk menyalin contohnya. Ganti <code>&lt;domain&gt;</code> dengan URL Vercel kamu.
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: 14, marginTop: 16 }}>
        {ENDPOINTS.map((ep, i) => (
          <FadeUp key={ep.path} delay={Math.min(i, 10) * 0.03}>
            <div className="card" style={{ padding: "20px 22px" }} id={ep.path.replace(/\//g, "-")}>
              <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
                <span className={`badge badge-green m-${ep.method.toLowerCase()}`} style={{ textTransform: "none", fontSize: "0.78rem" }}>
                  {ep.method}
                </span>
                <code style={{ fontSize: "0.95rem", padding: "5px 10px" }}>{ep.path}</code>
                <b style={{ fontSize: "1.05rem", fontFamily: "var(--sans)" }}>{ep.title}</b>
              </div>
              <p style={{ color: "var(--body)", margin: "10px 0 4px" }}>{ep.desc}</p>
              {ep.note && <p style={{ color: "var(--muted)", fontSize: "0.86rem", margin: "4px 0" }}>ℹ️ {ep.note}</p>}
              {ep.params && (
                <div style={{ marginTop: 10 }}>
                  <div style={{ fontSize: "0.8rem", color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 6 }}>Parameter Query</div>
                  <div style={{ overflowX: "auto" }}>
                    <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.85rem" }}>
                      <thead>
                        <tr>
                          <th style={{ textAlign: "left", padding: "6px 10px", borderBottom: "1px solid var(--hairline-strong)", color: "var(--ink)" }}>Nama</th>
                          <th style={{ textAlign: "left", padding: "6px 10px", borderBottom: "1px solid var(--hairline-strong)", color: "var(--ink)" }}>Tipe</th>
                          <th style={{ textAlign: "left", padding: "6px 10px", borderBottom: "1px solid var(--hairline-strong)", color: "var(--ink)" }}>Deskripsi</th>
                        </tr>
                      </thead>
                      <tbody>
                        {ep.params.map((p) => (
                          <tr key={p.name}>
                            <td style={{ padding: "6px 10px", borderBottom: "1px solid var(--hairline)", whiteSpace: "nowrap" }}>
                              <code>{p.name}</code> {p.req && <span style={{ color: "var(--err)" }}>*</span>}
                            </td>
                            <td style={{ padding: "6px 10px", borderBottom: "1px solid var(--hairline)", color: "var(--body)" }}>{p.type}</td>
                            <td style={{ padding: "6px 10px", borderBottom: "1px solid var(--hairline)", color: "var(--body)" }}>{p.desc}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
              <CodeBlock code={ep.example} />
            </div>
          </FadeUp>
        ))}
      </div>

      {/* Format respons */}
      <AnimatedContent>
        <div className="card" style={{ padding: "20px 22px", marginTop: 26 }}>
          <h3 style={{ marginTop: 0 }}>Format Respons</h3>
          <p style={{ color: "var(--body)", margin: "6px 0 10px" }}>
            Berhasil (HTTP 200):
          </p>
          <CodeBlock code={`{\n  "ok": true,\n  "data": [ ... ],\n  "meta": { "page": 1, "limit": 50, "total": 3029, "pages": 61 }\n}`} />
          <p style={{ color: "var(--body)", margin: "16px 0 10px" }}>Gagal (HTTP 4xx/5xx):</p>
          <CodeBlock code={`{\n  "ok": false,\n  "error": { "status": 400, "message": "type tidak dikenal..." }\n}`} />
          <p style={{ color: "var(--body)", margin: "16px 0 10px" }}>Struktur satu entri:</p>
          <CodeBlock code={`{\n  "id": "jv-00001",\n  "word": "abang",\n  "letter": "A",\n  "level": "ngoko",\n  "pos": "t.ka.",\n  "pos_info": { "jv": "tembung kahanan", "id": "kata sifat", "en": "adjective" },\n  "meaning": "merah",\n  "krama": "abrit",\n  "krama_inggil": null,\n  "example": { "jv": "Klambiku abang.", "id": "Bajuku merah." }\n}`} />
        </div>
      </AnimatedContent>

      {/* OpenAPI */}
      <AnimatedContent>
        <div className="card" style={{ padding: "20px 22px", marginTop: 26, display: "flex", flexWrap: "wrap", gap: 16, alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <h3 style={{ marginTop: 0, marginBottom: 6 }}>Spesifikasi OpenAPI 3.0</h3>
            <p style={{ color: "var(--body)", margin: 0, fontSize: "0.92rem" }}>
              {openapi ? `${openapi.info?.title} v${openapi.info?.version} — ${Object.keys(openapi.paths || {}).length} path siap diimpor.` : "Memuat spesifikasi…"}
            </p>
          </div>
          <a className="btn btn-primary" href="/api/openapi" target="_blank" rel="noreferrer">Buka /api/openapi</a>
        </div>
      </AnimatedContent>
    </div>
  );
}
