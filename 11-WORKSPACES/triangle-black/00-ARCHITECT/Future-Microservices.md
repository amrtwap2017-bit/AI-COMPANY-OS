# Future Microservices Architecture

## When to Split

The modular monolith will be decomposed into microservices when **three or more** of these conditions are met:

| Condition | Threshold |
|-----------|-----------|
| Team size | 6+ developers working on the same codebase |
| Deployment frequency | Conflicting deployments due to merge contention |
| Database size | > 500 GB with slow query performance |
| Traffic | > 10,000 concurrent users across all tenants |
| Module instability | One module requires frequent deploys while others are stable |
| Resource contention | A module requires different infrastructure (more memory, GPU) |

## Extraction Strategy

Modules are extracted **one at a time**, starting with the most independent:

```
Phase 1: Auth & Tenant (stateless, high-value first)
Phase 2: Channel (high traffic, external-facing)
Phase 3: Billing (compliance, needs isolation for PCI scope)
Phase 4: AI Agent (needs GPU / different scaling)
Phase 5: Analytics (heavy queries, separate read replicas)
Phase 6: Reservation, Property, Guest (core domain, last to extract)
```

## Target Microservices Architecture

```
┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐
│  Auth    │  │ Channel  │  │ Billing  │  │ AI Agent │  │Analytics │
│ Service  │  │ Service  │  │ Service  │  │ Service  │  │ Service  │
└────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘
     │              │              │              │              │
     └──────────────┼──────────────┼──────────────┼──────────────┘
                    │              │              │
          ┌─────────┴──────────────┴──────────────┴──────────┐
          │                API Gateway (NestJS BFF)            │
          │  Authentication, Rate Limiting, Routing, Caching   │
          └────────────────────┬──────────────────────────────┘
                               │
                    ┌──────────┴──────────┐
                    │      Frontend        │
                    │   (Next.js / Mobile) │
                    └─────────────────────┘
```

## Communication Between Services

```
┌──────────────────────────────────────────────────────────┐
│                    Inter-Service Communication             │
│                                                           │
│  Synchronous:    HTTP/REST (internal API calls)           │
│                  gRPC (high-throughput, future)           │
│                                                           │
│  Asynchronous:   Redis Bull (job queues)                  │
│                  RabbitMQ / Kafka (event bus, future)      │
│                                                           │
│  Contracts:      Shared type packages (npm workspaces)    │
│                  Protobuf (future with gRPC)              │
└──────────────────────────────────────────────────────────┘
```

## Database Strategy After Split

```
┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│ Auth Service  │  │ Core Service  │  │ Billing      │
│ DB            │  │ DB            │  │ Service DB   │
│ (single       │  │ (schema-per-  │  │ (schema-per- │
│  schema)      │  │  tenant)      │  │  tenant)     │
└──────────────┘  └──────────────┘  └──────────────┘
                        │                    │
                        └────────┬───────────┘
                                 │
                        ┌────────┴────────┐
                        │   Analytics DB   │
                        │  (read replica)  │
                        └─────────────────┘
```

## Data Consistency Model

| Pattern | When Used | Example |
|---------|-----------|---------|
| **SAGA (orchestration)** | Multi-service write operations | Create reservation → bill guest → confirm booking |
| **Eventual consistency** | Non-critical side effects | Analytics updates, email notifications |
| **Outbox pattern** | Reliable event publication | Domain events → outbox table → message broker |
| **CQRS** | Read/write separation for high-traffic queries | Reservation search, Analytics |

## Changes Required for Extraction

1. **Repository layer** — replace direct Prisma calls with HTTP/gRPC calls to the extracted service
2. **Event bus** — replace in-process NestJS EventBus with distributed message broker
3. **Distributed transactions** — implement SAGA orchestration for cross-service operations
4. **API Gateway** — add service routing, rate limiting, and auth at gateway level
5. **Service discovery** — implement DNS-based or Consul-based discovery
6. **Health checks** — each service exposes `/health` for orchestration
7. **Distributed tracing** — add OpenTelemetry for cross-service request tracing

## What Doesn't Change

- **Module boundaries** — already defined; extraction = moving files to new service
- **Domain logic** — remains in `domain/` layer, framework-independent
- **Interface contracts** — already defined as TypeScript interfaces
- **Schema-per-tenant** — continues to apply per service
- **Coding conventions** — same linting, testing, and naming standards
