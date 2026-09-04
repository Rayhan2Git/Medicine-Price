import type { PrescriptionMedicine } from "../types";
import { formatPrice } from "../api";
import { Link } from "react-router-dom";

interface Props {
  medicine: PrescriptionMedicine;
}

export default function PrescriptionItem({ medicine }: Props) {
  const confidenceClass =
    medicine.confidence >= 0.7
      ? "high"
      : medicine.confidence >= 0.4
        ? "med"
        : "low";

  const genericId =
    medicine.cheapest?.generic_id ?? medicine.db_matches[0]?.generic_id;

  return (
    <div className="rx-item">
      <div className="rx-item-header">
        <div className="rx-raw">{medicine.raw_name}</div>
        <span className={`confidence-badge ${confidenceClass}`}>
          {Math.round(medicine.confidence * 100)}%
        </span>
      </div>
      {medicine.strength && (
        <div className="rx-strength">{medicine.strength}</div>
      )}
      {medicine.frequency && (
        <div className="rx-freq">Dosage: {medicine.frequency}</div>
      )}
      {medicine.suggested_generic && (
        <div className="rx-generic">Generic: {medicine.suggested_generic}</div>
      )}

      {medicine.cheapest ? (
        <div className="rx-price-row">
          <div className="rx-cheapest">
            <div className="rx-cheapest-label">Best Price:</div>
            <div className="rx-cheapest-price">
              {formatPrice(medicine.cheapest.unit_price)}
            </div>
            <div className="rx-cheapest-brand">{medicine.cheapest.name}</div>
          </div>
          <Link
            to={`/medicine/${medicine.cheapest.id}`}
            className="rx-view-btn"
          >
            View
          </Link>
        </div>
      ) : (
        <div className="rx-no-match">No match found in database</div>
      )}

      {medicine.db_matches.length > 1 && genericId && (
        <Link
          to={`/alternatives/${genericId}`}
          className="rx-alternatives-link"
        >
          View all {medicine.db_matches.length} alternatives →
        </Link>
      )}
    </div>
  );
}