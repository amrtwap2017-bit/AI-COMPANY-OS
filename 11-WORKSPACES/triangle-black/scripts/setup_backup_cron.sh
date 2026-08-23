#!/bin/bash
# Triangle Black — Automated Daily Backup Setup
# Adds a cron job to run backup_db.py at 2:00 AM daily

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

CRON_CMD="0 2 * * * cd $PROJECT_DIR && $PROJECT_DIR/.venv/bin/python $PROJECT_DIR/scripts/backup_db.py >> /tmp/tb_backup_cron.log 2>&1"

# Check if cron already exists
if crontab -l 2>/dev/null | grep -q "backup_db.py"; then
    echo "Backup cron already configured."
else
    (crontab -l 2>/dev/null; echo "$CRON_CMD") | crontab -
    echo "SUCCESS: Daily backup cron installed at 2:00 AM."
fi

echo "Current crontab:"
crontab -l
