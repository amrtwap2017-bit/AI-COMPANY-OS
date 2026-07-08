# 05 — Master Dependencies

> Complete dependency graph across all phases, domains, and integrations.

## Phase Dependency Chain

```
PHASE-00  ──►  PHASE-01  ──►  PHASE-02  ──►  PHASE-03  ──►  PHASE-04  ──►  PHASE-05  ──►  PHASE-06  ──►  PHASE-07
(hard dep)     (hard dep)     (hard dep)     (hard dep)     (hard dep)     (hard dep)     (hard dep)     (soft dep on 06)
```

- **Hard dependency**: Phase N+1 cannot be completed without Phase N
- **Soft dependency**: Phase N+1 references Phase N but can proceed independently

## Phase 6 — Business Domain Dependency Graph

```
00-SHARED-KERNEL
 └─► 01-COMMERCIAL
      ├─► 02-PROJECT-DELIVERY
      ├─► 05-INVENTORY
      └─► 06-FINANCIAL-CONTROL
           └─► 03-PROCUREMENT
                └─► 04-SUPPLIER-MANAGEMENT
      ├─► 07-MAINTENANCE
      ├─► 08-DOCUMENT-MANAGEMENT
      ├─► 09-EXECUTIVE-INTELLIGENCE
      │    └─► 10-AI-COPILOTS
      ├─► 11-INTEGRATIONS
      └─► 12-MOBILE
```

### Domain Dependency Rules

1. Each domain depends only on domains listed to its left in the directory ordering
2. No circular dependencies between domains
3. Shared Kernel (00) is the only domain with zero dependencies
4. Commercial (01) depends only on Shared Kernel
5. All other domains depend on Commercial (for client/contract reference)
6. Financial Control depends on Commercial, Delivery, Procurement, Inventory
7. AI Copilots depends on all domains
8. Integrations depends on all domains
9. Mobile depends on all domains

## Phase 7 — Integration Dependency Map

```
INT-001 (ETA E-Invoice) ──► 06-FINANCIAL-CONTROL
INT-002 (SMTP Email)    ──► 01-COMMERCIAL, all domains
INT-003 (WhatsApp)      ──► 01-COMMERCIAL, 07-MAINTENANCE
INT-004 (Calendar)      ──► 02-PROJECT-DELIVERY
INT-005 (DO Spaces)     ──► 08-DOCUMENT-MANAGEMENT
INT-006 (Webhook)       ──► All domains (event-driven)
INT-007 (Bank CSV)      ──► 06-FINANCIAL-CONTROL
```

## Shared / Governance Cross-References

```
SHARED/Naming-Conventions.md        ──► All files
SHARED/Identifier-Standards.md     ──► All database schemas, APIs
SHARED/Documentation-Templates.md  ──► All documents
SHARED/Cross-Reference-Rules.md    ──► All inter-file references
SHARED/Versioning-Policy.md        ──► All phases
SHARED/ADR-Template.md             ──► 02-DECISION-RECORDS.md
SHARED/Requirement-Template.md     ──► Phase 1, 6
SHARED/API-Template.md             ──► Phase 3
SHARED/Database-Template.md        ──► Phase 3
SHARED/Workflow-Template.md        ──► Phase 6
SHARED/Review-Checklist.md         ──► All PR reviews
```

## Key Dependency Constraints

| Constraint | Description |
|------------|-------------|
| Design Freeze | Phases 0-4 frozen. Phase 5-7 implement against stable baseline |
| No Circular Depts | Module dependency graph is a DAG. Verified at build time |
| Schema Isolation | Each domain owns its database tables. No cross-domain table access |
| Event Coupling | Cross-domain communication via events only. No direct DB access |
| Integration Boundary | Phase 7 never modifies Phase 5-6 code. ACL pattern enforced |
