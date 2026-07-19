# S12 SESSION BRIEF

## STARTUP
bash /home/amr/AI-COMPANY-OS/START-BACKENDS.sh
bash /home/amr/AI-COMPANY-OS/START-HUB.sh
bash /home/amr/AI-COMPANY-OS/START-PORTAL.sh

## HEALTH CHECK
for svc in "http://localhost:8001/api/v1/ai/health Engine" "http://localhost:8030/api/health TBAdmin" "http://localhost:3000 Hub" "http://localhost:3001/dashboard Portal" "http://localhost:6333/healthz Qdrant" "http://localhost:8001/api/v1/ai/cache/status Redis"; do
  url=$(echo $svc | awk '{print $1}'); name=$(echo $svc | awk '{print $2}')
  code=$(/usr/bin/curl -s -o /dev/null -w "%{http_code}" $url)
  echo "$name: $code"
done

## S11 COMPLETED
- RAG cold start: CONFIRMED grounded on fresh boot
- Chat conversations: saved to DB on every non-stream chat
- Hybrid source field: real filenames (01-PROJECT-IDENTITY.md etc)
- Hybrid vector_score: 0.695 (was 0.000)
- Hub: restarts needed mid-session (flaky - investigate)

## KNOWN ISSUES
1. Hub dies between sessions - needs auto-restart or PM2
2. NEVER --reload on TB Admin
3. NEVER python3 -c multiline in zsh - use heredoc
4. agents table: id/name/description only (no status col)
5. fuser -k PORT/tcp to free ports
6. Engine restart after ANY .py change

## S12 TARGETS

### P0 - Hub stability fix
Hub keeps dying (000 between sessions)
Options: PM2 process manager OR fix START-HUB.sh to use nohup properly
File: START-HUB.sh

### P1 - Conversations: also save stream:true chat
Current: only non-stream saves to conversations table
Fix: accumulate SSE tokens, save full response on done:true

### P1 - active_agents real metric
Current: SELECT COUNT(*) FROM agents = 16 (wrong - all agents)
Fix: SELECT COUNT(DISTINCT assigned_agent) FROM tasks 
     WHERE updated_at > NOW() - INTERVAL '24 hours'

### P1 - Workflow POST trigger
GET /api/v1/ai/workflows: 8 rows confirmed
Test: POST new workflow_run and verify it saves

### P2 - analytics total_conversations now non-zero
After chat saves: SELECT COUNT(*) FROM conversations > 0

### P2 - knowledge/search/hybrid source for keyword-only results
keyword results still show source='knowledge'
Fix: carry source through _keyword_search too

## DB STATE (post S11)
PostgreSQL:
  agents: 16  tasks: 37 (pending:22 completed:7 failed:1)
  workflow_runs: 8  reflections: 7  memories: 16
  knowledge_entries: 125  platform_events: 15
  conversations: 1+ (growing with each chat)

SQLite: leads:3 technicians:3 assets:3 work_orders:3
Qdrant: 45 vectors @ 768-dim, content+source filled

## S12 FIRST COMMANDS
# 1. Check Hub is alive (if not: bash START-HUB.sh)
curl -s -o /dev/null -w "Hub: %{http_code}" http://localhost:3000

# 2. Check conversations grew
PGPASSWORD=postgres psql -U postgres -d ai_company_os -h localhost -c "SELECT COUNT(*) FROM conversations;" 2>/dev/null

# 3. Test workflow trigger
curl -s http://localhost:8001/api/v1/ai/workflows | python3 -m json.tool | head -20
