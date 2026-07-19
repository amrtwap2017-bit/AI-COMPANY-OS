#!/bin/bash
# CPU-SAFE startup — limits resource usage
export PATH="/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin:$HOME/.local/bin:$HOME/bin"

echo "=== CPU-SAFE STARTUP ==="

# Limit Docker containers
docker update --cpus="2" ai-ollama   2>/dev/null && echo "  Ollama: max 2 CPUs"
docker update --cpus="2" ai-postgres 2>/dev/null && echo "  Postgres: max 2 CPUs"
docker update --cpus="1" ai-qdrant   2>/dev/null && echo "  Qdrant: max 1 CPU"
docker update --cpus="1" ai-redis    2>/dev/null && echo "  Redis: max 1 CPU"

# Start Docker services
docker start ai-qdrant ai-postgres ai-redis ai-ollama 2>/dev/null
sleep 3

# Start AI Engine with low priority
echo "=== Starting AI Engine (low priority) ==="
cd /home/amr/AI-COMPANY-OS/07-AI-ENGINE
POSTGRES_PASSWORD=postgres \
POSTGRES_USER=postgres \
POSTGRES_DB=ai_company_os \
POSTGRES_HOST=localhost \
nice -n 10 nohup .venv/bin/python3 -m uvicorn main:app \
  --host 0.0.0.0 --port 8001 --workers 1 \
  > /tmp/ai-engine.log 2>&1 &
echo "Engine PID: $! (nice +10)"

# Start TB Admin with low priority
echo "=== Starting TB Admin (low priority) ==="
cd /home/amr/AI-COMPANY-OS/11-WORKSPACES/triangle-black
TRIANGLE_BLACK_DB_URL="postgresql+psycopg2://ai:ai123@127.0.0.1:5432/triangle_black" \
PYTHONPATH="/home/amr/AI-COMPANY-OS/11-WORKSPACES/triangle-black" \
nice -n 10 nohup .venv/bin/uvicorn main:app \
  --host 0.0.0.0 --port 8030 --workers 1 \
  > /tmp/tb-admin.log 2>&1 &
echo "TB PID: $! (nice +10)"

sleep 12

# Health check
/usr/bin/curl -s -o /dev/null -w "Engine:   %{http_code}\n" http://localhost:8001/api/v1/ai/health
/usr/bin/curl -s -o /dev/null -w "TB Admin: %{http_code}\n" http://localhost:8030/api/health
/usr/bin/curl -s -o /dev/null -w "Qdrant:   %{http_code}\n" http://localhost:6333/healthz

echo "=== CPU USAGE NOW ==="
ps aux --sort=-%cpu | head -8
