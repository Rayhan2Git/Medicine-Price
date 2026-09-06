import { useCallback, useEffect, useState } from "react";
import { HashRouter, NavLink, Route, Routes, useLocation } from "react-router-dom";
import ErrorBoundary from "./components/ErrorBoundary";
import { Toasts } from "./components/Toasts";
import { LanguageToggle } from "./components/LanguageToggle";
import CalculatorPage from "./pages/CalculatorPage";
import PrescriptionPage from "./pages/PrescriptionPage";
import CartSummaryPage from "./pages/CartSummaryPage";
import { CartProvider, useCartContext, useToasts, type CartItem } from "./cart";
import { pickStrings, type Lang } from "./i18n";

const LANG_KEY = "medicine-cart-lang";

function readLang(): Lang {
  try {
    const v = window.localStorage.getItem(LANG_KEY);
    if (v === "en" || v === "bn") return v;
  } catch {
    /* ignore */
  }
  return "en";
}

function Header({ lang, onLang }: { lang: Lang; onLang: (l: Lang) => void }) {
  const t = pickStrings(lang);
  const loc = useLocation();
  const showHeader = loc.pathname !== "/summary";
  if (!showHeader) return null;
  return (
    <header className="app-header">
      <NavLink to="/" className="brand-link" end>
        <span className="brand-mark" aria-hidden>℞</span>
        <span>BD Medicine Price</span>
      </NavLink>
      <nav className="app-nav">
        <NavLink to="/" end>
          {t.appName}
        </NavLink>
        <NavLink to="/prescription">{t.prescription}</NavLink>
      </nav>
      <LanguageToggle lang={lang} onChange={onLang} />
    </header>
  );
}

function NotFound({ lang }: { lang: Lang }) {
  const t = pickStrings(lang);
  return (
    <div className="page">
      <div className="empty-state">
        <div className="icon">404</div>
        <h3>{t.pageNotFound}</h3>
      </div>
    </div>
  );
}

function AppShell() {
  const [lang, setLangState] = useState<Lang>(readLang);
  const cart = useCartContext();
  const { toasts, push: pushToast, dismiss } = useToasts();

  // Persist language
  useEffect(() => {
    try {
      window.localStorage.setItem(LANG_KEY, lang);
    } catch {
      /* ignore */
    }
    document.documentElement.lang = lang;
  }, [lang]);

  const onLang = useCallback((l: Lang) => setLangState(l), []);

  // Toasts for the calculator page
  const onToastAdd = useCallback(
    (name: string) => pushToast(pickStrings(lang).addedToast(name)),
    [lang, pushToast],
  );
  const onToastRemove = useCallback(
    (name: string, undo: () => void) =>
      pushToast(pickStrings(lang).removedToast(name), {
        label: pickStrings(lang).undo,
        onClick: undo,
      }),
    [lang, pushToast],
  );
  const onToastUpdate = useCallback(
    (name: string) => pushToast(pickStrings(lang).updatedToast(name)),
    [lang, pushToast],
  );
  const onToastClear = useCallback(
    (undo: () => void) =>
      pushToast(pickStrings(lang).clearedToast, {
        label: pickStrings(lang).undo,
        onClick: undo,
      }),
    [lang, pushToast],
  );

  // Add-many (used by PrescriptionPage after OCR)
  const onAddMany = useCallback(
    (items: CartItem[]) => {
      let added = 0;
      for (const it of items) {
        if (cart.add(it)) added++;
      }
      return added;
    },
    [cart],
  );

  return (
    <ErrorBoundary>
      <div className="app">
        <Header lang={lang} onLang={onLang} />
        <main className="app-main">
          <Routes>
            <Route
              path="/"
              element={
                <CalculatorPage
                  lang={lang}
                  onToastAdd={onToastAdd}
                  onToastRemove={onToastRemove}
                  onToastUpdate={onToastUpdate}
                  onToastClear={onToastClear}
                />
              }
            />
            <Route
              path="/prescription"
              element={
                <PrescriptionPage
                  lang={lang}
                  onAddMany={onAddMany}
                  onToast={pushToast}
                />
              }
            />
            <Route
              path="/summary"
              element={<CartSummaryPage lang={lang} items={cart.items} />}
            />
            <Route path="*" element={<NotFound lang={lang} />} />
          </Routes>
        </main>
        <Toasts toasts={toasts} onDismiss={dismiss} />
      </div>
    </ErrorBoundary>
  );
}

export default function App() {
  return (
    <CartProvider>
      <AppShell />
    </CartProvider>
  );
}

// Re-export HashRouter wrapping for use in main.tsx
export { HashRouter };
