import type { Brand } from "../types";
import { formatPrice } from "../api";
import { Link } from "react-router-dom";

interface Props {
  brand: Brand;
  compact?: boolean;
}

export default function MedicineCard({ brand, compact }: Props) {
  return (
    <Link to={`/medicine/${brand.id}`} className="medicine-card-link">
      <div className={`medicine-card ${compact ? "compact" : ""}`}>
        <div className="info">
          <div className="name">{brand.name}</div>
          {brand.strength && <div className="strength">{brand.strength}</div>}
          {!compact && brand.manufacturer && (
            <div className="manufacturer">{brand.manufacturer}</div>
          )}
          {!compact && brand.generic_name && (
            <div className="generic">Generic: {brand.generic_name}</div>
          )}
        </div>
        <div className="price">{formatPrice(brand.unit_price)}</div>
      </div>
    </Link>
  );
}