// Fuse.js fuzzy search — indeks entri di sisi klien (lazy, di-cache)
import Fuse from "fuse.js";
import { api } from "./api";

let cache: any[] | null = null;
let fuse: Fuse<any> | null = null;
let loading: Promise<Fuse<any>> | null = null;

export function getFuse(): Promise<Fuse<any>> {
  if (fuse) return Promise.resolve(fuse);
  if (loading) return loading;
  loading = (async () => {
    if (!cache) {
      const r = await api.entries({ all: 1, limit: 10000 });
      cache = r.data || [];
    }
    fuse = new Fuse(cache as any[], {
      keys: [
        { name: "word", weight: 0.6 },
        { name: "meaning", weight: 0.25 },
        { name: "krama", weight: 0.15 },
        { name: "krama_inggil", weight: 0.15 },
      ],
      threshold: 0.42,
      ignoreLocation: true,
      minMatchCharLength: 2,
      includeScore: true,
    });
    return fuse;
  })();
  return loading;
}
