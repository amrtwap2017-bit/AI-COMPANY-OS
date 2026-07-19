# 08 — Migration Plan

## RULE: Never overwrite. Never delete. Staging only. Evidence before action.

## Priority 1 — CRITICAL (Do First — No Risk)
These exist ONLY in legacy/archive. Enterprise does not have them. Zero collision risk.

| Item | From | To | Action | Effort | Risk |
|------|------|----|--------|--------|------|
| AI agent runtime (12 agents) | Legacy apps/api/app/agents/ | Enterprise 07-AGENTS/ | COPY to staging | M | LOW |
| DAG engine | Legacy apps/api/app/dag/ | Enterprise new 08-DAG/ | COPY to staging | M | LOW |
| Decision engine | Legacy apps/api/app/decision/ | Enterprise new | COPY to staging | M | LOW |
| Evaluation engine | Legacy apps/api/app/evaluation/ | Enterprise new | COPY to staging | M | LOW |
| Reflection engine | Legacy apps/api/app/reflection/ | Enterprise new | COPY to staging | M | LOW |
| Learning engine | Legacy apps/api/app/learning/ | Enterprise new | COPY to staging | M | LOW |
| Collaboration engine | Legacy apps/api/app/collaboration/ | Enterprise new | COPY to staging | M | LOW |
| 30+ AI tools | Legacy apps/api/app/tools/ | Enterprise new | COPY to staging | L | LOW |
| 16 prompt files | Legacy apps/api/app/prompts/ | Enterprise 20-KNOWLEDGE/ | COPY to staging | S | LOW |
| GitHub integration | Legacy apps/api/app/integrations/ | Enterprise new | COPY to staging | S | LOW |
| MCP gateway | Archive hub/src/hub/mcp/ | Enterprise hub/ | COPY to staging | L | LOW |
| Builder engine | Archive hub/src/hub/builder/ | Enterprise hub/ | COPY to staging | M | LOW |
| Planning engine | Archive hub/src/hub/planning/ | Enterprise hub/ | COPY to staging | S | LOW |
| Workspace explorer | Archive PROGRAM-06/workspace_explorer/ | Enterprise hub/ | COPY to staging | S | LOW |
| Self-improvement | Archive PROGRAM-06/self_improvement/ | Enterprise hub/ | COPY to staging | M | LOW |
| OTel observability | Archive hub/src/hub/observability/ | Enterprise 13-OBSERVABILITY/ | COPY to staging | S | LOW |
| Document parsers | Legacy apps/api/app/knowledge/parsers/ | Enterprise 03-KNOWLEDGE/ | COPY to staging | S | LOW |

## Priority 2 — HIGH (Merge Required — Read Both Sides First)
These exist in BOTH repos but implementations differ.

| Item | Legacy | Enterprise | Merge Strategy | Effort | Risk |
|------|--------|------------|----------------|--------|------|
| Memory system | Qdrant vector_store | ChromaDB indexer | Keep Qdrant — it is production-grade | L | MEDIUM |
| Knowledge pipeline | Full pipeline + parsers | chunker + ingester | Merge — Legacy pipeline + Enterprise chunker | L | MEDIUM |
| Context engine | assembler+ranker+sources | context_packs | Merge all — different concerns | M | MEDIUM |
| Analytics | background writer + cost | analytics_api | Merge — different concerns | M | MEDIUM |
| Auth | JWT + RBAC + API keys | JWT only | Add RBAC + API keys from Legacy | M | MEDIUM |
| Workflow | engine+executor+templates | workflow pages | Connect Enterprise UI to Legacy engine | L | HIGH |
| Database sessions | SQLAlchemy clean | SQLAlchemy fragmented | Use Legacy pattern | S | MEDIUM |
| main.py architecture | Production-grade | try/except chaos | Rebuild Enterprise main.py using Legacy pattern | M | HIGH |
| Knowledge graph | builder+extractor+query | graph_models+signals | Merge both | L | MEDIUM |

## Priority 3 — MEDIUM (Dashboard Recovery)
The old AI OS dashboard must be recovered and extended.

| Item | From | Action | Effort | Risk |
|------|------|--------|--------|------|
| 15-page AI dashboard | Legacy apps/dashboard/ | Add as /hub/dashboard/app/ new source pages | L | LOW |
| StatCard component | Legacy | Copy to hub dashboard | S | LOW |
| Agent dashboard page | Legacy | Copy + connect to Enterprise agent API | M | MEDIUM |
| Analytics dashboard | Legacy | Copy + enhance | M | LOW |
| Chat page | Legacy | Copy + connect | M | MEDIUM |
| Memory page | Legacy + Archive | Merge best of both | M | MEDIUM |
| Models page | Legacy | Copy | S | LOW |
| Tools page | Legacy | Copy | S | LOW |
| Reflections page | Legacy | Copy | S | LOW |

## Priority 4 — CLEANUP (Safe — No Migration Risk)
| Item | Action | Command |
|------|--------|---------|
| Garbage files at repo root | DELETE — confirmed shell history fragments | rm with explicit paths |
| Zone.Identifier files | DELETE — Windows WSL artifacts | find + delete |
| Duplicate infrastructure files | REVIEW — database.py vs db.py | Read both before deciding |
| Duplicate API route files | REVIEW — api/routes vs api/routers | Consolidate |
| .bak files | ARCHIVE — move to 90-ARCHIVE | mv |
| test.db | DELETE — dev artifact | rm |
| triangle_black_audit logs | ARCHIVE | mv |
| all-files.txt | DELETE — generated | rm |

## What NOT To Touch
- /home/amr/AI-COMPANY-OS/11-WORKSPACES/triangle-black/portal/ — DO NOT TOUCH (200+ pages working)
- /home/amr/AI-COMPANY-OS/11-WORKSPACES/triangle-black/src/ — DO NOT TOUCH (business backend working)
- /home/amr/AI-COMPANY-OS/11-WORKSPACES/triangle-black/00-ARCHITECT through 13-ARCHIVE — DO NOT TOUCH (documentation)
- /home/amr/AI-COMPANY-OS/brains/ — DO NOT TOUCH
