# 06 — Database Standards

## Naming Conventions

| Element | Convention | Example |
|---------|-----------|---------|
| Tables | snake_case, plural | `leads`, `quotation_line_items` |
| Columns | snake_case | `first_name`, `assigned_to` |
| Primary keys | `id` | `id UUID DEFAULT gen_random_uuid()` |
| Foreign keys | `{referenced_table}_id` | `company_id`, `assigned_to` |
| Indexes | `idx_{table}_{columns}` | `idx_leads_status_assigned` |
| Unique constraints | `uq_{table}_{columns}` | `uq_users_email_tenant` |
| Enums | snake_case | `lead_status`, `opp_stage` |
| Junction tables | `{table1}_{table2}` | `project_engineers` |

## Required Columns (Every Table)

```sql
id          UUID PRIMARY KEY DEFAULT gen_random_uuid()
created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
updated_at  TIMESTAMPTZ NOT NULL
created_by  UUID NOT NULL
updated_by  UUID NOT NULL
deleted_at  TIMESTAMPTZ NULL
```

## Index Rules

| Rule | Applies To |
|------|-----------|
| Always index foreign keys | All FK columns |
| Always index `deleted_at` (partial: IS NULL) | All tables with soft delete |
| Always index by `status` | Any table filtered by status |
| Always index by `created_at DESC` | Any table with list views |
| Composite indexes for common query patterns | Leads by status+assignee |
| No indexes on low-cardinality columns | Boolean, small enums |

## Migration Rules

| Rule | Rationale |
|------|-----------|
| One migration per schema change | Traceability |
| Never edit existing migrations | Immutable history |
| Always write a down migration | Rollback capability |
| Review migrations before merging | Safety |
| No data loss migrations | Backward compatible |
| Large tables: use `CONCURRENTLY` | Avoid locking |

## Audit Rules

- All CREATE/UPDATE/DELETE logged to `audit_log`
- Capture: old_values, new_values, changed_by, changed_at, ip_address
- Retention: 2 years online, 5 years archived

## Query Performance Rules

- Always `EXPLAIN ANALYZE` new queries touching >10K rows
- N+1 queries are a defect, not an optimization opportunity
- Prisma `include` and `select` should fetch only needed columns
- Pagination required for all list endpoints
- No `SELECT *` in production code
