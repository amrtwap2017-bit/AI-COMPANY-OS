# Schema Architecture

## Overview

PostgreSQL schema-per-tenant architecture. All tenants share a single database; each tenant's data lives in its own schema.

```
Database: triangle_black
│
├── public (platform schema)
│   ├── tenants
│   ├── users (internal staff — all tenants)
│   ├── refresh_tokens
│   ├── _prisma_migrations
│   └── schema_migrations
│
├── tenant_{hash_1} (e.g., tenant_a1b2c3d4)
│   ├── leads
│   ├── opportunities
│   ├── companies
│   ├── contacts
│   ├── activities
│   ├── rfqs
│   ├── quotations
│   ├── quotation_line_items
│   ├── contracts
│   ├── contract_terms
│   ├── projects
│   ├── milestones
│   ├── project_files
│   ├── surveys
│   ├── assessments
│   ├── service_requests
│   ├── portal_users
│   ├── documents
│   └── audit_log
│
├── tenant_{hash_2}
│   └── ... (same structure)
│
└── platform_audit_log (global audit)
```

## Platform Schema (public)

| Table | Purpose | 
|-------|---------|
| tenants | Tenant registry — one row per hotel client |
| users | Platform users (staff + client users) |
| refresh_tokens | Auth refresh tokens |
| _prisma_migrations | Prisma migration tracking |
| schema_migrations | Custom migration tracker per tenant |

## Tenant Schema

Each tenant (`tenant_{hash}`) contains:

### CRM Tables
- leads, opportunities, companies, contacts, activities

### Quotations Tables
- rfqs, quotations, quotation_line_items, contracts, contract_terms

### Projects Tables
- projects, milestones, project_files, surveys, assessments

### Client Portal Tables
- portal_users, service_requests

### Cross-cutting Tables
- documents, notifications, audit_log

## Schema Resolution

```typescript
// Prisma connection per tenant
async getClient(tenantId?: string): Promise<PrismaClient> {
  const schema = tenantId ? `tenant_${hashTenantId(tenantId)}` : 'public';
  const url = `${DATABASE_URL}?schema=${schema}`;
  // Cache and reuse PrismaClient per schema
}
```

## Tenant ID Hashing

```
schema_name = tenant_{first_8_chars_of_md5(tenant_id)}
Example: tenant_550e8400
```
