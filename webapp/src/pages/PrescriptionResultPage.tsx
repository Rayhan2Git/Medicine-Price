import { Link, useLocation, useNavigate } from "react-router-dom";
import { formatPrice } from "../api";
import PrescriptionItem from "../components/PrescriptionItem";
import type { PrescriptionResult } from "../types";

export default function PrescriptionResultPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const result = (location.state as { result?: PrescriptionResult } | null)?.result;

  if (!result) {
    return (
      <div className="page">
        <div className="empty-state">
          <div className="icon">∅</div>
          <h3>No result to show</h3>
          <p>Upload a prescription first to see the analysis here.</p>
          <Link to="/prescription" className="btn-primary" style={{ marginTop: 16 }}>
            Upload a prescription
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="summary-card">
        <div className="label">Prescription summary</div>
        <h2>Read {result.medicines.length} medicine{result.medicines.length === 1 ? "" : "s"}</h2>
        <div className="summary-row">
          <div>
            <div className="summary-value">{result.medicines.length}</div>
            <div className="summary-label">Items</div>
          </div>
          <div className="summary-divider" />
          <div>
            <div className="summary-value">
              {formatPrice(result.total_estimated_price)}
            </div>
            <div className="summary-label">Estimated total</div>
          </div>
        </div>
      </div>

      <h2 className="section-title">
        Medicines
        <span className="count">({result.medicines.length})</span>
      </h2>

      {result.medicines.map((m, i) => (
        <PrescriptionItem key={i} medicine={m} />
      ))}

      <div style={{ display: "flex", justifyContent: "center", marginTop: 24 }}>
        <button className="btn-secondary" onClick={() => navigate("/prescription")}>
          ← Upload another
        </button>
      </div>
    </div>
  );
}
