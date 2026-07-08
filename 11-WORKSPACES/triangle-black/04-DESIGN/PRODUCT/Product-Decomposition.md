# Phase 03 — Product Decomposition

> Product decomposition for Triangle Black across business capabilities.

## Product Hierarchy

```
Triangle Black Platform
├── Core Platform
│   ├── Identity & Access (Auth, Users, Roles, Tenants)
│   ├── Shared Services (Notifications, Files, Audit)
│   └── Platform Foundation (API Gateway, Health, Config)
├── Business Applications
│   ├── Commercial CRM (Lead → Contract)
│   ├── Project Delivery (Execution → Handover)
│   ├── Procurement Management (Requisition → PO)
│   ├── Supplier Management (Lifecycle → Evaluation)
│   ├── Inventory Control (Stock → Warehouse)
│   ├── Financial Control (AR/AP → Revenue → GL)
│   ├── Maintenance Management (Service → SLA)
│   └── Document Management (Storage → Versioning)
├── Cross-Cutting
│   ├── Executive Intelligence (Dashboards → KPIs)
│   ├── AI Copilots (Scoring → Validation)
│   └── Mobile (PWA → Offline → Field Ops)
└── Integration Layer
    ├── ETA E-Invoice
    ├── SMTP Email
    ├── WhatsApp Business
    ├── Calendar Sync
    ├── DO Spaces Storage
    └── Bank CSV Import
```

## Traceability Summary

| Phase | Requirements → APIs → DB Tables → Screens |
|-------|------------------------------------------|
| Phase 3 | 29 requirements → 49 APIs → 25 DB tables → 22 screens |
| Coverage Score | 9.2/10 |

## Key Design Decisions

| Decision | Rationale |
|----------|-----------|
| Portal architecture with multi-tenant | Schema-per-tenant isolation |
| UX focused on hospitality engineering workflows | Domain-specific UI patterns |
| Design system based on shadcn/ui | Accessibility, customization, community |
| Event-driven for cross-domain communication | Loose coupling, audit trail |
| Security-first with JWT + RBAC | Startup-appropriate without external dependencies |

## Sub-Products

| Product | Files | Lead Document |
|---------|-------|---------------|
| Portal Architecture | 04-Portal/ | Portal-Architecture.md |
| UX Design | 08-UX/ | UX-Architecture.md |
| Screen Specs | 12-Frontend/ | Screen-Architecture.md |
| Design System | Design-System.md | Design-System.md |
| Event Model | Event-Architecture.md | Event-Architecture.md |
| Security Model | 15-Security/ | Security-Architecture.md |
| Database Schema | 10-Database/ | Physical-Database.md |
| API Specifications | 13-API/ | API-Specifications.md |
| AI Agents | 16-AI/ | AI-Agent-Architecture.md |

## Related Documents

- [Portal Architecture](Portal-Architecture.md) — Multi-tenant portal design
- [UX Architecture](UX-Architecture.md) — User experience design
- [Screen Architecture](Screen-Architecture.md) — Screen specifications
- [Design System](Design-System.md) — UI component library
- [Event Architecture](Event-Architecture.md) — Event-driven design
- [Security Architecture](Security-Architecture.md) — Security design
- [Physical Database](Physical-Database.md) — Database schema
- [API Specifications](API-Specifications.md) — API endpoint specs
- [AI Agent Architecture](AI-Agent-Architecture.md) — AI agent design
- [Implementation Readiness](Implementation-Readiness.md) — Readiness assessment
