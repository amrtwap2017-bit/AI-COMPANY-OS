# Enterprise Upgrade Sprint Roadmap

## Execution Principle
Each sprint is 1-3 days. Every sprint produces testable evidence.
No sprint should break existing functionality.
Sprints are dependency-ordered.

## Phase 0 — Safety (Sprints 000-003)

### SPRINT-000: CI/CD Foundation
Goal: Automated quality gates on every commit
Tasks:
- Create .github/workflows/ci.yml with lint + type check + pytest
- Add Python linting (ruff or flake8)
- Add portal TypeScript check (tsc --noEmit)
- Add pytest subset runner for CI (fast subset)
Acceptance: Every push runs lint + type + test
Risk: LOW
Effort: 1 day

### SPRINT-001: Secrets Audit
Goal: No hardcoded secrets in repository
Tasks:
- Scan for hardcoded passwords, API keys, tokens
- Move all secrets to .env with validation
- Add .env.example with all required vars documented
- Add secrets presence check to CI
Acceptance: No secrets in source code
Risk: LOW
Effort: 1 day

### SPRINT-002: Health Check Standardization
Goal: Production-ready health endpoints
Tasks:
- Verify /health/live and /health/ready work
- Add dependency checks (DB, Redis, Ollama)
- Add Docker HEALTHCHECK directives
- Document health check SLOs
Acceptance: Health endpoints respond correctly under failure
Risk: LOW
Effort: 1 day

### SPRINT-003: Documentation Reality Sync
Goal: Remove confusion between NestJS docs and FastAPI reality
Tasks:
- Update 00-ARCHITECT docs to reflect Python/FastAPI stack
- Add ARCHITECTURE_REALITY.md with current stack
- Mark NestJS/Prisma docs as SUPERSEDED
- Update README.md quick start
Acceptance: New developer can understand actual stack in 10 minutes
Risk: LOW
Effort: 1 day

## Phase 1 — Architecture Seams (Sprints 004-008)

### SPRINT-004: RBAC Enforcement
Goal: Authorization checked on every protected endpoint
Tasks:
- Create src/core/rbac.py with role + permission checks
- Create authorization dependency for FastAPI
- Wire to 10 highest-risk endpoints first
- Add 20 authorization tests
Acceptance: Unauthorized users get 403 on protected endpoints
Risk: MEDIUM
Effort: 3 days

### SPRINT-005: Main.py Router Extraction Phase 1
Goal: Extract first 20 router registrations from inline to modular
Tasks:
- Create src/router_registry.py with safe registration
- Migrate 20 routers from inline try blocks to registry
- Verify all 20 routes still respond
Acceptance: main.py reduced by 200+ lines
Risk: MEDIUM
Effort: 2 days

### SPRINT-006: Repository Layer Phase 1
Goal: Extract raw SQL from 10 highest-traffic routers
Tasks:
- Create repository classes for work_orders, assets, invoices
- Move SQL from router to repository
- Router delegates to repository
- Add repository unit tests
Acceptance: 10 routers have no raw SQL
Risk: MEDIUM
Effort: 3 days

### SPRINT-007: Notification Consolidation Audit
Goal: Map all 7 notification modules and define consolidation plan
Tasks:
- Inventory all notification/email/alert modules
- Document consumers of each
- Create ADR for notification consolidation
- Do NOT delete or merge yet
Acceptance: ADR approved with migration path
Risk: LOW
Effort: 1 day

### SPRINT-008: Approval Consolidation Audit
Goal: Map all 3 approval modules and define consolidation plan
Tasks:
- Inventory approval_center, approval_chain, approval_requests
- Document workflow differences
- Create ADR for unified approval workflow
Acceptance: ADR approved
Risk: LOW
Effort: 1 day

## Phase 2 — Enterprise UX (Sprints 009-012)

### SPRINT-009: Design Token System
Goal: Replace hardcoded colors and inline styles with tokens
Tasks:
- Create portal/lib/design-tokens.ts
- Define color, spacing, radius, shadow, typography tokens
- Convert 50 highest-usage inline styles to tokens
Acceptance: Token file exists, 50 styles converted
Risk: LOW
Effort: 2 days

### SPRINT-010: ts-nocheck Removal Phase 1
Goal: Remove 50 ts-nocheck directives
Tasks:
- Fix TypeScript errors in 50 pages
- Remove ts-nocheck from each
Acceptance: 50 fewer ts-nocheck directives
Risk: LOW
Effort: 2 days

### SPRINT-011: Page Contract Implementation
Goal: 10 canonical pages follow the enterprise page contract
Tasks:
- Implement PageHeader + Breadcrumb + KPI + Actions pattern
- Apply to operations/work-orders, maintenance/assets, supply-chain
Acceptance: 10 pages follow contract
Risk: LOW
Effort: 2 days

### SPRINT-012: Accessibility Audit
Goal: WCAG 2.2 AA baseline for 10 critical pages
Tasks:
- Run axe-core on 10 pages
- Fix critical violations
- Add keyboard navigation tests
Acceptance: 0 critical violations on 10 pages
Risk: LOW
Effort: 2 days

## Phase 3 — Workflow Platform (Sprints 013-015)

### SPRINT-013: Workflow State Machine Hardening
Goal: TriangleWorkflowEngine becomes the canonical state transition authority
Tasks:
- Add state validation to all SR and WO status changes
- Reject invalid transitions
- Add workflow audit events for every transition
Acceptance: Invalid transitions return 400
Risk: MEDIUM
Effort: 2 days

### SPRINT-014: Approval Workflow Integration
Goal: Wire approval process to workflow engine
Tasks:
- Create approval workflow definition
- Connect PR approval to workflow engine
- Add approval audit trail
Acceptance: PR approval uses workflow engine
Risk: MEDIUM
Effort: 2 days

### SPRINT-015: SLA Escalation
Goal: Auto-escalate breached SLA to managers
Tasks:
- Wire SLA scanner to notification engine
- Create escalation rules
- Add manager notification on breach
Acceptance: Breached WOs trigger manager notification
Risk: LOW
Effort: 1 day

## Phase 4 — Data Platform (Sprints 016-018)

### SPRINT-016: Event Wiring Phase 2
Goal: Emit events from 5 more domain operations
Tasks:
- Wire events to asset.created, invoice.created, po.created, sr.created, supplier.created
- Add event verification tests
Acceptance: 5 new event types flowing to outbox
Risk: LOW
Effort: 2 days

### SPRINT-017: Read Model Wiring
Goal: Wire executive dashboard to read models instead of OLTP
Tasks:
- Replace executive_dashboard/router.py queries with ExecutiveReadModel
- Verify response format unchanged
Acceptance: Executive endpoint uses read model
Risk: LOW
Effort: 1 day

### SPRINT-018: Digital Twin Projection Wiring
Goal: Auto-project events to twin graph
Tasks:
- Wire event dispatcher to TwinProjector
- Process pending events on platform/sla-scan call
- Add twin stats to platform/status
Acceptance: Events auto-project to twin nodes
Risk: MEDIUM
Effort: 2 days

## Phase 5+ — AI, SaaS, Performance (Future)

### SPRINT-019: AI Evaluation Framework
### SPRINT-020: Agent Registry
### SPRINT-021: Organization Provisioning
### SPRINT-022: Performance SLO Enforcement
### SPRINT-023: E2E Critical Path Coverage
### SPRINT-024: Contract Tests
