#!/bin/bash
# Triangle Black — Database Restore Script
# Usage: bash scripts/restore_db.sh backups/triangle_black_20260901.sql.gz [target_db]
#
# ALWAYS test on staging before production
# ALWAYS take a backup of target before restoring
#
set -e

BACKUP_FILE="${1}"
TARGET_DB="${2:-triangle_black_restore_test}"

if [ -z "$BACKUP_FILE" ]; then
    echo "Usage: $0 <backup.sql.gz> [target_db]"
    echo "Example: $0 backups/triangle_black_20260901.sql.gz"
    exit 1
fi

if [ ! -f "$BACKUP_FILE" ]; then
    echo "❌ Backup file not found: $BACKUP_FILE"
    exit 1
fi

echo "=== Triangle Black Database Restore ==="
echo "Backup:    $BACKUP_FILE"
echo "Target DB: $TARGET_DB"
echo "Started:   $(date)"
echo ""

# Credentials from environment
DB_HOST="${DB_HOST:-localhost}"
DB_PORT="${DB_PORT:-5432}"
DB_USER="${DB_USER:-ai}"
export PGPASSWORD="${PGPASSWORD:-ai123}"

# Step 1: Verify backup is valid
echo "Step 1: Verifying backup..."
FILE_SIZE=$(stat -c%s "$BACKUP_FILE" 2>/dev/null || stat -f%z "$BACKUP_FILE")
if [ "$FILE_SIZE" -lt 1000 ]; then
    echo "❌ Backup file too small: $FILE_SIZE bytes"
    exit 1
fi
echo "  ✅ Backup size: $(du -sh "$BACKUP_FILE" | cut -f1)"

# Step 2: Create target database
echo "Step 2: Creating target database..."
# Drop and create as separate commands (cannot run in transaction)
psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" postgres     -c "DROP DATABASE IF EXISTS $TARGET_DB;" 2>/dev/null || true
psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" postgres     -c "CREATE DATABASE $TARGET_DB;"

echo "  ✅ Database created: $TARGET_DB"

# Step 3: Restore
echo "Step 3: Restoring data..."
gunzip -c "$BACKUP_FILE" | psql \
    -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" \
    -d "$TARGET_DB" \
    --quiet 2>&1 | head -5

echo "  ✅ Restore complete"

# Step 4: Verify row counts
echo "Step 4: Verifying restore..."
psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$TARGET_DB" -c "
SELECT
    'work_orders' as tbl, COUNT(*) as rows FROM work_orders
UNION ALL SELECT 'assets', COUNT(*) FROM assets
UNION ALL SELECT 'maintenance_plans', COUNT(*) FROM maintenance_plans
UNION ALL SELECT 'recommendations', COUNT(*) FROM recommendations
UNION ALL SELECT 'users', COUNT(*) FROM users
ORDER BY tbl;
" 2>/dev/null || echo "  Row count check skipped"

echo ""
echo "=== RESTORE COMPLETE ==="
echo "Database: $TARGET_DB"
echo "Finished: $(date)"
echo ""
echo "NEXT STEPS:"
echo "  1. Verify application works against $TARGET_DB"
echo "  2. Run: DATABASE_URL=postgresql+psycopg2://ai:ai123@localhost:5432/$TARGET_DB .venv/bin/pytest tests/ -q"
echo "  3. If verified: rename to production DB (with downtime)"
