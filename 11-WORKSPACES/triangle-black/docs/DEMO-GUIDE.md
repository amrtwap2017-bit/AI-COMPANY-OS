# Triangle Black Demo Guide

## Demo Tenant
Hotel: Sharm Palace Engineering
Hotel ID: tb-demo-hotel-000000000001

## Quick Start
cd ~/AI-COMPANY-OS/11-WORKSPACES/triangle-black
bash START.sh
.venv/bin/python3 scripts/seed_demo_tenant.py

## Login
URL: http://localhost:3000
Email: amr@triangleblack.com
Password: admin123

## What Is Seeded
Assets: 15 — HVAC, Electrical, Plumbing, Fire Safety, Elevator
Work Orders: 30 — 30 days of corrective and preventive maintenance
Suppliers: 10 — Approved suppliers with ratings
Service Requests: 20 — Mixed urgency and status

## Key Demo Pages
Operations: /operations/work-orders — 30 WOs with SLA status
Assets: /maintenance/assets — 15 critical assets
Executive: /executive — KPI overview
Service Requests: /operations/service-requests — 20 requests
Suppliers: /supply-chain/suppliers — 10 approved suppliers

## Value Proposition
1. Operational Visibility — Which assets are critical
2. SLA Compliance — Are work orders completed on time
3. Maintenance Intelligence — What needs attention
4. Supplier Management — Who is performing
5. AI Recommendations — What should we do next
