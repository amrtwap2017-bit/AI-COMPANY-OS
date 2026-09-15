# TRIANGLE BLACK — V14 PRODUCTION GATE CHECKLIST
## Generated: $(date +%Y-%m-%d)
## Version: V14 → Production Ready

---

## PRE-REQUISITES (Owner Decisions Required)

| Item | Status | Owner | Notes |
|------|--------|-------|-------|
| Cloud provider selected | ⬜ OPEN | Amr | Hetzner/DigitalOcean/AWS recommended |
| VM provisioned | ⬜ OPEN | Amr | 4 vCPU, 8GB RAM, 80GB SSD minimum |
| Domain registered | ⬜ OPEN | Amr | triangleblack.com or equivalent |
| DNS configured | ⬜ OPEN | Amr | app.triangleblack.com → VM IP |
| SSH access | ⬜ OPEN | Amr | Key-based auth only |

---

## LOCAL WORK (Can Do Right Now)

| Item | Status | Notes |
|------|--------|-------|
| V14 baseline frozen | ⬜ | docs/agent-handoffs/V14-BASELINE-FREEZE.json |
| DB backup created | ⬜ | backups/v14-baseline-*.sql.gz |
| TypeScript 0 errors | ⬜ | tsc --noEmit = 0 |
| Real Playwright E2E | ⬜ | 5 golden journeys |
| Security route matrix | ⬜ | docs/security/ROUTE-SECURITY-MATRIX.md |
| Docker prod compose | ⬜ | infra/docker-compose.prod.yml |
| Nginx production config | ⬜ | infra/nginx/nginx.conf |
| .env.prod.template | ⬜ | NO real secrets |
| Backup scripts | ⬜ | scripts/backup-db.sh etc. |
| CI/CD pipeline | ⬜ | .github/workflows/ci.yml |
| Secrets rotation procedure | ⬜ | docs/operations/SECRETS-ROTATION.md |
| DR runbook | ⬜ | docs/operations/DR-RUNBOOK.md |

---

## PRODUCTION DEPLOYMENT (After VM)

| Item | Status | Evidence Required |
|------|--------|-------------------|
| VM online | ⬜ | SSH connects |
| Ubuntu updated | ⬜ | apt update done |
| Firewall configured | ⬜ | Only 80, 443, 22 open |
| Docker installed | ⬜ | docker --version |
| Nginx installed | ⬜ | nginx -v |
| SSL certificate | ⬜ | certbot --version + cert exists |
| Production secrets | ⬜ | /etc/triangle-black/.env.prod exists |
| Production DB created | ⬜ | psql connects to prod DB |
| Migrations run | ⬜ | alembic current = head |
| Application deployed | ⬜ | docker ps shows services |
| Health check passes | ⬜ | curl https://app.domain/api/v1/health/live |
| Nginx routing works | ⬜ | API + frontend both accessible |

---

## VERIFICATION GATES

| Gate | Status | Evidence |
|------|--------|---------|
| HTTPS works | ⬜ | https:// loads, certificate valid |
| Old dev creds rejected | ⬜ | ai123 password fails on prod DB |
| Tenant isolation | ⬜ | Cross-tenant API test returns 403 |
| Automated backup | ⬜ | Cron configured, first backup exists |
| Restore drill | ⬜ | Restored to test DB, smoke passed |
| P0 webhook fires | ⬜ | Test alert received in Telegram/Slack |
| Monitoring active | ⬜ | Uptime check configured |
| Staging exists | ⬜ | staging.domain accessible |
| CI/CD runs | ⬜ | GitHub Actions green on push |
| Playwright passes | ⬜ | 5 golden journeys green |
| Production smoke | ⬜ | All 12 smoke checks pass |

---

## V14 GO/NO-GO DECISION

All items above must be ✅ before V15 begins.

APPROVED BY: _____________ DATE: _____________

---

## NEXT: V15 CUSTOMER PILOT

After V14 GO: begin customer outreach immediately.
Do NOT build more features before first customer contact.
