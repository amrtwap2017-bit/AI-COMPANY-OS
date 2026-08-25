
============================================================
# ENGINEERING CONSTITUTION
============================================================
# ENGINEERING CONSTITUTION
# Authority: Amr Mostafa — Executive Engineer / Product Owner
# Status: ACTIVE

## Project Identity
Product: Triangle Black Enterprise Operations OS
Market: Hospitality Engineering — Egypt / Sharm El-Sheikh
Architecture: Multi-tenant Enterprise SaaS / Modular Monolith
Tenancy: hotel_id field (NEVER tenant_id)

## Non-Negotiable Rules

1. NEVER modify application code during AUDIT phase
2. NEVER expand scope beyond the active task definition
3. NEVER commit without passing verification gates
4. NEVER run destructive commands automatically
5. NEVER push to main/production without human approval
6. NEVER exceed MAX_REPAIR_ATTEMPTS=3 before stopping
7. NEVER hallucinate files, APIs, tables, or decisions
8. ALWAYS inspect before claiming
9. ALWAYS checkpoint after task completion
10. ALWAYS update state after any status change
11. NEVER use pip — always use uv
12. NEVER redesign existing architecture — extend it
13. NEVER duplicate existing logic without justification
14. NEVER use inline # comments as shell commands in zsh
15. NEVER paste Python directly into zsh — use heredoc or temp file
16. NEVER run npm from project root — cd into portal/ first
17. NEVER trust client-provided hotel_id — extract from JWT only
18. NEVER weaken tenant isolation for any reason

## Package Management
- Python dependencies: uv (never pip)
- Node dependencies: npm inside portal/ directory
- Test runner: .venv/bin/python -m pytest (from workspace root)
- Lint: .venv/bin/ruff check

## Tenancy Rule
Every database query against operational data MUST filter by hotel_id.
Source of truth: src/core/tenant.py → get_hotel_id() extracts from JWT.
... [22 lines truncated]


============================================================
# PROJECT CONTEXT
============================================================
# PROJECT MASTER CONTEXT
# Source: PROJECT-IDENTITY.md v6.0 + AGENT_HANDOFF.md (Aug 2026) + AGENT-BOOTSTRAP.md
# Last verified: 2026-08-25
# Classification: CONFIDENT (all from direct file inspection)

## What is this project?
Triangle Black Enterprise Operations OS — a multi-tenant SaaS platform for
hospitality engineering organizations. Not a CMMS, not an ERP — an Enterprise
Operations OS that transforms hotel engineering data into controlled workflows,
asset intelligence, and operational decisions.

## Why does it exist?
Hotel engineering organizations collect large amounts of operational data but
fail to convert it into controlled workflows, measurable performance, transparent
decisions, and long-term asset intelligence. Triangle Black solves this.

## Who uses it?
Primary customer: Engineering, maintenance, asset-management, procurement,
contracting, or technical-services companies operating hotel engineering services.
Primary market: Egypt — Sharm El-Sheikh.
Portals: Ops (3200/3000), Client (3201), Admin (3202).

## Core capabilities?
- Asset lifecycle management and digital twin
- Preventive / predictive maintenance
- Work order management with SLA tracking
- Procurement and inventory (purchase request → PO → goods receipt)
- Contractor management
- Operational intelligence (4 AI directors: Maintenance, Procurement, Operations, Executive)
- Multi-tenant enterprise governance
- Financial transparency and audit trails

## Architecture?
Modular Monolith / Multi-tenant Enterprise SaaS
Presentation → API/Controllers → Application Services → Domain →
Repository Ports → Infrastructure → Database (PostgreSQL)
Tenancy: hotel_id field, extracted from JWT via get_hotel_id()

## Technologies?
Backend: FastAPI + SQLAlchemy 2.0 + Alembic + Python 3.12 (uv managed)
Frontend: Next.js App Router + Tailwind + React Query
Database: PostgreSQL (pgvector) + Redis + ChromaDB (RAG live)
AI: Ollama/Qwen locally, 4 governed AI directors
Testing: pytest (158+ passing) + Playwright E2E
Port: API=8030, Portal=3000/3200, Client=3201, Admin=3202

## Major domains?
Commercial (leads, quotes, contracts, billing)
Operations (work orders, service requests, SLA)
Assets (asset registry, maintenance plans, digital twin)
... [47 lines truncated]


============================================================
# CURRENT STATE
============================================================
Phase: COMMERCIAL_VALIDATION
Status: ACTIVE
Sprint: SPRINT-N-FIX
Task: SPRINT-N-FIX-T001
Architecture: CERTIFIED
Security: CERTIFIED
Sprint Status: ACTIVE
Tasks Done: 0/6


============================================================
# ACTIVE TASK: SPRINT-N-FIX-T001
============================================================
# SPRINT-N-FIX-T001 — Repair Alembic migration head — employees, gl, eta tables

## Metadata
| Field | Value |
|-------|-------|
| ID | SPRINT-N-FIX-T001 |
| Sprint | SPRINT-N-FIX |
| Status | ACTIVE |
| Risk | HIGH |
| Created | 2026-08-25 |
| Updated | 2026-08-25 |

## Purpose
[One sentence: what does this task accomplish?]

## Files Likely Affected
- [list specific files, e.g. 11-WORKSPACES/triangle-black/api/...]
- [tests/...]

## Files Forbidden
- DO NOT TOUCH: [list protected files or directories]
- DO NOT TOUCH: authentication middleware
- DO NOT TOUCH: tenant isolation logic

## Dependencies
- [TASK-ID] must complete first, or NONE

## Implementation Steps
1. [READ] Inspect relevant files (no modifications)
2. [PLAN] Confirm understanding with human
3. [IMPLEMENT] Make only the listed change
4. [TEST] Run: bash scripts/ai/ai-verify
5. [REVIEW] Check diff: git diff
6. [COMMIT] Only after all gates pass

## Acceptance Criteria
- [ ] AC-001: [specific, testable criterion]
- [ ] AC-002: [specific, testable criterion]

## Tests Required
- [ ] Unit: [specific test file or function]
- [ ] Integration: [specific test]
- [ ] Regression: existing tests still pass

## Security Considerations
[N/A or specific security check this task requires]

## Expected Output
[Exactly what should be different when this task is done — be specific]

## Repair Limit
MAX_ATTEMPTS: 3
If 3 consecutive attempts fail → STOP → create failure report → wait for human

## Notes
[Any additional context, links to documentation, or warnings]


============================================================
# SPRINT: SPRINT-N-FIX
============================================================
# SPRINT-N-FIX — N-FIX: Pre-pilot blockers

## Metadata
| Field | Value |
|-------|-------|
| ID | SPRINT-N-FIX |
| Status | PLANNED |
| Started | |
| Target End | |
| Phase | COMMERCIAL_VALIDATION |
| Created | 2026-08-25 |

## Objective
[One sentence: what does this sprint accomplish?]

## Business Outcome
[What does the user/product gain?]

## Technical Outcome
[What does the codebase gain?]

## Dependencies
- [ ] Previous sprint gates passed
- [ ] Architecture review complete

## Preconditions
- [ ] Working tree clean
- [ ] Tests passing at sprint start
- [ ] Security check passed at sprint start
- [ ] `bash scripts/ai/ai-security-check` passes

## Scope
[List what IS included]

## Out of Scope
[List what is NOT included — be explicit]

## Tasks
| ID | Title | Status | Risk | Files |
|----|-------|--------|------|-------|
| SPRINT-N-FIX-T001 | | READY | LOW | |
| SPRINT-N-FIX-T002 | | READY | MEDIUM | |

## Acceptance Criteria
- [ ] AC-001
- [ ] AC-002
- [ ] AC-003

## Test Plan
- [ ] Unit tests: all passing (158+ baseline maintained)
- [ ] Integration tests: all passing
- [ ] E2E: affected flows passing
- [ ] Regression: no regressions from baseline

## Security Checks
- [ ] `bash scripts/ai/ai-security-check` PASSES
- [ ] hotel_id tenant isolation preserved on all new queries
- [ ] No new secrets committed
- [ ] Authorization unchanged or reviewed

## Architecture Checks
- [ ] No domain leakage
- [ ] No raw SQL bypassing repository layer
- [ ] ADR created if architectural decision made
- [ ] No uv→pip regression

## Documentation Requirements
- [ ] .ai/context/project.md updated if needed
- [ ] brains/triangle-black/ updated if needed
- [ ] ADR created if needed

## Risk Register
| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| venv context error | LOW | HIGH | Always use absolute venv path |
| hotel_id missing from new query | MEDIUM | CRITICAL | Run tenant isolation check |
| Context overflow (32K) | MEDIUM | MEDIUM | Use ai-context script per task |

## Rollback Strategy
`git revert` individual task commits.
... [12 lines truncated]


============================================================
# LAST CHECKPOINT
============================================================
# CHECKPOINT

## Metadata
| Field | Value |
|-------|-------|
| Task | SPRINT-AI-OS-001-CLOSE |
| Status | COMPLETE |
| Timestamp | 2026-08-25T21:24:28Z |
| Commit | f5b58ad7 |

## Files Changed
11-WORKSPACES/triangle-black/src/core/auth.py
scripts/ai/ai-checkpoint

## Git Status
 M 11-WORKSPACES/triangle-black/src/core/auth.py
 M scripts/ai/ai-checkpoint

## Next Steps
See .ai/state/project-state.json next_actions


[FILE NOT FOUND: [list specific files, e.g. 11-WORKSPACES/triangle-black/api/...]]

[FILE NOT FOUND: [tests/...]]

============================================================
# QUALITY GATES
============================================================
# QUALITY GATES

A task is DONE only when ALL applicable gates pass.

## GATE 1 — Acceptance Criteria
All defined acceptance criteria are satisfied.

## GATE 2 — Focused Tests
Unit and integration tests covering the changed code pass.

## GATE 3 — Architecture Rules
No architecture violations introduced.

## GATE 4 — Security Checks
Security preflight checklist passed.

## GATE 5 — Regression Tests
Existing tests still pass.

## GATE 6 — Documentation
Relevant documentation updated.

## GATE 7 — Git State
git status is clean, commit message is descriptive, checkpoint created.

## Gate Skip Policy
Gates may only be skipped with explicit human approval recorded in the task file.


============================================================
# CONTEXT SUMMARY
============================================================
Task: SPRINT-N-FIX-T001
Budget: 8000 tokens
Used: ~2471 tokens
Generated: 2026-08-25T21:25:42.492714+00:00Z
Sections: 9

## OPERATING MODE
READ → PLAN → [APPROVE] → IMPLEMENT → VERIFY → REVIEW → COMMIT → CHECKPOINT

## FORBIDDEN
- Modify files outside task scope
- Commit without passing all gates
- Continue after MAX_REPAIR_ATTEMPTS=3
- Hallucinate files, APIs, or decisions not verified by inspection
