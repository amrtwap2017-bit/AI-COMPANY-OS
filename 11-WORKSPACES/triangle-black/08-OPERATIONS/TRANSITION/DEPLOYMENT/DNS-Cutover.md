# 02 — DNS Cutover

> DNS cutover procedure for production go-live.

## Reference Chain

| Source | File | Input |
|--------|------|-------|
| Phase 4 | DevOps-Architecture.md | DNS strategy |
| Phase 8 | 06-INFRASTRUCTURE-READINESS/DNS.md | DNS readiness |

## DNS Configuration

| Record | Type | Value | TTL | Status |
|--------|------|-------|-----|--------|
| app.triangleblack.com | A | VPS IP | 300 (5 min) | ❌ |
| *.app.triangleblack.com | A | VPS IP | 300 | ❌ |
| triangleblack.com | A | Landing page | 3600 | ❌ |
| www.triangleblack.com | CNAME | triangleblack.com | 3600 | ❌ |

## Cutover Steps

### Pre-Cutover (T-48 hours)
- [ ] All DNS records staged in DNS provider
- [ ] TTL lowered to 300 seconds for cutover records
- [ ] VPS IP confirmed static (or floating IP)
- [ ] Nginx configured for app domain
- [ ] SSL certificate issued for all domains

### Cutover (T-0)
- [ ] Change A record for app.triangleblack.com to VPS IP
- [ ] Verify DNS propagation (dig + trace)
- [ ] Wait 5 min (TTL window)
- [ ] Verify HTTPS access: `curl -I https://app.triangleblack.com`
- [ ] Verify app loads in browser
- [ ] Verify API health: `curl https://app.triangleblack.com/api/v1/health`

### Post-Cutover (T+1 hour)
- [ ] Monitor traffic arriving at VPS
- [ ] Check Nginx access logs for requests
- [ ] Verify SSL certificate is serving correctly
- [ ] Run SSL Labs test (target: A+)

## Rollback

If cutover fails:
1. Restore DNS A record to previous IP
2. Wait TTL + 5 min for propagation
3. Verify previous site loads
4. Investigate and fix issue
5. Re-attempt cutover

## Validation

- [ ] DNS resolved correctly (dig +trace)
- [ ] HTTPS working
- [ ] App loads in browser
- [ ] API responding
- [ ] SSL Labs score ≥ A

## Sign-Off

| Role | Name | Signature | Date |
|------|------|-----------|------|
| DevOps Lead | | | |

**Status:** ❌ NOT CUT OVER
