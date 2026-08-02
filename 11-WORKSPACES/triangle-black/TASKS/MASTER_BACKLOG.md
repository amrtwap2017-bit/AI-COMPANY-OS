# MASTER_BACKLOG.md — Triangle Black

> Owner: COO Agent | Updated: August 2026
> NOTE: Sprint 000-021 details are in 10-AI/MAPPING/SPRINTS/ — this is the [K
MASTER list

---

## Backlog Summary

| Category | Total Items | P0 Critical | P1 High | P2 Medium | P3 Low |
|----------|-------------|------------|---------|-----------|--------|
| AI Factory (Infrastructure) | 15 | 0 | 10 | 5 | 0 |
| Domain Work (15 domains) | 22 | 0 | 8 | 10 | 4 |
| Test Coverage | 70 | 0 | 5 | 45 | 20 |
| Security | 5 | 2 | 3 | 0 | 0 |
| Technical Debt | 15 | 0 | 3 | 7 | 5 |
| Documentation | 10 | 0 | 2 | 5 | 3 |
| **TOTAL** | **137** | **2** | **31** | **72** | **32** |

---

## P0 — CRITICAL (Do First)

| ID | Title | Area | Impact | Owner |
|----|-------|------|--------|-------|
| P0-001 | Add missing tenant_id filters across all modules | Security | Da[2D[K
Data breach risk | Security Agent |
| P0-002 | Cover authentication bypass vulnerability in admin portal | Secu[4D[K
Security | Auth bypass | Security Agent |

---

## AI Software Factory Backlog (Phase 0 — Current Sprint)

| ID | Title | Priority | Est. Days | Owner Agent | Status |
|----|-------|----------|-----------|-------------|--------|
| AF-001 | REPOSITORY-INDEX.md | P1 | 1 | Documentation Agent | ✅ Done |
| AF-002 | AI-GOVERNANCE.md | P1 | 1 | Architect Agent | ✅ Done |
| AF-003 | ENGINEERING-STANDARDS.md | P1 | 1 | Architect Agent | ✅ Done |
| AF-004 | QUALITY_GATES.md | P1 | 1 | QA Agent | ✅ Done |
| AF-005 | MASTER_EXECUTION_PLAN.md | P1 | 1 | COO Agent | ✅ Done |
| AF-006 | AI_MEMORY/ system (7 files) | P1 | 1 | Knowledge Agent | ✅ Done[4D[K
Done |
| AF-007 | TASKS/ system | P1 | 0.5 | COO Agent | ✅ Done |
| AF-008 | agents/ specifications (27 agents) | P1 | 2 | CTO Agent | ⬜ Pen[3D[K
Pending |
| AF-009 | CODEX_WORKFLOW.md | P1 | 0.5 | Documentation Agent | ⬜ Pending [K
|
| AF-010 | LOCAL_AI_WORKFLOW.md | P1 | 0.5 | AI Platform Agent | ⬜ Pending[7D[K
Pending |
| AF-011 | RELEASE_PROCESS.md | P1 | 1 | DevOps Agent | ⬜ Pending |
| AF-012 | checklists/ (13 checklists) | P2 | 1 | QA Agent | ⬜ Pending |
| AF-013 | PROMPTS/ library (14 prompts) | P2 | 1 | AI Platform Agent | ⬜ [K
Pending |
| AF-014 | KNOWLEDGE_MAP.md | P2 | 1 | Knowledge Agent | ⬜ Pending |
| AF-015 | ENGINEERING_DASHBOARD.md | P3 | 0.5 | DevOps Agent | ⬜ Pending [K
|

---

## Domain Backlog

| Domain | Sprint Ref | Current State | Remaining Work |
|--------|-----------|--------------|----------------|
| Commercial CRM | Sprint-001 to 006 | 60% complete | Portal completion, te[2D[K
tests, surveys |
| Project Delivery | Sprint-007 to 009 | 40% complete | Project closeout, p[1D[K
portal |
| Procurement | Sprint-010 | 54% complete | Portal completion, tests |
| Supplier Management | Sprint-011 | 44% complete | Portal, tests, scorecar[8D[K
scorecards |
| Inventory | Sprint-012 | 49% complete | Portal, transfers, warehouse |
| Financial Control | Sprint-013 to 015 | 29% complete | GL module, portal,[7D[K
portal, tests |
| Maintenance | Sprint-016 | 48% complete | PM scheduling, portal |
| Document Management | Sprint-017 | 31% complete | Portal, search, version[7D[K
versioning |
| Executive Intelligence | Sprint-018 | 48% complete | Portal completion, t[1D[K
tests |
| Human Resources | Sprint-019 to 020 | 0% | ENTIRE domain pending |
| AI Copilots | No sprint yet | 30% | Agent framework, copilot modules |
| Integrations | No sprint yet | 23% | Webhook, external systems |
| Mobile | No sprint yet | 11% | Field technician app |
| Digital Twin | No sprint yet | 16% | Real-time sync, portal |
| Shared Kernel | Sprint-021 | 67% | Cross-cutting features |

---

## Technical Debt Backlog

| ID | Area | Issue | Priority | Effort |
|----|------|-------|----------|--------|
| TD-001 | Tests | Coverage ~15% across all modules | P1 | Large |
| TD-002 | Architecture | Some modules bypass service layer | P2 | Medium |[1D[K
|
| TD-003 | API | Missing pagination on 10+ endpoints | P2 | Small |
| TD-004 | DB | Missing indexes on frequently queried columns | P2 | Small [K
|
| TD-005 | Error handling | Bare except clauses in older modules | P2 | Med[3D[K
Medium |
| TD-006 | Types | Missing type hints in older service files | P3 | Medium [K
|
| TD-007 | Docs | 20+ modules have no API documentation | P2 | Medium |
| TD-008 | Frontend | Direct fetch() calls in some components | P2 | Small [K
|

---

## Security Backlog

| ID | Issue | Risk | Priority | Owner |
|----|-------|------|----------|-------|
| SEC-001 | Audit tenant_id enforcement across all 70+ modules | High | P0 [K
| Security Agent |
| SEC-002 | Admin portal authentication hardening | High | P0 | Security Ag[2D[K
Agent |
| SEC-003 | File upload validation and scanning | Medium | P1 | Security Ag[2D[K
Agent |
| SEC-004 | Rate limiting on all public endpoints | Medium | P1 | DevOps Ag[2D[K
Agent |
| SEC-005 | Secrets rotation procedure | Low | P2 | DevOps Agent |

---
*Sprint details: 10-AI/MAPPING/SPRINTS/ | Program: docs/program-management/[24D[K
docs/program-management/*

