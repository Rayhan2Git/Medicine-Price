import type {
  SearchResult,
  BrandDetail,
  AlternativesResponse,
  PrescriptionResult,
  Stats,
} from "./types";

const API_BASE = (import.meta.env.VITE_API_BASE as string | undefined) ?? "";

async function jsonFetch<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${url}`, init);
  if (!res.ok) {
    let msg = `Request failed (${res.status})`;
    try {
      const body = await res.json();
      if (body?.detail) msg = body.detail;
    } catch {
      /* ignore */
    }
    throw new Error(msg);
  }
  return res.json() as Promise<T>;
}

export const searchMedicines = (q: string, limit = 20) =>
  jsonFetch<SearchResult>(
    `/api/search?q=${encodeURIComponent(q)}&limit=${limit}`,
  );

export const getMedicineDetail = (id: number) =>
  jsonFetch<BrandDetail>(`/api/medicine/${id}`);

export const getAlternatives = (genericId: number, limit = 100) =>
  jsonFetch<AlternativesResponse>(
    `/api/alternatives/${genericId}?limit=${limit}`,
  );

export const getStats = () => jsonFetch<Stats>(`/api/stats`);

export async function uploadPrescription(file: File): Promise<PrescriptionResult> {
  const form = new FormData();
  form.append("file", file);
  const res = await fetch(`${API_BASE}/api/ocr/upload-and-parse`, {
    method: "POST",
    body: form,
  });
  if (!res.ok) {
    let msg = "Upload failed";
    try {
      const body = await res.json();
      if (body?.detail) msg = body.detail;
    } catch {
      /* ignore */
    }
    throw new Error(msg);
  }
  return res.json();
}

export const formatPrice = (price: number | null | undefined): string => {
  if (price == null) return "—";
  return `৳${price.toFixed(2)}`;
};