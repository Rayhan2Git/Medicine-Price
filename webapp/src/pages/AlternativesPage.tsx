import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getAlternatives } from "../api";
import type { Brand } from "../types";
import MedicineCard from "../components/MedicineCard";

export default function AlternativesPage() {
  const { genericId } = useParams<{ genericId: string }>();
  const [brands, setBrands] = useState<Brand[]>([]);
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!genericId) return;
    setLoading(true);
    getAlternatives(Number(genericId))
      .then((data) => {
        setBrands(data.brands);
        setName(data.generic.name);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [genericId]);

  return (
    <div className="page">
      <div className="card">
        <h2>Alternatives for {name}</h2>
        <p className="muted">{brands.length} brands found</p>
      </div>
      {loading ? (
        <div className="state">Loading…</div>
      ) : (
        <div className="card-list">
          {brands.map((b, i) => (
            <div key={b.id} className="rank-row">
              <div className="rank-badge">#{i + 1}</div>
              <div className="rank-card">
                <MedicineCard brand={b} compact />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}