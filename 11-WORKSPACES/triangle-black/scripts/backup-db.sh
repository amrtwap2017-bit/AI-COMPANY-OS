#!/usr/bin/env bash
# Triangle Black — Production Database Backup
# Usage: ./scripts/backup-db.sh
# Cron: 0 2 * * * /app/scripts/backup-db.sh >> /var/log/tb-backup.log 2>&1
set -euo pipefail

# === CONFIGURATION ===
DB_NAME="${POSTGRES_DB:-triangle_black}"
DB_USER="${POSTGRES_USER:-ai}"
DB_HOST="${POSTGRES_HOST:-localhost}"
DB_PORT="${POSTGRES_PORT:-5432}"
BACKUP_DIR="${BACKUP_DIR:-/app/backups}"
RETENTION_DAILY=7
RETENTION_WEEKLY=4
RETENTION_MONTHLY=3
WEBHOOK_URL="${ALERT_WEBHOOK_URL:-}"
LOG_PREFIX="[$(date '+%Y-%m-%d %H:%M:%S')] [BACKUP]"

mkdir -p "$BACKUP_DIR"/{daily,weekly,monthly}

TIMESTAMP=$(date +%Y%m%d_%H%M%S)
DATE=$(date +%Y%m%d)
BACKUP_FILE="$BACKUP_DIR/daily/tb-${DATE}-${TIMESTAMP}.sql.gz"

echo "$LOG_PREFIX Starting backup → $BACKUP_FILE"

# Run pg_dump
PGPASSWORD="${POSTGRES_PASSWORD}" pg_dump \
    -U "$DB_USER" \
    -h "$DB_HOST" \
    -p "$DB_PORT" \
    "$DB_NAME" | gzip > "$BACKUP_FILE"

SIZE=$(du -sh "$BACKUP_FILE" | cut -f1)
echo "$LOG_PREFIX ✅ Backup complete — Size: $SIZE"

# Verify backup is not empty
if [ ! -s "$BACKUP_FILE" ]; then
    echo "$LOG_PREFIX ❌ BACKUP FILE IS EMPTY — ALERT"
    if [ -n "$WEBHOOK_URL" ]; then
        curl -s -X POST "$WEBHOOK_URL" \
            -H "Content-Type: application/json" \
            -d "{\"text\":\"⚠️ Triangle Black BACKUP FAILED — empty file on $DB_HOST\"}"
    fi
    exit 1
fi

# Weekly backup (every Sunday)
if [ "$(date +%u)" = "7" ]; then
    WEEKLY_FILE="$BACKUP_DIR/weekly/tb-week$(date +%V)-${DATE}.sql.gz"
    cp "$BACKUP_FILE" "$WEEKLY_FILE"
    echo "$LOG_PREFIX Weekly backup: $WEEKLY_FILE"
fi

# Monthly backup (1st of month)
if [ "$(date +%d)" = "01" ]; then
    MONTHLY_FILE="$BACKUP_DIR/monthly/tb-$(date +%Y%m).sql.gz"
    cp "$BACKUP_FILE" "$MONTHLY_FILE"
    echo "$LOG_PREFIX Monthly backup: $MONTHLY_FILE"
fi

# Cleanup old backups
find "$BACKUP_DIR/daily"   -name "*.sql.gz" -mtime +${RETENTION_DAILY}   -delete 2>/dev/null || true
find "$BACKUP_DIR/weekly"  -name "*.sql.gz" -mtime +$((RETENTION_WEEKLY*7))  -delete 2>/dev/null || true
find "$BACKUP_DIR/monthly" -name "*.sql.gz" -mtime +$((RETENTION_MONTHLY*30)) -delete 2>/dev/null || true

echo "$LOG_PREFIX Retention cleanup done"

# Optional: upload to remote (configure rclone separately)
if command -v rclone &>/dev/null && [ -n "${RCLONE_REMOTE:-}" ]; then
    rclone copy "$BACKUP_FILE" "${RCLONE_REMOTE}/backups/daily/"
    echo "$LOG_PREFIX Uploaded to remote: $RCLONE_REMOTE"
fi

echo "$LOG_PREFIX ✅ Backup complete — $SIZE"
