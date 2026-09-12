# TRIANGLE BLACK — BACKUP RESTORE PROCEDURE
## Status: VERIFIED (September 12, 2026)
## Test result: PASS ✅

## RESTORE STEPS

### Step 1: Identify latest backup
ls -lh backups/*.sql.gz | sort

### Step 2: Create restore target database
PGPASSWORD=<password> psql -h <host> -p 5432 -U <user> -c
"CREATE DATABASE triangle_black_restore;"
### Step 3: Restore
gunzip -c backups/<latest>.sql.gz |
PGPASSWORD=<password> psql -h <host> -p 5432 -U <user> triangle_black_restore

### Step 4: Verify row counts

PGPASSWORD=<password> psql -h <host> -p 5432 -U <user> triangle_black_restore -c
"SELECT 'work_orders' as tbl, COUNT() FROM work_orders UNION ALL SELECT 'assets', COUNT() FROM assets UNION ALL SELECT 'maintenance_plans', COUNT(*) FROM maintenance_plans;"

### Step 5: Start API against restored DB
DATABASE_URL=postgresql+psycopg2://<user>:<pass>@<host>/triangle_black_restore
.venv/bin/uvicorn src.main:app --host 0.0.0.0 --port 8031

### Step 6: Verify health
curl http://localhost:8031/api/v1/health/live


## VERIFICATION RESULTS (Local Test — Sep 12, 2026)
- Backup: backups/triangle_black_20260910_121127.sql.gz (5.9MB)
- Restore: SUCCESS ✅
- work_orders: 5,489 rows ✅
- assets: 1,653 rows ✅  
- maintenance_plans: 2,454 rows ✅
- DROP DATABASE: SUCCESS ✅

## RTO/RPO (Local)
- RPO: ~2 days (last backup was Sep 10, production is Sep 12)
- RTO: ~5 minutes (restore + verify)
- Production target: RPO < 24h (daily automated backup needed)

## KNOWN GAPS FOR PRODUCTION
- Backup not automated (manual pg_dump only)
- No remote storage (backups are local only)
- No encryption on backup files
- Production will need: cron + S3/remote + encryption + daily verification
