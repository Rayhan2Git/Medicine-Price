import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { uploadPrescription, isApiConfigured } from "../api";
import type { PrescriptionResult } from "../types";
import { pickStrings, type Lang } from "../i18n";
import { fmtMoney } from "../calc";
import { buildCartItem, type CartItem } from "../cart";

interface Props {
  lang: Lang;
  onAddMany: (items: CartItem[]) => void;
  onToast: (text: string) => void;
}

export default function PrescriptionPage({ lang, onAddMany, onToast }: Props) {
  const t = pickStrings(lang);
  const nav = useNavigate();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<PrescriptionResult | null>(null);

  const configured = isApiConfigured();

  const onPick = async (file: File) => {
    setBusy(true);
    setError(null);
    setResult(null);
    try {
      const r = await uploadPrescription(file);
      setResult(r);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  };

  const addAll = () => {
    if (!result) return;
    const items: CartItem[] = [];
    for (const m of result.medicines) {
      const b = m.cheapest ?? m.db_matches?.[0];
      if (!b) continue;
      // OCR doesn't capture dose/frequency/duration reliably, so we
      // default to 1×2×7 (one tablet, twice a day, for a week) and
      // the user can edit after.
      items.push(
        buildCartItem({
          medicine: b,
          mode: "prescription",
          dose: 1,
          frequency: 2,
          duration: 7,
          manualQuantity: 0,
        }),
      );
    }
    onAddMany(items);
    onToast(
      `${items.length} ${items.length === 1 ? "medicine" : "medicines"} added`,
    );
    nav("/");
  };

  return (
    <div className="page rx-page">
      <div className="rx-head">
        <h1>{t.prescriptionTitle}</h1>
        <p className="muted">{t.prescriptionDesc}</p>
      </div>

      {!configured ? (
        <div className="rx-warning">{t.prescriptionNotConfigured}</div>
      ) : (
        <label className="rx-upload">
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) onPick(f);
            }}
            disabled={busy}
          />
          <span>{busy ? t.prescriptionAnalyzing : t.prescriptionUpload}</span>
        </label>
      )}

      {error && <div className="rx-error">{error}</div>}

      {result && (
        <section className="rx-results">
          <h2>
            {t.prescriptionResultTitle} ({result.total_found})
          </h2>
          <ul className="rx-list">
            {result.medicines.map((m, i) => {
              const b = m.cheapest ?? m.db_matches?.[0];
              return (
                <li key={i} className="rx-item">
                  <div>
                    <div className="rx-item-name">{b?.name ?? m.raw_name}</div>
                    <div className="rx-item-sub">
                      {b?.strength && <span>{b.strength}</span>}
                      {b?.manufacturer && <span> · {b.manufacturer}</span>}
                    </div>
                  </div>
                  <div className="rx-item-price">
                    {b?.unit_price != null ? fmtMoney(b.unit_price) : "—"}
                  </div>
                </li>
              );
            })}
          </ul>
          {result.medicines.length > 0 && (
            <button type="button" className="btn btn-primary" onClick={addAll}>
              {t.prescriptionAddAll}
            </button>
          )}
        </section>
      )}
    </div>
  );
}
