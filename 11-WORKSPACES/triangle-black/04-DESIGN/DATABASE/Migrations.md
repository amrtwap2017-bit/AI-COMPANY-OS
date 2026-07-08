# Migration Plan

## Strategy: Prisma Migrate

```
Database: PostgreSQL 16
ORM: Prisma 6.x
Migration tool: prisma migrate dev (dev), prisma migrate deploy (prod)
Seed data: prisma/seed.ts
```

## Migration Sequence

### M001 — Platform Schema (public)
| Migration | Creates |
|-----------|---------|
| `m001_platform_schema` | tenants, users, refresh_tokens tables + enums |

### M002 — CRM Schema (tenant)
| Migration | Creates |
|-----------|---------|
| `m002_crm_tenant` | leads, opportunities, companies, contacts, activities tables + indexes |

### M003 — Quotations Schema (tenant)
| Migration | Creates |
|-----------|---------|
| `m003_quotations_tenant` | rfqs, quotations, quotation_line_items, contracts, contract_terms tables + indexes |

### M004 — Projects Schema (tenant)
| Migration | Creates |
|-----------|---------|
| `m004_projects_tenant` | projects, milestones, project_files, surveys, assessments tables + indexes |

### M005 — Client Portal Schema (tenant)
| Migration | Creates |
|-----------|---------|
| `m005_portal_tenant` | service_requests, portal_users, notifications tables + indexes |

### M006 — Document Schema (tenant)
| Migration | Creates |
|-----------|---------|
| `m006_documents_tenant` | documents table + full-text search index |

### M007 — Audit Schema
| Migration | Creates |
|-----------|---------|
| `m007_audit` | tenant audit_log table, platform_audit_log table, trigger functions |

## New Tenant Provisioning

```sql
-- Executed atomically when a new tenant is onboarded
CREATE SCHEMA IF NOT EXISTS tenant_{hash};

SET search_path TO tenant_{hash};

-- Run M002..M006 migrations in order against tenant_{hash} schema
-- Insert into public.tenants
-- Create initial admin user
```

## Rollback Strategy

| Scenario | Action |
|----------|--------|
| Dev migration fails | `prisma migrate reset` |
| Staging migration fails | Restore from latest backup, fix migration, re-run |
| Production migration fails | Roll forward — create a fix migration instead of rolling back |
| Tenant-specific failure | Isolate tenant schema, fix individually |

## Seed Data

```typescript
// prisma/seed.ts — creates:
// 1. Platform admin user (super_admin)
// 2. Demo tenant "Sample Hotel Co."
// 3. Demo tenant admin user
// 4. Sample leads, opportunities, company, contacts
// 5. Sample quotation with line items
// 6. Sample project with milestones
```

## CI/CD Integration

```yaml
# GitHub Actions workflow step
- name: Run migrations
  run: npx prisma migrate deploy
  env:
    DATABASE_URL: ${{ secrets.DATABASE_URL }}
```
