/**
 * Client-side medicine data layer.
 *
 * Resolution order:
 *   1. If the FastAPI backend is reachable (VITE_API_BASE set and /api/stats
 *      responds), use the network and ignore the bundled data.
 *   2. Otherwise fall back to the static bundle at `${BASE_URL}data/*.json`.
 *
 * Notes:
 *   - The DB schema has `box_size` and `box_price` for the pack/container
 *     info. The `strip_*` columns are dead in the production DB; we ignore
 *     them. The calculator uses `box_size` as the canonical pack size.
 *   - For maximum reach on GitHub Pages (no backend), the same data is
 *     pre-bundled into the static site at build time via scripts/build-data.py.
 */
import type {
  Brand,
  BrandDetail,
  SearchResult,
  AlternativesResponse,
  Stats,
} from "./types";
import { rankSearch } from "./search";

const API_BASE = (import.meta.env.VITE_API_BASE as string | undefined) ?? "";

interface IndexRow {
  id: number;
  name: string;
  generic: string;
  strength: string;
  form: string;
  manufacturer: string;
  price: number | null;
  generic_id: number;
}

interface DetailRow extends IndexRow {
  unit_price: number | null;
  box_price: number | null;
  box_size: number | null;
}

let indexCache: IndexRow[] | null = null;
let detailCache: DetailRow[] | null = null;
let indexPromise: Promise<IndexRow[]> | null = null;
let detailPromise: Promise<DetailRow[]> | null = null;

async function loadIndex(): Promise<IndexRow[]> {
  if (indexCache) return indexCache;
  if (!indexPromise) {
    indexPromise = (async () => {
      const res = await fetch(`${import.meta.env.BASE_URL}data/medicines-index.json`);
      if (!res.ok) throw new Error("Failed to load medicine index");
      const json = (await res.json()) as IndexRow[];
      indexCache = json;
      return json;
    })();
  }
  return indexPromise;
}

async function loadDetails(): Promise<DetailRow[]> {
  if (detailCache) return detailCache;
  if (!detailPromise) {
    detailPromise = (async () => {
      const res = await fetch(`${import.meta.env.BASE_URL}data/medicines-detail.json`);
      if (!res.ok) throw new Error("Failed to load medicine details");
      const json = (await res.json()) as DetailRow[];
      detailCache = json;
      return json;
    })();
  }
  return detailPromise;
}

function indexRowToBrand(r: IndexRow): Brand {
  return {
    id: r.id,
    name: r.name,
    strength: r.strength,
    dosage_form: r.form,
    manufacturer: r.manufacturer,
    unit_price: r.price,
    generic_name: r.generic,
    generic_id: r.generic_id,
  };
}

function detailRowToBrandDetail(r: DetailRow): BrandDetail {
  return {
    id: r.id,
    name: r.name,
    strength: r.strength,
    dosage_form: r.form,
    manufacturer: r.manufacturer,
    unit_price: r.unit_price,
    box_price: r.box_price,
    box_size: r.box_size,
    generic_name: r.generic,
    generic_id: r.generic_id,
  };
}

async function tryNetwork<T>(url: string, init?: RequestInit): Promise<T | null> {
  if (!API_BASE) return null;
  try {
    const res = await fetch(`${API_BASE}${url}`, init);
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

let backendAvailable: boolean | null = null;
async function isBackendUp(): Promise<boolean> {
  if (backendAvailable !== null) return backendAvailable;
  backendAvailable = (await tryNetwork<Stats>("/api/stats")) !== null;
  return backendAvailable;
}

export const searchMedicines = async (
  q: string,
  limit = 24,
): Promise<SearchResult> => {
  if (await isBackendUp()) {
    const data = await tryNetwork<SearchResult>(
      `/api/search?q=${encodeURIComponent(q)}&limit=${limit}`,
    );
    if (data) return data;
  }
  const idx = await loadIndex();
  const ranked = rankSearch(idx, q, limit);
  return {
    query: q,
    results: ranked.map(indexRowToBrand),
    total: ranked.length,
  };
};

export const getMedicineDetail = async (id: number): Promise<BrandDetail> => {
  if (await isBackendUp()) {
    const data = await tryNetwork<BrandDetail>(`/api/medicine/${id}`);
    if (data) return data;
  }
  const details = await loadDetails();
  const row = details.find((r) => r.id === id);
  if (!row) throw new Error("Medicine not found");
  return detailRowToBrandDetail(row);
};

export const getAlternatives = async (
  genericId: number,
  limit = 100,
): Promise<AlternativesResponse> => {
  if (await isBackendUp()) {
    const data = await tryNetwork<AlternativesResponse>(
      `/api/alternatives/${genericId}?limit=${limit}`,
    );
    if (data) return data;
  }
  const idx = await loadIndex();
  const same = idx.filter((r) => r.generic_id === genericId);
  const name = same[0]?.generic ?? "Unknown";
  return {
    generic: { id: genericId, name },
    brands: same.slice(0, limit).map(indexRowToBrand),
  };
};

export const getStats = async (): Promise<Stats> => {
  if (await isBackendUp()) {
    const data = await tryNetwork<Stats>("/api/stats");
    if (data) return data;
  }
  const idx = await loadIndex();
  const generics = new Set(idx.map((r) => r.generic_id)).size;
  const withPrice = idx.filter((r) => r.price != null).length;
  return {
    brands: idx.length,
    generics,
    brands_with_price: withPrice,
  };
};

export const formatPrice = (price: number | null | undefined): string => {
  if (price == null) return "—";
  return `৳${price.toFixed(2)}`;
};

export const isApiConfigured = (): boolean => Boolean(API_BASE);
