#!/bin/bash
# Triangle Black - Database Backup
# Run: bash scripts/backup_db.sh
# Schedule: crontab -e -> 0 2 * * * bash /home/amr/AI-COMPANY-OS/scripts/backup_db.sh

BACKUP_DIR="/home/amr/AI-COMPANY-OS/backups/db"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/triangle_black_$TIMESTAMP.sql"
KEEP_DAYS=7

mkdir -p "$BACKUP_DIR"

echo "[$(date)] Starting backup..."

PGPASSWORD=ai123 pg_dump \
  -U ai \
  -h localhost \
  -d triangle_black \
  --no-password \
  --clean \
  --if-exists \
  > "$BACKUP_FILE"

if [ $? -eq 0 ]; then
  SIZE=$(du -sh "$BACKUP_FILE" | cut -f1)
  echo "[$(date)] Backup OK: $BACKUP_FILE ($SIZE)"
else
  echo "[$(date)] Backup FAILED"
  exit 1
fi

# Remove backups older than KEEP_DAYS
find "$BACKUP_DIR" -name "*.sql" -mtime +$KEEP_DAYS -delete
REMAINING=$(ls "$BACKUP_DIR"/*.sql 2>/dev/null | wc -l)
echo "[$(date)] Retained $REMAINING backup files"

# Log summary
echo "backup_ok timestamp=$TIMESTAMP file=$BACKUP_FILE" >> /tmp/backup.log
