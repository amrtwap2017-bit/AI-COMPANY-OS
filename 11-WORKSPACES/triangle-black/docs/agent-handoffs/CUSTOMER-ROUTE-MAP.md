# TRIANGLE BLACK — CUSTOMER ROUTE MAP
## Generated: 2026-09-15 10:39

## CUSTOMER PILOT WORKSPACE (V15)
These are the ONLY routes a pilot customer should see.

| Label | Path | Canonical File | Exists | Loading | Error |
|-------|------|----------------|--------|---------|-------|
| Home | `/executive/dashboard` | `portal/app/(app)/(enterprise)/executive/dashboard/page.tsx` | ✅ | ✅ | ❌ |
| Attention | `/operations/command-center` | `portal/app/(app)/(enterprise)/operations/command-center/page.tsx` | ✅ | ✅ | ❌ |
| Work Orders | `/operations/work-orders` | `portal/app/(app)/(enterprise)/operations/work-orders/page.tsx` | ✅ | ✅ | ✅ |
| Service Requests | `/operations/service-requests` | `portal/app/(app)/(enterprise)/operations/service-requests/page.tsx` | ✅ | ✅ | ✅ |
| Assets | `/maintenance/assets` | `portal/app/(app)/(enterprise)/maintenance/assets/page.tsx` | ✅ | ✅ | ❌ |
| PM Plans | `/maintenance/pm-plans` | `portal/app/(app)/(enterprise)/maintenance/pm-plans/page.tsx` | ✅ | ✅ | ❌ |
| Procurement | `/supply-chain` | `portal/app/(app)/(enterprise)/supply-chain/page.tsx` | ✅ | ❌ | ❌ |
| AI Recommendations | `/recommendations` | `portal/app/(app)/(enterprise)/recommendations/page.tsx` | ✅ | ❌ | ❌ |
| Pilot/ROI | `/pilot-dashboard` | `portal/app/(app)/(enterprise)/pilot-dashboard/page.tsx` | ✅ | ✅ | ❌ |
| Reports | `/reports` | `portal/app/(app)/(enterprise)/reports/page.tsx` | ✅ | ✅ | ❌ |

## RULE
- Customer workspace uses ONLY these enterprise routes
- Generic (app)/ routes are for internal/admin use only
- Do NOT make generic 6-line pages customer-facing

## DUPLICATE ROUTES TO RESOLVE
Generic pages at (app)/work-orders, (app)/assets, (app)/dashboard
are thin wrappers (~6 lines). Enterprise pages are the canonical versions.
Customer must NEVER land on the generic thin wrapper.