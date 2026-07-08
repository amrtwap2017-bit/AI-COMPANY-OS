# Sprint Dependencies

## Sprint Dependency Structure

Sprints are organized in 2-week iterations across 6 phases. The dependency graph below shows which sprints must complete before dependent sprints can begin.

## ASCII Dependency Diagram

```
Phase 1: Foundation
S1 ──→ S2 ──→ S3 ──→ S4
                        │
Phase 2: Revenue        │
S5 ──→ S6 ──→ S7 ──→ S8
                        │
Phase 3: Operations     │
S9 ──→ S10 ──→ S11 ──→ S12
                        │
Phase 4: Intelligence   │
S13 ──→ S14 ──→ S15 ──→ S16
                        │
Phase 5: People         │
S17 ──→ S18 ──→ S19 ──→ S20
                        │
Phase 6: Scale          │
S21 ──→ S22 ──→ S23 ──→ S24
```

Cross-phase critical path dependencies (dotted):

```
S4 (Foundation) ─ ─ → S5 (Revenue Start)
S8 (Revenue) ─ ─ → S9 (Operations Start)
S12 (Operations) ─ ─ → S13 (Intelligence Start)
S16 (Intelligence) ─ ─ → S17 (People Start)
S20 (People) ─ ─ → S21 (Scale Start)
```

## Sprint Dependency Table

### Phase 1: Foundation

| Sprint | Domain Sprint | Depends On | Critical Path |
|--------|-------------|-----------|---------------|
| S1 | 00 Shared Kernel - Identity | - | Yes |
| S2 | 00 Shared Kernel - Auth + Tenant | S1 | Yes |
| S3 | 00 Shared Kernel - Foundation API | S2 | Yes |
| S4 | 01 Commercial - Customer + Sales | S3 | Yes |

### Phase 2: Revenue

| Sprint | Domain Sprint | Depends On | Critical Path |
|--------|-------------|-----------|---------------|
| S5 | 01 Commercial - Contracts + Revenue | S4 | Yes |
| S6 | 02 Project Delivery - Project Creation | S5 | Yes |
| S7 | 02 Project Delivery - Milestones + Budget | S6 | Yes |
| S8 | 06 Financial Control - Invoice Matching | S7, S4 | Yes |

### Phase 3: Operations

| Sprint | Domain Sprint | Depends On | Critical Path |
|--------|-------------|-----------|---------------|
| S9 | 03 Procurement - PO Creation | S5 | Yes |
| S10 | 04 Supplier Management - Onboarding | S9 | Yes |
| S11 | 05 Inventory - Stock Receipt | S9 | Yes |
| S12 | 07 Maintenance - Work Orders | S11, S7 | Yes |

### Phase 4: Intelligence

| Sprint | Domain Sprint | Depends On | Critical Path |
|--------|-------------|-----------|---------------|
| S13 | 08 Document Management - Upload | S9, S12 | Yes |
| S14 | 09 Executive Intelligence - KPI Dashboards | S8, S12 | Yes |
| S15 | 10 AI Copilots - Query Engine | S14, S13 | Yes |
| S16 | 11 Integrations - API Gateway | S4 | Yes |

### Phase 5: People

| Sprint | Domain Sprint | Depends On | Critical Path |
|--------|-------------|-----------|---------------|
| S17 | 12 Mobile - Device + Auth | S16, S5 | No |
| S18 | 12 Mobile - Field Ops Views | S17, S12 | No |
| S19 | 13 Human Resources - Employee Records | S4 | No |
| S20 | 13 Human Resources - Payroll | S19, S8 | No |

### Phase 6: Scale

| Sprint | Domain Sprint | Depends On | Critical Path |
|--------|-------------|-----------|---------------|
| S21 | Cross-domain - Performance | S16 | No |
| S22 | Cross-domain - Multi-region | S21 | No |
| S23 | Cross-domain - Advanced Security | S22 | No |
| S24 | Cross-domain - Platform Polish | S23 | No |

## Critical Path Identification

The critical path consists of sprints where any delay directly extends the program timeline:

| Critical Sprint | Domain | Rationale |
|----------------|--------|-----------|
| S1 | 00 Shared Kernel | Foundation for all domains |
| S2 | 00 Shared Kernel | No domain can function without auth |
| S3 | 00 Shared Kernel | Tenant isolation required before data entry |
| S4 | 01 Commercial | Revenue cycle cannot start without sales data |
| S5 | 01 Commercial | Contracts trigger procurement and delivery |
| S6-7 | 02 Project Delivery | Projects drive financial and operational domains |
| S8 | 06 Financial Ctrl | Financial reconciliation gates intelligence |
| S9 | 03 Procurement | PO data is consumed by 4 downstream domains |
| S11 | 05 Inventory | Stock data feeds maintenance and finance |
| S13 | 08 Document Mgmt | Document corpus required for AI copilots |
| S14 | 09 Exec Intel | Dashboards required before AI layer |

## Non-Critical Path Sprints

| Sprint | Domain | Slack | Notes |
|--------|--------|-------|-------|
| S10 | 04 Supplier Mgmt | 1 sprint | Can be delayed if supplier data is batched |
| S17-18 | 12 Mobile | 2 sprints | Mobile is additive, not blocking |
| S19-20 | 13 HR | 2 sprints | People domain has soft dependencies only |
| S21-24 | Scale | 4 sprints | Scale phase is post-MVP gold-plating |
