# Deployment Rollback Playbook
Emergency procedures to restore platform availability in the event of an unstable production release.

## Stage 1: Route Redirection (Sub-Second Mitigation)
- If the frontend fails, redirect ingress traffic immediately to the fallback maintenance page.

## Stage 2: Code Version Rollback
- Revert the current production build to the previous stable Git commit hash.
- Redeploy the Docker containers using the cached image of the previous stable version.

## Stage 3: Database Migration Rollback (If Destructive)
- Check Alembic history: Identify the previous safe migration ID.
- Run downgrade: `alembic downgrade <previous_revision>`.
- If migrations modified schemas destructively, restore the database backup:
  `pg_restore -h localhost -d triangle_black backups/db/tb_backup_<timestamp>.sql`
