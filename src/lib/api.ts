// ============================================================
// KLien API — memanggil endpoint dinamis /api/...
// ============================================================

export interface ApiResponse<T> {
  ok: boolean;
  data: T;
  error?: { status: number; message: string };
  [k: string]: unknown;
}

async function get<T>(path: string, params?: Record<string, string | number | undefined>): Promise<ApiResponse<T>> {
  const url = new URL(path, window.location.origin);
  if (params) {
    for (const [k, v] of Object.entries(params)) {
      if (v !== undefined && v !== "") url.searchParams.set(k, String(v));
    }
  }
  const res = await fetch(url.toString());
  let body: ApiResponse<T>;
  try {
    body = await res.json();
  } catch {
    throw new Error(`Respons bukan JSON (HTTP ${res.status})`);
  }
  if (!res.ok || body.ok === false) {
    throw new Error(body.error?.message || `HTTP ${res.status}`);
  }
  return body;
}

export const api = {
  meta: () => get<any>("/api/meta"),
  overview: () => get<any>("/api"),
  entries: (p?: { letter?: string; q?: string; level?: string; page?: number; limit?: number; all?: number }) =>
    get<any>("/api/entries", { ...p }),
  search: (q: string, p?: { level?: string; page?: number; limit?: number }) =>
    get<any>("/api/search", { q, ...p }),
  turunan: (p?: { q?: string; page?: number; limit?: number }) => get<any>("/api/turunan", { ...p }),
  thematic: (slug?: string) => get<any>("/api/thematic", { slug }),
  proverbs: (p?: { type?: string; q?: string }) => get<any>("/api/proverbs", { ...p }),
  cangkriman: (q?: string) => get<any>("/api/cangkriman", { q }),
  dialogs: () => get<any>("/api/dialogs"),
  geguritan: () => get<any>("/api/geguritan"),
  sentences: (p?: { page?: number; limit?: number }) => get<any>("/api/sentences", { ...p }),
  saku: (p?: { q?: string; page?: number; limit?: number }) => get<any>("/api/saku", { ...p }),
  reverse: (q?: string) => get<any>("/api/reverse", { q }),
  tanyaJawab: () => get<any>("/api/tanya-jawab"),
  extra: () => get<any>("/api/extra"),
  latihan: () => get<any>("/api/latihan"),
  rencana: () => get<any>("/api/rencana"),
  unggahUngguh: () => get<any>("/api/unggah-ungguh"),
  translate: (q: string, dir: "jv-id" | "id-jv" = "jv-id", limit?: number) =>
    get<any>("/api/translate", { q, dir, limit }),
  suggest: (q: string, dir: "jv-id" | "id-jv" = "jv-id", limit?: number) =>
    get<any>("/api/suggest", { q, dir, limit }),
  openapi: () => get<any>("/api/openapi"),
};
