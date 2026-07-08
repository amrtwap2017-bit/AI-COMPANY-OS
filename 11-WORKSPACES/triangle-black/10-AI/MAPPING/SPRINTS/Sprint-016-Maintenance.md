# Sprint 016 — Maintenance — Assets and Work Orders

## Goal
Build maintenance management with asset registry, work order management, SLA tracking, and preventive maintenance scheduling to support ongoing customer operations.

## Capabilities
- MAINT-001 — Asset Management — from Maintenance
- MAINT-002 — Work Order Management — from Maintenance
- MAINT-003 — SLA Tracking — from Maintenance
- MAINT-004 — Preventive Maintenance — from Maintenance
- MAINT-005 — Maintenance Dashboard — from Maintenance

## Context Pack Required
**Pack ID:** CP-Maintenance
**Total Documents:** 5

### Domain Documents
- `../02-DOMAIN-DOCS/06-Maintenance/Asset-Management.md` — Asset Management
- `../02-DOMAIN-DOCS/06-Maintenance/Work-Orders.md` — Work Orders
- `../02-DOMAIN-DOCS/06-Maintenance/SLA-Tracking.md` — SLA Tracking
- `../02-DOMAIN-DOCS/06-Maintenance/Preventive-Maintenance.md` — Preventive Maintenance

### Standards
- `../04-STANDARDS/API-Design-Guide.md` — API Design Guide
- `../04-STANDARDS/Data-Modeling.md` — Data Modeling

## Entities to Build
- Asset — Maintenance
- AssetCategory — Maintenance
- AssetWarranty — Maintenance
- WorkOrder — Maintenance
- WorkOrderTask — Maintenance
- WorkOrderLabor — Maintenance
- SLAContract — Maintenance
- SLAViolation — Maintenance
- PreventiveSchedule — Maintenance
- PMTask — Maintenance
- MaintenanceLog — Maintenance

## APIs to Build
- `/api/maintenance/assets` — GET/POST — Asset registry
- `/api/maintenance/assets/{id}` — GET/PUT/DELETE — Asset detail
- `/api/maintenance/assets/{id}/warranty` — GET/POST — Warranty info
- `/api/maintenance/assets/{id}/maintenance-logs` — GET — Maintenance history
- `/api/maintenance/work-orders` — GET/POST — Work orders
- `/api/maintenance/work-orders/{id}` — GET/PUT — Work order detail
- `/api/maintenance/work-orders/{id}/tasks` — GET/POST — WO tasks
- `/api/maintenance/work-orders/{id}/tasks/{tId}` — GET/PUT — Task detail
- `/api/maintenance/work-orders/{id}/complete` — POST — Complete work order
- `/api/maintenance/work-orders/{id}/labor` — GET/POST — Labor tracking
- `/api/maintenance/sla` — GET/POST — SLA contracts
- `/api/maintenance/sla/{id}` — GET/PUT — SLA detail
- `/api/maintenance/sla/{id}/violations` — GET — Violations
- `/api/maintenance/preventive-schedules` — GET/POST — PM schedules
- `/api/maintenance/preventive-schedules/{id}` — GET/PUT — Schedule detail
- `/api/maintenance/preventive-schedules/{id}/generate` — POST — Generate WOs
- `/api/maintenance/dashboard` — GET — Maintenance KPIs

## Screens to Build
- `/maintenance/assets` — Asset registry list
- `/maintenance/assets/new` — Register asset
- `/maintenance/assets/{id}` — Asset detail with warranty
- `/maintenance/assets/{id}/edit` — Edit asset
- `/maintenance/assets/{id}/history` — Maintenance history
- `/maintenance/work-orders` — Work order list
- `/maintenance/work-orders/new` — Create work order
- `/maintenance/work-orders/{id}` — Work order detail
- `/maintenance/work-orders/{id}/tasks` — Task management
- `/maintenance/sla` — SLA contracts list
- `/maintenance/sla/new` — Create SLA contract
- `/maintenance/sla/{id}` — SLA detail with violations
- `/maintenance/preventive` — PM schedules
- `/maintenance/preventive/new` — Create schedule
- `/maintenance/dashboard` — Maintenance dashboard

## AI Agents Assigned
- Backend Lead AI — Asset, work order, SLA, PM APIs
- Frontend Lead AI — Maintenance screens and dashboard
- Database Architect AI — Asset and maintenance schema
- Business Analyst AI — SLA violation escalation rules

## Dependencies
- Sprint 005 — Commercial Contracts (SLA contracts from customer contracts)
- Sprint 009 — Project Closeout (asset handover from projects)

## Quality Gates
- Assets are searchable by category, location, and status
- Work orders can link to assets, projects, and contracts
- SLA breaches are automatically detected and escalated
- Preventive maintenance schedules auto-generate work orders
- Maintenance dashboard shows real-time KPIs (MTBF, MTTR)

## Estimated Deliverables
- 3 backend modules (asset, work order, sla)
- 15 frontend pages
- 60 unit tests
- 8 integration tests
- 4 documents
