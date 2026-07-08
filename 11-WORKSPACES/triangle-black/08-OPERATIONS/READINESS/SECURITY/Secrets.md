# 05 — Secrets Management

> Secrets management policy and verification.

## Reference Documents

| Source | File | Relevance |
|--------|------|-----------|
| PHASE-04 | Security-Standards.md | Secrets management |
| PHASE-05 | Security-Foundation.md | Secrets in env vars |

## Secrets Inventory

| Secret | Used By | Storage | Rotated | Status |
|--------|---------|---------|---------|--------|
| JWT_SECRET | API (auth) | .env / CI secret | Per deploy | ❌ |
| JWT_REFRESH_SECRET | API (auth) | .env / CI secret | Per deploy | ❌ |
| DATABASE_URL | API, Worker | .env / CI secret | — | ❌ |
| POSTGRES_PASSWORD | PostgreSQL | .env / CI secret | — | ❌ |
| SMTP_PASSWORD | API (email) | .env / CI secret | — | ❌ |
| WHATSAPP_API_KEY | API (messaging) | .env / CI secret | — | ❌ |
| DO_SPACES_ACCESS_KEY | API (storage) | .env / CI secret | — | ❌ |
| DO_SPACES_SECRET_KEY | API (storage) | .env / CI secret | — | ❌ |

## Secrets Policy

- [ ] No secrets stored in codebase (verified by automated scan)
- [ ] All secrets in .env.example with placeholder values
- [ ] Production secrets injected via CI/CD secrets
- [ ] Secrets rotated on security incident
- [ ] JWT signing keys rotated each deployment
- [ ] Database passwords rotated quarterly
- [ ] Access to production secrets logged and audited
- [ ] Secrets never written to logs or error messages

## Sign-Off

| Role | Name | Signature | Date |
|------|------|-----------|------|
| Security Lead | | | |

**Status:** ❌ NOT VERIFIED
