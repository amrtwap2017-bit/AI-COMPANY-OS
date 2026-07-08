# 06 — Monitoring

> Monitoring and alerting configuration validation.

## Reference Documents

| Source | File | Relevance |
|--------|------|-----------|
| PHASE-04 | Observability.md | Logging, monitoring |
| PHASE-07 | Monitoring.md | Integration monitoring |

## Monitoring Coverage

| Component | Check | Interval | Alert | Status |
|-----------|-------|----------|-------|--------|
| VPS CPU | Usage % | 5 min | > 80% | ❌ |
| VPS RAM | Usage % | 5 min | > 80% | ❌ |
| VPS Disk | Usage % | 5 min | > 80% | ❌ |
| Docker services | Up/down | 1 min | Any down | ❌ |
| API health | HTTP 200 | 1 min | Not 200 | ❌ |
| Web health | HTTP 200 | 1 min | Not 200 | ❌ |
| Database | Connections | 5 min | > 15 | ❌ |
| SSL expiry | Days left | Daily | < 30 days | ❌ |
| Backup success | Status | Daily | Failure | ❌ |

## Logging

| Source | Destination | Retention | Status |
|--------|------------|-----------|--------|
| Docker logs | journald | 7 days | ❌ |
| API logs (structured JSON) | stdout | 7 days | ❌ |
| Nginx access logs | /var/log/nginx | 30 days | ❌ |
| Nginx error logs | /var/log/nginx | 30 days | ❌ |
| Audit log (database) | PostgreSQL | Permanent | ❌ |

## Alert Channels

| Severity | Channel | Response Time |
|----------|---------|--------------|
| Critical | Email + SMS + Slack | 15 min |
| Warning | Email + Slack | 1 hour |
| Info | Slack | 24 hours |

## Sign-Off

| Role | Name | Signature | Date |
|------|------|-----------|------|
| DevOps Lead | | | |

**Status:** ❌ NOT CONFIGURED
