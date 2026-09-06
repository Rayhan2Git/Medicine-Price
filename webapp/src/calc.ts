/**
 * Pure calculation engine for the medicine cost cart.
 *
 * Two modes:
 *   - prescription: dose × frequency × duration
 *   - quantity:     user enters total quantity directly
 *
 * Pack info comes from the medicine's `box_size` and `box_price`. When
 * missing, calculations fall back to the unit price (per tablet / ml).
 *
 * No DOM, no React, no fetch — this file is deliberately pure and is
 * the single source of truth for all cost math in the app.
 */

export type CalcMode = "prescription" | "quantity";

export interface CalcInput {
  mode: CalcMode;
  dose: number;            // units per dose (e.g. 1 tablet, 10 ml)
  frequency: number;       // doses per day (e.g. 3)
  duration: number;        // days (e.g. 5)
  manualQuantity: number;  // used when mode === "quantity"
}

export interface PackInfo {
  packSize: number | null;     // units per pack (e.g. 10 tablets)
  packPrice: number | null;    // price for one pack (e.g. ৳12)
}

export interface PriceInfo {
  unitPrice: number | null;    // price per single unit (e.g. ৳1.20)
}

export interface CalcResult {
  // Inputs echoed back for the UI.
  mode: CalcMode;
  dose: number;
  frequency: number;
  duration: number;
  manualQuantity: number;

  // Computed.
  dailyQuantity: number;        // dose × frequency (prescription mode only)
  totalQuantity: number;        // total units required
  packsRequired: number;        // ceil(totalQuantity / packSize)  — 0 if no pack
  purchaseQuantity: number;     // packsRequired × packSize — actual units bought
  purchaseCost: number;         // total cost (BDT)
  perPackCost: number | null;   // price for one pack, if pack info present

  // Validation.
  isValid: boolean;
  errors: string[];

  // Pack availability.
  hasPackInfo: boolean;
}

const ceilDiv = (a: number, b: number): number =>
  Math.max(0, Math.ceil(a / b));

/**
 * Calculate the cost for a single cart item.
 *
 * `unit` and `unitLabel` are only metadata (no math), useful for the UI
 * to render the right unit text ("tablets", "ml", etc.). Math is the
 * same regardless of unit.
 */
export function calculateCartItem(
  input: CalcInput,
  price: PriceInfo,
  pack: PackInfo,
): CalcResult {
  const errors: string[] = [];

  const hasPackInfo =
    pack.packSize != null &&
    pack.packPrice != null &&
    pack.packSize > 0 &&
    pack.packPrice > 0 &&
    price.unitPrice != null &&
    price.unitPrice > 0;

  if (price.unitPrice == null || price.unitPrice <= 0) {
    errors.push("Unit price is missing for this medicine.");
  }

  let totalQuantity = 0;

  if (input.mode === "prescription") {
    const dose = Number.isFinite(input.dose) ? input.dose : 0;
    const frequency = Number.isFinite(input.frequency) ? input.frequency : 0;
    const duration = Number.isFinite(input.duration) ? input.duration : 0;

    if (dose <= 0) errors.push("Dose must be greater than zero.");
    if (frequency <= 0) errors.push("Frequency must be greater than zero.");
    if (duration <= 0) errors.push("Duration must be greater than zero.");

    totalQuantity = dose * frequency * duration;
  } else {
    const q = Number.isFinite(input.manualQuantity) ? input.manualQuantity : 0;
    if (q <= 0) errors.push("Quantity must be greater than zero.");
    totalQuantity = q;
  }

  const isValid = errors.length === 0 && totalQuantity > 0;

  if (!isValid || !hasPackInfo) {
    // Without pack info, fall back to unit-price math. The user
    // pays `totalQuantity × unitPrice` directly.
    return {
      mode: input.mode,
      dose: input.dose,
      frequency: input.frequency,
      duration: input.duration,
      manualQuantity: input.manualQuantity,
      dailyQuantity:
        input.mode === "prescription"
          ? input.dose * input.frequency
          : 0,
      totalQuantity,
      packsRequired: 0,
      purchaseQuantity: totalQuantity,
      purchaseCost:
        price.unitPrice != null ? totalQuantity * price.unitPrice : 0,
      perPackCost: null,
      isValid,
      errors,
      hasPackInfo: false,
    };
  }

  const packSize = pack.packSize as number;
  const packPrice = pack.packPrice as number;

  const packsRequired = ceilDiv(totalQuantity, packSize);
  const purchaseQuantity = packsRequired * packSize;
  const purchaseCost = packsRequired * packPrice;

  return {
    mode: input.mode,
    dose: input.dose,
    frequency: input.frequency,
    duration: input.duration,
    manualQuantity: input.manualQuantity,
    dailyQuantity:
      input.mode === "prescription"
        ? input.dose * input.frequency
        : 0,
    totalQuantity,
    packsRequired,
    purchaseQuantity,
    purchaseCost,
    perPackCost: packPrice,
    isValid,
    errors,
    hasPackInfo: true,
  };
}

/**
 * Aggregate totals across many cart items.
 */
export interface CartTotals {
  itemCount: number;
  totalRequired: number;
  totalPacks: number;
  totalCost: number;
  invalidCount: number;
}

export function calculateCartTotals(items: CalcResult[]): CartTotals {
  let totalRequired = 0;
  let totalPacks = 0;
  let totalCost = 0;
  let invalidCount = 0;
  for (const it of items) {
    if (!it.isValid) {
      invalidCount++;
      continue;
    }
    totalRequired += it.totalQuantity;
    totalPacks += it.packsRequired;
    totalCost += it.purchaseCost;
  }
  return {
    itemCount: items.length,
    totalRequired,
    totalPacks,
    totalCost,
    invalidCount,
  };
}

/**
 * Format a number for display in the cart.
 * - strips trailing .00 for whole numbers
 * - never returns NaN / Infinity
 * - returns the empty-string placeholder for null / undefined
 */
export function fmtQty(n: number | null | undefined): string {
  if (n == null || !Number.isFinite(n)) return "—";
  if (Math.abs(n - Math.round(n)) < 1e-9) return String(Math.round(n));
  return n.toFixed(2).replace(/\.?0+$/, "");
}

export function fmtMoney(n: number | null | undefined): string {
  if (n == null || !Number.isFinite(n)) return "—";
  return `৳${n.toFixed(2)}`;
}
