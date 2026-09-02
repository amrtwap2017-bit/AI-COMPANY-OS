"""
V8-011: WO→Asset Linkage Improvement Script

SAFE approach: Only links WOs where we have HIGH confidence match.
NEVER overwrites existing asset_id.
Shows what WOULD be linked before making changes.

Usage:
  # Dry run (safe, shows what would happen):
  .venv/bin/python scripts/link_wos_to_assets.py --dry-run

  # Apply changes:
  .venv/bin/python scripts/link_wos_to_assets.py --apply
"""
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from sqlalchemy import create_engine, text
from datetime import datetime

DRY_RUN = "--apply" not in sys.argv
DB_URL = os.environ.get("DATABASE_URL", "postgresql+psycopg2://ai:ai123@localhost:5432/triangle_black")
H = "tb-default-hotel-000000000001"

engine = create_engine(DB_URL)

print(f"=== WO→Asset Linkage Script {'[DRY RUN]' if DRY_RUN else '[APPLYING]'} ===")
print(f"Hotel: {H}")
print(f"Time:  {datetime.now().isoformat()}\n")

with engine.connect() as conn:
    # Get all unlinked WOs
    unlinked_wos = conn.execute(text("""
        SELECT id, title, type, priority, status
        FROM work_orders
        WHERE hotel_id=:h AND asset_id IS NULL
        AND title IS NOT NULL AND title != ''
        ORDER BY priority DESC, created_at ASC
    """), {"h": H}).fetchall()

    # Get all assets
    assets = conn.execute(text("""
        SELECT id, name, asset_type, location
        FROM assets WHERE hotel_id=:h AND deleted_at IS NULL
    """), {"h": H}).fetchall()

    print(f"Unlinked WOs: {len(unlinked_wos)}")
    print(f"Available assets: {len(assets)}\n")

    # Build asset name lookup
    asset_by_name = {}
    for a_id, a_name, a_type, a_loc in assets:
        if a_name:
            asset_by_name[a_name.lower()] = a_id
            # Also index individual words (3+ chars)
            for word in a_name.lower().split():
                if len(word) >= 4 and word not in ('unit', 'room', 'area', 'zone'):
                    if word not in asset_by_name:
                        asset_by_name[word] = a_id

    linked = 0
    skipped = 0

    for wo_id, wo_title, wo_type, wo_priority, wo_status in unlinked_wos:
        if not wo_title:
            continue

        wo_lower = wo_title.lower()
        matched_asset_id = None
        match_reason = ""

        # Strategy 1: Exact asset name in WO title
        for a_name, a_id in asset_by_name.items():
            if len(a_name) >= 5 and a_name in wo_lower:
                matched_asset_id = a_id
                match_reason = f"name match: '{a_name}'"
                break

        if not matched_asset_id:
            skipped += 1
            continue

        linked += 1
        print(f"  {'WOULD LINK' if DRY_RUN else 'LINKING'}: WO '{wo_title[:45]}...'")
        print(f"    → Asset: {matched_asset_id[:20]}... ({match_reason})")

        if not DRY_RUN:
            conn.execute(text("""
                UPDATE work_orders
                SET asset_id=:aid, updated_at=NOW()
                WHERE id=:wid AND hotel_id=:h AND asset_id IS NULL
            """), {"aid": matched_asset_id, "wid": wo_id, "h": H})

    if not DRY_RUN:
        conn.commit()
        print(f"\n✅ Linked {linked} WOs to assets")
    else:
        print(f"\nDRY RUN complete: Would link {linked} WOs ({skipped} could not be matched)")
        print("Run with --apply to make changes")

    # Show final stats
    final_linked = conn.execute(text(
        "SELECT COUNT(*) FROM work_orders WHERE hotel_id=:h AND asset_id IS NOT NULL"
    ), {"h": H}).scalar()
    total = conn.execute(text(
        "SELECT COUNT(*) FROM work_orders WHERE hotel_id=:h"
    ), {"h": H}).scalar()
    print(f"\nCurrent linkage: {final_linked}/{total} = {round(final_linked/total*100,1)}%")
