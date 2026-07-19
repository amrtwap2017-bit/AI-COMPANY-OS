#!/bin/bash
export PATH="/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin:$HOME/.local/bin:$HOME/bin"

echo "=== Starting AI Company OS ==="

# 1. Docker
docker start ai-qdrant ai-postgres ai-redis ai-n8n ai-open-webui 2>/dev/null
sleep 3

# 2. AI Engine
cd /home/amr/AI-COMPANY-OS/07-AI-ENGINE
PYTHONPATH="$(pwd)" POSTGRES_PASSWORD="postgres" POSTGRES_USER="postgres" POSTGRES_DB="ai_company_os" .venv/bin/uvicorn main:app --host 0.0.0.0 --port 8001 > /tmp/ai-engine.log 2>&1 &
echo "Engine PID: $!"

# 3. TB Admin
cd /home/amr/AI-COMPANY-OS/11-WORKSPACES/triangle-black
PYTHONPATH="$(pwd)" .venv/bin/uvicorn main:app --host 0.0.0.0 --port 8030 > /tmp/tb-admin.log 2>&1 &
echo "TB Admin PID: $!"

sleep 8

# 4. Hub Dashboard (run manually in separate terminal)
echo ""
echo "=== Start Hub manually ==="
echo "cd /home/amr/AI-COMPANY-OS/hub/dashboard && npm run dev"
echo ""
echo "=== Start Portal manually ==="
echo "cd /home/amr/AI-COMPANY-OS/11-WORKSPACES/triangle-black/portal && PORT=3001 npm run dev"
echo ""

# 5. Health check
echo "=== Health Check ==="
/usr/bin/curl -s -o /dev/null -w "Engine: %{http_code}\n" http://localhost:8001/api/v1/ai/health
/usr/bin/curl -s -o /dev/null -w "TB Admin: %{http_code}\n" http://localhost:8030/api/health
/usr/bin/curl -s -o /dev/null -w "Qdrant: %{http_code}\n" http://localhost:6333/healthz
/usr/bin/curl -s -o /dev/null -w "Ollama: %{http_code}\n" http://localhost:11434/api/tags
