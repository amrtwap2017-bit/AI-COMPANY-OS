# TRIANGLE BLACK — V7 EXECUTION BACKLOG
Date: 2026-08-31
Status: PRIORITY ORDERED

---

## IMMEDIATE (Before any other V7 work)

### TASK-0: Push to remote (10 minutes)
git push origin main
683 commits at risk. Do this NOW.

### TASK-1: Fix TypeScript build (1-2 hours)
Fix MobileBottomNav.tsx line 10 (property assignment expected)
Fix lib/role-navigation.ts lines 47-49 (unterminated string)
Verify: cd portal && npx tsc --noEmit returns 0 errors

### TASK-2: Fix auth on critical endpoints (2-4 hours)
Add Depends(get_current_user) to:
- POST /api/v1/rbac/users/{user_id}/role (L336)
- GET  /api/v1/rbac/users (L360)
- POST /api/v1/work-orders/{wo_id}/complete (L1041)
Verify all return 401 without token.

---

## GATE A — Engineering Trust (V7-001 through V7-020)

V7-002: Critical path + auth regression tests
V7-012: Full security audit + automated tests
V7-019: Backup restore verification
V7-020: CI/CD with portal TypeScript fix
V7-021: Database governance + main.py extraction phase 1

---

## GATE B — Data Trust

V7-004: Data quality 2.0 (confidence + sources + coverage)
V7-005: KPI registry (formula documentation)
V7-023: Import/export 2.0

---

## GATE C — Intelligence Trust

V7-006: Intelligence → Action loop (close the value loop)
V7-007: AI Governance 2.0 (recommendation auditability + reduce fatigue)
V7-009: Workflow engine verification

---

## GATE D — Product Trust

V7-003: Commercial onboarding wizard
V7-015: UX states (loading/empty/error)
V7-016: WCAG 2.2 AA for critical paths
V7-024: Professional reporting
V7-028: Demo mode with explicit synthetic data labels
V7-029: Pilot readiness + 30-day playbook

---

## GATE E — First Customer

NOT a code sprint.
Find engineering company.
Execute PILOT_PROGRAM.md.
Measure before/after.
Document with audit trail.

---

## WHAT NOT TO BUILD IN V7

Per V7 Directive §19:
- SSO/SCIM
- Native mobile app
- Multi-region
- Complex billing
- 50+ new dashboards
- LLM chatbot
- Kubernetes
- ERP integrations (without requirement)

