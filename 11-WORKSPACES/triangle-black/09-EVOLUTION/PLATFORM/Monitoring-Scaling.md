# 06 — Monitoring Scaling

> Scaling monitoring infrastructure with the platform.

## Reference Chain

| Source | Input |
|--------|-------|
| Phase 7 — Monitoring | Monitoring baseline |
| Phase 10 — Infrastructure-Scaling.md | Infrastructure evolution |

## Monitoring Evolution

```
BOOTSTRAP (1-10 hotels)        GROWTH (10-100 hotels)
┌──────────────────┐          ┌─────────────────────────────┐
│ Uptime monitoring │          │ Prometheus + Grafana        │
│ Basic logging    │ ──────►  │ Centralized logging (Loki)  │
│ Simple alerts    │          │ Alertmanager + PagerDuty    │
│ $0/mo            │          │ Synthetic monitoring        │
└──────────────────┘          │ $50/mo                      │
                              └─────────────────────────────┘

SCALE (100-1,000 hotels)       ENTERPRISE (1,000+ hotels)
┌──────────────────────────┐   ┌──────────────────────────┐
│ Distributed tracing      │   │ Full observability       │
│ (OpenTelemetry)          │   │ (Tracing, metrics, logs) │
│ APM (self-hosted)        │   │ AI-powered alerts        │
│ Real user monitoring     │   │ Customer-facing status   │
│ $500/mo                  │   │ $2K/mo                   │
└──────────────────────────┘   └──────────────────────────┘
```

## Metrics Growth

| Metric | Bootstrap | Growth | Scale |
|--------|-----------|--------|-------|
| Active metrics | 100 | 1,000 | 10,000+ |
| Log volume (daily) | 100 MB | 1 GB | 10 GB+ |
| Alert rules | 10 | 50 | 200+ |
| Dashboards | 3 | 10 | 30+ |
| Check interval | 60s | 15s | 5s |

## Distributed Tracing (H2)

| Component | Tool | Purpose |
|-----------|------|---------|
| Instrumentation | OpenTelemetry | Trace generation |
| Backend | Jaeger / Grafana Tempo | Trace storage |
| Sampling | Head-based (10%) | Volume management |
| Integration | All microservices | End-to-end visibility |

## Monitoring Automation

| Task | Automation | Tool |
|------|-----------|------|
| Dashboard provisioning | Terraform | Grafana |
| Alert rules | Terraform | Alertmanager |
| Log retention | Auto-purge | Loki config |
| Metric aggregation | Auto | Prometheus recording rules |
| Incident response | Auto-create | PagerDuty webhook |
