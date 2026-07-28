#!/bin/bash
BACKEND="http://localhost:8030"
PORTAL="http://localhost:3000"
ISSUES=0

echo "=== Triangle Black Health Check $(date) ==="

# Backend
if curl -s -o /dev/null -w "%{http_code}" "$BACKEND/api/v1/ai/health" | grep -q "200"; then
    echo "✅ Backend: UP"
else
    echo "❌ Backend: DOWN — restarting..."
    cd /home/amr/AI-COMPANY-OS/11-WORKSPACES/triangle-black
    nohup .venv/bin/python3 -m uvicorn src.main:app --host 0.0.0.0 --port 8030 --workers 1 --log-level warning > /tmp/tb_backend.log 2>&1 &
    ISSUES=$((ISSUES+1))
fi

# Portal
if curl -s -o /dev/null -w "%{http_code}" "$PORTAL/login" | grep -q "200"; then
    echo "✅ Portal: UP"
else
    echo "❌ Portal: DOWN — restarting..."
    cd /home/amr/AI-COMPANY-OS/11-WORKSPACES/triangle-black/portal
    nohup node node_modules/.bin/next start --port 3000 > /tmp/tb_portal.log 2>&1 &
    ISSUES=$((ISSUES+1))
fi

# Database
if docker exec ai-postgres psql -U ai -d triangle_black -c "SELECT 1" > /dev/null 2>&1; then
    echo "✅ Database: UP"
else
    echo "❌ Database: DOWN"
    ISSUES=$((ISSUES+1))
fi

# Twin score
TOKEN=$(curl -s -X POST $BACKEND/api/v1/auth/login -d "username=amr@triangleblack.com&password=admin123" | python3 -c "import sys,json; print(json.load(sys.stdin).get('access_token',''))" 2>/dev/null)
if [ -n "$TOKEN" ]; then
    SCORE=$(curl -s -H "Authorization: Bearer $TOKEN" $BACKEND/api/v1/twin/state | python3 -c "import sys,json; print(json.load(sys.stdin).get('health_score',0))" 2>/dev/null)
    if [ "$SCORE" -ge 95 ] 2>/dev/null; then
        echo "✅ Twin Score: $SCORE/100"
    else
        echo "⚠️  Twin Score: $SCORE/100 (below 95)"
    fi
fi

echo "=== Issues: $ISSUES ==="
exit $ISSUES
