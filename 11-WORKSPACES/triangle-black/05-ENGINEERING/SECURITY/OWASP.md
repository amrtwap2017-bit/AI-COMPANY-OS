# OWASP Top 10 Mitigation Strategies

## Overview

This document maps each OWASP Top 10 (2021) risk to specific mitigations implemented in the Triangle Black platform. Each mitigation references the relevant code, configuration, or architectural decision.

---

## A01: Broken Access Control

**Risk:** Users can act outside their intended permissions.

### Mitigations

| Control | Implementation | Location |
|---------|---------------|----------|
| RBAC permission matrix | Every endpoint guarded by `@RequirePermissions()` | `15-Security/Authorization.md` |
| Tenant isolation middleware | `TenantResolverMiddleware` switches schema per request | `Authorization.md` |
| Resource ownership checks | `ResourceOwnerGuard` verifies user owns resource | `Authorization.md` |
| Default deny | All endpoints deny by default; only explicitly allowed actions pass | NestJS global guard |
| JWT with embedded permissions | Token contains explicit permission list, verified per request | `15-Security/Authentication.md` |
| No IDOR | Resource access requires generated UUIDs; sequential IDs not exposed | Backend architecture |
| CORS | Restricted to `app.triangleblack.com` | `14-Infrastructure/Nginx.md` |

### Testing

```bash
# Test cross-tenant access
TOKEN_A=$(get_token tenant_a_user)
curl -H "Authorization: Bearer $TOKEN_A" https://api.triangleblack.com/api/tenants/tenant_b/properties
# Expected: 403 Forbidden

# Test IDOR
TOKEN_USER=$(get_token regular_user)
curl -H "Authorization: Bearer $TOKEN_USER" https://api.triangleblack.com/api/admin/users
# Expected: 403 Forbidden
```

---

## A02: Cryptographic Failures

**Risk:** Sensitive data exposed due to weak or missing encryption.

### Mitigations

| Control | Implementation | Location |
|---------|---------------|----------|
| TLS 1.2/1.3 | All external traffic encrypted | `15-Security/Encryption.md` |
| HSTS | `max-age=63072000` | `14-Infrastructure/Nginx.md` |
| Password hashing | bcrypt with 12 rounds | `15-Security/Authentication.md` |
| No sensitive data in URLs | POST bodies, never query parameters | API standards |
| Encrypted backups | GPG encryption on backup files | `15-Security/Encryption.md` |
| Secure headers | `X-Content-Type-Options`, `X-Frame-Options`, etc. | `14-Infrastructure/Nginx.md` |
| No credit card storage | All payments via Stripe (tokenization) | Architecture decision |

### Testing

```bash
# Verify TLS
curl -sI https://triangleblack.com | grep -i "strict-transport-security"

# Check for sensitive data in URLs
docker exec tb-nginx grep "password\|token\|secret" /var/log/nginx/access.log | head -5
# Expected: empty or very few
```

---

## A03: Injection

**Risk:** SQL, NoSQL, OS command injection.

### Mitigations

| Control | Implementation | Location |
|---------|---------------|----------|
| Parameterized queries | Prisma ORM uses parameterized queries by default | 10-Database |
| Input validation | Class-validator DTOs on all endpoints | Backend modules |
| Output encoding | React/Next.js auto-escapes XSS | Frontend framework |
| No dynamic SQL | All queries via Prisma; no raw SQL concatenation | Backend convention |
| WAF injection rules | Cloudflare WAF with OWASP CRS | `14-Infrastructure/Cloudflare.md` |
| Rate limiting | Reduces automated injection attempts | `14-Infrastructure/Nginx.md` |

### Testing

```bash
# Basic SQL injection test
curl "https://api.triangleblack.com/api/properties?id=1' OR '1'='1"
# Expected: 400 Bad Request or 403 (WAF)

# NoSQL injection (if MongoDB were used)
# Not applicable — PostgreSQL only
```

---

## A04: Insecure Design

**Risk:** Design flaws that enable attacks.

### Mitigations

| Control | Implementation | Location |
|---------|---------------|----------|
| Threat modeling | STRIDE analysis completed before development | `15-Security/Threat-Model.md` |
| Secure by default | New features require explicit security review | Engineering standards |
| Rate limiting | Auth: 10/min, API: 30/min | `14-Infrastructure/Nginx.md` |
| Account lockout | After 5 failed attempts, 15-minute lockout | `15-Security/Authentication.md` |
| Password policy | 12+ characters, complexity requirements | `15-Security/Authentication.md` |
| Session management | Short-lived access tokens (15 min), refresh tokens with rotation | `15-Security/Authentication.md` |

---

## A05: Security Misconfiguration

**Risk:** Default or insecure configurations.

### Mitigations

| Control | Implementation | Location |
|---------|---------------|----------|
| No default credentials | All passwords generated randomly on setup | `15-Security/Secrets.md` |
| Server tokens off | `server_tokens off` in Nginx | `14-Infrastructure/Nginx.md` |
| Minimal surface | Only ports 22, 80, 443 exposed via UFW | `14-Infrastructure/Ubuntu.md` |
| Container security | Non-root user in all containers | `14-Infrastructure/Docker.md` |
| Directory listing off | `autoindex off` in Nginx | `14-Infrastructure/Nginx.md` |
| Debug disabled | `NODE_ENV=production`, no debug endpoints | Docker Compose env |
| Cloudflare security | Bot Fight Mode, WAF, Rate Limiting enabled | `14-Infrastructure/Cloudflare.md` |

---

## A06: Vulnerable and Outdated Components

**Risk:** Known vulnerabilities in dependencies.

### Mitigations

| Control | Implementation | Location |
|---------|---------------|----------|
| Regular updates | Monthly `apt update && apt upgrade` | `14-Infrastructure/Ubuntu.md` |
| Docker image scanning | `docker scout quickcheck` in CI | `14-Infrastructure/Docker.md` |
| Alpine base images | Minimal attack surface | `14-Infrastructure/Docker.md` |
| npm audit | Run in CI pipeline | Engineering standards |
| Unattended security upgrades | Automatic kernel/OS patches | `14-Infrastructure/Ubuntu.md` |
| Version pinning | Exact versions in `package-lock.json` | Backend/Frontend |
| Container rebuild | Monthly rebuild to pick up base image updates | DevOps schedule |

### Dependency Check

```bash
# Scan for known vulnerabilities
docker scout quickcheck triangleblack/backend:latest
docker scout quickcheck triangleblack/frontend:latest

# npm audit
cd backend && npm audit
cd frontend && npm audit
```

---

## A07: Identification and Authentication Failures

**Risk:** Weak authentication mechanisms.

### Mitigations

| Control | Implementation | Location |
|---------|---------------|----------|
| Strong password policy | 12+ chars, complexity, common password check | `15-Security/Authentication.md` |
| Account lockout | 5 failed attempts → 15 min lockout | `15-Security/Authentication.md` |
| Rate limiting | 10 attempts/min on login endpoint | `14-Infrastructure/Nginx.md` |
| JWT with short expiry | Access tokens: 15 min | `15-Security/Authentication.md` |
| Refresh token rotation | Old token invalidated on refresh | `15-Security/Authentication.md` |
| Secure cookie flags | HttpOnly, Secure, SameSite=Strict | `15-Security/Authentication.md` |
| Password hashing | bcrypt (12 rounds) | `15-Security/Authentication.md` |
| No password exposure | Passwords never logged, never in URLs | Backend convention |

---

## A08: Software and Data Integrity Failures

**Risk:** Tampered code or data.

### Mitigations

| Control | Implementation | Location |
|---------|---------------|----------|
| Signed commits | All commits GPG-signed | Engineering standards |
| CI/CD pipeline | Automated build and test before deployment | 18-Deployment |
| Docker image tags | Versioned tags with git SHA | `14-Infrastructure/Docker.md` |
| Audit log chain | SHA-256 chain prevents log tampering | `15-Security/Audit.md` |
| Backup checksum | SHA-256 checksum on backup files | `14-Infrastructure/Backup.md` |
| Code review | Every PR requires approval | Engineering standards |
| Dependency lock files | `package-lock.json` prevents supply chain attacks | Backend/Frontend |

---

## A09: Security Logging and Monitoring Failures

**Risk:** Inability to detect or investigate breaches.

### Mitigations

| Control | Implementation | Location |
|---------|---------------|----------|
| Comprehensive audit logging | All auth, data access, security events logged | `15-Security/Audit.md` |
| Log immutability | Chain-based integrity verification | `15-Security/Audit.md` |
| Uptime monitoring | External monitoring (Uptime Robot) | `14-Infrastructure/Monitoring.md` |
| Fail2ban | SSH brute force protection | `14-Infrastructure/Ubuntu.md` |
| WAF alerts | Cloudflare security event notifications | `14-Infrastructure/Cloudflare.md` |
| Resource monitoring | Disk, memory, CPU alerts | `14-Infrastructure/Monitoring.md` |
| Backup monitoring | Daily backup verification | `14-Infrastructure/Backup.md` |

---

## A10: Server-Side Request Forgery (SSRF)

**Risk:** Server makes requests to internal services on attacker's behalf.

### Mitigations

| Control | Implementation | Location |
|---------|---------------|----------|
| Network segmentation | Internal services on isolated Docker networks | `14-Infrastructure/DockerCompose.md` |
| Outbound firewall | UFW default deny outgoing (reviewed rules) | `14-Infrastructure/Ubuntu.md` |
| URL allowlist | If webhook/fetch features added, restrict to allowlisted URLs | Backend design |
| No direct user URL input | File uploads use server-generated paths, not user-supplied URLs | Backend convention |
| Internal-only ports | PostgreSQL (5432) bound to 127.0.0.1 only | `14-Infrastructure/DockerCompose.md` |
| Cloudflare WAF | SSRF detection rules | `14-Infrastructure/Cloudflare.md` |

---

## Continuous Validation

### Automated Security Testing

| Test | Tool | Frequency |
|------|------|-----------|
| Dependency scanning | `npm audit`, Snyk | Every PR |
| Container scanning | Docker Scout | Every build |
| SAST (Static Analysis) | ESLint security plugin | Every commit |
| DAST (Dynamic Analysis) | OWASP ZAP (basic) | Monthly |
| WAF bypass testing | Manual | Quarterly |
| Penetration testing | External firm | Annually (V2+) |

### Security Checklist Before Release

- [ ] All OWASP Top 10 mitigations verified
- [ ] No secrets in repository
- [ ] TLS certificates valid
- [ ] WAF rules active and tested
- [ ] Audit logging operational
- [ ] Rate limiting configured
- [ ] Backups running and verified
- [ ] All dependencies scanned for CVEs
- [ ] Container images scanned
- [ ] Firewall rules verified
- [ ] Default credentials changed
- [ ] Debug/development endpoints disabled
