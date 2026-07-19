# 09 — Implementation Roadmap

## Phase 0 — Cleanup (1 day — zero risk)
- [ ] Delete garbage files at repo root (shell fragments saved as files)
- [ ] Delete Zone.Identifier files from hub/
- [ ] Move .bak files to 90-ARCHIVE
- [ ] Delete test.db and all-files.txt
- [ ] Move audit logs to 90-ARCHIVE

## Phase 1 — Stage Legacy AI Engine (2 days — zero risk — read only copy to staging)
- [ ] Copy legacy apps/api/app/agents/ → 00-MIGRATION/staging/agents/
- [ ] Copy legacy apps/api/app/tools/ → 00-MIGRATION/staging/tools/
- [ ] Copy legacy apps/api/app/dag/ → 00-MIGRATION/staging/dag/
- [ ] Copy legacy apps/api/app/decision/ → 00-MIGRATION/staging/decision/
- [ ] Copy legacy apps/api/app/evaluation/ → 00-MIGRATION/staging/evaluation/
- [ ] Copy legacy apps/api/app/reflection/ → 00-MIGRATION/staging/reflection/
- [ ] Copy legacy apps/api/app/learning/ → 00-MIGRATION/staging/learning/
- [ ] Copy legacy apps/api/app/collaboration/ → 00-MIGRATION/staging/collaboration/
- [ ] Copy legacy apps/api/app/knowledge/ → 00-MIGRATION/staging/knowledge/
- [ ] Copy legacy apps/api/app/prompts/ → 00-MIGRATION/staging/prompts/
- [ ] Copy legacy apps/api/app/context/ → 00-MIGRATION/staging/context/
- [ ] Copy legacy apps/api/app/workflows/ → 00-MIGRATION/staging/workflows/
- [ ] Copy legacy apps/api/app/templates/ → 00-MIGRATION/staging/templates/
- [ ] Copy legacy apps/api/app/integrations/ → 00-MIGRATION/staging/integrations/

## Phase 2 — Stage Archive Hub (1 day — zero risk)
- [ ] Copy archive hub/src/hub/mcp/ → 00-MIGRATION/staging/mcp/
- [ ] Copy archive hub/src/hub/builder/ → 00-MIGRATION/staging/builder/
- [ ] Copy archive hub/src/hub/planning/ → 00-MIGRATION/staging/planning/
- [ ] Copy archive hub/src/hub/orchestrator/ → 00-MIGRATION/staging/orchestrator/
- [ ] Copy archive hub/src/hub/observability/ → 00-MIGRATION/staging/observability/
- [ ] Copy archive hub/src/hub/model_router/ → 00-MIGRATION/staging/model_router/
- [ ] Copy archive PROGRAM-06/src/ → 00-MIGRATION/staging/program06/

## Phase 3 — Design Unified Architecture (1 day — planning only)
- [ ] Design new 07-AI-ENGINE/ directory structure in Enterprise
- [ ] Design AI API prefix strategy (/api/v1/ai/ vs /api/v1/)
- [ ] Design unified main.py using Legacy production pattern
- [ ] Design merged memory strategy (Qdrant primary)
- [ ] Design dashboard navigation — AI OS tab + Business tab

## Phase 4 — Implement AI Engine Layer (3-5 days)
- [ ] Create Enterprise 07-AI-ENGINE/ from staging
- [ ] Rebuild main.py with production middleware from Legacy
- [ ] Add AI routes under /api/v1/ai/ prefix
- [ ] Connect Qdrant as primary vector store
- [ ] Add task queue from Legacy
- [ ] Add scheduler from Legacy
- [ ] Add rate limiting from Legacy
- [ ] Add request ID middleware from Legacy
- [ ] Add security headers from Legacy

## Phase 5 — Recover AI Dashboard (2-3 days)
- [ ] Create hub/dashboard/app/ source pages from Legacy
- [ ] Port all 15 Legacy dashboard pages
- [ ] Connect to new AI engine routes
- [ ] Add navigation link from Enterprise portal to AI dashboard
- [ ] Style to match Enterprise design system

## Phase 6 — Connect Enterprise Portal to AI Engine (3-5 days)
- [ ] Connect /recommendations page to AI agent
- [ ] Connect /ai page to agent runtime
- [ ] Connect knowledge panel to knowledge engine
- [ ] Connect workspace memory to memory service
- [ ] Connect analytics to AI analytics engine

## Phase 7 — Integrate MCP and Developer Portal (2-3 days)
- [ ] Integrate archived MCP into Enterprise hub
- [ ] Restore developer portal pages
- [ ] Connect orchestrator UI to orchestrator backend

## Phase 8 — Testing and Validation
- [ ] Run all legacy test scripts against new unified API
- [ ] Run all Enterprise tests
- [ ] Validate all 200+ portal pages still work
- [ ] Validate AI OS dashboard pages work
- [ ] End-to-end test: agent call → memory → analytics → dashboard

## Total Estimated Effort
- Phase 0: 0.5 day
- Phase 1-2: 3 days (copy only — safe)
- Phase 3: 1 day
- Phase 4-5: 6-8 days
- Phase 6-7: 5-8 days
- Phase 8: 2-3 days
TOTAL: 17-23 days
