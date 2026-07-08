# 06 — Nginx

> Nginx reverse proxy configuration validation.

## Reference Documents

| Source | File | Relevance |
|--------|------|-----------|
| PHASE-05 | DevOps-Foundation.md | Nginx config |
| PHASE-02 | DevOps-Architecture.md | Reverse proxy setup |

## Nginx Configuration

| Feature | Configured | Status |
|---------|-----------|--------|
| Reverse proxy to API (port 3000) | — | ❌ |
| Reverse proxy to Web (port 3001) | — | ❌ |
| SSL termination (TLS 1.3) | — | ❌ |
| HTTP → HTTPS redirect | — | ❌ |
| Rate limiting (per IP) | — | ❌ |
| Request size limits | — | ❌ |
| Static file caching | — | ❌ |
| Gzip compression | — | ❌ |
| Security headers (HSTS, CSP, X-Frame-Options) | — | ❌ |
| Access logs (custom format) | — | ❌ |
| Error pages (custom 404, 502) | — | ❌ |

## Validation

- [ ] Nginx starts and passes config test (`nginx -t`)
- [ ] HTTPS works (SSL certificate valid)
- [ ] HTTP redirects to HTTPS
- [ ] API proxy works (`/api/` → `localhost:3000`)
- [ ] Web proxy works (`/` → `localhost:3001`)
- [ ] Static files served with correct cache headers
- [ ] Rate limiting returns 429 when exceeded
- [ ] Security headers present in response

## Sign-Off

| Role | Name | Signature | Date |
|------|------|-----------|------|
| DevOps Lead | | | |

**Status:** ❌ NOT CONFIGURED
