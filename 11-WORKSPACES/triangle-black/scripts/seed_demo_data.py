#!/usr/bin/env python3
"""
Triangle Black — Demo Data Seeder
Run with: .venv/bin/python scripts/seed_demo_data.py

Seeds: PM plans for demo tenant
Always idempotent — safe to run multiple times.
Credentials: read from .env or defaults to ai:ai123
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

# Default to discovered credentials
os.environ.setdefault(
    "DATABASE_URL",
    "postgresql+psycopg2://ai:ai123@localhost:5432/triangle_black"
)

from sqlalchemy import create_engine, text

engine = create_engine(os.environ["DATABASE_URL"])
HOTEL_ID = "tb-default-hotel-000000000001"
TODAY = date.today()


def seed_pm_plans(conn):
    cols = [r[0] for r in conn.execute(text("""
        SELECT column_name FROM information_schema.columns
        WHERE table_name = 'maintenance_plans'
    """)).fetchall()]

    plans = [
        ("HVAC Monthly Filter Check",    "monthly",   "Inspect and replace HVAC filters across all zones",           -15),
        ("Elevator Safety Inspection",   "quarterly", "Full elevator safety inspection per Egyptian code",            -45),
        ("Fire Suppression System Test", "monthly",   "Test all fire suppression heads and sprinkler pressure",         5),
        ("Generator Load Test",          "monthly",   "Run generator under 75% load for 2 hours, check fuel levels",  -30),
        ("Pool Chemical Balance",        "weekly",    "Test and adjust chlorine, pH and alkalinity levels",              2),
        ("Electrical Panel Inspection",  "quarterly", "Inspect all distribution panels, check for overheating",         14),
        ("Plumbing Pressure Test",       "biannual",  "Full building pressure test, check for leaks",                   60),
        ("Kitchen Equipment Service",    "monthly",   "Deep clean and lubricate all commercial kitchen equipment",     -10),
        ("Roof Drain Clearance",         "monthly",   "Clear all roof drains, inspect waterproofing membrane",           7),
        ("BMS Calibration Check",        "quarterly", "Calibrate all Building Management System sensors",               30),
    ]

    success = 0
    print("\n📋 Seeding PM Plans...")
    for title, freq, desc, day_offset in plans:
        plan_id = str(uuid.uuid4())
        next_due = (TODAY + timedelta(days=day_offset)).isoformat()
        now_ts = datetime.now().isoformat()

        base_cols = ["id", "hotel_id", "title", "description",
                     "frequency", "status", "created_at", "updated_at"]
        base_vals = [plan_id, HOTEL_ID, title, desc, freq, "active", now_ts, now_ts]

        if "next_due_date" in cols:
            base_cols.append("next_due_date")
            base_vals.append(next_due)

        col_str = ", ".join(base_cols)
        val_str = ", ".join([f":col_{i}" for i in range(len(base_cols))])
        params = {f"col_{i}": v for i, v in enumerate(base_vals)}

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
            print(f"  🔴 {title[:50]} | {str(e)[:80]}")

    return success


def main():
    print("=" * 60)
    print("Triangle Black — Demo Data Seeder")
    print(f"Hotel: {HOTEL_ID}")
    print(f"Date:  {TODAY}")
    print(f"DB:    {os.environ['DATABASE_URL'][:50]}...")
    print("=" * 60)

    with engine.begin() as conn:
        pm_count = seed_pm_plans(conn)

    print(f"\n✅ Complete — PM plans seeded: {pm_count}/10")
    print("Run: .venv/bin/python scripts/seed_demo_data.py")


if __name__ == "__main__":
    main()
