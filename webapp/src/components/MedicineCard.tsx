import type { Brand } from "../types";
import { formatPrice } from "../api";
import { Link } from "react-router-dom";

interface Props {
  brand: Brand;
  compact?: boolean;
}

export default function MedicineCard({ brand }: Props) {
  return (
    <Link to={`/medicine/${brand.id}`} className="medicine-card-link">
      <div className="medicine-card">
        {brand.strength && (
          <span className="strength">{brand.strength}</span>
        )}
        <div className="name">{brand.name}</div>
        {brand.generic_name && (
          <div className="generic">{brand.generic_name}</div>
        )}
        {brand.manufacturer && (
          <div className="manufacturer">{brand.manufacturer}</div>
        )}
        <div className="price">
          <span>{formatPrice(brand.unit_price)}</span>
          <span className="unit">unit</span>
        </div>
      </div>
    </Link>
  );
}
