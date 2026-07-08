# 02 — Rollback Plan

> Rollback procedures for deployment and infrastructure failures.

## Reference Chain

| Source | File | Input |
|--------|------|-------|
| Phase 4 | CI-CD.md | Deployment pipeline |
| Phase 8 | 07-OPERATIONS/Release.md | Release management |

## Rollback Triggers

| Trigger | Severity | Action | Decision Time |
|---------|----------|--------|---------------|
| API returns 5xx after deploy | Critical | Rollback immediately | < 5 min |
| Database migration error | Critical | Restore from backup | < 15 min |
| UI broken / not loading | Critical | Rollback immediately | < 5 min |
| Performance degradation > 50% | High | Rollback or scale | < 15 min |
| Security breach detected | Critical | Take offline, rollback | < 5 min |
| Customer data corruption | Critical | Restore from backup | < 5 min |

## Rollback Procedures

### Application Rollback (Docker)
```bash
# Revert to previous Docker image tag
docker compose -f docker-compose.prod.yml down
docker compose -f docker-compose.prod.yml up -d --wait

# Verify health
curl -f https://app.triangleblack.com/api/v1/health

# If using tagged images:
docker pull ghcr.io/triangle-black/api:previous-tag
docker compose -f docker-compose.prod.yml up -d
```

### Database Rollback
```bash
# Restore from pre-migration backup
psql -h localhost -U triangle_black -d triangle_black_prod < pre_migration_backup.sql

# Verify data integrity
# Run data validation queries
```

### DNS Rollback
```bash
# Restore previous DNS A record
# Change app.triangleblack.com A record to previous IP
# Wait for TTL propagation (5 min)
# Verify old site loads
```

### Full System Rollback
```bash
# Restore entire Docker state from backup
# Re-run previous docker-compose version
# Restore database from pre-deployment backup
# Verify all services operational
```

## Pre-Rollback Checklist

- [ ] Rollback decision made and documented
- [ ] Customers notified (if applicable)
- [ ] Backup confirmed available
- [ ] Rollback command ready
- [ ] Post-rollback monitoring active
- [ ] Post-rollback verification planned

## Post-Rollback

1. Verify all services operational
2. Verify customer data intact
3. Notify team (Slack #incidents)
4. Schedule postmortem (within 24 hours)
5. Document root cause
6. Implement fix to prevent recurrence

## Rollback Success Criteria

- [ ] All services running on previous version
- [ ] Health checks passing
- [ ] Customer data intact
- [ ] Monitoring green
- [ ] Incident declared resolved

## Sign-Off

| Role | Name | Signature | Date |
|------|------|-----------|------|
| CTO | | | |

**Status:** ❌ NOT TESTED
