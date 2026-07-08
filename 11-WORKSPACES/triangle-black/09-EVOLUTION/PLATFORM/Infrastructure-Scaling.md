# 06 — Infrastructure Scaling

> Infrastructure scaling across growth phases.

## Reference Chain

| Source | Input |
|--------|-------|
| Phase 4 — DevOps-Architecture.md | Infrastructure baseline |
| Phase 5 — Platform-Foundation.md | Platform foundation |

## Infrastructure Evolution

```
BOOTSTRAP (1-10 hotels)           GROWTH (10-100 hotels)
┌──────────────────┐             ┌────────────────────────┐
│ 1 VPS (App + DB) │ ──────►    │ 2-3 VPS (App HA)      │
│ 1 VPS (Staging)  │             │ 1 VPS (DB primary)    │
│ 1 PostgreSQL     │             │ 1 VPS (DB replica)    │
│ 1 Redis instance │             │ 1 VPS (Redis cluster) │
│ $40/mo           │             │ 1 VPS (Staging)       │
└──────────────────┘             │ Load balancer (HAProxy)│
                                 │ $500/mo               │
                                 └────────────────────────┘

SCALE (100-1,000 hotels)         ENTERPRISE (1,000+ hotels)
┌────────────────────────┐      ┌────────────────────────────┐
│ Microservices (Docker) │      │ Kubernetes cluster        │
│ DB sharding            │      │ Multi-region (Egypt + GCC) │
│ CDN (Cloudflare)       │      │ Global CDN                │
│ Message queue (Kafka)  │      │ Managed cloud (AWS/GCP)   │
│ CI/CD (GitHub Actions) │      │ Auto-scaling everywhere   │
│ $5K/mo                 │      │ Full observability stack   │
└────────────────────────┘      │ $50K+/mo                  │
                                 └────────────────────────────┘
```

## Infrastructure as Code

| Resource | H1 Tool | H2 Tool |
|----------|---------|---------|
| Compute | Ansible + manual | Terraform |
| Database | Manual (pgAdmin) | Terraform |
| Networking | Ansible | Terraform |
| DNS | Cloudflare API | Terraform |
| Monitoring | Ansible + Prometheus | Terraform + operator |

## Capacity Triggers

| Resource | Trigger | Action |
|----------|---------|--------|
| CPU > 75% | 5 min sustained | Add app instance |
| Memory > 80% | 5 min sustained | Scale up instance |
| DB connections > 80% | 5 min sustained | Add connection pool, scale |
| Disk > 80% | Any | Auto-cleanup, alert, expand |
| Response time > 500ms | 5 min sustained | Investigate, optimize |
| Error rate > 1% | Immediate | Alert, rollback if deploy |
