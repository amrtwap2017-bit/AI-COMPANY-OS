#!/bin/bash
echo "🚨 EMERGENCY STOP — AI COMPANY OS"
echo "=================================="

# Kill by port
for port in 8001 8030 3000 3001 11434; do
  pid=$(lsof -t -i:$port 2>/dev/null)
  if [ -n "$pid" ]; then
    kill -9 $pid 2>/dev/null
    echo "  ✅ Port $port killed (PID: $pid)"
  else
    echo "  ➖ Port $port was free"
  fi
done

# Kill by process name
for proc in uvicorn "next-server" "npm run" python3 node ollama; do
  pkill -9 -f "$proc" 2>/dev/null && echo "  ✅ $proc killed" || echo "  ➖ $proc not running"
done

# Stop Docker containers (pause only — preserves data)
docker pause ai-qdrant ai-postgres ai-redis ai-ollama 2>/dev/null && \
  echo "  ✅ Docker containers paused" || \
  echo "  ➖ Docker containers already stopped"

echo ""
echo "=== CPU AFTER KILL ==="
sleep 2
top -bn1 | head -5

echo ""
echo "=== MEMORY FREED ==="
free -h | grep Mem

echo ""
echo "✅ System safe. Run bash START-ALL.sh to restart."
