#!/usr/bin/env bash
# Triangle Black — Backup Verification
# Usage: ./scripts/verify-backup.sh
# Returns 0=PASS, 1=STALE/MISSING
set -euo pipefail

BACKUP_DIR="${BACKUP_DIR:-/app/backups}"
MAX_AGE_HOURS="${MAX_BACKUP_AGE_HOURS:-25}"
WEBHOOK_URL="${ALERT_WEBHOOK_URL:-}"
LOG_PREFIX="[$(date '+%Y-%m-%d %H:%M:%S')] [VERIFY]"

LATEST=$(find "$BACKUP_DIR/daily" -name "*.sql.gz" -type f 2>/dev/null | sort | tail -1)

if [ -z "$LATEST" ]; then
    echo "$LOG_PREFIX ❌ MISSING — No backup files found in $BACKUP_DIR/daily"
    STATUS="MISSING"
elif [ ! -s "$LATEST" ]; then
    echo "$LOG_PREFIX ❌ EMPTY — Latest backup is empty: $LATEST"
    STATUS="EMPTY"
else
    AGE_SECONDS=$(( $(date +%s) - $(stat -c %Y "$LATEST") ))
    AGE_HOURS=$(( AGE_SECONDS / 3600 ))
    SIZE=$(du -sh "$LATEST" | cut -f1)

    if [ "$AGE_HOURS" -gt "$MAX_AGE_HOURS" ]; then
        echo "$LOG_PREFIX ❌ STALE — Latest backup is ${AGE_HOURS}h old (max: ${MAX_AGE_HOURS}h)"
        STATUS="STALE"
    else
        echo "$LOG_PREFIX ✅ PASS — Latest: $(basename $LATEST) | Age: ${AGE_HOURS}h | Size: $SIZE"
        STATUS="PASS"
        exit 0
    fi
fi

# Alert on failure
if [ -n "$WEBHOOK_URL" ] && [ "$STATUS" != "PASS" ]; then
    curl -s -X POST "$WEBHOOK_URL" \
        -H "Content-Type: application/json" \
        -d "{\"text\":\"⚠️ Triangle Black BACKUP ${STATUS} — check $BACKUP_DIR\"}" || true
fi

exit 1
