#!/bin/bash
export PATH="/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin:$HOME/.local/bin:$HOME/bin"

echo "=== Starting Docker services ==="
docker start ai-qdrant ai-postgres ai-redis 2>/dev/null | xargs -I{} echo "  {}" || true
# Start Ollama with CPU limit
docker update --cpus="4" ai-ollama 2>/dev/null || true
docker start ai-ollama 2>/dev/null && echo "  ai-ollama started (max 4 CPUs)"
sleep 3

echo "=== Killing old processes ==="
kill $(lsof -t -i:8001) 2>/dev/null
kill $(lsof -t -i:8030) 2>/dev/null
sleep 2

echo "=== Starting AI Engine ==="
cd /home/amr/AI-COMPANY-OS/07-AI-ENGINE
POSTGRES_PASSWORD=postgres \
POSTGRES_USER=postgres \
POSTGRES_DB=ai_company_os \
POSTGRES_HOST=localhost \
nice -n 5 nohup .venv/bin/python3 -m uvicorn main:app \
  --host 0.0.0.0 --port 8001 --workers 1 \
  > /tmp/ai-engine.log 2>&1 &
ENGINE_PID=$!
echo "Engine PID: $ENGINE_PID"

echo "=== Starting TB Admin ==="
cd /home/amr/AI-COMPANY-OS/11-WORKSPACES/triangle-black
TRIANGLE_BLACK_DB_URL="postgresql+psycopg2://ai:ai123@127.0.0.1:5432/triangle_black" \
PYTHONPATH="/home/amr/AI-COMPANY-OS/11-WORKSPACES/triangle-black" \
nice -n 5 nohup .venv/bin/uvicorn main:app \
  --host 0.0.0.0 --port 8030 --workers 1 \
  > /tmp/tb-admin.log 2>&1 &
TB_PID=$!
echo "TB Admin PID: $TB_PID"

echo "=== Waiting 12 seconds ==="
sleep 12

echo "=== Health Check ==="
/usr/bin/curl -s -o /dev/null -w "Engine:  %{http_code}\n" http://localhost:8001/api/v1/ai/health
/usr/bin/curl -s -o /dev/null -w "TB Admin:%{http_code}\n" http://localhost:8030/api/health
/usr/bin/curl -s -o /dev/null -w "Qdrant:  %{http_code}\n" http://localhost:6333/healthz

echo "=== Process check ==="
kill -0 $ENGINE_PID 2>/dev/null && echo "Engine: ALIVE" || echo "Engine: DEAD"
kill -0 $TB_PID    2>/dev/null && echo "TB Admin: ALIVE" || echo "TB Admin: DEAD"

echo "=== CPU after startup ==="
ps aux --sort=-%cpu | head -6
