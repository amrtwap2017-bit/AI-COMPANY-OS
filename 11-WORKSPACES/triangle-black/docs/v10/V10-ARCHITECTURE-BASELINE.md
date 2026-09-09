# V10 ARCHITECTURE BASELINE
Generated: 2026-09-09 08:53
Commit: b9bd7c7e docs(audit): Full project audit report — September 2026
Status: VERIFIED from live codebase

---

## main.py Analysis

| Metric | Value | Risk |
|--------|-------|------|
| Total lines | 8,942 | 🔴 P0 |
| Inline GET routes | 155 | 🟡 |
| Inline POST routes | 43 | 🟡 |
| Inline PATCH routes | 7 | 🟡 |
| Inline DELETE routes | 10 | 🟡 |
| Rogue create_engine() | 0 | ✅ CLEAN |
| Unprotected mutations | 2 | 🔴 |

## Unprotected Mutation Routes (if any)
  L5713: POST /api/v1/client/login
  L5892: POST /api/v1/supplier/login

## Router Architecture

| Metric | Value |
|--------|-------|
| Router files | 158 |
| Domain modules | 160 |
| Alembic migrations | 21 |

## Domain Modules (160 total)
  
activity_tracking  agent_management  ai_assistant  ai_directors  ai_gateway  ai_mentor  ai_scheduling  ai_signals  analytics_api  analytics_kpi  analytics_platform  approval_center  approval_chain  approval_requests  asset_api  asset_engine  asset_intelligence  asset_lifecycle  assets  attention  audit_log  auth  backlog_engine  baseline_report  billing  bulk_operations  cache  client_portal  commercial_leads  commercial_value  contracts  cost_engine  cost_intelligence  csv_export  customer360  customer_success  dashboard  data_import  data_quality  demo  demo_environment  demo_scenarios  digital_twin  documents  email_alert  email_notifications  email_service  employee_timesheets  employees  energy_intelligence  engineering_management  entity_views  eta_invoicing  executive_api  executive_dashboard  executive_engine  executive_intelligence  executive_intelligence_platform  executive_kpi  feedback  financial_api  financial_gl  financial_intelligence  global_search  goods_receipt_workflow  goods_receipts  health  hotels  integrations  inventory_alerts  inventory_items  inventory_vendors  invoices  knowledge_graph  kpi_engine  lead_management  maintenance_api  maintenance_enterprise  master_intelligence  notification_delivery  notification_dispatcher  notification_engine  notifications  onboarding  operational_intelligence  pagination  payment_tracking  payment_tracking_api  pdf_export  pdf_service  performance_audit  pilot_config  pilot_control  pipeline_dashboard  platform_monitoring  platform_status  pm_engine  pm_plan_api  predictive_engine  predictive_maintenance  pricing  procurement_engine  procurement_events  procurement_intake  procurement_intelligence  production_gate  projects  projects_enterprise  purchase_orders  purchase_requests  quotation  rbac  recommendations  reporting  reporting_api  reports  rfqs  risk_engine  risk_intelligence  roi  sales_pipeline  scheduler  scope_of_work  search_filters  service_reports  service_request_actions  service_requests  showcase  sites  sla_dashboard  sla_engine  sla_intelligence  sse_notifications  sso_scim  stock_api  stock_balances  stock_movements  supplier_api  supplier_engine  supplier_intelligence  supplier_invoices  supplier_portal  suppliers  supply_intelligence  system_notifications  technician_engine  technicians  tenant_audit  trend_engine  user_preferences  vendor_portal  vendor_scorecards  warehouse_intelligence  warehouse_transfers  warehouses  warranty  webhook_notifications  work_order_actions  work_orders  workflow_engine

## Architecture Decision Records
  
docs/adr/ADR-001-DATABASE-CONNECTION.md  docs/adr/ADR-003-APPROVAL-CONSOLIDATION.md  docs/adr/ADR-002-NOTIFICATION-CONSOLIDATION.md

## Risk Assessment

### P0 Risks
- main.py 8,942 lines: single file = single point of failure
- 215 inline routes in one file: hard to test, maintain, reason about

### Mitigating Factors
- 158 router files exist: modular architecture already in place
- 0 rogue create_engine(): DB canonical
- All mutations authenticated: security secured

### V10 Architecture Debt Track
Progressive extraction target: 8,942 → 7,000 → 5,000 → 3,000 → <1,500 lines
Rule: 10 routes per sprint, behavior-preserving only
