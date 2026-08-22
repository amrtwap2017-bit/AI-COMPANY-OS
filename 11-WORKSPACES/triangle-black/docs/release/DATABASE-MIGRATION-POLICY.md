# Database Migration Policy
Safe schema modification rules to maintain multi-tenant transactional availability.

## 1. Zero-Downtime Structural Invariants
- **No Direct Column Drops:** Never drop a database column in an active migration. Mark it as deprecated and drop it only after two major releases.
- **Nullability Safeguards:** New columns must be created as `nullable=True` first, populated with default values, and then set to `NOT NULL` in a subsequent migration.
- **Default Constraints:** Avoid using expensive table-rewriting default constraints on high-volume tables.

## 2. Migration Execution
- All database schema modifications must be managed strictly through Alembic.
- Manual SQL schema modifications in production are strictly forbidden.
- Always run backup engine `backup_db.py` before executing any migration.
