# 06 — Capacity Planning

> Capacity planning for production infrastructure.

## Reference Chain

| Source | File | Input |
|--------|------|-------|
| Phase 4 | DevOps-Architecture.md | Infrastructure design |
| Phase 8 | 06-INFRASTRUCTURE-READINESS/Scaling.md | Scaling plan |

## Current Capacity (V1)

| Resource | Allocation | Usage | Available | Threshold |
|----------|-----------|-------|-----------|-----------|
| CPU | 1 vCPU | 0% | 100% | > 80% |
| RAM | 1 GB | 0% | 100% | > 80% |
| Disk | 25 GB | 0% | 100% | > 80% |
| DB Connections | 20 | 0 | 20 | > 15 |

## Capacity Plan

### Vertical Scaling (V1 → V1.5)

| Trigger | Action | New Spec | Cost Increase |
|---------|--------|----------|---------------|
| CPU > 70% for 1 hour | Upgrade droplet | 2 vCPU, 2GB RAM | +$6/mo |
| RAM > 75% for 1 hour | Upgrade droplet | 2 vCPU, 2GB RAM | +$6/mo |
| Disk > 80% | Increase volume | +25GB | +$5/mo |
| DB connections > 15 | Add PgBouncer | — | Free (Docker) |

### Scaling Triggers by Customer Count

| Customers | Droplet | CPU | RAM | Disk | Monthly Cost |
|-----------|---------|-----|-----|------|-------------|
| 0-1 | Basic | 1 vCPU | 1 GB | 25 GB | $6 |
| 2-5 | Basic+ | 2 vCPU | 2 GB | 50 GB | $12 |
| 6-15 | Pro | 2 vCPU | 4 GB | 80 GB | $24 |
| 16+ | Pro+ | 4 vCPU | 8 GB | 160 GB | $48 |

## Monitoring for Capacity

| Metric | Check Frequency | Trend Window | Alert on |
|--------|----------------|--------------|----------|
| CPU | 5 min | 1 day | > 70% for 1 hour |
| RAM | 5 min | 1 day | > 75% for 1 hour |
| Disk | 1 hour | 7 days | > 80% |
| API response time | 1 min | 1 hour | p95 > 500ms |
| DB connections | 1 min | 1 hour | > 15 |

## Capacity Review Cadence

| Review | Frequency | Owner | Output |
|--------|-----------|-------|--------|
| Weekly trends | Weekly | DevOps Lead | Capacity report |
| Monthly planning | Monthly | CTO + DevOps | Scaling decisions |
| Quarterly strategy | Quarterly | CTO | Infrastructure roadmap |

## Sign-Off

| Role | Name | Signature | Date |
|------|------|-----------|------|
| CTO | | | |

**Status:** ❌ NOT CONFIGURED
