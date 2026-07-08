# Phase 01 — Domain-Driven Design

> Bounded context map, ubiquitous language, and domain relationships.

## Bounded Contexts

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                           TRIANGLE BLACK — CONTEXT MAP                               │
├─────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                       │
│  ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐                   │
│  │   COMMERCIAL    │    │     PROJECT      │    │   MAINTENANCE   │                   │
│  │   (Core)        │◄──►│   DELIVERY       │    │   (Supporting)  │                   │
│  │                 │    │   (Core)         │    │                 │                   │
│  │ Lead → Contract │    │ Execution, NCR   │    │ Service, SLA    │                   │
│  └────────┬────────┘    └────────┬─────────┘    └────────┬────────┘                   │
│           │                     │                        │                            │
│           ▼                     ▼                        ▼                            │
│  ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐                   │
│  │  PROCUREMENT    │    │   INVENTORY     │    │    FINANCIAL    │                   │
│  │  (Supporting)   │    │  (Supporting)   │    │    CONTROL      │                   │
│  │                 │    │                 │    │    (Core)       │                   │
│  │ Requisition→PO  │    │ Stock, Warehouse│    │ AR/AP, Revenue  │                   │
│  └────────┬────────┘    └────────┬─────────┘    └────────────────┘                   │
│           │                     │                                                    │
│           ▼                     ▼                                                    │
│  ┌─────────────────┐    ┌─────────────────┐                                           │
│  │   SUPPLIER      │    │   DOCUMENT      │                                           │
│  │   MANAGEMENT    │    │   MANAGEMENT    │                                           │
│  │   (Supporting)  │    │   (Supporting)  │                                           │
│  └─────────────────┘    └─────────────────┘                                           │
│                                                                                       │
│  ┌─────────────────────────────────────────────────────────────────────┐             │
│  │                       SHARED KERNEL                                 │             │
│  │  User, Tenant, Role, Permission, Audit, Notification, File, Event  │             │
│  └─────────────────────────────────────────────────────────────────────┘             │
│                                                                                       │
│  ┌─────────────────────────────────────────────────────────────────────┐             │
│  │                   CROSS-CUTTING CONTEXTS                            │             │
│  │  EXECUTIVE-INTELLIGENCE │ AI-COPILOTS │ MOBILE │ INTEGRATIONS      │             │
│  └─────────────────────────────────────────────────────────────────────┘             │
│                                                                                       │
└─────────────────────────────────────────────────────────────────────────────────────┘
```

## Context Relationships

| Source Context | Relationship | Target Context | Type |
|---------------|-------------|----------------|------|
| Commercial | References | Customer/Project | Shared Customer |
| Commercial | Triggers | Project Delivery | Event (contract.signed) |
| Commercial | Triggers | Financial Control | Event (contract.signed) |
| Project Delivery | Triggers | Procurement | Event (milestone.requires) |
| Project Delivery | Triggers | Financial Control | Event (milestone.approved) |
| Procurement | References | Inventory | Shared Material |
| Procurement | Triggers | Financial Control | Event (po.approved) |
| Inventory | Updates | Financial Control | Event (consumption.recorded) |
| Financial Control | Triggers | Procurement | Event (payment.approved) |
| Maintenance | References | Commercial | Shared Customer/Contract |
| All Contexts | Report to | Executive Intelligence | Event (kpi.updated) |
| All Contexts | Consume | AI Copilots | Query (score/validate) |

## Anti-Corruption Layers

See `05-Domain/` and `05-Domain/Bounded-Context-Map.md` for detailed context mapping with ACLs.

## Related Documents

- [Ubiquitous Language](Ubiquitous-Language.md) — Shared terminology across all contexts
- `05-Domain/Bounded-Context-Map.md` — Detailed context map with ACL definitions
