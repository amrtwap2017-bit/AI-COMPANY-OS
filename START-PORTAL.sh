#!/bin/bash
export PATH="/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin:$HOME/.local/bin:$HOME/bin"
FNM="$HOME/.local/share/fnm"
export PATH="$FNM:$PATH"
eval "$($FNM/fnm env 2>/dev/null)"

pkill -f "next-server.*3001" 2>/dev/null
sleep 2

cd /home/amr/AI-COMPANY-OS/11-WORKSPACES/triangle-black/portal
nohup npm run dev > /tmp/portal.log 2>&1 &
PORTAL_PID=$!
echo "Portal PID: $PORTAL_PID"
disown $PORTAL_PID
sleep 15
/usr/bin/curl -s -o /dev/null -w "Portal: %{http_code}\n" http://localhost:3001/dashboard
