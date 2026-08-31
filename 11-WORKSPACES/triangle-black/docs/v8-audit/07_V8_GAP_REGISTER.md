# TRIANGLE BLACK — V8 VERIFIED GAP REGISTER
Date: 2026-08-31
Status: POPULATED FROM LIVE AUDIT

---

## P0 — BLOCKS PILOT OR COMMERCIAL DELIVERY

| ID | Area | Finding | Evidence | Action |
|----|------|---------|----------|--------|
| V8-G001 | Commercial | ROI report has no formula/assumptions/confidence | 0/7 fields verified | Add defensibility fields to roi/report |
| V8-G002 | Data | WO→Asset linkage: 7.7% | DB query: 139/1804 | Enforce asset selection on WO creation |
| V8-G003 | Data | WO technician unassigned: 50.7% (422 WOs) | DB query | Enforce technician assignment in workflow |
| V8-G004 | Production | Staging not deployed | Config exists, no live env | Deploy to cloud VM before pilot |
| V8-G005 | UX | TypeScript errors: 34 (INCREASED) | tsc --noEmit | Fix enterprise JSX Unknown tags |
| V8-G006 | Product | No primary "what needs attention" dashboard | No verified UI journey | Build attention dashboard |
| V8-G007 | Product | 129 pages without loading states | Portal audit | Add loading states to top 20 pages |
| V8-G008 | Product | 143 pages without error states | Portal audit | Add error states to top 20 pages |
| V8-G009 | Schema | workflow_events.hotel_id column missing | DB error in audit | Add hotel_id to workflow_events |
| V8-G010 | Intelligence | Recommendation fatigue: 90%+ pending | DB: 1,460 pending | Surface daily-digest as primary UX |

## P1 — COMMERCIAL QUALITY

| ID | Area | Finding | Evidence | Action |
|----|------|---------|----------|--------|
| V8-G011 | Architecture | main.py: 9,019 lines + 308 rogue engines | wc -l + grep | Progressive extraction V8-021 |
| V8-G012 | Backup | Last backup 2 days old, restore untested | ls backups/ | Verify cron + test restore |
| V8-G013 | CI/CD | No full test gate, no portal build check | ci.yml analysis | Upgrade CI to full gate |
| V8-G014 | Accessibility | WCAG 2.2 AA not audited on any page | No audit file | Audit 5 critical paths |
| V8-G015 | UX | 215 @ts-nocheck files hiding errors | grep count | Systematic reduction |
| V8-G016 | UX | 1,184 inline styles | grep count | Continue design system |
| V8-G017 | Intelligence | MTTR claim: ~8% data coverage | 7.7% WO-asset link | Disclose confidence in UI |
| V8-G018 | Commercial | No customer-facing documentation | No user guide | Create operator guide |
| V8-G019 | Commercial | Package 1 has no guided narrative UI | API-only | Build assessment wizard UI |

## P2 — PRODUCT QUALITY

| ID | Area | Finding | Evidence | Action |
|----|------|---------|----------|--------|
| V8-G020 | UX | No primary attention dashboard | Missing UX | V8-009 Executive Decision Center |
| V8-G021 | Intelligence | AI acceptance 7.7% → adoption problem | DB query | Surface AI in primary UX flow |
| V8-G022 | Schema | workflow_events has no hotel_id | DB error | Migration to add column |
| V8-G023 | Product | No mobile/field technician experience | UX gap | PWA optimization (post-pilot) |
| V8-G024 | Intelligence | ROI delta requires 2+ snapshots | Single-snapshot baseline | Guide users to capture multiple |

## CLOSED GAPS (V6/V7 → V8 Improvements)

| Gap | Was | Now | How |
|----|-----|-----|-----|
| PM→Asset linkage | 8.7% | 87.5% | Data refresh + import |
| Supplier data quality | 46.1% | 99.2% | Data refresh |
| AI outcome tracking | 1.2% | 40.7% | V7-010 outcome tracking |
| Auth on 6 endpoints | EXPOSED | 401 | V7-002/012 security |
| KPI formulas | Undocumented | Registry exists | V7-005 |
| Workflow governance | None | Governed transitions | V7-009 |
| API version header | Missing | X-API-Version: 7.0 | V7-022 |

