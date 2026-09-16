# TRIANGLE BLACK — Security Route Matrix
## Generated: 2026-09-15 20:19
## Total routes scanned: 234

## Summary
| Classification | Count | Meaning |
|---------------|-------|---------|
| PASS | 159 | Protected + tenant-scoped |
| PUBLIC | 3 | Correctly public (login/health) |
| EXEMPT | 5 | Internal/demo (documented) |
| REVIEW | 67 | Needs investigation |

## Full Route Classification

| Method | Path | File | Auth | Classification | Risk |
|--------|------|------|------|----------------|------|
| POST   | `/` | `commercial/activity_tracking/router.py` | ✅ | PASS | Low |
| PATCH  | `/{activity_id}` | `commercial/activity_tracking/router.py` | ✅ | PASS | Low |
| DELETE | `/{activity_id}` | `commercial/activity_tracking/router.py` | ✅ | PASS | Low |
| POST   | `/` | `commercial/agent_management/router.py` | ✅ | PASS | Low |
| PATCH  | `/{agent_id}` | `commercial/agent_management/router.py` | ✅ | PASS | Low |
| DELETE | `/{agent_id}` | `commercial/agent_management/router.py` | ✅ | PASS | Low |
| POST   | `/dispatch/recommend` | `commercial/ai_assistant/dispatch_router.` | ❌ | REVIEW | HIGH |
| POST   | `/documents/boq` | `commercial/ai_assistant/document_router.` | ❌ | REVIEW | HIGH |
| POST   | `/intake/request` | `commercial/ai_assistant/router.py` | ❌ | REVIEW | HIGH |
| POST   | `/intake/create-wo` | `commercial/ai_assistant/router.py` | ❌ | REVIEW | HIGH |
| POST   | `/supply/auto-pr` | `commercial/ai_assistant/supply_automatio` | ❌ | REVIEW | HIGH |
| POST   | `/analyze` | `commercial/ai_directors/router.py` | ✅ | PASS | Low |
| POST   | `/request` | `commercial/ai_gateway/router.py` | ✅ | PASS | Low |
| POST   | `/maintenance-recommendation` | `commercial/ai_gateway/router.py` | ✅ | PASS | Low |
| POST   | `/work-order-summary` | `commercial/ai_gateway/router.py` | ✅ | PASS | Low |
| POST   | `/record-decision` | `commercial/ai_mentor/router.py` | ❌ | EXEMPT | Low (internal) |
| POST   | `/record-outcome/{decision_id}` | `commercial/ai_mentor/router.py` | ❌ | EXEMPT | Low (internal) |
| POST   | `/recommend-dispatch` | `commercial/ai_scheduling/router.py` | ❌ | REVIEW | HIGH |
| POST   | `/{approval_id}/approve` | `commercial/approval_center/router.py` | ✅ | PASS | Low |
| POST   | `/{approval_id}/reject` | `commercial/approval_center/router.py` | ✅ | PASS | Low |
| POST   | `/init/{pr_id}` | `commercial/approval_chain/router.py` | ✅ | PASS | Low |
| POST   | `/approve/{pr_id}/{step}` | `commercial/approval_chain/router.py` | ✅ | PASS | Low |
| POST   | `/reject/{pr_id}/{step}` | `commercial/approval_chain/router.py` | ✅ | PASS | Low |
| POST   | `/generate-po/{pr_id}` | `commercial/approval_chain/router.py` | ✅ | PASS | Low |
| POST   | `/{request_id}/approve` | `commercial/approval_requests/router.py` | ✅ | PASS | Low |
| POST   | `/{request_id}/reject` | `commercial/approval_requests/router.py` | ✅ | PASS | Low |
| POST   | `/import-csv-row` | `commercial/asset_api/router.py` | ❌ | REVIEW | HIGH |
| POST   | `/` | `commercial/assets/router.py` | ✅ | PASS | Low |
| PATCH  | `/{asset_id}` | `commercial/assets/router.py` | ✅ | PASS | Low |
| POST   | `/record` | `commercial/audit_log/router.py` | ❌ | REVIEW | HIGH |
| POST   | `/register` | `commercial/auth/router.py` | ❌ | PUBLIC | None |
| POST   | `/login` | `commercial/auth/router.py` | ❌ | PUBLIC | None |
| POST   | `/refresh` | `commercial/auth/router.py` | ❌ | REVIEW | HIGH |
| POST   | `/logout` | `commercial/auth/router.py` | ❌ | REVIEW | HIGH |
| POST   | `/login/json` | `commercial/auth/router.py` | ❌ | PUBLIC | None |
| POST   | `/checkout-session` | `commercial/billing/router.py` | ✅ | PASS | Low |
| POST   | `/webhook` | `commercial/billing/router.py` | ✅ | PASS | Low |
| POST   | `/work-orders/assign` | `commercial/bulk_operations/router.py` | ✅ | PASS | Low |
| POST   | `/work-orders/update-status` | `commercial/bulk_operations/router.py` | ✅ | PASS | Low |
| POST   | `/purchase-requests/approve` | `commercial/bulk_operations/router.py` | ✅ | PASS | Low |
| POST   | `/` | `commercial/cache/router.py` | ✅ | PASS | Low |
| PATCH  | `/{cacheconfig_id}` | `commercial/cache/router.py` | ✅ | PASS | Low |
| DELETE | `/{cacheconfig_id}` | `commercial/cache/router.py` | ✅ | PASS | Low |
| POST   | `/assessment-request` | `commercial/commercial_leads/router.py` | ❌ | REVIEW | HIGH |
| POST   | `/` | `commercial/contracts/router.py` | ✅ | PASS | Low |
| PATCH  | `/{contract_id}` | `commercial/contracts/router.py` | ✅ | PASS | Low |
| DELETE | `/{contract_id}` | `commercial/contracts/router.py` | ✅ | PASS | Low |
| POST   | `/{contract_id}/activate` | `commercial/contracts/router.py` | ✅ | PASS | Low |
| POST   | `/{contract_id}/renew` | `commercial/contracts/router.py` | ✅ | PASS | Low |
| POST   | `/nps` | `commercial/customer_success/router.py` | ❌ | REVIEW | HIGH |
| POST   | `/preview` | `commercial/data_import/router.py` | ✅ | PASS | Low |
| POST   | `/validate` | `commercial/data_import/router.py` | ✅ | PASS | Low |
| POST   | `/assets` | `commercial/data_import/router.py` | ✅ | PASS | Low |
| POST   | `/suppliers` | `commercial/data_import/router.py` | ✅ | PASS | Low |
| POST   | `/upload/assets` | `commercial/data_import/router.py` | ✅ | PASS | Low |
| POST   | `/upload/suppliers` | `commercial/data_import/router.py` | ✅ | PASS | Low |
| POST   | `/pm-plans` | `commercial/data_import/router.py` | ✅ | PASS | Low |
| POST   | `/upload/pm-plans` | `commercial/data_import/router.py` | ✅ | PASS | Low |
| POST   | `/trigger-scenario` | `commercial/demo_scenarios/router.py` | ❌ | EXEMPT | Low (internal) |
| POST   | `/semantic-graph/simulate-failure` | `commercial/digital_twin/router.py` | ✅ | PASS | Low |
| POST   | `/project/bootstrap` | `commercial/digital_twin/router.py` | ✅ | PASS | Low |
| POST   | `/project/event` | `commercial/digital_twin/router.py` | ✅ | PASS | Low |
| POST   | `/simulate/failure` | `commercial/digital_twin/router.py` | ✅ | PASS | Low |
| POST   | `/documents/upload` | `commercial/documents/router.py` | ✅ | PASS | Low |
| DELETE | `/documents/{document_id}` | `commercial/documents/router.py` | ✅ | PASS | Low |
| POST   | `/critical-wo-alert` | `commercial/email_alert/router.py` | ❌ | REVIEW | HIGH |
| POST   | `/daily-digest` | `commercial/email_alert/router.py` | ❌ | REVIEW | HIGH |
| POST   | `/send` | `commercial/email_notifications/router.py` | ✅ | PASS | Low |
| DELETE | `/{notification_id}` | `commercial/email_notifications/router.py` | ✅ | PASS | Low |
| POST   | `/send` | `commercial/email_service/router.py` | ✅ | PASS | Low |
| POST   | `/` | `commercial/employee_timesheets/router.py` | ❌ | REVIEW | HIGH |
| PATCH  | `/{ts_id}` | `commercial/employee_timesheets/router.py` | ❌ | REVIEW | HIGH |
| POST   | `/{ts_id}/approve` | `commercial/employee_timesheets/router.py` | ❌ | REVIEW | HIGH |
| POST   | `/{ts_id}/reject` | `commercial/employee_timesheets/router.py` | ❌ | REVIEW | HIGH |
| POST   | `/` | `commercial/employees/router.py` | ✅ | PASS | Low |
| PATCH  | `/{emp_id}` | `commercial/employees/router.py` | ❌ | REVIEW | HIGH |
| DELETE | `/{emp_id}` | `commercial/employees/router.py` | ❌ | REVIEW | HIGH |
| POST   | `/submit` | `commercial/eta_invoicing/router.py` | ❌ | REVIEW | HIGH |
| POST   | `/submit` | `commercial/feedback/router.py` | ❌ | REVIEW | HIGH |
| PATCH  | `/{feedback_id}/triage` | `commercial/feedback/router.py` | ❌ | REVIEW | HIGH |
| POST   | `/` | `commercial/financial_gl/router.py` | ✅ | PASS | Low |
| POST   | `/accounts/` | `commercial/financial_gl/router.py` | ❌ | REVIEW | HIGH |
| PATCH  | `/accounts/{account_id}` | `commercial/financial_gl/router.py` | ❌ | REVIEW | HIGH |
| POST   | `/receive/{po_id}` | `commercial/goods_receipt_workflow/router` | ✅ | PASS | Low |
| POST   | `/partial-receive/{po_id}` | `commercial/goods_receipt_workflow/router` | ✅ | PASS | Low |
| POST   | `/` | `commercial/goods_receipts/router.py` | ✅ | PASS | Low |
| PATCH  | `/{grn_id}` | `commercial/goods_receipts/router.py` | ✅ | PASS | Low |
| DELETE | `/{grn_id}` | `commercial/goods_receipts/router.py` | ✅ | PASS | Low |
| POST   | `/` | `commercial/hotels/router.py` | ✅ | PASS | Low |
| PATCH  | `/{hotel_id}` | `commercial/hotels/router.py` | ✅ | PASS | Low |
| DELETE | `/{hotel_id}` | `commercial/hotels/router.py` | ✅ | PASS | Low |
| POST   | `/webhooks/subscribe` | `commercial/integrations/router.py` | ❌ | REVIEW | HIGH |
| POST   | `/webhooks/test-ping` | `commercial/integrations/router.py` | ❌ | EXEMPT | Low (internal) |
| POST   | `/ingest/iot` | `commercial/integrations/router.py` | ❌ | REVIEW | HIGH |
| POST   | `/alerts/` | `commercial/inventory_alerts/router.py` | ❌ | REVIEW | HIGH |
| POST   | `/alerts/{id}/acknowledge/` | `commercial/inventory_alerts/router.py` | ❌ | REVIEW | HIGH |
| POST   | `/` | `commercial/inventory_items/router.py` | ✅ | PASS | Low |
| PATCH  | `/{item_id}` | `commercial/inventory_items/router.py` | ✅ | PASS | Low |
| DELETE | `/{item_id}` | `commercial/inventory_items/router.py` | ✅ | PASS | Low |
| POST   | `/auto-reorder` | `commercial/inventory_items/router.py` | ❌ | REVIEW | HIGH |
| POST   | `/` | `commercial/inventory_vendors/router.py` | ✅ | PASS | Low |
| PATCH  | `/{vendor_id}` | `commercial/inventory_vendors/router.py` | ✅ | PASS | Low |
| DELETE | `/{vendor_id}` | `commercial/inventory_vendors/router.py` | ✅ | PASS | Low |
| POST   | `/` | `commercial/invoices/router.py` | ✅ | PASS | Low |
| PUT    | `/{invoice_id}` | `commercial/invoices/router.py` | ✅ | PASS | Low |
| DELETE | `/{invoice_id}` | `commercial/invoices/router.py` | ✅ | PASS | Low |
| POST   | `/{invoice_id}/payment` | `commercial/invoices/router.py` | ❌ | REVIEW | HIGH |
| POST   | `/` | `commercial/lead_management/router.py` | ✅ | PASS | Low |
| POST   | `/pm-plans` | `commercial/maintenance_enterprise/router` | ✅ | PASS | Low |
| POST   | `/pm-plans/{plan_id}/complete` | `commercial/maintenance_enterprise/router` | ❌ | REVIEW | HIGH |
| POST   | `/{notification_id}/read` | `commercial/notification_delivery/router.` | ❌ | REVIEW | HIGH |
| POST   | `/mark-all-read` | `commercial/notification_delivery/router.` | ❌ | REVIEW | HIGH |
| POST   | `/dispatch` | `commercial/notification_dispatcher/route` | ✅ | PASS | Low |
| POST   | `/create` | `commercial/notification_dispatcher/route` | ✅ | PASS | Low |
| POST   | `/mark-read/{notification_id}` | `commercial/notification_engine/router.py` | ❌ | REVIEW | HIGH |
| PATCH  | `/{notification_id}/read` | `commercial/notifications/router.py` | ✅ | PASS | Low |
| POST   | `/read-all` | `commercial/notifications/router.py` | ✅ | PASS | Low |
| DELETE | `/{notification_id}` | `commercial/notifications/router.py` | ✅ | PASS | Low |
| POST   | `/onboarding/validate` | `commercial/onboarding/router.py` | ❌ | REVIEW | HIGH |
| POST   | `/onboarding/provision` | `commercial/onboarding/router.py` | ❌ | REVIEW | HIGH |
| POST   | `/` | `commercial/payment_tracking/router.py` | ✅ | PASS | Low |
| PUT    | `/{payment_id}` | `commercial/payment_tracking/router.py` | ✅ | PASS | Low |
| POST   | `/attention/item` | `commercial/pilot_control/router.py` | ✅ | PASS | Low |
| POST   | `/attention/item/{item_id}/transition` | `commercial/pilot_control/router.py` | ✅ | PASS | Low |
| POST   | `/` | `commercial/pipeline_dashboard/router.py` | ✅ | PASS | Low |
| PATCH  | `/{pipeline_id}` | `commercial/pipeline_dashboard/router.py` | ✅ | PASS | Low |
| DELETE | `/{pipeline_id}` | `commercial/pipeline_dashboard/router.py` | ✅ | PASS | Low |
| POST   | `/sla-scan` | `commercial/platform_status/router.py` | ❌ | REVIEW | HIGH |
| POST   | `/director/analyze` | `commercial/predictive_maintenance/router` | ❌ | REVIEW | HIGH |
| POST   | `/parse` | `commercial/procurement_intake/router.py` | ✅ | PASS | Low |
| POST   | `/create-pr` | `commercial/procurement_intake/router.py` | ✅ | PASS | Low |
| POST   | `/` | `commercial/projects/router.py` | ✅ | PASS | Low |
| POST   | `/{project_id}/transition` | `commercial/projects/router.py` | ✅ | PASS | Low |
| POST   | `/` | `commercial/purchase_orders/router.py` | ✅ | PASS | Low |
| PATCH  | `/{po_id}` | `commercial/purchase_orders/router.py` | ✅ | PASS | Low |
| DELETE | `/{po_id}` | `commercial/purchase_orders/router.py` | ✅ | PASS | Low |
| POST   | `/` | `commercial/purchase_requests/router.py` | ✅ | PASS | Low |
| PATCH  | `/{pr_id}` | `commercial/purchase_requests/router.py` | ✅ | PASS | Low |
| DELETE | `/{pr_id}` | `commercial/purchase_requests/router.py` | ✅ | PASS | Low |
| POST   | `/{pr_id}/approve` | `commercial/purchase_requests/router.py` | ✅ | PASS | Low |
| POST   | `/{pr_id}/reject` | `commercial/purchase_requests/router.py` | ✅ | PASS | Low |
| POST   | `/` | `commercial/quotation/router.py` | ✅ | PASS | Low |
| PATCH  | `/{quote_id}` | `commercial/quotation/router.py` | ✅ | PASS | Low |
| DELETE | `/{quote_id}` | `commercial/quotation/router.py` | ✅ | PASS | Low |
| POST   | `/users/{user_id}/role` | `commercial/rbac/router.py` | ✅ | PASS | Low |
| POST   | `/generate` | `commercial/recommendations/router.py` | ✅ | PASS | Low |
| POST   | `/expire-stale` | `commercial/recommendations/router.py` | ✅ | PASS | Low |
| POST   | `/{rec_id}/outcome` | `commercial/recommendations/router.py` | ✅ | PASS | Low |
| POST   | `/{rec_id}/approve` | `commercial/recommendations/router.py` | ✅ | PASS | Low |
| POST   | `/{rec_id}/reject` | `commercial/recommendations/router.py` | ✅ | PASS | Low |
| POST   | `/` | `commercial/reporting/router.py` | ✅ | PASS | Low |
| PATCH  | `/{report_id}` | `commercial/reporting/router.py` | ✅ | PASS | Low |
| DELETE | `/{report_id}` | `commercial/reporting/router.py` | ✅ | PASS | Low |
| POST   | `/snapshot` | `commercial/roi/router.py` | ✅ | PASS | Low |
| POST   | `/` | `commercial/scope_of_work/router.py` | ❌ | REVIEW | HIGH |
| PATCH  | `/{sow_id}` | `commercial/scope_of_work/router.py` | ❌ | REVIEW | HIGH |
| POST   | `/{sow_id}/boq-items` | `commercial/scope_of_work/router.py` | ❌ | REVIEW | HIGH |
| POST   | `/{sow_id}/submit-for-approval` | `commercial/scope_of_work/router.py` | ❌ | REVIEW | HIGH |
| POST   | `/` | `commercial/search_filters/router.py` | ❌ | REVIEW | HIGH |
| PATCH  | `/{leadsearch_id}` | `commercial/search_filters/router.py` | ❌ | REVIEW | HIGH |
| DELETE | `/{leadsearch_id}` | `commercial/search_filters/router.py` | ❌ | REVIEW | HIGH |
| POST   | `/` | `commercial/service_reports/router.py` | ✅ | PASS | Low |
| PATCH  | `/{report_id}` | `commercial/service_reports/router.py` | ✅ | PASS | Low |
| DELETE | `/{report_id}` | `commercial/service_reports/router.py` | ✅ | PASS | Low |
| POST   | `/{sr_id}/generate-work-order` | `commercial/service_request_actions/route` | ❌ | REVIEW | HIGH |
| POST   | `/` | `commercial/service_requests/router.py` | ✅ | PASS | Low |
| POST   | `/{sr_id}/convert-to-wo` | `commercial/service_requests/router.py` | ✅ | PASS | Low |
| PATCH  | `/{sr_id}` | `commercial/service_requests/router.py` | ❌ | REVIEW | HIGH |
| POST   | `/{sr_id}/generate-work-order` | `commercial/service_requests/router.py` | ✅ | PASS | Low |
| POST   | `/execute-flow` | `commercial/showcase/router.py` | ❌ | EXEMPT | Low (internal) |
| POST   | `/` | `commercial/sites/router.py` | ✅ | PASS | Low |
| PATCH  | `/{site_id}` | `commercial/sites/router.py` | ✅ | PASS | Low |
| DELETE | `/{site_id}` | `commercial/sites/router.py` | ✅ | PASS | Low |
| POST   | `/config` | `commercial/sso_scim/router.py` | ❌ | REVIEW | HIGH |
| POST   | `/` | `commercial/stock_movements/router.py` | ✅ | PASS | Low |
| DELETE | `/{movement_id}` | `commercial/stock_movements/router.py` | ✅ | PASS | Low |
| POST   | `/vendors/{vendor_id}/quote` | `commercial/supplier_portal/router.py` | ❌ | REVIEW | HIGH |
| POST   | `/` | `commercial/suppliers/router.py` | ❌ | REVIEW | HIGH |
| PATCH  | `/{supplier_id}` | `commercial/suppliers/router.py` | ❌ | REVIEW | HIGH |
| POST   | `/notifications/` | `commercial/system_notifications/router.p` | ✅ | PASS | Low |
| PATCH  | `/notifications/{id}/read` | `commercial/system_notifications/router.p` | ✅ | PASS | Low |
| POST   | `/notifications/bulk-read` | `commercial/system_notifications/router.p` | ✅ | PASS | Low |
| POST   | `/` | `commercial/technicians/router.py` | ❌ | REVIEW | HIGH |
| PATCH  | `/{technician_id}` | `commercial/technicians/router.py` | ❌ | REVIEW | HIGH |
| PUT    | `/{user_id}/{key}` | `commercial/user_preferences/router.py` | ❌ | REVIEW | HIGH |
| POST   | `/{user_id}/bulk` | `commercial/user_preferences/router.py` | ❌ | REVIEW | HIGH |
| DELETE | `/{user_id}/{key}` | `commercial/user_preferences/router.py` | ❌ | REVIEW | HIGH |
| POST   | `/rfqs/{id}/quote` | `commercial/vendor_portal/router.py` | ✅ | PASS | Low |
| PATCH  | `/purchase-orders/{id}/deliver` | `commercial/vendor_portal/router.py` | ✅ | PASS | Low |
| POST   | `/` | `commercial/warehouses/router.py` | ✅ | PASS | Low |
| PATCH  | `/{warehouse_id}` | `commercial/warehouses/router.py` | ✅ | PASS | Low |
| DELETE | `/{warehouse_id}` | `commercial/warehouses/router.py` | ✅ | PASS | Low |
| POST   | `/` | `commercial/warranty/router.py` | ❌ | REVIEW | HIGH |
| POST   | `/` | `commercial/webhook_notifications/router.` | ✅ | PASS | Low |
| PATCH  | `/{webhookconfig_id}` | `commercial/webhook_notifications/router.` | ✅ | PASS | Low |
| DELETE | `/{webhookconfig_id}` | `commercial/webhook_notifications/router.` | ✅ | PASS | Low |
| POST   | `/{wo_id}/complete` | `commercial/work_order_actions/router.py` | ✅ | PASS | Low |
| POST   | `/` | `commercial/work_orders/router.py` | ✅ | PASS | Low |
| PATCH  | `/{work_order_id}` | `commercial/work_orders/router.py` | ❌ | REVIEW | HIGH |
| DELETE | `/{work_order_id}` | `commercial/work_orders/router.py` | ❌ | REVIEW | HIGH |
| POST   | `/{work_order_id}/transition` | `commercial/work_orders/router.py` | ❌ | REVIEW | HIGH |
| POST   | `/{wo_id}/complete` | `commercial/work_orders/router.py` | ❌ | REVIEW | HIGH |
| POST   | `/{wo_id}/close` | `commercial/work_orders/router.py` | ❌ | REVIEW | HIGH |
| POST   | `/definitions` | `commercial/workflow_engine/router.py` | ❌ | REVIEW | HIGH |
| POST   | `/evaluate-policy` | `commercial/workflow_engine/router.py` | ❌ | REVIEW | HIGH |
| POST   | `/instances/{instance_id}/transition` | `commercial/workflow_engine/router.py` | ✅ | PASS | Low |
| POST   | `/leads/{lead_id}/qualify` | `core/actions.py` | ✅ | PASS | Low |
| POST   | `/leads/{lead_id}/assign` | `core/actions.py` | ✅ | PASS | Low |
| POST   | `/leads/{lead_id}/quote` | `core/actions.py` | ✅ | PASS | Low |
| POST   | `/quotes/{quote_id}/submit` | `core/actions.py` | ✅ | PASS | Low |
| POST   | `/quotes/{quote_id}/send` | `core/actions.py` | ✅ | PASS | Low |
| POST   | `/quotes/{quote_id}/approve` | `core/actions.py` | ✅ | PASS | Low |
| POST   | `/quotes/{quote_id}/reject` | `core/actions.py` | ✅ | PASS | Low |
| POST   | `/quotes/expire-overdue` | `core/actions.py` | ✅ | PASS | Low |
| POST   | `/users` | `core/actions.py` | ✅ | PASS | Low |
| POST   | `/leads/create` | `core/actions.py` | ✅ | PASS | Low |
| PATCH  | `/leads/{lead_id}` | `core/actions.py` | ✅ | PASS | Low |
| POST   | `/agents/create` | `core/actions.py` | ✅ | PASS | Low |
| POST   | `/leads/{lead_id}/note` | `core/actions.py` | ✅ | PASS | Low |
| POST   | `/work-orders/{work_order_id}/assign` | `core/actions.py` | ✅ | PASS | Low |
| POST   | `/work-orders/{work_order_id}/complete` | `core/actions.py` | ✅ | PASS | Low |
| POST   | `/inventory/adjust` | `core/actions.py` | ✅ | PASS | Low |
| POST   | `/inventory/purchase-requests/{pr_id}/approve` | `core/actions.py` | ✅ | PASS | Low |
| POST   | `/inventory/purchase-orders/{po_id}/approve` | `core/actions.py` | ✅ | PASS | Low |
| POST   | `/procurement/purchase-requests/{pr_id}/convert-to-` | `core/actions.py` | ✅ | PASS | Low |
| POST   | `/procurement/goods-receipts/{grn_id}/receive` | `core/actions.py` | ✅ | PASS | Low |
| POST   | `/procurement/rfqs` | `core/actions.py` | ✅ | PASS | Low |
| POST   | `/procurement/rfqs/{rfq_id}/award/{vendor_quote_id}` | `core/actions.py` | ✅ | PASS | Low |
| POST   | `/inventory/rebuild-balances` | `core/actions.py` | ✅ | PASS | Low |
| POST   | `/maintenance_schedules/` | `orchestrator/maintenance_schedule_router` | ✅ | PASS | Low |
| PUT    | `/maintenance_schedules/{schedule_id}` | `orchestrator/maintenance_schedule_router` | ✅ | PASS | Low |
| DELETE | `/maintenance_schedules/{schedule_id}` | `orchestrator/maintenance_schedule_router` | ✅ | PASS | Low |
| POST   | `/tb/reload` | `orchestrator/reload_router.py` | ❌ | REVIEW | HIGH |
| POST   | `/orchestrator/plan-sprint/{workspace_id}` | `orchestrator/routers/sprint_plans.py` | ❌ | REVIEW | HIGH |

## HIGH PRIORITY REVIEW (unprotected mutations)

These routes require investigation before production:

- `POST /dispatch/recommend` — `commercial/ai_assistant/dispatch_router.py`
- `POST /documents/boq` — `commercial/ai_assistant/document_router.py`
- `POST /intake/request` — `commercial/ai_assistant/router.py`
- `POST /intake/create-wo` — `commercial/ai_assistant/router.py`
- `POST /supply/auto-pr` — `commercial/ai_assistant/supply_automation_router.py`
- `POST /recommend-dispatch` — `commercial/ai_scheduling/router.py`
- `POST /import-csv-row` — `commercial/asset_api/router.py`
- `POST /record` — `commercial/audit_log/router.py`
- `POST /refresh` — `commercial/auth/router.py`
- `POST /logout` — `commercial/auth/router.py`
- `POST /assessment-request` — `commercial/commercial_leads/router.py`
- `POST /nps` — `commercial/customer_success/router.py`
- `POST /critical-wo-alert` — `commercial/email_alert/router.py`
- `POST /daily-digest` — `commercial/email_alert/router.py`
- `POST /` — `commercial/employee_timesheets/router.py`
- `PATCH /{ts_id}` — `commercial/employee_timesheets/router.py`
- `POST /{ts_id}/approve` — `commercial/employee_timesheets/router.py`
- `POST /{ts_id}/reject` — `commercial/employee_timesheets/router.py`
- `PATCH /{emp_id}` — `commercial/employees/router.py`
- `DELETE /{emp_id}` — `commercial/employees/router.py`
- `POST /submit` — `commercial/eta_invoicing/router.py`
- `POST /submit` — `commercial/feedback/router.py`
- `PATCH /{feedback_id}/triage` — `commercial/feedback/router.py`
- `POST /accounts/` — `commercial/financial_gl/router.py`
- `PATCH /accounts/{account_id}` — `commercial/financial_gl/router.py`
- `POST /webhooks/subscribe` — `commercial/integrations/router.py`
- `POST /ingest/iot` — `commercial/integrations/router.py`
- `POST /alerts/` — `commercial/inventory_alerts/router.py`
- `POST /alerts/{id}/acknowledge/` — `commercial/inventory_alerts/router.py`
- `POST /auto-reorder` — `commercial/inventory_items/router.py`
- `POST /{invoice_id}/payment` — `commercial/invoices/router.py`
- `POST /pm-plans/{plan_id}/complete` — `commercial/maintenance_enterprise/router.py`
- `POST /{notification_id}/read` — `commercial/notification_delivery/router.py`
- `POST /mark-all-read` — `commercial/notification_delivery/router.py`
- `POST /mark-read/{notification_id}` — `commercial/notification_engine/router.py`
- `POST /onboarding/validate` — `commercial/onboarding/router.py`
- `POST /onboarding/provision` — `commercial/onboarding/router.py`
- `POST /sla-scan` — `commercial/platform_status/router.py`
- `POST /director/analyze` — `commercial/predictive_maintenance/router.py`
- `POST /` — `commercial/scope_of_work/router.py`
- `PATCH /{sow_id}` — `commercial/scope_of_work/router.py`
- `POST /{sow_id}/boq-items` — `commercial/scope_of_work/router.py`
- `POST /{sow_id}/submit-for-approval` — `commercial/scope_of_work/router.py`
- `POST /` — `commercial/search_filters/router.py`
- `PATCH /{leadsearch_id}` — `commercial/search_filters/router.py`
- `DELETE /{leadsearch_id}` — `commercial/search_filters/router.py`
- `POST /{sr_id}/generate-work-order` — `commercial/service_request_actions/router.py`
- `PATCH /{sr_id}` — `commercial/service_requests/router.py`
- `POST /config` — `commercial/sso_scim/router.py`
- `POST /vendors/{vendor_id}/quote` — `commercial/supplier_portal/router.py`
- `POST /` — `commercial/suppliers/router.py`
- `PATCH /{supplier_id}` — `commercial/suppliers/router.py`
- `POST /` — `commercial/technicians/router.py`
- `PATCH /{technician_id}` — `commercial/technicians/router.py`
- `PUT /{user_id}/{key}` — `commercial/user_preferences/router.py`
- `POST /{user_id}/bulk` — `commercial/user_preferences/router.py`
- `DELETE /{user_id}/{key}` — `commercial/user_preferences/router.py`
- `POST /` — `commercial/warranty/router.py`
- `PATCH /{work_order_id}` — `commercial/work_orders/router.py`
- `DELETE /{work_order_id}` — `commercial/work_orders/router.py`
- `POST /{work_order_id}/transition` — `commercial/work_orders/router.py`
- `POST /{wo_id}/complete` — `commercial/work_orders/router.py`
- `POST /{wo_id}/close` — `commercial/work_orders/router.py`
- `POST /definitions` — `commercial/workflow_engine/router.py`
- `POST /evaluate-policy` — `commercial/workflow_engine/router.py`
- `POST /tb/reload` — `orchestrator/reload_router.py`
- `POST /orchestrator/plan-sprint/{workspace_id}` — `orchestrator/routers/sprint_plans.py`

## RULES
- Every production mutation MUST have authentication
- REVIEW routes must be classified before V14 GO/NO-GO
- PUBLIC = login/register/health (correct — no action needed)
- EXEMPT = demo/internal routes (document the justification)