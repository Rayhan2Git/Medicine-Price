import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getStats } from "../api";
import type { Stats } from "../types";

export default function HomePage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [query, setQuery] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    getStats().then(setStats).catch(() => setStats(null));
  }, []);

  const onSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const q = query.trim();
    if (q) navigate(`/search?q=${encodeURIComponent(q)}`);
  };

  return (
    <div className="page">
      <h1 className="hero-title">BD Medicine Price</h1>
      {stats && (
        <p className="hero-sub">
          Search{" "}
          <strong>{stats.brands.toLocaleString()}</strong> medicines ·{" "}
          <strong>{stats.generics.toLocaleString()}</strong> generics
        </p>
      )}

      <form className="hero-search" onSubmit={onSearch}>
        <input
          type="search"
          placeholder="Search medicine name or generic…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          autoFocus
        />
        <button type="submit">Search</button>
      </form>

      <Link to="/prescription" className="rx-cta">
        <span className="rx-cta-icon">℞</span>
        <span className="rx-cta-text">
          <strong>Upload Prescription</strong>
          <span>Take a photo or upload one — we'll parse the medicines</span>
        </span>
      </Link>

      <div className="quick-links">
        <Link to="/search?q=paracetamol">Paracetamol</Link>
        <Link to="/search?q=omeprazole">Omeprazole</Link>
        <Link to="/search?q=amoxicillin">Amoxicillin</Link>
        <Link to="/search?q=montelukast">Montelukast</Link>
      </div>
    </div>
  );
}