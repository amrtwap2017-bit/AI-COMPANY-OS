# Integration Governance

> Security, partner portal, developer platform, future integration roadmap.

## 12 — Integration Security

### Security Architecture

```
┌──────────────────────────────────────────────────────────────────────┐
│                        SECURITY BOUNDARY                             │
│                                                                      │
│  ┌─────────────┐  ┌──────────────┐  ┌──────────────┐                │
│  │ Encryption  │  │ API Security │  │ Secrets      │                │
│  │ In Transit  │  │ AuthN/AuthZ  │  │ Management   │                │
│  │ At Rest     │  │ Rate Limit   │  │ Vault        │                │
│  │ mTLS (V2)   │  │ OWASP        │  │ Rotation     │                │
│  └─────────────┘  └──────────────┘  └──────────────┘                │
│                                                                      │
│  ┌─────────────┐  ┌──────────────┐  ┌──────────────┐                │
│  │ Audit       │  │ Monitoring   │  │ Threat       │                │
│  │ Trail       │  │ Anomaly      │  │ Model        │                │
│  │ Forensics   │  │ Detection    │  │ Zero Trust   │                │
│  └─────────────┘  └──────────────┘  └──────────────┘                │
└──────────────────────────────────────────────────────────────────────┘
```

### Encryption Standards

| Layer | Standard | Implementation |
|-------|----------|---------------|
| In Transit | TLS 1.3 | All external API endpoints |
| In Transit | mTLS | Partner integrations (V2) |
| At Rest (DB) | AES-256 | PostgreSQL TDE / column-level encryption |
| At Rest (Secrets) | AES-256 | Secrets Vault |
| At Rest (Files) | AES-256 | DO Spaces server-side encryption |
| API Keys (storage) | SHA-256 hash | Never stored in plaintext |
| JWT Signing | RS256 | RSA key pair, rotated quarterly |

### API Security Checklist

| Requirement | Implementation | Status |
|-------------|---------------|--------|
| All API calls over TLS 1.3 | Nginx / reverse proxy | ✅ V1 |
| Authentication on all endpoints | JWT / API Key / OAuth | ✅ V1 |
| Authorization (RBAC) per endpoint | PermissionGuard (Phase 5) | ✅ V1 |
| Rate limiting per API key | @nestjs/throttler | ✅ V1 |
| Input validation (OpenAPI) | class-validator + ValidationPipe | ✅ V1 |
| CORS restricted to known origins | NestJS CORS config | ✅ V1 |
| No sensitive data in URLs | Query params for filters only | ✅ V1 |
| Security headers (HSTS, CSP, XSS) | Helmet middleware | ✅ V1 |
| IP whitelisting (partner API) | IP-based guard | V2 |
| Audit logging on all mutations | AuditService (Phase 5) | ✅ V1 |

### Secrets Management

| Secret | Storage | Rotation | Access |
|--------|---------|----------|--------|
| ETA Client ID + Secret | Environment variables (encrypted) | Every 90 days | Integration service |
| SMTP Password | Environment variables | Every 90 days | Notification service |
| WhatsApp Access Token | Environment variables | Every 60 days | Integration service |
| Google Service Account | JSON file (encrypted) | Every 365 days | Calendar integration |
| DO Spaces Key | Environment variables | Every 90 days | Document service |
| Database Password | Environment variables | Every 180 days | Prisma service |
| JWT Private Key | File (encrypted) | Every 90 days | Auth service |
| API Keys (external) | Hashed in DB | Every 90 days | Gateway service |

### Zero Trust Principles

| Principle | Implementation |
|-----------|---------------|
| Verify every request | Authentication + authorization on ALL endpoints |
| Least privilege | API key scoped to minimum resources |
| Micro-segmentation | Integration service isolated from domain services |
| No implicit trust | External webhooks verified by HMAC |
| Continuous monitoring | Integration monitoring dashboard |
| Assume breach | Audit logging, anomaly detection, rapid rotation |

### OWASP Top 10 — Integration Specific

| Risk | Mitigation |
|------|------------|
| Broken Object Level Authorization | PermissionGuard checks tenant + resource ownership |
| Broken Authentication | JWT validation, API key hashing |
| Excessive Data Exposure | Response transformation, field filtering |
| Lack of Resources & Rate Limiting | Rate limiter per key/IP |
| Mass Assignment | DTO validation, whitelist fields |
| Security Misconfiguration | Automated security header checks in CI |
| Injection | Input validation, parameterized queries |
| Improper Assets Management | OpenAPI spec as source of truth |
| Insufficient Logging & Monitoring | Integration log, alerts, health checks |

---

## 14 — Partner Portal Strategy

### Portal Purpose

External suppliers, contractors, and consultants need limited, controlled access to Triangle Black data relevant to their business relationship.

### Partner Types

| Partner Type | Access Scope | Authentication | V1/V2 |
|-------------|-------------|----------------|-------|
| Suppliers | View POs, submit invoices, view payment status | API Key + Portal login | V2 |
| Contractors | View projects, submit daily reports, view timesheets | Portal login (JWT) | V2 |
| Consultants | View project documents, submit reports | Portal login (JWT) | V2 |
| Hospitality Partners | View service requests, maintenance history | Portal login (JWT) | V2+ |

### V1 Approach

No partner portal. Partners interact via:
- **Email** — POs, invoices, documents sent as PDF
- **Phone** — Coordination for surveys, maintenance
- **Manual uploads** — Supplier invoices uploaded by Triangle Black staff

### V2 Partner Portal Design

| Feature | Description |
|---------|-------------|
| Supplier Dashboard | View POs, submit invoices, track payments |
| Contractor Dashboard | View assigned projects, submit reports |
| Document Sharing | Upload/download project documents |
| Notification Center | In-app notifications for POs, approvals |
| Self-Service Profile | Company info, bank details, contacts |
| Rate Card Management | Suppliers maintain pricing |

### Access Rules

| Data | Supplier | Contractor | Consultant |
|------|----------|------------|------------|
| Their POs only | ✅ | ❌ | ❌ |
| Their invoices only | ✅ | ❌ | ❌ |
| Their assigned projects | ❌ | ✅ | ✅ |
| Project documents (assigned) | ❌ | ✅ | ✅ |
| Other suppliers' data | ❌ | ❌ | ❌ |
| Client contact info | ❌ | Project-only | Project-only |

### Security

| Control | Implementation |
|---------|---------------|
| Data isolation by partner ID | Row-level security |
| API access scoped to partner | JWT with partner context |
| Rate limiting per partner | 60 req/min |
| Session timeout | 30 min inactivity |
| Audit all partner actions | Integration log |

---

## 15 — Public Developer Platform (Future)

### Vision

Open Triangle Black APIs for third-party developers to build on the platform.

### Components

| Component | V2/V3 |
|-----------|-------|
| Developer Portal | V3 |
| Public API | V3 |
| OpenAPI 3.0 Specification | V2 (internal first) |
| Sandbox Environment | V3 |
| API Explorer (Swagger UI) | V1 (internal) → V3 (public) |
| SDK Generation | V3 |
| Rate Limits (Public) | V3 |
| API Key Self-Service | V3 |
| Usage Analytics | V3 |

### Marketplace APIs (V3+)

| API | Description |
|-----|-------------|
| Quotation API | Third-party submit quotations for subcontracting |
| Service Request API | Hotels submit maintenance requests |
| Project Status API | Real-time project tracking |
| Document API | Upload/download project documents |
| Schedule API | View available engineer slots |

---

## 16 — Future Integrations

### IoT & Smart Building

| Integration | Purpose | Value | Horizon |
|-------------|---------|-------|---------|
| BMS (Building Management) | HVAC, lighting, energy monitoring | Predictive maintenance, energy savings | V3+ |
| IoT Sensors | Temperature, humidity, vibration | Condition-based maintenance | V3+ |
| Smart Meters | Energy, water consumption | Sustainability reporting | V3+ |
| BMS Protocols | BACnet, Modbus, KNX | Direct building system integration | V3+ |

### AI Providers

| Integration | Purpose | Horizon |
|-------------|---------|---------|
| OpenAI / Azure OpenAI | Natural language agents, document analysis | V2 |
| Google Vertex AI | Vision AI for site photo analysis | V2 |
| Anthropic Claude | Contract analysis, compliance checking | V2 |
| Custom ML Models | Lead scoring, anomaly detection | V1 (rule-based) |

### Voice & Conversational

| Integration | Purpose | Horizon |
|-------------|---------|---------|
| WhatsApp Interactive | Bidirectional conversation | V2 |
| Voice Assistant (Alexa, Google) | Voice-based service requests | V3+ |
| Chatbot (client portal) | FAQ, request status | V2 |

### Predictive Maintenance

| Integration | Purpose | Horizon |
|-------------|---------|---------|
| Machine data ingestion | Equipment runtime, alerts | V3+ |
| Vibration analysis | Predictive failure detection | V3+ |
| Thermal imaging | Electrical system health | V3+ |

---

## Integration Governance Board

| Role | Responsibility |
|------|---------------|
| Integration Architect | Design integration boundaries, ACL contracts |
| Security Lead | Review integration security, threat model |
| Domain Owner | Approve integration impact on domain |
| Finance Lead | Approve integration costs, ROI |
| CTO | Strategic integration decisions, vendor lock-in avoidance |

### Review Process

| Gate | When | Criteria |
|------|------|----------|
| ADR | New integration required | Business case, alternatives, risks |
| Design Review | Before development | Contract, ACL, security, monitoring |
| Security Review | Before production | Threat model, secret handling, audit |
| Post-Launch Review | 30 days after | Performance, issues, improvements |

### ADR Template (Integration)

```markdown
# ADR-{NNN}: {Integration Name}

## Context
Why is this integration needed?

## Decision
Which integration approach?

## Alternatives Considered
What else was evaluated?

## Consequences
What changes downstream?

## Risks
What could go wrong?

## Compliance
✓ No vendor lock-in
✓ Startup budget
✓ API standards
✓ Security requirements
```

---

## Phase 7 Completion Checklist

| Criteria | Status |
|----------|--------|
| ✓ Business Alignment | All integrations serve a documented business need |
| ✓ Hospitality Alignment | PMS integration roadmap for Egypt market |
| ✓ DDD Alignment | Context map with ACLs for every external system |
| ✓ Security | Encryption, auth, secrets, zero trust designed |
| ✓ Startup Budget | V1 integrations use existing infrastructure ($0-40/mo) |
| ✓ Scalability | Integration patterns support growth without redesign |
| ✓ Future SaaS Readiness | Multi-tenant identity, public API roadmap |
| ✓ Traceability | Every integration mapped to Phase 6 domain |
| ✓ No Vendor Lock-in | ACLs isolate internal domains from vendor schemas |
| ✓ API Standards | Consistent REST, OpenAPI, versioning, errors |
| ✓ Enterprise Architecture Consistency | Extends, never replaces, frozen baseline |
