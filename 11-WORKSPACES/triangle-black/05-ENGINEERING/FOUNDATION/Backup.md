# Backup Strategy

## Overview

V1 uses a pragmatic backup approach: daily `pg_dump` to local disk with rotation and periodic off-site copy. No specialized backup software — just PostgreSQL's native tools and shell scripts.

## Design Principles

| Principle | Rationale |
|-----------|-----------|
| Simple tools | `pg_dump`, `gzip`, `find` — no dependencies beyond what's in the container |
| Local first | Backup to local disk first, then optionally copy off-site |
| Tenant granular | Schema-per-tenant enables per-client backup/restore |
| Testable | Restore procedure must be documented and tested quarterly |

## Backup Script

### `/home/deploy/triangleblack/scripts/backup.sh`

```bash
#!/bin/bash
set -euo pipefail

# Configuration
BACKUP_DIR="/home/deploy/backups"
DB_CONTAINER="tb-postgres"
DB_USER="${DB_USER:-tb_user}"
DB_NAME="triangleblack"
RETENTION_DAYS=30
DATE=$(date +%Y-%m-%d_%H%M%S)
BACKUP_FILE="${BACKUP_DIR}/${DB_NAME}_${DATE}.sql.gz"
LOG_FILE="${BACKUP_DIR}/backup.log"

# Ensure backup directory exists
mkdir -p "${BACKUP_DIR}"

log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "${LOG_FILE}"
}

log "Starting backup: ${BACKUP_FILE}"

# Full database dump (all schemas)
docker exec "${DB_CONTAINER}" pg_dump \
    --username="${DB_USER}" \
    --dbname="${DB_NAME}" \
    --format=custom \
    --compress=9 \
    --verbose \
    2>> "${LOG_FILE}" \
    | cat > "${BACKUP_FILE}"

# Verify backup file
if [ -f "${BACKUP_FILE}" ] && [ -s "${BACKUP_FILE}" ]; then
    BACKUP_SIZE=$(du -h "${BACKUP_FILE}" | cut -f1)
    log "Backup completed: ${BACKUP_FILE} (${BACKUP_SIZE})"
else
    log "ERROR: Backup failed or empty: ${BACKUP_FILE}"
    exit 1
fi

# Generate checksum
sha256sum "${BACKUP_FILE}" > "${BACKUP_FILE}.sha256"

# List schemas for tenant-level restore reference
docker exec "${DB_CONTAINER}" psql \
    --username="${DB_USER}" \
    --dbname="${DB_NAME}" \
    --tuples-only \
    --command="SELECT schema_name FROM information_schema.schemata WHERE schema_name NOT IN ('public', 'information_schema', 'pg_catalog', 'pg_toast');" \
    > "${BACKUP_DIR}/schemas_${DATE}.txt"

# Remove backups older than retention period
find "${BACKUP_DIR}" -name "${DB_NAME}_*.sql.gz" -type f -mtime +${RETENTION_DAYS} -delete
find "${BACKUP_DIR}" -name "${DB_NAME}_*.sql.gz.sha256" -type f -mtime +${RETENTION_DAYS} -delete
find "${BACKUP_DIR}" -name "schemas_*.txt" -type f -mtime +${RETENTION_DAYS} -delete

log "Backup rotation complete (retention: ${RETENTION_DAYS} days)"
log "---"
```

### /home/deploy/triangleblack/scripts/backup-tenant.sh

For per-tenant backups (supplementary to full backup):

```bash
#!/bin/bash
set -euo pipefail

BACKUP_DIR="/home/deploy/backups/tenants"
DB_CONTAINER="tb-postgres"
DB_USER="${DB_USER:-tb_user}"
DB_NAME="triangleblack"
DATE=$(date +%Y-%m-%d)

mkdir -p "${BACKUP_DIR}"

# Get list of tenant schemas
TENANTS=$(docker exec "${DB_CONTAINER}" psql \
    --username="${DB_USER}" \
    --dbname="${DB_NAME}" \
    --tuples-only \
    --no-align \
    --command="SELECT schema_name FROM information_schema.schemata WHERE schema_name LIKE 'tenant_%';")

for tenant in $TENANTS; do
    docker exec "${DB_CONTAINER}" pg_dump \
        --username="${DB_USER}" \
        --dbname="${DB_NAME}" \
        --schema="${tenant}" \
        --format=custom \
        --compress=9 \
        --file="/tmp/${tenant}_${DATE}.dump"

    docker cp "${DB_CONTAINER}:/tmp/${tenant}_${DATE}.dump" "${BACKUP_DIR}/"
    docker exec "${DB_CONTAINER}" rm "/tmp/${tenant}_${DATE}.dump"
done
```

## Crontab (Host Level)

```bash
# Edit deploy user's crontab
sudo crontab -u deploy -e
```

```cron
# Daily full backup at 02:00
0 2 * * * /home/deploy/triangleblack/scripts/backup.sh

# Weekly tenant-level backup (Sunday 03:00)
0 3 * * 0 /home/deploy/triangleblack/scripts/backup-tenant.sh
```

## Off-Site Copy

### Option 1: rsync to secondary VPS (recommended)

```bash
#!/bin/bash
# /home/deploy/triangleblack/scripts/sync-backups.sh
rsync -avz --delete /home/deploy/backups/ \
    user@secondary-vps:/backups/triangleblack/
```

### Option 2: rclone to cloud storage

```bash
# Install rclone
sudo apt install rclone -y
rclone config

# Sync script
#!/bin/bash
# /home/deploy/triangleblack/scripts/rclone-backups.sh
rclone sync /home/deploy/backups/ remote:triangleblack-backups/
```

Add to crontab:

```cron
# Sync to off-site storage at 04:00 daily
0 4 * * * /home/deploy/triangleblack/scripts/rclone-backups.sh
```

## Backup Verification

### Automated Verification

```bash
#!/bin/bash
# /home/deploy/triangleblack/scripts/verify-backup.sh

BACKUP_DIR="/home/deploy/backups"
LATEST=$(ls -t ${BACKUP_DIR}/*.sql.gz 2>/dev/null | head -1)

if [ -z "${LATEST}" ]; then
    echo "ERROR: No backup files found"
    exit 1
fi

# Verify checksum
sha256sum -c "${LATEST}.sha256" || {
    echo "ERROR: Checksum mismatch for ${LATEST}"
    exit 1
}

# Verify archive integrity
gunzip -t "${LATEST}" || {
    echo "ERROR: Archive corruption detected in ${LATEST}"
    exit 1
}

echo "Backup verified: ${LATEST}"
```

### Quarterly Restore Test

```bash
#!/bin/bash
# /home/deploy/triangleblack/scripts/test-restore.sh

# Start a temporary PostgreSQL container
docker run -d \
    --name tb-restore-test \
    postgres:16-alpine

# Copy latest backup into container
docker cp /home/deploy/backups/latest.dump tb-restore-test:/tmp/

# Restore
docker exec tb-restore-test pg_restore \
    --username=postgres \
    --dbname=postgres \
    --verbose \
    /tmp/latest.dump

# Verify schemas exist
docker exec tb-restore-test psql \
    --username=postgres \
    --command="SELECT schema_name FROM information_schema.schemata;"

# Cleanup
docker stop tb-restore-test && docker rm tb-restore-test
```

## Backup Contents

| Item | Included | Method |
|------|----------|--------|
| PostgreSQL data | Yes | `pg_dump` (custom format) |
| Uploaded files | Partially | Volume-mounted to host, backed up via `tar` |
| Redis data | No | Rebuildable from DB (cache only) |
| Docker volumes | No | Rebuildable from Docker Compose |
| Environment variables | No | Stored in `.env` file (backed up separately) |

### File Upload Backup

```bash
#!/bin/bash
# Backup uploaded files
tar czf /home/deploy/backups/uploads_${DATE}.tar.gz \
    -C /var/lib/docker/volumes/triangleblack_uploads/_data .
```

## Retention Policy

| Backup Type | Retention | Copies to Keep | Location |
|-------------|-----------|----------------|----------|
| Daily full backup | 30 days | 30 | Local disk |
| Weekly tenant backup | 90 days | 13 | Local disk |
| Off-site copy | 30 days | 30 | Secondary VPS / Cloud |
| Monthly archive | 12 months | 12 | Cloud storage |

## Monitoring

| Check | Frequency | Alert |
|-------|-----------|-------|
| Backup file exists | Daily | If no new backup in 36 hours |
| Backup file size | Daily | If size < 10% of previous day |
| Checksum valid | Weekly | If checksum mismatch |
| Restore test | Quarterly | If restore fails |
