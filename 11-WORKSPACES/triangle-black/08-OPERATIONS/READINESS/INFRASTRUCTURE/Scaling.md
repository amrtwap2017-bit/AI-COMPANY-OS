# 06 — Scaling

> Infrastructure scaling plan and validation.

## Reference Documents

| Source | File | Relevance |
|--------|------|-----------|
| PHASE-04 | DevOps-Architecture.md | Scaling path |
| PHASE-02 | DevOps-Architecture.md | VPS budget |

## Scaling Path

```
V1 ($6/mo) ──► V1.5 ($12/mo) ──► V1.5 ($24/mo) ──► V2 ($40/mo+)
   │              │                  │                  │
   1 vCPU         2 vCPU            2 vCPU             4 vCPU
   1GB RAM        2GB RAM           4GB RAM            8GB RAM
   25GB SSD       50GB SSD          80GB SSD           160GB SSD
   1 Customer     5 Customers       10 Customers       25+ Customers
```

## Vertical Scaling Triggers

| Metric | Threshold | Action |
|--------|-----------|--------|
| CPU (avg) | > 70% for 1 hour | Upgrade to next droplet size |
| RAM (avg) | > 75% for 1 hour | Upgrade to next droplet size |
| Disk | > 80% | Increase volume size |
| DB connections | > 15 | Add PgBouncer container |
| API response time | P99 > 2s for 1 hour | Increase CPU, optimize queries |

## Horizontal Scaling (V2)

| Component | Strategy | Notes |
|-----------|----------|-------|
| API | Multiple containers behind Nginx | Requires sticky sessions or stateless design |
| Web | CDN + multiple containers | Static assets via CDN |
| Database | Read replicas | Complex; defer to V2 |
| Worker | Separate droplet | Background job isolation |

## Validation

- [ ] Vertical scaling tested (upgrade droplet, no data loss)
- [ ] Resource monitoring triggers configured
- [ ] Budget approved for scaling up to $40/mo

## Sign-Off

| Role | Name | Signature | Date |
|------|------|-----------|------|
| DevOps Lead | | | |

**Status:** ❌ NOT VERIFIED
