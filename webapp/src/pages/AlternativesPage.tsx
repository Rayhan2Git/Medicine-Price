import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { getAlternatives, formatPrice } from "../api";
import type { Brand } from "../types";
import { Link } from "react-router-dom";

export default function AlternativesPage() {
  const { genericId } = useParams<{ genericId: string }>();
  const [brands, setBrands] = useState<Brand[]>([]);
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!genericId) return;
    setLoading(true);
    getAlternatives(Number(genericId), 200)
      .then((data) => {
        setBrands(data.brands);
        setName(data.generic.name);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [genericId]);

  const sorted = useMemo(() => {
    return [...brands].sort((a, b) => {
      const ap = a.unit_price ?? Number.POSITIVE_INFINITY;
      const bp = b.unit_price ?? Number.POSITIVE_INFINITY;
      if (ap !== bp) return ap - bp;
      return a.name.length - b.name.length;
    });
  }, [brands]);

  const cheapestId = sorted[0]?.id;

  if (loading) {
    return (
      <div className="page">
        <div className="skeleton" style={{ height: 100, marginBottom: 24 }} />
        <div className="skeleton" style={{ height: 80 }} />
        <div className="skeleton" style={{ height: 80, marginTop: 8 }} />
      </div>
    );
  }

  return (
    <div className="page">
      <div className="alt-header">
        <div className="kicker">Alternatives for</div>
        <h1>{name || "Unknown generic"}</h1>
        <div className="count">
          <strong>{sorted.length}</strong> brand{sorted.length === 1 ? "" : "s"} found,
          ranked by unit price
        </div>
      </div>

      {sorted.length === 0 ? (
        <div className="empty-state">
          <div className="icon">∅</div>
          <h3>No brands on record</h3>
          <p>No brands containing this generic are in the database.</p>
        </div>
      ) : (
        sorted.map((b, i) => {
          const isCheapest = b.id === cheapestId;
          return (
            <Link
              key={b.id}
              to={`/medicine/${b.id}`}
              className={`rank-row ${isCheapest ? "is-cheapest" : ""}`}
              style={{ textDecoration: "none", color: "inherit" }}
            >
              <div className="rank-badge">{i + 1}</div>
              <div className="rank-card" style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
                <div style={{ minWidth: 0 }}>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 8, alignItems: "baseline" }}>
                    <span style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: "1.05rem" }}>
                      {b.name}
                    </span>
                    {b.strength && (
                      <span className="tag tag-primary" style={{ fontFamily: "var(--font-mono)" }}>
                        {b.strength}
                      </span>
                    )}
                    {b.dosage_form && <span className="tag">{b.dosage_form}</span>}
                  </div>
                  {b.manufacturer && (
                    <div style={{ color: "var(--muted)", fontSize: "0.82rem", marginTop: 4 }}>
                      {b.manufacturer}
                    </div>
                  )}
                </div>
                <div
                  style={{
                    fontFamily: "var(--font-display)",
                    fontWeight: 700,
                    fontSize: "1.15rem",
                    color: "var(--primary)",
                    whiteSpace: "nowrap",
                    alignSelf: "center",
                    fontVariationSettings: '"opsz" 144',
                  }}
                >
                  {formatPrice(b.unit_price)}
                </div>
              </div>
            </Link>
          );
        })
      )}
    </div>
  );
}
