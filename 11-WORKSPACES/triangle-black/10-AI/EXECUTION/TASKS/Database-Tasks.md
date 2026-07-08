# Database Tasks

## Overview

Database tasks cover all data layer changes including schema migrations, query optimization, data seeding, and constraint management. These tasks require careful planning to ensure data integrity, backward compatibility, and zero-downtime deployment capability.

---

## 1. Create Migration

Author a new database migration script for schema changes.

| Attribute       | Description |
|-----------------|-------------|
| **Purpose**     | Version-controlled, reversible changes to the database schema. |
| **Inputs**      | Schema change specification, data model definitions, naming conventions, migration framework standards, rollback requirements. |
| **Outputs**     | Up migration script, down migration script, migration version registration, verification query for migration success. |
| **Quality Gates**| Migration runs successfully against development database, down migration fully reverses the change (verified by restore test), migration is idempotent when run against already-migrated schema, no data loss in down migration. |
| **Effort Range**| 1–3 hours per migration. |

---

## 2. Add Table

Create a new database table with columns, data types, constraints, and indexes.

| Attribute       | Description |
|-----------------|-------------|
| **Purpose**     | Establish a new data storage entity for a feature or domain. |
| **Inputs**      | Table schema definition, column specifications (name, type, nullability, defaults), primary key strategy, foreign key relationships, index requirements, storage and partitioning requirements. |
| **Outputs**     | CREATE TABLE migration, column definitions, constraints (PK, FK, UNIQUE, CHECK), default values, comments/descriptions, indexes. |
| **Quality Gates**| Table is created with correct columns and types, constraints enforce data integrity, foreign keys reference existing tables, indexes cover query patterns, table follows naming conventions. |
| **Effort Range**| 1–2 hours per table. |

---

## 3. Modify Schema

Alter an existing table or schema object (add/drop column, change type, rename).

| Attribute       | Description |
|-----------------|-------------|
| **Purpose**     | Evolve the database schema to accommodate new requirements while preserving existing data. |
| **Inputs**      | Current schema state, desired schema state, migration strategy (add nullable column with default, create new table and migrate data), backward compatibility requirements, rollback plan. |
| **Outputs**     | ALTER TABLE migration, data backfill scripts (if needed), down migration, migration verification queries. |
| **Quality Gates**| Existing data is preserved after migration, down migration restores original schema, no locking issues for production-scale tables (use safe ALTER strategies), application code is compatible with both old and new schema during deployment. |
| **Effort Range**| 1–4 hours depending on complexity. |

---

## 4. Add Index

Create new database indexes to improve query performance.

| Attribute       | Description |
|-----------------|-------------|
| **Purpose**     | Optimize query performance by adding appropriate database indexes based on access patterns. |
| **Inputs**      | Query performance analysis (slow query log, execution plans), column combinations used in WHERE/JOIN/ORDER BY clauses, index type requirements (B-tree, hash, GIN, GiST), concurrency considerations. |
| **Outputs**     | CREATE INDEX migration, index analysis (cardinality, selectivity), query performance before/after metrics. |
| **Quality Gates**| Index improves query performance (measured before/after), index does not introduce significant write overhead, index is used in query execution plans (verified via EXPLAIN), CONCURRENTLY option used for production tables to avoid locking. |
| **Effort Range**| 1–2 hours per index. |

---

## 5. Write Seed Data

Create seed data scripts for development, testing, and demo environments.

| Attribute       | Description |
|-----------------|-------------|
| **Purpose**     | Populate database with realistic reference data for development and testing. |
| **Inputs**      | Required reference data sets, data relationships, environment-specific requirements (dev, staging, demo), data size requirements. |
| **Outputs**     | Seed data scripts, data files (JSON, CSV, SQL), environment-specific seed configurations, seed data documentation. |
| **Quality Gates**| Seed data respects all constraints and foreign keys, data is realistic (not placeholder text), seed is idempotent (safe to run multiple times), seed data size is appropriate for the target environment. |
| **Effort Range**| 1–3 hours depending on data complexity. |

---

## 6. Optimize Query

Refactor or tune an existing query for better performance.

| Attribute       | Description |
|-----------------|-------------|
| **Purpose**     | Reduce query execution time, resource consumption, and database load. |
| **Inputs**      | Slow query (from logs or monitoring), query execution plan, table statistics and cardinality, expected data volume, performance targets (SLA in milliseconds). |
| **Outputs**     | Optimized query, execution plan comparison (before/after), query rewrite documentation, index recommendations (if applicable), performance test results. |
| **Quality Gates**| Query execution time meets SLA targets, result set is identical to original query, no regression in other queries, query plan shows efficient index usage, no full table scans on large tables. |
| **Effort Range**| 2–4 hours per query. |

---

## 7. Add Constraint

Add a new database constraint (CHECK, UNIQUE, NOT NULL, FOREIGN KEY, EXCLUSION).

| Attribute       | Description |
|-----------------|-------------|
| **Purpose**     | Enforce data integrity rules at the database level. |
| **Inputs**      | Constraint specification, validation of existing data against the constraint, error handling strategy for constraint violations. |
| **Outputs**     | ALTER TABLE with constraint addition, data cleanup migration (if existing data violates constraint), NOT VALID option for large tables, down migration. |
| **Quality Gates**| Constraint is correctly defined, existing data passes validation (or is cleaned up), constraint violation produces clear error messages, no performance impact on write operations. |
| **Effort Range**| 1–2 hours per constraint. |

---

## 8. Implement View

Create a database view for simplified querying, aggregation, or access control.

| Attribute       | Description |
|-----------------|-------------|
| **Purpose**     | Provide a virtual table that abstracts complex queries, enforces row-level security, or provides aggregated data. |
| **Inputs**      | View definition, underlying tables and relationships, access requirements (materialized vs regular), refresh strategy for materialized views, performance requirements. |
| **Outputs**     | CREATE VIEW (or MATERIALIZED VIEW) migration, view definition, refresh function (if materialized), access grant statements, query examples. |
| **Quality Gates**| View returns correct data matching specification, view performance is acceptable, materialized view refresh strategy is defined and tested, security is correctly applied (row-level security if needed). |
| **Effort Range**| 1–3 hours per view. |
