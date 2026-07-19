# S14 SESSION BRIEF

## STARTUP
bash /home/amr/AI-COMPANY-OS/START-BACKENDS.sh
bash /home/amr/AI-COMPANY-OS/START-HUB.sh
bash /home/amr/AI-COMPANY-OS/START-PORTAL.sh

## HEALTH CHECK
for svc in "http://localhost:8001/api/v1/ai/health Engine" "http://localhost:8030/api/health TBAdmin" "http://localhost:3000 Hub" "http://localhost:3001/dashboard Portal" "http://localhost:6333/healthz Qdrant" "http://localhost:8001/api/v1/ai/cache/status Redis"; do
  url=$(echo $svc | awk '{print $1}'); name=$(echo $svc | awk '{print $2}')
  code=$(/usr/bin/curl -s -o /dev/null -w "%{http_code}" $url)
  icon=$([ "$code" = "200" ] && echo "OK" || echo "DOWN"); echo "$icon $name: $code"
done

## S13 COMPLETED
- POST /memory/ceo: working (workspace_id + project_id hardcoded)
- POST /reflections: working (all 9 NOT NULL cols covered)
- POST /workflows/run/template: working (id:9 created)
- Workflow list: DESC order fixed (latest first)
- Hybrid search: real filenames in source field
- Reflections: 7->8, Memories: 16->17

## KNOWN ISSUES
1. NEVER --reload on TB Admin
2. NEVER python3 -c multiline in zsh
3. agents table: id/name/description only
4. fuser -k PORT/tcp to free ports
5. Engine restart after ANY .py change
6. Reflection INSERT needs ALL 9 NOT NULL cols
7. Memory INSERT needs workspace_id + project_id (hardcoded)
8. Builder runs endpoint returns 0 (runs table query mismatch)

## S14 TARGETS

### P0 - Fix builder runs (84 rows in DB, endpoint returns 0)
GET /api/v1/ai/builder/runs -> {"runs":[], "total":0}
84 rows in builder_runs table confirmed
Check: software_builder.py query + model field names

### P1 - Wire conversations to analytics
total_conversations in analytics uses DB count
Should auto-update now that chat saves to conversations

### P1 - Test stream chat saves conversation
stream:true -> conversations table should grow
Test: count before/after stream chat

### P2 - Hub auto-restart on crash
Hub still needs manual bash START-HUB.sh on crash
Option: add cron or systemd unit for resilience

### P2 - Workflow run/ai endpoint test
POST /api/v1/ai/workflows/run/ai
Requires: goal field (AI plans the workflow)

## DB STATE
PostgreSQL:
  agents: 16  tasks: 37 (pending:22 completed:7 failed:1)
  workflow_runs: 9  reflections: 8  memories: 17
  knowledge_entries: 125  platform_events: 15
  conversations: 2+  builder_runs: 84 (endpoint broken)

SQLite: leads:3 technicians:3 assets:3 work_orders:3
Qdrant: 45 vectors @ 768-dim

## S14 FIRST COMMANDS
# 1. Check builder runs raw query
curl -s "http://localhost:8001/api/v1/ai/builder/runs" | python3 -m json.tool | head -10

# 2. Conversations count
PGPASSWORD=postgres psql -U postgres -d ai_company_os -h localhost -c "SELECT COUNT(*) FROM conversations;"

# 3. Run AI workflow
curl -s -X POST http://localhost:8001/api/v1/ai/workflows/run/ai \
  -H 'Content-Type: application/json' \
  -d '{"goal":"Audit all S8-S13 fixes and generate summary report"}' | python3 -m json.tool
