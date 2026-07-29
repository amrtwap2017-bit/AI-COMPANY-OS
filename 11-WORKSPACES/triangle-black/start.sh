#!/bin/bash
# Triangle Black — Backend Startup Script
# Loads .env then starts uvicorn
cd "$(dirname "$0")"
set -a
source .env
set +a
echo "TB_SECRET_KEY loaded: ${TB_SECRET_KEY:0:16}..."
exec .venv/bin/python3 -m uvicorn src.main:app \
    --host 0.0.0.0 \
    --port 8030 \
    --workers 1 \
    --log-level warning
