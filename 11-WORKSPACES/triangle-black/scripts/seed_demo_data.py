#!/usr/bin/env python3
"""
Triangle Black — Demo Data Seeder
Run with: .venv/bin/python scripts/seed_demo_data.py

Seeds: PM plans for demo tenant
Always idempotent — safe to run multiple times.

VERIFIED maintenance_plans columns:
  id, asset_node_id, title, plan_type, frequency,
  next_due_date, status, owner, notes, created_at, updated_at,
  next_due_ts, hotel_id
  NO 'description' column — uses 'notes' instead
"""
import os, sys, uuid
from datetime import datetime, date, timedelta
from pathlib import Path

sys.path.insert(0, ".")

# Load .env if present
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


def seed_pm_plans(conn):
    # Get actual columns
    cols = [r[0] for r in conn.execute(text("""
        SELECT column_name FROM information_schema.columns
        WHERE table_name = 'maintenance_plans'
    """)).fetchall()]
    print(f"  Columns: {cols}")

    # maintenance_plans uses 'notes' not 'description', 'plan_type' not 'category'
    plans = [
        ("HVAC Monthly Filter Check",    "monthly",   "Inspect and replace HVAC filters across all zones",           -15, "HVAC"),
        ("Elevator Safety Inspection",   "quarterly", "Full elevator safety inspection per Egyptian code",            -45, "Elevator"),
        ("Fire Suppression System Test", "monthly",   "Test all fire suppression heads and sprinkler pressure",         5, "Fire Safety"),
        ("Generator Load Test",          "monthly",   "Run generator under 75% load for 2 hours, check fuel levels",  -30, "Generator"),
        ("Pool Chemical Balance",        "weekly",    "Test and adjust chlorine, pH and alkalinity levels",              2, "Pool"),
        ("Electrical Panel Inspection",  "quarterly", "Inspect all distribution panels, check for overheating",         14, "Electrical"),
        ("Plumbing Pressure Test",       "biannual",  "Full building pressure test, check for leaks",                   60, "Plumbing"),
        ("Kitchen Equipment Service",    "monthly",   "Deep clean and lubricate all commercial kitchen equipment",     -10, "Kitchen"),
        ("Roof Drain Clearance",         "monthly",   "Clear all roof drains, inspect waterproofing membrane",           7, "Civil"),
        ("BMS Calibration Check",        "quarterly", "Calibrate all Building Management System sensors",               30, "BMS"),
    ]

    success = 0
    print("\n📋 Seeding PM Plans...")
    for title, freq, notes, day_offset, owner in plans:
        plan_id = str(uuid.uuid4())
        next_due = (TODAY + timedelta(days=day_offset)).isoformat()
        now_ts = datetime.now().isoformat()

        # Only use verified columns
        insert_cols = ["id", "hotel_id", "title", "frequency", "status",
                       "plan_type", "created_at", "updated_at"]
        insert_vals = [plan_id, HOTEL_ID, title, freq, "active",
                       "preventive", now_ts, now_ts]

        if "notes" in cols:
            insert_cols.append("notes")
            insert_vals.append(notes)

        if "owner" in cols:
            insert_cols.append("owner")
            insert_vals.append(owner)

        if "next_due_date" in cols:
            insert_cols.append("next_due_date")
            insert_vals.append(next_due)

        col_str = ", ".join(insert_cols)
        val_str = ", ".join([f":col_{i}" for i in range(len(insert_cols))])
        params = {f"col_{i}": v for i, v in enumerate(insert_vals)}

        try:
            r = conn.execute(text(
                f"INSERT INTO maintenance_plans ({col_str}) "
                f"VALUES ({val_str}) ON CONFLICT DO NOTHING"
            ), params)
            icon = "✅" if r.rowcount > 0 else "⚠️"
            print(f"  {icon} {title[:50]} | due:{next_due}")
            if r.rowcount > 0:
                success += 1
        except Exception as e:
            print(f"  🔴 {title[:50]}")
            print(f"     ERR: {str(e)[:120]}")

    return success


def main():
    print("=" * 60)
    print("Triangle Black — Demo Data Seeder")
    print(f"Hotel: {HOTEL_ID}")
    print(f"Date:  {TODAY}")
    print("=" * 60)

    with engine.begin() as conn:
        pm_count = seed_pm_plans(conn)

    print(f"\n✅ Complete — PM plans seeded: {pm_count}/10")


if __name__ == "__main__":
    main()
