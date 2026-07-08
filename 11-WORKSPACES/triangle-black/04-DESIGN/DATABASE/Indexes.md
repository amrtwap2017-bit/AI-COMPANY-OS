# Index Strategy

## Principles

1. Every query pattern has a covering index
2. Indexes are added based on actual query patterns, not speculation
3. Monitor and remove unused indexes (via `pg_stat_user_indexes`)
4. Prefer composite indexes over multiple single-column indexes
5. Use partial indexes for filtered queries
6. Use GIN indexes for JSONB and array columns
7. Avoid over-indexing on write-heavy tables (indexes slow INSERT/UPDATE/DELETE)

## Table Indexes

### `tenants` (public schema)

| Index | Columns | Type | Justification |
|-------|---------|------|---------------|
| `pk_tenants` | `id` | PK (btree) | Primary key lookup |
| `uq_tenants_slug` | `slug` | UNIQUE btree | Slug is used in URL routing |
| `uq_tenants_domain` | `domain` | UNIQUE btree | Domain-based tenant resolution |
| `idx_tenants_status` | `status` | btree | Filter by active/inactive tenants |

### `users` (public schema)

| Index | Columns | Type | Justification |
|-------|---------|------|---------------|
| `pk_users` | `id` | PK (btree) | Primary key lookup |
| `uq_users_email` | `email` | UNIQUE btree | Email is the login identifier |
| `idx_users_tenant_id` | `tenant_id` | btree | Find all users in a tenant |
| `idx_users_tenant_role` | `tenant_id`, `role` | btree | Filter users by tenant and role |

### `properties`

| Index | Columns | Type | Justification |
|-------|---------|------|---------------|
| `pk_properties` | `id` | PK (btree) | Primary key lookup |
| `uq_properties_slug` | `slug` | UNIQUE btree | Slug-based URL routing per tenant |
| `idx_properties_status` | `status` | btree | Filter active/disabled properties |
| `idx_properties_config_gin` | `config` | GIN | JSONB queries on property config |

### `units`

| Index | Columns | Type | Justification |
|-------|---------|------|---------------|
| `pk_units` | `id` | PK (btree) | Primary key lookup |
| `idx_units_property_id` | `property_id` | btree | Find all units in a property |
| `idx_units_property_status` | `property_id`, `status` | btree | Filter units by status within a property |
| `idx_units_type_status` | `unit_type`, `status` | btree | Filter by type + status (search widget) |
| `idx_units_amenities_gin` | `amenities` | GIN | JSONB array queries on amenities |

### `reservations`

| Index | Columns | Type | Justification |
|-------|---------|------|---------------|
| `pk_reservations` | `id` | PK (btree) | Primary key lookup |
| `uq_reservations_confirmation_code` | `confirmation_code` | UNIQUE btree | Guest lookup by confirmation code |
| `idx_reservations_property_id` | `property_id` | btree | All reservations for a property |
| `idx_reservations_guest_id` | `guest_id` | btree | All reservations for a guest |
| `idx_reservations_property_status` | `property_id`, `status` | btree | **Most common query** — dashboard listing by status |
| `idx_reservations_property_dates` | `property_id`, `check_in`, `check_out` | btree | Availability calendar queries |
| `idx_reservations_status_created` | `status`, `created_at` | btree | Admin listing sorted by date |
| `idx_reservations_source` | `source` | btree | Channel booking reports |
| `idx_reservations_active` | `status` WHERE `status IN ('CONFIRMED','CHECKED_IN')` | PARTIAL | Active reservation lookups only |
| `idx_reservations_dates_gin` | `check_in`, `check_out` | btree | Date range searches |

**Justification for `idx_reservations_property_status`**: The primary dashboard view for hotel staff is "Show me today's reservations" filtered by status (pending arrivals, checked-in, etc.). This composite index covers the WHERE clause (property_id + status) without a separate sort.

**Justification for `idx_reservations_property_dates`**: Availability calendar is the most-hit page. The query "Which units are available for dates X to Y?" needs fast date range indexing.

### `reservation_units`

| Index | Columns | Type | Justification |
|-------|---------|------|---------------|
| `pk_reservation_units` | `id` | PK (btree) | Primary key |
| `idx_reservation_units_reservation_id` | `reservation_id` | btree | All units in a reservation |
| `idx_reservation_units_unit_id` | `unit_id` | btree | All reservations for a unit |
| `uq_reservation_units_reservation_unit` | `reservation_id`, `unit_id` | UNIQUE btree | Prevent duplicate unit assignments |
| `idx_reservation_units_unit_dates` | `unit_id`, `reservation_id` | btree | Unit availability check |

### `guests`

| Index | Columns | Type | Justification |
|-------|---------|------|---------------|
| `pk_guests` | `id` | PK (btree) | Primary key lookup |
| `idx_guests_property_id` | `property_id` | btree | All guests for a property |
| `idx_guests_name` | `first_name`, `last_name` | btree | Guest search by name |
| `idx_guests_email` | `email` | btree | Guest lookup by email |
| `idx_guests_phone` | `phone` | btree | Guest lookup by phone |
| `idx_guests_property_name` | `property_id`, `first_name`, `last_name` | btree | **Scoped search** — search guests within a property |

**Justification for `idx_guests_property_name`**: The primary guest search pattern is "search for a guest at my property." Without this index, PostgreSQL would scan all guests or do a bitmap combine.

### `folios`

| Index | Columns | Type | Justification |
|-------|---------|------|---------------|
| `pk_folios` | `id` | PK (btree) | Primary key lookup |
| `uq_folios_folio_number` | `folio_number` | UNIQUE btree | Financial reference lookup |
| `idx_folios_reservation_id` | `reservation_id` | btree | Find folio by reservation |
| `idx_folios_status` | `status` | btree | Filter open/closed folios |

### `folio_entries`

| Index | Columns | Type | Justification |
|-------|---------|------|---------------|
| `pk_folio_entries` | `id` | PK (btree) | Primary key lookup |
| `idx_folio_entries_folio_id` | `folio_id` | btree | All entries on a folio |
| `idx_folio_entries_type` | `entry_type` | btree | Filter by charge type |

### `payments`

| Index | Columns | Type | Justification |
|-------|---------|------|---------------|
| `pk_payments` | `id` | PK (btree) | Primary key lookup |
| `idx_payments_folio_id` | `folio_id` | btree | All payments for a folio |
| `idx_payments_reservation_id` | `reservation_id` | btree | All payments for a reservation |
| `idx_payments_status` | `status` | btree | Filter successful/failed payments |
| `idx_payments_transaction_id` | `transaction_id` | btree | External gateway lookup |

### `housekeeping_tasks`

| Index | Columns | Type | Justification |
|-------|---------|------|---------------|
| `pk_housekeeping_tasks` | `id` | PK (btree) | Primary key lookup |
| `idx_hk_tasks_property_id` | `property_id` | btree | All tasks for a property |
| `idx_hk_tasks_unit_id` | `unit_id` | btree | All tasks for a unit |
| `idx_hk_tasks_assigned_to` | `assigned_to` | btree | Staff's task list |
| `idx_hk_tasks_property_status` | `property_id`, `status` | btree | Dashboard view filtered by status |
| `idx_hk_tasks_scheduled_date` | `scheduled_date` | btree | Daily schedule view |
| `idx_hk_tasks_property_scheduled` | `property_id`, `scheduled_date` | btree | **Daily staff view** — tasks for today |

**Justification for `idx_hk_tasks_property_scheduled`**: Housekeeping dashboard shows "All tasks at my property for today." This composite index covers that query.

### `rate_plans`

| Index | Columns | Type | Justification |
|-------|---------|------|---------------|
| `pk_rate_plans` | `id` | PK (btree) | Primary key lookup |
| `idx_rate_plans_property_id` | `property_id` | btree | All rate plans for a property |
| `idx_rate_plans_active` | `is_active` | btree | Filter active rate plans |

### `audit_log`

| Index | Columns | Type | Justification |
|-------|---------|------|---------------|
| `pk_audit_log` | `id` | PK (btree) | Primary key lookup |
| `idx_audit_log_table_record` | `table_name`, `record_id` | btree | **Most common** — find all changes for a record |
| `idx_audit_log_changed_at` | `changed_at` | btree | Time-ordered audit queries |
| `idx_audit_log_changed_by` | `changed_by` | btree | Find changes by a specific user |
| `idx_audit_log_action` | `action` | btree | Filter by action type |

**Justification for `idx_audit_log_table_record`**: The primary audit query is "Show me all changes made to reservation X." This index covers that.

## JSONB Indexes

JSONB columns used in `WHERE` clauses or `@>` queries need GIN indexes:

```sql
CREATE INDEX idx_property_config_gin ON properties USING GIN (config);
CREATE INDEX idx_unit_amenities_gin ON units USING GIN (amenities);
CREATE INDEX idx_guest_preferences_gin ON guests USING GIN (preferences);
CREATE INDEX idx_reservation_channel_data_gin ON reservations USING GIN (channel_data);
```

For JSONB path-specific queries (e.g., `config->>'theme'`), add expression indexes:

```sql
CREATE INDEX idx_property_theme ON properties ((config->>'theme'));
```

## Full-Text Search Indexes

For guest name search, add GIN indexes on tsvector columns when needed:

```sql
ALTER TABLE guests ADD COLUMN search_vector tsvector
  GENERATED ALWAYS AS (to_tsvector('english', first_name || ' ' || last_name)) STORED;

CREATE INDEX idx_guest_search ON guests USING GIN (search_vector);
```

## Index Maintenance

```sql
-- Find unused indexes (index_scans = 0 for > 7 days)
SELECT schemaname, tablename, indexname, idx_scan
FROM pg_stat_user_indexes
WHERE idx_scan = 0;

-- Find duplicate indexes
SELECT pg_size_pretty(SUM(pg_relation_size(idx))::bigint) AS total,
       array_agg(indexrelid::regclass) AS indexes
FROM pg_index
WHERE NOT indisprimary
GROUP BY indrelid, indkey
HAVING COUNT(*) > 1;

-- Reindex (during maintenance window)
REINDEX INDEX CONCURRENTLY idx_reservations_property_status;
```

## Anti-Patterns

| Anti-pattern | Why | Alternative |
|-------------|-----|-------------|
| Indexing every column | Wastes disk and slows writes | Index only queried columns |
| Indexing boolean columns alone | Low selectivity, rarely used | Include in composite index |
| Over-indexing audit_log | Write-heavy table, indexes slow inserts | Minimal indexes, archive old data |
| Not indexing FK columns | Implicit N+1 on joins | Index every FK column |
| Ignoring index size on small tables | Tables < 1000 rows don't need indexes | Only add PK and UQ constraints |
