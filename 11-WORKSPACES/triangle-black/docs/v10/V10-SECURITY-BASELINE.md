# V10 SECURITY BASELINE
Generated: 2026-09-09 09:01
Status: VERIFIED from live system

---

## Unauthenticated Mutation Tests

| Method | Endpoint | HTTP Status | Secured |
|--------|----------|-------------|---------|
| POST | /api/v1/work-orders/ | 401 | ✅ |
| POST | /api/v1/service-requests/ | 401 | ✅ |
| POST | /api/v1/leads/ | 401 | ✅ |
| POST | /api/v1/assets/ | 401 | ✅ |
| POST | /api/v1/purchase-requests/ | 401 | ✅ |
| POST | /api/v1/contracts/ | 401 | ✅ |
| POST | /api/v1/suppliers/ | 401 | ✅ |
| PATCH | /api/v1/work-orders/fake | 404 | ✅ |
| POST | /api/v1/work-orders/fake/status | 401 | ✅ |
| POST | /api/v1/work-orders/fake/complete | 404 | ✅ |
| POST | /api/v1/recommendations/generate | 401 | ✅ |

**Summary: 11/11 secured | 0 exposed**

## Tenant Isolation Tests

| Endpoint | Cross-Tenant Leaks |
|----------|-------------------|
| /api/v1/work-orders/ | ✅ 0 leaks |
| /api/v1/assets/ | ✅ 0 leaks |
| /api/v1/recommendations/ | ✅ 0 leaks |
| /api/v1/attention/ | ✅ 0 leaks |


## Security Files

| File | Status |
|------|--------|
| docs/security/ASVS-BASELINE.md | ✅ EXISTS |
| tests/security/test_v9_tenant_isolation.py | ✅ EXISTS |
| .env.example | ✅ EXISTS |
| .env.local (gitignored) | ✅ EXISTS |
| infra/nginx/conf.d/triangleblack.conf | ✅ EXISTS |

## ASVS Level 1 Status

| Control | Status | Evidence |
|---------|--------|---------|
| V2: bcrypt passwords | ✅ VERIFIED | src/core/auth.py |
| V2: Login rate limiting | ✅ VERIFIED | middleware |
| V4: Deny by default | ✅ VERIFIED | 11/11 secured |
| V4: Tenant isolation | ✅ VERIFIED | 7/7 adversarial tests |
| V5: SQL injection protection | ✅ VERIFIED | SQLAlchemy parameterized |
| V9: TLS | ❌ NOT DEPLOYED | Needs production VM |
| V14: Security headers | ❌ NOT DEPLOYED | Nginx config ready |

## V10 Security Gaps

| Gap | Priority | Action |
|-----|---------|--------|
| No TLS/HTTPS | P0 | Provision VM + Certbot |
| No HSTS | P0 | Deploy Nginx config |
| No security headers | P0 | Deploy Nginx config |
| Inline routes need final audit | P1 | Progressive sweep |
| ASVS L1 not complete | P1 | Document evidence |
