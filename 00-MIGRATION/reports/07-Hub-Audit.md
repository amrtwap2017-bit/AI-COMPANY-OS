# 07 — Hub Audit

## Hub Modules Inventory

### NEW Enterprise Hub — /home/amr/AI-COMPANY-OS/hub/
Status: Partial — missing source pages, has Zone.Identifier corruption
Modules:
- hub/__init__.py
- hub/api/app.py — FastAPI app
- hub/api/routers/ — _base, app, models, palette, projects, tasks, workspaces
- hub/cli/palette.py — Command palette CLI
- hub/context/__init__.py — Context module (empty or partial)
- hub/core/ — audit, constants, fix_engine, loader, models, workspace_connector
- hub/dashboard/ — Next.js dashboard (source pages MISSING — only .next build)
- hub/intelligence/ — indexer, loader, prompts, workspace_connector
- hub/memory/__init__.py — Memory module
- hub/quality/audit.py — Quality audit
- hub/session/__init__.py — Session module
- hub/vectors/__init__.py — Vectors module
- hub/ai — (file, not directory — unknown)
Problems:
  - Zone.Identifier files everywhere (Windows WSL artifact)
  - hub/dashboard has .next build but no app/ source pages
  - Many modules are empty __init__.py stubs

### ARCHIVED Hub — /home/amr/AI-COMPANY-OS/90-ARCHIVE/AI-ENGINEERING-HUB-archived/hub/src/hub/
Status: COMPLETE — Full implementation
Modules:
- agents/ — impl (developer, reviewer, validator), models, runner
- api/app.py — Full FastAPI with correlation
- benchmarks/ — gate, models, service
- builder/ — executor, models, planner
- context/ — builder, cache, packs, rag_engine, sprint_loader, stack_detector, tb_context, tb_conventions
- db/ — base, engine
- execution/ — engine, loop, models
- foundation/settings.py — Settings
- generated/task_impl.py — Generated task implementation
- integrations/aicos_bench.py — AI Company OS bench integration
- knowledge/ — api, deps, graph_models, impact, indexer, repo_context, signal_context, signals
- main.py — Uvicorn entry point
- mcp/ — db, executor, limiter, models, policy, registry, tools_filesystem, tools_git, tools_repo, tools_shell
- memory/ — models, service
- model_router/ — models, router
- observability/ — metrics, otel
- orchestrator/ — orchestrator
- planning/ — engine
- project/ — models
- quality/ — (stub)
- repository/ — (stub)
- tasks/ — models, service
- workspace/ — models, service

### Alembic Migrations in Archived Hub
Multiple migration versions:
- 0047ee6a5ecf — phase2 wave1 all tables
- bb6b8cb0160c — add graph tables
- c2574f648280 — MCP tool registry and audit
- c6da999fe068 — builder runs
- e2720ee1924f — agent runs
- adaf4c4175d4 — tool audit run group
- 6f17d3825e48 — agent runs run group

## Hub Gap Summary
| Module | New Hub | Archived Hub | Action |
|--------|---------|-------------|--------|
| MCP Registry | ❌ | ✅ complete | MIGRATE from Archive |
| Builder | ❌ | ✅ complete | MIGRATE from Archive |
| Context/RAG | stub | ✅ complete | MIGRATE from Archive |
| Knowledge signals | stub | ✅ complete | MIGRATE from Archive |
| Orchestrator | ❌ | ✅ complete | MIGRATE from Archive |
| Planning engine | ❌ | ✅ complete | MIGRATE from Archive |
| Benchmarks | ❌ | ✅ complete | MIGRATE from Archive |
| Observability/OTel | ❌ | ✅ complete | MIGRATE from Archive |
| Model router | ❌ | ✅ complete | MIGRATE from Archive |
| Dashboard source | ❌ MISSING | ❌ | REBUILD from Legacy dashboard |
| Quality audit | ✅ stub | ❌ | ENHANCE |
| CLI palette | ✅ | ❌ | KEEP |
| DB migrations | partial | ✅ 8 versions | MERGE migrations |
