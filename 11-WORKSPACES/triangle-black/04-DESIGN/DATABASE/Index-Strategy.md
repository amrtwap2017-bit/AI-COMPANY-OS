# Index Strategy

## Core Indexes (Every Table)

| Column | Index Type | Justification |
|--------|-----------|---------------|
| tenant_id | B-tree (clustered) | All queries scoped by tenant |
| deleted_at | Partial (IS NULL) | Soft-delete filtering |
| created_at | B-tree (DESC) | Default sort for lists |
| created_by | B-tree | Audit queries |
| updated_by | B-tree | Audit queries |

## Table-Specific Indexes

### leads
| Columns | Type | Purpose |
|---------|------|---------|
| (status, assigned_to) | Composite | Pipeline filtering by status + owner |
| (score) | B-tree DESC | Lead sorting by score |
| (source) | B-tree | Source analytics |
| (email) | Unique (tenant) | Duplicate prevention |

### opportunities
| Columns | Type | Purpose |
|---------|------|---------|
| (stage, assigned_to) | Composite | Sales pipeline view |
| (close_date) | B-tree | Forecast queries |
| (company_id) | B-tree | Company drill-down |
| (value) | B-tree DESC | Deal size sorting |

### quotations
| Columns | Type | Purpose |
|---------|------|---------|
| (status) | B-tree | Quotation pipeline dashboard |
| (valid_until) | B-tree | Expiry monitoring |
| (company_id) | B-tree | Client quotation history |
| (number) | Unique | Auto-generated number |

### projects
| Columns | Type | Purpose |
|---------|------|---------|
| (status) | B-tree | Project pipeline |
| (manager_id) | B-tree | Manager workload |
| (company_id) | B-tree | Client project list |
| (start_date, end_date) | Composite | Timeline queries |

### milestones
| Columns | Type | Purpose |
|---------|------|---------|
| (project_id, sequence) | Composite | Ordered milestone list |
| (status, due_date) | Composite | Overdue monitoring |
| (assigned_to) | B-tree | Assignment lookup |

### service_requests
| Columns | Type | Purpose |
|---------|------|---------|
| (status, priority) | Composite | Queue management |
| (assigned_to) | B-tree | Technician workload |
| (company_id) | B-tree | Client request history |

### activities
| Columns | Type | Purpose |
|---------|------|---------|
| (entity_type, entity_id) | Composite | Entity timeline |
| (activity_date) | B-tree DESC | Recent activity |
| (assigned_to) | B-tree | User activity log |

### audit_log
| Columns | Type | Purpose |
|---------|------|---------|
| (table_name, record_id) | Composite | Record change history |
| (changed_at) | B-tree DESC | Recent changes |
| (changed_by) | B-tree | User audit trail |
| (tenant_id) | B-tree | Tenant audit scope |

## Full-Text Search Indexes

```sql
-- Lead/company search
CREATE INDEX idx_leads_search ON leads USING GIN(
  to_tsvector('english', coalesce(first_name, '') || ' ' || coalesce(last_name, '') || ' ' || coalesce(company_name, ''))
);

-- Document search
CREATE INDEX idx_documents_search ON documents USING GIN(to_tsvector('english', name));
```

## JSONB Indexes

```sql
-- Companies.address GIN index for spatial/address queries
CREATE INDEX idx_companies_address ON companies USING GIN(address);
```

## Maintenance

- `REINDEX` monthly during low-traffic window
- `ANALYZE` after bulk imports
- Monitor `pg_stat_user_indexes` for unused indexes quarterly
