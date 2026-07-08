# Database Naming Conventions

## General Rules

- All identifiers use **snake_case**
- All identifiers are **lowercase**
- Use **singular** form for table names (e.g., `property`, not `properties`)
- Use **descriptive names** — avoid abbreviations (except industry standards)
- Maximum identifier length: **63 characters** (PostgreSQL limit)
- Reserved words must never be used as identifiers

## Tables

| Pattern | Example | Rule |
|---------|---------|------|
| Entity tables | `property`, `guest`, `reservation` | Singular, snake_case |
| Join tables | `reservation_unit`, `reservation_guest` | Both entity names, alphabetical |
| Lookup/enum tables | `unit_type`, `payment_method`, `booking_status` | Descriptive |
| Audit tables | `audit_log` | Suffix with purpose |
| Template/archive tables | `reservation_archive` | Suffix with `_archive` |
| Cache tables | `rate_cache` | Suffix with `_cache` |

## Columns

### Primary Keys

| Column | Type | Rule |
|--------|------|------|
| `id` | `UUID` | Every table has `id UUID PRIMARY KEY DEFAULT gen_random_uuid()` |

### Foreign Keys

| Pattern | Example | Rule |
|---------|---------|------|
| `{singular_table}_id` | `property_id`, `guest_id`, `unit_id` | References the PK of the related table |

### Audit Columns (Every Table)

| Column | Type | Required | Description |
|--------|------|----------|-------------|
| `created_at` | `TIMESTAMPTZ` | Yes | Set on insert, never updated |
| `updated_at` | `TIMESTAMPTZ` | Yes | Updated on every change |
| `created_by` | `UUID` | Yes | User ID who created the record |
| `updated_by` | `UUID` | Yes | User ID who last updated the record |
| `deleted_at` | `TIMESTAMPTZ` | No | Set on soft delete, NULL = active |

### Boolean Columns

- Use `is_` or `has_` prefix: `is_active`, `is_primary`, `has_breakfast`
- Or use affirmative adjectives: `visible`, `enabled`, `verified`

### Temporal Columns

| Pattern | Example | Description |
|---------|---------|-------------|
| `{event}_at` | `paid_at`, `cancelled_at`, `completed_at` | Timestamp of an event |
| `{event}_date` | `check_in_date`, `scheduled_date` | Date-only (no time) |
| `{start/end}_{thing}` | `start_date`, `end_date` | Range boundaries |

### JSONB Columns

- Use descriptive names: `address`, `config`, `preferences`, `channel_data`
- Suffix with `_data` when ambiguous: `gateway_response_data`

### Numeric Columns

- `DECIMAL(10,2)` for prices/rates
- `DECIMAL(12,2)` for totals and aggregates
- `INTEGER` for counts, quantities, occupancy

### Text Columns

- `VARCHAR(50)` for short codes, phone numbers
- `VARCHAR(100)` for names
- `VARCHAR(255)` for email, URLs, short descriptions
- `VARCHAR(500)` for medium text
- `TEXT` for long/unlimited text, notes

## Indexes

| Pattern | Example | Description |
|---------|---------|-------------|
| `idx_{table}_{column}` | `idx_property_slug` | Single-column index |
| `idx_{table}_{col1}_{col2}` | `idx_reservation_property_status` | Composite index |
| `idx_{table}_{column}_unique` | `idx_user_email_unique` | Unique index |
| `idx_{table}_{column}_gin` | `idx_property_config_gin` | GIN index on JSONB |
| `idx_{table}_{column}_partial` | `idx_reservation_active` | Partial index (WHERE clause) |

## Constraints

| Pattern | Example | Description |
|---------|---------|-------------|
| `pk_{table}` | `pk_property` | Primary key |
| `fk_{table}_{column}` | `fk_reservation_property_id` | Foreign key |
| `uq_{table}_{column}` | `uq_user_email` | Unique constraint |
| `chk_{table}_{column}` | `chk_reservation_dates` | Check constraint |
| `ex_{table}_{column}` | `ex_reservation_dates_overlap` | Exclusion constraint |

## Enums

| Pattern | Example | Description |
|---------|---------|-------------|
| `{name}` | `booking_status`, `unit_type`, `payment_method` | PostgreSQL ENUM type, singular, snake_case |

Enum values use **UPPER_SNAKE_CASE**:

```sql
CREATE TYPE booking_status AS ENUM (
  'PENDING',
  'CONFIRMED',
  'CHECKED_IN',
  'CHECKED_OUT',
  'CANCELLED',
  'NO_SHOW'
);
```

## Sequences

| Pattern | Example |
|---------|---------|
| `{table}_id_seq` | `audit_log_id_seq` |

Only for `audit_log` (uses `BIGSERIAL`); all other tables use UUID.

## Views

| Pattern | Example | Description |
|---------|---------|-------------|
| `v_{description}` | `v_reservation_summary` | View, prefixed with `v_` |
| `mv_{description}` | `mv_daily_occupancy` | Materialized view, prefixed with `mv_` |

## Functions

| Pattern | Example |
|---------|---------|
| `fn_{action}_{entity}` | `fn_calculate_occupancy`, `fn_apply_cancellation_fee` |

## Triggers

| Pattern | Example |
|---------|---------|
| `trg_{table}_{event}` | `trg_reservation_updated_at`, `trg_guest_audit` |

## Schema Names

| Schema | Pattern | Example |
|--------|---------|---------|
| Platform | `public` | `public` |
| Tenant | `tenant_{hash}` | `tenant_550e8400` |

## Summary Cheat Sheet

```
Table:           reservation
Primary key:     id
Foreign key:     property_id, guest_id
Audit columns:   created_at, updated_at, created_by, updated_by
Soft delete:     deleted_at
Boolean:         is_active, is_primary
Timestamp:       paid_at, completed_at
Date:            check_in_date
JSONB:           config, preferences, address
Money:           total_amount (DECIMAL(12,2))
Index:           idx_reservation_property_status
Unique index:    idx_user_email_unique
FK constraint:   fk_reservation_property_id
Check:           chk_reservation_dates
Enum:            booking_status
View:            v_occupancy_summary
MView:           mv_daily_occupancy
Function:        fn_calculate_occupancy
Trigger:         trg_reservation_updated_at
