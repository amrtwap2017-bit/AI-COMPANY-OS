# V10 PILOT READINESS BASELINE
Generated: 2026-09-09 08:53
Status: VERIFIED from filesystem + live system

---

## Production Infrastructure Readiness

| Component | Status | File |
|-----------|--------|------|
| Docker Compose (production) | ✅ EXISTS | infra/compose/production.yml |
| Docker Compose (staging) | ✅ EXISTS | docker-compose.staging.yml |
| Nginx config | ✅ EXISTS | infra/nginx/conf.d/ |
| systemd service | ✅ EXISTS | infra/systemd/ |
| CI/CD pipeline | ✅ EXISTS | .github/workflows/ci.yml |
| Backup script | ✅ EXISTS | scripts/backup_db.py |
| Restore script | ✅ EXISTS | scripts/restore_db.sh |
| .env.example | ✅ EXISTS | .env.example |

## Deployment Readiness Gate

| Gate | Status | Blocker |
|------|--------|---------|
| Production domain | ❌ MISSING | Need cloud VM |
| HTTPS/TLS | ❌ MISSING | Need VM + certbot |
| Staging environment | ❌ MISSING | Need VM |
| Production database | ❌ MISSING | Need VM |
| Security headers deployed | ❌ MISSING | Nginx not deployed |
| E2E tests | ❌ MISSING | Playwright not configured |
| Real customer | ❌ MISSING | Business task |
| Tests 3682+ passing | ✅ VERIFIED | Baseline maintained |
| 0 failing tests | ✅ VERIFIED | Baseline maintained |
| Auth on mutations | ✅ VERIFIED | V9-003 complete |
| Tenant isolation | ✅ VERIFIED | 7/7 adversarial tests |
| DB restore tested | ✅ VERIFIED | restore_db.sh tested Sep 2026 |
| Backup automated | ⚠️ MANUAL | Cron not configured on server |

## Data Import Readiness

| Asset Type | Import Method | Status |
|------------|--------------|--------|
| Asset register (CSV) | /api/v1/data-import/assets | ✅ |
| PM plans (CSV) | /api/v1/pm-plans/import | Exists |
| Suppliers (CSV) | Manual or API | Exists |
| WO history | Manual or API | Exists |

## 30-Day Pilot Program Structure

### Day 0: Baseline Data Import
Required:
- Asset register (name, category, criticality, location)
- PM plans (asset, frequency, last done)  
- Recent WO history (90 days minimum)
- Technicians and roles
- Suppliers

Baseline KPIs to capture:
- PM compliance %
- MTTR (where calculable)
- Open WO backlog
- Critical WO count
- Unassigned WO count
- Overdue PM count

### Week 1: Operational Control
Focus: Critical WOs, Unassigned WOs, Overdue PM

### Week 2: Intelligence
Focus: Repeat failures, Asset risk, AI recommendations

### Week 3: Optimization
Focus: Response time, PM compliance, Supplier performance

### Week 4: ROI
Measure: Before vs After on all baseline KPIs
Produce: ROI report with evidence

## Commercial Requirements for First Pilot

| Requirement | Status |
|-------------|--------|
| Engineering company identified | ❌ |
| Hotel property agreed | ❌ |
| Data access agreed | ❌ |
| Onboarding agreement | ❌ |
| Production URL available | ❌ |
| Support process defined | ❌ |

## Time Estimate to First Pilot

| Step | Time |
|------|------|
| Cloud VM provision | 1 hour |
| HTTPS + domain | 1 hour |  
| Staging deploy + test | 2 hours |
| Production deploy | 1 hour |
| Customer conversation | 1-2 weeks |
| Data import + baseline | 2-3 days |
| **Total to pilot start** | **~3 weeks** |
