import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { searchMedicines } from "../api";
import type { Brand } from "../types";
import MedicineCard from "../components/MedicineCard";

export default function SearchPage() {
  const [params, setParams] = useSearchParams();
  const initial = params.get("q") ?? "";
  const [query, setQuery] = useState(initial);
  const [results, setResults] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!initial) return;
    let cancelled = false;
    setLoading(true);
    setError("");
    searchMedicines(initial)
      .then((data) => {
        if (!cancelled) setResults(data.results);
      })
      .catch((e) => !cancelled && setError(e.message))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [initial]);

  // 350ms debounce on typing
  useEffect(() => {
    if (query === initial) return;
    const t = setTimeout(() => {
      if (query.trim()) setParams({ q: query.trim() });
    }, 350);
    return () => clearTimeout(t);
  }, [query, initial, setParams]);

  return (
    <div className="page">
      <div className="search-bar">
        <input
          type="search"
          placeholder="Search medicines…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          autoFocus
        />
      </div>
      {loading && <div className="state">Loading…</div>}
      {error && <div className="state error">{error}</div>}
      {!loading && !error && results.length === 0 && initial && (
        <div className="state">No medicines found for "{initial}"</div>
      )}
      <div className="card-list">
        {results.map((b) => (
          <MedicineCard key={b.id} brand={b} />
        ))}
      </div>
    </div>
  );
}