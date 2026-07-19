# AI COMPANY OS — SYSTEM STATE v2.0.0
# Last updated: S20 (post-merge to main)

## STARTUP (in order)
bash /home/amr/AI-COMPANY-OS/START-BACKENDS.sh
bash /home/amr/AI-COMPANY-OS/START-HUB.sh
bash /home/amr/AI-COMPANY-OS/START-PORTAL.sh

## SERVICES
| Service      | Port  | Status | Notes                          |
|-------------|-------|--------|--------------------------------|
| AI Engine   | 8001  | UP     | FastAPI, 10/10 endpoints       |
| TB Admin    | 8030  | UP     | FastAPI, auth bypassed dev     |
| Hub         | 3000  | UP     | Next.js, 15+ pages             |
| Portal      | 3001  | UP     | Next.js, enterprise shell      |
| PostgreSQL  | 5432  | UP     | 44 tables, real data           |
| Qdrant      | 6333  | UP     | 67 vectors, 768-dim            |
| Redis       | 6379  | UP     | connected + wired              |
| Ollama      | 11434 | UP     | 8 models, warm on boot         |
| OpenWebUI   | 3400  | UP     | healthy                        |

## AGENT INTELLIGENCE SYSTEM
Qdrant Knowledge Base: 67 vectors
  - 11 brain .md files (project identity, engineering rules, etc)
  - 10 skill files (code-review, architecture, debugging, testing,
                    devops, security, data-engineering, frontend,
                    api-design, product-management)

Agent Roles (11 total):
  ceo, cto, architect, backend, frontend, devops,
  tester, reviewer, security, data, pm

How it works:
  req.agent = "reviewer"
  → _get_agent_prompt()  → concise role system prompt
  → _get_agent_memory()  → previous decisions from memories table
  → _get_rag_context()   → 2 skill chunks from Qdrant
  → Ollama               → grounded, role-aware, stateful answer

## DATABASE (PostgreSQL ai_company_os)
agents: 16          tasks: 37 (pending:22 completed:7 failed:1)
workflows: 10       reflections: 8      memories: 19+
knowledge: 147      conversations: 10+  builder_runs: 84
platform_events: 15

SQLite (triangle_black.db):
leads: 3   technicians: 3   assets: 3   work_orders: 3

## HUB PAGES (localhost:3000)
/ dashboard          /agents (roles+skills+scores)
/tasks               /reflections
/workflows (trigger) /knowledge
/projects            /analytics (real + TB KPIs)
/models              /memory (entries + reflections)
/chat (11 agents)    /triangle-black (live TB data)

## PORTAL PAGES (localhost:3001)
/dashboard           /leads        /work-orders
/technicians         /assets       /warehouses
/inventory           /engineering/ai (8 agents + quick prompts)
/executive           /executive/intelligence (real data + CEO AI)
/recommendations     (PM + CEO agents, workflow launchers)

## KNOWN PRODUCTION ISSUES (fix before go-live)
1. DEV BYPASS in TB Admin auth.py — MockUser always returned
2. Hardcoded workspace_id + project_id in memory POST
3. No JWT auth on AI Engine endpoints
4. Qdrant exposed on all interfaces (should be localhost only)
5. PostgreSQL password is 'postgres' (change in production)
6. No rate limiting on /chat endpoint (Ollama can be overwhelmed)
7. Hub/Portal use npm run dev (use npm run build + start in prod)

## GIT
Branch: main (merged from feature/s2-enterprise-shell-wire)
Sessions: S8 through S20
Commits: ~32
