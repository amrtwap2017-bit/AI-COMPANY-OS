# 07 — Backup Verification

> Backup verification process for data protection.

## Reference Chain

| Source | File | Input |
|--------|------|-------|
| Phase 8 | 05-SECURITY-READINESS/Backup.md | Backup plan |
| Phase 8 | 05-SECURITY-READINESS/Disaster-Recovery.md | DR plan |

## Backup Schedule

| Data | Frequency | Retention | Type | Location |
|------|-----------|-----------|------|----------|
| PostgreSQL (all schemas) | Daily | 30 days | pg_dump (full) | VPS + DO Spaces |
| PostgreSQL (WAL) | Continuous | 7 days | WAL archive | VPS |
| Configuration (.env) | Per change | Forever | Git (encrypted) | GitHub |
| Docker Compose files | Per change | Forever | Git | GitHub |
| SSL certificates | Weekly | Forever | Docker volume | VPS |
| File uploads | Daily | 30 days | rsync | VPS + DO Spaces |

## Backup Script (PostgreSQL)

```bash
#!/bin/bash
# Daily PostgreSQL backup

BACKUP_DIR="/backups/postgresql"
DATE=$(date +%Y%m%d_%H%M%S)
DB_NAME="triangle_black_prod"

# Create backup
pg_dump -h localhost -U triangle_black -d "$DB_NAME" \
  --format=custom \
  --file="$BACKUP_DIR/${DB_NAME}_${DATE}.dump"

# Compress
gzip "$BACKUP_DIR/${DB_NAME}_${DATE}.dump"

# Copy to remote storage (DO Spaces)
s3cmd put "$BACKUP_DIR/${DB_NAME}_${DATE}.dump.gz" \
  s3://triangle-black-backups/postgresql/

# Cleanup old backups (older than 30 days)
find "$BACKUP_DIR" -name "*.dump.gz" -mtime +30 -delete
```

## Backup Verification Process

1. **Daily** — Check backup script exit code (cron success/failure)
2. **Weekly** — Verify backup file exists and has reasonable size
3. **Monthly** — Restore backup to staging and verify data integrity
4. **Quarterly** — Full restore test (see Recovery-Testing.md)

## Backup Verification Log

```
─────────────────────────────────────────────
BACKUP VERIFICATION LOG
─────────────────────────────────────────────

Date: _____________
Backup File: _____________
Size: _____________

Verification Method:
[ ] File exists check
[ ] Size check (reasonable)
[ ] Checksum verification
[ ] Restore to staging
[ ] Data integrity check (record count)

Status: [PASS / FAIL]
Notes: _______________________________________

Verified by: _____________ Date: _____________
```

## Sign-Off

| Role | Name | Signature | Date |
|------|------|-----------|------|
| DevOps Lead | | | |

**Status:** ❌ NOT CONFIGURED
