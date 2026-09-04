import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { uploadPrescription } from "../api";

export default function PrescriptionPage() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);

  const onPick = (f: File | null) => {
    if (!f) return;
    setFile(f);
    setPreview(URL.createObjectURL(f));
    setError("");
  };

  const onSubmit = async () => {
    if (!file) return;
    setLoading(true);
    setError("");
    try {
      const result = await uploadPrescription(file);
      navigate("/prescription/result", { state: { result } });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setLoading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files?.[0];
    if (f) onPick(f);
  };

  return (
    <div className="page">
      <div className="prescription-shell">
        <span className="rx-mark">℞</span>
        <h1>Read a prescription</h1>
        <p className="lede">
          Snap a photo of the doctor's handwriting and we'll read the medicines
          and look up the prices in the database.
        </p>

        {preview ? (
          <div className="preview-card">
            <img src={preview} alt="Prescription preview" />
            <div className="preview-actions">
              <button className="btn-primary" onClick={onSubmit} disabled={loading}>
                {loading ? "Reading…" : "Process prescription"}
              </button>
              <button
                className="btn-secondary"
                onClick={() => {
                  setFile(null);
                  setPreview(null);
                  setError("");
                }}
              >
                Choose different
              </button>
            </div>
          </div>
        ) : (
          <label
            className="picker-zone"
            style={dragOver ? { borderColor: "var(--primary)", background: "var(--primary-soft)" } : undefined}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
          >
            <div className="icon">📷</div>
            <h3>Drop a photo here</h3>
            <p>or click to choose from your device · JPG, PNG, WebP</p>
            <input
              ref={inputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={(e) => onPick(e.target.files?.[0] ?? null)}
              hidden
            />
          </label>
        )}

        {error && (
          <div className="state error" style={{ marginTop: 16 }}>
            {error}
          </div>
        )}

        <div className="backend-note">
          <strong>Note.</strong> Prescription OCR needs the Python backend
          (<code>bd-medicine-app/api/</code>) to be running and reachable.
          Search and browsing work without it.
        </div>
      </div>
    </div>
  );
}
