import { useEffect, useMemo, useState } from "react";
import {
  calculateCartItem,
  calculateCartTotals,
  fmtMoney,
} from "../calc";
import type { CartItem } from "../cart";
import type { Lang } from "../i18n";
import { pickStrings } from "../i18n";
import { CartList } from "./CartList";

interface BarProps {
  lang: Lang;
  items: CartItem[];
  onEdit: (item: CartItem) => void;
  onRemove: (item: CartItem) => void;
  onClear: () => void;
  onViewSummary: () => void;
}

/**
 * Sticky bottom bar shown on small screens only. Tap to open the
 * cart as a bottom sheet (also rendered here).
 */
export function CartBar(props: BarProps) {
  const t = pickStrings(props.lang);
  const [open, setOpen] = useState(false);

  const totalCost = useMemo(() => {
    return calculateCartTotals(
      props.items.map((it) => {
        return calculateCartItem(
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
      }),
    ).totalCost;
  }, [props.items]);

  if (props.items.length === 0) return null;

  return (
    <>
      <div className="cart-bar" role="region" aria-label={t.cart}>
        <div className="cart-bar-info">
          <div className="cart-bar-count">
            🛒 {t.cartItems(props.items.length)}
          </div>
          <div className="cart-bar-total">{fmtMoney(totalCost)}</div>
        </div>
        <button
          type="button"
          className="btn btn-primary cart-bar-cta"
          onClick={() => setOpen(true)}
        >
          {t.view}
        </button>
      </div>

      {open && (
        <CartSheet onClose={() => setOpen(false)}>
          <CartList
            {...props}
            onEdit={(it) => {
              props.onEdit(it);
              setOpen(false);
            }}
            onRemove={(it) => {
              props.onRemove(it);
            }}
            onViewSummary={() => {
              setOpen(false);
              props.onViewSummary();
            }}
          />
        </CartSheet>
      )}
    </>
  );
}

function CartSheet({
  onClose,
  children,
}: {
  onClose: () => void;
  children: React.ReactNode;
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  return (
    <div className="sheet-backdrop" onClick={onClose}>
      <div
        className="sheet"
        role="dialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sheet-handle" aria-hidden />
        <button
          type="button"
          className="sheet-close"
          onClick={onClose}
          aria-label="Close"
        >
          ×
        </button>
        <div className="sheet-body">{children}</div>
      </div>
    </div>
  );
}
