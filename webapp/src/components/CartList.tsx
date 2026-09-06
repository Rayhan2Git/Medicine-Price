import { useMemo } from "react";
import {
  calculateCartItem,
  calculateCartTotals,
  fmtMoney,
  fmtQty,
} from "../calc";
import type { CartItem } from "../cart";
import { inferUnit } from "../units";
import type { Lang } from "../i18n";
import { pickStrings } from "../i18n";

interface Props {
  lang: Lang;
  items: CartItem[];
  onEdit: (item: CartItem) => void;
  onRemove: (item: CartItem) => void;
  onClear: () => void;
  onViewSummary: () => void;
  showClear?: boolean;
}

export function CartList({
  lang,
  items,
  onEdit,
  onRemove,
  onClear,
  onViewSummary,
  showClear = true,
}: Props) {
  const t = pickStrings(lang);

  const results = useMemo(
    () =>
      items.map((it) => {
        const u = inferUnit(it.dosageForm);
        const r = calculateCartItem(
          {
            mode: it.mode,
            dose: it.dose,
            frequency: it.frequency,
            duration: it.duration,
            manualQuantity: it.manualQuantity,
          },
          { unitPrice: it.unitPrice },
          { packSize: it.packSize, packPrice: it.packPrice },
        );
        return { item: it, calc: r, unit: u };
      }),
    [items],
  );

  const totals = useMemo(() => calculateCartTotals(results.map((r) => r.calc)), [results]);

  if (items.length === 0) {
    return (
      <div className="cart-empty">
        <div className="cart-empty-icon" aria-hidden>🛒</div>
        <h3>{t.cartEmpty}</h3>
        <p>{t.cartEmptyHint}</p>
      </div>
    );
  }

  return (
    <div className="cart">
      <div className="cart-head">
        <h2>🛒 {t.cart}</h2>
        <div className="cart-head-actions">
          {showClear && items.length > 0 && (
            <button
              type="button"
              className="btn-link"
              onClick={() => {
                if (window.confirm(t.clearCartConfirm)) onClear();
              }}
            >
              {t.clearCart}
            </button>
          )}
        </div>
      </div>

      <ul className="cart-items">
        {results.map(({ item, calc, unit }) => (
          <li key={item.cartItemId} className="cart-item">
            <div className="cart-item-head">
              <div>
                <div className="cart-item-name">
                  {item.name}
                  {item.strength && (
                    <span className="cart-item-strength"> {item.strength}</span>
                  )}
                </div>
                <div className="cart-item-meta">
                  {item.dosageForm && <span>{item.dosageForm}</span>}
                  {item.genericName && <> · {item.genericName}</>}
                </div>
              </div>
              <div className="cart-item-cost">
                {calc.isValid ? fmtMoney(calc.purchaseCost) : "—"}
              </div>
            </div>

            <div className="cart-item-config">
              {item.mode === "prescription" ? (
                <PrescriptionLine item={item} unit={unit.singular} lang={lang} />
              ) : (
                <span>
                  {t.quantity}: {fmtQty(item.manualQuantity)} {unit.packNoun}
                </span>
              )}
            </div>

            <div className="cart-item-calc">
              {calc.hasPackInfo ? (
                <>
                  <span>
                    <strong>{t.totalRequired}:</strong> {fmtQty(calc.totalQuantity)} {unit.plural}
                  </span>
                  <span className="cart-item-calc-sep">·</span>
                  <span>
                    <strong>{t.purchaseQuantity}:</strong> {fmtQty(calc.packsRequired)} {unit.packNoun}-pack{calc.packsRequired === 1 ? "" : "s"}
                  </span>
                </>
              ) : (
                <span>
                  <strong>{t.totalRequired}:</strong> {fmtQty(calc.totalQuantity)} {unit.plural}
                </span>
              )}
            </div>

            <div className="cart-item-actions">
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                onClick={() => onEdit(item)}
              >
                {t.edit}
              </button>
              <button
                type="button"
                className="btn btn-ghost btn-sm btn-danger"
                onClick={() => onRemove(item)}
              >
                {t.remove}
              </button>
            </div>
          </li>
        ))}
      </ul>

      <div className="cart-totals">
        <div className="cart-totals-row">
          <span>{t.cartMedicines}</span>
          <span>{totals.itemCount}</span>
        </div>
        <div className="cart-totals-row">
          <span>{t.cartUnits}</span>
          <span>{fmtQty(totals.totalRequired)}</span>
        </div>
        <div className="cart-totals-row">
          <span>{t.cartPacks}</span>
          <span>{fmtQty(totals.totalPacks)}</span>
        </div>
        <div className="cart-totals-row cart-totals-grand">
          <span>{t.cartEstimatedTotal}</span>
          <span className="cart-totals-grand-value">
            {fmtMoney(totals.totalCost)}
          </span>
        </div>
        <button
          type="button"
          className="btn btn-primary btn-block"
          onClick={onViewSummary}
        >
          {t.viewSummary}
        </button>
      </div>
    </div>
  );
}

function PrescriptionLine({
  item,
  unit,
  lang,
}: {
  item: CartItem;
  unit: string;
  lang: Lang;
}) {
  const t = pickStrings(lang);
  return (
    <span>
      {fmtQty(item.dose)} {unit}
      {" × "}
      {fmtQty(item.frequency)} {t.perDay}
      {" × "}
      {fmtQty(item.duration)} {t.days}
    </span>
  );
}
