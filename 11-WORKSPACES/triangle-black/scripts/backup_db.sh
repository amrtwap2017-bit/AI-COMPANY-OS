#!/bin/bash
# Triangle Black Database Backup Script

set -e

PROJECT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
BACKUP_DIR="$PROJECT_DIR/backups"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="$BACKUP_DIR/triangle_black_${TIMESTAMP}.sql.gz"

echo "=== Triangle Black Database Backup ==="
echo "Output: $BACKUP_FILE"

mkdir -p "$BACKUP_DIR"

if [ -f "$PROJECT_DIR/.env" ]; then
    set -a
    source "$PROJECT_DIR/.env" 2>/dev/null || true
    set +a
fi

DB_URL="${DATABASE_URL:-}"
if [ -z "$DB_URL" ]; then
    echo "ERROR: DATABASE_URL not set"
    exit 1
fi

DB_NAME=$(echo "$DB_URL" | sed 's|.*/||' | sed 's|?.*||')
DB_HOST=$(echo "$DB_URL" | sed 's|.*@||' | sed 's|/.*||' | cut -d: -f1)
DB_PORT=$(echo "$DB_URL" | sed 's|.*@||' | sed 's|/.*||' | grep -o ':[0-9]*' | tr -d ':')
DB_USER=$(echo "$DB_URL" | sed 's|.*://||' | sed 's|:.*||')
DB_PASS=$(echo "$DB_URL" | sed 's|.*://[^:]*:||' | sed 's|@.*||')

echo "Database: $DB_NAME @ $DB_HOST:${DB_PORT:-5432}"

PGPASSWORD="$DB_PASS" pg_dump \
    -h "$DB_HOST" \
    -p "${DB_PORT:-5432}" \
    -U "$DB_USER" \
    -d "$DB_NAME" \
    --format=plain \
    --no-owner \
    --no-acl \
    | gzip > "$BACKUP_FILE"

SIZE=$(du -h "$BACKUP_FILE" | cut -f1)
echo "Backup complete: $BACKUP_FILE ($SIZE)"
find "$BACKUP_DIR" -name "triangle_black_*.sql.gz" -mtime +7 -delete 2>/dev/null || true
echo "=== DONE ==="
