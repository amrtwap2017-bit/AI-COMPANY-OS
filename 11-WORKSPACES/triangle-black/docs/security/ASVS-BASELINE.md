# TRIANGLE BLACK — OWASP ASVS LEVEL 1 BASELINE
Date: 2026-09-08
Status: PARTIAL — Evidence-based

## V1: Architecture
| Control | Status | Evidence |
|---------|--------|---------|
| V1.1.1 Secure SDLC | ✅ | CI/CD security-scan job |
| V1.2.1 Auth boundaries | ✅ | JWT required — 56 routes swept V9-003 |
| V1.4.1 Access controls | ✅ | Role-based JWT |

## V2: Authentication
| Control | Status | Evidence |
|---------|--------|---------|
| V2.1.1 Passwords hashed | ✅ | bcrypt in src/core/auth.py |
| V2.2.1 Anti-automation | ✅ | Login rate limiting |
| V2.5.4 No default passwords | ✅ | Env-based only |

## V4: Access Control
| Control | Status | Evidence |
|---------|--------|---------|
| V4.1.2 Deny by default | ✅ | All routes 401 without JWT |
| V4.1.3 Tenant isolation | ⚠️ | hotel_id from JWT, adversarial test pending |
| V4.2.1 Trusted data | ✅ | hotel_id from JWT not request body |

## V5: Validation
| Control | Status | Evidence |
|---------|--------|---------|
| V5.2.1 SQL injection | ✅ | SQLAlchemy parameterized queries |

## V9: Communications
| Control | Status | Evidence |
|---------|--------|---------|
| V9.1.1 TLS | ❌ | Needs production VM |
| V9.2.2 HSTS | ❌ | Nginx config ready, not deployed |

## CRITICAL GAPS
1. TLS — production VM required
2. Tenant isolation adversarial certification
3. Security headers not deployed
