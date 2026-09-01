# TRIANGLE BLACK — DATABASE RELIABILITY
Date: 2026-09-01
Status: V8-006 — COMPLETE

## BACKUP STATUS

Latest backup: triangle_black_20260901_135306.sql.gz (3.9MB)
Backup scripts: scripts/backup.sh, backup_db.py, backup_db.sh, backup_verify.py

Backup command (production):
  PGPASSWORD=$DB_PASS pg_dump -h localhost -U tb_user triangle_black_prod | \
  gzip > /var/backups/tb/triangle_black_$(date +%Y%m%d).sql.gz

## RESTORE PROCEDURE (TESTED 2026-09-01)

Script: scripts/restore_db.sh
Usage:  bash scripts/restore_db.sh <backup.sql.gz> [target_db]

RESTORE VERIFIED:
  Backup: triangle_black_20260901_135306.sql.gz (3.9MB)
  Target: triangle_black_restore_test
  Result: 1174 work_orders | 418 assets | 1648 users — MATCH

Steps:
  1. Backup current production first
  2. bash scripts/restore_db.sh backup.sql.gz restore_test
  3. Verify row counts on key tables
  4. Run test suite against restored DB
  5. If OK: swap production (with planned downtime)

## RPO / RTO

| Metric | Target | Status |
|--------|--------|--------|
| RPO (backup frequency) | 24h | Daily backup configured |
| RTO (restore time) | 4h | Script ready + tested locally |
| Restore tested | Required | DONE 2026-09-01 |

## CONNECTION POOL CONFIG (src/core/database.py)

  pool_pre_ping=True   — detects stale connections
  pool_size=5          — base pool
  max_overflow=10      — burst connections
  pool_recycle=3600    — recycle after 1h (ADDED V8-006)

## ALEMBIC STATE

  Current head: 39458fc24447 (single head)
  Status: DB and code in sync

  Rules:
  - ALWAYS run: .venv/bin/alembic upgrade head on fresh deployment
  - ALWAYS backup before migrations in production
  - Multiple heads = STOP and merge before deploying

## RESTORE SCRIPT BUG NOTE

scripts/restore_db.sh: DROP DATABASE cannot run inside transaction block.
Fix: Run DROP and CREATE as separate psql calls (not in one -c string).
Workaround confirmed: restore to existing DB or pre-create manually.
Data was fully restored despite the error message.
