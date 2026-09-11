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

## RESOLVED IN V10 (Sep 10, 2026)

| ID | Gap | Resolution | Date |
|----|-----|-----------|------|
| V10-B1 | 1,373 old recs without dup_key | Archived | Sep 10 2026 |
| V10-C1 | non_asset_reason missing from work_orders | Added VARCHAR(50) | Sep 10 2026 |
| V10-G011 | duplicate_key missing | Added + dedup working (93 pending) | Sep 10 2026 |

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


## TypeScript Error Baseline (Sep 10, 2026)

Current: 50 errors (down from 51 = net -1 from token-manager fix)

| Type | Count | Origin | Action |
|------|-------|--------|--------|
| TS1127 | 8 | Pre-existing in engineering/ops pages (emoji in JSX) | Manual per-page fix |
| TS17008 | 34 | Cascade from TS1127 in parent pages | Resolves with TS1127 |
| TS1005 | 1 | token-manager.ts — FIXED | ✅ Done |
| Other | 7 | Pre-existing in inventory/contracts/quotes | Manual per-page |

Strategy: Fix individually during V11 when touching each page.
Do NOT attempt mass automation — previous attempts increased errors.
Production target: 0 TS errors before launch.

## TypeScript Error Investigation — CLOSED (Sept 11, 2026)

### Result: 34 TS17008 errors are structural artifacts — NOT fixable via config

#### What was tested (exhaustive):
| Attempt | Result |
|---|---|
| Remove pages from tsconfig exclude | 34 errors remain |
| Add .next to exclude | 34 errors remain |
| Remove .next/types from include | 34 errors remain |
| Remove plugins:[next] from tsconfig | 34 errors remain |
| Delete .tsbuildinfo cache | 34 errors remain |
| Delete entire .next directory | 34 errors remain |
| Remove next-env.d.ts | 34 errors remain |
| Remove duplicate return() (none found) | 34 errors remain |

#### Root cause:
The 17 affected pages have structures (emoji data arrays, useEffect-only pages,
multi-query pages) that fail the Next.js AppPageConfig static validation.
The errors appear 'at <unknown>' because they are reported through TypeScript's
module resolution when processing referenced pages, not direct compilation.

#### Impact:
- `next build`: PASSES ✅ (confirmed)
- Runtime: UNAFFECTED ✅  
- Backend tests: 3,753 passing ✅
- These are ANALYSIS artifacts, not compilation errors

#### Fix:
Requires rewriting 17 pages to match strict Next.js page contract.
Each page needs: proper default export, correct prop types, no module-level
statements that confuse the AppPageConfig validator.
**Deferred to V11 — individual page rewrites.**
