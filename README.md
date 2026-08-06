# ꦛ Kamus Jawa API — Dynamic REST API + Web (React · TypeScript · ReactBits)

Kamus Lengkap Basa Jawa (Ngoko · Krama · Krama Inggil) dalam bentuk:

- **REST API dinamis** — serverless function di Vercel (`/api/*`), bukan file statis.
- **Web dokumentasi + API Tester** — React + TypeScript + Vite, animasi ala ReactBits
  (AnimatedContent, SplitText, TiltedCard, SpotlightCard, NumberTicker, dll.),
  responsif, routing `/` asli (bukan `#`).

## 🔗 URL

- Web: **https://kamus-api.vercel.app**
  - Beranda `/`
  - Dokumentasi API lengkap `/docs`
  - API Tester interaktif `/test`
  - Jelajah kata A–Z `/explore`
- API: **https://kamus-api.vercel.app/api**
  - `GET /api` — ikhtisar
  - `GET /api/meta` — metadata & jumlah data
  - `GET /api/entries?letter=&q=&level=&page=&limit=` — entri kamus
  - `GET /api/search?q=` — pencarian global
  - `GET /api/turunan`, `/api/thematic`, `/api/proverbs?type=`, `/api/cangkriman`,
    `/api/dialogs`, `/api/geguritan`, `/api/sentences`, `/api/saku`, `/api/reverse`,
    `/api/tanya-jawab`, `/api/extra`, `/api/latihan`, `/api/rencana`,
    `/api/unggah-ungguh`, `/api/parikan`, `/api/saroja`, `/api/macapat`,
    `/api/tembang-dolanan`, `/api/pelafalan`
  - `GET /api/openapi` — spesifikasi OpenAPI 3.0 (siap impor ke Postman)

Semua endpoint `GET`, mengembalikan JSON `{ ok, data, ... }`, CORS `*`.

## 🛠️ Struktur

```
api/entry.ts      ← SATU serverless function untuk semua /api/* (data inline)
src/              ← frontend React + TypeScript
  pages/Home.tsx  ← beranda + pencarian cepat + statistik animasi
  pages/Docs.tsx  ← dokumentasi API lengkap
  pages/Test.tsx  ← API tester interaktif + riwayat
  pages/Explore.tsx ← jelajah entri per huruf
  components/reactbits/ ← komponen animasi ala ReactBits
vercel.json       ← rewrites /api → function, SPA → index.html
```

## 🚀 Jalankan lokal

```bash
npm install
npm run dev      # vite dev (proxy /api → vercel dev)
npm run build    # tipe-check + build dist
```

## ☁️ Deploy

```bash
npx vercel deploy --prod --yes --token $VERCEL_TOKEN
```

## 🎨 Desain

Proyek ini memakai **DESIGN.md** (dari `npx getdesign@latest add expo`) sebagai
referensi desain — design language ala **Expo**: kanvas putih, CTA hitam pekat,
link biru inline (`#0d74ce`), Inter (display 600 / body 400), JetBrains Mono
untuk kode, hairline borders, radius 8px (CTA) / 12px (kartu), pill khusus badge,
dan gradasi langit biru hanya di hero.
