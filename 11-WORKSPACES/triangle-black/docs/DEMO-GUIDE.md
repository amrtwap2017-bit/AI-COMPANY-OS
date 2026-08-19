# Triangle Black — Commercial Demo Guide

## Demo Tenant

| Item | Value |
|------|-------|
| Hotel | Grand Sands Hotel — Demo |
| Hotel ID | tb-demo-hotel-000000000001 |
| Email | demo@triangleblack.com |
| Password | demo123 |
| Portal | http://localhost:3000 |
| API | http://localhost:8030 |

## Quick Start

```bash
cd ~/AI-COMPANY-OS/11-WORKSPACES/triangle-black
bash START.sh
.venv/bin/python scripts/seed_demo_tenant.py
Open: http://localhost:3000
Login: demo@triangleblack.com / demo123

What Is Seeded
21 assets (HVAC, Electrical, Plumbing, Pool, Elevators, Fire, Kitchen)
20 work orders (completed + open + in-progress + assigned)
10 suppliers with ratings (3.8 – 4.8)
8 invoices (paid + pending + overdue)
Key Demo Flows
1. Executive Dashboard — /executive/dashboard
Shows: WO counts, SLA compliance, asset health, spend analysis

2. Operations — /operations/work-orders
Shows: Live WO list, SLA indicators, priority filters

3. Maintenance — /maintenance/assets
Shows: Asset tree, PM compliance, criticality map

4. AI Gateway
POST /api/v1/ai-gateway/maintenance-recommendation
Shows: Governed AI recommendation for HVAC asset

5. Digital Twin Impact
GET /api/v1/twin/asset/{asset_id}/impact
Shows: Which WOs and technicians affect this asset

Commercial Pitch Points
Operational Transparency — real-time WO status and SLA tracking
Asset Intelligence — full lifecycle from PM to corrective repair
Procurement Control — supplier ratings and PO tracking
AI Assistance — governed recommendations with full audit trail
Executive Visibility — live KPI dashboard from operational data
Security — tenant isolation and auth boundary fully tested
Value Proposition
Triangle Black gives engineering companies operating hotels:

Visibility into what is happening across all assets
Control over maintenance workflows and SLA compliance
Intelligence from AI-assisted recommendations
Evidence for every decision through audit trails
