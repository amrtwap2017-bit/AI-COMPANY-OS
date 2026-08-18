# Triangle Black Backup and Restore Runbook

## Database

Engine: PostgreSQL
Connection: DATABASE_URL environment variable
Schema: Single database, Alembic-managed migrations

## Backup Procedure

Run: bash scripts/backup_db.sh
Output: backups/triangle_black_YYYYMMDD_HHMMSS.sql.gz

## Restore Procedure

1. Stop the application server
2. Drop and recreate the database if full restore
3. Restore: gunzip -c backup.sql.gz | psql DATABASE_URL
4. Run migrations: .venv/bin/alembic upgrade heads
5. Restart: bash START.sh
6. Verify: .venv/bin/python3 scripts/verify_backup.py

## Backup Verification

Run: .venv/bin/python3 scripts/verify_backup.py
Then: curl http://localhost:8030/api/v1/health/ready

## Recovery Time Objectives

Server restart: 30s RTO, 0 RPO
Application crash: 2min RTO, 0 RPO
Database corruption: 30min RTO, 24h RPO
Full server loss: 2h RTO, 24h RPO

## Backup Retention

Daily backups kept for 7 days
Weekly backups kept for 4 weeks
Monthly backups kept for 12 months

## Post-Restore Checklist

- Health ready returns connected
- Alembic shows correct head revision
- Login works with admin credentials
- Work orders list returns data
- Platform status shows all subsystems healthy
