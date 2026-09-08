# TRIANGLE BLACK — OWASP ASVS LEVEL 1 BASELINE
Date: 2026-09-08
Version: ASVS 4.0 Level 1
Status: PARTIAL — Evidence-based assessment

## V1: Architecture

| Control | Status | Evidence |
|---------|--------|---------|
| V1.1.1 Secure SDLC | ✅ | CI/CD with security-scan job |
| V1.2.1 Auth boundaries | ✅ | JWT required on all mutations |
| V1.2.4 Trusted services | ⚠️ | hotel_id from JWT, some inline routes had fallback |
| V1.4.1 Access controls | ✅ | Role-based via JWT |

## V2: Authentication

| Control | Status | Evidence |
|---------|--------|---------|
| V2.1.1 User passwords | ✅ | bcrypt hashing in auth.py |
| V2.2.1 Anti-automation | ✅ | Login rate limiting |
| V2.3.1 Initial passwords | ⚠️ | Demo credentials in .env.local (gitignored) |
| V2.5.4 No default passwords | ✅ | Env-based, no hardcoded prod passwords |

## V3: Session Management

| Control | Status | Evidence |
|---------|--------|---------|
| V3.2.1 Signed tokens | ✅ | JWT HS256 with TB_SECRET_KEY |
| V3.2.2 Token secret strength | ✅ | 64-char token_hex generated |
| V3.4.1 Cookie security | N/A | API uses Bearer tokens |

## V4: Access Control

| Control | Status | Evidence |
|---------|--------|---------|
| V4.1.1 Principle of least privilege | ⚠️ | Roles exist, not all enforced at row level |
| V4.1.2 Deny by default | ✅ | All routes return 401 without JWT |
| V4.1.3 Tenant isolation | ⚠️ | hotel_id scoped, adversarial test needed |
| V4.2.1 Trusted data | ✅ | hotel_id from JWT, not request body |

## V5: Validation, Sanitization, Encoding

| Control | Status | Evidence |
|---------|--------|---------|
| V5.1.1 HTTP parameter pollution | ✅ | FastAPI validates types |
| V5.2.1 SQL injection | ✅ | SQLAlchemy parameterized queries |
| V5.3.1 Output encoding | ⚠️ | JSON responses, not HTML |

## V7: Error Handling

| Control | Status | Evidence |
|---------|--------|---------|
| V7.1.1 No sensitive data in logs | ✅ | Logs use structured format |
| V7.4.1 Generic errors | ✅ | Exception handlers return standard format |

## V9: Communications

| Control | Status | Evidence |
|---------|--------|---------|
| V9.1.1 TLS for all connections | ❌ | Not yet — needs production VM + cert |
| V9.2.2 HSTS | ❌ | Nginx config ready but not deployed |

## V14: Configuration

| Control | Status | Evidence |
|---------|--------|---------|
| V14.2.1 No unnecessary components | ⚠️ | Review needed |
| V14.3.1 No verbose errors | ✅ | Error format standard |
| V14.3.3 Security headers | ❌ | Nginx config ready but not deployed |

## GAPS REQUIRING IMMEDIATE ACTION

1. TLS — needs production VM
2. Tenant isolation adversarial certification
3. Row-level access control audit
4. Security headers (HSTS, CSP, X-Frame)

## GAPS REQUIRING MEDIUM-TERM ACTION

1. SCIM/SSO (V2 enterprise auth)
2. WAF
3. Intrusion detection
