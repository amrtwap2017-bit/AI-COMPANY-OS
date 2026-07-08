# Phase 06 — Shared Kernel

> Foundational types, events, and utilities shared across all domains.

## Purpose

The Shared Kernel contains types, enums, constants, and base classes used by all business domains. It has zero dependencies on any domain module.

## Contents

| Category | Items | Used By |
|----------|-------|---------|
| Enums | LeadStatus, OpportunityStage, QuotationStatus, ProjectStatus, NCRSeverity, InvoiceStatus, etc. | All domains |
| Types | Address, ContactInfo, Money, Pagination, ApiResponse | All domains |
| Events | BaseEvent, DomainEvent interface | All domains |
| Audit | AuditEntry, AuditAction enum | All domains |
| Constants | Status transitions, default pagination, validation limits | All domains |
| Utilities | ID generators, date helpers, formatting | All domains |

## Location

`00-SHARED-KERNEL/` — 20 files following the standard template:

| # | File | Purpose |
|---|------|---------|
| 01 | Business-Overview.md | Shared kernel purpose |
| 02 | Capabilities.md | Shared capabilities |
| 03 | Workflows.md | Cross-domain workflows |
| 04 | Business-Rules.md | Cross-cutting rules |
| 05 | Roles.md | System-wide roles |
| 06 | Permissions.md | Permission definitions |
| 07 | Screens.md | Shared UI components |
| 08 | Components.md | Shared business components |
| 09 | Database.md | Shared tables (tenant, user, role) |
| 10 | APIs.md | Platform APIs |
| 11 | Events.md | Base event definitions |
| 12 | Notifications.md | Notification templates |
| 13 | Reports.md | System reports |
| 14 | KPIs.md | Platform KPIs |
| 15 | AI-Opportunities.md | Shared AI use cases |
| 16 | Testing.md | Test patterns |
| 17 | Acceptance-Criteria.md | Shared acceptance criteria |
| 18 | Implementation-Checklist.md | Shared implementation checklist |
| 19 | Dependencies.md | Shared dependencies |
| 20 | Future.md | Shared roadmap |

## Key Interfaces

```typescript
interface DomainEvent {
  id: string;
  type: string;
  source: string;
  subject: string;
  data: Record<string, unknown>;
  timestamp: Date;
  correlationId: string;
  tenantId: string;
}
```

## Related Documents

- `00-SHARED-KERNEL/` — Complete 20-file set
- [Architecture Principles](../01-ARCHITECTURE-PRINCIPLES.md)
- [Identifier Standards](../SHARED/Identifier-Standards.md)
