#!/bin/bash
# Triangle Black — Production Database Backup
# Schedule: 0 2 * * * bash /path/to/scripts/backup_db.sh

set -e

TB_DIR="$(cd "$(dirname "$0")/.." && pwd)"
BACKUP_DIR="${BACKUP_DIR:-$TB_DIR/backups/db}"
RETENTION_DAYS=30
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/tb_backup_$TIMESTAMP.sql.gz"

# Load env
if [ -f "$TB_DIR/.env" ]; then
  export $(grep -v '^#' "$TB_DIR/.env" | xargs -d '\n' 2>/dev/null) || true
fi

DB_URL="${DATABASE_URL:-postgresql://postgres:postgres@localhost:5432/triangle_black}"

# Parse DB URL
DB_HOST=$(echo "$DB_URL" | sed -n 's|.*@\([^:/]*\).*|\1|p')
DB_PORT=$(echo "$DB_URL" | sed -n 's|.*:\([0-9]*\)/.*|\1|p')
DB_NAME=$(echo "$DB_URL" | sed -n 's|.*/\([^?]*\).*|\1|p')
DB_USER=$(echo "$DB_URL" | sed -n 's|.*://\([^:]*\):.*|\1|p')
DB_PASS=$(echo "$DB_URL" | sed -n 's|.*://[^:]*:\([^@]*\)@.*|\1|p')

mkdir -p "$BACKUP_DIR"

echo "[$(date)] Starting backup → $BACKUP_FILE"

PGPASSWORD="$DB_PASS" pg_dump \
  -h "$DB_HOST" \
  -p "${DB_PORT:-5432}" \
  -U "$DB_USER" \
  -d "$DB_NAME" \
  --no-password \
  --verbose \
  --format=plain \
  | gzip > "$BACKUP_FILE"

BACKUP_SIZE=$(du -sh "$BACKUP_FILE" | cut -f1)
echo "[$(date)] Backup complete: $BACKUP_FILE ($BACKUP_SIZE)"

# Verify backup
if [ ! -s "$BACKUP_FILE" ]; then
  echo "[ERROR] Backup file is empty! Aborting."
  exit 1
fi

# Cleanup old backups
find "$BACKUP_DIR" -name "tb_backup_*.sql.gz" -mtime "+$RETENTION_DAYS" -delete
echo "[$(date)] Cleanup: removed backups older than $RETENTION_DAYS days"

# Write latest symlink
ln -sf "$BACKUP_FILE" "$BACKUP_DIR/tb_backup_latest.sql.gz"
echo "[$(date)] Latest symlink: $BACKUP_DIR/tb_backup_latest.sql.gz"

echo "[$(date)] ✅ Backup job complete"
