# 07 — Recovery Testing

> Recovery testing to validate backup and restore procedures.

## Reference Chain

| Source | File | Input |
|--------|------|-------|
| Phase 8 | 05-SECURITY-READINESS/Disaster-Recovery.md | DR plan |
| Phase 8 | 05-SECURITY-READINESS/Backup.md | Backup plan |

## Recovery Test Types

| Test Type | Frequency | Scope | Duration | Status |
|-----------|-----------|-------|----------|--------|
| Database restore | Monthly | Single tenant schema | 1 hour | ❌ |
| Full system restore | Quarterly | Entire platform | 4 hours | ❌ |
| Failover test | Quarterly | DNS + services | 2 hours | ❌ |
| Data integrity check | Monthly | Record counts + sample data | 30 min | ❌ |

## Database Restore Test

```bash
# 1. Restore backup to staging environment
pg_restore -h staging-host -U triangle_black \
  -d triangle_black_staging \
  --clean \
  /backups/postgresql/triangle_black_prod_20260101.dump

# 2. Verify data integrity
# - Check record counts match production
# - Spot-check recent reservations
# - Verify user accounts exist

# 3. Run application tests
# - API health check passes
# - Login works with test credentials
# - Reservation CRUD operations work

# 4. Document results
```

## Full System Restore Test

```
Scenario: Complete platform failure
- VPS destroyed / corrupted
- No access to current instance

Recovery Steps:
1. Provision new VPS (same specs)
2. Install Docker + Docker Compose
3. Restore docker-compose.yml from Git
4. Restore .env from encrypted backup
5. Restore PostgreSQL from latest backup
6. Restore file uploads from DO Spaces
7. Start services
8. Update DNS to new VPS IP
9. Verify all services operational
10. Run smoke tests

Target RTO: 4 hours
Target RPO: 24 hours (daily backup)
```

## Recovery Test Log

```
─────────────────────────────────────────────
RECOVERY TEST LOG
─────────────────────────────────────────────

Test Date: _____________
Test Type: [Database / Full System / Failover / Data Integrity]
Tester: _____________

Test Steps:
1. [Step 1] — [PASS / FAIL]
2. [Step 2] — [PASS / FAIL]
3. [Step 3] — [PASS / FAIL]

Total Time: ___ minutes
Target RTO: ___ minutes

Data Loss: [None / ___ records]
RPO Achieved: ___ hours

Issues Found:
- [Issue 1]
- [Issue 2]

Improvements Needed:
- [Improvement 1]

Status: [PASS / FAIL]
Signed Off: _____________ Date: _____________
```

## Sign-Off

| Role | Name | Signature | Date |
|------|------|-----------|------|
| CTO | | | |

**Status:** ❌ NOT TESTED
