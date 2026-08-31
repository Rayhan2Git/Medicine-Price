import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { uploadPrescription } from "../api";

export default function PrescriptionPage() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
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

  return (
    <div className="page">
      <h1>Upload Prescription</h1>
      <p className="muted">Take a photo or upload an image of your prescription.</p>

      {preview ? (
        <div className="preview-wrap">
          <img src={preview} alt="Prescription preview" />
          <button
            type="button"
            className="btn-link"
            onClick={() => {
              setFile(null);
              setPreview(null);
            }}
          >
            Remove
          </button>
        </div>
      ) : (
        <div className="picker">
          <label className="picker-btn">
            📷 Choose image
            <input
              ref={inputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={(e) => onPick(e.target.files?.[0] ?? null)}
              hidden
            />
          </label>
        </div>
      )}

      {error && <div className="state error">{error}</div>}

      {file && (
        <button
          className="btn-primary"
          onClick={onSubmit}
          disabled={loading}
        >
          {loading ? "Processing…" : "Process Prescription"}
        </button>
      )}
    </div>
  );
}