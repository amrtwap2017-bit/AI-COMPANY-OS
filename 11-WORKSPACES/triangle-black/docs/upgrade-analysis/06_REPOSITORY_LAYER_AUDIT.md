# Repository Layer Audit — August 2026

## Current State

| Metric | Value |
|--------|-------|
| Total raw SQL in routers | 458 across all modules |
| Raw SQL in top 3 routers | 32 (work_orders + assets + invoices) |
| Repository files exist | 27 modules have repository.py |
| Router-only modules | 72 modules with no repository |

## Modules WITH Repository Files

activity_tracking, agent_management, approval_center, approval_chain,
approval_requests, assets, audit_log, auth, cache, contracts,
dashboard, documents, email_notifications, email_service, employees,
employee_timesheets, eta_invoicing, executive_dashboard, financial_gl,
goods_receipts, hotels, inventory_items, inventory_vendors, invoices,
lead_management, notification_engine, quotation, suppliers,
user_preferences, warehouses, warranty

## Architecture Target

Router → Application Service → Repository → Database

Currently most routers call db.execute(text(...)) directly.
Repository files exist but are not always used by routers.

## Remediation Strategy

1. Do NOT rewrite all 458 SQL calls at once
2. Priority: work_orders, assets, invoices, service_requests, contracts
3. For each priority module:
   a. Verify repository.py exists
   b. Add missing query methods to repository
   c. Delegate router calls to repository
   d. Add repository unit tests
4. Accept gradual migration — 20% per sprint

## Risk

MEDIUM — touching active routers can break endpoints.
Always verify all routes respond after each migration.
