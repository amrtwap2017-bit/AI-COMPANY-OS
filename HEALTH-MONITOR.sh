#!/bin/bash
# ══════════════════════════════════════════════════
#  AI COMPANY OS — LIVE HEALTH MONITOR
#  Run: bash HEALTH-MONITOR.sh
#  Press Ctrl+C to stop
# ══════════════════════════════════════════════════

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

check_service() {
    local url=$1 name=$2
    local code=$(curl -sk -o /dev/null -w "%{http_code}" --max-time 3 "$url")
    if [ "$code" = "200" ]; then
        echo -e "  ${GREEN}✅ $name${NC}"
    else
        echo -e "  ${RED}❌ $name ($code)${NC}"
    fi
}

while true; do
    clear
    echo -e "${CYAN}╔══════════════════════════════════════════════════╗${NC}"
    echo -e "${CYAN}║     AI COMPANY OS — HEALTH MONITOR              ║${NC}"
    echo -e "${CYAN}║     $(date '+%Y-%m-%d %H:%M:%S')                      ║${NC}"
    echo -e "${CYAN}╚══════════════════════════════════════════════════╝${NC}"

    # ── RAM ──────────────────────────────────────────
    echo ""
    echo -e "${BLUE}── RAM ──${NC}"
    RAM_INFO=$(free -h | /usr/bin/awk 'NR==2{print $3" used / "$2" total | Free: "$4}')
    RAM_FREE_MB=$(free -m | /usr/bin/awk 'NR==2{print $7}')
    if [ "$RAM_FREE_MB" -gt 3000 ]; then
        echo -e "  ${GREEN}✅ $RAM_INFO${NC}"
    elif [ "$RAM_FREE_MB" -gt 1500 ]; then
        echo -e "  ${YELLOW}⚠️  $RAM_INFO${NC}"
    else
        echo -e "  ${RED}🚨 $RAM_INFO — LOW RAM!${NC}"
    fi

    # ── CPU ──────────────────────────────────────────
    echo ""
    echo -e "${BLUE}── CPU Top Consumers ──${NC}"
    ps aux --sort=-%cpu | head -5 | \
      /usr/bin/awk 'NR>1{
        color=""
        if ($3+0 > 80) color="HIGH"
        else if ($3+0 > 40) color="MED"
        else color="OK"
        printf "  [%s] %5s%% CPU  %5s%% RAM  %s\n",color,$3,$4,$11
      }'

    # ── Ollama GPU Check ─────────────────────────────
    echo ""
    echo -e "${BLUE}── Ollama VRAM ──${NC}"
    OLLAMA_STATUS=$(ollama ps 2>/dev/null)
    if echo "$OLLAMA_STATUS" | grep -q "GPU"; then
        echo -e "  ${GREEN}✅ ON GPU:${NC}"
        echo "$OLLAMA_STATUS" | tail -n +2 | while read line; do
            [ -n "$line" ] && echo "     $line"
        done
    elif echo "$OLLAMA_STATUS" | grep -q "CPU"; then
        echo -e "  ${RED}⚠️  ON CPU (not GPU!) — check CUDA${NC}"
        echo "$OLLAMA_STATUS" | tail -n +2 | while read line; do
            [ -n "$line" ] && echo "     $line"
        done
    else
        echo -e "  ${GREEN}✅ Empty — loads on demand (good!)${NC}"
    fi

    # ── Services ─────────────────────────────────────
    echo ""
    echo -e "${BLUE}── Services ──${NC}"
    check_service "http://localhost:8001/api/v1/ai/health" "AI Engine   :8001"
    check_service "http://localhost:8030/api/health"        "TB Admin    :8030"
    check_service "http://localhost:3000"                   "Hub         :3000"
    check_service "http://localhost:3001/dashboard"         "Portal      :3001"
    check_service "https://localhost/nginx-health"          "Nginx HTTPS :443"

    # ── Docker ───────────────────────────────────────
    echo ""
    echo -e "${BLUE}── Docker ──${NC}"
    docker ps --format "  {{.Names}}: {{.Status}}" 2>/dev/null | while read line; do
        if echo "$line" | grep -q "Up"; then
            echo -e "  ${GREEN}✅${NC}$line"
        else
            echo -e "  ${RED}❌${NC}$line"
        fi
    done

    # ── Health Alerts ─────────────────────────────────
    echo ""
    echo -e "${BLUE}── Alerts ──${NC}"

    # CPU alert
    TOP_CPU=$(ps aux --sort=-%cpu | /usr/bin/awk 'NR==2{print $3}' | cut -d. -f1)
    if [ "${TOP_CPU:-0}" -gt 90 ] 2>/dev/null; then
        echo -e "  ${RED}🚨 CPU SPIKE: ${TOP_CPU}% — AI generating (normal if brief)${NC}"
    else
        echo -e "  ${GREEN}✅ CPU normal (top: ${TOP_CPU:-0}%)${NC}"
    fi

    # RAM alert
    if [ "${RAM_FREE_MB:-9999}" -lt 1500 ] 2>/dev/null; then
        echo -e "  ${RED}🚨 LOW RAM: ${RAM_FREE_MB}MB free — consider stopping OpenWebUI${NC}"
        echo -e "     Run: docker stop ai-open-webui"
    else
        echo -e "  ${GREEN}✅ RAM OK (${RAM_FREE_MB}MB free)${NC}"
    fi

    # ── Log sizes ──────────────────────────────────────
    echo ""
    echo -e "${BLUE}── Log Sizes ──${NC}"
    for log in /tmp/ai-engine.log /tmp/tb-admin.log; do
        if [ -f "$log" ]; then
            size=$(du -sh "$log" 2>/dev/null | cut -f1)
            name=$(basename "$log")
            echo "  $name: $size"
        fi
    done

    echo ""
    echo -e "${CYAN}  Refreshing every 10s — Ctrl+C to stop${NC}"
    sleep 10
done
