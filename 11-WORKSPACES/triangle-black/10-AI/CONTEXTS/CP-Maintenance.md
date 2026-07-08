# Context Pack: Maintenance

**Pack ID:** CP-Maintenance
**Version:** 1.0
**Domain:** Maintenance
**Sprint:** 016

## Contents

### Required Documents
| # | Document | Source | Agent |
|---|----------|--------|-------|
| 1 | Business Overview | `../02-DOMAIN-DOCS/06-Maintenance/Maintenance-Overview.md` | Business Analyst AI |
| 2 | Business Capabilities | `../02-DOMAIN-DOCS/06-Maintenance/Asset-Management.md` | Business Analyst AI |
| 3 | Workflows | `../03-WORKFLOWS/Maintenance-Flows.md` | Solution Architect AI |
| 4 | Business Rules | `../01-BUSINESS-RULES/Maintenance-Rules.md` | Backend Lead AI |
| 5 | Work Orders | `../02-DOMAIN-DOCS/06-Maintenance/Work-Orders.md` | Backend Lead AI |
| 6 | SLA Tracking | `../02-DOMAIN-DOCS/06-Maintenance/SLA-Tracking.md` | Solution Architect AI |
| 7 | Preventive Maintenance | `../02-DOMAIN-DOCS/06-Maintenance/Preventive-Maintenance.md` | Business Analyst AI |
| 8 | API Design Guide | `../04-STANDARDS/API-Design-Guide.md` | Backend Lead AI |
| 9 | Data Modeling | `../04-STANDARDS/Data-Modeling.md` | Database Architect AI |
| 10 | Quality Standards | `../04-STANDARDS/Quality-Standards.md` | Backend Lead AI |

### Required Schema
| Entity | Table | Fields | Agent |
|--------|-------|--------|-------|
| Asset | `maint_assets` | id, name, code, type, category, location, installation_date, status, warranty_expiry, notes | Database Architect AI |
| AssetCategory | `maint_asset_categories` | id, name, code, parent_id, is_active | Database Architect AI |
| WorkOrder | `maint_work_orders` | id, asset_id, number, type, priority, status, description, requested_by, assigned_to, scheduled_date, completed_date, sla_id | Database Architect AI |
| WorkOrderTask | `maint_wo_tasks` | id, work_order_id, description, assignee_id, estimated_hours, actual_hours, status | Database Architect AI |
| SLAContract | `maint_sla_contracts` | id, contract_id, asset_id, response_time, resolution_time, penalty_rate, start_date, end_date | Database Architect AI |
| SLAViolation | `maint_sla_violations` | id, sla_id, work_order_id, violation_type, actual_time, threshold, penalty_amount, created_at | Database Architect AI |
| PreventiveSchedule | `maint_pm_schedules` | id, asset_id, frequency, interval_days, last_run, next_run, is_active | Database Architect AI |
| PMTask | `maint_pm_tasks` | id, schedule_id, description, estimated_duration, required_skills | Database Architect AI |
| MaintenanceLog | `maint_logs` | id, asset_id, work_order_id, log_date, description, technician_id, hours_spent, notes | Database Architect AI |

### Required APIs
| Endpoint | Method | Purpose | Agent |
|----------|--------|---------|-------|
| `/api/maintenance/assets` | GET/POST | Asset registry | Backend Lead AI |
| `/api/maintenance/assets/{id}` | GET/PUT/DELETE | Asset detail | Backend Lead AI |
| `/api/maintenance/assets/{id}/warranty` | GET/POST | Warranty info | Backend Lead AI |
| `/api/maintenance/assets/{id}/maintenance-logs` | GET | Maintenance history | Backend Lead AI |
| `/api/maintenance/work-orders` | GET/POST | Work orders | Backend Lead AI |
| `/api/maintenance/work-orders/{id}` | GET/PUT | Work order detail | Backend Lead AI |
| `/api/maintenance/work-orders/{id}/tasks` | GET/POST | WO tasks | Backend Lead AI |
| `/api/maintenance/work-orders/{id}/complete` | POST | Complete work order | Backend Lead AI |
| `/api/maintenance/sla` | GET/POST | SLA contracts | Backend Lead AI |
| `/api/maintenance/sla/{id}` | GET/PUT | SLA detail | Backend Lead AI |
| `/api/maintenance/sla/{id}/violations` | GET | Violations | Backend Lead AI |
| `/api/maintenance/preventive-schedules` | GET/POST | PM schedules | Backend Lead AI |
| `/api/maintenance/preventive-schedules/{id}/generate` | POST | Generate WOs | Backend Lead AI |
| `/api/maintenance/dashboard` | GET | Maintenance KPIs | Backend Lead AI |

### Required Screens
| Route | Purpose | Agent |
|-------|---------|-------|
| `/maintenance/assets` | Asset registry list | Frontend Lead AI |
| `/maintenance/assets/new` | Register asset | Frontend Lead AI |
| `/maintenance/assets/{id}` | Asset detail | Frontend Lead AI |
| `/maintenance/assets/{id}/history` | Maintenance history | Frontend Lead AI |
| `/maintenance/work-orders` | Work order list | Frontend Lead AI |
| `/maintenance/work-orders/new` | Create work order | Frontend Lead AI |
| `/maintenance/work-orders/{id}` | Work order detail | Frontend Lead AI |
| `/maintenance/work-orders/{id}/tasks` | Task management | Frontend Lead AI |
| `/maintenance/sla` | SLA contracts list | Frontend Lead AI |
| `/maintenance/sla/new` | Create SLA contract | Frontend Lead AI |
| `/maintenance/sla/{id}` | SLA detail | Frontend Lead AI |
| `/maintenance/preventive` | PM schedules | Frontend Lead AI |
| `/maintenance/preventive/new` | Create schedule | Frontend Lead AI |
| `/maintenance/dashboard` | Maintenance dashboard | Frontend Lead AI |

### Dependencies
- CP-CRM-Contracts (SLA data)
- CP-Project-Delivery (asset handover data)
- CP-Inventory (spare parts)

### Output Checklist
- [ ] Backend module with 14+ endpoints
- [ ] Frontend pages with 14+ components
- [ ] Database migration (9 tables)
- [ ] Unit tests (60 minimum)
- [ ] Integration tests
- [ ] API documentation
- [ ] Screen documentation

### Estimated Metrics
- **Backend files:** 12
- **Frontend files:** 16
- **Test files:** 22
- **Document files:** 4
- **Total sprint effort:** 22 days
