# 06 — DNS

> DNS configuration validation.

## Reference Documents

| Source | File | Relevance |
|--------|------|-----------|
| PHASE-04 | DevOps-Architecture.md | DNS setup |
| PHASE-05 | DevOps-Foundation.md | Deployment configuration |

## DNS Records

| Record | Type | Value | TTL | Status |
|--------|------|-------|-----|--------|
| app.triangleblack.com | A | VPS IP | 300 | ❌ |
| *.app.triangleblack.com | A | VPS IP | 300 | ❌ |
| staging.triangleblack.com | A | Staging VPS IP | 300 | ❌ |
| triangleblack.com | A | Landing page IP | 3600 | ❌ |
| www.triangleblack.com | CNAME | triangleblack.com | 3600 | ❌ |
| mail.triangleblack.com | MX | Mail server | 3600 | ❌ |

## Validation

- [ ] Domain registered (triangleblack.com)
- [ ] DNS records configured with provider
- [ ] DNS propagation verified (dig/nslookup)
- [ ] Subdomain routing works (tenant → app.triangleblack.com)
- [ ] Email DNS records configured (SPF, DKIM, DMARC)

## Sign-Off

| Role | Name | Signature | Date |
|------|------|-----------|------|
| DevOps Lead | | | |

**Status:** ❌ NOT CONFIGURED
