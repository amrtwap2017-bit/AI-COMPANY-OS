# 23 — Startup Cost Optimization

## Budget

| Item | Cost/Month | Provider | Notes |
|------|-----------|----------|-------|
| VPS (1GB RAM, 1 vCPU, 25GB SSD) | $6 | DigitalOcean | $6 Basic Droplet |
| PostgreSQL | $0 | On VPS | Self-hosted on same droplet |
| Domain | ~$0.84 | Cloudflare | ~$10/yr, prorated |
| SSL | $0 | Let's Encrypt | Auto-renew via certbot |
| DNS | $0 | Cloudflare Free | — |
| CDN | $0 | Cloudflare Free | — |
| CI/CD | $0 | GitHub Free | 2,000 min/mo |
| Monitoring | $0 | Uptime Kuma | Self-hosted on VPS |
| Error tracking | $0 | Sentry Free | 5K events/mo |
| Email | $0 | SMTP from VPS | Or free tier SendGrid (100/day) |
| Container registry | $0 | GitHub Container Registry | Free for public repos |
| **Total** | **~$6-7** | — | Well under $25-40/mo budget |

## Cost Rules

| Rule | Description |
|------|-------------|
| C1 | No paid SaaS in V1. Free tiers only. |
| C2 | No Kubernetes in V1. Docker Compose on single VPS. |
| C3 | No Redis in V1. In-memory Map for cache if needed. |
| C4 | No message broker in V1. In-process events. |
| C5 | No Elasticsearch in V1. PostgreSQL full-text search. |
| C6 | No paid CDN. Cloudflare Free. |
| C7 | No paid monitoring. Self-hosted Uptime Kuma. |
| C8 | No paid CI. GitHub Free Actions. |
| C9 | One VPS. Everything runs on one $6 droplet. |

## When to Spend (V2+)

| Service | When to Add | Cost | Justification Metric |
|---------|-------------|------|----------------------|
| Managed PostgreSQL | DB > 5GB or > 100 tenants | $15/mo minimum | Storage or load metrics |
| Redis | Cache hit ratio < 60% | $12/mo | Query latency metrics |
| CDN (paid) | Bandwidth > 100GB/mo | $10/mo | Bandwidth metrics |
| Sentry Pro | 5K events/mo exceeded | $26/mo | Error volume metrics |
| Monitoring (paid) | 10+ alerts/week missed | $15/mo | Alert reliability |
| CI (paid) | 2,000 min/mo exceeded | $4/mo | CI time metrics |
| Email service | 100/day exceeded | $0.50/1K emails | Email volume |

## Infrastructure Efficiency

| Practice | Savings |
|----------|---------|
| Multi-stage Docker builds | Smaller images, faster deploys |
| Alpine-based images | ~50% smaller images |
| Prisma binary targets | Only needed binaries |
| pnpm with frozen lockfile | Faster installs, reproducible |
| `NODE_ENV=production` | Smaller node_modules on prod |
| Docker layer caching | CI minutes reduction |
