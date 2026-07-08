# 05 — Encryption

> Encryption standards and verification.

## Reference Documents

| Source | File | Relevance |
|--------|------|-----------|
| PHASE-03 | Security-Architecture.md | Encryption layers |
| PHASE-04 | Security-Standards.md | Encryption requirements |

## Encryption in Transit

| Channel | Protocol | Certificate | Status |
|---------|----------|-------------|--------|
| Browser → Nginx | TLS 1.3 | Let's Encrypt | ❌ |
| Nginx → API (internal) | HTTP (internal network) | — | ❌ |
| API → PostgreSQL | TLS 1.3 | Self-signed | ❌ |
| API → External (ETA, etc.) | TLS 1.2+ | Public CA | ❌ |

## Encryption at Rest

| Storage | Encryption | Key Management | Status |
|---------|-----------|---------------|--------|
| PostgreSQL data | Filesystem encryption (V2) | — | ❌ |
| File uploads (DO Spaces) | Server-side encryption | DO managed | ❌ |
| Backups (DO Spaces) | Server-side encryption | DO managed | ❌ |
| Logs | None (V1 — no sensitive data in logs) | — | ❌ |

## Password Hashing

| Algorithm | Rounds | Used For | Status |
|-----------|--------|----------|--------|
| bcrypt | 12 | User passwords | ✅ Built |

## Validation

- [ ] TLS 1.3 enforced (no TLS < 1.2)
- [ ] SSL certificate auto-renewal configured
- [ ] HSTS header configured
- [ ] Passwords always hashed, never stored in plaintext
- [ ] No hardcoded encryption keys in code

## Sign-Off

| Role | Name | Signature | Date |
|------|------|-----------|------|
| Security Lead | | | |

**Status:** ❌ NOT VERIFIED
