# Stage 12: Operations

## Purpose

Hand over the deployed feature to operations, establish monitoring and alerting, document runbook procedures, and ensure the feature is observable in production.

## Agent Role

**SRE AI** — Responsible for operational readiness, monitoring setup, and runbook documentation.

## Entry Criteria

| Criterion | Description |
|-----------|-------------|
| Release Deployed | Release artifact with status `APPROVED` |
| Monitoring Infrastructure | Monitoring tools (logs, metrics, traces) are available |
| Incident Response Process | On-call rotation and escalation paths are defined |

## Process

### Step 1: Establish Health Checks
- Verify the feature's health check endpoint is registered with the orchestrator.
- Add synthetic checks for critical user journeys (e.g., `POST /api/orders` returns 201).
- Set up readiness and liveness probes for container orchestration.

### Step 2: Configure Monitoring & Alerting
- Add custom metrics:
  - Request rate, latency (p50/p95/p99), error rate per endpoint.
  - Business metrics: orders created, payment success rate, etc.
- Set up dashboards (Grafana, DataDog, etc.) for the feature.
- Configure alerts:
  - Error rate spike > 1% over 5 minutes.
  - p99 latency > 2000ms.
  - Health check failure.
  - Business metric anomaly (e.g., zero orders in 30 minutes).

### Step 3: Set Up Logging
- Ensure structured logging is in place (JSON format, consistent fields).
- Add feature-specific log correlation IDs for request tracing.
- Verify logs flow to the central logging system (ELK, Loki, etc.).

### Step 4: Enable Distributed Tracing
- Ensure OpenTelemetry spans are emitted for critical operations.
- Trace the full request path: API Gateway → Service → Database → External APIs.
- Verify traces appear in the tracing backend (Jaeger, Tempo, etc.).

### Step 5: Write Runbook
- Document operational procedures for the feature:
  - **Startup**: How to start/restart the feature's services.
  - **Shutdown**: How to gracefully shut down.
  - **Scaling**: How to scale horizontally (triggers, limits).
  - **Failure scenarios**: Common failure modes and resolution steps.
  - **Backup/Restore**: Data backup procedures for the feature's data.
  - **Rollback**: Steps to rollback to the previous version.

### Step 6: Document SLOs
- Define Service Level Objectives:
  - **Availability**: 99.9% uptime.
  - **Latency**: p99 < 2000ms.
  - **Error Rate**: < 0.1% of requests.
- Document how SLOs are measured and reported.

### Step 7: Transfer Knowledge
- Write the operations handoff artifact to `.operations.md`.
- Include links to dashboards, runbooks, and monitoring configuration.

## Exit Criteria

| Criterion | Description |
|-----------|-------------|
| Health Checks Configured | Feature is monitored by health check system |
| Alerts Active | Error rate, latency, and health alerts are configured |
| Dashboards Created | Feature-specific dashboard exists with key metrics |
| Structured Logging Active | Logs are JSON-formatted and flow to central logging |
| Tracing Enabled | OpenTelemetry spans visible in tracing backend |
| Runbook Written | Runbook covers startup, shutdown, scaling, failure modes, rollback |
| SLOs Defined | Availability, latency, and error rate SLOs documented |

## Artifact Template

```markdown
# Operations Handoff: <Feature Title>

**Release**: `v2.3.0`
**Status**: APPROVED | CHANGES_REQUESTED | REJECTED

## Monitoring
| Type | Tool | Link |
|------|------|------|
| Dashboard | Grafana | `/d/orders-feature` |
| Logs | Loki | `{service="orders-service"}` |
| Traces | Jaeger | `service.name="orders-service"` |
| Alerts | Alertmanager | `OrdersFeatureHighErrorRate` |

## Health Checks
- **Endpoint**: `GET /api/orders/health`
- **Synthetic Check**: `POST /api/orders → 201` (every 60s)

## Alerts
| Alert | Condition | Severity |
|-------|-----------|----------|
| High Error Rate | Error rate > 1% for 5 min | Critical |
| High Latency | p99 > 2000ms for 5 min | Warning |
| Health Check Down | 3 consecutive failures | Critical |

## SLOs
| Metric | Target | Measurement Period |
|--------|--------|--------------------|
| Availability | 99.9% | 30 days |
| Latency (p99) | < 2000ms | 7 days |
| Error Rate | < 0.1% | 7 days |

## Runbook
### Startup
```bash
docker-compose up -d orders-service
```

### Scaling
- Horizontal scaling trigger: CPU > 70% for 5 min
- Max replicas: 10
- Scaling cooldown: 5 min

### Failure: Database Connection Lost
1. Check DB connection pool: `SELECT * FROM pg_stat_activity;`
2. Restart connection pool: `docker-compose restart orders-service`
3. If persistent, failover to read replica

### Rollback
1. `kubectl rollout undo deployment/orders-service`
2. Run rollback migration if schema changed

## Additional Notes
- Feature depends on Order Service and Payment Service
- Rate limiting: 100 req/min per tenant
- CORS allowed origins listed in deployment config
```

## Failure Modes

| Failure | Resolution |
|---------|-----------|
| Alerts not firing | Check alert rule configuration and test with synthetic failure |
| Traces not visible | Verify OpenTelemetry SDK is initialized and exporter is configured |
| Dashboards empty | Check metric name consistency and data source configuration |
| Runbook incomplete | Walk through each failure scenario and add resolution steps |
| SLOs not measurable | Add missing metric collection and verify in dashboard |

## Cross-References

- [11-Release.md](./11-Release.md)
- [Pipeline README](./README.md)
