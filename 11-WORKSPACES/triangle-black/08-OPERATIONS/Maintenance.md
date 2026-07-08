# 07 — Maintenance

> Planned maintenance procedures for the production system.

## Reference Documents

| Source | File | Relevance |
|--------|------|-----------|
| PHASE-04 | DevOps-Architecture.md | Maintenance window |
| PHASE-06 | Maintenance-Domain.md | Business maintenance |

## Scheduled Maintenance Windows

| Type | Frequency | Duration | Window | Notice |
|------|-----------|----------|--------|--------|
| OS updates | Monthly | 30 min | Sun 02:00-03:00 CAT | 7 days |
| Database maintenance | Quarterly | 1 hour | Sun 02:00-04:00 CAT | 14 days |
| SSL renewal | Auto (certbot) | — | — | — |
| Backup test | Monthly | 1 hour | Sun 03:00-04:00 CAT | 7 days |
| Infrastructure upgrade | As needed | 2 hours | Planning notice | 30 days |

## Maintenance Process

1. Schedule maintenance in change calendar
2. Notify customers (email/in-app notice)
3. Create maintenance window banner in-app
4. Deploy maintenance changes
5. Verify system health post-maintenance
6. Remove maintenance banner
7. Send post-maintenance summary

## Communication Templates

### Pre-Maintenance Notice
```
Subject: Scheduled Maintenance - [DATE] [TIME]

Dear Customer,

Triangle Black will undergo scheduled maintenance on [DATE]
from [TIME] to [TIME]. During this period, the platform will
be unavailable. We recommend saving work before this window.

Thank you,
Triangle Black Operations
```

### Post-Maintenance Summary
```
Subject: Maintenance Complete - [DATE]

Dear Customer,

The scheduled maintenance is complete. All systems are
operational. No data loss occurred.

Summary of changes:
- [CHANGE 1]
- [CHANGE 2]

Thank you,
Triangle Black Operations
```

## Sign-Off

| Role | Name | Signature | Date |
|------|------|-----------|------|
| DevOps Lead | | | |

**Status:** ❌ NOT DOCUMENTED
