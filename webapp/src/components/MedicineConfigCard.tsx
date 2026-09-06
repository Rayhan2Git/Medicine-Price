import { useEffect, useMemo, useState } from "react";
import type { Brand, BrandDetail } from "../types";
import { calculateCartItem, fmtMoney, fmtQty, type CalcMode } from "../calc";
import { inferUnit } from "../units";
import type { Lang } from "../i18n";
import { pickStrings } from "../i18n";

interface Props {
  lang: Lang;
  medicine: Brand | BrandDetail;
  onAdd: (args: {
    mode: CalcMode;
    dose: number;
    frequency: number;
    duration: number;
    manualQuantity: number;
  }) => void;
  onCancel: () => void;
  // If provided, the card is in "edit" mode and the Add button reads "Update".
  initialValues?: {
    mode: CalcMode;
    dose: number;
    frequency: number;
    duration: number;
    manualQuantity: number;
  };
  // If in edit mode, what label to use on the primary action.
  primaryActionLabel?: string;
}

export function MedicineConfigCard({
  lang,
  medicine,
  onAdd,
  onCancel,
  initialValues,
  primaryActionLabel,
}: Props) {
  const t = pickStrings(lang);
  const detail = medicine as BrandDetail;
  const unit = useMemo(() => inferUnit(medicine.dosage_form), [medicine.dosage_form]);

  const [mode, setMode] = useState<CalcMode>(initialValues?.mode ?? "prescription");
  const [dose, setDose] = useState<number>(initialValues?.dose ?? unit.defaultDose);
  const [frequency, setFrequency] = useState<number>(
    initialValues?.frequency ?? unit.defaultFrequency,
  );
  const [duration, setDuration] = useState<number>(
    initialValues?.duration ?? unit.defaultDuration,
  );
  const [manualQuantity, setManualQuantity] = useState<number>(
    initialValues?.manualQuantity ?? unit.defaultDose * unit.defaultFrequency * unit.defaultDuration,
  );

  // Reset values when the selected medicine changes (and not editing)
  useEffect(() => {
    if (initialValues) return;
    setDose(unit.defaultDose);
    setFrequency(unit.defaultFrequency);
    setDuration(unit.defaultDuration);
    setManualQuantity(
      unit.defaultDose * unit.defaultFrequency * unit.defaultDuration,
    );
    setMode("prescription");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [medicine.id]);

  const result = useMemo(
    () =>
      calculateCartItem(
        { mode, dose, frequency, duration, manualQuantity },
        { unitPrice: medicine.unit_price ?? null },
        { packSize: detail.box_size ?? null, packPrice: detail.box_price ?? null },
      ),
    [mode, dose, frequency, duration, manualQuantity, medicine.unit_price, detail.box_size, detail.box_price],
  );

  const unitPrice = medicine.unit_price ?? null;
  const packSize = detail.box_size ?? null;
  const packPrice = detail.box_price ?? null;
  const hasPack = result.hasPackInfo;

  const numInput = (value: number, onChange: (v: number) => void) => (
    <input
      type="number"
      className="num-input"
      min={0}
      step={unit.decimals === 0 ? 1 : unit.decimals === 1 ? 0.1 : 0.01}
      value={Number.isFinite(value) ? value : ""}
      onChange={(e) => {
        const v = parseFloat(e.target.value);
        onChange(Number.isFinite(v) ? v : 0);
      }}
    />
  );

  return (
    <div className="config-card" aria-label={t.configureMedicine}>
      <div className="config-card-head">
        <div>
          <h3 className="config-name">
            {medicine.name}
            {medicine.strength && (
              <span className="config-strength"> {medicine.strength}</span>
            )}
          </h3>
          <p className="config-meta">
            {medicine.dosage_form && <span>{medicine.dosage_form}</span>}
            {medicine.generic_name && <> · {medicine.generic_name}</>}
            {medicine.manufacturer && <> · {medicine.manufacturer}</>}
          </p>
        </div>
        <button
          type="button"
          className="config-close"
          aria-label={t.cancel}
          onClick={onCancel}
        >
          ×
        </button>
      </div>

      <div className="config-price-row">
        <div className="config-price-cell">
          <div className="config-price-label">{t.estimatedCost}</div>
          <div className="config-price-value">
            {unitPrice != null ? fmtMoney(unitPrice) : "—"}
            <span className="config-price-suffix">{" "}/ {unit.singular}</span>
          </div>
        </div>
        {hasPack && packSize != null && packPrice != null && (
          <div className="config-price-cell">
            <div className="config-price-label">{t.packInfo}</div>
            <div className="config-price-value">
              {fmtQty(packSize)} {unit.packNoun} {t.perPack}
            </div>
            <div className="config-price-sub">
              {fmtMoney(packPrice)} {t.perPack}
            </div>
          </div>
        )}
      </div>

      {!hasPack && (
        <div className="config-warning">{t.packUnavailable}</div>
      )}

      <div className="config-mode-tabs" role="tablist">
        <button
          type="button"
          role="tab"
          aria-selected={mode === "prescription"}
          className={"config-mode" + (mode === "prescription" ? " active" : "")}
          onClick={() => setMode("prescription")}
        >
          {t.modePrescription}
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={mode === "quantity"}
          className={"config-mode" + (mode === "quantity" ? " active" : "")}
          onClick={() => setMode("quantity")}
        >
          {t.modeQuantity}
        </button>
      </div>

      {mode === "prescription" ? (
        <div className="config-grid">
          <label className="config-field">
            <span className="config-field-label">
              {t.dose} <small>({unit.singular})</small>
            </span>
            {numInput(dose, setDose)}
          </label>
          <label className="config-field">
            <span className="config-field-label">{t.frequency}</span>
            <div className="with-suffix">
              {numInput(frequency, setFrequency)}
              <span className="suffix">{t.perDay}</span>
            </div>
          </label>
          <label className="config-field">
            <span className="config-field-label">{t.duration}</span>
            <div className="with-suffix">
              {numInput(duration, setDuration)}
              <span className="suffix">{t.days}</span>
            </div>
          </label>
        </div>
      ) : (
        <div className="config-grid">
          <label className="config-field config-field-wide">
            <span className="config-field-label">
              {t.quantity} <small>({unit.packNoun})</small>
            </span>
            {numInput(manualQuantity, setManualQuantity)}
          </label>
        </div>
      )}

      <div className="config-summary">
        {mode === "prescription" && (
          <div className="config-summary-row">
            <span className="config-summary-label">{t.dailyQuantity}</span>
            <span className="config-summary-value">
              {fmtQty(result.dailyQuantity)} {unit.plural}
            </span>
          </div>
        )}
        <div className="config-summary-row">
          <span className="config-summary-label">{t.totalRequired}</span>
          <span className="config-summary-value">
            {fmtQty(result.totalQuantity)} {unit.plural}
          </span>
        </div>
        {hasPack ? (
          <>
            <div className="config-summary-row">
              <span className="config-summary-label">{t.purchaseQuantity}</span>
              <span className="config-summary-value">
                {fmtQty(result.packsRequired)} {unit.packNoun}-packs
                <span className="config-summary-sub">
                  {" "}({fmtQty(result.purchaseQuantity)} {unit.plural})
                </span>
              </span>
            </div>
            <div className="config-summary-row config-summary-total">
              <span className="config-summary-label">{t.estimatedCost}</span>
              <span className="config-summary-value">{fmtMoney(result.purchaseCost)}</span>
            </div>
          </>
        ) : (
          <div className="config-summary-row config-summary-total">
            <span className="config-summary-label">{t.estimatedCost}</span>
            <span className="config-summary-value">
              {result.isValid ? fmtMoney(result.purchaseCost) : "—"}
            </span>
          </div>
        )}
      </div>

      <div className="config-actions">
        <button type="button" className="btn btn-ghost" onClick={onCancel}>
          {t.cancel}
        </button>
        <button
          type="button"
          className="btn btn-primary"
          disabled={!result.isValid}
          onClick={() =>
            onAdd({ mode, dose, frequency, duration, manualQuantity })
          }
        >
          {primaryActionLabel ?? t.addToList}
        </button>
      </div>
    </div>
  );
}
