# Triangle Black — Security Map V6
*Standard: OWASP ASVS 5.0 | OWASP API Security Top 10 | NIST SSDF*
*Generated: 2026-08-27*

## Authentication (ASVS V2)
| Control | Status | Evidence |
|---|---|---|
| JWT-based authentication | ✅ | get_current_user in core/auth.py |
| Token expiry enforced | ✅ | JWT exp claim verified |
| Invalid token rejected | ✅ | test_invalid_token_rejected passes |
| Bcrypt password hashing | ✅ | hash_password in auth module |

## Authorization (ASVS V4)
| Control | Status | Evidence |
|---|---|---|
| Role-based access | ✅ | Role enum in domain model |
| Tenant isolation on engines | ✅ PARTIAL | 10/13 engines ENFORCED |
| Predictive engine hotel_id | ⚠️ PARTIAL | Needs filter fix |
| Technician engine hotel_id | ⚠️ PARTIAL | Needs filter fix |

## API Security (OWASP API Top 10)
| Risk | Status | Notes |
|---|---|---|
| BOLA/IDOR | ⚠️ PARTIAL | 5 repositories need hotel_id guard on get-by-id |
| Broken Authentication | ✅ | All engines require auth |
| Mass Assignment | ✅ | Pydantic schemas enforce fields |
| Unrestricted Resource | ✅ | Rate limiting in place |
| SQL Injection | ✅ | SQLAlchemy ORM prevents raw SQL |
| Sensitive Data Exposure | ✅ | No passwords/secrets in responses |
| SSRF | ✅ | No external URL fetching from user input |

## Tenant Isolation Detail
| Engine | Status |
|---|---|
| PM Engine | ✅ ENFORCED |
| SLA Engine | ✅ ENFORCED |
| Asset Engine | ✅ ENFORCED |
| Supplier Engine | ✅ ENFORCED |
| Procurement Engine | ✅ ENFORCED |
| Executive Engine | ✅ ENFORCED |
| Cost Engine | ✅ ENFORCED |
| Risk Engine | ✅ ENFORCED |
| Backlog Engine | ✅ ENFORCED |
| Workflow Admin | ✅ ENFORCED |
| Technician Engine | ⚠️ PARTIAL |
| Trend Engine | ✅ ENFORCED |
| Predictive Engine | ⚠️ PARTIAL |

## BOLA Risk Register
| Repository | Risk | Fix Required |
|---|---|---|
| work_orders/repository.py | get by ID without hotel_id | Add hotel_id filter |
| notifications/repository.py | get by ID without hotel_id | Add hotel_id filter |
| lead_management/repository.py | get by ID without hotel_id | Add hotel_id filter |
| vendor_portal/repository.py | get by ID without hotel_id | Add hotel_id filter |
| inventory_alerts/repository.py | get by ID without hotel_id | Add hotel_id filter |
| core/auth.py | User by JWT sub | ✅ LEGITIMATE — auth only |
| commercial/auth/router.py | User by JWT sub | ✅ LEGITIMATE — auth only |
