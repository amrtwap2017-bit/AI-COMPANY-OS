# Incident Response Playbook — Triangle Black

## Severity Classification

| Level | Definition | Response Time | Examples |
|---|---|---|---|
| SEV-1 | Platform down, data at risk | 15 minutes | Server crash, DB corruption, auth bypass |
| SEV-2 | Major feature broken | 1 hour | Work orders not creating, invoices failing |
| SEV-3 | Minor degradation | 4 hours | Slow dashboard, cosmetic UI issue |
| SEV-4 | Enhancement request | Next sprint | New filter, color change |

## SEV-1 Response Procedure

1. **Acknowledge** within 15 minutes
2. **Check health endpoints**: `curl http://localhost:8030/api/v1/health/ready`
3. **Check server logs**: `cat /tmp/tb_server.log | tail -50`
4. **Check database**: `psql -c "SELECT 1" triangle_black`
5. **Rollback if needed**: Follow docs/release/ROLLBACK.md
6. **Restore from backup**: `pg_restore -d triangle_black backups/db/latest.sql`
7. **Post-mortem** within 24 hours

## Communication

- Internal: Slack #tb-incidents
- Customer: Email within 1 hour for SEV-1/SEV-2
