#!/usr/bin/env bash
# Triangle Black — Start All Services
# Usage: ./start.sh [--no-hub] [--no-portal] [--no-client]
set -e

TB_ROOT="/home/amr/AI-COMPANY-OS/11-WORKSPACES/triangle-black"
HUB_ROOT="/home/amr/AI/projects/AI-ENGINEERING-HUB"
AICOS_ROOT="/home/amr/AI/projects/ai-company-os/apps/api"

NO_HUB=false
NO_PORTAL=false
NO_CLIENT=false

for arg in "$@"; do
  case $arg in
    --no-hub)    NO_HUB=true ;;
    --no-portal) NO_PORTAL=true ;;
    --no-client) NO_CLIENT=true ;;
  esac
done

GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

log()  { echo -e "${BLUE}[TB]${NC} $1"; }
ok()   { echo -e "${GREEN}[OK]${NC} $1"; }
warn() { echo -e "${YELLOW}[!!]${NC} $1"; }
err()  { echo -e "${RED}[ER]${NC} $1"; }

echo ""
echo -e "${BLUE}╔══════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║     Triangle Black — Starting Platform   ║${NC}"
echo -e "${BLUE}╚══════════════════════════════════════════╝${NC}"
echo ""

# ─── 1. Docker Infrastructure ────────────────────────────────────────────────
log "Starting Docker containers..."
docker compose -f "$HUB_ROOT/infra/compose.yml" up -d 2>/dev/null && \
  ok "Hub infra (postgres:55432 + redis:56379)" || warn "Hub infra already up"

# Wait for postgres
until docker exec infra-postgres-1 pg_isready -U postgres -q 2>/dev/null; do
  sleep 1
done
ok "Hub PostgreSQL ready"

until docker exec ai-postgres pg_isready -U ai -q 2>/dev/null; do
  sleep 1
done
ok "AICOS PostgreSQL ready"

# ─── 2. AICOS (port 8000) ────────────────────────────────────────────────────
log "Starting AI Company OS (port 8000)..."
pkill -f "uvicorn app.models.main" 2>/dev/null || true
sleep 1
cd "$AICOS_ROOT" && \
source .venv/bin/activate && \
uvicorn app.models.main:app --host 0.0.0.0 --port 8000 --reload \
  > /tmp/tb-aicos.log 2>&1 &
AICOS_PID=$!

sleep 4
if curl -sf http://127.0.0.1:8000/api/v1/health/live > /dev/null 2>&1; then
  ok "AICOS running (pid $AICOS_PID) → http://127.0.0.1:8000"
else
  warn "AICOS may still be starting — check /tmp/tb-aicos.log"
fi

# ─── 3. AI Engineering Hub (port 8010) ───────────────────────────────────────
if [ "$NO_HUB" = false ]; then
  log "Starting AI Engineering Hub (port 8010)..."
  pkill -f "python -m hub.main" 2>/dev/null || true
  sleep 2
  cd "$HUB_ROOT"
  . .venv/bin/activate
  export POSTGRES_DSN="postgresql+psycopg://postgres:postgres@127.0.0.1:55432/ai_hub"
  export AI_COMPANY_OS_BASE_URL="http://127.0.0.1:8000"
  PYTHONPATH=hub/src alembic upgrade head > /tmp/tb-hub-migrate.log 2>&1
  PYTHONPATH=hub/src python -m hub.main > /tmp/tb-hub.log 2>&1 &
  HUB_PID=$!
  sleep 5
  if curl -sf http://127.0.0.1:8010/health > /dev/null 2>&1; then
    ok "Hub running (pid $HUB_PID) → http://127.0.0.1:8010"
  else
    warn "Hub may still be starting — check /tmp/tb-hub.log"
  fi
fi

# ─── 4. Triangle Black API (port 8020) ───────────────────────────────────────
log "Starting Triangle Black API (port 8020)..."
pkill -f "uvicorn src.main" 2>/dev/null || true
sleep 1
cd "$TB_ROOT"
export TRIANGLE_BLACK_DB_URL="postgresql+psycopg2://ai:ai123@127.0.0.1:5432/triangle_black"
export PYTHONPATH="$TB_ROOT"
.venv/bin/uvicorn src.main:app --host 0.0.0.0 --port 8030 \
  > /tmp/tb-api.log 2>&1 &
API_PID=$!
sleep 4
if curl -sf http://127.0.0.1:8030/health > /dev/null 2>&1; then
  ok "Triangle Black API (pid $API_PID) → http://127.0.0.1:8020"
  ok "API Docs → http://127.0.0.1:8030/docs"
else
  warn "API may still be starting — check /tmp/tb-api.log"
fi

# ─── 5. Operations Portal (port 3200) ────────────────────────────────────────
if [ "$NO_PORTAL" = false ]; then
  log "Starting Operations Portal (port 3200)..."
  pkill -f "next dev.*3200" 2>/dev/null || true
  sleep 1
  cd "$TB_ROOT/portal"
  npm run dev -- --port 3200 > /tmp/tb-portal.log 2>&1 &
  PORTAL_PID=$!
  sleep 6
  if curl -sf http://127.0.0.1:3200 > /dev/null 2>&1; then
    ok "Operations Portal (pid $PORTAL_PID) → http://127.0.0.1:3200"
  else
    warn "Portal may still be starting — check /tmp/tb-portal.log"
  fi
fi

# ─── 6. Client Portal (port 3201) ────────────────────────────────────────────
if [ "$NO_CLIENT" = false ] && [ -d "$TB_ROOT/client-portal" ]; then
  log "Starting Client Portal (port 3201)..."
  pkill -f "next dev.*3201" 2>/dev/null || true
  sleep 1
  cd "$TB_ROOT/client-portal"
  npm run dev -- --port 3201 > /tmp/tb-client.log 2>&1 &
  CLIENT_PID=$!
  sleep 6
  if curl -sf http://127.0.0.1:3201 > /dev/null 2>&1; then
    ok "Client Portal (pid $CLIENT_PID) → http://127.0.0.1:3201"
  else
    warn "Client Portal starting — check /tmp/tb-client.log"
  fi
fi

# ─── Summary ─────────────────────────────────────────────────────────────────
echo ""
echo -e "${GREEN}╔══════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║        Triangle Black — Running          ║${NC}"
echo -e "${GREEN}╚══════════════════════════════════════════╝${NC}"
echo ""
echo -e "  ${BLUE}AICOS API${NC}          http://127.0.0.1:8000"
[ "$NO_HUB" = false ] && \
echo -e "  ${BLUE}AI Hub${NC}             http://127.0.0.1:8010"
echo -e "  ${BLUE}Triangle Black API${NC} http://127.0.0.1:8030/docs"
[ "$NO_PORTAL" = false ] && \
echo -e "  ${BLUE}Ops Portal${NC}         http://127.0.0.1:3200"
[ "$NO_CLIENT" = false ] && [ -d "$TB_ROOT/client-portal" ] && \
echo -e "  ${BLUE}Client Portal${NC}      http://127.0.0.1:3201"
echo ""
echo -e "  ${YELLOW}Credentials:${NC}"
echo -e "  admin:   amr@triangleblack.com / Admin123!"
echo -e "  manager: sara@triangleblack.com / Manager123!"
echo -e "  agent:   hassan@triangleblack.com / Agent123!"
echo ""
echo -e "  ${YELLOW}Logs:${NC}"
echo -e "  API:    tail -f /tmp/tb-api.log"
echo -e "  Hub:    tail -f /tmp/tb-hub.log"
echo -e "  Portal: tail -f /tmp/tb-portal.log"
echo ""
echo -e "  ${RED}Stop all:${NC} pkill -f 'uvicorn|next dev|hub.main'"
echo ""
