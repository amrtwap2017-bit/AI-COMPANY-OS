# Architecture Principles

## Business Principles

1. **Revenue First** — Every feature ties to revenue, cost reduction, or client retention
2. **Enterprise Architecture, Startup Infrastructure** — Design for scale, deploy for today ($25-40/mo)
3. **Traceability** — No code without a documented business reason
4. **Lean V1** — Ship minimum that generates revenue. Everything else is V2+
5. **Category Ownership** — "Operational Engineering Partner" is ours to define

## Architecture Principles

1. **Monolith First, Microservices Later** — Modular monolith that can be split when needed
2. **Schema-Per-Tenant** — Isolation without infrastructure complexity
3. **CQRS-Ready** — Commands and queries separated from day one
4. **Domain Events for Integration** — Bounded contexts communicate through events
5. **API-First** — Every feature has an API contract before UI

## Technology Principles

1. **Open Source Preferred** — No paid licenses for V1
2. **Free Tier First** — Cloudflare Free, GitHub Free, Let's Encrypt
3. **Single VPS** — No Kubernetes, no clusters, no distributed systems in V1
4. **Docker Compose** — Simple, reproducible, portable
5. **Future-Proof** — Architecture supports Redis, Kafka, K8s, AI agents without rewrite

## Cost Principles

1. $25-40/month infrastructure target
2. No paid SaaS unless proven necessary
3. Manual over automated when cost > benefit for V1
4. Free SSL, free CDN, free CI/CD
5. Local storage over object storage for V1

## The Triangle Black Pyramid (Decision Hierarchy)

```
Purpose → Vision → Mission → Core Values → Business Model →
Operating Model → Capabilities → Processes → Software → Technology
```

Technology is the LAST decision. Every choice must trace back up this pyramid.
