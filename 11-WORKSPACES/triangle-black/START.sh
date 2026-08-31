#!/bin/bash
# Triangle Black — Full Stack Startup Script
# Usage: bash START.sh [--backend-only] [--portal-only] [--wait]

set -e

BACKEND_PORT=8030
PORTAL_PORT=3000
LOG_DIR=/tmp
BACKEND_LOG=$LOG_DIR/tb_server.log
PORTAL_LOG=$LOG_DIR/tb_portal.log
MAX_WAIT=120
TB_DIR="$(cd "$(dirname "$0")" && pwd)"

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log() { echo -e "${BLUE}[TB]${NC} $1"; }
ok()  { echo -e "${GREEN}[✓]${NC}  $1"; }
warn(){ echo -e "${YELLOW}[!]${NC}  $1"; }
err() { echo -e "${RED}[✗]${NC}  $1"; }

wait_for_url() {
  local url=$1
  local label=$2
  local elapsed=0
  while [ $elapsed -lt $MAX_WAIT ]; do
    local max_wait=60
    local waited=0
    local status="000"
    while [ "$status" != "200" ] && [ $waited -lt $max_wait ]; do
        status=$(curl -s -o /dev/null -w "%{http_code}" "$url" 2>/dev/null || echo "000")
        if [ "$status" = "200" ]; then
            break
        fi
        sleep 2
        waited=$((waited + 2))
    done
    if [ "$status" != "000" ] && [ "$status" != "502" ] && [ "$status" != "503" ]; then
      ok "$label is LIVE (HTTP $status)"
      return 0
    fi
    sleep 3
    elapsed=$((elapsed + 3))
    log "  Waiting for $label... (${elapsed}s)"
  done
  err "$label did not start within ${MAX_WAIT}s"
  return 1
}

BACKEND_ONLY=false
PORTAL_ONLY=false
WAIT_FLAG=false

for arg in "$@"; do
  case $arg in
    --backend-only) BACKEND_ONLY=true ;;
    --portal-only)  PORTAL_ONLY=true ;;
    --wait)         WAIT_FLAG=true ;;
  esac
done

echo ""
echo "  ████████╗██████╗ "
echo "  ╚══██╔══╝██╔══██╗"
echo "     ██║   ██████╔╝"
echo "     ██║   ██╔══██╗"
echo "     ██║   ██████╔╝"
echo "     ╚═╝   ╚═════╝ "
echo "  Triangle Black — Enterprise Operations OS"
echo ""

cd "$TB_DIR"

# --- BACKEND ---
if [ "$PORTAL_ONLY" = false ]; then
  log "Starting backend API on :$BACKEND_PORT..."
  pkill -f "uvicorn src.main" 2>/dev/null || true
  sleep 1

  # Detect DB URL from .env or environment
  if [ -f "$TB_DIR/.env" ]; then
    export $(grep -v '^#' "$TB_DIR/.env" | xargs -d '\n' 2>/dev/null) 2>/dev/null || true
  fi

  export TB_SECRET_KEY="${TB_SECRET_KEY:-triangle-black-dev-secret-2026}"
  export DISABLE_RATE_LIMIT=1

  .venv/bin/uvicorn src.main:app \
    --host 0.0.0.0 \
    --port $BACKEND_PORT \
    --log-level warning \
    > "$BACKEND_LOG" 2>&1 &

  BACKEND_PID=$!
  echo $BACKEND_PID > /tmp/tb_backend.pid
  log "Backend PID: $BACKEND_PID"

  wait_for_url "http://localhost:$BACKEND_PORT/api/v1/health/live" "Backend API"
fi

# --- PORTAL ---
if [ "$BACKEND_ONLY" = false ]; then
  log "Starting Next.js portal on :$PORTAL_PORT..."
  pkill -f "next dev" 2>/dev/null || true
  sleep 1

  cd "$TB_DIR/portal"
  npx next dev -p $PORTAL_PORT > "$PORTAL_LOG" 2>&1 &
  PORTAL_PID=$!
  echo $PORTAL_PID > /tmp/tb_portal.pid
  log "Portal PID: $PORTAL_PID"
  cd "$TB_DIR"

  wait_for_url "http://localhost:$PORTAL_PORT" "Next.js Portal"
fi

echo ""
ok "Triangle Black is LIVE"
echo ""
echo "  Backend:  http://localhost:$BACKEND_PORT"
echo "  Portal:   http://localhost:$PORTAL_PORT"
echo "  API Docs: http://localhost:$BACKEND_PORT/docs"
echo "  Health:   http://localhost:$BACKEND_PORT/api/v1/health/ready"
echo ""
echo "  Logs:"
echo "    tail -f $BACKEND_LOG"
echo "    tail -f $PORTAL_LOG"
echo ""
echo "  Tests:"
echo "    .venv/bin/python -m pytest tests/ -q --tb=no | tail -5"
echo "    cd portal && npx playwright test e2e/ --reporter=list"
echo ""
