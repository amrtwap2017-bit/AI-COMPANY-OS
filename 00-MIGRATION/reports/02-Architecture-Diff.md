# 02 — Architecture Diff

## Backend Architecture Comparison

| Layer | Legacy (Gen 1) | Enterprise (Gen 3) | Verdict |
|-------|---------------|-------------------|---------|
| Lifespan management | asynccontextmanager with full startup/shutdown | None | LEGACY WINS |
| Rate limiting | slowapi integrated | None | LEGACY WINS |
| Request ID tracking | RequestIDMiddleware | None | LEGACY WINS |
| Security headers | X-Content-Type, X-Frame, XSS, HSTS | None | LEGACY WINS |
| Task queue | BackgroundTaskQueue with start/stop | None | LEGACY WINS |
| Memory vector store | Qdrant-backed, initialized on startup | ChromaDB (partial) | LEGACY WINS |
| Platform scheduler | APScheduler integrated | None | LEGACY WINS |
| Analytics background | Async background writer | None | LEGACY WINS |
| CORS | Configurable per settings | allow_origins=["*"] | LEGACY WINS |
| Error handling | Global exception handler with request_id | None | LEGACY WINS |
| Router organization | Versioned /api/v1 via router module | 40 try/except inline imports | LEGACY WINS |
| Domain modules | Clean separation | Mixed DDD partial | ENTERPRISE PARTIAL |
| Multi-tenancy | Basic | Full hotel isolation | ENTERPRISE WINS |
| Database migrations | Alembic clean | Alembic with 4 versions | BOTH HAVE |
| Business logic | None | Complete hotel engineering | ENTERPRISE WINS |

## Frontend Architecture Comparison

| Feature | Legacy Dashboard | Hub Dashboard | Enterprise Portal |
|---------|-----------------|---------------|-------------------|
| Pages | 15 | 4 | 200+ |
| Auth | JWT with refresh | Basic | JWT with AuthGuard |
| Analytics | Full stats page | None | Analytics pages |
| Agent UI | Full agent page | None | AI page |
| Chat | Full chat page | None | None |
| Knowledge | Full knowledge page | None | Knowledge panel |
| Memory | Full memory page | Memory page | Workspace memory |
| Models | Full models page | None | None |
| Reflections | Full reflections | None | None |
| Tools | Full tools page | None | None |
| Workflows | Full workflows | None | Workflow pages |
| Search | None | Search page | Search input |
| Collections | None | Collections page | None |
| Enterprise modules | None | None | Full (operations, commercial, supply-chain, maintenance, executive) |
| Component library | Minimal | Minimal | 70+ workspace components |

## Missing Architecture Patterns in Enterprise

- No event bus / domain events implementation
- No DAG engine
- No agent orchestrator runtime
- No prompt version store
- No self-improvement loop
- No benchmark runner
- No semantic diff tool
- No MCP tool registry (archived but not integrated)
