# 06 — Operational Reports

> Operational reporting schedule and templates.

## Reference Chain

| Source | File | Input |
|--------|------|-------|
| Phase 9 | Business-Metrics.md | Business reporting |
| Phase 9 | Technical-Metrics.md | Technical reporting |

## Report Schedule

| Report | Frequency | Audience | Content | Format |
|--------|-----------|----------|---------|--------|
| Daily Health Check | Daily | DevOps + CTO | Service status, resource usage | Slack / Email |
| Incident Report | Per incident | Team | Timeline, RCA, actions | Document |
| Weekly Ops Review | Weekly | CTO + COO | Metrics, incidents, capacity | Email / Meeting |
| Monthly KPI Report | Monthly | Executive Committee | Business + technical KPIs | Document |
| Monthly Customer Report | Monthly | Customers | Uptime, SLA, support stats | Email |
| Monthly Business Report | Monthly | COO + Finance | Revenue, churn, growth | Document |
| Quarterly Review | Quarterly | Executive Committee | Strategic, financial, roadmap | Presentation |

## Daily Health Check Template

```
─────────────────────────────────────────────
DAILY HEALTH CHECK
─────────────────────────────────────────────

Date: _____________
Checked by: _____________

INFRASTRUCTURE
CPU: [OK / WARN]  ____%
RAM: [OK / WARN]  ____%
Disk: [OK / WARN] ____%

SERVICES
Nginx: [UP / DOWN]
API: [UP / DOWN]
Web: [UP / DOWN]
PostgreSQL: [UP / DOWN]

SSL: [OK / EXPIRING: ___ days]

INCIDENTS SINCE LAST CHECK:
- None / [list]

TICKETS OPEN: ___

NOTES:
_______________________________________________
```

## Weekly Ops Review Template

```
─────────────────────────────────────────────
WEEKLY OPS REVIEW
─────────────────────────────────────────────

Week: _____________
Prepared by: _____________

INCIDENTS
- SEV-1: 0
- SEV-2: 0
- SEV-3: ___
- SEV-4: ___

UPTIME: ____% (Target: > 99.5%)

PERFORMANCE
- API p50: ___ms (Target: < 200ms)
- API p95: ___ms (Target: < 500ms)
- API Error Rate: ___% (Target: < 1%)

CAPACITY
- CPU peak: ___%
- RAM peak: ___%
- Disk: ___% used

KEY EVENTS:
_______________________________________________

ACTION ITEMS:
_______________________________________________
```

## Sign-Off

| Role | Name | Signature | Date |
|------|------|-----------|------|
| CTO | | | |

**Status:** ❌ NOT CONFIGURED
