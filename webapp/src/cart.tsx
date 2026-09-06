/**
 * Cart state — the heart of the new calculator.
 *
 * Persisted to localStorage as `medicine-cart-v1`. The cart holds a list
 * of items, each referencing a medicine by id plus a configuration
 * (dose / frequency / duration OR direct quantity). Same medicine with
 * identical config merges into the same row; same medicine with a
 * different config becomes a separate row.
 *
 * All state changes go through the reducer so we can support undo.
 */

import { createContext, useCallback, useContext, useEffect, useReducer, useRef, useState } from "react";
import type { Brand, BrandDetail } from "./types";
import type { CalcMode } from "./calc";

const STORAGE_KEY = "medicine-cart-v1";

export interface CartItem {
  cartItemId: string;            // stable UUID, set on add
  medicineId: number;

  // Cached medicine metadata (so the cart can render offline / fast)
  name: string;
  genericName?: string;
  strength?: string;
  dosageForm?: string;
  manufacturer?: string;

  // Pack / price info (snapshotted from the brand at add time)
  unitPrice: number | null;
  packSize: number | null;
  packPrice: number | null;

  // Calculation config
  mode: CalcMode;
  dose: number;
  frequency: number;
  duration: number;
  manualQuantity: number;

  addedAt: number;               // ms epoch
}

interface CartState {
  items: CartItem[];
  hydrated: boolean;             // false until first localStorage load
}

type Action =
  | { type: "hydrate"; items: CartItem[] }
  | { type: "add"; item: CartItem }
  | { type: "update"; cartItemId: string; patch: Partial<CartItem> }
  | { type: "remove"; cartItemId: string }
  | { type: "clear" }
  | { type: "replace"; items: CartItem[] };

function reducer(state: CartState, action: Action): CartState {
  switch (action.type) {
    case "hydrate":
      return { items: action.items, hydrated: true };
    case "add": {
      // Merge if an identical config already exists.
      const existing = state.items.find(
        (it) =>
          it.medicineId === action.item.medicineId &&
          it.mode === action.item.mode &&
          it.dose === action.item.dose &&
          it.frequency === action.item.frequency &&
          it.duration === action.item.duration &&
          it.manualQuantity === action.item.manualQuantity,
      );
      if (existing) {
        return state; // already in cart, no change
      }
      return { ...state, items: [...state.items, action.item] };
    }
    case "update":
      return {
        ...state,
        items: state.items.map((it) =>
          it.cartItemId === action.cartItemId ? { ...it, ...action.patch } : it,
        ),
      };
    case "remove":
      return {
        ...state,
        items: state.items.filter((it) => it.cartItemId !== action.cartItemId),
      };
    case "clear":
      return { ...state, items: [] };
    case "replace":
      return { ...state, items: action.items };
  }
}

function uuid(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `id-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function loadFromStorage(): CartItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    // Defensive: drop anything that doesn't look like a CartItem.
    return parsed.filter(
      (it): it is CartItem =>
        it &&
        typeof it === "object" &&
        typeof it.cartItemId === "string" &&
        typeof it.medicineId === "number",
    );
  } catch {
    return [];
  }
}

function saveToStorage(items: CartItem[]): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {
    /* quota or private mode — ignore */
  }
}

/**
 * Build a CartItem from a medicine record + a configuration.
 * Strips fields the cart doesn't need.
 */
export function buildCartItem(args: {
  medicine: Brand | BrandDetail;
  mode: CalcMode;
  dose: number;
  frequency: number;
  duration: number;
  manualQuantity: number;
}): CartItem {
  const { medicine, mode, dose, frequency, duration, manualQuantity } = args;
  const detail = medicine as BrandDetail;
  return {
    cartItemId: uuid(),
    medicineId: medicine.id,
    name: medicine.name,
    genericName: medicine.generic_name,
    strength: medicine.strength,
    dosageForm: medicine.dosage_form,
    manufacturer: medicine.manufacturer,
    unitPrice: medicine.unit_price ?? null,
    packSize: detail.box_size ?? null,
    packPrice: detail.box_price ?? null,
    mode,
    dose,
    frequency,
    duration,
    manualQuantity,
    addedAt: Date.now(),
  };
}

export interface UseCart {
  items: CartItem[];
  hydrated: boolean;
  add: (item: CartItem) => boolean;        // returns true if added, false if merged
  update: (cartItemId: string, patch: Partial<CartItem>) => void;
  remove: (cartItemId: string) => CartItem | null;  // returns removed item for undo
  clear: () => void;
  undo: (item: CartItem) => void;
  replaceAll: (items: CartItem[]) => void;
}

export function useCart(): UseCart {
  const [state, dispatch] = useReducer(reducer, { items: [], hydrated: false });

  // Hydrate from localStorage on mount (client only).
  useEffect(() => {
    const items = loadFromStorage();
    dispatch({ type: "hydrate", items });
  }, []);

  // Persist on every change after hydration.
  useEffect(() => {
    if (!state.hydrated) return;
    saveToStorage(state.items);
  }, [state.items, state.hydrated]);

  const itemsRef = useRef(state.items);
  itemsRef.current = state.items;

  const add = useCallback(
    (item: CartItem): boolean => {
      const existing = itemsRef.current.find(
        (it) =>
          it.medicineId === item.medicineId &&
          it.mode === item.mode &&
          it.dose === item.dose &&
          it.frequency === item.frequency &&
          it.duration === item.duration &&
          it.manualQuantity === item.manualQuantity,
      );
      if (existing) return false;
      dispatch({ type: "add", item });
      return true;
    },
    [],
  );

  const update = useCallback(
    (cartItemId: string, patch: Partial<CartItem>) => {
      dispatch({ type: "update", cartItemId, patch });
    },
    [],
  );

  const remove = useCallback(
    (cartItemId: string): CartItem | null => {
      const it = itemsRef.current.find((x) => x.cartItemId === cartItemId);
      dispatch({ type: "remove", cartItemId });
      return it ?? null;
    },
    [],
  );

  const clear = useCallback(() => dispatch({ type: "clear" }), []);
  const undo = useCallback(
    (item: CartItem) => dispatch({ type: "add", item }),
    [],
  );
  const replaceAll = useCallback(
    (items: CartItem[]) => dispatch({ type: "replace", items }),
    [],
  );

  return {
    items: state.items,
    hydrated: state.hydrated,
    add,
    update,
    remove,
    clear,
    undo,
    replaceAll,
  };
}

/**
 * Single source of truth for the cart. Wrap the app in <CartProvider> and
 * call `useCartContext()` from any page/component. Keeps the cart state
 * consistent across routes (calculator, prescription, summary).
 */
const CartCtx = createContext<UseCart | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const cart = useCart();
  return <CartCtx.Provider value={cart}>{children}</CartCtx.Provider>;
}

export function useCartContext(): UseCart {
  const ctx = useContext(CartCtx);
  if (!ctx) {
    throw new Error("useCartContext must be used inside a <CartProvider>");
  }
  return ctx;
}

/**
 * Lightweight toast queue. Components elsewhere in the tree push messages,
 * components here render them. Plain useState — no library.
 */
export interface Toast {
  id: string;
  text: string;
  action?: { label: string; onClick: () => void };
  ttl: number; // ms
}

export function useToasts() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const push = useCallback(
    (text: string, action?: Toast["action"], ttl = 3500) => {
      const id = uuid();
      setToasts((cur) => [...cur, { id, text, action, ttl }]);
      window.setTimeout(() => {
        setToasts((cur) => cur.filter((t) => t.id !== id));
      }, ttl);
    },
    [],
  );

  const dismiss = useCallback(
    (id: string) => setToasts((cur) => cur.filter((t) => t.id !== id)),
    [],
  );

  return { toasts, push, dismiss };
}
