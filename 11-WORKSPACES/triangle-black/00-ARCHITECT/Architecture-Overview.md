# Architecture Overview

## System Context

Triangle Black is a multi-tenant digital operations platform for the hospitality industry. A single instance serves multiple hotel/lodging clients, each isolated at the database schema level.

```
┌─────────────────────────────────────────────────────────────┐
│                    External Systems                          │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │  OTA     │  │  PMS     │  │ Payment  │  │  Email   │   │
│  │ (Expedia)│  │(Oracle)  │  │(Stripe)  │  │ (SendGrid)│  │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘   │
│       │              │              │              │        │
└───────┼──────────────┼──────────────┼──────────────┼────────┘
        │              │              │              │
        │         ┌────┴────┐         │              │
        │         │         │         │              │
        │    ┌────┴─────────┴─────────┴──────────┐  │
        │    │          Internet                  │  │
        │    │    (HTTPS / WSS / API calls)       │  │
        │    └────────────────┬───────────────────┘  │
        │                     │                      │
        │    ┌────────────────┴───────────────────┐  │
        │    │           Nginx (Reverse Proxy)     │  │
        │    │    TLS termination, rate limiting   │  │
        │    └────────────────┬───────────────────┘  │
        │                     │                      │
        └─────────────────────┼──────────────────────┘
                              │
        ┌─────────────────────┼──────────────────────┐
        │                     │                      │
        │    ┌────────────────┴───────────────────┐  │
        │    │         Next.js (Frontend)          │  │
        │    │   App Router, SSR, React Server     │  │
        │    │   Components, API routes (BFF)      │  │
        │    └────────────────┬───────────────────┘  │
        │                     │ (internal HTTP)      │
        │    ┌────────────────┴───────────────────┐  │
        │    │       NestJS (Backend API)          │  │
        │    │  Modular monolith: Modules/         │  │
        │    │  ├─ TenantMgmt                      │  │
        │    │  ├─ Auth                            │  │
        │    │  ├─ Property                        │  │
        │    │  ├─ Reservations                    │  │
        │    │  ├─ Guests                          │  │
        │    │  ├─ Billing                         │  │
        │    │  ├─ Inventory                       │  │
        │    │  ├─ Housekeeping                    │  │
        │    │  ├─ Analytics                       │  │
        │    │  └─ AI-Agent (V2)                   │  │
        │    └───────────┬────────────────────────┘  │
        │                │                            │
        │    ┌───────────┴────────────────────────┐  │
        │    │       PostgreSQL (Single Instance)  │  │
        │    │  Shared Schema:                     │  │
        │    │  ├─ public (platform data)          │  │
        │    │  │  ├─ tenants                      │  │
        │    │  │  ├─ users                        │  │
        │    │  │  └─ migrations                   │  │
        │    │  Per-Tenant Schemas:                │  │
        │    │  ├─ tenant_{id}_1 (property data)   │  │
        │    │  ├─ tenant_{id}_2 (guest data)      │  │
        │    │  └─ ...                             │  │
        │    └─────────────────────────────────────┘  │
        │                                              │
        │    ┌─────────────────────────────────────┐  │
        │    │       Shared Services                │  │
        │    │  ├─ Redis (cache, sessions, queues)  │  │
        │    │  ├─ File Storage (local disk / S3)   │  │
        │    │  └─ Background Workers (Bull queues) │  │
        │    └─────────────────────────────────────┘  │
        └─────────────────────────────────────────────┘
```

## Container Architecture (Docker Compose)

```
┌──────────────────────────────────────────────────────┐
│                   Docker Host (VPS)                    │
│                                                        │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────┐  │
│  │  nginx   │  │ nextjs   │  │  nestjs  │  │redis │  │
│  │ :443/80  │──│ :3000    │──│ :4000    │──│:6379 │  │
│  └────┬─────┘  └──────────┘  └────┬─────┘  └──────┘  │
│       │                            │                   │
│       │   ┌────────────────────────┘                   │
│       │   │                                            │
│       │   │   ┌────────────────────────────────────┐   │
│       │   │   │         postgres                    │   │
│       │   └───│ :5432                               │   │
│       │       └────────────────────────────────────┘   │
│       │                                                │
│       │   ┌────────────────────────────────────┐   │
│       └───│         minio (V2+)                 │   │
│           │ :9000                                │   │
│           └────────────────────────────────────┘   │
│                                                    │
│  Networks: frontend ─ backend ─ database           │
│  Volumes: postgres_data, redis_data, uploads       │
└──────────────────────────────────────────────────────┘
```

## Request Flow

```
Browser ──HTTPS──► Nginx ──proxy_pass──► Next.js (:3000)
                                              │
                                         API Route (BFF)
                                              │
                                     ┌────────┴────────┐
                                     │  Authenticate?   │
                                     └────────┬────────┘
                                              │ (JWT + tenant context)
                                              ▼
                                     NestJS API (:4000)
                                              │
                                     ┌────────┴────────┐
                                     │  TenantResolver │
                                     │  (schema switch)│
                                     └────────┬────────┘
                                              │
                                     ┌────────┴────────┐
                                     │   Module Guard   │
                                     │  (authorization) │
                                     └────────┬────────┘
                                              │
                                     ┌────────┴────────┐
                                     │  Service Layer   │
                                     │  (business logic)│
                                     └────────┬────────┘
                                              │
                                     ┌────────┴────────┐
                                     │ Prisma (ORM)     │
                                     │  (tenant schema) │
                                     └────────┬────────┘
                                              │
                                              ▼
                                     PostgreSQL
```

## Key Architectural Properties

| Property | Implementation |
|----------|---------------|
| **Multi-tenancy** | Schema-per-tenant, resolved via middleware |
| **Isolation** | Schema layer provides tenant data isolation |
| **Scalability** | Vertical first (bigger VPS), horizontal later (read replicas) |
| **Availability** | Single-VPS with Docker restart policies, health checks |
| **Security** | HTTPS, JWT, schema isolation, parameterized queries |
| **Observability** | Structured logging, health endpoints, performance metrics |
| **Extensibility** | Modular monolith with well-defined module interfaces |
