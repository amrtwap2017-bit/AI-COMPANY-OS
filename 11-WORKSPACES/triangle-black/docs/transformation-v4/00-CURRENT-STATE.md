# Triangle Black — Current State (August 2026)

## Platform Identity
- **Name**: Triangle Black
- **Type**: Enterprise SaaS — Hotel Engineering Operations
- **Focus**: Sharm El-Sheikh, Egypt hospitality sector
- **Tenant model**: hotel_id (migrating toward organization_id)
- **Repository**: ~/AI-COMPANY-OS/11-WORKSPACES/triangle-black

## Verified Metrics (August 2026)
| Metric | Value |
|--------|-------|
| Backend tests | 1606 passing, 0 failing |
| E2E tests | 181 passing, 0 failing |
| Alembic head | c2d3e4f5a6b7 |
| Sprints completed | 055 → 244 |
| DB tables | 165+ (all Alembic-managed) |
| Backend modules | 80+ in src/commercial/ |
| Portal pages | 270+ |
| Portal portals | 5 (Main/Technician/Supplier/Client/Asset-QR) |
| Commits | 1000+ |

## Architecture Reality
| Layer | Reality |
|-------|---------|
| Backend | FastAPI monolith — NOT yet modular bounded contexts |
| Frontend | Next.js 14 App Router — partial design system adoption |
| Database | PostgreSQL, single-schema, hotel_id tenant isolation |
| Auth | JWT (tb_access_token), form-based login + JSON alias |
| Cache | Redis+memory hybrid (Sprint-197) |
| Logging | JSON structured with correlation IDs (Sprint-199) |
| Rate limiting | Per-tenant middleware (Sprint-195, default OFF) |
| Feature flags | Backend enforcement + React hook + FeatureGate |
| Workflow | TriangleWorkflowEngine — 2 built-in state maps |
| Audit | Non-blocking audit events — 8 routers instrumented |
| Performance | X-DB-Query-Count + X-Response-Time-Ms headers |
| Security | Security headers stack, login rate limiting, JWT env var |

## Implemented Capabilities
| Capability | Status | Evidence |
|-----------|--------|----------|
| Multi-tenancy | PARTIAL | hotel_id only, no org_id |
| DDD compliance | IMPLEMENTED | 27 modules (models/schemas/repo/router) |
| Soft delete | IMPLEMENTED | invoices/contracts/work_orders/leads/quotes |
| Workflow engine | PARTIAL | 2 built-in maps, admin API exists (Sprint-240) |
| Audit trail | PARTIAL | 8 modules, non-blocking try/except |
| Event outbox | MISSING | No platform_events table or dispatcher |
| SLA tracking | MISSING | No sla_hours, sla_breach_at on work_orders |
| Application service layer | MISSING | Routers call repositories directly |
| Security test suite | MISSING | No OWASP/tenant isolation automated tests |
| Organization model | MISSING | No Company/Organization/Site hierarchy |
| Digital Twin projection | MISSING | graph/page.tsx is a placeholder |
| AI Gateway | MISSING | AI calls scattered in routers |
| Read models | MISSING | Dashboard queries hit OLTP directly |
| Performance SLOs | MISSING | Budgets defined in tests but no enforcement |
| Demo/seed tenant | MISSING | No commercial demonstration data |
| E2E vertical slice | PARTIAL | SR→WO→close tested in spec-18 |
| Design system | PARTIAL | TBEDS 7.1 CSS — no token system |
| Redis cache | IMPLEMENTED | Sprint-197, graceful fallback |
| Structured logging | IMPLEMENTED | Sprint-199, JSON + correlation ID |
| Per-tenant rate limit | IMPLEMENTED | Sprint-195, disabled by default |
| Feature flags | IMPLEMENTED | Sprint-201-204 |
| Health endpoints | IMPLEMENTED | /health/live + /health/ready |
| Per-tenant rate limit | IMPLEMENTED | Sprint-195 |
| Input validation | IMPLEMENTED | 153 tests across 16 entity schemas |

## Known Bugs (Accepted)
| Bug | Status |
|-----|--------|
| leads cold/warm status 500 | FIXED Sprint-153 |
| work-orders limit>100 returns 422 | FIXED Sprint-153 |
| activities schema mismatch | FIXED Sprint-128 |
| test_employee_create returns string | WARNING (not failure) |

## Permanently Ignored Tests
- tests/test_invoices.py (wrong architecture imports)
- tests/commercial/test_email_service.py (Base.metadata.create_all)
- tests/commercial/test_lead_management.py (TestClient + wrong DB)
- tests/commercial/test_payment_tracking.py (wrong fixture + imports)
- tests/test_live_api.py (live environment only)
- tests/test_orchestrator/ (separate system)
- tests/commercial/test_inventory_alerts.py (router disabled)
- tests/commercial/test_system_notifications.py (router disabled)
- tests/commercial/test_vendor_portal.py (router disabled)

## Next Priority Gaps
1. SLA tracking on work orders (P1 — core business requirement)
2. Security test suite (P1 — tenant isolation unverified)
3. Event outbox (P1 — AI/Twin/notifications need reliable feed)
4. Application service layer (P1 — architecture seam)
5. Organization_id migration (P1 — SaaS readiness)
