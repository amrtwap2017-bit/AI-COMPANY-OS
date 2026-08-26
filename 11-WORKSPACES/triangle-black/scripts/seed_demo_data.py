#!/usr/bin/env python3
"""
Triangle Black — Complete Demo Data Seeder
Run with: .venv/bin/python scripts/seed_demo_data.py

Seeds ALL demo data needed for commercial platform demonstration:
1. PM plans linked to assets (all 227 assets)
2. Supplier ratings for top 200 suppliers
3. Completed WOs to improve completion rate

Always idempotent — safe to run multiple times.

VERIFIED DB FACTS:
- maintenance_plans uses 'notes' NOT 'description'
- maintenance_plans.next_due_date is VARCHAR — no DATE cast needed for INSERT
- assets.hotel_id links to maintenance_plans.hotel_id
- suppliers.rating can be 0 (unrated) — only update WHERE rating IS NULL OR rating=0

DB: postgresql+psycopg2://ai:ai123@localhost:5432/triangle_black
"""
import os, sys, uuid, random
from datetime import datetime, date, timedelta
from pathlib import Path

sys.path.insert(0, ".")

# Load .env
env_file = Path(".env")
if env_file.exists():
    for line in env_file.read_text().splitlines():
        if "=" in line and not line.startswith("#"):
            k, _, v = line.partition("=")
            os.environ.setdefault(k.strip(), v.strip())

os.environ.setdefault(
    "DATABASE_URL",
    "postgresql+psycopg2://ai:ai123@localhost:5432/triangle_black"
)

from sqlalchemy import create_engine, text
engine = create_engine(os.environ["DATABASE_URL"])

HOTEL_ID = "tb-default-hotel-000000000001"
TODAY = date.today()

FREQ_MAP = {
    "HVAC": ("monthly", 30), "Electrical": ("quarterly", 90),
    "Plumbing": ("quarterly", 90), "Fire": ("monthly", 30),
    "Fire Fighting": ("monthly", 30), "Elevator": ("quarterly", 90),
    "Generator": ("monthly", 30), "Mechanical": ("monthly", 30),
    "mechanical": ("monthly", 30), "Civil": ("biannual", 180),
    "IT": ("quarterly", 90), "BMS": ("quarterly", 90),
}

def seed_pm_plans(conn):
    """Link all unlinked assets to maintenance plans."""
    unlinked = conn.execute(text("""
        SELECT a.id, a.name, a.category, a.criticality
        FROM assets a
        WHERE a.hotel_id = :h AND a.deleted_at IS NULL
          AND NOT EXISTS (
              SELECT 1 FROM maintenance_plans mp
              WHERE mp.asset_node_id = a.id AND mp.hotel_id = :h
          )
        ORDER BY CASE a.criticality
            WHEN 'critical' THEN 1 WHEN 'high' THEN 2
            WHEN 'medium' THEN 3 ELSE 4 END
    """), {"h": HOTEL_ID}).fetchall()

    print(f"\n📋 Linking {len(unlinked)} unlinked assets to PM plans...")
    linked = 0
    for asset_id, name, category, criticality in unlinked:
        cat = category or ""
        freq, days = FREQ_MAP.get(cat, ("monthly", 30))
        offset = random.choice([-30, -15, 7, 14, 30, 45, 60])
        next_due = (TODAY + timedelta(days=offset)).isoformat()
        now = datetime.now().isoformat()
        plan_id = str(uuid.uuid4())
        try:
            conn.execute(text("""
                INSERT INTO maintenance_plans
                  (id, hotel_id, asset_node_id, title, plan_type,
                   frequency, status, next_due_date, owner, notes,
                   created_at, updated_at)
                VALUES (:id, :hid, :asset_id, :title, 'preventive',
                        :freq, 'active', :next_due, 'Engineering Team',
                        :notes, :now, :now)
                ON CONFLICT DO NOTHING
            """), {
                "id": plan_id, "hid": HOTEL_ID, "asset_id": asset_id,
                "title": f"{cat or 'General'} Maintenance — {name[:30]}",
                "freq": freq, "next_due": next_due,
                "notes": f"PM plan for {cat} asset: {name[:40]}",
                "now": now,
            })
            linked += 1
        except Exception as e:
            pass
    return linked

def seed_supplier_ratings(conn):
    """Rate top 200 suppliers by PO volume."""
    top = conn.execute(text("""
        SELECT s.id, s.risk_level, COUNT(po.id) AS po_count
        FROM suppliers s
        LEFT JOIN purchase_orders po ON po.vendor_id = s.id AND po.hotel_id = :h
        WHERE s.hotel_id = :h AND (s.rating IS NULL OR s.rating = 0)
          AND (s.blacklisted IS NULL OR s.blacklisted = FALSE)
        GROUP BY s.id, s.risk_level
        ORDER BY po_count DESC LIMIT 200
    """), {"h": HOTEL_ID}).fetchall()

    print(f"\n⭐ Rating {len(top)} suppliers...")
    rated = 0
    for sup_id, risk_level, _ in top:
        base = {"low": 4.2, "medium": 3.7, "high": 3.2, "critical": 2.8}.get(
            str(risk_level or "medium").lower(), 3.7)
        rating = round(max(2.5, min(5.0, base + random.uniform(-0.4, 0.5))), 2)
        conn.execute(text("""
            UPDATE suppliers SET rating=:rating, updated_at=NOW()
            WHERE id=:id AND hotel_id=:h AND (rating IS NULL OR rating=0)
        """), {"id": sup_id, "h": HOTEL_ID, "rating": rating})
        rated += 1
    return rated

def seed_completed_wos(conn, count=200):
    """Close oldest low/medium priority open WOs."""
    old_open = conn.execute(text("""
        SELECT id, created_at FROM work_orders
        WHERE hotel_id=:h AND deleted_at IS NULL AND LOWER(status)='open'
        AND LOWER(priority) IN ('low','medium') ORDER BY created_at ASC LIMIT :cnt
    """), {"h": HOTEL_ID, "cnt": count}).fetchall()

    print(f"\n✅ Completing {len(old_open)} open WOs...")
    closed = 0
    for wo_id, created_at in old_open:
        days = random.randint(1, 5)
        completed = (datetime.fromisoformat(str(created_at)[:19]) + timedelta(days=days)).isoformat()
        conn.execute(text("""
            UPDATE work_orders SET status='completed', completed_at=:c,
            updated_at=:c, sla_breached=FALSE WHERE id=:id AND hotel_id=:h
        """), {"id": wo_id, "h": HOTEL_ID, "c": completed})
        closed += 1
    return closed

def main():
    print("=" * 60)
    print("Triangle Black — Complete Demo Data Seeder")
    print(f"Hotel: {HOTEL_ID}")
    print(f"DB:    {os.environ['DATABASE_URL'][:45]}...")
    print("=" * 60)

    with engine.begin() as conn:
        pm = seed_pm_plans(conn)
        ratings = seed_supplier_ratings(conn)
        wos = seed_completed_wos(conn)

        # Final summary
        total_assets = conn.execute(text(
            "SELECT COUNT(*) FROM assets WHERE hotel_id=:h AND deleted_at IS NULL"
        ), {"h": HOTEL_ID}).scalar()
        with_pm = conn.execute(text("""
            SELECT COUNT(DISTINCT a.id) FROM assets a
            JOIN maintenance_plans mp ON mp.asset_node_id=a.id AND mp.hotel_id=:h
            WHERE a.hotel_id=:h AND a.deleted_at IS NULL
        """), {"h": HOTEL_ID}).scalar()
        now_rated = conn.execute(text(
            "SELECT COUNT(*) FROM suppliers WHERE hotel_id=:h AND rating>0"
        ), {"h": HOTEL_ID}).scalar()
        total_supp = conn.execute(text(
            "SELECT COUNT(*) FROM suppliers WHERE hotel_id=:h"
        ), {"h": HOTEL_ID}).scalar()

    print(f"\n{'='*60}")
    print(f"✅ PM plans linked:     {pm} new")
    print(f"✅ Suppliers rated:     {ratings} new ({now_rated}/{total_supp} = {round(now_rated/max(total_supp,1)*100,1)}%)")
    print(f"✅ WOs completed:       {wos} new")
    print(f"✅ Asset PM coverage:   {with_pm}/{total_assets} = {round(with_pm/max(total_assets,1)*100,1)}%")

if __name__ == "__main__":
    main()
