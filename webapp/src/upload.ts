import type { PrescriptionResult } from "./types";

const API_BASE = (import.meta.env.VITE_API_BASE as string | undefined) ?? "";

export async function uploadPrescription(_file: File): Promise<PrescriptionResult> {
  if (!API_BASE) {
    throw new Error(
      "Prescription OCR requires the backend API. Set VITE_API_BASE and rebuild, or run the FastAPI service in bd-medicine-app/api.",
    );
  }
  const form = new FormData();
  form.append("file", _file);
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
  return res.json() as Promise<PrescriptionResult>;
}
