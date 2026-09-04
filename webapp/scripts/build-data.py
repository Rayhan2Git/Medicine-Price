#!/usr/bin/env python3
"""Build static medicine data JSON files for the webapp from the SQLite DB.

Outputs:
  webapp/public/data/medicines-index.json   (~ 700 KB) — used for search & list
  webapp/public/data/medicines-detail.json  (~ 1.5 MB) — loaded on demand

The webapp uses these as a fallback when no live API is configured.
"""
from __future__ import annotations

import json
import os
import sqlite3
import sys
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parents[2]
DB_PATH = REPO_ROOT / "bd-medicine-app" / "data" / "medicines.db"
OUT_DIR = REPO_ROOT / "webapp" / "public" / "data"


def fetch_rows(db: sqlite3.Connection) -> tuple[list[dict], list[dict]]:
    """Return (index_rows, detail_rows)."""
    cur = db.cursor()

    # Generic name lookup
    generics = {
        gid: name
        for gid, name in cur.execute("SELECT id, name FROM generics").fetchall()
    }

    # Brands
    cols = [
        "id", "generic_id", "name", "strength", "dosage_form",
        "manufacturer", "unit_price", "strip_price", "box_price",
        "strip_size", "box_size",
    ]
    raw = cur.execute(
        f"SELECT {', '.join(cols)} FROM brands ORDER BY name"
    ).fetchall()

    index: list[dict] = []
    details: list[dict] = []

    for row in raw:
        rec = dict(zip(cols, row))
        rec["generic_name"] = generics.get(rec["generic_id"], "")
        rec["generic_id"] = rec["generic_id"]

        # Display price: prefer unit_price; fall back to strip or box
        price = rec.get("unit_price")
        if price is None:
            price = rec.get("strip_price")
        if price is None:
            price = rec.get("box_price")
        rec["price"] = price

        # Index entry: just the bits needed to render a card and search
        index.append({
            "id": rec["id"],
            "name": rec["name"],
            "generic": rec["generic_name"],
            "strength": rec["strength"] or "",
            "form": rec["dosage_form"] or "",
            "manufacturer": rec["manufacturer"] or "",
            "price": rec["price"],
            "generic_id": rec["generic_id"],
        })

        details.append({
            "id": rec["id"],
            "name": rec["name"],
            "generic": rec["generic_name"],
            "generic_id": rec["generic_id"],
            "strength": rec["strength"] or "",
            "form": rec["dosage_form"] or "",
            "manufacturer": rec["manufacturer"] or "",
            "unit_price": rec["unit_price"],
            "strip_price": rec["strip_price"],
            "box_price": rec["box_price"],
            "strip_size": rec["strip_size"],
            "box_size": rec["box_size"],
        })

    return index, details


def main() -> int:
    if not DB_PATH.exists():
        print(f"ERROR: DB not found at {DB_PATH}", file=sys.stderr)
        return 1

    OUT_DIR.mkdir(parents=True, exist_ok=True)

    print(f"Reading {DB_PATH} ...")
    db = sqlite3.connect(DB_PATH)
    index, details = fetch_rows(db)
    db.close()

    index_path = OUT_DIR / "medicines-index.json"
    detail_path = OUT_DIR / "medicines-detail.json"

    with index_path.open("w", encoding="utf-8") as f:
        json.dump(index, f, ensure_ascii=False, separators=(",", ":"))
    with detail_path.open("w", encoding="utf-8") as f:
        json.dump(details, f, ensure_ascii=False, separators=(",", ":"))

    print(f"Wrote {len(index):,} index rows  → {index_path}  ({index_path.stat().st_size / 1024:.0f} KB)")
    print(f"Wrote {len(details):,} detail rows → {detail_path}  ({detail_path.stat().st_size / 1024:.0f} KB)")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
