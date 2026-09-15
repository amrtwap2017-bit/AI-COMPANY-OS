#!/usr/bin/env bash
# Triangle Black — Database Restore
# NEVER restores to production automatically
# Usage: ./scripts/restore-db.sh <backup-file>
set -euo pipefail

BACKUP_FILE="${1:-}"
RESTORE_DB="${RESTORE_DB_NAME:-triangle_black_restore}"
DB_USER="${POSTGRES_USER:-ai}"
DB_HOST="${POSTGRES_HOST:-localhost}"
DB_PORT="${POSTGRES_PORT:-5432}"
LOG_PREFIX="[$(date '+%Y-%m-%d %H:%M:%S')] [RESTORE]"

if [ -z "$BACKUP_FILE" ]; then
    echo "Usage: $0 <backup-file.sql.gz>"
    exit 1
fi

if [ ! -f "$BACKUP_FILE" ]; then
    echo "$LOG_PREFIX ❌ Backup file not found: $BACKUP_FILE"
    exit 1
fi

# SAFETY CHECK — never restore to production DB name
if [ "$RESTORE_DB" = "triangle_black" ]; then
    echo "$LOG_PREFIX ❌ SAFETY: RESTORE_DB_NAME cannot be 'triangle_black'"
    echo "$LOG_PREFIX Set RESTORE_DB_NAME=triangle_black_restore"
    exit 1
fi

echo "$LOG_PREFIX Restoring $BACKUP_FILE → $RESTORE_DB"
echo "$LOG_PREFIX ⚠️  This will DROP and recreate $RESTORE_DB"
read -p "Continue? (yes/no): " CONFIRM
if [ "$CONFIRM" != "yes" ]; then
    echo "Aborted."
    exit 0
fi

# Drop + recreate restore DB
PGPASSWORD="${POSTGRES_PASSWORD}" psql -U "$DB_USER" -h "$DB_HOST" -p "$DB_PORT" postgres << SQL
DROP DATABASE IF EXISTS $RESTORE_DB;
CREATE DATABASE $RESTORE_DB OWNER $DB_USER;
SQL

# Restore
echo "$LOG_PREFIX Restoring..."
PGPASSWORD="${POSTGRES_PASSWORD}" gunzip -c "$BACKUP_FILE" | \
    psql -U "$DB_USER" -h "$DB_HOST" -p "$DB_PORT" "$RESTORE_DB" > /dev/null

# Verify
TABLE_COUNT=$(PGPASSWORD="${POSTGRES_PASSWORD}" psql -U "$DB_USER" -h "$DB_HOST" \
    -p "$DB_PORT" "$RESTORE_DB" -tAc \
    "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema='public'")

echo "$LOG_PREFIX ✅ Restore complete — $TABLE_COUNT tables verified in $RESTORE_DB"
echo "$LOG_PREFIX RTO: $(date)"
