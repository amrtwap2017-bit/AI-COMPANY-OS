#!/bin/bash
echo "=== STARTING TRIANGLE BLACK ==="
TB=/home/amr/AI-COMPANY-OS/11-WORKSPACES/triangle-black

# Kill existing
pkill -f "uvicorn src.main" 2>/dev/null
pkill -f "next-server|next dev" 2>/dev/null
sleep 2

# Start Backend
export TB_SECRET_KEY="${TB_SECRET_KEY:-triangle-black-dev-secret-2026}" DISABLE_RATE_LIMIT=1
cd "$TB" && nohup .venv/bin/python3 -m uvicorn src.main:app \
    --host 0.0.0.0 --port 8030 --workers 1 --log-level warning \
    > /tmp/tb_backend.log 2>&1 &
echo "Backend PID: $!"
sleep 5

# Start Portal
cd "$TB/portal" && nohup npx next dev --port 3000 \
    > /tmp/tb_portal.log 2>&1 &
echo "Portal PID: $!"
sleep 12

# Verify
curl -s http://localhost:8030/health | python3 -c "import json,sys; d=json.load(sys.stdin); print(f'Backend: {d[\"service\"]} {d[\"version\"]} OK')" 2>/dev/null
curl -s http://localhost:3000/api/v1/ai/signals/summary | python3 -c "import json,sys; d=json.load(sys.stdin); print(f'Portal proxy OK: critical={d[\"critical\"]} high={d[\"high\"]}')" 2>/dev/null
echo ""
echo "Open: http://localhost:3000"

# ── REDIS (optional — Sprint-205) ────────────────────────────
if command -v redis-cli &> /dev/null && redis-cli ping &> /dev/null; then
  echo "Redis: already running on 6379"
  export REDIS_URL=redis://localhost:6379/0
  export ENABLE_TENANT_RATE_LIMIT=1
elif docker ps --format '{{.Names}}' 2>/dev/null | grep -q tb-redis; then
  echo "Redis: running in Docker"
  export REDIS_URL=redis://localhost:6379/0
  export ENABLE_TENANT_RATE_LIMIT=1
else
  echo "Redis: not running — using in-memory cache fallback"
fi
