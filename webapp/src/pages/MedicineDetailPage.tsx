import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getMedicineDetail, formatPrice } from "../api";
import type { BrandDetail } from "../types";

export default function MedicineDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [medicine, setMedicine] = useState<BrandDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) return;
    setMedicine(null);
    setLoading(true);
    getMedicineDetail(Number(id))
      .then(setMedicine)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="state">Loading…</div>;
  if (error) return <div className="state error">{error}</div>;
  if (!medicine) return <div className="state">Medicine not found</div>;

  return (
    <div className="page">
      <div className="card">
        <h1 className="brand-name">{medicine.name}</h1>
        {medicine.strength && (
          <div className="strength">{medicine.strength}</div>
        )}
        {medicine.dosage_form && (
          <div className="dosage">{medicine.dosage_form}</div>
        )}
        {medicine.manufacturer && (
          <div className="manufacturer">{medicine.manufacturer}</div>
        )}
        {medicine.generic_name && (
          <div className="generic-badge">
            Generic: {medicine.generic_name}
          </div>
        )}
      </div>

      <div className="card">
        <h3>Price</h3>
        {medicine.unit_price != null && (
          <div className="price-row">
            <span>Unit Price</span>
            <strong>{formatPrice(medicine.unit_price)}</strong>
          </div>
        )}
        {medicine.strip_price != null && (
          <div className="price-row">
            <span>Strip Price</span>
            <strong>{formatPrice(medicine.strip_price)}</strong>
          </div>
        )}
        {medicine.box_price != null && (
          <div className="price-row">
            <span>Box Price</span>
            <strong>{formatPrice(medicine.box_price)}</strong>
          </div>
        )}
      </div>

      {medicine.indications && (
        <div className="card">
          <h3>Indications</h3>
          <p>{medicine.indications}</p>
        </div>
      )}
      {medicine.dosage && (
        <div className="card">
          <h3>Dosage & Administration</h3>
          <p>{medicine.dosage}</p>
        </div>
      )}
      {medicine.side_effects && (
        <div className="card">
          <h3>Side Effects</h3>
          <p>{medicine.side_effects}</p>
        </div>
      )}
      {medicine.contraindications && (
        <div className="card">
          <h3>Contraindications</h3>
          <p>{medicine.contraindications}</p>
        </div>
      )}

      {medicine.generic_id && (
        <Link
          to={`/alternatives/${medicine.generic_id}`}
          className="btn-primary"
        >
          View All Alternatives ({medicine.alternatives?.length ?? 0})
        </Link>
      )}
    </div>
  );
}