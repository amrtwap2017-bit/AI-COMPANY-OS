#!/bin/bash
# Triangle Black — Database Restore Script
# Usage: bash scripts/restore.sh backups/triangle_black_20260827_123456.sql.gz

set -e

if [ -z "$1" ]; then
  echo "Usage: $0 <backup_file.sql.gz>"
  echo "Available backups:"
  ls -la backups/*.sql.gz 2>/dev/null || echo "No backups found"
  exit 1
fi

BACKUP_FILE="$1"
DB_HOST="${DB_HOST:-localhost}"
DB_PORT="${DB_PORT:-5432}"
DB_USER="${DB_USER:-ai}"
DB_PASS="${DB_PASS:-ai123}"
DB_NAME="${DB_NAME:-triangle_black}"

echo "=== Triangle Black Restore ==="
echo "Date: $(date)"
echo "Source: ${BACKUP_FILE}"
echo "⚠️  This will REPLACE all data in ${DB_NAME}"
read -p "Confirm? (yes/no): " confirm

if [ "$confirm" != "yes" ]; then
  echo "Cancelled."
  exit 0
fi

# Restore
gunzip -c "${BACKUP_FILE}" | PGPASSWORD="${DB_PASS}" psql \
  -h "${DB_HOST}" \
  -p "${DB_PORT}" \
  -U "${DB_USER}" \
  -d "${DB_NAME}" \
  --no-password

echo "✅ Restore complete from ${BACKUP_FILE}"
