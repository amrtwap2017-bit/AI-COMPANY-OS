# Rollback

| Field | Value |
|---|---|
| Document ID | 18-Deployment-05 |
| Document Purpose | Define rollback procedures for database and application |
| Version | 1.0 |
| Status | Approved |

## Principles

- Rollback must be possible within 5 minutes of detecting a critical issue
- Database rollbacks are only possible within the same release cycle
- All database migrations must be backward-compatible for one release
- Immutable deployment artifacts (Docker images) enable instant rollback

## Database Rollback

Prisma migrations are reversible as long as the migration has a `down` path.

### Precondition

Migrations must be written with a `down` (rollback) step in the migration file. Prisma creates `migration.sql` (up) and developers must write `rollback.sql` in the same migration directory.

```
prisma/migrations/
  20260630000001_add_user_table/
    migration.sql       -- ALTER TABLE ... ADD COLUMN
    rollback.sql        -- ALTER TABLE ... DROP COLUMN
```

### Rollback Steps

```bash
# 1. Identify the migration to roll back
npx prisma migrate status

# 2. Apply rollback SQL directly
psql $DATABASE_URL -f prisma/migrations/20260630000001_add_user_table/rollback.sql

# 3. Mark migration as rolled back in _prisma_migrations table
DELETE FROM _prisma_migrations WHERE migration_name = '20260630000001_add_user_table';
```

### Alternative: Restore from Backup

If no backward-compatible rollback SQL exists:

```bash
# 1. Restore database from latest backup
pg_restore -d $DATABASE_URL latest_backup.dump

# 2. Reset Prisma migration state
npx prisma migrate resolve --rolled-back 20260630000001
```

### Rollback Window

| Migration Type | Rollback Available | Window |
|---|---|---|
| Add column (nullable) | Yes | Until next release |
| Add column (required) | Yes if default provided | Until next release |
| Remove column | No | Must restore from backup |
| Rename column | No | Must restore from backup |
| Create table | Yes | Until data populated |
| Drop table | No | Must restore from backup |

## Application Rollback

Application rollback is a container swap to the previous Docker image.

### Steps

```bash
# 1. Identify the previous stable image tag
docker images triangleblack/api
# or check GitHub releases

# 2. Pull the previous image
docker pull triangleblack/api:v1.2.2

# 3. Rollback containers (blue-green)
docker compose up -d --no-deps --scale api=2 api_previous
# Health check passes?
docker compose up -d --no-deps --scale api=1 api_current
docker rm -f api_current

# 4. Verify
curl -f https://triangleblack.com/health
```

### Blue-Green Rollback

```
Normal:  [api:v1.2.3] -> Load Balancer -> Users
Rollback: [api:v1.2.2] -> Load Balancer -> Users
```

The previous image is always tagged `previous` and retained:

```bash
docker tag triangleblack/api:v1.2.2 triangleblack/api:previous
```

## When to Rollback

| Signal | Action |
|---|---|
| Error rate >5% in 5 minutes | Immediate rollback |
| API p95 response time >2s | Evaluate, rollback if sustained |
| Database migration failure | Rollback migration immediately |
| Security vulnerability discovered | Rollback to last secure version |
| Data integrity issue | Rollback + restore from backup |

## Post-Rollback

1. Tag the rolled-back deployment as the current version in monitoring
2. Notify team via Slack/email
3. Open a bug ticket with rollback reason
4. Fix the issue in a new release, not by re-deploying the same broken version

## Cross-References

- [18-Deployment/Production.md](Production.md) — Production architecture
- [18-Deployment/Release.md](Release.md) — Release process
- [15-Security/](../15-Security/) — Security incident response
