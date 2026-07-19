#!/bin/bash
echo "╔══════════════════════════════════════╗"
echo "║   AI COMPANY OS — FULL STARTUP      ║"
echo "╚══════════════════════════════════════╝"

bash /home/amr/AI-COMPANY-OS/START-BACKENDS.sh
bash /home/amr/AI-COMPANY-OS/START-HUB.sh
bash /home/amr/AI-COMPANY-OS/START-PORTAL.sh

echo ""
echo "╔══════════════════════════════════════╗"
echo "║        SYSTEM STATUS BOARD          ║"
echo "╚══════════════════════════════════════╝"
for svc in \
  "http://localhost:8001/api/v1/ai/health   AI-Engine  :8001" \
  "http://localhost:8030/api/health          TB-Admin   :8030" \
  "http://localhost:3000                     Hub        :3000" \
  "http://localhost:3001/dashboard           Portal     :3001" \
  "http://localhost:6333/healthz             Qdrant     :6333" \
  "http://localhost:8001/api/v1/ai/cache/status Redis   :8001"; do
  url=$(echo $svc | awk '{print $1}')
  name=$(echo $svc | awk '{print $2, $3}')
  code=$(/usr/bin/curl -s -o /dev/null -w "%{http_code}" $url)
  icon=$([ "$code" = "200" ] && echo "✅" || echo "❌")
  echo "  $icon $name → $code"
done

echo ""
echo "URLs:"
echo "  Hub Dashboard:  http://localhost:3000"
echo "  TB Portal:      http://localhost:3001"
echo "  AI Engine API:  http://localhost:8001/docs"
echo "  TB Admin API:   http://localhost:8030/docs"
echo "  OpenWebUI:      http://localhost:3400"

# === Ensure Nginx HTTPS proxy is running ===
if command -v nginx >/dev/null 2>&1; then
    sudo systemctl is-active nginx >/dev/null 2>&1 \
        || sudo systemctl start nginx 2>/dev/null
    echo "Nginx: $(sudo systemctl is-active nginx 2>/dev/null || echo 'check manually')"
fi
