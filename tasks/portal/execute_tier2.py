#!/usr/bin/env python3
"""
SPRINT 9 TIER 2 EXECUTOR
Status: Pages already built in previous step.
This script verifies they exist and runs the smoke test.
"""
import os, subprocess, json

PORTAL = "/home/amr/AI-COMPANY-OS/11-WORKSPACES/triangle-black/portal"
ROOT   = "/home/amr/AI-COMPANY-OS"

TIER2_PAGES = [
    ("maintenance/schedule",           "app/(app)/(enterprise)/maintenance/schedule/page.tsx"),
    ("analytics/trends",               "app/(app)/(enterprise)/analytics/trends/page.tsx"),
    ("executive/portfolio",            "app/(app)/(enterprise)/executive/portfolio/page.tsx"),
    ("supply-chain/purchase-requests", "app/(app)/(enterprise)/supply-chain/purchase-requests/page.tsx"),
    ("executive/reports",              "app/(app)/(enterprise)/executive/reports/page.tsx"),
]

print("=" * 60)
print("TIER 2 VERIFICATION")
print("=" * 60)

all_ok = True
for label, rel in TIER2_PAGES:
    full = PORTAL + "/" + rel
    exists = os.path.exists(full)
    size   = os.path.getsize(full) if exists else 0
    status = "OK (" + str(size) + " bytes)" if exists and size > 200 else "MISSING or EMPTY"
    icon   = "OK" if exists and size > 200 else "XX"
    print(f"[{icon}] {label:<40} {status}")
    if not (exists and size > 200):
        all_ok = False

print()
if all_ok:
    print("All Tier 2 pages present. Running smoke test...")
    r = subprocess.run(
        ["python3", ROOT + "/tasks/portal/st001_smoke_test.py"],
        capture_output=True, text=True
    )
    for line in r.stdout.split("\n")[-8:]:
        if line.strip(): print(line)
else:
    print("Some Tier 2 pages missing.")
    print("They were built in the previous step.")
    print("Re-run the Tier 2 builder if needed.")
