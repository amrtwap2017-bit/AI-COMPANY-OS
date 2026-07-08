# Database Migrations Deliverable Contract

## Purpose

Ensure that database schema changes are safe, reversible, and verified before reaching production.

## Requirements

### 1. Migration Is Reversible

- Every forward migration must have a corresponding down migration.
- The down migration must restore the database to the exact pre-migration state.
- Irreversible migrations (e.g., destructive data loss) require special approval and a data backup strategy.
- Down migrations must be tested to confirm they succeed without errors.

### 2. No Data Loss in Forward Migration

- Forward migrations must not destroy existing data.
- Column removals must be preceded by a migration that moves or archives the data.
- Table drops must be preceded by a migration that backups the table contents.
- Data transformations must be tested against production-sized data volumes.
- NULL-safe defaults must be provided when adding NOT NULL columns to existing tables.

### 3. Seed Data Updated If Needed

- If the migration changes reference data, seed data scripts must be updated.
- Seed data must be idempotent (can be run multiple times without error or duplication).
- Seed data must be versioned alongside the migration.
- Test environments must be refreshable to a known state using seed data.

### 4. Migration Tested Against Dev Database

- Every migration must be run against a development database before code review.
- The migration must be tested in both directions (up and down).
- Migration execution time must be measured; long-running migrations (>5 minutes) require optimization or chunking.
- Migration tests must be automated in the CI pipeline using a disposable database instance.

### 5. Indexes Created for New Queries

- New queries introduced by the change must have corresponding database indexes.
- Index creation must be part of the migration, not a separate manual step.
- Composite indexes must have the correct column order (high selectivity first).
- Existing query plans must be reviewed to ensure no regressions from new indexes.

### 6. Foreign Key Constraints Defined

- All cross-table references must have explicit foreign key constraints.
- Foreign key constraint names must follow the project naming convention.
- ON DELETE and ON UPDATE behavior must be explicitly defined (CASCADE, SET NULL, RESTRICT, etc.).
- Circular dependencies must be avoided.

### 7. Migration Naming and Organization

- Migration files must follow the project convention (e.g., `YYYYMMDDHHMMSS_description.sql` or sequential numbering).
- Migration file names must be unique and ordered.
- Each migration should represent a single logical change.
- Multiple related schema changes should be grouped into a single migration.

### 8. Transaction Safety

- Migrations should be wrapped in transactions where the database supports it.
- All-or-nothing execution: if any part of the migration fails, the entire migration rolls back.
- Long-running migrations that cannot be transactional must have manual rollback procedures documented.

## Verification

| Check | Tool/Method | Pass/Fail |
|---|---|---|
| Reversibility | Down migration test | Pass |
| Data preservation | Dev DB test | Pass |
| Seed data | Seed run test | Pass |
| Dev DB execution | CI pipeline | Pass |
| Index review | Query plan review | Pass |
| Constraints | Schema review | Pass |
| Transaction safety | Migration review | Pass |

## Non-Compliance

Migrations without reversible down scripts are blocked. Migrations that cause data loss require executive approval and a documented data recovery plan.
