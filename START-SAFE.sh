#!/bin/bash
# ═══════════════════════════════════════════════
#  AI COMPANY OS — SAFE MODE STARTUP
#  Designed for: 16GB RAM / RTX 3000 6GB
#  Rule: Never exceed 12GB RAM / 70% CPU
# ═══════════════════════════════════════════════

echo "╔══════════════════════════════════════╗"
echo "║   AI COMPANY OS — SAFE MODE START   ║"
echo "╚══════════════════════════════════════╝"

# ── 1. Set Ollama limits BEFORE anything starts ──
export OLLAMA_MAX_LOADED_MODELS=1
export OLLAMA_KEEP_ALIVE="5m"
export OLLAMA_NUM_PARALLEL=1
export OLLAMA_MAX_QUEUE=5

# ── 2. Start Docker (lightweight services only) ──
echo "=== Starting Docker services ==="
docker start ai-postgres 2>/dev/null && echo "  ✅ Postgres"
docker start ai-redis    2>/dev/null && echo "  ✅ Redis"
docker start ai-qdrant   2>/dev/null && echo "  ✅ Qdrant"
# OpenWebUI stays OFF by default — it eats 500MB+ RAM
# To start: docker start ai-open-webui
sleep 3

# ── 3. Start Ollama (if not running) ──
echo "=== Starting Ollama ==="
pgrep -f "ollama serve" >/dev/null || {
    nohup ollama serve > /tmp/ollama.log 2>&1 &
    sleep 3
}
echo "  Ollama: $(ollama ps 2>/dev/null | wc -l) models loaded"

# ── 4. Kill old processes ──
echo "=== Cleaning old processes ==="
pkill -f "07-AI-ENGINE" 2>/dev/null
fuser -k 8001/tcp 2>/dev/null
fuser -k 8030/tcp 2>/dev/null
fuser -k 3000/tcp 2>/dev/null
fuser -k 3001/tcp 2>/dev/null
sleep 2

# ── 5. Start AI Engine ──
echo "=== Starting AI Engine ==="
cd /home/amr/AI-COMPANY-OS/07-AI-ENGINE
nohup .venv/bin/python3 -m uvicorn main:app \
  --host 0.0.0.0 --port 8001 \
  --workers 1 \
  --log-level warning > /tmp/ai-engine.log 2>&1 &
echo "  Engine PID: $!"

# ── 6. Start TB Admin ──
echo "=== Starting TB Admin ==="
cd /home/amr/AI-COMPANY-OS/11-WORKSPACES/triangle-black
nohup .venv/bin/python3 -m uvicorn src.main:app \
  --host 0.0.0.0 --port 8030 \
  --workers 1 \
  --log-level warning > /tmp/tb-admin.log 2>&1 &
echo "  TB Admin PID: $!"

# ── 7. Wait for APIs before starting frontends ──
echo "=== Waiting for APIs (10s) ==="
sleep 10

# ── 8. Start Hub (1 frontend at a time) ──
echo "=== Starting Hub Dashboard ==="
cd /home/amr/AI-COMPANY-OS/hub/dashboard
nohup node node_modules/.bin/next start -p 3000 > /tmp/hub.log 2>&1 &
echo "  Hub PID: $!"
sleep 3

# ── 9. Start Portal ──
echo "=== Starting Portal ==="
cd /home/amr/AI-COMPANY-OS/11-WORKSPACES/triangle-black/portal
nohup node node_modules/.bin/next start -p 3001 > /tmp/portal.log 2>&1 &
echo "  Portal PID: $!"
sleep 3

# ── 10. Health check ──
echo ""
echo "=== Health Check ==="
for svc in \
  "http://localhost:8001/api/v1/ai/health Engine" \
  "http://localhost:8030/api/health TBAdmin" \
  "http://localhost:3000 Hub" \
  "http://localhost:3001/dashboard Portal"; do
  url=$(echo $svc | /usr/bin/awk '{print $1}')
  name=$(echo $svc | /usr/bin/awk '{print $2}')
  code=$(curl -s -o /dev/null -w "%{http_code}" --max-time 5 $url)
  [ "$code" = "200" ] && echo "  ✅ $name" || echo "  ❌ $name ($code)"
done

# ── 11. RAM report ──
echo ""
echo "=== Resource Usage ==="
free -h | /usr/bin/awk 'NR==2{printf "  RAM: %s used / %s total (Free: %s)\n",$3,$2,$4}'
echo "  Ollama models loaded: $(ollama ps 2>/dev/null | tail -n +2 | wc -l)"
echo ""
echo "╔══════════════════════════════════════╗"
echo "║  SAFE MODE ACTIVE                   ║"
echo "║  Hub:    http://localhost:3000       ║"
echo "║  Portal: http://localhost:3001       ║"
echo "║  Engine: http://localhost:8001/docs  ║"
echo "║                                     ║"
echo "║  ⚠️  Task processor: DISABLED        ║"
echo "║  ⚠️  OpenWebUI: OFF (saves 500MB)   ║"
echo "║  To enable: docker start ai-open-webui  ║"
echo "╚══════════════════════════════════════╝"
