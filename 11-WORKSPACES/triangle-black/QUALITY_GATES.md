# QUALITY_GATES.md — Triangle Black

> Version: 1.0 | Authority: QA Agent | Cross-ref: ENGINEERING-STANDARDS.md

---

## Overview

Nothing merges to main without passing ALL applicable gates.
Gates are cumulative — later gates depend on earlier ones passing.

```
Gate 0 → Gate 1 → Gate 2 → Gate 3 → Gate 4 → Gate 5 → Gate 6 → Gate 7 → Gat[3D[K
Gate 8
Pre-Work  Domain  Security  Code    Test    Docs   Migration  AI    Portal
```

---

## Gate 0: Pre-Work (BEFORE touching any code)
**Applies to**: Every work session, every task

- [ ] Read AI_MEMORY/PROJECT_MEMORY.md
- [ ] Read AI_MEMORY/KNOWN_PROBLEMS.md — check for related issues
- [ ] Check TASKS/CURRENT_SPRINT.md — confirm task is in scope
- [ ] Verify the task doesn't duplicate existing functionality in src/comme[9D[K
src/commercial/
- [ ] If architecture change: create ADR in 00-ARCHITECT/DECISIONS/ first
- [ ] Confirm which domain the work belongs to (06-DOMAINS/)

**FAIL**: Do not start work until all items checked.

---

## Gate 1: Domain & Architecture Review
**Applies to**: Any new module, new feature, architecture change

- [ ] Work belongs to clearly identified bounded context
- [ ] Aggregate design follows DDD rules (max 4-5 entities)
- [ ] Domain events named correctly: {Entity}{PastTenseVerb}
- [ ] No direct calls between bounded contexts (events only)
- [ ] Clean Architecture layers respected (no infrastructure in domain)
- [ ] Module structure follows: router.py / service.py / models.py / schema[6D[K
schemas.py
- [ ] New module registered in REPOSITORY-INDEX.md

**Reviewer**: Architect Agent
**FAIL**: Architect Agent creates design issue, work returns to planning.

---

## Gate 2: Multi-Tenant Security Gate (CRITICAL — NEVER SKIP)
**Applies to**: EVERY piece of code that touches data

```python
CHECKLIST — VERIFY EVERY NEW ENDPOINT:
□ tenant_id = Depends(get_current_tenant_id) is FIRST dependency
□ Every SQLAlchemy query has .filter(Model.tenant_id == tenant_id)
□ No user-supplied tenant_id (always from JWT token)
□ File operations use uploads/{tenant_id}/ path
□ ChromaDB queries scoped to tenant collection
□ Audit logs include tenant_id
□ No cross-tenant joins or subqueries
```

**Reviewer**: Security Agent
**FAIL**: IMMEDIATE escalation to Amr. Work stops until resolved.

---

## Gate 3: Code Quality Gate
**Applies to**: All Python (src/) and TypeScript (portal/) code

**Python**:
- [ ] No bare except clauses
- [ ] All async functions use await correctly
- [ ] SQLAlchemy sessions properly closed (use async context manager)
- [ ] Pydantic schemas used for all inputs/outputs
- [ ] No hardcoded tenant IDs or credentials
- [ ] Type hints on all function signatures
- [ ] Docstrings on service functions

**TypeScript/Next.js**:
- [ ] No 'any' types
- [ ] Components have loading/error/empty states
- [ ] API calls go through portal/lib/api/ layer
- [ ] Zod schemas in portal/lib/schemas/
- [ ] No direct fetch() calls in components

**Automated**: Run before commit:
```bash
cd src && python -m flake8 commercial/ --max-line-length 100
cd portal && npx tsc --noEmit
```

---

## Gate 4: Test Gate
**Applies to**: All new functionality

**Backend Requirements**:
- [ ] Unit tests in tests/commercial/{module}/
- [ ] test_{module}_service.py with happy path + edge cases
- [ ] test_{module}_router.py with auth + tenant isolation tests
- [ ] Coverage ≥ 80% for new module
```bash
pytest tests/commercial/{module}/ --cov=src/commercial/{module} --cov-repor[11D[K
--cov-report=term
```

**Frontend Requirements**:
- [ ] Component tests for complex components
- [ ] API integration test in portal/tests/api/ if new endpoint used

**Minimum acceptable**:
- New module: 80% coverage
- Bug fix: regression test added
- Refactor: existing tests still pass

---

## Gate 5: Documentation Gate
**Applies to**: All changes

- [ ] Corresponding 06-DOMAINS/{DOMAIN}/ updated if domain logic changed
- [ ] 04-DESIGN/API/ updated if new endpoint added
- [ ] ADR created if architecture decision made
- [ ] REPOSITORY-INDEX.md updated if new module/file added
- [ ] AGENT_HANDOFF.md updated with what was done
- [ ] AI_MEMORY/DECISIONS.md updated with key decisions

---

## Gate 6: Migration Gate
**Applies to**: Any database schema change

- [ ] Alembic migration created with correct naming: {timestamp}_{descripti[22D[K
{timestamp}_{description}
- [ ] Both upgrade() AND downgrade() implemented and tested
- [ ] Zero-downtime approach (no table locks on large tables)
- [ ] All new tables have: id, tenant_id (NOT NULL), created_at, updated_at[10D[K
updated_at
- [ ] Indexes created for: tenant_id + common query columns
- [ ] Migration tested: upgrade → downgrade → upgrade sequence

---

## Gate 7: AI Safety Gate
**Applies to**: Any AI feature, LLM integration, RAG change

- [ ] No PII sent to external LLM APIs (use local Ollama only)
- [ ] ChromaDB queries scoped by tenant_id
- [ ] AI outputs validated before storing or returning
- [ ] Fallback behavior defined if AI service unavailable
- [ ] Audit trail for AI-generated decisions
- [ ] Model version pinned (not 'latest')

---

## Gate 8: Portal Gate
**Applies to**: Any Next.js portal changes

- [ ] Auth middleware active on all new routes
- [ ] Loading states implemented
- [ ] Error boundaries in place
- [ ] Mobile responsive (test at 375px, 768px, 1280px)
- [ ] Uses components from packages/ui/ (not custom duplicates)
- [ ] No secrets or API URLs hardcoded in frontend code

---

## Gate Summary Table

| Gate | When | Automated | Manual Reviewer | Blocks |
|------|------|-----------|----------------|--------|
| Gate 0: Pre-Work | Start of session | No | Self | Starting work |
| Gate 1: Architecture | New module/feature | Partial | Architect Agent | I[1D[K
Implementation |
| Gate 2: Security | ALL code | Partial (linter) | Security Agent | Merge |[1D[K
|
| Gate 3: Code Quality | ALL code | Yes (flake8/tsc) | None | Commit |
| Gate 4: Tests | New functionality | Yes (pytest) | QA Agent | Merge |
| Gate 5: Documentation | ALL changes | No | Documentation Agent | Merge |
| Gate 6: Migration | DB changes | No | Database Agent | Merge |
| Gate 7: AI Safety | AI features | No | AI Platform Agent | Merge |
| Gate 8: Portal | Frontend changes | Partial (tsc) | Frontend Agent | Merg[4D[K
Merge |

---

## Quick Reference Checklist (print this)
```
BEFORE STARTING:      □ G0
AFTER CODING:         □ G2 □ G3
BEFORE PR:            □ G1 □ G4 □ G5
IF DB CHANGED:        □ G6
IF AI CHANGED:        □ G7
IF PORTAL CHANGED:    □ G8
```

---
*Cross-references: AI-GOVERNANCE.md | ENGINEERING-STANDARDS.md | 02-GOVERNA[10D[K
02-GOVERNANCE/QUALITY/Quality-Gates.md | 10-AI/GOVERNANCE/Quality-Gates.md*

