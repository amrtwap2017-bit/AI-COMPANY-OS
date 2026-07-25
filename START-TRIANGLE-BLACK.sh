#!/bin/bash
# ============================================================
# TRIANGLE BLACK — COMPLETE STARTUP GUIDE
# Run this script to start everything from scratch
# ============================================================

TB="/home/amr/AI-COMPANY-OS/11-WORKSPACES/triangle-black"
VENV="$TB/.venv/bin/python3"

echo ""
echo "=============================================="
echo "  TRIANGLE BLACK — STARTING ALL SERVICES"
echo "=============================================="
echo ""

# ── STEP 1: Start PostgreSQL (Docker) ─────────────────────
echo "[1/6] Checking PostgreSQL..."
if docker ps | grep -q "ai-postgres"; then
    echo "  OK: ai-postgres already running"
else
    docker start ai-postgres 2>/dev/null || \
    docker run -d --name ai-postgres \
      -e POSTGRES_USER=ai \
      -e POSTGRES_PASSWORD=ai123 \
      -e POSTGRES_DB=triangle_black \
      -p 5432:5432 \
      pgvector/pgvector:pg17
    sleep 5
    echo "  OK: PostgreSQL started"
fi

# ── STEP 2: Start Qdrant ──────────────────────────────────
echo "[2/6] Checking Qdrant..."
if docker ps | grep -q "ai-qdrant"; then
    echo "  OK: Qdrant already running"
else
    docker start ai-qdrant 2>/dev/null
    echo "  OK: Qdrant started"
fi

# ── STEP 3: Start Ollama ──────────────────────────────────
echo "[3/6] Checking Ollama..."
if curl -s http://localhost:11434/api/tags > /dev/null 2>&1; then
    echo "  OK: Ollama already running"
else
    ollama serve > /tmp/ollama.log 2>&1 &
    sleep 3
    echo "  OK: Ollama started"
fi

# ── STEP 4: Start FastAPI Backend ─────────────────────────
echo "[4/6] Starting Backend API on :8030..."
pkill -f "uvicorn.*src.main" 2>/dev/null || true
sleep 2
(cd "$TB" && nohup $VENV -m uvicorn src.main:app --host 0.0.0.0 --port 8030 --workers 1 --log-level warning > /tmp/tb_backend.log 2>&1 &)
echo "  Backend PID: $!"
sleep 22

# Check backend
if curl -s --max-time 5 http://localhost:8030/api/v1/ai/health | grep -q "ok"; then
    echo "  OK: Backend alive on :8030"
else
    echo "  WARN: Backend not responding — check: cat /tmp/tb_backend.log"
fi

# ── STEP 5: Build Portal (only if .next missing) ──────────
echo "[5/6] Checking Portal..."
if [ -d "$TB/portal/.next" ] && [ -f "$TB/portal/.next/BUILD_ID" ]; then
    echo "  OK: Portal already built"
else
    echo "  Building portal (takes ~60s)..."
    cd "$TB/portal"
    node node_modules/.bin/next build > /tmp/tb_build.log 2>&1
    if [ $? -eq 0 ]; then
        echo "  OK: Portal built successfully"
    else
        echo "  ERR: Build failed — check: cat /tmp/tb_build.log"
        exit 1
    fi
fi

# ── STEP 6: Start Portal ──────────────────────────────────
echo "[6/6] Starting Portal on :3000..."
pkill -9 -f "next-server" 2>/dev/null || true
sleep 2
cd "$TB/portal"
nohup node node_modules/.bin/next start --port 3000 \
    > /tmp/tb_portal.log 2>&1 &
echo "  Portal PID: $!"
sleep 8

if curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/ | grep -q "200\|307"; then
    echo "  OK: Portal alive on :3000"
else
    echo "  WARN: Portal not responding — check: cat /tmp/tb_portal.log"
fi

echo ""
echo "=============================================="
echo "  ALL SERVICES STARTED"
echo "=============================================="
echo ""
echo "  PORTAL:  http://localhost:3000"
echo "  BACKEND: http://localhost:8030"
echo "  API DOCS: http://localhost:8030/docs"
echo ""
echo "  HEALTH CHECK:"
curl -s --max-time 5 http://localhost:8030/api/v1/version | \
    python3 -c "import json,sys; d=json.load(sys.stdin); print(f'    Version: {d[\"version\"]} | Sprint: {d[\"sprint\"]}')" 2>/dev/null
echo ""
echo "  LOGS:"
echo "    Backend: cat /tmp/tb_backend.log"
echo "    Portal:  cat /tmp/tb_portal.log"
echo ""
echo "  TO STOP:"
echo "    pkill -f 'uvicorn.*src.main'   # stop backend"
echo "    pkill -9 -f 'next-server'       # stop portal"
echo ""
echo "  BROWSER: Hard refresh with Ctrl+Shift+R after first load"
echo "=============================================="
