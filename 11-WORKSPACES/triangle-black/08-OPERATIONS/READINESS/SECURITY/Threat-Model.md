# 05 — Threat Model

> Security threat model for Triangle Black platform.

## Reference Documents

| Source | File | Relevance |
|--------|------|-----------|
| PHASE-03 | Security-Architecture.md | Security architecture |
| PHASE-04 | Security-Standards.md | Security standards |

## Assets

| Asset | Sensitivity | Location | Impact if Compromised |
|-------|-------------|----------|----------------------|
| Customer data (PII) | High | PostgreSQL (encrypted at rest) | Regulatory fines, reputation damage |
| Financial data | High | PostgreSQL | Financial loss, fraud |
| JWT signing key | Critical | Environment variable | Full system compromise |
| Database credentials | Critical | Environment variable | Data breach |
| API keys | High | Environment variable | Unauthorized API access |

## Threat Matrix (STRIDE)

| Threat | Asset | Risk | Mitigation | Status |
|--------|-------|------|------------|--------|
| **S**poofing | JWT tokens | High | HS256 signing, short expiry | ❌ |
| **T**ampering | API payloads | Medium | HTTPS, input validation | ❌ |
| **R**epudiation | Audit trail | Medium | Immutable audit log | ❌ |
| **I**nformation disclosure | Tenant data | High | Schema isolation, RBAC | ❌ |
| **D**enial of service | API endpoints | Medium | Rate limiting | ❌ |
| **E**levation of privilege | Roles/Permissions | High | Strict RBAC enforcement | ❌ |

## Attack Scenarios

| Scenario | Likelihood | Impact | Mitigation |
|----------|-----------|--------|------------|
| Attacker steals JWT token | Medium | High | Short expiry, refresh rotation |
| SQL injection via API | Low | Critical | Prisma parameterized queries |
| Cross-tenant data access | Low | Critical | Schema isolation per tenant |
| Brute force login | Medium | Medium | Rate limiting, account lockout |

## Sign-Off

| Role | Name | Signature | Date |
|------|------|-----------|------|
| Security Lead | | | |

**Status:** ❌ NOT COMPLETED
