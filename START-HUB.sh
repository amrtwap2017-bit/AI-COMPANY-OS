#!/bin/bash
export PATH="/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin:$HOME/.local/bin:$HOME/bin"
FNM="$HOME/.local/share/fnm"
export PATH="$FNM:$PATH"
eval "$($FNM/fnm env 2>/dev/null)"

pkill -f "next-server.*3000" 2>/dev/null
sleep 2

cd /home/amr/AI-COMPANY-OS/hub/dashboard
nohup npm run dev > /tmp/hub.log 2>&1 &
HUB_PID=$!
echo "Hub PID: $HUB_PID"
disown $HUB_PID
sleep 15
/usr/bin/curl -s -o /dev/null -w "Hub: %{http_code}\n" http://localhost:3000
