import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  calculateCartItem,
  calculateCartTotals,
  fmtMoney,
  fmtQty,
} from "../calc";
import type { CartItem } from "../cart";
import { inferUnit } from "../units";
import { pickStrings, type Lang } from "../i18n";

interface Props {
  lang: Lang;
  items: CartItem[];
}

export default function CartSummaryPage({ lang, items }: Props) {
  const t = pickStrings(lang);
  const [copied, setCopied] = useState(false);

  const rows = useMemo(
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

  const totals = useMemo(
    () => calculateCartTotals(rows.map((r) => r.calc)),
    [rows],
  );

  const shareText = useMemo(() => buildShareText(rows, totals, lang), [rows, totals, lang]);

  if (items.length === 0) {
    return (
      <div className="page">
        <div className="empty-state">
          <div className="icon">🛒</div>
          <h3>{t.cartEmpty}</h3>
          <p>{t.cartEmptyHint}</p>
          <Link to="/" className="btn btn-primary">
            {t.cartEmptyCta}
          </Link>
        </div>
      </div>
    );
  }

  const printPage = () => {
    if (typeof window !== "undefined") window.print();
  };

  const copyShare = async () => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(shareText);
      } else {
        // Fallback for older browsers
        const ta = document.createElement("textarea");
        ta.value = shareText;
        document.body.appendChild(ta);
        ta.select();
        document.execCommand("copy");
        document.body.removeChild(ta);
      }
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      /* ignore */
    }
  };

  const shareNative = async () => {
    if (typeof navigator !== "undefined" && typeof navigator.share === "function") {
      try {
        await navigator.share({ title: t.shareTitle, text: shareText });
      } catch {
        /* user cancelled */
      }
    } else {
      await copyShare();
    }
  };

  const today = new Date().toLocaleDateString(
    lang === "bn" ? "bn-BD" : "en-GB",
    { year: "numeric", month: "long", day: "numeric" },
  );

  return (
    <div className="page summary-page">
      <div className="summary-head no-print">
        <h1>{t.summaryTitle}</h1>
        <div className="summary-actions">
          <button type="button" className="btn btn-ghost" onClick={printPage}>
            🖨 {t.print}
          </button>
          <button type="button" className="btn btn-ghost" onClick={copyShare}>
            📋 {copied ? t.copied : t.copy}
          </button>
          <button type="button" className="btn btn-primary" onClick={shareNative}>
            📤 {t.share}
          </button>
        </div>
      </div>

      <div className="summary-doc">
        <div className="summary-doc-head">
          <div className="summary-doc-title">{t.summaryTitle}</div>
          <div className="summary-doc-date">{t.printDate(today)}</div>
        </div>

        <table className="summary-table">
          <thead>
            <tr>
              <th>{t.printTableMedicine}</th>
              <th>{t.printTableDose}</th>
              <th>{t.printTableFrequency}</th>
              <th>{t.printTableDuration}</th>
              <th>{t.printTableRequired}</th>
              <th className="num">{t.printTableCost}</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(({ item, calc, unit }) => (
              <tr key={item.cartItemId}>
                <td>
                  <div className="sum-name">
                    {item.name}
                    {item.strength && (
                      <span className="sum-strength"> {item.strength}</span>
                    )}
                  </div>
                  <div className="sum-meta">
                    {item.dosageForm && <span>{item.dosageForm}</span>}
                    {item.genericName && <> · {item.genericName}</>}
                  </div>
                </td>
                <td>
                  {item.mode === "prescription"
                    ? `${fmtQty(item.dose)} ${unit.singular}`
                    : "—"}
                </td>
                <td>
                  {item.mode === "prescription"
                    ? `${fmtQty(item.frequency)}${t.frequencyPerDay}`
                    : "—"}
                </td>
                <td>
                  {item.mode === "prescription"
                    ? `${fmtQty(item.duration)} ${t.days}`
                    : "—"}
                </td>
                <td>
                  {calc.hasPackInfo && (
                    <>
                      {fmtQty(calc.packsRequired)} × {unit.packNoun}-pack
                      <br />
                    </>
                  )}
                  <span className="sum-sub">
                    {fmtQty(calc.totalQuantity)} {unit.plural}
                  </span>
                </td>
                <td className="num">
                  {calc.isValid ? fmtMoney(calc.purchaseCost) : "—"}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <td colSpan={5} className="sum-total-label">
                {t.printTotal}
              </td>
              <td className="num sum-total-value">{fmtMoney(totals.totalCost)}</td>
            </tr>
          </tfoot>
        </table>

        <p className="summary-disclaimer">{t.printDisclaimer}</p>
      </div>
    </div>
  );
}

function buildShareText(
  rows: Array<{ item: CartItem; calc: ReturnType<typeof calculateCartItem>; unit: ReturnType<typeof inferUnit> }>,
  totals: ReturnType<typeof calculateCartTotals>,
  lang: Lang,
): string {
  const t = pickStrings(lang);
  const lines: string[] = [t.summaryTitle, ""];
  for (const { item, calc, unit } of rows) {
    const head = `${item.name}${item.strength ? " " + item.strength : ""}`;
    lines.push(head);
    if (item.mode === "prescription") {
      lines.push(
        `${fmtQty(item.dose)} ${unit.singular} × ${fmtQty(item.frequency)} / day × ${fmtQty(item.duration)} days`,
      );
      lines.push(`${fmtQty(calc.totalQuantity)} ${unit.plural}`);
    } else {
      lines.push(`${fmtQty(item.manualQuantity)} ${unit.plural}`);
    }
    if (calc.hasPackInfo) {
      lines.push(
        `${fmtQty(calc.packsRequired)} × ${unit.packNoun}-pack (${fmtMoney(calc.purchaseCost)})`,
      );
    } else {
      lines.push(fmtMoney(calc.purchaseCost));
    }
    lines.push("");
  }
  lines.push(`${t.printTotal}: ${fmtMoney(totals.totalCost)}`);
  return lines.join("\n");
}
