# 06 — CDN Strategy

> Content delivery network strategy for global performance.

## Reference Chain

| Source | Input |
|--------|-------|
| Phase 10 — Global-Deployment.md | Regional deployment |
| Phase 10 — Performance-Optimization.md | Performance targets |

## CDN Architecture

```
User ──► DNS (Cloudflare) ──► CDN Edge ──► Origin Server
  │                            │
  │                         Cache HIT
  │                         (static assets,
  │                          API responses,
  │                          images)
  │
  └─────► Cache MISS ──► Origin ──► Cache + Serve
```

## What to Cache

| Asset | Cache Duration | Cache Strategy | Invalidation |
|-------|---------------|---------------|--------------|
| Static JS/CSS | 1 year | Immutable content hash | On build |
| Images | 30 days | WebP, responsive | On update |
| API responses | 5 minutes | Vary by tenant | On data change |
| HTML pages | 1 minute | Tenant-specific | On content change |
| Fonts | 1 year | Immutable | Rare |
| Third-party | Varies | Proxy cache | Via CDN |

## CDN Provider

| Provider | Use | Cost | Features |
|----------|-----|------|----------|
| Cloudflare | Primary CDN, DNS, DDoS | Free tier / Pro $20/mo | Global network, SSL, WAF |
| (Future) AWS CloudFront | Advanced caching | Pay-as-you-go | Lambda@Edge |

## CDN Performance Targets

| Metric | Target |
|--------|--------|
| Global cache hit rate | > 80% |
| Edge response time | < 50ms |
| Origin load reduction | > 80% |
| Time to first byte (global) | < 200ms |
| Cache purge time | < 30s |

## CDN Security

| Security Feature | Implementation |
|-----------------|---------------|
| DDoS protection | Cloudflare automatic |
| WAF | Cloudflare managed rules |
| SSL/TLS | Cloudflare Universal SSL |
| Bot management | Cloudflare Bot Fight Mode |
| IP blocking | Cloudflare firewall rules |
| Rate limiting | Per-IP, per-path |
