import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { SearchBox } from "../components/SearchBox";
import { MedicineConfigCard } from "../components/MedicineConfigCard";
import { CartList } from "../components/CartList";
import { CartBar } from "../components/CartBar";
import { buildCartItem, type CartItem, useCartContext } from "../cart";
import { pickStrings, type Lang } from "../i18n";
import type { Brand, BrandDetail } from "../types";
import { getMedicineDetail } from "../dataClient";

interface Props {
  lang: Lang;
  onToastAdd: (name: string) => void;
  onToastRemove: (name: string, undo: () => void) => void;
  onToastUpdate: (name: string) => void;
  onToastClear: (undo: () => void) => void;
}

export default function CalculatorPage({
  lang,
  onToastAdd,
  onToastRemove,
  onToastUpdate,
  onToastClear,
}: Props) {
  const t = pickStrings(lang);
  const nav = useNavigate();
  const cart = useCartContext();

  const [selected, setSelected] = useState<Brand | BrandDetail | null>(null);
  const [editing, setEditing] = useState<CartItem | null>(null);
  const lastRemoved = useRef<CartItem | null>(null);
  const preClear = useRef<CartItem[]>([]);

  // If a search-result has incomplete pack info, fetch the detail so
  // the config card can compute pack-cost accurately.
  const ensureFullMedicine = async (b: Brand): Promise<BrandDetail | Brand> => {
    if ((b as BrandDetail).box_size !== undefined) return b;
    try {
      const full = await getMedicineDetail(b.id);
      return full;
    } catch {
      return b;
    }
  };

  const onSelect = async (b: Brand) => {
    setEditing(null);
    setSelected(await ensureFullMedicine(b));
  };

  const onAdd = (args: {
    mode: "prescription" | "quantity";
    dose: number;
    frequency: number;
    duration: number;
    manualQuantity: number;
  }) => {
    if (!selected) return;
    const item = buildCartItem({ medicine: selected, ...args });
    const added = cart.add(item);
    if (added) onToastAdd(item.name);
    setSelected(null);
    setEditing(null);
  };

  const onEdit = (it: CartItem) => {
    setSelected(null);
    setEditing(it);
  };

  const onUpdate = (args: {
    mode: "prescription" | "quantity";
    dose: number;
    frequency: number;
    duration: number;
    manualQuantity: number;
  }) => {
    if (!editing) return;
    cart.update(editing.cartItemId, args);
    onToastUpdate(editing.name);
    setEditing(null);
  };

  const onRemove = (it: CartItem) => {
    lastRemoved.current = it;
    cart.remove(it.cartItemId);
    onToastRemove(it.name, () => {
      if (lastRemoved.current) cart.undo(lastRemoved.current);
    });
  };

  const onClear = () => {
    preClear.current = cart.items;
    cart.clear();
    onToastClear(() => {
      cart.replaceAll(preClear.current);
    });
  };

  // Expose "Add many" (used by the prescription page after OCR)
  useEffect(() => {
    (window as any).__bdmp_addToCart = (items: CartItem[]) => {
      let added = 0;
      for (const it of items) {
        if (cart.add(it)) added++;
      }
      return added;
    };
  }, [cart]);

  // Active config card (either new selection or editing)
  const configCard = useMemo(() => {
    if (editing) {
      // Reconstruct a Brand from the editing cart item.
      const brand: Brand = {
        id: editing.medicineId,
        name: editing.name,
        generic_name: editing.genericName,
        strength: editing.strength,
        dosage_form: editing.dosageForm,
        manufacturer: editing.manufacturer,
        unit_price: editing.unitPrice,
        generic_id: undefined,
      };
      const detail: BrandDetail = {
        ...brand,
        box_size: editing.packSize,
        box_price: editing.packPrice,
      };
      return (
        <MedicineConfigCard
          lang={lang}
          medicine={detail}
          initialValues={{
            mode: editing.mode,
            dose: editing.dose,
            frequency: editing.frequency,
            duration: editing.duration,
            manualQuantity: editing.manualQuantity,
          }}
          primaryActionLabel={t.updateInList}
          onAdd={onUpdate}
          onCancel={() => setEditing(null)}
        />
      );
    }
    if (selected) {
      return (
        <MedicineConfigCard
          lang={lang}
          medicine={selected}
          onAdd={onAdd}
          onCancel={() => setSelected(null)}
        />
      );
    }
    return null;
  }, [editing, selected, lang, t]);

  return (
    <div className="page calc-page">
      <div className="calc-hero">
        <h1 className="calc-title">{t.appName}</h1>
        <p className="calc-subtitle">{t.tagline}</p>
        <SearchBox lang={lang} onSelect={onSelect} />
      </div>

      <div className="calc-grid">
        <div className="calc-left">
          {configCard}
          {!configCard && (
            <div className="calc-hint">
              <span aria-hidden>💊</span> {t.selectMedicine}
            </div>
          )}
          <Disclaimer lang={lang} />
        </div>

        <aside className="calc-right" aria-label={t.cart}>
          <div className="cart-desktop">
            <CartList
              lang={lang}
              items={cart.items}
              onEdit={onEdit}
              onRemove={onRemove}
              onClear={onClear}
              onViewSummary={() => nav("/summary")}
            />
          </div>
        </aside>
      </div>

      {/* Mobile sticky cart bar */}
      <CartBar
        lang={lang}
        items={cart.items}
        onEdit={onEdit}
        onRemove={onRemove}
        onClear={onClear}
        onViewSummary={() => nav("/summary")}
      />
    </div>
  );
}

function Disclaimer({ lang }: { lang: Lang }) {
  const t = pickStrings(lang);
  return (
    <p className="calc-disclaimer">
      <span aria-hidden>⚕️</span> {t.medicalDisclaimer}
    </p>
  );
}
