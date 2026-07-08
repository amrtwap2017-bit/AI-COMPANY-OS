# 02 — Database Migration

> Database migration procedure for production deployment.

## Reference Chain

| Source | File | Input |
|--------|------|-------|
| Phase 2 | Database-Architecture.md | Database design |
| Phase 5 | Data-Foundation.md | Prisma schema |
| Phase 8 | 06-INFRASTRUCTURE-READINESS/PostgreSQL.md | DB readiness |

## Migration Principles

1. **Migrations are irreversible** — Test on staging first
2. **Always backup before migration** — `pg_dump` before any schema change
3. **Run migrations separately** — Not as part of application startup
4. **Monitor during migration** — Watch connection count and query time
5. **Schema-per-tenant** — Migration runs against each tenant schema

## Migration Process

```
1. BACKUP
   pg_dump -h localhost -U triangle_black -d triangle_black_prod \
     --schema=public > pre_migration_$(date +%Y%m%d_%H%M%S).sql

2. REVIEW
   Review SQL that Prisma will generate:
   npx prisma migrate diff --from-empty --to-schema-datamodel schema.prisma

3. TEST ON STAGING
   Run migration against staging database first:
   npx prisma migrate deploy

4. APPLY TO PRODUCTION
   npx prisma migrate deploy

5. VERIFY
   - Check migration history: npx prisma migrate status
   - Verify data integrity: record counts match expected
   - Test critical queries
```

## Prisma Migration Commands

```bash
# Generate migration (development)
npx prisma migrate dev --name describe_change

# Apply to staging
npx prisma migrate deploy

# Apply to production
DATABASE_URL="postgresql://..." npx prisma migrate deploy

# Check status
npx prisma migrate status
```

## Rollback (if migration fails)

```bash
# Option 1: Restore from backup
psql -h localhost -U triangle_black -d triangle_black_prod < backup.sql

# Option 2: Revert specific migration (Prisma)
# Prisma does not support automatic rollback
# Manual SQL revert required
```

## Migration Checklist

- [ ] Backup created
- [ ] Migration tested on staging
- [ ] Production backup created
- [ ] Maintenance window communicated
- [ ] Migration applied
- [ ] Data integrity verified
- [ ] Application works with new schema
- [ ] Backup retained for 7 days

## Sign-Off

| Role | Name | Signature | Date |
|------|------|-----------|------|
| DevOps Lead | | | |

**Status:** ❌ NOT MIGRATED
