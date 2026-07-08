# 04 — Adoption Metrics

> Metrics for measuring customer adoption of Triangle Black.

## Reference Chain

| Source | File | Input |
|--------|------|-------|
| Phase 3 | Event-Architecture.md | Domain events |
| Phase 6 | Executive-Intelligence.md | Business metrics |

## Adoption Metrics Dashboard

| Metric | Definition | Target | Measurement | Current |
|--------|-----------|--------|-------------|---------|
| DAU (Daily Active Users) | Unique users logged in per day | > 80% of licenses | Auth logs | — |
| WAU (Weekly Active Users) | Unique users per week | > 90% of licenses | Auth logs | — |
| Reservations created/day | New reservations per day | > 5 (small hotel) | DB query | — |
| Check-ins completed/day | Check-ins per day | > 80% of reservations | DB query | — |
| Feature adoption rate | % of features used | > 70% | Event tracking | — |
| Time to first reservation | Time from activation to 1st reservation | < 1 hour | Event tracking | — |
| Session duration | Avg time per session | > 15 min | Session tracking | — |
| Daily active time | Total time spent per day | > 2 hours | Session tracking | — |

## Adoption Measurement

```
User logs in ──► Event tracked ──► Stored in DB ──► Daily aggregation ──► Dashboard
    │               │                  │                  │                  │
  Auth0/         App events         analytics        Cron job            Grafana/
  JWT                              table             (daily)             Metabase
```

## Adoption Indicators

### Green (Healthy)
- DAU > 80%
- Reservations being created daily
- Multiple staff logging in
- Session duration > 15 min

### Yellow (Warning)
- DAU 50-80%
- Reservations created but not consistent
- Some staff not logging in
- Session duration < 10 min

### Red (At Risk)
- DAU < 50%
- No reservations in 3+ days
- Only 1 user active
- Session duration < 5 min

## Intervention Triggers

| Trigger | Action | Owner | Timeline |
|---------|--------|-------|----------|
| DAU < 50% for 3 days | Check-in call with hotel admin | COO | Same day |
| No reservations for 5 days | Training refresher | Support | Next day |
| Feature adoption < 40% | Feature-specific training | Support | Within week |
| Single user active | Encourage multi-user adoption | COO | Within week |

## Sign-Off

| Role | Name | Signature | Date |
|------|------|-----------|------|
| COO | | | |

**Status:** ❌ NOT DOCUMENTED
