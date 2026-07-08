# 25 — Go-Live Foundation

## Pre-Flight Checklist

### Domain & DNS
- [ ] Domain registered (triangleblack.tech)
- [ ] Cloudflare account configured
- [ ] DNS records created:
  ```
  app.triangleblack.tech  A  {VPS_IP}
  api.triangleblack.tech  A  {VPS_IP}
  staging.triangleblack.tech  A  {STAGING_VPS_IP}
  ```
- [ ] SSL certificates provisioned (Let's Encrypt)
- [ ] Auto-renewal configured (certbot cron)

### VPS Provisioning
- [ ] DigitalOcean Droplet created (Ubuntu 24.04 LTS)
- [ ] SSH key-based authentication configured
- [ ] Firewall rules set (ports 22, 80, 443, health check)
- [ ] Fail2ban configured
- [ ] Automatic security updates enabled
- [ ] Swap file configured (1GB for 1GB RAM droplet)
- [ ] Docker + Docker Compose installed

### Application
- [ ] GitHub repository created (triangle-black)
- [ ] Monorepo structure pushed
- [ ] Docker images build successfully
- [ ] Docker Compose starts all services
- [ ] Health check endpoint responds
- [ ] Database migrations run successfully
- [ ] Seed data created (admin user, demo tenant)
- [ ] Environment variables configured (production)

### CI/CD
- [ ] GitHub Actions workflows created
- [ ] CI passes on PR
- [ ] Deploy to staging works
- [ ] Deploy to production works
- [ ] Rollback procedure tested

### Security
- [ ] SSL certificate valid and auto-renewing
- [ ] Security headers configured (CSP, HSTS, X-Frame-Options)
- [ ] Rate limiting configured
- [ ] JWT secrets rotated (pre-production)
- [ ] Database password changed from default
- [ ] No secrets in repository
- [ ] Admin account password changed
- [ ] RBAC roles created and tested

### Monitoring
- [ ] Uptime Kuma deployed and monitoring endpoints
- [ ] Sentry DSN configured
- [ ] Health check endpoint: `/api/v1/health`
- [ ] Logging configured (Winston → file + Docker)
- [ ] Backup cron job configured (daily pg_dump)

### Backup & Recovery
- [ ] Daily database backup configured
- [ ] Weekly full backup (DB + uploads)
- [ ] Backup restore tested
- [ ] Recovery runbook written

### Launch
- [ ] Production environment fully tested
- [ ] Staging environment cleaned
- [ ] Admin accounts created
- [ ] First tenant onboarded
- [ ] Quotation PDF generation tested
- [ ] Email sending tested
- [ ] All quality gates passing
- [ ] Rollback plan confirmed

## Incident Response

| Severity | Definition | Response Time | Notify |
|----------|-----------|---------------|--------|
| SEV-1 | Platform down, all users affected | 15 min | Engineering Lead |
| SEV-2 | Feature broken, some users affected | 1 hour | Engineering team |
| SEV-3 | Minor issue, workaround exists | 24 hours | Engineering team |
| SEV-4 | Cosmetic, no user impact | Next sprint | Backlog |

### Incident Response Steps
1. Acknowledge alert (Uptime Kuma / Sentry)
2. Assess severity
3. Notify stakeholders (if SEV-1/2)
4. Fix or rollback
5. Verify fix
6. Post-mortem (within 48 hours)

## Go/No-Go Checklist

```
☐ All pre-flight items checked
☐ No open SEV-1 or SEV-2 issues
☐ Database backups confirmed working
☐ SSL valid and auto-renewing
☐ CI/CD deploys to production successfully
☐ Admin team has access
☐ Rollback procedure documented and tested
☐ Engineering Lead approves launch

Date of Go: _______________
Signed: ___________________
```

## Post-Launch (First Week)

| Day | Activity |
|-----|----------|
| Day 1 | Monitor logs, error rates, response times |
| Day 2 | Verify backups ran successfully |
| Day 3 | Review Sentry for unhandled errors |
| Day 4 | Check disk usage, CPU, memory |
| Day 5 | First week retrospective |
| Day 7 | Stakeholder update + metrics report |
