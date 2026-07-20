#!/bin/bash
# ══════════════════════════════════════════════════════
#  AI COMPANY OS — SAFE STARTUP
#  ZBook G7 / 16GB RAM / RTX 3000 6GB
# ══════════════════════════════════════════════════════

set -e

# Colors
GREEN='\033[0;32m' RED='\033[0;31m' YELLOW='\033[1;33m' NC='\033[0m'
ok()   { echo -e "${GREEN}  ✅ $1${NC}"; }
warn() { echo -e "${YELLOW}  ⚠️  $1${NC}"; }
err()  { echo -e "${RED}  ❌ $1${NC}"; }

NODE="/home/amr/.local/share/fnm/node-versions/v24.18.0/installation/bin/node"
export PATH="/home/amr/.local/share/fnm/node-versions/v24.18.0/installation/bin:$PATH"

# Ollama safe limits
export OLLAMA_MAX_LOADED_MODELS=1
export OLLAMA_KEEP_ALIVE=5m
export OLLAMA_NUM_PARALLEL=1
export OLLAMA_MAX_QUEUE=5
export OLLAMA_NUM_GPU=999
export CUDA_VISIBLE_DEVICES=0

echo "╔══════════════════════════════════════════════╗"
echo "║      AI COMPANY OS — SAFE MODE START        ║"
echo "║      $(date '+%Y-%m-%d %H:%M:%S')                    ║"
echo "╚══════════════════════════════════════════════╝"

# ── Pre-check: RAM ──────────────────────────────────
echo ""
echo "── Pre-flight Check ──"
RAM_FREE=$(free -m | /usr/bin/awk 'NR==2{print $7}')
RAM_TOTAL=$(free -m | /usr/bin/awk 'NR==2{print $2}')
echo "  RAM: ${RAM_FREE}MB free / ${RAM_TOTAL}MB total"
if [ "$RAM_FREE" -lt 2000 ]; then
    warn "Low RAM (${RAM_FREE}MB) — killing old processes"
    pkill -f "next" 2>/dev/null || true
    pkill -f "07-AI-ENGINE" 2>/dev/null || true
    sleep 3
fi

# ── Step 1: Docker ──────────────────────────────────
echo ""
echo "── Step 1: Docker Services ──"
for container in ai-postgres ai-redis ai-qdrant; do
    docker start $container 2>/dev/null && ok "$container started" \
      || warn "$container already running or failed"
done
sleep 3

# ── Step 2: Kill old processes ──────────────────────
echo ""
echo "── Step 2: Clean Old Processes ──"
pkill -f "07-AI-ENGINE" 2>/dev/null || true
pkill -f "next" 2>/dev/null || true
sleep 1
for port in 8001 8030 3000 3001; do
    fuser -k ${port}/tcp 2>/dev/null || true
done
sleep 2
ok "Ports cleared"

# ── Step 3: AI Engine ───────────────────────────────
echo ""
echo "── Step 3: AI Engine ──"
cd /home/amr/AI-COMPANY-OS/07-AI-ENGINE
nohup .venv/bin/python3 -m uvicorn main:app \
    --host 0.0.0.0 --port 8001 \
    --workers 1 \
    --log-level warning > /tmp/ai-engine.log 2>&1 &
ENGINE_PID=$!
ok "Engine PID: $ENGINE_PID"

# ── Step 4: TB Admin ────────────────────────────────
echo ""
echo "── Step 4: TB Admin ──"
cd /home/amr/AI-COMPANY-OS/11-WORKSPACES/triangle-black
nohup .venv/bin/python3 -m uvicorn src.main:app \
    --host 0.0.0.0 --port 8030 \
    --workers 1 \
    --log-level warning > /tmp/tb-admin.log 2>&1 &
TB_PID=$!
ok "TB Admin PID: $TB_PID"

# ── Step 5: Wait for APIs ───────────────────────────
echo ""
echo "── Step 5: Waiting for APIs (15s) ──"
sleep 15

for url_name in "http://localhost:8001/api/v1/ai/health Engine" \
                "http://localhost:8030/ TBAdmin"; do
    url=$(echo $url_name | /usr/bin/awk '{print $1}')
    name=$(echo $url_name | /usr/bin/awk '{print $2}')
    code=$(curl -s -o /dev/null -w "%{http_code}" --max-time 5 "$url")
    [ "$code" = "200" ] && ok "$name: UP" || warn "$name: $code"
done

# ── Step 5b: Ensure builds exist ──
echo "=== Checking builds ==="
for dir_port in "$HUB_DIR:3000" "$PORTAL_DIR:3001"; do
  dir=$(echo $dir_port | cut -d: -f1)
  port=$(echo $dir_port | cut -d: -f2)
  if [ ! -f "$dir/.next/BUILD_ID" ]; then
    echo "  Building $dir..."
    cd "$dir" && node node_modules/.bin/next build 2>&1 | tail -3
  fi
done

# ── Step 6: Hub Dashboard ───────────────────────────
echo ""
echo "── Step 6: Hub Dashboard ──"
cd /home/amr/AI-COMPANY-OS/hub/dashboard
nohup $NODE node_modules/.bin/next start -p 3000 \
    > /tmp/hub.log 2>&1 &
HUB_PID=$!
ok "Hub PID: $HUB_PID"
sleep 5

# ── Step 7: Portal ──────────────────────────────────
echo ""
echo "── Step 7: Portal ──"
cd /home/amr/AI-COMPANY-OS/11-WORKSPACES/triangle-black/portal
nohup $NODE node_modules/.bin/next start -p 3001 \
    > /tmp/portal.log 2>&1 &
PORTAL_PID=$!
ok "Portal PID: $PORTAL_PID"
sleep 5

# ── Step 8: Nginx ───────────────────────────────────
echo ""
echo "── Step 8: Nginx HTTPS ──"
sudo systemctl is-active nginx >/dev/null 2>&1 \
    || sudo systemctl start nginx 2>/dev/null
ok "Nginx running"

# ── Step 9: OpenWebUI (optional) ───────────────────
echo ""
echo "── Step 9: OpenWebUI (optional) ──"
docker start ai-open-webui 2>/dev/null && ok "OpenWebUI started" \
    || warn "OpenWebUI skipped"

# ── Final Health Check ──────────────────────────────
echo ""
echo "── Final Health Check ──"
sleep 5
ALL_OK=true

for svc in \
    "http://localhost:8001/api/v1/ai/health Engine:8001" \
    "http://localhost:8030/ TBAdmin:8030" \
    "http://localhost:3000 Hub:3000" \
    "http://localhost:3001/dashboard Portal:3001" \
    "https://localhost/nginx-health Nginx:443"; do
    url=$(echo $svc | /usr/bin/awk '{print $1}')
    name=$(echo $svc | /usr/bin/awk '{print $2}')
    code=$(curl -sk -o /dev/null -w "%{http_code}" --max-time 8 "$url")
    if [ "$code" = "200" ]; then
        ok "$name"
    else
        err "$name ($code)"
        ALL_OK=false
    fi
done

# ── RAM Report ──────────────────────────────────────
echo ""
echo "── Resource Usage ──"
free -h | /usr/bin/awk 'NR==2{printf "  RAM: %s used / %s total (Free: %s)\n",$3,$2,$4}'
ollama ps 2>/dev/null | head -3

echo ""
echo "╔══════════════════════════════════════════════╗"
echo "║  URLS:                                       ║"
echo "║  Hub      → http://localhost:3000            ║"
echo "║  Portal   → http://localhost:3001            ║"
echo "║  HTTPS    → https://localhost                ║"
echo "║  Engine   → http://localhost:8001/docs       ║"
echo "║  TB Admin → http://localhost:8030/docs       ║"
echo "║  OpenWebUI→ http://localhost:3400            ║"
echo "║                                              ║"
echo "║  Monitor  → bash HEALTH-MONITOR.sh           ║"
echo "║  Stop all → bash STOP-ALL.sh                 ║"
echo "╚══════════════════════════════════════════════╝"
