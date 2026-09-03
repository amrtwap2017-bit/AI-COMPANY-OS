# TRIANGLE BLACK — CURRENT GAP REGISTER FOR LOCAL AI
Date: 2026-09-03

## P0 GAPS (Production blocking)

### GAP-P0-001: WO Technician Assignment 2.6%
Evidence: 497 open WOs have no technician assigned
Root cause: No enforcement in WO creation/transition UI
Fix needed: UI enforcement when creating corrective WOs
Files to touch:
  portal/app/(app)/attention/page.tsx (add CTA button)
  src/commercial/work_orders/router.py (already has warning)

### GAP-P0-002: main.py 9,019 lines
Evidence: wc -l src/main.py = 9019
Root cause: 100+ sprint feature adds as inline routes
Risk: 308 rogue create_engine() calls = connection pool exhaustion
Fix needed: Progressive extraction of inline routes to router files
Priority: Extract highest-risk inline routes first

### GAP-P0-003: AI Acceptance Rate 7.7%
Evidence: 2,071 pending recommendations, 177 approved (7.7%)
Root cause: No recommendation review UI in primary workflow
Fix needed: "Review" button on attention dashboard
          One-click approve/reject with reason

## P1 GAPS (Commercial quality)

### GAP-P1-001: No Observability Dashboard
Evidence: /api/v1/health/metrics exists but no UI
Fix needed: Simple metrics page showing:
  Request rate, error rate, DB latency, active users

### GAP-P1-002: TypeScript 34 errors (Next.js generated)
Evidence: cd portal && npx tsc --noEmit → 34 errors
Root cause: Next.js re-adds .next/types to tsconfig on npm run dev
Status: Acceptable (errors in generated files, not application code)
Fix when: After production deployment with stable build

### GAP-P1-003: Portal has no Loading States on 129 pages
Evidence: find portal/app -name "page.tsx" | xargs grep -L "loading"
Status: Low priority until pilot feedback

## WHAT LOCAL AI SHOULD FOCUS ON

Priority 1: GAP-P0-001 — Add technician assignment CTA to attention page
Priority 2: GAP-P0-003 — Add recommendation review action to attention page
Priority 3: GAP-P1-001 — Simple observability metrics page

DO NOT touch main.py yet (GAP-P0-002) without explicit instruction.
DO NOT rebuild anything that already works.
