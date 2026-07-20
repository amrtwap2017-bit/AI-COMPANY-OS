#!/bin/bash
# Quick service status check
for svc in   "http://localhost:8001/api/v1/ai/health Engine"   "http://localhost:8030/ TBAdmin"   "http://localhost:3000 Hub"   "http://localhost:3001/dashboard Portal"   "https://localhost/nginx-health Nginx"; do
  url=$(echo $svc | /usr/bin/awk '{print $1}')
  name=$(echo $svc | /usr/bin/awk '{print $2}')
  code=$(curl -sk -o /dev/null -w "%{http_code}" --max-time 5 $url)
  [ "$code" = "200" ] && echo "  OK $name" || echo "  DOWN $name ($code)"
done
echo ""
echo "Watchdog: $(cat /tmp/watchdog.pid 2>/dev/null && echo running || echo not running)"
