# Phase Sequence

## Overview

Program 2.5 is organized into 6 phases, each with a clear objective, defined sprints, and go/no-go criteria before proceeding.

## Phase Summary

| Phase | Name | Sprints | Duration | Objective |
|-------|------|---------|----------|-----------|
| 1 | Foundation | S1-S4 | 8 weeks | Multi-tenant platform ready |
| 2 | Revenue | S5-S8 | 8 weeks | Revenue cycle operational |
| 3 | Operations | S9-S12 | 8 weeks | Procurement-to-maintenance live |
| 4 | Intelligence | S13-S16 | 8 weeks | Dashboards and AI copilots |
| 5 | People | S17-S20 | 8 weeks | Mobile and HR operational |
| 6 | Scale | S21-S24 | 8 weeks | Platform hardened and scaled |

## Phase 1: Foundation (Sprints 1-4)

**Objective**: Establish the multi-tenant platform foundation with shared kernel (identity, auth, tenant management) and initial commercial capability (customer management, sales orders).

**Sprints**: 4 sprints × 2 weeks = 8 weeks

**Deliverables**:
- Identity and authentication service
- Multi-tenant isolation
- Customer management API + UI
- Sales order creation API + UI
- Foundation API gateway

**Go/No-Go Criteria**:
- [x] User can register and authenticate
- [x] Tenant isolation verified (data leak test)
- [x] Customer CRUD operational
- [x] Sales order with line items functional
- [x] API gateway routing to at least 2 services
- [x] All integration tests passing at 70% coverage

**Risk**: Delayed tenant isolation blocks all downstream work.

## Phase 2: Revenue (Sprints 5-8)

**Objective**: Enable the complete revenue cycle: contracts, project delivery, milestone tracking, and invoice matching.

**Sprints**: 4 sprints × 2 weeks = 8 weeks

**Deliverables**:
- Contract management with line items
- Revenue scheduling
- Project creation from contracts
- Milestone definition and approval
- Budget allocation
- Invoice matching (3-way)

**Go/No-Go Criteria**:
- [x] Contract can be created from sales order
- [x] Project auto-created from contract
- [x] Milestone billing generates invoice
- [x] Invoice matching passes 3-way test (PO, GRN, Invoice)
- [x] Revenue recognition schedule generated
- [x] End-to-end revenue cycle tested

**Risk**: Invoice matching complexity may extend sprint.

## Phase 3: Operations (Sprints 9-12)

**Objective**: Build procurement, supplier management, inventory, and maintenance capabilities.

**Sprints**: 4 sprints × 2 weeks = 8 weeks

**Deliverables**:
- Purchase order creation and approval workflow
- Supplier onboarding and evaluation
- Goods receipt and stock management
- Work order creation and maintenance scheduling

**Go/No-Go Criteria**:
- [x] PO workflow with budget check operational
- [x] Supplier can be onboarded and evaluated
- [x] Stock receipt reduces PO balance correctly
- [x] Work order consumes inventory correctly
- [x] Inventory valuation reports generated
- [x] Integration with Phase 2 data verified

**Risk**: Supplier management data migration may require extension.

## Phase 4: Intelligence (Sprints 13-16)

**Objective**: Implement document management, executive intelligence dashboards, AI copilots, and integration platform.

**Sprints**: 4 sprints × 2 weeks = 8 weeks

**Deliverables**:
- Document upload, classification, search
- KPI dashboard with financial, project, inventory metrics
- AI copilot query engine with RAG
- Integration API gateway and event bus

**Go/No-Go Criteria**:
- [x] Document search returns accurate results
- [x] KPI dashboard displays real-time data from 3+ domains
- [x] AI copilot answers queries correctly (80% accuracy threshold)
- [x] Integration endpoints registered and discoverable
- [x] Event bus delivering messages between services
- [x] System performance within SLA under load test

**Risk**: AI copilot accuracy may require additional training data.

## Phase 5: People (Sprints 17-20)

**Objective**: Enable mobile field operations and human resources management.

**Sprints**: 4 sprints × 2 weeks = 8 weeks

**Deliverables**:
- Mobile app with offline sync
- Field operations views (maintenance, project status)
- Employee records management
- Time tracking and leave management
- Payroll processing (basic)

**Go/No-Go Criteria**:
- [x] Mobile app authenticates and syncs offline
- [x] Field operations data visible on mobile
- [x] Employee records CRUD operational
- [x] Leave approval workflow functional
- [x] Payroll calculation matches expected output
- [x] Mobile and HR data integrated with existing domains

**Risk**: Mobile offline sync complexity may require additional sprint.

## Phase 6: Scale (Sprints 21-24)

**Objective**: Harden, optimize, and scale the platform for production growth.

**Sprints**: 4 sprints × 2 weeks = 8 weeks

**Deliverables**:
- Performance optimization and load testing
- Multi-region deployment
- Security hardening (penetration testing)
- Platform polish and UX improvements

**Go/No-Go Criteria**:
- [x] Load test passes at 2x expected peak traffic
- [x] Multi-region failover tested and operational
- [x] Penetration test passes with no critical/high findings
- [x] UX review completed with score > 85%
- [x] Documentation complete for all domains
- [x] Production deployment runbook verified

**Risk**: Security findings may require additional remediation sprint.

## Cumulative Timeline

```
Phase 1 ████████████████░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░
Phase 2 ░░░░░░░░░░░░░░████████████░░░░░░░░░░░░░░░░░░░░
Phase 3 ░░░░░░░░░░░░░░░░░░░░░░░░░░████████████░░░░░░░░
Phase 4 ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░████████
Phase 5 ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░████
Phase 6 ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░████
        0    8    16   24   32   40   48   56   64   72   80   88
        Weeks
```

**Total Duration**: 24 sprints = 48 weeks (approximately 11 months)
