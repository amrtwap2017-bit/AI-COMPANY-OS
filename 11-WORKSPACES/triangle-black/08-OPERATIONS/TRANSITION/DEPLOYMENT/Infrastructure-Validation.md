# 02 — Infrastructure Validation

> Validation of production infrastructure before go-live.

## Reference Chain

| Source | File | Input |
|--------|------|-------|
| Phase 4 | DevOps-Architecture.md | Infrastructure design |
| Phase 8 | 06-INFRASTRUCTURE-READINESS | Infrastructure readiness |

## Validation Checklist

### VPS
- [ ] VPS accessible via SSH (key only)
- [ ] UFW active: ports 22, 80, 443 only
- [ ] Fail2ban running and configured
- [ ] Automatic security updates enabled
- [ ] Swap configured (2GB)
- [ ] Timezone: Africa/Cairo
- [ ] Hostname set: `app.triangleblack.com`
- [ ] Docker installed (version ≥ 24)
- [ ] Docker Compose installed (v2)
- [ ] Monitoring agent running

### Docker
- [ ] `docker compose up` starts all services
- [ ] All health checks pass
- [ ] Resource limits applied (CPU, memory)
- [ ] Log driver configured (json-file)
- [ ] Restart policy: always
- [ ] Networks: internal (db) + external (web)

### Nginx
- [ ] Config passes `nginx -t`
- [ ] HTTPS working (TLS 1.3)
- [ ] HTTP → HTTPS redirect working
- [ ] API proxy: `/api/` → `localhost:3000`
- [ ] Web proxy: `/` → `localhost:3001`
- [ ] Rate limiting configured
- [ ] Security headers present (HSTS, CSP)

### PostgreSQL
- [ ] Container running and accepting connections
- [ ] Prisma migration complete
- [ ] Connection pooling configured
- [ ] SSL enabled
- [ ] Backup script tested

### Monitoring
- [ ] Uptime monitoring active
- [ ] Service health checks active
- [ ] Disk usage alert configured
- [ ] SSL expiry alert configured

## Validation Report

| Section | Checks | Pass | Fail | Status |
|---------|--------|------|------|--------|
| VPS | 11 | 0 | 0 | ❌ NOT VALIDATED |
| Docker | 9 | 0 | 0 | ❌ NOT VALIDATED |
| Nginx | 9 | 0 | 0 | ❌ NOT VALIDATED |
| PostgreSQL | 6 | 0 | 0 | ❌ NOT VALIDATED |
| Monitoring | 4 | 0 | 0 | ❌ NOT VALIDATED |

## Sign-Off

| Role | Name | Signature | Date |
|------|------|-----------|------|
| DevOps Lead | | | |

**Status:** ❌ NOT VALIDATED
