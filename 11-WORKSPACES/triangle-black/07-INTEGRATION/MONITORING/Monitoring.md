# 13 — Integration Monitoring

> Observability across all integration boundaries.

## Monitoring Architecture

```
┌─────────────────────┐    ┌──────────────────────┐    ┌─────────────────────┐
│ Integration Events  │    │    Metrics Pipeline   │    │    Alerting         │
│                     │    │                       │    │                     │
│ Request/Response ──►│───►│ Integration Log → DB  │───►│ Threshold → Alert   │
│ Errors ────────────►│    │ Metrics → Prometheus  │    │ DLQ count → Alert   │
│ Latency ───────────►│    │ (V2)                  │    │ Error rate → Alert  │
│ DLQ Events ────────►│    │                       │    │                     │
└─────────────────────┘    └──────────────────────┘    └─────────────────────┘
```

## Integration Logging

Every integration interaction produces a structured log entry.

### Log Schema

```prisma
model IntegrationLog {
  id             String   @id @default(uuid())
  system         String   // eta, whatsapp, email, bank, etc.
  direction      String   // inbound, outbound
  operation      String   // submit_invoice, send_message, import_statement
  status         String   // success, failed, pending
  requestUrl     String?
  requestMethod  String?
  requestHeaders Json?
  requestBody    Json?
  responseStatus Int?
  responseBody   Json?
  error          String?
  durationMs     Int
  idempotencyKey String?
  createdAt      DateTime @default(now())
  tenantId       String?
  userId         String?
}
```

### Logging Rules

| Rule | Implementation |
|------|---------------|
| Every external call logs request and response | Integration middleware |
| Sensitive data redacted (passwords, tokens, secrets) | Log filter middleware |
| Request body truncated at 10KB | Log size limit |
| Logs retained 90 days | TTL policy |
| Integration errors always log full context | Error handler |
| Logs searchable by system, status, date range | Integration log UI |

## Key Metrics

| Metric | Type | Unit | Source |
|--------|------|------|--------|
| `integration.requests.total` | Counter | Count | All integrations |
| `integration.requests.success` | Counter | Count | Successful calls |
| `integration.requests.failed` | Counter | Count | Failed calls |
| `integration.latency.p50` | Histogram | ms | Request duration |
| `integration.latency.p95` | Histogram | ms | Request duration |
| `integration.latency.p99` | Histogram | ms | Request duration |
| `integration.dlq.count` | Gauge | Count | DLQ entries |
| `integration.retry.attempts` | Counter | Count | Total retries |
| `integration.rate_limit.hits` | Counter | Count | Rate limit exceeded |
| `integration.webhook.delivered` | Counter | Count | Webhook deliveries |
| `integration.webhook.failed` | Counter | Count | Webhook failures |

## Alert Thresholds

| Alert | Condition | Severity | Response |
|-------|-----------|----------|----------|
| ETA submission failure | > 5% failure in 1 hour | Critical | On-call finance + dev |
| ETA unavailable | Any 5xx in 5 min window | Critical | On-call dev |
| Email delivery failure | > 10% failure in 1 hour | High | Check SMTP server |
| WhatsApp failure | > 10% failure in 1 hour | High | Check Meta API |
| DLQ count > 10 | DLQ entries > 10 | Warning | Review DLQ |
| DLQ count > 50 | DLQ entries > 50 | Critical | Immediate review |
| Integration latency p95 > 10s | Slow responses | Warning | Investigate bottleneck |
| Any integration 4xx spike | > 20% in 30 min | Warning | Check external system |
| API key expires in 7 days | Key expiry | Warning | Rotate key |
| Certificate expires in 30 days | Cert expiry | Warning | Renew certificate |

## Health Checks

### Integration Health Endpoint

```
GET /api/v1/integrations/health
```

Response:
```json
{
  "status": "healthy",  // healthy | degraded | down
  "timestamp": "2026-07-15T14:30:00Z",
  "systems": {
    "eta-einvoice": {
      "status": "healthy",
      "lastSuccess": "2026-07-15T14:28:00Z",
      "lastFailure": null,
      "successRate": 0.98,
      "avgLatency": 2340
    },
    "smtp-email": {
      "status": "degraded",
      "lastSuccess": "2026-07-15T14:29:00Z",
      "lastFailure": "2026-07-15T14:25:00Z",
      "successRate": 0.92,
      "avgLatency": 1500
    },
    "whatsapp": {
      "status": "healthy",
      "lastSuccess": "2026-07-15T14:30:00Z",
      "lastFailure": null,
      "successRate": 0.99,
      "avgLatency": 800
    }
  }
}
```

### Health Check Components

| Check | Frequency | Source |
|-------|-----------|--------|
| ETA token refresh | Every 55 min | Integration service |
| SMTP connectivity | Every 5 min | Telnet/connection test |
| WhatsApp API reachable | Every 5 min | Meta API health |
| DO Spaces connectivity | Every 15 min | SDK list buckets |
| Google Calendar API | Every 15 min | API discovery |
| DLQ count check | Every 1 min | DB query |
| Certificates expiry | Daily | File check |

## Failure Dashboard

### Dashboard Components (V1 — Simple)

| Component | Data Source | Refresh |
|-----------|-------------|---------|
| Integration status cards | Integration health endpoint | Every 30s |
| Recent failures table | IntegrationLog (status=failed) | Every 30s |
| DLQ queue count | IntegrationDlq (status=pending) | Every 30s |
| Today's success rate | IntegrationLog (aggregation) | Every 5 min |
| System health overview | Health checks | Every 30s |

### Dashboard Components (V2 — Grafana)

| Component | Description |
|-----------|-------------|
| Global integration health | Uptime per system |
| Latency heatmap | P50/P95/P99 per integration |
| Error rate over time | Stacked by system |
| DLQ trend | DLQ growth over time |
| Rate limit hits | Per API key |
| Webhook delivery success | Per webhook |

## Support Runbook

### Integration Failure — ETA

```
SYMPTOM:  ETA submission returns 5xx or timeout
CHECK:
  1. ETA service status (https://status.invoicing.eta.gov.eg)
  2. Network connectivity from VPS to ETA API
  3. OAuth token freshness (last refreshed?)
  4. Invoice payload validity
ACTION:
  1. If ETA down → Invoice queue → Retry every 30 min
  2. If token expired → Refresh token → Retry
  3. If payload invalid → Check schema → Notify finance
  4. If network → Check firewall/ proxy → Retry
ESCALATION:
  - Finance team notified if > 2 hours
  - Development team if > 6 hours
```

### Integration Failure — Email

```
SYMPTOM:  Email delivery failing
CHECK:
  1. SMTP server running? (systemctl status postfix)
  2. Disk space on mail server?
  3. Queue depth? (mailq)
  4. DNS records (SPF, DKIM valid?)
ACTION:
  1. Restart SMTP service
  2. Clear mail queue
  3. Verify DNS records
  4. Switch to backup SMTP (if configured)
```

## Monitoring Implementation (V1)

| Tool | Purpose | Cost |
|------|---------|------|
| Integration Log DB table | Structured log of all calls | $0 (PostgreSQL) |
| NestJS Logger | Application-level logging | $0 (built-in) |
| Cron health checks | Periodic connectivity tests | $0 (node-cron) |
| In-app admin dashboard | Simple status views | $0 (Next.js) |
| Email alerts | Critical failure notifications | $0 (SMTP) |

### V2 Tooling

| Tool | Purpose | Cost |
|------|---------|------|
| Prometheus | Metrics collection | $0 (self-hosted) |
| Grafana | Dashboards and alerts | $0 (self-hosted) |
| Sentry | Error tracking | Free tier |
| Better Stack / Uptime Robot | External uptime monitoring | Free-$20/mo |
