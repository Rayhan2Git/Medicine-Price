/**
 * Dosage form → unit mapping. The medicine's `dosage_form` (e.g. "Tablet",
 * "Syrup") is matched against a small table to determine:
 *   - the canonical unit (singular + plural)
 *   - whether the unit is a count (tablet, capsule) or a volume (ml)
 *   - sensible defaults for the dose / step / duration fields
 *
 * The mapping is intentionally simple — anything we don't recognise falls
 * back to a generic "unit" pair. No medicine is hidden because of an
 * unmapped form.
 */

export type UnitKind = "count" | "volume" | "weight" | "generic";

export interface UnitSpec {
  kind: UnitKind;
  singular: string;       // "tablet", "ml", "g"
  plural: string;         // "tablets", "ml", "g"
  decimals: 0 | 1 | 2;    // how many decimals the dose input should allow
  defaultDose: number;
  defaultFrequency: number;
  defaultDuration: number;
  // English label for the pack ("10 tablets / pack")
  packNoun: string;       // "tablets", "ml", "capsules"
}

const TABLET_LIKE: UnitSpec = {
  kind: "count",
  singular: "tablet",
  plural: "tablets",
  decimals: 0,
  defaultDose: 1,
  defaultFrequency: 3,
  defaultDuration: 5,
  packNoun: "tablets",
};

const CAPSULE_LIKE: UnitSpec = {
  kind: "count",
  singular: "capsule",
  plural: "capsules",
  decimals: 0,
  defaultDose: 1,
  defaultFrequency: 2,
  defaultDuration: 7,
  packNoun: "capsules",
};

const SYRUP_LIKE: UnitSpec = {
  kind: "volume",
  singular: "ml",
  plural: "ml",
  decimals: 1,
  defaultDose: 10,
  defaultFrequency: 3,
  defaultDuration: 5,
  packNoun: "ml",
};

const DROPS_LIKE: UnitSpec = {
  kind: "volume",
  singular: "drop",
  plural: "drops",
  decimals: 0,
  defaultDose: 5,
  defaultFrequency: 3,
  defaultDuration: 5,
  packNoun: "drops",
};

const INJECTION_LIKE: UnitSpec = {
  kind: "volume",
  singular: "ml",
  plural: "ml",
  decimals: 1,
  defaultDose: 1,
  defaultFrequency: 2,
  defaultDuration: 7,
  packNoun: "ml",
};

const CREAM_LIKE: UnitSpec = {
  kind: "weight",
  singular: "g",
  plural: "g",
  decimals: 0,
  defaultDose: 1,
  defaultFrequency: 2,
  defaultDuration: 7,
  packNoun: "g",
};

const INHALER_LIKE: UnitSpec = {
  kind: "count",
  singular: "puff",
  plural: "puffs",
  decimals: 0,
  defaultDose: 1,
  defaultFrequency: 2,
  defaultDuration: 30,
  packNoun: "puffs",
};

const SACHET_LIKE: UnitSpec = {
  kind: "count",
  singular: "sachet",
  plural: "sachets",
  decimals: 0,
  defaultDose: 1,
  defaultFrequency: 2,
  defaultDuration: 7,
  packNoun: "sachets",
};

const SUPpository_LIKE: UnitSpec = {
  kind: "count",
  singular: "suppository",
  plural: "suppositories",
  decimals: 0,
  defaultDose: 1,
  defaultFrequency: 2,
  defaultDuration: 5,
  packNoun: "suppositories",
};

const GENERIC: UnitSpec = {
  kind: "generic",
  singular: "unit",
  plural: "units",
  decimals: 0,
  defaultDose: 1,
  defaultFrequency: 2,
  defaultDuration: 7,
  packNoun: "units",
};

const RULES: Array<{ test: RegExp; spec: UnitSpec }> = [
  // Tablets — the largest category
  { test: /\btablet\b/i, spec: TABLET_LIKE },
  { test: /effervescent.*granul/i, spec: SACHET_LIKE },
  // Capsules
  { test: /\bcapsule\b/i, spec: CAPSULE_LIKE },
  // Syrups / suspensions / oral solutions — volume
  { test: /syrup|suspension|oral solution|oral paste|oral powder|oral granules|effervescent/i, spec: SYRUP_LIKE },
  { test: /powder for/i, spec: SYRUP_LIKE },
  // Drops
  { test: /drops?\b|nasal|ophthalmic|ear drop/i, spec: DROPS_LIKE },
  // Injections
  { test: /\binjection\b|\binject\b|infusion/i, spec: INJECTION_LIKE },
  // Creams / ointments / gels
  { test: /cream|ointment|gel|lotion|shampoo|scalp|nail|hand rub/i, spec: CREAM_LIKE },
  // Inhalers
  { test: /inhaler|nebulis/i, spec: INHALER_LIKE },
  // Suppositories
  { test: /suppository/i, spec: SUPpository_LIKE },
  // Sprays
  { test: /spray/i, spec: DROPS_LIKE },
  // Sachets
  { test: /sachet/i, spec: SACHET_LIKE },
];

export function inferUnit(dosageForm: string | null | undefined): UnitSpec {
  if (!dosageForm) return GENERIC;
  for (const rule of RULES) {
    if (rule.test.test(dosageForm)) return rule.spec;
  }
  return GENERIC;
}

export const GENERIC_UNIT: UnitSpec = GENERIC;
