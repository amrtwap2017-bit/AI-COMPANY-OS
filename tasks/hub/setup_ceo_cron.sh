#!/bin/bash
# Run CEO digest daily at 8am
# Add to crontab: crontab -e
# Then add this line:
# 0 8 * * * cd /home/amr/AI-COMPANY-OS && python3 tasks/hub/task_08_ceo_digest.py >> /tmp/ceo-digest.log 2>&1

(crontab -l 2>/dev/null; echo "0 8 * * * cd /home/amr/AI-COMPANY-OS && python3 tasks/hub/task_08_ceo_digest.py >> /tmp/ceo-digest.log 2>&1") | crontab -
echo "CEO digest cron added — runs daily at 8:00 AM"
crontab -l | tail -3