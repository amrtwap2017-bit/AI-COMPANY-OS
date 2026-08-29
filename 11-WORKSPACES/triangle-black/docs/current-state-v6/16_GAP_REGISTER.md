# Triangle Black — Gap Register
**Date:** 2026-08-29

## P0 — Commercial/Security Blockers

| ID | Gap | Evidence | Sprint |
|----|-----|----------|--------|
| G001 | Email delivery not implemented | platform_notifications in DB, never sent | Sprint 1 |
| G002 | Backup never automated | scripts exist, cron not configured | Sprint 3 |
| G003 | No staging environment | single environment dev=prod | Sprint 3 |
| G004 | No first real customer | pilot toolkit ready, no engagement | Sprint 8 |
| G005 | asset-lifecycle startup WARN | try block missing import | Sprint 13 |

## P1 — Critical Product Gaps

| ID | Gap | Evidence | Sprint |
|----|-----|----------|--------|
| G006 | No PDF report export | customer cannot share with board | Sprint 2 |
| G007 | No PM plans import | import suite incomplete | Sprint 7 |
| G008 | No observability | no structured logs, no metrics | Sprint 4 |
| G009 | No data quality engine | AI accuracy depends on data | Sprint 5 |
| G010 | No commercial demo story | isolated data, no narrative | Sprint 6 |
| G011 | No AI outcome tracking | cannot measure AI value | Sprint 10 |
| G012 | WCAG 2.2 not audited | enterprise requirement | Sprint 12 |

## P2 — Technical Debt

| ID | Gap | Evidence | Sprint |
|----|-----|----------|--------|
| G013 | main.py ~8,900 lines | router accumulation | Sprint 13 |
| G014 | 294 @ts-nocheck in lib/ | TypeScript errors hidden | Future |
| G015 | 1,184 inline styles | design system incomplete | Ongoing |
| G016 | No .agent/ context files | agent knowledge loss between sessions | Sprint 14 |
| G017 | Remaining duplicate op IDs | some warnings at startup | Sprint 3 |

## P3 — Future Enterprise

| ID | Gap | Notes |
|----|-----|-------|
| G018 | SSO/SAML/SCIM | Only when enterprise customer requires |
| G019 | Billing engine | After 3+ customers |
| G020 | Multi-region | After 10+ customers |
| G021 | Native mobile | PWA first |
| G022 | ERP integrations | Only per customer requirement |
| G023 | ML predictive models | After 6+ months real data |
