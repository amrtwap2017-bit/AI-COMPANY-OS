#!/bin/bash
echo "── Stopping AI Company OS ──"

pkill -f "07-AI-ENGINE"  2>/dev/null && echo "  ✅ AI Engine stopped"
pkill -f "next start"    2>/dev/null && echo "  ✅ Next.js stopped"
pkill -f "next-server"   2>/dev/null && echo "  ✅ Next server stopped"
pkill -f "triangle-black.*uvicorn" 2>/dev/null && echo "  ✅ TB Admin stopped"

# Unload Ollama models from VRAM
curl -s -X POST http://localhost:11434/api/generate \
    -d '{"model":"qwen2.5-coder:7b","keep_alive":0}' \
    --max-time 5 >/dev/null 2>&1 && echo "  ✅ Ollama VRAM freed"

docker stop ai-open-webui 2>/dev/null && echo "  ✅ OpenWebUI stopped"

echo ""
echo "  Still running (lightweight):"
docker ps --format "  {{.Names}}: {{.Status}}" 2>/dev/null
echo ""
echo "  RAM freed:"
free -h | /usr/bin/awk 'NR==2{printf "  Used: %s / %s  Free: %s\n",$3,$2,$4}'
