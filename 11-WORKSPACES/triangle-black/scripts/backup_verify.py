#!/usr/bin/env python3
"""Triangle Black — Backup Verification"""
import os, sys, gzip, subprocess
from pathlib import Path
from datetime import datetime

print("=" * 60)
print("TRIANGLE BLACK — BACKUP VERIFICATION")
print(f"Date: {datetime.now().strftime('%Y-%m-%d %H:%M')}")
print("=" * 60)

backup_dir = Path("backups")
backup_dir.mkdir(exist_ok=True)
backups = sorted(backup_dir.glob("*.sql.gz"), reverse=True)

if not backups:
    print("⚠️  No backup files found. Run: bash scripts/backup.sh")
    sys.exit(0)

latest = backups[0]
size = latest.stat().st_size / (1024 * 1024)
age_h = (datetime.now().timestamp() - latest.stat().st_mtime) / 3600

print(f"\n✅ Latest backup : {latest.name}")
print(f"   Size          : {size:.1f} MB")
print(f"   Age           : {age_h:.1f} hours")
print(f"   Backups kept  : {len(backups)}")

# Verify readable
try:
    with gzip.open(latest, 'rt', errors='replace') as f:
        content = f.read()  # read full file
    print(f"✅ Backup readable ({len(content):,} chars)")
except Exception as e:
    print(f"❌ Cannot read backup: {e}")
    sys.exit(1)

# Verify tables
key_tables = ["assets","work_orders","suppliers","maintenance_plans","users",
              "employees","invoices","purchase_orders"]
print("\n📋 Table verification:")
all_ok = True
for table in key_tables:
    found = (f'TABLE {table}' in content or
             f'"{table}"' in content or
             f'COPY {table}' in content or
             f'COPY public.{table}' in content or
             f"INSERT INTO {table}" in content or
             f"INSERT INTO public.{table}" in content)
    icon = "✅" if found else "⚠️"
    if not found:
        all_ok = False
    print(f"  {icon} {table}")

# Row count estimate from COPY lines
print("\n📊 Data size estimates:")
for table in ["assets","work_orders","suppliers"]:
    # Count lines between COPY ... and \. markers
    marker = f"COPY public.{table} " if f"COPY public.{table} " in content else f"COPY {table} "
    if marker in content:
        start = content.index(marker)
        end_marker = content.find('\\.', start)
        if end_marker > 0:
            rows = content[start:end_marker].count('\n') - 1
            print(f"  {table}: ~{rows} rows")

if all_ok:
    print("\n✅ BACKUP FULLY VERIFIED")
else:
    print("\n⚠️  Some tables not found in backup preview")

print(f"\n  Restore: bash scripts/restore.sh {latest}")
print("=" * 60)
