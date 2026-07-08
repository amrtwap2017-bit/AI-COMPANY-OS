# Threat Model

## Methodology

This threat model uses **STRIDE** (Spoofing, Tampering, Repudiation, Information Disclosure, Denial of Service, Elevation of Privilege) applied to the Triangle Black platform architecture.

## Assets

| ID | Asset | Sensitivity | Location |
|----|-------|-------------|----------|
| A1 | Tenant data (hotel operations, financial, guest info) | Critical | PostgreSQL (schema-per-tenant) |
| A2 | User credentials (password hashes) | Critical | PostgreSQL (public schema) |
| A3 | JWT signing secret | Critical | Environment variable |
| A4 | Database connection string | Critical | Environment variable |
| A5 | Encryption keys | Critical | Environment variable |
| A6 | Business logic (pricing, workflows) | High | Application code + database |
| A7 | Uploaded documents (contracts, reports) | High | Docker volume / local disk |
| A8 | Audit logs | High | PostgreSQL (audit schema) |
| A9 | API keys (SendGrid, Stripe, etc.) | Critical | Environment variable |
| A10 | Session tokens | Medium | Redis cache |
| A11 | Application source code | Medium | Git repository |
| A12 | Infrastructure configuration | Medium | Git repository |

## Trust Boundaries

```
┌─────────────┐     ┌───────────────┐     ┌──────────────────┐
│  Internet    │────►│  Cloudflare    │────►│  Nginx            │
│  (untrusted) │     │  (semi-trusted)│     │  (trusted)        │
└─────────────┘     └───────────────┘     └────────┬──────────┘
                                                    │
                              ┌─────────────────────┼──────────────┐
                              │                     │              │
                         ┌────┴────┐          ┌─────┴─────┐       │
                         │ Frontend│          │  Backend   │       │
                         │(trusted)│          │ (trusted)  │       │
                         └─────────┘          └─────┬──────┘       │
                                                     │              │
                                              ┌──────┴──────┐      │
                                              │  PostgreSQL  │      │
                                              │  (trusted)   │      │
                                              └─────────────┘      │
```

## STRIDE Analysis

### Spoofing

| Threat | Asset | Attack Vector | Likelihood | Impact | Mitigation |
|--------|-------|---------------|------------|--------|------------|
| S1: User impersonation via stolen password | A2, A10 | Phishing, credential stuffing, weak passwords | High | Critical | Password policy, rate limiting, MFA (V2) |
| S2: JWT token forgery | A1, A3 | Weak JWT secret, algorithm confusion | Low | Critical | Strong secret (256-bit), RS256 signing, short expiry |
| S3: DNS spoofing | A1 | Man-in-the-middle | Low | High | Cloudflare DNS, HSTS, certificate pinning |
| S4: Email spoofing | - | Fake sender address | Medium | Medium | SPF, DKIM, DMARC records |

### Tampering

| Threat | Asset | Attack Vector | Likelihood | Impact | Mitigation |
|--------|-------|---------------|------------|--------|------------|
| T1: Data modification via SQL injection | A1 | Unsanitized input | Low | Critical | Prisma parameterized queries, WAF, input validation |
| T2: Log manipulation | A8 | Direct DB access | Low | High | Append-only audit logs, log monitoring |
| T3: Configuration tampering | A12 | Compromised deploy user | Low | High | Git-based config, CI/CD pipeline, signed commits |
| T4: Uploaded file manipulation | A7 | Malicious file upload | Medium | Medium | File type validation, virus scanning, size limits |

### Repudiation

| Threat | Asset | Attack Vector | Likelihood | Impact | Mitigation |
|--------|-------|---------------|------------|--------|------------|
| R1: User denies actions | A8 | No audit trail | Medium | High | Comprehensive audit logging with user ID, timestamp, action |
| R2: Admin denies privilege escalation | A8 | No access control logging | Low | Critical | Immutable audit logs for role/permission changes |
| R3: API consumer denies request | A8 | No request logging | Medium | Medium | Request/response logging for write operations |

### Information Disclosure

| Threat | Asset | Attack Vector | Likelihood | Impact | Mitigation |
|--------|-------|---------------|------------|--------|------------|
| I1: Cross-tenant data access | A1 | Broken access control, schema bypass | Low | Critical | Schema-per-tenant, tenant resolver middleware, RBAC |
| I2: API data leakage | A1 | Excessive response data, debug endpoints | Medium | High | DTOs, no debug in production, response trimming |
| I3: Error message leakage | A1 | Verbose error responses | Medium | Medium | Generic error messages, structured logging |
| I4: Log exposure | A8 | Logs accessible to unauthorized users | Medium | High | Log access control, no sensitive data in logs |
| I5: Backup exposure | A1 | Unencrypted backup files | Low | Critical | Encrypted backups, access control on backup directory |

### Denial of Service

| Threat | Asset | Attack Vector | Likelihood | Impact | Mitigation |
|--------|-------|---------------|------------|--------|------------|
| D1: Application DDoS | A1, A6 | HTTP flood, slow loris | Medium | High | Cloudflare DDoS protection, rate limiting, WAF |
| D2: Database exhaustion | A1 | Connection pool exhaustion, slow queries | Medium | High | Connection pooling, query timeout, max_connections |
| D3: Resource starvation | A6 | Memory leak, CPU exhaustion | Low | Medium | Docker resource limits, health checks, auto-restart |
| D4: Storage exhaustion | A7 | Unbounded file uploads | Medium | Medium | File size limits, storage monitoring, rotation |

### Elevation of Privilege

| Threat | Asset | Attack Vector | Likelihood | Impact | Mitigation |
|--------|-------|---------------|------------|--------|------------|
| E1: Role escalation | A1 | Insecure direct object reference, missing checks | Medium | Critical | Centralized authorization guard, permission matrix |
| E2: Admin account takeover | A1, A2 | Weak admin password, no MFA | Low | Critical | Strong admin password policy, MFA (V2), IP allowlist |
| E3: Container escape | A1 | Vulnerable container | Low | Critical | Non-root user in containers, read-only filesystem |
| E4: SSRF to internal services | A1, A4 | Server-side request forgery | Medium | High | Outbound traffic restrictions, URL allowlist |

## Risk Matrix

| ID | Threat | Likelihood | Impact | Risk | Priority |
|----|--------|------------|--------|------|----------|
| S1 | User impersonation | High | Critical | **Critical** | P0 |
| E1 | Role escalation | Medium | Critical | **Critical** | P0 |
| I1 | Cross-tenant data | Low | Critical | **High** | P0 |
| I5 | Backup exposure | Low | Critical | **High** | P0 |
| T1 | SQL injection | Low | Critical | **High** | P0 |
| D1 | Application DDoS | Medium | High | **High** | P1 |
| R1 | Deny actions | Medium | High | **High** | P1 |
| I2 | API data leakage | Medium | High | **High** | P1 |
| D2 | Database exhaustion | Medium | High | **High** | P1 |
| E4 | SSRF | Medium | High | **High** | P1 |
| E2 | Admin takeover | Low | Critical | **High** | P1 |
| E3 | Container escape | Low | Critical | **High** | P1 |
| S4 | Email spoofing | Medium | Medium | **Medium** | P1 |
| S2 | JWT forgery | Low | Critical | **High** | P2 |
| T4 | Malicious upload | Medium | Medium | **Medium** | P2 |
| D3 | Resource starvation | Low | Medium | **Low** | P2 |
| D4 | Storage exhaustion | Medium | Medium | **Medium** | P2 |
| I3 | Error leakage | Medium | Medium | **Medium** | P2 |
| T2 | Log manipulation | Low | High | **Medium** | P2 |
| I4 | Log exposure | Medium | Medium | **Medium** | P2 |
| T3 | Config tampering | Low | High | **Medium** | P2 |
| S3 | DNS spoofing | Low | High | **Medium** | P2 |
| R3 | API consumer denial | Medium | Medium | **Medium** | P3 |

## Attack Trees

### Cross-Tenant Data Access (I1)

```
Goal: Access another tenant's data
├── 1. Bypass tenant resolver
│   ├── 1.1 Inject tenant ID in request
│   │   └── Mitigation: Server-side tenant ID from JWT, not request
│   ├── 1.2 Modify JWT tenant claim
│   │   └── Mitigation: JWT signature verification, short expiry
│   └── 1.3 Access schema directly
│       └── Mitigation: DB accessible only from backend container
├── 2. Exploit API
│   ├── 2.1 IDOR in URL parameters
│   │   └── Mitigation: Ownership checks in all data access
│   └── 2.2 GraphQL batch query (future)
│       └── Mitigation: Query depth limiting, auth on field level
└── 3. Access backup files
    └── Mitigation: Encrypted backups, restricted access
```

### Privilege Escalation (E1)

```
Goal: Elevate from user to admin
├── 1. Exploit RBAC bypass
│   ├── 1.1 Direct API call to admin endpoint
│   │   └── Mitigation: Guard/Interceptor on every protected route
│   ├── 1.2 Modify role in database
│   │   └── Mitigation: Role changes logged, no direct DB access
│   └── 1.3 Self-assign admin role
│       └── Mitigation: Role assignment restricted to super-admin
├── 2. Exploit JWT
│   ├── 2.1 Modify role claim in token
│   │   └── Mitigation: JWT signed server-side, verified on every request
│   └── 2.2 Replay old token with elevated privileges
│       └── Mitigation: Short expiry (15 min), refresh token rotation
└── 3. Social engineering admin
    └── Mitigation: Training, multi-person approval for role changes
```
