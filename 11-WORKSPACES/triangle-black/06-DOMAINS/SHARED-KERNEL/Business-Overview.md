# 00-SHARED-KERNEL — Business Overview

## Purpose

The Shared Kernel is the common language of Triangle Black's platform. Every domain references these types and patterns, ensuring consistency and preventing duplication.

## What Lives Here

- **Primitives:** Currency, UOM, country, language
- **Base Types:** `BaseEntity` (UUID PK, tenant_id, audit fields, soft delete)
- **Enums:** `LeadStatus`, `OpportunityStage`, `ContractStatus`, `SurveyStatus`, `QuotationStatus`, `ProjectStatus`, `InvoiceStatus`, `POWorkflow`, many more
- **Events:** Canonical event definitions (`domain/event-name.ts`)
- **Policies:** Multi-tenant isolation, soft delete, audit logging
- **Validation:** Shared Zod/class-validator schemas
- **Notifications:** Channel definitions (in-app, email)
- **Reports:** PDF/CSV generation templates

## Key Design Decisions

| Decision | Rationale |
|----------|-----------|
| All IDs are UUIDv4 | Distributed-safe, no sequential leaks |
| Tenant ID on every entity | Schema-per-tenant enforced at DB level |
| Soft delete everywhere | No data loss, cascading considerations |
| Audit fields required | Compliance with Egyptian data regulations |
| Enums as Prisma enums | Type safety, DB constraints |
| Events as TypeScript types | Type-safe event bus |
