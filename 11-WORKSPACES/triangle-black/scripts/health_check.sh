#!/bin/bash
# Triangle Black — Health Monitor
# Schedule: */5 * * * * bash /path/to/scripts/health_check.sh

TB_DIR="$(cd "$(dirname "$0")/.." && pwd)"
BACKEND_URL="${BACKEND_URL:-http://localhost:8030}"
PORTAL_URL="${PORTAL_URL:-http://localhost:3000}"
LOG_FILE="/tmp/tb_health.log"
ALERT_WEBHOOK="${SLACK_WEBHOOK_URL:-}"

RED='\033[0;31m'
GREEN='\033[0;32m'
NC='\033[0m'

timestamp() { date '+%Y-%m-%d %H:%M:%S'; }

check_endpoint() {
  local url=$1
  local label=$2
  local expected=${3:-200}

  status=$(curl -s -o /dev/null -w "%{http_code}" \
    --connect-timeout 5 \
    --max-time 10 \
    "$url" 2>/dev/null || echo "000")

  if [ "$status" = "$expected" ] || ([ "$expected" = "200" ] && [ "${status:0:1}" = "2" ]); then
    echo -e "${GREEN}✓${NC} $label → HTTP $status"
    echo "$(timestamp) OK    $label HTTP $status" >> "$LOG_FILE"
    return 0
  else
    echo -e "${RED}✗${NC} $label → HTTP $status (expected $expected)"
    echo "$(timestamp) FAIL  $label HTTP $status" >> "$LOG_FILE"
    return 1
  fi
}

alert() {
  local message=$1
  echo "$(timestamp) ALERT $message" >> "$LOG_FILE"
  if [ -n "$ALERT_WEBHOOK" ]; then
    curl -s -X POST "$ALERT_WEBHOOK" \
      -H 'Content-type: application/json' \
      --data "{\"text\":\"🚨 Triangle Black Alert: $message\"}" \
      > /dev/null 2>&1
  fi
}

echo ""
echo "=== Triangle Black Health Check — $(timestamp) ==="
echo ""

FAILURES=0

check_endpoint "$BACKEND_URL/api/v1/health/live" "Backend Live"      || FAILURES=$((FAILURES+1))
check_endpoint "$BACKEND_URL/api/v1/health/ready" "Backend Ready"    || FAILURES=$((FAILURES+1))
check_endpoint "$BACKEND_URL/api/v1/executive/summary" "Executive API" || FAILURES=$((FAILURES+1))
check_endpoint "$PORTAL_URL" "Portal Home"                           || FAILURES=$((FAILURES+1))
check_endpoint "$PORTAL_URL/login" "Portal Login"                    || FAILURES=$((FAILURES+1))

echo ""
if [ $FAILURES -eq 0 ]; then
  echo -e "${GREEN}✅ All health checks passed${NC}"
else
  echo -e "${RED}❌ $FAILURES health check(s) failed${NC}"
  alert "$FAILURES health check(s) failed at $(timestamp)"
fi

echo ""
