# 02 — SSL Validation

> SSL/TLS validation for production deployment.

## Reference Chain

| Source | File | Input |
|--------|------|-------|
| Phase 4 | DevOps-Architecture.md | SSL strategy |
| Phase 8 | 06-INFRASTRUCTURE-READINESS/SSL.md | SSL readiness |

## SSL Certificate Status

| Domain | Certificate | Issuer | Expiry | Days Remaining | Status |
|--------|------------|--------|--------|----------------|--------|
| app.triangleblack.com | Let's Encrypt | certbot | — | — | ❌ |
| *.app.triangleblack.com | Let's Encrypt | certbot | — | — | ❌ |

## Validation Tests

### Certificate Validity
- [ ] Certificate issued and not expired
- [ ] Certificate matches domain name(s)
- [ ] Certificate chain is complete
- [ ] No missing intermediate certificates

### TLS Configuration
- [ ] TLS 1.3 enabled
- [ ] TLS 1.2 enabled (fallback)
- [ ] TLS < 1.2 disabled
- [ ] Strong cipher suites only
- [ ] HSTS header configured (max-age=31536000)
- [ ] OCSP stapling enabled

### Browser Tests
- [ ] Chrome — HTTPS valid, no warnings
- [ ] Firefox — HTTPS valid, no warnings
- [ ] Safari — HTTPS valid, no warnings
- [ ] Edge — HTTPS valid, no warnings

### Automated Tests
- [ ] SSL Labs test: grade ≥ A
- [ ] `curl -vI https://app.triangleblack.com` returns valid cert
- [ ] `openssl s_client -connect app.triangleblack.com:443` shows valid chain

## Renewal

| Configuration | Value | Status |
|--------------|-------|--------|
| Renewal method | certbot (Docker) | ❌ |
| Renewal schedule | Daily cron | ❌ |
| Pre-renewal hook | Stop Nginx | ❌ |
| Post-renewal hook | Reload Nginx | ❌ |
| Expiry alert | 30 days before | ❌ |

## Sign-Off

| Role | Name | Signature | Date |
|------|------|-----------|------|
| DevOps Lead | | | |

**Status:** ❌ NOT VALIDATED
