# S13 SESSION BRIEF

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

## S12 COMPLETED
- Hub/Portal: nohup + disown (survives terminal close)
- Stream chat: saves to conversations table on done:true
- Non-stream chat: saves to conversations table
- active_agents: COUNT(DISTINCT assigned_agent) FROM tasks = 9 real
- total_conversations: growing (2 rows)
- Workflow templates: 5 available (research_report, code_review etc)
- Workflow POST: requires 'template' + 'goal' fields

## KNOWN ISSUES
1. NEVER --reload on TB Admin
2. NEVER python3 -c multiline in zsh
3. agents table: id/name/description only (no status col)
4. fuser -k PORT/tcp to free ports
5. Engine restart after ANY .py change
6. Workflow POST needs: template + goal fields (not template_id)

## S13 TARGETS

### P0 - Workflow POST working trigger
Field names: template + goal (not template_id)
Endpoint: POST /api/v1/ai/workflows/run/template
Test: create real S13 workflow_run in DB

### P1 - keyword-only hybrid results source field
source='knowledge' for keyword-only matches
Fix: carry source through _keyword_search results

### P1 - Memory endpoint test
GET /api/v1/ai/memory/ceo -> 16 rows
Test: POST new memory entry

### P2 - Reflection endpoint test  
GET /api/v1/ai/reflections -> 7 rows
Test: POST new reflection

### P2 - Builder runs endpoint
GET /api/v1/ai/api/v1/ai/builder/runs -> 404
Fix: correct path is /api/v1/ai/builder/runs (84 rows in DB)

## DB STATE
PostgreSQL:
  agents: 16  tasks: 37 (pending:22 completed:7 failed:1)
  workflow_runs: 8  reflections: 7  memories: 16
  knowledge_entries: 125  platform_events: 15
  conversations: 2+ (growing)
  builder_runs: 84 (endpoint may be broken)

SQLite: leads:3 technicians:3 assets:3 work_orders:3
Qdrant: 45 vectors @ 768-dim

## S13 FIRST COMMANDS
# 1. Trigger S13 workflow
curl -s -X POST http://localhost:8001/api/v1/ai/workflows/run/template \
  -H 'Content-Type: application/json' \
  -d '{"template":"code_review","goal":"S13 Polish: keyword source, memory, reflections"}' | \
  python3 -m json.tool

# 2. Check builder runs path
curl -s -o /dev/null -w "%{http_code}" http://localhost:8001/api/v1/ai/builder/runs

# 3. Memory POST test
curl -s http://localhost:8001/api/v1/ai/memory/ceo | python3 -m json.tool | head -20
