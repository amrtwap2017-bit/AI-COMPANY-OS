# S11 SESSION BRIEF

## STARTUP
bash /home/amr/AI-COMPANY-OS/START-BACKENDS.sh
bash /home/amr/AI-COMPANY-OS/START-HUB.sh
bash /home/amr/AI-COMPANY-OS/START-PORTAL.sh

## S10 COMPLETED
- Hybrid search vector_score: FIXED (0.000 -> 0.695)
- Chat RAG: injected into both stream + non-stream paths
- Tasks breakdown: pending:22 completed:7 failed:1
- OpenWebUI: healthy on :3400
- All 7 services: 200
- Workflows: 8 real session records (S1-S8)

## KNOWN ISSUES
1. NEVER --reload on TB Admin
2. NEVER python3 -c multiline in zsh
3. agents table: id/name/description only (no status col)
4. fuser -k PORT/tcp to free ports
5. Engine restart required after ANY .py file change
6. Chat RAG: sync _get_rag_context called inside async (OK in Python)

## S11 TARGETS

### P0 - Confirm chat RAG grounded (both stream modes)
Test: POST /api/v1/ai/chat stream:false
Expected: mentions Egypt, hotel, CRM, engineering

### P1 - Save chat to conversations table  
Table: conversations (0 rows — target: write after each chat)
File: 07-AI-ENGINE/api/v1/routes/chat.py
Add: db INSERT after Ollama response completes

### P1 - Workflow trigger endpoint
GET /api/v1/ai/workflows -> 8 rows confirmed
Test: can we POST to run a new workflow?

### P2 - active_agents metric
Current: SELECT COUNT(*) FROM agents = 16 (all, wrong)
Better: agents active in last 24h via tasks table

### P2 - knowledge/search source field
Hybrid returns source='knowledge' (generic)
Fix: return actual file name from payload

## DB STATE
PostgreSQL:
  agents: 16 (id/name/description only)
  tasks: 37 (pending:22 completed:7 failed:1 running:0)
  workflow_runs: 8 (S1-S8 sessions)
  reflections: 7
  memories: 16
  knowledge_entries: 125
  platform_events: 15
  conversations: 0 (empty - populate via chat)

SQLite: leads:3 technicians:3 assets:3 work_orders:3
Qdrant: 45 vectors @ 768-dim, content field filled

## S11 FIRST COMMANDS
curl -s -X POST http://localhost:8001/api/v1/ai/chat \
  -H 'Content-Type: application/json' \
  -d '{"message":"what is triangle black","stream":false}' | \
  python3 -c "import json,sys; d=json.load(sys.stdin); print(d.get('response','')[:300])"
