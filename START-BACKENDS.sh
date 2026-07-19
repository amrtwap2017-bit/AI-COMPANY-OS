#!/bin/bash
export PATH="/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin:$HOME/.local/bin:$HOME/bin"

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
nohup .venv/bin/python3 -m uvicorn main:app \
  --host 0.0.0.0 --port 8001 \
  > /tmp/ai-engine.log 2>&1 &
ENGINE_PID=$!
echo "Engine PID: $ENGINE_PID"

echo "=== Starting TB Admin ==="
cd /home/amr/AI-COMPANY-OS/11-WORKSPACES/triangle-black
PYTHONPATH="/home/amr/AI-COMPANY-OS/11-WORKSPACES/triangle-black" \
  .venv/bin/uvicorn main:app --host 0.0.0.0 --port 8030 \
  > /tmp/tb-admin.log 2>&1 &
TB_PID=$!
echo "TB Admin PID: $TB_PID"

echo "=== Waiting 12 seconds ==="
sleep 12

echo "=== Health Check ==="
/usr/bin/curl -s -o /dev/null -w "Engine:  %{http_code}\n" http://localhost:8001/api/v1/ai/health
/usr/bin/curl -s -o /dev/null -w "TB Admin:%{http_code}\n" http://localhost:8030/api/health
/usr/bin/curl -s -o /dev/null -w "Qdrant:  %{http_code}\n" http://localhost:6333/healthz

echo "=== Checking if processes alive ==="
kill -0 $ENGINE_PID 2>/dev/null && echo "Engine: ALIVE" || echo "Engine: DEAD - check /tmp/ai-engine.log"
kill -0 $TB_PID    2>/dev/null && echo "TB Admin: ALIVE" || echo "TB Admin: DEAD - check /tmp/tb-admin.log"

echo "=== Warming up Ollama model ==="
/usr/bin/curl -s http://localhost:11434/api/generate \
  -d '{"model":"qwen2.5-coder:7b","prompt":"hi","stream":false}' \
  --connect-timeout 10 > /dev/null 2>&1 && echo "Ollama: warm" || echo "Ollama: skip"
