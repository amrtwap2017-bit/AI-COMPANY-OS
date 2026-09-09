# V10 GAP REGISTER
Generated: 2026-09-09
Status: VERIFIED from live audit

---

## P0 — Blocks Commercial Launch

| ID | Gap | Evidence | Action | Sprint |
|----|-----|---------|--------|--------|
| V10-G001 | No production URL | localhost only | Provision VM | V10-002 |
| V10-G002 | No HTTPS/TLS | No cert | Certbot on VM | V10-002 |
| V10-G003 | No staging environment | No staging | Deploy staging | V10-003 |
| V10-G004 | No E2E golden journeys | No Playwright | Implement | V10-005 |
| V10-G005 | WO→Asset 5.1% | DB query | SR→WO + enforce | V10-006/007 |

## P1 — Commercial Quality

| ID | Gap | Evidence | Action | Sprint |
|----|-----|---------|--------|--------|
| V10-G006 | main.py 8,942 lines | wc -l | Progressive extraction | Parallel |
| V10-G007 | 129 pages missing loading | Portal audit | Apply PageStates | V10-010 |
| V10-G008 | AI acceptance 8% | DB query | Rec 2.0 | V10-008 |
| V10-G009 | SR→WO 0% asset linkage | DB query | Add asset field | V10-007 |
| V10-G010 | No recommendation expiry | No expiry column | Add field | V10-008 |
| V10-G011 | No duplicate_key on recs | No field | Add field | V10-008 |
| V10-G012 | Attention not prioritized P0-P3 | Single score | Attention 2.0 | V10-009 |
| V10-G013 | No data lineage on metrics | No source tracking | Add confidence | V10-006 |
| V10-G014 | Backup not automated on server | Manual cron | Schedule | V10-002 |
| V10-G015 | No rollback procedure | Not documented | Document + test | V10-003 |

## P2 — Future Enterprise

| ID | Gap | Action | When |
|----|-----|--------|------|
| V10-G016 | No SSO/SCIM | Enterprise auth | Post-pilot |
| V10-G017 | No mobile PWA | Technician mobile | Post-pilot |
| V10-G018 | No billing system | Stripe | Revenue stage |
| V10-G019 | No multi-tenant (multi-hotel) | Architecture | Revenue stage |
| V10-G020 | Accessibility WCAG 2.2 | Audit + fix | P2 |

## RESOLVED IN V9 (Do Not Re-Open)

| ID | Gap | Resolution |
|----|-----|-----------|
| V9-003 | 54 unprotected mutations | Auth added |
| V9-004 | 152 rogue create_engine() | 0 remaining |
| V9-005 | Tenant isolation not certified | 7/7 adversarial tests |
| V9-006 | PM date type varchar | Migrated to DATE |
| V9-009 | 5133 pending recs | Archived to 670 |
| V9-015 | WO creation no asset field | Asset dropdown added |
| V9-017 | No observability page | Health page built |
