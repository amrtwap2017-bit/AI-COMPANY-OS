#!/bin/bash
# AI Company OS — Service Watchdog
# Restarts dead services automatically
# Run: bash WATCHDOG.sh &

ROOT=/home/amr/AI-COMPANY-OS
NODE=/home/amr/.local/share/fnm/node-versions/v24.18.0/installation/bin/node
export PATH=$(dirname $NODE):$PATH
export NEXT_TELEMETRY_DISABLED=1

log() { echo "[$(date +%H:%M:%S)] WATCHDOG: $1" | tee -a /tmp/watchdog.log; }

check_and_restart() {
    local url=$1 name=$2 restart_cmd=$3 log_file=$4 cwd=$5
    local code=$(curl -sk -o /dev/null -w "%{http_code}" --max-time 5 "$url" 2>/dev/null)
    if [ "$code" != "200" ] && [ "$code" != "301" ] && [ "$code" != "302" ]; then
        log "$name DOWN ($code) — restarting..."
        if [ -n "$cwd" ]; then
            cd "$cwd"
        fi
        eval "nohup $restart_cmd > $log_file 2>&1 &"
        sleep 8
        local new_code=$(curl -sk -o /dev/null -w "%{http_code}" --max-time 5 "$url")
        if [ "$new_code" = "200" ] || [ "$new_code" = "301" ]; then
            log "$name RECOVERED"
        else
            log "$name STILL DOWN after restart"
        fi
    fi
}

log "Watchdog started (PID: $$)"
echo $$ > /tmp/watchdog.pid

while true; do
    # Check Engine
    check_and_restart         http://localhost:8001/api/v1/ai/health         Engine         "$ROOT/07-AI-ENGINE/.venv/bin/python3 -m uvicorn main:app --host 0.0.0.0 --port 8001 --workers 1 --log-level warning"         /tmp/ai-engine.log         $ROOT/07-AI-ENGINE

    # Check Hub
    check_and_restart         http://localhost:3000         Hub         "$NODE node_modules/.bin/next start -p 3000"         /tmp/hub.log         $ROOT/hub/dashboard

    # Check Portal
    check_and_restart         http://localhost:3001/dashboard         Portal         "$NODE node_modules/.bin/next start -p 3001"         /tmp/portal.log         $ROOT/11-WORKSPACES/triangle-black/portal

    # Check TB Admin
    check_and_restart         http://localhost:8030         TBAdmin         "$ROOT/11-WORKSPACES/triangle-black/.venv/bin/python3 -m uvicorn src.main:app --host 0.0.0.0 --port 8030 --workers 1 --log-level warning"         /tmp/tb-admin.log         $ROOT/11-WORKSPACES/triangle-black

    sleep 60  # Check every 60 seconds
done
