# Security Reality
## A-001 Audit — August 2026

### Auth Enforcement — VERIFIED
| Endpoint Category | Status |
|-------------------|--------|
| Business data endpoints | ✅ 0 exposed (was 7 this session) |
| Authentication endpoints | ✅ JWT enforced |
| Intelligence endpoints | ✅ JWT enforced |
| Health endpoints | ✅ Intentionally public |
| Onboarding endpoint | ✅ Intentionally public |

### Tenant Isolation — VERIFIED THIS SESSION
| Check | Status |
|-------|--------|
| hotel_id in JWT claims | ✅ FIXED this session |
| New tenant sees own data only | ✅ VERIFIED |
| Default tenant unaffected | ✅ VERIFIED |
| Router tenant coverage | 120/120 = 100% ✅ |

### JWT Design (Current)
Payload: { sub, email, role, type, hotel_id, exp, iat } Algorithm: HS256 Token: tb_access_token (cookie or localStorage)

### Security Test Files
- tests/security/test_tenant_isolation.py (43 tests ✅)
- tests/security/test_auth_boundary.py
- tests/security/test_sql_safety.py
- tests/security/test_security_headers.py
- tests/security/test_cors_jwt.py

### Known Security Gaps
1. 86 broad except blocks — silent failure swallowing
2. 309 raw SQL — not parameterized uniformly
3. No formal OWASP ASVS verification matrix
4. No dependency vulnerability scanning in CI
5. No SBOM generation
6. SSO/SAML is sandbox only

### Security Posture Statement
"Designed and verified against OWASP Top 10 patterns.
Not independently certified against OWASP ASVS."
(Internal verification ≠ external certification)
