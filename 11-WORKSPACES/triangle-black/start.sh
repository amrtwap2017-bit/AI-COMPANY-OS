#!/bin/bash
# ============================================================
# Triangle Black — Bare Metal Startup Script
# Sprint 324 — Program K: DevOps Foundation
# Usage: ./start.sh [--rebuild]
# ============================================================

set -e
PORTAL_DIR="$(dirname "$0")/portal"
APP_DIR="$(dirname "$0")"

echo "Triangle Black — Starting Platform"
echo "==================================="

# Kill existing processes
echo "Stopping existing processes..."
pkill -f "uvicorn src.main:app" 2>/dev/null || true
fuser -k 8030/tcp 2>/dev/null || true
fuser -k 3000/tcp 2>/dev/null || true
sleep 3

# Load environment
echo "Loading environment..."
cd "$APP_DIR"
export $(grep -v '^#' .env | grep -v '^$' | xargs)

# Rebuild portal if requested
if [[ "$1" == "--rebuild" ]]; then
  echo "Rebuilding portal..."
  cd "$PORTAL_DIR"
  rm -rf .next
  node node_modules/.bin/next build
  cd "$APP_DIR"
fi

# Start backend
echo "Starting backend (port 8030)..."
nohup .venv/bin/python3 -m uvicorn src.main:app \
  --host 0.0.0.0 \
  --port 8030 \
  --workers 1 \
  --log-level warning \
  > /tmp/tb_backend.log 2>&1 &
BACKEND_PID=$!
echo "Backend PID: $BACKEND_PID"

# Wait for backend
echo "Waiting for backend..."
sleep 10

# Verify backend
HEALTH=$(curl -s http://localhost:8030/api/v1/health 2>/dev/null || echo "")
if echo "$HEALTH" | grep -q "healthy"; then
  echo "✅ Backend healthy"
else
  echo "❌ Backend failed — check /tmp/tb_backend.log"
  exit 1
fi

# Start portal
echo "Starting portal (port 3000)..."
cd "$PORTAL_DIR"
nohup node node_modules/.bin/next start --port 3000 \
  > /tmp/tb_portal.log 2>&1 &
PORTAL_PID=$!
echo "Portal PID: $PORTAL_PID"

sleep 5
echo ""
echo "==================================="
echo "✅ Triangle Black Platform Running"
echo "   Backend: http://localhost:8030"
echo "   Portal:  http://localhost:3000"
echo "   Health:  http://localhost:8030/api/v1/health"
echo ""
echo "Logs:"
echo "   Backend: /tmp/tb_backend.log"
echo "   Portal:  /tmp/tb_portal.log"
echo "==================================="
