# 05 — Disaster Recovery

> Disaster recovery plan for Triangle Black.

## Reference Documents

| Source | File | Relevance |
|--------|------|-----------|
| PHASE-04 | DevOps-Architecture.md | Infrastructure |
| PHASE-02 | Database-Architecture.md | Backup strategy |

## Recovery Scenarios

| Scenario | RTO | RPO | Plan | Status |
|----------|-----|-----|------|--------|
| Single container crash | 5 min | 0 | Docker auto-restart | ❌ |
| Full VPS failure | 4 hours | 24 hours | Restore from backup to new droplet | ❌ |
| Data corruption | 2 hours | 1 hour | PITR from WAL archive | ❌ |
| Security breach | 1 hour | 0 | Isolate + restore from clean backup | ❌ |
| Region outage (DO) | 24 hours | 24 hours | Deploy to alternate region | ❌ |

## Recovery Plan

### Scenario: Full VPS Failure

1. Provision new DigitalOcean droplet ($6-40/mo)
2. Install Docker Compose + Nginx
3. Restore latest full backup from DO Spaces
4. Restore WAL for point-in-time recovery
5. Update DNS to point to new droplet IP
6. Verify SSL certificates
7. Run smoke tests
8. Monitor for 1 hour

### Scenario: Data Corruption

1. Identify corruption scope and timestamp
2. Stop application to prevent further writes
3. Restore database to pre-corruption point-in-time
4. Verify data integrity
5. Restart application
6. Run reconciliation scripts if needed

## Validation

- [ ] DR plan documented and rehearsed
- [ ] All team members have access to DR runbook
- [ ] Backup accessible from alternate location
- [ ] DNS propagation understood (< 5 min with low TTL)

## Sign-Off

| Role | Name | Signature | Date |
|------|------|-----------|------|
| DevOps Lead | | | |

**Status:** ❌ NOT VERIFIED
