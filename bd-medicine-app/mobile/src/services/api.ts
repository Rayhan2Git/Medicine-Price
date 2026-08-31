import Constants from "expo-constants";

const DEFAULT_API_BASE =
  typeof process !== "undefined" && process.env?.API_BASE
    ? process.env.API_BASE
    : (Constants.expoConfig?.extra?.apiBase as string | undefined) ??
      "http://10.0.2.2:8000";

export let API_BASE = DEFAULT_API_BASE;

export function setApiBase(url: string) {
  API_BASE = url;
}

export async function searchMedicines(query: string, limit = 20) {
  const res = await fetch(`${API_BASE}/api/search?q=${encodeURIComponent(query)}&limit=${limit}`);
  if (!res.ok) throw new Error("Search failed");
  return res.json();
}

export async function getMedicineDetail(id: number) {
  const res = await fetch(`${API_BASE}/api/medicine/${id}`);
  if (!res.ok) throw new Error("Medicine not found");
  return res.json();
}

export async function getAlternatives(genericId: number, limit = 100) {
  const res = await fetch(`${API_BASE}/api/alternatives/${genericId}?limit=${limit}`);
  if (!res.ok) throw new Error("Alternatives not found");
  return res.json();
}

export async function getGenerics(page = 1, perPage = 50) {
  const res = await fetch(`${API_BASE}/api/generics?page=${page}&per_page=${perPage}`);
  if (!res.ok) throw new Error("Failed to fetch generics");
  return res.json();
}

export async function getStats() {
  const res = await fetch(`${API_BASE}/api/stats`);
  if (!res.ok) throw new Error("Failed to fetch stats");
  return res.json();
}

export async function uploadPrescription(file: { uri: string; type: string; name: string }) {
  const formData = new FormData();
  formData.append("file", {
    uri: file.uri,
    type: file.type,
    name: file.name,
  } as any);

  // IMPORTANT: do NOT set Content-Type manually here. fetch must add the
  // multipart boundary itself; setting it manually corrupts the request.
  const res = await fetch(`${API_BASE}/api/ocr/upload-and-parse`, {
    method: "POST",
    body: formData,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: "Upload failed" }));
    throw new Error(err.detail || "Upload failed");
  }
  return res.json();
}
