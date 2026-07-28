#!/bin/bash
DATE=$(date +%Y%m%d_%H%M)
BACKUP_DIR="/home/amr/AI-COMPANY-OS/backups"
mkdir -p "$BACKUP_DIR"
docker exec ai-postgres pg_dump -U ai triangle_black > "$BACKUP_DIR/triangle_black_$DATE.sql"
echo "Backup created: $BACKUP_DIR/triangle_black_$DATE.sql"
# Keep only last 7 days
find "$BACKUP_DIR" -name "*.sql" -mtime +7 -delete
echo "Old backups cleaned"
