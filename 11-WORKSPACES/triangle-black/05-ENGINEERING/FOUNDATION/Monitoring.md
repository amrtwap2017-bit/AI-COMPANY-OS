# Basic Monitoring (V1)

## Overview

V1 monitoring is deliberately minimal: health check endpoints, free external uptime monitoring, manual log review, and email alerts. No Prometheus, no Grafana, no centralized logging — these are added in V2+ when the complexity is justified.

## 1. Health Check Endpoints

### Backend Health

The NestJS backend exposes a `/health` endpoint:

```
GET /health
Response: 200 OK
{
  "status": "ok",
  "timestamp": "2026-06-30T12:00:00Z",
  "version": "1.0.0",
  "uptime": 3600,
  "checks": {
    "database": { "status": "ok", "latency_ms": 3 },
    "redis": { "status": "ok", "latency_ms": 1 }
  }
}
```

Implementation in NestJS:

```typescript
// health.controller.ts
@Controller('health')
export class HealthController {
  constructor(
    private prisma: PrismaService,
    private redis: RedisService,
  ) {}

  @Get()
  async check() {
    const dbStart = Date.now();
    await this.prisma.$queryRaw`SELECT 1`;
    const dbLatency = Date.now() - dbStart;

    const redisStart = Date.now();
    await this.redis.ping();
    const redisLatency = Date.now() - redisStart;

    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      version: process.env.APP_VERSION || '1.0.0',
      uptime: process.uptime(),
      checks: {
        database: { status: 'ok', latency_ms: dbLatency },
        redis: { status: 'ok', latency_ms: redisLatency },
      },
    };
  }
}
```

### Frontend Health

Next.js health route:

```typescript
// app/api/health/route.ts
export async function GET() {
  return Response.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
  });
}
```

### Docker Health Checks

Each service in `docker-compose.yml` includes a `healthcheck`:

```yaml
healthcheck:
  test: ["CMD", "wget", "--spider", "http://localhost:4000/health"]
  interval: 30s
  timeout: 10s
  retries: 3
  start_period: 40s
```

Check service health:

```bash
docker compose ps
# Healthy services show "(healthy)"
```

## 2. Uptime Monitoring (Free)

### Uptime Robot (or similar)

| Setting | Value |
|---------|-------|
| Service | Uptime Robot (Free tier) |
| Monitors | 5 free monitors |
| Check interval | 5 minutes |
| Alert method | Email |

### Monitors to Create

| Monitor | URL | Type |
|---------|-----|------|
| Main website | `https://triangleblack.com` | HTTPS |
| Application | `https://app.triangleblack.com` | HTTPS |
| API | `https://api.triangleblack.com/health` | HTTPS |
| SSL expiry | `https://triangleblack.com:443` | Port |

### Alternative: Cloudflare Notifications

Cloudflare Free includes basic notifications:

1. Dashboard → Notifications → Add
2. Types:
   - **Origin Error Rate Alert** — Notify if 5xx > 1% in 10 minutes
   - **Security Events Alert** — Notify if WAF blocks > 100 events in 24h
   - **SSL Event Alert** — Notify on certificate issues

## 3. Log Monitoring

### Docker Logs

```bash
# Check recent errors
docker compose logs --tail=200 | grep -i "error\|exception\|fatal"

# Watch logs in real-time (incident investigation)
docker compose logs -f

# Specific service
docker compose logs -f --tail=100 backend

# JSON output for parsing
docker compose logs --tail=1000 backend --no-color > logs.json
```

### Log Review Schedule

| Log Source | Frequency | What to Look For |
|------------|-----------|------------------|
| Nginx access log | Weekly | 4xx/5xx spikes, unusual patterns |
| Nginx error log | Weekly | Upstream failures, SSL errors |
| Backend logs | Weekly | Unhandled exceptions, DB errors |
| PostgreSQL logs | Monthly | Slow queries, connection errors |
| Auth logs (host) | Weekly | Failed SSH attempts, unusual logins |

### Manual Review Checklist

```bash
# Nginx: count HTTP status codes
docker exec tb-nginx awk '{print $9}' /var/log/nginx/access.log | sort | uniq -c | sort -rn

# Nginx: top 10 IPs
docker exec tb-nginx awk '{print $1}' /var/log/nginx/access.log | sort | uniq -c | sort -rn | head -10

# Backend: recent errors
docker compose logs --since=24h backend | grep -c "ERROR"

# Backend: slow requests (>5s)
docker compose logs --since=24h backend | grep -i "request completed" | awk -F'ms' '{if ($1+0 > 5000) print}'
```

## 4. Server Monitoring

### Basic System Checks

```bash
# Disk usage
df -h

# Memory
free -h

# CPU
top -bn1 | head -5

# Docker disk usage
docker system df

# Container resource usage
docker stats --no-stream
```

### Cron-Based Resource Check

```bash
#!/bin/bash
# /home/deploy/triangleblack/scripts/check-resources.sh

THRESHOLD_DISK=80  # percent
THRESHOLD_MEM=90   # percent
ALERT_EMAIL="admin@triangleblack.com"

# Check disk
DISK_USE=$(df / | awk 'NR==2 {print $5}' | sed 's/%//')
if [ "$DISK_USE" -gt "$THRESHOLD_DISK" ]; then
    echo "Disk usage critical: ${DISK_USE}%" | mail -s "TB Server Alert: Disk" ${ALERT_EMAIL}
fi

# Check memory
MEM_USE=$(free | awk '/Mem/ {printf "%.0f", $3/$2 * 100}')
if [ "$MEM_USE" -gt "$THRESHOLD_MEM" ]; then
    echo "Memory usage critical: ${MEM_USE}%" | mail -s "TB Server Alert: Memory" ${ALERT_EMAIL}
fi

# Check Docker daemon
if ! docker info > /dev/null 2>&1; then
    echo "Docker daemon not responding" | mail -s "TB Server Alert: Docker" ${ALERT_EMAIL}
fi
```

Add to crontab:

```cron
*/15 * * * * /home/deploy/triangleblack/scripts/check-resources.sh
```

## 5. Email Alerts

### Configure Server Email (msmtp)

```bash
sudo apt install msmtp msmtp-mta mailutils -y
```

Edit `/etc/msmtprc`:

```
defaults
auth           on
tls            on
tls_trust_file /etc/ssl/certs/ca-certificates.crt
logfile        /var/log/msmtp.log

account        default
host           smtp.sendgrid.net
port           587
user           apikey
password       YOUR_SENDGRID_API_KEY
from           alerts@triangleblack.com
```

### Alert Types

| Alert | Trigger | Method |
|-------|---------|--------|
| Server down | Uptime Robot detects downtime | Email |
| High disk usage | > 80% disk | Email (cron) |
| High memory | > 90% RAM | Email (cron) |
| Docker down | Daemon unresponsive | Email (cron) |
| Backup failure | Backup script detects error | Email (cron) |
| SSL expiry | < 30 days to expiry | Email (cron) |
| WAF alerts | Cloudflare notification | Email |

## 6. Incident Response from Monitoring

| Alert | Immediate Action | Follow-up |
|-------|-----------------|-----------|
| Server unreachable | Check VPS provider dashboard | Review Cloudflare logs |
| High 5xx rate | `docker compose logs --tail=50 backend` | Check DB connections, recent deploys |
| Disk > 80% | `docker system prune -af` | Review backup retention, rotate logs |
| Backup failed | `docker compose logs --tail=30 tb-postgres` | Check disk space, DB health |
| Certificate expired | `docker compose run --rm certbot certonly` | Renew manually, check certbot logs |

## 7. Dashboard (Minimal)

When SSH'd in:

```bash
# Quick health overview
alias tbstatus='echo "=== Triangle Black Status ===" && \
  echo "Containers:" && docker compose ps --format "table {{.Name}}\t{{.Status}}\t{{.Ports}}" && \
  echo "" && echo "Disk:" && df -h / | tail -1 && \
  echo "Memory:" && free -h | grep Mem | awk "{print \$3 \"/\" \$2}" && \
  echo "" && echo "Recent Errors:" && docker compose logs --since=1h --tail=20 backend | grep -i error | tail -5'
```

## 8. Future: V2+ Monitoring

| Tool | Purpose | When |
|------|---------|------|
| Prometheus + Grafana | Metrics dashboard, alerting | V2 (separate DB, > 50 tenants) |
| Loki or Grafana Cloud | Centralized log aggregation | V2 |
| Sentry | Error tracking, performance | V2 |
| PagerDuty / Opsgenie | On-call alerting | V3 |
| Custom dashboards | Business metrics + system health | V2 |
