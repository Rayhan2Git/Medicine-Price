import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getStats, formatPrice } from "../api";
import type { Stats } from "../types";

const QUICK_SEARCHES = [
  { q: "paracetamol", generic: "Acetaminophen" },
  { q: "omeprazole", generic: "Omeprazole" },
  { q: "amoxicillin", generic: "Amoxicillin" },
  { q: "montelukast", generic: "Montelukast" },
  { q: "azithromycin", generic: "Azithromycin" },
  { q: "metformin", generic: "Metformin" },
  { q: "atorvastatin", generic: "Atorvastatin" },
  { q: "cetirizine", generic: "Cetirizine" },
];

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
      <section className="hero">
        <div>
          <span className="hero-eyebrow">A price reference for Bangladesh</span>
          <h1>
            Know what your<br />
            medicine <em>actually costs.</em>
          </h1>
          <p className="hero-lede">
            A free, open catalogue of brand-name medicines, generics and prices
            from the MedEx database. Search any medicine, compare alternatives,
            and find a cheaper option at the chemist.
          </p>

          <form className="hero-search" onSubmit={onSearch}>
            <input
              type="search"
              placeholder="Search a medicine — try “Napa”, “Seclo”, “Ace”..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              autoFocus
            />
            <button type="submit">Search</button>
          </form>

          <div className="hero-stats">
            <div className="hero-stat">
              <div className="value">{stats ? stats.brands.toLocaleString() : "—"}</div>
              <div className="label">Brands indexed</div>
            </div>
            <div className="hero-stat">
              <div className="value">{stats ? stats.generics.toLocaleString() : "—"}</div>
              <div className="label">Generics</div>
            </div>
            <div className="hero-stat">
              <div className="value">
                {stats ? stats.brands_with_price.toLocaleString() : "—"}
              </div>
              <div className="label">With prices</div>
            </div>
          </div>
        </div>

        <aside className="hero-card">
          <div className="hero-card-label">Featured today</div>
          <h3>Napa 500 mg</h3>
          <p className="muted" style={{ margin: 0, fontStyle: "italic" }}>
            Paracetamol · Beximco Pharmaceuticals
          </p>
          <div className="price">৳1.20</div>
          <p className="muted" style={{ margin: 0, fontSize: "0.78rem" }}>
            per tablet · 100+ alternatives
          </p>
          <div className="meta">
            <span>Tablet</span>
            <span>Bangladesh</span>
            <span>OTC</span>
          </div>
        </aside>
      </section>

      <section>
        <div className="section-head">
          <div>
            <span className="kicker">Quick search</span>
            <h2>Common medicines</h2>
          </div>
          <Link to="/search" className="link">All medicines →</Link>
        </div>
        <div className="quick-grid">
          {QUICK_SEARCHES.map((q) => (
            <Link key={q.q} to={`/search?q=${encodeURIComponent(q.q)}`} className="quick-link">
              <span className="qname">{q.q}</span>
              <span className="qgeneric">{q.generic}</span>
            </Link>
          ))}
        </div>
      </section>

      <section>
        <div className="section-head">
          <div>
            <span className="kicker">Tools</span>
            <h2>More ways to look it up</h2>
          </div>
        </div>
        <div className="quick-grid">
          <Link to="/prescription" className="quick-link">
            <span className="qname">℞ Scan a prescription</span>
            <span className="qgeneric">Upload an image — we read it for you</span>
          </Link>
          <Link to="/search?q=" className="quick-link">
            <span className="qname">⌕ Browse the catalogue</span>
            <span className="qgeneric">{stats ? stats.brands.toLocaleString() : "—"} brands, ranked by price</span>
          </Link>
        </div>
      </section>
    </div>
  );
}

// Suppress unused-warning for formatPrice; used by other pages
void formatPrice;
