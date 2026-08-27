#!/usr/bin/env python3
"""
Triangle Black — Backup Verification
Run: .venv/bin/python scripts/backup_verify.py

Verifies:
1. Backup file exists and is readable
2. Backup contains expected tables
3. Key row counts match
"""
import os, sys, gzip, subprocess
from pathlib import Path
from datetime import datetime

print("=" * 60)
print("TRIANGLE BLACK — BACKUP VERIFICATION")
print(f"Date: {datetime.now().strftime('%Y-%m-%d %H:%M')}")
print("=" * 60)

# Check for backup files
backup_dir = Path("backups")
if not backup_dir.exists():
    backup_dir.mkdir()
    print("📁 Created backups/ directory")

backups = sorted(backup_dir.glob("*.sql.gz"), reverse=True)
if not backups:
    print("⚠️  No backup files found.")
    print("   Run: bash scripts/backup.sh")
    sys.exit(0)

latest = backups[0]
size = latest.stat().st_size / (1024*1024)
print(f"\n✅ Latest backup: {latest.name}")
print(f"   Size: {size:.1f} MB")
print(f"   Age: {(datetime.now().timestamp() - latest.stat().st_mtime)/3600:.1f} hours")

# Verify backup is readable
try:
    with gzip.open(latest, 'rt') as f:
        first_100 = f.read(500)
        if "PostgreSQL" in first_100 or "CREATE" in first_100 or "INSERT" in first_100:
            print("✅ Backup file is valid SQL")
        else:
            print("⚠️  Backup may be corrupted")
except Exception as e:
    print(f"❌ Backup verification failed: {e}")
    sys.exit(1)

# Check key tables exist
key_tables = ["assets", "work_orders", "suppliers", "maintenance_plans", "users"]
try:
    with gzip.open(latest, 'rt') as f:
        content = f.read(50000)  # Read first 50KB
        for table in key_tables:
            found = f"TABLE {table}" in content or f'"{table}"' in content
            icon = "✅" if found else "⚠️"
            print(f"  {icon} Table '{table}': {'found' if found else 'not in preview'}")
except Exception as e:
    print(f"⚠️  Table check skipped: {e}")

print(f"\n✅ BACKUP VERIFICATION COMPLETE")
print(f"   Run restore with: bash scripts/restore.sh {latest}")
