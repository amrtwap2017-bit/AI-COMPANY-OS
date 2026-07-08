# 06 — Alerting

> Alerting rules and notification channels for production.

## Reference Chain

| Source | File | Input |
|--------|------|-------|
| Phase 4 | Observability.md | Observability |
| Phase 8 | 06-INFRASTRUCTURE-READINESS/Monitoring.md | Monitoring readiness |

## Alert Severity Levels

| Level | Definition | Notification | Response | Examples |
|-------|-----------|-------------|----------|----------|
| CRITICAL | Service down, data at risk | Email + Phone | 15 min | API down, DB crash |
| WARNING | Degraded, needs attention | Email | 1 hour | CPU > 80%, Disk > 80% |
| INFO | Informational, no action needed | Slack | 24 hours | Backup complete, SSL < 30 days |

## Alert Rules

### Critical Alerts
| Rule | Check | Threshold | Escalation |
|------|-------|-----------|------------|
| API health check | HTTP 200 | Failure × 3 | Email + Phone → CTO |
| Web health check | HTTP 200 | Failure × 3 | Email + Phone → CTO |
| PostgreSQL health | Connection test | Failure × 3 | Email + Phone → CTO |
| Nginx health | HTTP 200 | Failure × 3 | Email + Phone → DevOps |

### Warning Alerts
| Rule | Check | Threshold | Escalation |
|------|-------|-----------|------------|
| CPU usage | % utilization | > 80% for 5 min | Email → DevOps |
| RAM usage | % utilization | > 80% for 5 min | Email → DevOps |
| Disk usage | % utilization | > 80% | Email → DevOps |
| API response time (p95) | Response time | > 500ms for 5 min | Email → DevOps |
| Error rate (5xx) | % of requests | > 1% for 5 min | Email → DevOps |
| SSL expiry | Days remaining | < 30 days | Email → DevOps |

### Info Alerts
| Rule | Check | Threshold | Escalation |
|------|-------|-----------|------------|
| Backup complete | Script result | Success/failure | Slack → DevOps |
| Container restart | Docker event | Any restart | Slack → DevOps |
| New user signup | Auth event | Any signup | Slack → COO |
| Deployment complete | CI/CD event | Success/failure | Slack → Team |

## Alert Routing

| Alert | Channel 1 | Channel 2 | Channel 3 |
|-------|-----------|-----------|-----------|
| CRITICAL | Email + SMS | Slack (#alerts) | Phone |
| WARNING | Email | Slack (#alerts) | — |
| INFO | Slack (#general) | — | — |

## Alert Response Flow

```
Alert received
    │
    ▼
Acknowledge (Slack #alerts)
    │
    ▼
Assess severity
    │
    ├── False alarm → Dismiss + document
    │
    └── Real issue → Follow incident response
                       │
                       ▼
                      Resolve
                       │
                       ▼
                      Close alert
```

## Alert Maintenance

- Alert thresholds reviewed monthly
- False positive rate tracked
- New alerts added when new services onboarded
- Alert routing updated as team grows

## Sign-Off

| Role | Name | Signature | Date |
|------|------|-----------|------|
| DevOps Lead | | | |

**Status:** ❌ NOT CONFIGURED
