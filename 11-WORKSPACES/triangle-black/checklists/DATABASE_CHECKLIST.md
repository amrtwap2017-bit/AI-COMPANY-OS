# Database Checklist

## New Table Required Columns
- [ ] id (primary key)
- [ ] tenant_id (NOT NULL, indexed)
- [ ] created_at
- [ ] updated_at
- [ ] is_deleted (if soft delete needed)

## Migration
- [ ] upgrade() complete
- [ ] downgrade() complete
- [ ] Zero-downtime approach
- [ ] Tested: upgrade, downgrade, upgrade again

## Indexes
- [ ] ix_{table}_tenant_id created
- [ ] ix_{table}_created_at created

## Safety
- [ ] Tested on staging
- [ ] Rollback verified
- [ ] AI_MEMORY/MIGRATION_HISTORY.md updated

Reviewer: Database Agent
