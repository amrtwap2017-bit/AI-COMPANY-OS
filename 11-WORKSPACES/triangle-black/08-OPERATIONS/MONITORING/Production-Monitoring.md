# 06 — Production Monitoring

> Production monitoring setup and operations.

## Reference Chain

| Source | File | Input |
|--------|------|-------|
| Phase 4 | Observability.md | Observability strategy |
| Phase 4 | DevOps-Architecture.md | Infrastructure monitoring |
| Phase 8 | 06-INFRASTRUCTURE-READINESS/Monitoring.md | Monitoring readiness |

## Monitoring Stack (V1)

| Component | Tool | Purpose | Cost |
|-----------|------|---------|------|
| Uptime monitoring | Uptime Kuma | Service availability | Free |
| Container monitoring | Docker stats | Resource usage | Free |
| Log collection | Docker logs (journald) | Application logs | Free |
| Metrics | Prometheus (basic) | System metrics | Free |
| Visualization | Grafana | Dashboards | Free |
| Alerting | Uptime Kuma + custom | Notifications | Free |
| SSL monitoring | certbot + cron | Certificate expiry | Free |

## What to Monitor

### Infrastructure
- CPU usage (%)
- RAM usage (%)
- Disk usage (%)
- Network I/O
- Swap usage

### Docker
- Container status (up/down)
- Container restart count
- Service health check status
- Image pull frequency

### Application
- API response time (p50, p95, p99)
- API error rate (5xx)
- API request rate (req/s)
- Web page load time
- Active users
- Database connection count

### Business
- Reservations created/hour
- Revenue (EGP/day)
- Active hotels
- Active users

## Monitoring Setup

```bash
# Install Uptime Kuma (Docker)
docker run -d --name uptime-kuma \
  -p 3001:3001 \
  -v uptime-kuma-data:/app/data \
  louislam/uptime-kuma:latest

# Configure monitors for all services
# Monitor: https://app.triangleblack.com/api/v1/health (1 min)
# Monitor: https://app.triangleblack.com (1 min)
# Monitor: https://app.triangleblack.com/api/v1/health (1 min, DB check)

# Set up notifications
# Email: support@triangleblack.com
# (SMS: V2)
```

## Monitoring Schedule

| Activity | Frequency | Owner |
|----------|-----------|-------|
| Check dashboard | Daily (morning) | DevOps Lead |
| Review alerts | Continuous | On-call |
| Log review | Weekly | DevOps Lead |
| Dashboard update | Monthly | DevOps Lead |
| Alert threshold tuning | Monthly | DevOps Lead |

## Sign-Off

| Role | Name | Signature | Date |
|------|------|-----------|------|
| DevOps Lead | | | |

**Status:** ❌ NOT CONFIGURED
