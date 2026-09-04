/**
 * Tiny client-side search ranker for the bundled medicine index.
 *
 * No external deps. Ranks by:
 *   1. exact name match
 *   2. name starts with query
 *   3. name contains query as a whole word
 *   4. name contains query as substring
 *   5. generic name contains query
 *   6. manufacturer contains query
 *
 * Ties are broken by: cheaper unit price (lower is better), then shorter name.
 */

interface IndexRow {
  id: number;
  name: string;
  generic: string;
  strength: string;
  form: string;
  manufacturer: string;
  price: number | null;
  generic_id: number;
}

const norm = (s: string) => s.toLowerCase().trim();

function scoreRow(row: IndexRow, q: string): number {
  const name = norm(row.name);
  const gen = norm(row.generic);
  const mfg = norm(row.manufacturer);
  if (name === q) return 1000;
  if (name.startsWith(q)) return 800;
  const re = new RegExp(`\\b${q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`);
  if (re.test(name)) return 600;
  if (name.includes(q)) return 400;
  if (gen === q) return 320;
  if (gen.startsWith(q)) return 280;
  if (gen.includes(q)) return 200;
  if (mfg.includes(q)) return 80;
  return 0;
}

export function rankSearch(
  rows: IndexRow[],
  query: string,
  limit: number,
): IndexRow[] {
  const q = norm(query);
  if (!q) return [];

  const scored: Array<{ row: IndexRow; score: number }> = [];
  for (const row of rows) {
    const s = scoreRow(row, q);
    if (s > 0) scored.push({ row, score: s });
  }

  scored.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    const ap = a.row.price ?? Number.POSITIVE_INFINITY;
    const bp = b.row.price ?? Number.POSITIVE_INFINITY;
    if (ap !== bp) return ap - bp;
    return a.row.name.length - b.row.name.length;
  });

  return scored.slice(0, limit).map((s) => s.row);
}
