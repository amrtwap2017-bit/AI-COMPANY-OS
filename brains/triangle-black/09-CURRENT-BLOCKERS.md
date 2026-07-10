# TRIANGLE BLACK — CURRENT BLOCKERS

## Blocker 1 — Multi-Tenancy (CRITICAL)
All queries use DEFAULT_HOTEL = "tb-default-hotel-000000000001"
get_hotel_id() in src/core/tenant.py returns this constant.
Before production: must extract hotel_id from JWT user's profile.
Current workaround: acceptable for single-tenant dev use.

## Blocker 2 — Stock Balances Not Computed
stock_movements records every transaction.
stock_balances is NEVER updated automatically.
Real stock levels are NOT visible in dashboard.
Fix: add balance computation to GRN receive + adjust endpoints.

## Blocker 3 — WSL Browser Networking
Browser cannot reach localhost:3200 from WSL.
Must use: http://172.28.186.138:3200
Workaround: set in portal/.env.local:
  NEXT_PUBLIC_API_URL=http://172.28.186.138:8020/api/v1

## Blocker 4 — SMTP Not Active
SMTP_ENABLED=false
Quote emails are backgrounded but not sent.
No real credentials configured.

## Blocker 5 — portal next.config.js Missing output:standalone
Portal Dockerfiles reference .next/standalone but Next.js
needs output: 'standalone' in next.config.js for this to work.
Production Docker build will fail without this.

## Non-Blockers (warnings only)
- StarletteDeprecationWarning: httpx vs httpx2 (cosmetic)
- Duplicate "Agent" key in Sidebar navItems (cosmetic)
- lockfile warning in Next.js dev (cosmetic)
