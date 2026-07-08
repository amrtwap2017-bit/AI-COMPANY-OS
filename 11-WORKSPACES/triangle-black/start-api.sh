#!/usr/bin/env bash
set -e
cd /home/amr/AI-COMPANY-OS/11-WORKSPACES/triangle-black

echo "=== Starting Triangle Black API ==="
source .venv/bin/activate
export $(cat .env | grep -v '#' | xargs)

echo "=== Running migrations ==="
alembic upgrade head 2>/dev/null || echo "Migrations skipped"

echo "=== Starting API on :8030 ==="
uvicorn src.main:app --host 0.0.0.0 --port 8030 --reload
