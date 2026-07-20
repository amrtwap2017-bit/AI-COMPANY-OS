# TRIANGLE BLACK - BACKEND MODERNIZATION REGISTRY
# Generated: 2026-07-20 10:04

======================================================================
CURRENT VERIFIED STATUS
======================================================================

Database
- PostgreSQL active
- triangle_black database connected
- 126 public tables discovered

Verified live data
- leads: 74
- agents: 6
- hotels: 4
- work_orders: 28
- technicians: 5
- assets: 18
- service_requests: 5
- quotes: 250
- contracts: 72
- inventory_items: 10

Verified working endpoints
- /api/v1/work-orders/
- /api/v1/technicians/
- /api/v1/assets/
- /api/v1/service-requests/
- /api/v1/actions/dashboard/stats

======================================================================
REMAINING GAP ANALYSIS
======================================================================

1. ROUTER REGISTRATION GAP
There are many modules under src/commercial that are not fully exposed
or not consistently registered in main.py.

2. RESPONSE CONTRACT GAP
Several portal pages expect frontend-friendly fields such as:
- company_name
- contact_name
- current_work_orders
- location
- item_count
but backend tables use different names.

3. DOMAIN API GAP
Still missing or incomplete:
- maintenance enterprise APIs
- executive intelligence APIs
- analytics platform APIs
- approval center APIs
- customer success APIs
- projects center APIs
- SLA tracking APIs
- engineering management APIs
- workflow engine APIs

4. CONSISTENCY GAP
Some routes use:
- /api/v1/actions/*
Others use:
- /api/v1/resource/*
Need a clear contract map.

5. SCHEMA/ORM GAP
Some SQLAlchemy models do not match actual PostgreSQL schema exactly.
Must audit:
- primary key types
- nullability
- defaults
- table names
- index assumptions

6. MULTI-TENANCY GAP
hotel_id exists in many tables, but enforcement must be validated
across all routers and repositories.

======================================================================
TASK REGISTRY - NEXT SPRINTS
======================================================================

BE-101  Router Registration Audit
Priority: CRITICAL
Goal:
- inventory every module under src/commercial
- compare to main.py registrations
- produce missing router list
Acceptance:
- one report listing registered vs missing modules

BE-102  ORM vs PostgreSQL Schema Audit
Priority: CRITICAL
Goal:
- compare live PostgreSQL schema to SQLAlchemy models
- detect type mismatches, missing columns, wrong defaults
Acceptance:
- one report per domain with mismatch list

BE-103  API Contract Audit for Portal Pages
Priority: CRITICAL
Goal:
- map every portal page to expected API shape
- compare with actual backend response payload
Acceptance:
- one JSON/MD contract matrix for frontend/backend

BE-104  Maintenance API Sprint
Priority: HIGH
Goal:
- expose /api/v1/maintenance/*
- maintenance plans, schedules, downtime, costs, work items
Acceptance:
- maintenance pages can be wired to real data

BE-105  Executive Intelligence API Sprint
Priority: HIGH
Goal:
- expose /api/v1/actions/executive/*
- dashboard, intelligence, portfolio, risks, exceptions
Acceptance:
- executive center pages can be wired to real data

BE-106  Analytics API Sprint
Priority: HIGH
Goal:
- expose /api/v1/analytics/*
- scorecards, trends, SLA metrics, cross-center KPIs
Acceptance:
- analytics pages can be wired to real data

BE-107  Approval Center API Sprint
Priority: HIGH
Goal:
- expose unified approvals queue
- quote approvals, PR approvals, PO approvals, contract approvals
Acceptance:
- /approvals page shows live queue

BE-108  Customer Success API Sprint
Priority: HIGH
Goal:
- expose /api/v1/customers/*
- 360, health, renewals, invoices, contracts
Acceptance:
- customer success pages show live data

BE-109  Projects Center API Sprint
Priority: HIGH
Goal:
- expose /api/v1/projects/*
- projects, phases, budgets, milestones, risks, resources
Acceptance:
- projects center pages show live data

BE-110  SLA / Workflow / Engineering API Sprint
Priority: MEDIUM
Goal:
- expose:
  - /api/v1/sla/*
  - /api/v1/workflows/*
  - /api/v1/engineering/*
Acceptance:
- operations and engineering advanced pages show live data

BE-111  Tenant Isolation Validation
Priority: HIGH
Goal:
- verify hotel_id filtering across all domain routers
Acceptance:
- report proving each domain is tenant-safe

BE-112  Backend Health & Coverage Automation
Priority: HIGH
Goal:
- generate scripts to test every registered route
- verify status, auth, response shape
Acceptance:
- backend health report JSON + markdown summary

======================================================================
EXECUTION ORDER
======================================================================

Sprint BE-A
- BE-101
- BE-102
- BE-103

Sprint BE-B
- BE-104
- BE-105
- BE-106

Sprint BE-C
- BE-107
- BE-108
- BE-109

Sprint BE-D
- BE-110
- BE-111
- BE-112

======================================================================
SUCCESS CRITERIA
======================================================================

- Every portal domain has a live backend contract
- Every backend contract matches actual page expectations
- Every router is registered intentionally
- Every model matches PostgreSQL schema
- Every domain is tenant-aware by hotel_id
- Backend becomes authoritative and auditable
