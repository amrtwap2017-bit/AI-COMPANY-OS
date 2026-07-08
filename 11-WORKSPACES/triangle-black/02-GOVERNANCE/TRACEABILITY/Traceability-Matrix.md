# 03 — Traceability Matrix

> Cross-phase requirements traceability — from business requirement to API, database, screen, and test.

## Traceability Model

```
Requirement (Phase 0-1) ──► Feature (Phase 2-3) ──► API (Phase 3) ──► DB Table (Phase 3) ──► Screen (Phase 3) ──► Domain Module (Phase 6) ──► Integration (Phase 7)
```

## Requirement Coverage Summary

| Domain | Requirements | APIs | DB Tables | Screens | Phase 6 Module | Phase 7 Coverage |
|--------|-------------|------|-----------|---------|----------------|-------------------|
| Lead Management | 5 | 8 | 2 | 3 | 01-COMMERCIAL | — |
| Opportunity Management | 4 | 6 | 2 | 2 | 01-COMMERCIAL | — |
| Site Survey | 3 | 5 | 2 | 2 | 01-COMMERCIAL | — |
| Quotation | 4 | 8 | 3 | 3 | 01-COMMERCIAL | — |
| Contract | 3 | 6 | 2 | 2 | 01-COMMERCIAL | — |
| Project Execution | 6 | 10 | 4 | 4 | 02-PROJECT-DELIVERY | — |
| Procurement | 5 | 8 | 3 | 3 | 03-PROCUREMENT | INT-001 |
| Supplier Management | 4 | 6 | 3 | 2 | 04-SUPPLIER-MANAGEMENT | — |
| Inventory | 5 | 8 | 4 | 3 | 05-INVENTORY | — |
| Financial Control | 6 | 12 | 5 | 4 | 06-FINANCIAL-CONTROL | INT-001, INT-007 |
| Maintenance | 4 | 6 | 3 | 3 | 07-MAINTENANCE | — |
| Document Management | 3 | 5 | 2 | 2 | 08-DOCUMENT-MANAGEMENT | INT-005 |
| Executive Intelligence | 3 | 6 | 2 | 4 | 09-EXECUTIVE-INTELLIGENCE | — |
| AI Copilots | 3 | 4 | 1 | 2 | 10-AI-COPILOTS | — |
| Mobile | 2 | 4 | — | 5 | 12-MOBILE | — |

## Traceability by Phase

| Requirement ID | Title | Phase 1 Doc | Phase 3 API | Phase 3 DB | Phase 3 Screen | Phase 6 File | Phase 7 Contract |
|---------------|-------|-------------|-------------|------------|----------------|--------------|-------------------|
| REQ-LD-001 | Capture lead from multiple channels | Business-Architecture | POST /leads | lead | LeadForm | 01-COMMERCIAL/05-Components.md | — |
| REQ-LD-002 | Score and qualify leads | Business-Architecture | POST /leads/{id}/score | lead_score | LeadScoreCard | 01-COMMERCIAL/06-Workflows.md | — |
| REQ-OP-001 | Create opportunity from lead | Business-Architecture | POST /opportunities | opportunity | OpportunityCreate | 01-COMMERCIAL/05-Components.md | — |
| REQ-QT-001 | Generate multi-line quotation | Business-Architecture | POST /quotations | quotation, quotation_line | QuotationBuilder | 01-COMMERCIAL/05-Components.md | — |
| REQ-CT-001 | Convert quotation to contract | Business-Architecture | POST /contracts | contract | ContractForm | 01-COMMERCIAL/05-Components.md | — |
| REQ-PR-001 | Create purchase order | Business-Architecture | POST /purchase-orders | purchase_order, po_line | POForm | 03-PROCUREMENT/05-Components.md | INT-001 |
| REQ-FI-001 | Process 3-way match | Business-Architecture | POST /financial/3-way-match | three_way_match | ThreeWayMatchScreen | 06-FINANCIAL-CONTROL/05-Components.md | INT-001 |
| REQ-FI-002 | Recognize revenue on milestone | Business-Architecture | POST /revenue/recognize | revenue_recognition | RevenueDashboard | 06-FINANCIAL-CONTROL/05-Components.md | INT-007 |

## Gap Analysis

| Gap | Severity | Resolution |
|-----|----------|------------|
| Phase 2 traceability to Phase 1 requirements | Medium | Add requirement IDs to Phase 2 feature specs |
| Phase 7 contract coverage for domains 02, 04, 05, 07 | Low | V2 scope — V1 integrations prioritized by revenue impact |
| Mobile (Phase 6, 12-MOBILE) has no database tables | Low | Mobile consumes APIs — no mobile-specific tables needed |

## Traceability Verification Process

1. Each Phase 6 module includes an Implementation-Checklist.md
2. Each checklist item traces to a requirement ID
3. Acceptance-Criteria.md includes verification criteria per requirement
4. Integration contracts in Phase 7 reference Phase 6 domain events
5. Root traceability matrix updated quarterly
