# API Reality — A-001 Audit August 2026

## Route Count
- Total @app routes in main.py: 211
- Commercial router routes: ~400+
- Total API surface: ~600+ endpoints

## Revenue Loop (11/12 Working)
✅ /api/v1/leads/           ✅ /api/v1/quotes/
✅ /api/v1/contracts/       ✅ /api/v1/invoices/
✅ /api/v1/purchase-orders/ ✅ /api/v1/suppliers/
✅ /api/v1/work-orders/     ✅ /api/v1/assets/
🔴 /api/v1/pm-plans/ (404) ✅ /api/v1/service-requests/
✅ /api/v1/baseline/report  ✅ /api/v1/intelligence/snapshot

## Intelligence APIs (All 200 ✅)
/api/v1/baseline/report|risk|insights (NEW)
/api/v1/intelligence/snapshot
/api/v1/risk-intelligence/report
/api/v1/energy-intelligence/report
/api/v1/sla-intelligence/report
/api/v1/financial-intelligence/report
/api/v1/asset-lifecycle/report
/api/v1/supplier-intelligence/report
/api/v1/executive-intelligence/briefing
/api/v1/operational-intelligence/command-center

## Auth APIs
POST /api/v1/auth/login (form)
POST /api/v1/auth/login/json (JSON)
POST /api/v1/auth/refresh
GET  /api/v1/auth/me

## Health APIs
GET /api/v1/health/ready → {"status":"ready","database":"connected"}
GET /api/v1/health/live  → {"status":"live","timestamp":...}
