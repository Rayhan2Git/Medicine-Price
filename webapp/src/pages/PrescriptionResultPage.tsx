import { useLocation, useNavigate } from "react-router-dom";
import type { PrescriptionResult } from "../types";
import PrescriptionItem from "../components/PrescriptionItem";

export default function PrescriptionResultPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const result = (location.state as { result?: PrescriptionResult } | null)
    ?.result;

  if (!result) {
    return (
      <div className="page">
        <p>No prescription data available.</p>
        <button onClick={() => navigate("/prescription")}>
          Upload again
        </button>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="summary-card">
        <h2>Prescription Analysis</h2>
        <div className="summary-row">
          <div>
            <div className="summary-value">{result.total_found}</div>
            <div className="summary-label">Medicines</div>
          </div>
          <div className="summary-divider" />
          <div>
            <div className="summary-value">
              ৳{result.total_estimated_price.toFixed(2)}
            </div>
            <div className="summary-label">Est. Total</div>
          </div>
        </div>
      </div>

      <h3 className="section-title">Detected Medicines</h3>
      <div className="card-list">
        {result.medicines.length === 0 ? (
          <div className="state">
            No medicines detected from this prescription.
          </div>
        ) : (
          result.medicines.map((m, i) => (
            <PrescriptionItem key={i} medicine={m} />
          ))
        )}
      </div>
    </div>
  );
}