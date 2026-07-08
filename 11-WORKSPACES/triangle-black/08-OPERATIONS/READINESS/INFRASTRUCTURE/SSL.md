# 06 — SSL

> SSL/TLS configuration validation.

## Reference Documents

| Source | File | Relevance |
|--------|------|-----------|
| PHASE-04 | DevOps-Architecture.md | SSL termination |
| PHASE-05 | DevOps-Foundation.md | Nginx + SSL |

## SSL Configuration

| Domain | Certificate | Issuer | Expiry | Status |
|--------|------------|--------|--------|--------|
| app.triangleblack.com | Let's Encrypt | certbot | — | ❌ |
| *.app.triangleblack.com | Let's Encrypt | certbot | — | ❌ |
| staging.triangleblack.com | Let's Encrypt | certbot | — | ❌ |

## Validation

- [ ] SSL certificate issued for all domains
- [ ] Auto-renewal configured (certbot cron)
- [ ] TLS 1.3 only (no TLS < 1.2)
- [ ] Strong cipher suites configured
- [ ] HSTS header configured (max-age=31536000; includeSubDomains)
- [ ] SSL Labs test result >= A
- [ ] Certificate chain complete (no missing intermediates)
- [ ] OCSP stapling configured

## Sign-Off

| Role | Name | Signature | Date |
|------|------|-----------|------|
| DevOps Lead | | | |

**Status:** ❌ NOT CONFIGURED
