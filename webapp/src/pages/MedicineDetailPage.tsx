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

  if (loading) {
    return (
      <div className="page">
        <div className="skeleton" style={{ height: 240 }} />
        <div className="skeleton" style={{ height: 120 }} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="page">
        <div className="empty-state">
          <div className="icon">!</div>
          <h3>Couldn't load this medicine</h3>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  if (!medicine) {
    return (
      <div className="page">
        <div className="empty-state">
          <div className="icon">∅</div>
          <h3>Medicine not found</h3>
          <p>It may have been removed from the database.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="card">
        <h1>
          <small>Brand</small>
          {medicine.name}
        </h1>
        <div className="tag-row">
          {medicine.strength && <span className="tag tag-primary">{medicine.strength}</span>}
          {medicine.dosage_form && <span className="tag">{medicine.dosage_form}</span>}
          {medicine.manufacturer && <span className="tag tag-accent">{medicine.manufacturer}</span>}
        </div>

        {medicine.generic_id && medicine.generic_name && (
          <div className="alt-banner">
            <div>
              <span className="label">Generic</span>
              <div className="name">{medicine.generic_name}</div>
            </div>
            <Link to={`/alternatives/${medicine.generic_id}`}>
              See all alternatives →
            </Link>
          </div>
        )}

        <div className="price-table">
          {medicine.unit_price != null && (
            <div className="price-row">
              <span className="label">Per unit</span>
              <span className="value">
                {formatPrice(medicine.unit_price)}
                {medicine.strip_size && <small> / {medicine.strip_size} units</small>}
              </span>
            </div>
          )}
          {medicine.strip_price != null && (
            <div className="price-row">
              <span className="label">Per strip</span>
              <span className="value">
                {formatPrice(medicine.strip_price)}
                {medicine.strip_size && <small> / {medicine.strip_size} units</small>}
              </span>
            </div>
          )}
          {medicine.box_price != null && (
            <div className="price-row">
              <span className="label">Per box</span>
              <span className="value">
                {formatPrice(medicine.box_price)}
                {medicine.box_size && <small> / {medicine.box_size} units</small>}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
