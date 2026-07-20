# R1 — Process Manager: Keep Services Alive
import os, subprocess, datetime, json, stat

LOG  = '/home/amr/AI-COMPANY-OS/tasks/logs/r1.log'
ROOT = '/home/amr/AI-COMPANY-OS'
NODE = '/home/amr/.local/share/fnm/node-versions/v24.18.0/installation/bin/node'
results = {'created':[], 'fixed':[]}

def log(m):
    ts=datetime.datetime.now().strftime('%H:%M:%S')
    out='['+ts+'] '+str(m)
    print(out,flush=True)
    open(LOG,'a').write(out+chr(10))

log('R1 START — Process Manager')

# Create watchdog script
watchdog = '''#!/bin/bash
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
    check_and_restart \
        http://localhost:8001/api/v1/ai/health \
        Engine \
        "$ROOT/07-AI-ENGINE/.venv/bin/python3 -m uvicorn main:app --host 0.0.0.0 --port 8001 --workers 1 --log-level warning" \
        /tmp/ai-engine.log \
        $ROOT/07-AI-ENGINE

    # Check Hub
    check_and_restart \
        http://localhost:3000 \
        Hub \
        "$NODE node_modules/.bin/next start -p 3000" \
        /tmp/hub.log \
        $ROOT/hub/dashboard

    # Check Portal
    check_and_restart \
        http://localhost:3001/dashboard \
        Portal \
        "$NODE node_modules/.bin/next start -p 3001" \
        /tmp/portal.log \
        $ROOT/11-WORKSPACES/triangle-black/portal

    # Check TB Admin
    check_and_restart \
        http://localhost:8030 \
        TBAdmin \
        "$ROOT/11-WORKSPACES/triangle-black/.venv/bin/python3 -m uvicorn src.main:app --host 0.0.0.0 --port 8030 --workers 1 --log-level warning" \
        /tmp/tb-admin.log \
        $ROOT/11-WORKSPACES/triangle-black

    sleep 60  # Check every 60 seconds
done
'''
watchdog_path = ROOT + '/WATCHDOG.sh'
with open(watchdog_path,'w') as f: f.write(watchdog)
os.chmod(watchdog_path, 0o755)
log('  Created: WATCHDOG.sh')
results['created'].append('WATCHDOG.sh')

# Create systemd-style service checker
checker = '''#!/bin/bash
# Quick service status check
for svc in \
  "http://localhost:8001/api/v1/ai/health Engine" \
  "http://localhost:8030/ TBAdmin" \
  "http://localhost:3000 Hub" \
  "http://localhost:3001/dashboard Portal" \
  "https://localhost/nginx-health Nginx"; do
  url=$(echo $svc | /usr/bin/awk '{print $1}')
  name=$(echo $svc | /usr/bin/awk '{print $2}')
  code=$(curl -sk -o /dev/null -w "%{http_code}" --max-time 5 $url)
  [ "$code" = "200" ] && echo "  OK $name" || echo "  DOWN $name ($code)"
done
echo ""
echo "Watchdog: $(cat /tmp/watchdog.pid 2>/dev/null && echo running || echo not running)"
'''
check_path = ROOT + '/CHECK.sh'
with open(check_path,'w') as f: f.write(checker)
os.chmod(check_path, 0o755)
log('  Created: CHECK.sh')
results['created'].append('CHECK.sh')

# Add watchdog to crontab (restarts on reboot)
cron_line = '@reboot bash /home/amr/AI-COMPANY-OS/START-SAFE.sh >> /tmp/startup.log 2>&1'
r = subprocess.run(['crontab','-l'], capture_output=True, text=True)
existing = r.stdout if r.returncode == 0 else ''
if '@reboot' not in existing and 'START-SAFE' not in existing:
    new_cron = existing.strip() + chr(10) + cron_line + chr(10)
    r2 = subprocess.run(['crontab','-'], input=new_cron,
        capture_output=True, text=True)
    if r2.returncode == 0:
        log('  Added @reboot cron: START-SAFE.sh')
        results['fixed'].append('@reboot cron added')
else:
    log('  @reboot cron already exists')

log('='*40)
log('R1 COMPLETE — Created: '+str(len(results['created'])))
log('  Run watchdog: bash WATCHDOG.sh &')
log('  Check status: bash CHECK.sh')
with open('/home/amr/AI-COMPANY-OS/tasks/logs/r1_result.json','w') as f:
    json.dump(results,f,indent=2)