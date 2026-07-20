#!/usr/bin/env python3
# Seed test project data
import subprocess, uuid, datetime, json

HOTEL = "tb-default-hotel-000000000001"

def sql(q):
    r = subprocess.run(
        f'PGPASSWORD=ai123 psql -U ai -h localhost -d triangle_black -c "{q}"',
        shell=True, capture_output=True, text=True
    )
    return r.returncode == 0, r.stderr

projects = [
    ("Grand Cairo Hotel - Lobby Renovation",    "Lobby fit-out, lighting, flooring",  500000, 65,  "2026-01-15", "2026-09-30", "active"),
    ("Sharm Resort - MEP Overhaul Phase 2",     "Full MEP systems upgrade",          1200000, 40,  "2026-03-01", "2027-02-28", "active"),
    ("Alexandria Inn - Annual Maintenance SLA", "Maintenance contract execution",     180000, 50,  "2026-01-01", "2026-12-31", "active"),
    ("Kempinski Soma Bay - HVAC Upgrade",       "Chiller plant and AHU replacement", 850000, 15,  "2026-06-01", "2027-01-31", "planning"),
    ("Hilton Cairo - Fire Safety Upgrade",      "Fire suppression system renewal",    320000, 100, "2025-09-01", "2026-03-31", "completed"),
]

print("Seeding projects...")
for title, desc, budget, pct, start, end, status in projects:
    pid = str(uuid.uuid4())
    ok, err = sql(
        f"INSERT INTO projects (id, hotel_id, title, description, budget, completion_pct, "
        f"status, start_date, end_date, created_at, updated_at) "
        f"VALUES ('{pid}', '{HOTEL}', '{title}', '{desc}', {budget}, {pct}, "
        f"'{status}', '{start}', '{end}', NOW(), NOW()) ON CONFLICT (id) DO NOTHING;"
    )
    print(f"  {'OK' if ok else 'ERR'}: {title[:40]}")
    if not ok and err: print(f"    {err[:80]}")

# Check count
ok, _ = sql("SELECT count(*) FROM projects;")
print("\nDone. Check: PGPASSWORD=ai123 psql -U ai -h localhost -d triangle_black -c 'SELECT count(*) FROM projects;'")
