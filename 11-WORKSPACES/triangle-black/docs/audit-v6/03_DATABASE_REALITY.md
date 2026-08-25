# Database Reality — A-001 Audit August 2026

## Verified State
- Tables: 169 (all in public schema)
- Indexes: 433
- Alembic head: g2h3i4j5k6l7
- Migrations: 16 files
- All tables: Alembic-managed ✅

## Critical Schema Facts
| Table | Key Constraint |
|-------|----------------|
| hotels | settings JSON NOT NULL, must pass json.dumps({}) |
| users | name NOT full_name, updated_at NOT NULL |
| workflow_definitions | is_active VARCHAR(5) use 'true' NOT 'active' |
| platform_audit_log | use actor_name + new_value (no actor/details) |
| leads | score INTEGER NOT NULL, always pass 0 |
| assets | site_id NOT NULL, no score column |
| sites | NO location column |

## Multi-Tenancy Model
- Pattern: Shared schema + hotel_id row-level isolation
- hotel_id: NOT NULL on all business tables
- JWT: now contains hotel_id (fixed this session)

## Risks
1. 152 inline create_engine() — potential pool exhaustion
2. No PITR configured
3. Backup restore never verified
