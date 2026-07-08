# 09 — Engineering Metrics

> Engineering metrics and performance measurement.

## Reference Chain

| Source | Input |
|--------|-------|
| Phase 10 — All 09-ENGINEERING-EVOLUTION files | Engineering components |

## DORA Metrics

| Metric | Definition | Current | H1 Target | H2 Target |
|--------|-----------|---------|-----------|-----------|
| Deployment frequency | How often code is deployed | — | Multiple/day | Multiple/day |
| Lead time for changes | Time from commit to production | — | < 1 hour | < 30 min |
| Change failure rate | % of deployments causing issues | — | < 10% | < 5% |
| Time to restore service | MTTR for incidents | — | < 2 hours | < 30 min |

## Engineering Productivity

| Metric | Description | Current | H1 Target |
|--------|-------------|---------|-----------|
| PR cycle time | Open to merge | — | < 4 hours |
| PR size | Lines per PR | — | < 400 |
| Code review depth | Comments per PR | — | > 3 |
| Bug fix time | Open to fix | — | < 48 hours |
| Sprint velocity | Story points/sprint | — | Consistent |

## Engineering Health

| Metric | Description | H1 Target | Monitoring |
|--------|-------------|-----------|------------|
| Tech debt ratio | Debt / total code | < 10% | Code analysis |
| Test flakiness | Flaky / total | < 1% | CI tracking |
| Build success rate | Successful builds | > 95% | CI dashboard |
| Dependency health | Up-to-date deps | > 80% | Dependency audit |
| Documentation coverage | Documented modules | > 80% | Doc audit |

## Team Health

| Metric | Measurement | Target | Cadence |
|--------|-------------|--------|---------|
| Engineer satisfaction | Survey | > 4/5 | Quarterly |
| On-call burnout | Weekly hours | < 40 hours/week | Monthly |
| Knowledge sharing | Internal talks/month | > 2 | Monthly |
| Innovation time | % time for exploration | > 10% | Monthly |
| Retention rate | Voluntary departures | > 90% | Quarterly |
