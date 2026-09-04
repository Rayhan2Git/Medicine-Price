import { Routes, Route, NavLink, useLocation } from "react-router-dom";
import HomePage from "./pages/HomePage";
import SearchPage from "./pages/SearchPage";
import MedicineDetailPage from "./pages/MedicineDetailPage";
import AlternativesPage from "./pages/AlternativesPage";
import PrescriptionPage from "./pages/PrescriptionPage";
import PrescriptionResultPage from "./pages/PrescriptionResultPage";
import ErrorBoundary from "./components/ErrorBoundary";

function Header() {
  return (
    <header className="app-header">
      <NavLink to="/" className="brand-link">
        <span className="brand-mark" aria-hidden>℞</span>
        <span>BD Medicine Price</span>
      </NavLink>
      <nav>
        <NavLink to="/" end>Home</NavLink>
        <NavLink to="/search">Search</NavLink>
        <NavLink to="/prescription">Prescription</NavLink>
      </nav>
    </header>
  );
}

export default function App() {
  const location = useLocation();
  const showHeader = !location.pathname.startsWith("/prescription/result");
  return (
    <ErrorBoundary>
      <div className="app">
        {showHeader && <Header />}
        <main className="app-main">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/search" element={<SearchPage />} />
            <Route path="/medicine/:id" element={<MedicineDetailPage />} />
            <Route path="/alternatives/:genericId" element={<AlternativesPage />} />
            <Route path="/prescription" element={<PrescriptionPage />} />
            <Route
              path="/prescription/result"
              element={<PrescriptionResultPage />}
            />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
      </div>
    </ErrorBoundary>
  );
}

function NotFound() {
  return (
    <div className="page">
      <div className="empty-state">
        <div className="icon">404</div>
        <h3>Page not found</h3>
        <p>The page you're looking for doesn't exist.</p>
      </div>
    </div>
  );
}
