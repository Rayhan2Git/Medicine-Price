import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { searchMedicines } from "../api";
import type { Brand } from "../types";
import MedicineCard from "../components/MedicineCard";

const SUGGESTIONS = [
  "Napa", "Seclo", "Ace", "Monas", "Filmet", "Tufnil", "Maxpro", "Atova",
];

export default function SearchPage() {
  const [params, setParams] = useSearchParams();
  const initial = params.get("q") ?? "";
  const [query, setQuery] = useState(initial);
  const [results, setResults] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [searched, setSearched] = useState(!!initial);

  useEffect(() => {
    if (!initial) return;
    let cancelled = false;
    setLoading(true);
    setError("");
    setSearched(true);
    searchMedicines(initial, 30)
      .then((data) => {
        if (!cancelled) setResults(data.results);
      })
      .catch((e) => !cancelled && setError(e.message))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [initial]);

  useEffect(() => {
    if (query === initial) return;
    const t = setTimeout(() => {
      const q = query.trim();
      if (q) setParams({ q });
    }, 350);
    return () => clearTimeout(t);
  }, [query, initial, setParams]);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const q = query.trim();
    if (q) setParams({ q });
  };

  return (
    <div className="page">
      <form onSubmit={onSubmit} className="search-wrap">
        <input
          type="search"
          className="search-input"
          placeholder="Search by brand or generic — e.g. Napa, omeprazole, azithromycin…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          autoFocus
        />
      </form>

      {!searched && !loading && (
        <>
          <div className="search-meta">
            <span>Try a common name</span>
          </div>
          <div className="quick-grid">
            {SUGGESTIONS.map((s) => (
              <button
                key={s}
                type="button"
                className="quick-link"
                onClick={() => setQuery(s)}
                style={{ textAlign: "left", cursor: "pointer", border: "1px solid var(--border)" }}
              >
                <span className="qname">{s}</span>
                <span className="qgeneric">search →</span>
              </button>
            ))}
          </div>
        </>
      )}

      {searched && (
        <div className="search-meta">
          {loading ? (
            <span>Searching…</span>
          ) : error ? (
            <span style={{ color: "var(--danger)" }}>{error}</span>
          ) : (
            <span>
              <span className="query-echo">"{initial}"</span> &nbsp;·&nbsp; {results.length}{" "}
              {results.length === 1 ? "result" : "results"}
            </span>
          )}
        </div>
      )}

      {loading && (
        <div className="results-grid">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="skeleton" style={{ height: 140 }} />
          ))}
        </div>
      )}

      {!loading && !error && searched && results.length === 0 && (
        <div className="empty-state">
          <div className="icon">∅</div>
          <h3>No matches</h3>
          <p>Nothing found for "{initial}". Try a different spelling or generic name.</p>
        </div>
      )}

      {!loading && !error && results.length > 0 && (
        <div className="results-grid">
          {results.map((b) => (
            <MedicineCard key={b.id} brand={b} />
          ))}
        </div>
      )}
    </div>
  );
}
