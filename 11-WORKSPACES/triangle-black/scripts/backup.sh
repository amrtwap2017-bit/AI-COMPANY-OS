#!/bin/bash
# Triangle Black — Database Backup Script
# Run: bash scripts/backup.sh

set -e

DB_URL="${DATABASE_URL:-postgresql+psycopg2://ai:ai123@localhost:5432/triangle_black}"
DB_HOST="${DB_HOST:-localhost}"
DB_PORT="${DB_PORT:-5432}"
DB_USER="${DB_USER:-ai}"
DB_PASS="${DB_PASS:-ai123}"
DB_NAME="${DB_NAME:-triangle_black}"

BACKUP_DIR="${BACKUP_DIR:-./backups}"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="${BACKUP_DIR}/triangle_black_${TIMESTAMP}.sql.gz"

mkdir -p "${BACKUP_DIR}"

echo "=== Triangle Black Backup ==="
echo "Date: $(date)"
echo "Target: ${BACKUP_FILE}"

# Create backup
PGPASSWORD="${DB_PASS}" pg_dump \
  -h "${DB_HOST}" \
  -p "${DB_PORT}" \
  -U "${DB_USER}" \
  -d "${DB_NAME}" \
  --no-password \
  --format=plain \
  --no-owner \
  --no-acl | gzip > "${BACKUP_FILE}"

SIZE=$(du -sh "${BACKUP_FILE}" | cut -f1)
echo "✅ Backup complete: ${BACKUP_FILE} (${SIZE})"

# Keep last 7 backups
ls -t "${BACKUP_DIR}"/triangle_black_*.sql.gz | tail -n +8 | xargs -r rm
echo "✅ Old backups cleaned"
