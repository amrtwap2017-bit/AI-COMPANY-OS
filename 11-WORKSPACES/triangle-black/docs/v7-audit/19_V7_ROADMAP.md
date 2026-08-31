# TRIANGLE BLACK — V7 EXECUTION ROADMAP
Date: 2026-08-31
Status: DRAFT — pending audit completion

---

## MINIMUM COMMERCIAL RELEASE PATH

The smallest set of upgrades required for Triangle Black to safely
onboard the first real customer and demonstrate measurable value:

### GATE A — Engineering Trust (2-3 weeks)
V7-001: Reality Audit ← THIS SPRINT
V7-002: Critical Path verification + fix
V7-012: Security hardening
V7-019: Backup/recovery verified
V7-020: CI/CD pipeline
V7-021: Database governance

### GATE B — Data Trust (2 weeks)
V7-004: Data Quality 2.0 (confidence scores, coverage, sources)
V7-005: KPI Registry (formula documentation)
V7-023: Import/Export 2.0 (safe onboarding)

### GATE C — Intelligence Trust (2 weeks)
V7-006: Intelligence → Action loop
V7-007: AI Governance 2.0 (recommendation auditability)
V7-009: Workflow Engine 2.0 (operational loop verified)

### GATE D — Product Trust (2 weeks)
V7-003: Commercial Onboarding wizard
V7-015: UX states (loading/empty/error)
V7-016: WCAG 2.2 AA (critical paths)
V7-024: Reporting (professional output)
V7-028: Demo mode (clearly labelled synthetic data)
V7-029: Pilot readiness (30-day playbook)

### GATE E — First Customer
NOT a code sprint.
Execute PILOT_PROGRAM.md.
Measure real before/after.
Document ROI with audit trail.

---

## SPRINT DEPENDENCY GRAPH

V7-001 (Audit) → ALL others
V7-002 (Critical Path) → V7-003, V7-012
V7-004 (Data Quality) → V7-005, V7-006
V7-005 (KPI Registry) → V7-006, V7-007
V7-006 (Intelligence→Action) → V7-007, V7-009
V7-009 (Workflow) → V7-010, V7-011
V7-012 (Security) → V7-020 (CI/CD)
V7-013 (Frontend) → V7-014, V7-015, V7-016
V7-020 (CI/CD) → V7-029 (Pilot)

---

## WHAT NOT TO BUILD IN V7

- SSO/SCIM (unless enterprise customer requires it)
- Native mobile app (PWA first)
- Multi-region deployment
- Complex billing engine
- 50+ new dashboards
- Fancy LLM chatbot
- ERP integrations (without customer requirement)
- Kubernetes (single server sufficient for pilot)

---

*Updated after audit completion.*
