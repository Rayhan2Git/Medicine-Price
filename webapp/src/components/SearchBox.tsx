import { useEffect, useRef, useState } from "react";
import { searchMedicines } from "../dataClient";
import type { Brand, SearchResult } from "../types";
import type { Lang } from "../i18n";
import { pickStrings } from "../i18n";
import { fmtMoney } from "../calc";

interface Props {
  lang: Lang;
  onSelect: (b: Brand) => void;
}

const DEBOUNCE_MS = 220;

/**
 * Debounced search box with keyboard-navigable dropdown.
 * - ↑/↓ moves the highlight
 * - Enter selects the highlighted result (or the first one)
 * - Esc closes the dropdown
 * - Click outside closes the dropdown
 */
export function SearchBox({ lang, onSelect }: Props) {
  const t = pickStrings(lang);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Brand[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeIdx, setActiveIdx] = useState(0);

  const inputRef = useRef<HTMLInputElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);
  const lastReqId = useRef(0);

  // Debounced fetch
  useEffect(() => {
    const q = query.trim();
    if (!q) {
      setResults([]);
      setError(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);

    const reqId = ++lastReqId.current;
    const handle = window.setTimeout(async () => {
      try {
        abortRef.current?.abort();
        const res: SearchResult = await searchMedicines(q, 24);
        if (reqId !== lastReqId.current) return; // stale
        setResults(res.results);
        setActiveIdx(0);
      } catch (e) {
        if (reqId !== lastReqId.current) return;
        setError(e instanceof Error ? e.message : String(e));
        setResults([]);
      } finally {
        if (reqId === lastReqId.current) setLoading(false);
      }
    }, DEBOUNCE_MS);

    return () => window.clearTimeout(handle);
  }, [query]);

  // Click-outside close
  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (!wrapRef.current) return;
      if (!wrapRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  const choose = (b: Brand) => {
    onSelect(b);
    setQuery("");
    setResults([]);
    setOpen(false);
  };

  const onKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setOpen(true);
      setActiveIdx((i) => Math.min(i + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIdx((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      const pick = results[activeIdx] ?? results[0];
      if (pick) choose(pick);
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  };

  const showDropdown =
    open && (query.trim().length > 0);

  return (
    <div className="search-wrap" ref={wrapRef}>
      <div className="search-input-row">
        <span className="search-icon" aria-hidden>🔍</span>
        <input
          ref={inputRef}
          type="search"
          className="search-input"
          placeholder={t.searchPlaceholder}
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={onKey}
          autoComplete="off"
          spellCheck={false}
          aria-label={t.searchPlaceholder}
          aria-autocomplete="list"
          aria-expanded={showDropdown}
        />
        {loading && <span className="search-spinner" aria-hidden />}
      </div>

      {showDropdown && (
        <div className="search-dropdown" role="listbox">
          {error && <div className="search-error">{t.searchError}</div>}
          {!error && !loading && results.length === 0 && (
            <div className="search-empty">{t.searchNoResults}</div>
          )}
          {!error &&
            results.map((b, idx) => (
              <button
                key={b.id}
                type="button"
                role="option"
                aria-selected={idx === activeIdx}
                className={
                  "search-result" + (idx === activeIdx ? " active" : "")
                }
                onMouseEnter={() => setActiveIdx(idx)}
                onClick={() => choose(b)}
              >
                <div className="search-result-main">
                  <div className="search-result-name">
                    {highlight(b.name, query)}
                    {b.strength && (
                      <span className="search-result-strength"> {b.strength}</span>
                    )}
                    {b.dosage_form && (
                      <span className="search-result-form"> · {b.dosage_form}</span>
                    )}
                  </div>
                  <div className="search-result-sub">
                    {b.generic_name && <span>{b.generic_name}</span>}
                    {b.manufacturer && <span> · {b.manufacturer}</span>}
                  </div>
                </div>
                <div className="search-result-price">
                  {b.unit_price != null ? fmtMoney(b.unit_price) : "—"}
                  <span className="search-result-price-suffix">
                    {b.unit_price != null ? (
                      <>{" "}/ {shortUnit(b.dosage_form)}</>
                    ) : null}
                  </span>
                </div>
              </button>
            ))}
        </div>
      )}
    </div>
  );
}

function highlight(text: string, query: string): React.ReactNode {
  const q = query.trim();
  if (!q) return text;
  const idx = text.toLowerCase().indexOf(q.toLowerCase());
  if (idx < 0) return text;
  return (
    <>
      {text.slice(0, idx)}
      <mark>{text.slice(idx, idx + q.length)}</mark>
      {text.slice(idx + q.length)}
    </>
  );
}

function shortUnit(form: string | undefined): string {
  if (!form) return "unit";
  if (/tablet/i.test(form)) return "tablet";
  if (/capsule/i.test(form)) return "capsule";
  if (/syrup|suspension|oral solution|paste|granules|powder|effervescent/i.test(form)) return "ml";
  if (/drops?|nasal|ophthalmic|ear drop|spray/i.test(form)) return "ml";
  if (/injection|infusion/i.test(form)) return "ml";
  if (/cream|ointment|gel|lotion|shampoo/i.test(form)) return "g";
  if (/inhaler|nebulis/i.test(form)) return "puff";
  if (/suppository/i.test(form)) return "supp.";
  if (/sachet/i.test(form)) return "sachet";
  return "unit";
}
