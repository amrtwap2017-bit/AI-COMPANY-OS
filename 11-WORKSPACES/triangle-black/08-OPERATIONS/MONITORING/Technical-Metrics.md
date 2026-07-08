# 06 — Technical Metrics

> Technical metrics for monitoring platform performance.

## Reference Chain

| Source | File | Input |
|--------|------|-------|
| Phase 4 | Observability.md | Observability |
| Phase 4 | DevOps-Architecture.md | Infrastructure metrics |

## Technical Metrics Dashboard

| Metric | Definition | Target | Measurement | Current |
|--------|-----------|--------|-------------|---------|
| API Response Time (p50) | Median response time | < 200ms | CloudWatch / custom | — |
| API Response Time (p95) | 95th percentile | < 500ms | CloudWatch / custom | — |
| API Response Time (p99) | 99th percentile | < 2s | CloudWatch / custom | — |
| API Error Rate | 5xx / total requests | < 1% | Nginx logs | — |
| Request Rate | Requests per second | — | Nginx logs | — |
| Database Connections | Active connections | < 15 | pg_stat_activity | — |
| Database Query Time | Avg query execution | < 100ms | pg_stat_statements | — |
| CPU Usage % | VPS CPU utilization | < 70% | Docker stats | — |
| RAM Usage % | VPS memory utilization | < 75% | Docker stats | — |
| Disk Usage % | VPS disk utilization | < 80% | df -h | — |
| Uptime % | Platform availability | > 99.5% | Uptime Kuma | — |
| SSL Days Remaining | Days before cert expiry | > 30 | certbot | — |

## Performance Baselines

| Metric | V1 Baseline | V2 Target | Notes |
|--------|-------------|-----------|-------|
| API p50 | TBD | < 150ms | After optimization |
| API p95 | TBD | < 300ms | After optimization |
| Database connections | TBD | < 20 | With connection pooling |
| Page load time | TBD | < 3s | Lighthouse target |

## Monitoring Implementation

```sql
-- Database connection count
SELECT count(*) FROM pg_stat_activity;

-- Slow queries (over 1 second)
SELECT query, calls, total_time, mean_time
FROM pg_stat_statements
WHERE mean_time > 1000
ORDER BY mean_time DESC
LIMIT 10;

-- Active reservations today
SELECT count(*) FROM reservations
WHERE created_at >= CURRENT_DATE;
```

## Technical Health Check Script

```bash
#!/bin/bash
# Daily health check

echo "=== Triangle Black Health Check ==="
date

echo "--- Services ---"
docker compose ps

echo "--- Disk ---"
df -h /

echo "--- Memory ---"
free -h

echo "--- API Health ---"
curl -s -o /dev/null -w "%{http_code}" https://app.triangleblack.com/api/v1/health

echo "--- SSL Expiry ---"
openssl s_client -connect app.triangleblack.com:443 </dev/null 2>/dev/null \
  | openssl x509 -noout -enddate
```

## Sign-Off

| Role | Name | Signature | Date |
|------|------|-----------|------|
| DevOps Lead | | | |

**Status:** ❌ NOT CONFIGURED
