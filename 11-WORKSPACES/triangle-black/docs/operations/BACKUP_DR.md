# Triangle Black — Backup & Disaster Recovery

**Status:** VERIFIED  
**Last Verified:** 2026-08-27  
**Verified By:** Engineering Team  

---

## Recovery Objectives

| Metric | Target | Current |
|--------|--------|---------|
| **RPO** (Recovery Point Objective) | <= 24 hours | Manual daily backup |
| **RTO** (Recovery Time Objective) | <= 2 hours | ~15 minutes (tested) |

---

## Backup Architecture

    PostgreSQL (triangle_black)
    -> pg_dump --format=plain --no-owner --no-acl
    -> gzip compression
    -> backups/triangle_black_YYYYMMDD_HHMMSS.sql.gz
    -> 7-file rotation (oldest deleted automatically)

---

## Verified Restore Evidence

**Test performed:** 2026-08-27 14:37  
**Backup size:** 1.9 MB compressed  
**Restore target:** triangle_black_restore_test  

| Table | Production | Restored | Match |
|-------|-----------|---------|-------|
| assets | 418 | 418 | PASS |
| work_orders | 1,174 | 1,174 | PASS |
| suppliers | 798 | 798 | PASS |
| maintenance_plans | 371 | 371 | PASS |
| employees | 776 | 776 | PASS |

**Result:** FULL RESTORE VERIFIED — all counts matched

---

## Backup Procedure

    # Create backup (run daily or before any deployment)
    bash scripts/backup.sh

    # Verify backup integrity
    .venv/bin/python scripts/backup_verify.py

---

## Restore Procedure

    # Step 1: Identify backup to restore
    ls -lh backups/triangle_black_*.sql.gz

    # Step 2: Create clean target DB
    PGPASSWORD=ai123 psql -h localhost -U ai -d postgres \
      -c "CREATE DATABASE triangle_black_restored OWNER ai;"

    # Step 3: Restore
    gunzip -c backups/triangle_black_YYYYMMDD_HHMMSS.sql.gz | \
      PGPASSWORD=ai123 psql -h localhost -U ai -d triangle_black_restored

    # Step 4: Verify counts
    .venv/bin/python scripts/backup_verify.py

---

## Restore Verification Checklist

- [ ] Backup file readable (not corrupted)
- [ ] All key tables present: assets, work_orders, suppliers, employees
- [ ] Row counts match production within 1%
- [ ] Application starts successfully against restored DB
- [ ] Intelligence engines return expected health score
- [ ] At least one login succeeds

---

## Pre-Deployment Backup Rule

Before every production deployment:

    bash scripts/backup.sh && echo "Pre-deployment backup complete"

Never deploy without a verified backup.

---

## Retention Policy

| Item | Policy |
|------|--------|
| Local copies | 7 most recent backups |
| Off-site | Manual copy (roadmap: automate) |
| Frequency | Manual daily (roadmap: cron) |

---

## Roadmap

| Phase | Target |
|-------|--------|
| Now | Manual daily backup + verified restore |
| Next | Automated daily cron + email alert on failure |
| Future | RPO <= 4h with WAL archiving |
| Enterprise | RPO <= 1h + off-site encrypted storage |

---

## Contacts

| Role | Responsibility |
|------|---------------|
| Engineering Lead | Execute backup and restore |
| Product Owner | Approve restore to production |
