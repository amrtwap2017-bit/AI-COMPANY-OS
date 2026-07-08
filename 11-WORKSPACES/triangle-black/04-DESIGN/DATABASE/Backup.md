# Backup and Restore

## Backup Strategy

### Schedule

| Backup Type | Frequency | Retention | Target |
|-------------|-----------|-----------|--------|
| Full database dump | Daily | 7 days | Compressed SQL dump |
| Weekly full dump | Weekly (Sunday) | 4 weeks | Compressed SQL dump |
| Monthly archive | Monthly (1st) | 12 months | Compressed SQL dump (offsite) |
| WAL archival | Continuous | Until next full backup | Archives directory |

### Backup Script

```bash
#!/bin/bash
# backup.sh — Full database backup with per-tenant option

BACKUP_DIR="/backups/postgres"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
DB_NAME="triangle_black"
PG_USER="postgres"

# Full database backup (compressed)
pg_dump \
  --dbname="postgresql://${PG_USER}@localhost:5432/${DB_NAME}" \
  --format=custom \
  --compress=9 \
  --file="${BACKUP_DIR}/full_${TIMESTAMP}.dump" \
  --verbose

# Per-tenant backup (for granular restore)
psql -d $DB_NAME -t -c "SELECT schema_name FROM information_schema.schemata WHERE schema_name LIKE 'tenant_%';" \
  | while read SCHEMA; do
    pg_dump \
      --dbname="postgresql://${PG_USER}@localhost:5432/${DB_NAME}" \
      --schema="${SCHEMA}" \
      --format=custom \
      --compress=9 \
      --file="${BACKUP_DIR}/tenant_${SCHEMA}_${TIMESTAMP}.dump"
  done

# Clean backups older than retention
find ${BACKUP_DIR} -name "full_*.dump" -type f -mtime +7 -delete
find ${BACKUP_DIR} -name "tenant_*.dump" -type f -mtime +7 -delete
```

### Docker Compose Backup Job

```yaml
services:
  backup:
    image: postgres:16-alpine
    restart: unless-stopped
    volumes:
      - postgres_data:/var/lib/postgresql/data:ro
      - ./backups:/backups
      - ./scripts/backup.sh:/backup.sh
    environment:
      - PGPASSWORD=${POSTGRES_PASSWORD}
    entrypoint: |
      sh -c "
      crontab -l 2>/dev/null; echo '0 3 * * * /backup.sh' | crontab -
      crond -f
      "
    depends_on:
      - postgres
```

## Offsite Backup

### Push to S3-Compatible Storage

```bash
#!/bin/bash
# sync-backups.sh — Sync to offsite storage

# Use rclone or s3cmd to sync backups directory
rclone sync /backups/postgres \
  s3:triangle-black-db-backups/production/ \
  --progress \
  --checksum \
  --delete-removed

# Or with MinIO client:
mc mirror /backups/postgres \
  myminio/triangle-black-backups/
```

### Backup Verification

```bash
#!/bin/bash
# verify-backup.sh — Test backup integrity

# Check that the dump file is valid
pg_restore --list /backups/postgres/full_${TIMESTAMP}.dump > /dev/null 2>&1
if [ $? -eq 0 ]; then
  echo "Backup verification PASSED: ${TIMESTAMP}"
else
  echo "Backup verification FAILED: ${TIMESTAMP}" | mail -s "BACKUP FAILED" admin@triangleblack.app
fi
```

## Restore Procedures

### Full Database Restore

```bash
#!/bin/bash
# restore-full.sh — Restore full database from backup

BACKUP_FILE=$1
DB_NAME="triangle_black"
PG_USER="postgres"

if [ -z "$BACKUP_FILE" ]; then
  echo "Usage: $0 <backup_file.dump>"
  exit 1
fi

# Stop application
echo "Stopping application services..."
docker compose stop nextjs nestjs

# Drop and recreate database
echo "Dropping and recreating database..."
psql -U $PG_USER -c "DROP DATABASE IF EXISTS ${DB_NAME};"
psql -U $PG_USER -c "CREATE DATABASE ${DB_NAME};"

# Restore from dump
echo "Restoring from ${BACKUP_FILE}..."
pg_restore \
  --dbname="postgresql://${PG_USER}@localhost:5432/${DB_NAME}" \
  --jobs=4 \
  --verbose \
  "${BACKUP_FILE}"

# Start application
echo "Starting application services..."
docker compose start nextjs nestjs

echo "Restore complete."
```

### Single Tenant Restore

```bash
#!/bin/bash
# restore-tenant.sh — Restore a single tenant schema

TENANT_ID=$1
BACKUP_FILE=$2
DB_NAME="triangle_black"
PG_USER="postgres"

if [ -z "$TENANT_ID" ] || [ -z "$BACKUP_FILE" ]; then
  echo "Usage: $0 <tenant_id> <backup_file.dump>"
  exit 1
fi

SCHEMA_NAME="tenant_${TENANT_ID}"

# Drop existing tenant schema
psql -U $PG_USER -d $DB_NAME -c "DROP SCHEMA IF EXISTS ${SCHEMA_NAME} CASCADE;"

# Restore only the tenant schema from the backup
pg_restore \
  --dbname="postgresql://${PG_USER}@localhost:5432/${DB_NAME}" \
  --schema="${SCHEMA_NAME}" \
  --jobs=2 \
  --verbose \
  "${BACKUP_FILE}"

echo "Tenant ${TENANT_ID} restore complete."
```

### Point-in-Time Recovery (PITR)

Requires WAL archiving to be configured:

```conf
# postgresql.conf
wal_level = replica
archive_mode = on
archive_command = 'cp %p /backups/wal/%f'
```

Recovery steps:

```bash
#!/bin/bash
# pitr-restore.sh — Point-in-time recovery

RECOVERY_TARGET_TIME=$1
DB_NAME="triangle_black"

# 1. Restore the last full backup
pg_restore --dbname=$DB_NAME /backups/postgres/full_latest.dump

# 2. Create recovery.conf
cat > /var/lib/postgresql/data/recovery.conf << EOF
restore_command = 'cp /backups/wal/%f %p'
recovery_target_time = '${RECOVERY_TARGET_TIME}'
recovery_target_action = 'promote'
EOF

# 3. Restart PostgreSQL (it will replay WAL to target time)
pg_ctl restart -D /var/lib/postgresql/data
```

## Disaster Recovery Plan

### Recovery Time Objectives

| Scenario | RTO | RPO |
|----------|-----|-----|
| Accidental data deletion (single record) | 1 hour | 5 minutes |
| Schema corruption (single tenant) | 2 hours | 24 hours |
| Full database corruption | 4 hours | 24 hours |
| VPS failure | 6 hours (with backup VPS) | 24 hours |
| Region failure | 24 hours (with offsite backup) | 24 hours |

### Recovery Runbook

```
1. Assess damage
   - Check pg_stat_activity for unexpected queries
   - Check application error logs
   - Identify scope (single record, tenant, full DB)

2. Decide restore strategy
   a. Single record: Restore to staging, export record, import to production
   b. Single tenant: Restore tenant schema from backup
   c. Full database: Restore from full backup + WAL replay

3. Communicate status
   - Notify affected tenants
   - Post status page update
   - Log incident

4. Execute restore
   - Run appropriate restore script
   - Verify data integrity
   - Run application smoke tests

5. Post-mortem
   - Root cause analysis
   - Update backup procedures if needed
   - Document in 06-Operations/
```

## Monitoring Backups

```sql
-- Last backup check
SELECT schedule, last_backup_time
FROM backups_monitoring
ORDER BY last_backup_time DESC;
```

```bash
# Cron health check
0 5 * * * /usr/local/bin/check-backup-age.sh

# check-backup-age.sh
if [ $(find /backups/postgres -name "full_*.dump" -mtime -1 | wc -l) -eq 0 ]; then
  echo "No backup in the last 24 hours!" | mail -s "BACKUP MISSING" admin@triangleblack.app
fi
```

## Security

- Backup files are encrypted with GPG or AES-256 before offsite transfer
- Backup access restricted to `postgres` user and backup service
- Database credentials stored in Docker secrets, never in backup scripts
- Offsite backups encrypted at rest
- Backup logs monitored for unauthorized access
