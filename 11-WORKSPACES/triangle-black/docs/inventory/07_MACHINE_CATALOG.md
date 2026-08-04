# Machine Inventory Snapshot

Generated from the current checkout for traceability. Paths are implementation inventory, not support/production status.

## API endpoints
src/admin_portal_foundation/router.py:7:@router.get("/health")
src/analytics_api/router.py:7:@router.get("/health")
src/client_portal_api_complete/router.py:7:@router.get("/health")
src/client_portal_api_layer/router.py:7:@router.get("/health")
src/commercial/activity_tracking/router.py:20:@router.post("/", response_model=ActivityResponse, status_code=201)
src/commercial/activity_tracking/router.py:31:@router.get("/", response_model=List[ActivityResponse])
src/commercial/activity_tracking/router.py:41:@router.get("/{activity_id}", response_model=ActivityResponse)
src/commercial/activity_tracking/router.py:53:@router.patch("/{activity_id}", response_model=ActivityResponse)
src/commercial/activity_tracking/router.py:68:@router.delete("/{activity_id}", status_code=204)
src/commercial/agent_management/router.py:20:@router.post("/", response_model=AgentResponse, status_code=201)
src/commercial/agent_management/router.py:31:@router.get("/", response_model=List[AgentResponse])
src/commercial/agent_management/router.py:41:@router.get("/{agent_id}", response_model=AgentResponse)
src/commercial/agent_management/router.py:53:@router.patch("/{agent_id}", response_model=AgentResponse)
src/commercial/agent_management/router.py:68:@router.delete("/{agent_id}", status_code=204)
src/commercial/ai_assistant/analytics_router.py:11:@router.get("/analytics/sla", summary="SLA compliance metrics from work orders")
src/commercial/ai_assistant/analytics_router.py:148:@router.get("/analytics/trends", summary="Monthly WO completion trend for last 6 months")
src/commercial/ai_assistant/analytics_router.py:193:@router.get("/health", summary="AI layer health check")
src/commercial/ai_assistant/analytics_router.py:223:@router.get("/analytics/costs", summary="WO cost analysis and contract profitability")
src/commercial/ai_assistant/analytics_router.py:235:@router.get("/analytics/costs/summary", summary="Cost summary for dashboard")
src/commercial/ai_assistant/analytics_router.py:87:@router.get("/analytics/kpis/live", summary="Live operational KPIs for executive dashboard")
src/commercial/ai_assistant/dispatch_router.py:55:@router.post("/dispatch/recommend", summary="Recommend best technician for a work order")
src/commercial/ai_assistant/document_router.py:28:@router.post("/documents/boq", summary="Create Bill of Quantities")
src/commercial/ai_assistant/document_router.py:79:@router.get("/documents/boq/template", summary="Get BOQ template for a WO type")
src/commercial/ai_assistant/router.py:128:@router.post("/intake/create-wo", summary="Create work order from parsed request")
src/commercial/ai_assistant/router.py:66:@router.post("/intake/request", summary="Parse incoming request to work order")
src/commercial/ai_assistant/signals_router.py:11:@router.get("/signals", summary="Get all operational signals")
src/commercial/ai_assistant/signals_router.py:43:@router.get("/signals/summary", summary="Signal counts by priority for dashboard badge")
src/commercial/ai_assistant/supply_automation_router.py:101:@router.post("/supply/auto-pr", summary="Auto-create Purchase Request from Work Order")
src/commercial/ai_assistant/supply_automation_router.py:24:@router.get("/supply/inventory-check", summary="Check inventory for work order type")
src/commercial/ai_mentor/router.py:173:@router.post("/record-decision", summary="Record a procurement decision for learning")
src/commercial/ai_mentor/router.py:203:@router.post("/record-outcome/{decision_id}", summary="Record decision outcome")
src/commercial/ai_mentor/router.py:221:@router.get("/learning-insights", summary="AI learning insights from decisions")
src/commercial/ai_mentor/router.py:83:@router.get("/guidance/{context_type}", summary="Get best practice guidance")
src/commercial/ai_scheduling/router.py:128:@router.get("/daily-plan/{hotel_id}", summary="Daily operations plan for hotel")
src/commercial/ai_scheduling/router.py:24:@router.get("/capacity", summary="Technician capacity overview")
src/commercial/ai_scheduling/router.py:70:@router.post("/recommend-dispatch", summary="AI dispatch recommendation")
src/commercial/ai_signals/router.py:251:@router.get("/signals/v2", summary="Cross-domain AI signals")
src/commercial/analytics_kpi/router.py:142:@router.get("/cashflow", summary="Monthly cash flow — inflow vs outflow")
src/commercial/analytics_kpi/router.py:206:@router.get("/trends", summary="Revenue and lead trends")
src/commercial/analytics_kpi/router.py:24:@router.get("/kpis", summary="Enterprise KPI summary")
src/commercial/analytics_kpi/router.py:25:@router.get("/kpis/", summary="Enterprise KPI summary")
src/commercial/analytics_platform/router.py:22:@router.get("/kpis", summary="Cross-center KPIs")
src/commercial/analytics_platform/router.py:52:@router.get("/scorecards", summary="Enterprise scorecards")
src/commercial/analytics_platform/router.py:67:@router.get("/sla", summary="SLA metrics")
src/commercial/analytics_platform/router.py:84:@router.get("/trends", summary="Trend data for charts")
src/commercial/approval_center/router.py:116:@router.post("/{approval_id}/approve", summary="Approve an item")
src/commercial/approval_center/router.py:146:@router.post("/{approval_id}/reject", summary="Reject an item")
src/commercial/approval_center/router.py:31:@router.get("/", summary="Unified approval queue")
src/commercial/approval_center/router.py:82:@router.get("", summary="Unified approval queue (no-slash alias)")
src/commercial/approval_center/router.py:91:@router.get("/count", summary="Pending approval count")
src/commercial/approval_chain/router.py:117:@router.post("/approve/{pr_id}/{step}", summary="Approve a chain step")
src/commercial/approval_chain/router.py:174:@router.post("/reject/{pr_id}/{step}", summary="Reject at any step")
src/commercial/approval_chain/router.py:208:@router.post("/generate-po/{pr_id}", summary="Auto-generate PO after full approval")
src/commercial/approval_chain/router.py:291:@router.get("/chain-status/{pr_id}", summary="Full approval chain status")
src/commercial/approval_chain/router.py:74:@router.post("/init/{pr_id}", summary="Initialize 3-step approval chain")
src/commercial/approval_requests/router.py:16:@router.get("/")
src/commercial/approval_requests/router.py:37:@router.get("/pending")
src/commercial/approval_requests/router.py:46:@router.get("/{request_id}")
src/commercial/approval_requests/router.py:57:@router.post("/{request_id}/approve")
src/commercial/approval_requests/router.py:96:@router.post("/{request_id}/reject")
src/commercial/assets/router.py:110:@router.patch("/{asset_id}", summary="Update asset")
src/commercial/assets/router.py:122:@router.get("/{asset_id}/work-orders", summary="Asset work orders")
src/commercial/assets/router.py:20:@router.get("/", summary="List assets")
src/commercial/assets/router.py:40:@router.get("", summary="List assets")
src/commercial/assets/router.py:59:@router.get("/tree", summary="Asset hierarchy tree")
src/commercial/assets/router.py:73:@router.get("/{asset_id}", summary="Get asset")
src/commercial/assets/router.py:79:@router.post("/", status_code=201, summary="Create asset")
src/commercial/audit_log/router.py:133:@router.get("/summary", summary="Audit log summary stats")
src/commercial/audit_log/router.py:34:@router.post("/record", summary="Record an audit event")
src/commercial/audit_log/router.py:74:@router.get("/entity/{entity_type}/{entity_id}", summary="Audit trail for entity")
src/commercial/audit_log/router.py:99:@router.get("/recent", summary="Recent platform audit events")
src/commercial/auth/router.py:102:@router.get("/me", response_model=ProfileOut)
src/commercial/auth/router.py:110:@router.post("/logout")
src/commercial/auth/router.py:50:@router.post("/register", response_model=TokenOut, status_code=201)
src/commercial/auth/router.py:74:@router.post("/login", response_model=TokenOut)
src/commercial/auth/router.py:88:@router.post("/refresh", response_model=TokenOut)
src/commercial/bulk_operations/router.py:146:@router.post("/purchase-requests/approve", summary="Bulk approve purchase requests")
src/commercial/bulk_operations/router.py:16:@router.post("/work-orders/assign", summary="Bulk assign work orders to technician")
src/commercial/bulk_operations/router.py:195:@router.get("/summary", summary="Bulk operations summary")
src/commercial/bulk_operations/router.py:87:@router.post("/work-orders/update-status", summary="Bulk update work order status")
src/commercial/cache/router.py:20:@router.post("/", response_model=CacheConfigResponse, status_code=201)
src/commercial/cache/router.py:31:@router.get("/", response_model=List[CacheConfigResponse])
src/commercial/cache/router.py:41:@router.get("/{cacheconfig_id}", response_model=CacheConfigResponse)
src/commercial/cache/router.py:53:@router.patch("/{cacheconfig_id}", response_model=CacheConfigResponse)
src/commercial/cache/router.py:68:@router.delete("/{cacheconfig_id}", status_code=204)
src/commercial/contracts/router.py:108:@router.patch("/{contract_id}", response_model=ContractResponse)
src/commercial/contracts/router.py:123:@router.delete("/{contract_id}", status_code=204)
src/commercial/contracts/router.py:135:@router.post("/{contract_id}/activate", response_model=ContractResponse)
src/commercial/contracts/router.py:178:@router.post("/{contract_id}/renew", response_model=ContractResponse)
src/commercial/contracts/router.py:75:@router.post("/", response_model=ContractResponse, status_code=201)
src/commercial/contracts/router.py:86:@router.get("/", response_model=List[ContractResponse])
src/commercial/contracts/router.py:96:@router.get("/{contract_id}", response_model=ContractResponse)
src/commercial/csv_export/router.py:106:@router.get("/invoices", summary="Export invoices as CSV")
src/commercial/csv_export/router.py:134:@router.get("/leads", summary="Export leads as CSV")
src/commercial/csv_export/router.py:161:@router.get("/technicians", summary="Export technicians as CSV")
src/commercial/csv_export/router.py:181:@router.get("/vendors", summary="Export vendors as CSV")
src/commercial/csv_export/router.py:213:@router.get("/supplier-invoices", summary="Export supplier invoices as CSV")
src/commercial/csv_export/router.py:248:@router.get("/time-entries", summary="Export time entries as CSV")
src/commercial/csv_export/router.py:282:@router.get("/purchase-orders", summary="Export purchase orders as CSV")
src/commercial/csv_export/router.py:317:@router.get("/scope-of-work", summary="Export scope of work as CSV")
src/commercial/csv_export/router.py:45:@router.get("/work-orders", summary="Export work orders as CSV")
src/commercial/csv_export/router.py:76:@router.get("/assets", summary="Export assets as CSV")
src/commercial/customer360/router.py:15:@router.get("/{customer_id}")
src/commercial/customer360/router.py:73:@router.get("/")
src/commercial/customer_success/router.py:106:@router.post("/nps", summary="Submit NPS survey response")
src/commercial/customer_success/router.py:141:@router.get("/nps/summary", summary="NPS score summary")
src/commercial/customer_success/router.py:173:@router.get("/at-risk", summary="At-risk clients by critical WO count")
src/commercial/customer_success/router.py:29:@router.get("/overview", summary="Customer success overview")
src/commercial/customer_success/router.py:78:@router.get("/renewals", summary="Contracts expiring in 90 days")
src/commercial/dashboard/router.py:18:@router.get('/dashboard/executive', response_model=ExecutiveDashboardResponse)
src/commercial/digital_twin/router.py:39:@router.get("/state", summary="Digital Twin operational state")
src/commercial/documents/router.py:17:@router.post('/documents/upload', response_model=DocumentResponse, status_code=201)
src/commercial/documents/router.py:31:@router.get('/documents', response_model=list[DocumentResponse])
src/commercial/documents/router.py:42:@router.get('/documents/{document_id}/download', status_code=200)
src/commercial/documents/router.py:54:@router.delete('/documents/{document_id}', status_code=204)
src/commercial/email_alert/router.py:133:@router.post("/daily-digest", summary="Send daily operations digest")
src/commercial/email_alert/router.py:192:@router.get("/config", summary="Email configuration status")
src/commercial/email_alert/router.py:83:@router.post("/critical-wo-alert", summary="Send alert for critical unassigned WO")
src/commercial/email_notifications/router.py:26:@router.post("/send", response_model=EmailNotificationResponse, status_code=201)
src/commercial/email_notifications/router.py:43:@router.get("/", response_model=List[EmailNotificationResponse])
src/commercial/email_notifications/router.py:57:@router.get("/{notification_id}", response_model=EmailNotificationResponse)
src/commercial/email_notifications/router.py:69:@router.delete("/{notification_id}", status_code=204)
src/commercial/email_service/router.py:12:@router.post("/api/v1/email/send", response_model=EmailSendRequest, status_code=201)
src/commercial/email_service/router.py:22:@router.get("/api/v1/email/logs", response_model=list[EmailLog])
src/commercial/executive_dashboard/router.py:9:@router.get('/executive', response_model=ExecutiveDashboardResponse)
src/commercial/executive_intelligence/router.py:102:@router.get("/exceptions", summary="Exception items requiring leadership attention")
src/commercial/executive_intelligence/router.py:116:@router.get("/daily-review", summary="Executive daily review")
src/commercial/executive_intelligence/router.py:136:@router.get("/alerts/predictive", summary="Predictive alerts")
src/commercial/executive_intelligence/router.py:22:@router.get("/dashboard", summary="Executive dashboard")
src/commercial/executive_intelligence/router.py:50:@router.get("/intelligence", summary="Executive intelligence summary")
src/commercial/executive_intelligence/router.py:74:@router.get("/portfolio", summary="Portfolio overview")
src/commercial/executive_intelligence/router.py:91:@router.get("/risks", summary="Enterprise risk signals")
src/commercial/executive_kpi/router.py:102:@router.get("/trends/revenue", summary="Revenue trend last 6 months")
src/commercial/executive_kpi/router.py:128:@router.get("/trends/operations", summary="Operations trend last 6 months")
src/commercial/executive_kpi/router.py:154:@router.get("/scorecard", summary="Executive balanced scorecard")
src/commercial/executive_kpi/router.py:23:@router.get("/summary", summary="Executive KPI summary")
src/commercial/global_search/router.py:15:@router.get("/", summary="Global full-text search")
src/commercial/global_search/router.py:180:@router.get("/quick", summary="Quick search — top 3 per entity type")
src/commercial/goods_receipt_workflow/router.py:187:@router.post("/partial-receive/{po_id}", summary="Partial delivery receipt")
src/commercial/goods_receipt_workflow/router.py:203:@router.get("/pending-receipts", summary="POs waiting for goods receipt")
src/commercial/goods_receipt_workflow/router.py:243:@router.get("/cycle-status/{pr_id}", summary="Complete procurement cycle status")
src/commercial/goods_receipt_workflow/router.py:47:@router.post("/receive/{po_id}", summary="Record goods receipt for PO")
src/commercial/goods_receipts/router.py:20:@router.post("/", response_model=GoodsReceiptResponse, status_code=201)
src/commercial/goods_receipts/router.py:31:@router.get("/", response_model=List[GoodsReceiptResponse])
src/commercial/goods_receipts/router.py:41:@router.get("/{grn_id}", response_model=GoodsReceiptResponse)
src/commercial/goods_receipts/router.py:53:@router.patch("/{grn_id}", response_model=GoodsReceiptResponse)
src/commercial/goods_receipts/router.py:68:@router.delete("/{grn_id}", status_code=204)
src/commercial/hotels/router.py:19:@router.post("/", response_model=HotelResponse, status_code=201)
src/commercial/hotels/router.py:29:@router.get("/", response_model=List[HotelResponse])
src/commercial/hotels/router.py:38:@router.get("/{hotel_id}", response_model=HotelResponse)
src/commercial/hotels/router.py:49:@router.patch("/{hotel_id}", response_model=HotelResponse)
src/commercial/hotels/router.py:63:@router.delete("/{hotel_id}", status_code=204)
src/commercial/inventory_alerts/router.py:14:@router.get('/alerts/', response_model=list[InventoryAlertResponse])
src/commercial/inventory_alerts/router.py:20:@router.post('/alerts/{id}/acknowledge/', response_model=InventoryAlertResponse, status_code=201)
src/commercial/inventory_alerts/router.py:9:@router.post('/alerts/', response_model=InventoryAlertResponse, status_code=201)
src/commercial/inventory_items/router.py:129:@router.post("/auto-reorder", summary="Create PRs for all below-minimum items")
src/commercial/inventory_items/router.py:20:@router.post("/", response_model=InventoryItemResponse, status_code=201)
src/commercial/inventory_items/router.py:31:@router.get("/", response_model=List[InventoryItemResponse])
src/commercial/inventory_items/router.py:41:@router.get("/{item_id}", response_model=InventoryItemResponse)
src/commercial/inventory_items/router.py:53:@router.patch("/{item_id}", response_model=InventoryItemResponse)
src/commercial/inventory_items/router.py:68:@router.delete("/{item_id}", status_code=204)
src/commercial/inventory_items/router.py:87:@router.get("/reorder-alerts", summary="Items below minimum stock")
src/commercial/inventory_vendors/router.py:20:@router.post("/", response_model=InventoryVendorResponse, status_code=201)
src/commercial/inventory_vendors/router.py:31:@router.get("/", response_model=List[InventoryVendorResponse])
src/commercial/inventory_vendors/router.py:41:@router.get("/{vendor_id}", response_model=InventoryVendorResponse)
src/commercial/inventory_vendors/router.py:53:@router.patch("/{vendor_id}", response_model=InventoryVendorResponse)
src/commercial/inventory_vendors/router.py:68:@router.delete("/{vendor_id}", status_code=204)
src/commercial/invoices/router.py:126:@router.post("/{invoice_id}/payment", summary="Record invoice payment")
src/commercial/invoices/router.py:15:@router.get("/", summary="List invoices")
src/commercial/invoices/router.py:197:@router.get("/{invoice_id}/payments", summary="Invoice payment history")
src/commercial/invoices/router.py:26:@router.post("/", response_model=InvoiceResponse, status_code=201)
src/commercial/invoices/router.py:37:@router.get("/payment-summary", summary="Overall invoice payment summary")
src/commercial/invoices/router.py:75:@router.get("/{invoice_id}", response_model=InvoiceResponse)
src/commercial/invoices/router.py:86:@router.put("/{invoice_id}", response_model=InvoiceResponse)
src/commercial/invoices/router.py:96:@router.delete("/{invoice_id}", status_code=204)
src/commercial/knowledge_graph/router.py:179:@router.get("/path/{from_type}/{from_id}/{to_type}", summary="Graph path traversal")
src/commercial/knowledge_graph/router.py:212:@router.get("/stats", summary="Graph statistics")
src/commercial/knowledge_graph/router.py:25:@router.get("/overview", summary="Knowledge graph overview")
src/commercial/knowledge_graph/router.py:59:@router.get("/entity/{entity_type}/{entity_id}", summary="Entity relationships")
src/commercial/lead_management/router.py:10:@router.post('/', status_code=201)
src/commercial/lead_management/router.py:17:@router.get('/')
src/commercial/maintenance_enterprise/router.py:107:@router.get("/schedule", summary="Maintenance schedule")
src/commercial/maintenance_enterprise/router.py:116:@router.get("/asset-tree", summary="Hierarchical asset tree")
src/commercial/maintenance_enterprise/router.py:132:@router.get("/intelligence", summary="Maintenance intelligence summary")
src/commercial/maintenance_enterprise/router.py:152:@router.get("/actions", summary="Maintenance action items")
src/commercial/maintenance_enterprise/router.py:162:@router.get("/costs", summary="Maintenance costs review")
src/commercial/maintenance_enterprise/router.py:172:@router.get("/downtime", summary="Asset downtime records")
src/commercial/maintenance_enterprise/router.py:23:@router.get("/dashboard", summary="Maintenance dashboard KPIs")
src/commercial/maintenance_enterprise/router.py:44:@router.get("/pm-plans", summary="List preventive maintenance plans")
src/commercial/maintenance_enterprise/router.py:59:@router.get("/pm-plans/{plan_id}", summary="Get PM plan")
src/commercial/maintenance_enterprise/router.py:66:@router.post("/pm-plans", status_code=201, summary="Create PM plan")
src/commercial/maintenance_enterprise/router.py:91:@router.get("/work-items", summary="Maintenance work items")
src/commercial/notification_engine/router.py:164:@router.get("/", summary="Live platform notifications")
src/commercial/notification_engine/router.py:190:@router.post("/mark-read/{notification_id}", summary="Mark notification read")
src/commercial/notification_engine/router.py:203:@router.get("/count", summary="Unread notification count")
src/commercial/notifications/router.py:23:@router.get("/")
src/commercial/notifications/router.py:53:@router.get("/unread", response_model=dict)
src/commercial/notifications/router.py:62:@router.patch("/{notification_id}/read", response_model=NotificationResponse)
src/commercial/notifications/router.py:74:@router.post("/read-all", response_model=dict)
src/commercial/notifications/router.py:83:@router.delete("/{notification_id}", response_model=dict)
src/commercial/pagination/router.py:21:@router.get("/stats")
src/commercial/pagination/router.py:30:@router.get("/logs", response_model=List[PaginationLogResponse])
src/commercial/payment_tracking/router.py:16:@router.post('/', response_model=PaymentResponse, status_code=201)
src/commercial/payment_tracking/router.py:27:@router.get('/{payment_id}', response_model=PaymentResponse)
src/commercial/payment_tracking/router.py:40:@router.put('/{payment_id}', response_model=PaymentResponse)
src/commercial/pdf_export/router.py:140:@router.get("/work-order/{{wo_id}}", summary="Export work order as HTML/PDF")
src/commercial/pdf_export/router.py:167:@router.get("/invoice/{{invoice_id}}", summary="Export invoice as HTML/PDF")
src/commercial/pdf_export/router.py:194:@router.get("/monthly-report", summary="Monthly operations summary HTML")
src/commercial/pdf_export/router.py:268:@router.get("/preview/work-order/{wo_id}", summary="Preview work order HTML")
src/commercial/pdf_export/router.py:285:@router.get("/preview/monthly-report", summary="Preview monthly report HTML")
src/commercial/performance_audit/router.py:104:@router.get("/index-check", summary="Check for missing indexes on key columns")
src/commercial/performance_audit/router.py:27:@router.get("/query-audit", summary="Audit critical query performance")
src/commercial/performance_audit/router.py:67:@router.get("/table-sizes", summary="Database table sizes and row counts")
src/commercial/pipeline_dashboard/router.py:20:@router.post("/", response_model=PipelineResponse, status_code=201)
src/commercial/pipeline_dashboard/router.py:31:@router.get("/", response_model=List[PipelineResponse])
src/commercial/pipeline_dashboard/router.py:41:@router.get("/{pipeline_id}", response_model=PipelineResponse)
src/commercial/pipeline_dashboard/router.py:53:@router.patch("/{pipeline_id}", response_model=PipelineResponse)
src/commercial/pipeline_dashboard/router.py:68:@router.delete("/{pipeline_id}", status_code=204)
src/commercial/predictive_maintenance/router.py:100:@router.get("/health-scores", summary="Asset health scores for all assets")
src/commercial/predictive_maintenance/router.py:223:@router.get("/risk-summary", summary="Asset risk summary by category")
src/commercial/procurement_intake/router.py:238:@router.post("/create-pr", summary="Auto-create PR from intake result")
src/commercial/procurement_intake/router.py:321:@router.get("/status/{intake_id}", summary="Full intake journey status")
src/commercial/procurement_intake/router.py:85:@router.post("/parse", summary="Parse procurement request from any channel")
src/commercial/projects/router.py:101:@router.get("/portfolio/summary", summary="All projects portfolio summary")
src/commercial/projects/router.py:145:@router.get("/{project_id}", summary="Get project")
src/commercial/projects/router.py:152:@router.get("/{project_id}/phases", summary="Project phases")
src/commercial/projects/router.py:157:@router.get("/{project_id}/risks", summary="Project risks")
src/commercial/projects/router.py:162:@router.get("/{project_id}/milestones", summary="Project milestones")
src/commercial/projects/router.py:167:@router.post("/{project_id}/transition")
src/commercial/projects/router.py:203:@router.get("/{project_id}/transitions")
src/commercial/projects/router.py:225:@router.get("/{project_id}/financials", summary="Project earned value metrics")
src/commercial/projects/router.py:23:@router.get("/", summary="List projects")
src/commercial/projects/router.py:42:@router.get("/dashboard", summary="Projects dashboard")
src/commercial/projects/router.py:52:@router.post("/", status_code=201, summary="Create project")
src/commercial/projects/router.py:78:@router.get("/intelligence/summary", summary="Projects intelligence")
src/commercial/purchase_orders/router.py:20:@router.post("/", response_model=PurchaseOrderResponse, status_code=201)
src/commercial/purchase_orders/router.py:31:@router.get("/", response_model=List[PurchaseOrderResponse])
src/commercial/purchase_orders/router.py:41:@router.get("/{po_id}", response_model=PurchaseOrderResponse)
src/commercial/purchase_orders/router.py:53:@router.patch("/{po_id}", response_model=PurchaseOrderResponse)
src/commercial/purchase_orders/router.py:68:@router.delete("/{po_id}", status_code=204)
src/commercial/purchase_requests/router.py:113:@router.post("/{pr_id}/reject", status_code=200)
src/commercial/purchase_requests/router.py:146:@router.get("/{pr_id}/status", status_code=200)
src/commercial/purchase_requests/router.py:20:@router.post("/", response_model=PurchaseRequestResponse, status_code=201)
src/commercial/purchase_requests/router.py:31:@router.get("/", response_model=List[PurchaseRequestResponse])
src/commercial/purchase_requests/router.py:41:@router.get("/{pr_id}", response_model=PurchaseRequestResponse)
src/commercial/purchase_requests/router.py:53:@router.patch("/{pr_id}", response_model=PurchaseRequestResponse)
src/commercial/purchase_requests/router.py:68:@router.delete("/{pr_id}", status_code=204)
src/commercial/purchase_requests/router.py:80:@router.post("/{pr_id}/approve", status_code=200)
src/commercial/quotation/router.py:20:@router.post("/", response_model=QuoteResponse, status_code=201)
src/commercial/quotation/router.py:31:@router.get("/", response_model=List[QuoteResponse])
src/commercial/quotation/router.py:41:@router.get("/{quote_id}", response_model=QuoteResponse)
src/commercial/quotation/router.py:53:@router.patch("/{quote_id}", response_model=QuoteResponse)
src/commercial/quotation/router.py:68:@router.delete("/{quote_id}", status_code=204)
src/commercial/reporting/router.py:17:@router.post("/", response_model=ReportResponse, status_code=201)
src/commercial/reporting/router.py:22:@router.get("/", response_model=List[ReportResponse])
src/commercial/reporting/router.py:27:@router.get("/{report_id}", response_model=ReportResponse)
src/commercial/reporting/router.py:35:@router.patch("/{report_id}", response_model=ReportResponse)
src/commercial/reporting/router.py:43:@router.delete("/{report_id}", status_code=204)
src/commercial/sales_pipeline/router.py:11:@router.get("/")
src/commercial/sales_pipeline/router.py:60:@router.get("/conversion")
src/commercial/scope_of_work/router.py:100:@router.patch("/{sow_id}")
src/commercial/scope_of_work/router.py:140:@router.post("/{sow_id}/boq-items", status_code=201)
src/commercial/scope_of_work/router.py:177:@router.post("/{sow_id}/submit-for-approval", status_code=200)
src/commercial/scope_of_work/router.py:20:@router.get("/")
src/commercial/scope_of_work/router.py:33:@router.post("/", status_code=201)
src/commercial/scope_of_work/router.py:88:@router.get("/{sow_id}")
src/commercial/search_filters/router.py:15:@router.post("/", response_model=LeadSearchResponse, status_code=201)
src/commercial/search_filters/router.py:19:@router.get("/", response_model=List[LeadSearchResponse])
src/commercial/search_filters/router.py:23:@router.get("/{leadsearch_id}", response_model=LeadSearchResponse)
src/commercial/search_filters/router.py:30:@router.patch("/{leadsearch_id}", response_model=LeadSearchResponse)
src/commercial/search_filters/router.py:37:@router.delete("/{leadsearch_id}", status_code=204)
src/commercial/service_reports/router.py:20:@router.post("/", response_model=ServiceReportResponse, status_code=201)
src/commercial/service_reports/router.py:31:@router.get("/", response_model=List[ServiceReportResponse])
src/commercial/service_reports/router.py:41:@router.get("/{report_id}", response_model=ServiceReportResponse)
src/commercial/service_reports/router.py:53:@router.patch("/{report_id}", response_model=ServiceReportResponse)
src/commercial/service_reports/router.py:68:@router.delete("/{report_id}", status_code=204)
src/commercial/service_requests/router.py:20:@router.get("/", summary="List service requests")
src/commercial/service_requests/router.py:37:@router.get("/{sr_id}", summary="Get service request")
src/commercial/service_requests/router.py:43:@router.post("/", status_code=201, summary="Create service request")
src/commercial/service_requests/router.py:66:@router.post("/{sr_id}/convert-to-wo", summary="Convert to work order")
src/commercial/sites/router.py:20:@router.post("/", response_model=SiteResponse, status_code=201)
src/commercial/sites/router.py:31:@router.get("/", response_model=List[SiteResponse])
src/commercial/sites/router.py:41:@router.get("/{site_id}", response_model=SiteResponse)
src/commercial/sites/router.py:53:@router.patch("/{site_id}", response_model=SiteResponse)
src/commercial/sites/router.py:68:@router.delete("/{site_id}", status_code=204)
src/commercial/sla_dashboard/router.py:118:@router.get("/by-priority", summary="SLA compliance by priority")
src/commercial/sla_dashboard/router.py:154:@router.get("/trends", summary="SLA trend last 6 months")
src/commercial/sla_dashboard/router.py:23:@router.get("/overview", summary="SLA compliance overview")
src/commercial/sla_dashboard/router.py:79:@router.get("/by-hotel", summary="SLA compliance per hotel")
src/commercial/sse_notifications/router.py:170:@router.get("/notifications", summary="SSE notification stream")
src/commercial/sse_notifications/router.py:218:@router.get("/notifications/snapshot", summary="Single snapshot of current signals")
src/commercial/stock_movements/router.py:20:@router.post("/", response_model=StockMovementResponse, status_code=201)
src/commercial/stock_movements/router.py:31:@router.get("/", response_model=List[StockMovementResponse])
src/commercial/stock_movements/router.py:41:@router.get("/{movement_id}", response_model=StockMovementResponse)
src/commercial/stock_movements/router.py:53:@router.delete("/{movement_id}", status_code=204)
src/commercial/supplier_portal/router.py:12:@router.get("/vendors/{vendor_id}/dashboard")
src/commercial/supplier_portal/router.py:52:@router.get("/vendors/{vendor_id}/rfqs")
src/commercial/supplier_portal/router.py:73:@router.post("/vendors/{vendor_id}/quote")
src/commercial/system_notifications/router.py:14:@router.post("/notifications/")
src/commercial/system_notifications/router.py:19:@router.get("/notifications/")
src/commercial/system_notifications/router.py:24:@router.patch("/notifications/{id}/read")
src/commercial/system_notifications/router.py:32:@router.post("/notifications/bulk-read")
src/commercial/technicians/router.py:100:@router.get("/{technician_id}/work-orders", summary="Technician work orders")
src/commercial/technicians/router.py:20:@router.get("/", summary="List technicians")
src/commercial/technicians/router.py:38:@router.get("", summary="List technicians")
src/commercial/technicians/router.py:55:@router.get("/{technician_id}", summary="Get technician")
src/commercial/technicians/router.py:61:@router.post("/", status_code=201, summary="Create technician")
src/commercial/technicians/router.py:88:@router.patch("/{technician_id}", summary="Update technician")
src/commercial/tenant_audit/router.py:21:@router.get("/isolation-check", summary="Multi-hotel data isolation audit")
src/commercial/tenant_audit/router.py:90:@router.get("/hotel-breakdown", summary="Data volume per hotel")
src/commercial/user_preferences/router.py:104:@router.delete("/{user_id}/{key}", summary="Delete a user preference")
src/commercial/user_preferences/router.py:28:@router.get("/{user_id}", summary="Get all preferences for user")
src/commercial/user_preferences/router.py:44:@router.put("/{user_id}/{key}", summary="Set a user preference")
src/commercial/user_preferences/router.py:72:@router.post("/{user_id}/bulk", summary="Set multiple preferences at once")
src/commercial/vendor_portal/router.py:16:@router.get('/rfqs', response_model=list[RFQResponse], status_code=200)
src/commercial/vendor_portal/router.py:22:@router.post('/rfqs/{id}/quote', response_model=PurchaseOrderResponse, status_code=201)
src/commercial/vendor_portal/router.py:35:@router.get('/purchase-orders', response_model=list[PurchaseOrderResponse], status_code=200)
src/commercial/vendor_portal/router.py:41:@router.patch('/purchase-orders/{id}/deliver', status_code=204)
src/commercial/warehouse_intelligence/router.py:179:@router.get("/brand-guide/{category}", summary="Brand and sourcing guide")
src/commercial/warehouse_intelligence/router.py:205:@router.get("/auto-reorder-plan", summary="Auto-generate reorder plan")
src/commercial/warehouse_intelligence/router.py:71:@router.get("/stock-health", summary="Complete stock health dashboard")
src/commercial/warehouses/router.py:20:@router.post("/", response_model=WarehouseResponse, status_code=201)
src/commercial/warehouses/router.py:31:@router.get("/", response_model=List[WarehouseResponse])
src/commercial/warehouses/router.py:41:@router.get("/{warehouse_id}", response_model=WarehouseResponse)
src/commercial/warehouses/router.py:53:@router.patch("/{warehouse_id}", response_model=WarehouseResponse)
src/commercial/warehouses/router.py:68:@router.delete("/{warehouse_id}", status_code=204)
src/commercial/warranty/router.py:112:@router.get("/expiring", summary="Warranties expiring in 60 days")
src/commercial/warranty/router.py:33:@router.get("/overview", summary="Warranty portfolio overview")
src/commercial/warranty/router.py:56:@router.post("/", summary="Register asset warranty")
src/commercial/warranty/router.py:85:@router.get("/asset/{asset_id}", summary="Warranties for an asset")
src/commercial/webhook_notifications/router.py:20:@router.post("/", response_model=WebhookConfigResponse, status_code=201)
src/commercial/webhook_notifications/router.py:31:@router.get("/", response_model=List[WebhookConfigResponse])
src/commercial/webhook_notifications/router.py:41:@router.get("/{webhookconfig_id}", response_model=WebhookConfigResponse)
src/commercial/webhook_notifications/router.py:53:@router.patch("/{webhookconfig_id}", response_model=WebhookConfigResponse)
src/commercial/webhook_notifications/router.py:68:@router.delete("/{webhookconfig_id}", status_code=204)
src/commercial/work_orders/router.py:108:@router.delete("/{work_order_id}", status_code=204, summary="Delete work order")
src/commercial/work_orders/router.py:113:@router.get("/{work_order_id}/history", summary="Work order history")
src/commercial/work_orders/router.py:155:@router.post("/{work_order_id}/transition", summary="Transition work order state")
src/commercial/work_orders/router.py:20:@router.get("/", summary="List work orders")
src/commercial/work_orders/router.py:245:@router.get("/{work_order_id}/transitions", summary="Available transitions for work order")
src/commercial/work_orders/router.py:265:@router.get("/{work_order_id}/transition-log", summary="Transition history for work order")
src/commercial/work_orders/router.py:42:@router.get("", summary="List work orders")
src/commercial/work_orders/router.py:63:@router.get("/{work_order_id}", summary="Get work order")
src/commercial/work_orders/router.py:69:@router.post("/", status_code=201, summary="Create work order")
src/commercial/work_orders/router.py:96:@router.patch("/{work_order_id}", summary="Update work order")
src/contract_lifecycle_management/router.py:7:@router.get("/health")
src/core/actions.py:1010:@router.get("/dashboard/stats")
src/core/actions.py:1057:@router.get("/reports/revenue-trend")
src/core/actions.py:1153:@router.get("/reports/lead-funnel")
src/core/actions.py:116:@router.post("/leads/{lead_id}/assign")
src/core/actions.py:1198:@router.get("/reports/agent-leaderboard")
src/core/actions.py:1256:@router.get("/reports/export/invoices.csv")
src/core/actions.py:1302:@router.get("/reports/export/contracts.csv")
src/core/actions.py:1356:@router.get("/dashboard/service-ops")
src/core/actions.py:1451:@router.post("/work-orders/{work_order_id}/assign")
src/core/actions.py:1500:@router.post("/work-orders/{work_order_id}/complete")
src/core/actions.py:1541:@router.get("/inventory/dashboard")
src/core/actions.py:1611:@router.post("/inventory/adjust")
src/core/actions.py:167:@router.post("/leads/{lead_id}/quote")
src/core/actions.py:1691:@router.get("/inventory/low-stock")
src/core/actions.py:1722:@router.post("/inventory/purchase-requests/{pr_id}/approve")
src/core/actions.py:1750:@router.post("/inventory/purchase-orders/{po_id}/approve")
src/core/actions.py:1806:@router.post("/procurement/purchase-requests/{pr_id}/convert-to-po")
src/core/actions.py:1895:@router.post("/procurement/goods-receipts/{grn_id}/receive")
src/core/actions.py:2022:@router.post("/procurement/rfqs")
src/core/actions.py:202:@router.post("/quotes/{quote_id}/submit")
src/core/actions.py:2079:@router.get("/procurement/rfqs/{rfq_id}/compare")
src/core/actions.py:2136:@router.post("/procurement/rfqs/{rfq_id}/award/{vendor_quote_id}")
src/core/actions.py:2213:@router.get("/procurement/vendors/{vendor_id}/scorecard")
src/core/actions.py:223:@router.post("/quotes/{quote_id}/send")
src/core/actions.py:2286:@router.get("/procurement/dashboard")
src/core/actions.py:2379:@router.get("/procurement/events/{entity_type}/{entity_id}")
src/core/actions.py:2506:@router.get("/inventory/stock-balances")
src/core/actions.py:2562:@router.post("/inventory/rebuild-balances")
src/core/actions.py:283:@router.post("/quotes/{quote_id}/approve")
src/core/actions.py:344:@router.post("/quotes/{quote_id}/reject")
src/core/actions.py:387:@router.get("/leads/{lead_id}/timeline")
src/core/actions.py:418:@router.get("/pipeline/summary")
src/core/actions.py:427:@router.get("/reports/dashboard")
src/core/actions.py:438:@router.get("/leads/search")
src/core/actions.py:465:@router.get("/leads/check-duplicate")
src/core/actions.py:484:@router.post("/quotes/expire-overdue")
src/core/actions.py:496:@router.get("/agents/{agent_id}/leads")
src/core/actions.py:525:@router.get("/agents/{agent_id}/performance")
src/core/actions.py:558:@router.get("/users")
src/core/actions.py:577:@router.post("/users")
src/core/actions.py:616:@router.get("/quotes/{quote_id}/pdf")
src/core/actions.py:666:@router.post("/leads/create", status_code=201)
src/core/actions.py:712:@router.patch("/leads/{lead_id}")
src/core/actions.py:738:@router.post("/agents/create", status_code=201)
src/core/actions.py:766:@router.get("/agents/{agent_id}/leads")
src/core/actions.py:802:@router.post("/leads/{lead_id}/note")
src/core/actions.py:818:@router.get("/dashboard/stats")
src/core/actions.py:84:@router.post("/leads/{lead_id}/qualify")
src/core/actions.py:858:@router.post("/leads/create", status_code=201)
src/core/actions.py:904:@router.patch("/leads/{lead_id}")
src/core/actions.py:930:@router.post("/agents/create", status_code=201)
src/core/actions.py:958:@router.get("/agents/{agent_id}/leads")
src/core/actions.py:994:@router.post("/leads/{lead_id}/note")
src/main.py:1085:@app.post("/api/v1/automation/run", tags=["automation"])
src/main.py:1086:@app.get("/api/v1/automation/run", tags=["automation"])
src/main.py:1390:@app.get("/api/v1/automation/status", tags=["automation"])
src/main.py:1450:@app.post("/api/v1/work-orders/", tags=["work-orders"])
src/main.py:1492:@app.post("/api/v1/service-requests/", tags=["service-requests"])
src/main.py:1527:@app.post("/api/v1/leads/", tags=["leads"])
src/main.py:1564:@app.post("/api/v1/purchase-requests/", tags=["procurement"])
src/main.py:1610:@app.post("/api/v1/work-orders/{wo_id}/status", tags=["work-orders"])
src/main.py:1653:@app.post("/api/v1/service-requests/{sr_id}/status", tags=["service-requests"])
src/main.py:1675:@app.post("/api/v1/leads/{lead_id}/status", tags=["leads"])
src/main.py:1695:@app.post("/api/v1/purchase-requests/{pr_id}/approve", tags=["procurement"])
src/main.py:1719:@app.get("/api/v1/search", tags=["search"])
src/main.py:1782:@app.post("/api/v1/contracts/{contract_id}/renew", tags=["contracts"])
src/main.py:1845:@app.get("/api/v1/activity-feed", tags=["activity"])
src/main.py:1943:@app.get("/api/v1/invoices/{invoice_id}", tags=["finance"])
src/main.py:1981:@app.get("/api/v1/work-orders/{wo_id}", tags=["operations"])
src/main.py:2022:@app.get("/api/v1/contracts/{contract_id}", tags=["commercial"])
src/main.py:2057:@app.get("/api/v1/projects/{project_id}", tags=["projects"])
src/main.py:2093:@app.get("/api/v1/assets/{asset_id}", tags=["maintenance"])
src/main.py:2128:@app.get("/api/v1/maintenance/pm-plans/{plan_id}", tags=["maintenance"])
src/main.py:2165:@app.get("/api/v1/leads/{lead_id}", tags=["commercial"])
src/main.py:2201:@app.get("/api/v1/technicians/{tech_id}", tags=["operations"])
src/main.py:2244:@app.get("/api/v1/suppliers/{supplier_id}", tags=["supply-chain"])
src/main.py:2291:@app.get("/api/v1/contracts-portal", tags=["portal"], include_in_schema=False)
src/main.py:2305:@app.get("/api/v1/leads-portal", tags=["portal"], include_in_schema=False)
src/main.py:2319:@app.get("/api/v1/purchase-orders-portal", tags=["portal"], include_in_schema=False)
src/main.py:2333:@app.get("/api/v1/purchase-requests-portal", tags=["portal"], include_in_schema=False)
src/main.py:2347:@app.get("/api/v1/notifications-portal", tags=["portal"], include_in_schema=False)
src/main.py:2361:@app.get("/api/v1/inventory-items-portal", tags=["portal"], include_in_schema=False)
src/main.py:2377:@app.get("/api/v1/sites-portal", tags=["portal"], include_in_schema=False)
src/main.py:2389:@app.get("/api/v1/warehouses-portal", tags=["portal"], include_in_schema=False)
src/main.py:2401:@app.get("/api/v1/projects-portal", tags=["portal"], include_in_schema=False)
src/main.py:2413:@app.get("/api/v1/rfqs-portal", tags=["portal"], include_in_schema=False)
src/main.py:2425:@app.get("/api/v1/goods-receipts-portal", tags=["portal"], include_in_schema=False)
src/main.py:2437:@app.get("/api/v1/assets-portal", tags=["portal"], include_in_schema=False)
src/main.py:2451:@app.get("/api/v1/me", tags=["auth"])
src/main.py:2524:@app.get("/api/v1/rbac/roles", tags=["rbac"])
src/main.py:2536:@app.get("/api/v1/rbac/permissions", tags=["rbac"])
src/main.py:253:@app.post("/api/v1/rbac/users/{user_id}/role", tags=["rbac"])
src/main.py:2550:@app.post("/api/v1/auth/change-password", tags=["auth"])
src/main.py:2608:@app.get("/api/v1/reports/work-orders", tags=["reports"])
src/main.py:2661:@app.get("/api/v1/reports/assets", tags=["reports"])
src/main.py:2710:@app.get("/api/v1/reports/daily-summary", tags=["reports"])
src/main.py:2748:@app.get("/api/v1/reports/contracts", tags=["reports"])
src/main.py:277:@app.get("/api/v1/rbac/users", tags=["rbac"])
src/main.py:2793:@app.get("/api/v1/scope-of-work/", tags=["procurement"])
src/main.py:2805:@app.get("/api/v1/vendors/", tags=["procurement"])
src/main.py:2817:@app.get("/api/v1/rfq/", tags=["procurement"])
src/main.py:2829:@app.get("/api/v1/purchase-orders-v2/", tags=["procurement"])
src/main.py:2846:@app.get("/api/v1/approval-requests/", tags=["procurement"])
src/main.py:2858:@app.get("/api/v1/procurement/dashboard", tags=["procurement"])
src/main.py:2882:@app.get("/api/v1/vendors/{vendor_id}", tags=["procurement"])
src/main.py:2902:@app.post("/api/v1/vendors/", tags=["procurement"])
src/main.py:2931:@app.patch("/api/v1/vendors/{vendor_id}", tags=["procurement"])
src/main.py:2959:@app.get("/api/v1/scope-of-work/{sow_id}", tags=["procurement"])
src/main.py:2976:@app.post("/api/v1/scope-of-work/{sow_id}/approve", tags=["procurement"])
src/main.py:2997:@app.patch("/api/v1/scope-of-work/{sow_id}", tags=["procurement"])
src/main.py:3021:@app.post("/api/v1/scope-of-work/{sow_id}/boq-items", tags=["procurement"])
src/main.py:3046:@app.get("/api/v1/rfq/{rfq_id}/bid-comparison", tags=["procurement"])
src/main.py:3085:@app.post("/api/v1/rfq/{rfq_id}/award", tags=["procurement"])
src/main.py:3108:@app.post("/api/v1/purchase-orders-v2/", tags=["procurement"])
src/main.py:3140:@app.post("/api/v1/purchase-orders-v2/{po_id}/line-items", tags=["procurement"])
src/main.py:3179:@app.patch("/api/v1/purchase-orders-v2/{po_id}/line-items/{line_id}", tags=["procurement"])
src/main.py:3215:@app.post("/api/v1/goods-receipt-notes/", tags=["procurement"])
src/main.py:3258:@app.get("/api/v1/goods-receipt-notes/", tags=["procurement"])
src/main.py:3279:@app.post("/api/v1/debug/upload-test", tags=["debug"], include_in_schema=False)
src/main.py:3311:@app.post("/api/v1/documents/v2/upload", tags=["documents"])
src/main.py:3406:@app.get("/api/v1/documents/", tags=["documents"])
src/main.py:3429:@app.get("/api/v1/documents/{doc_id}/view", tags=["documents"])
src/main.py:342:@app.get("/health")
src/main.py:3452:@app.delete("/api/v1/documents/v2/{doc_id}", tags=["documents"])
src/main.py:3471:@app.get("/api/v1/vendors/{vendor_id}/doc-status", tags=["documents"])
src/main.py:3499:@app.get("/api/v1/documents/categories", tags=["documents"])
src/main.py:3505:@app.get("/api/v1/supplier-invoices/", tags=["invoices"])
src/main.py:3529:@app.get("/api/v1/supplier-invoices/dashboard", tags=["invoices"])
src/main.py:353:@app.get("/")
src/main.py:3552:@app.get("/api/v1/supplier-invoices/{invoice_id}", tags=["invoices"])
src/main.py:3587:@app.post("/api/v1/supplier-invoices/", tags=["invoices"])
src/main.py:3636:@app.post("/api/v1/supplier-invoices/{invoice_id}/match", tags=["invoices"])
src/main.py:3695:@app.post("/api/v1/supplier-invoices/{invoice_id}/approve", tags=["invoices"])
src/main.py:3719:@app.post("/api/v1/supplier-invoices/{invoice_id}/pay", tags=["invoices"])
src/main.py:3771:@app.get("/api/v1/leads-portal-v2", tags=["commercial"], include_in_schema=False)
src/main.py:3791:@app.get("/api/v1/leads-portal-v2/{lead_id}", tags=["commercial"], include_in_schema=False)
src/main.py:3811:@app.delete("/api/v1/work-orders/{wo_id}", tags=["operations"])
src/main.py:3812:@app.delete("/api/v1/work-orders-v2/{wo_id}", tags=["operations"])
src/main.py:3830:@app.delete("/api/v1/service-requests/{sr_id}", tags=["operations"])
src/main.py:3845:@app.delete("/api/v1/assets/{asset_id}", tags=["operations"])
src/main.py:3860:@app.delete("/api/v1/vendors/v2/{vendor_id}", tags=["procurement"])
src/main.py:3875:@app.delete("/api/v1/scope-of-work/v2/{sow_id}", tags=["procurement"])
src/main.py:3890:@app.delete("/api/v1/supplier-invoices/v2/{invoice_id}", tags=["invoices"])
src/main.py:3905:@app.delete("/api/v1/purchase-orders-v2/v2/{po_id}", tags=["procurement"])
src/main.py:3923:@app.get("/api/v1/executive/dashboard", tags=["executive"])
src/main.py:4101:@app.get("/api/v1/report-engine/catalog", tags=["reports"])
src/main.py:4145:@app.get("/api/v1/report-engine/{report_type}", tags=["reports"])
src/main.py:4636:@app.get("/api/v1/pdf/purchase-order/{po_id}", tags=["pdf"])
src/main.py:4718:@app.get("/api/v1/pdf/invoice/{invoice_id}", tags=["pdf"])
src/main.py:4802:@app.get("/api/v1/pdf/scope-of-work/{sow_id}", tags=["pdf"])
src/main.py:4882:@app.get("/api/v1/pdf/work-order/{wo_id}", tags=["pdf"])
src/main.py:4963:@app.get("/api/v1/pdf/report/{report_type}", tags=["pdf"])
src/main.py:5077:@app.get("/api/v1/platform-notif/", tags=["notifications"])
src/main.py:5099:@app.post("/api/v1/platform-notif/{notif_id}/read", tags=["notifications"])
src/main.py:5113:@app.post("/api/v1/platform-notif/mark-all-read", tags=["notifications"])
src/main.py:5127:@app.post("/api/v1/platform-notif/generate", tags=["notifications"])
src/main.py:5220:@app.patch("/api/v1/work-orders/{wo_id}/assign", tags=["operations"])
src/main.py:5244:@app.patch("/api/v1/work-orders/{wo_id}/status", tags=["operations"])
src/main.py:5270:@app.get("/api/v1/dispatch/board", tags=["operations"])
src/main.py:5316:@app.get("/api/v1/financial/dashboard", tags=["financial"])
src/main.py:5448:@app.get("/api/v1/financial/project-pl", tags=["financial"])
src/main.py:5480:@app.get("/api/v1/financial/cash-flow", tags=["financial"])
src/main.py:5517:@app.post("/api/v1/client/login", tags=["client-portal"])
src/main.py:5566:@app.get("/api/v1/client/dashboard", tags=["client-portal"])
src/main.py:5595:@app.get("/api/v1/client/work-orders", tags=["client-portal"])
src/main.py:559:@app.get("/api/v1/health/detailed", tags=["system"])
src/main.py:5622:@app.post("/api/v1/client/service-requests", tags=["client-portal"])
src/main.py:5648:@app.get("/api/v1/client/sow-approvals", tags=["client-portal"])
src/main.py:5673:@app.get("/api/v1/client/projects", tags=["client-portal"])
src/main.py:5696:@app.post("/api/v1/supplier/login", tags=["supplier-portal"])
src/main.py:572:@app.get("/api/v1/version", tags=["system"])
src/main.py:5745:@app.get("/api/v1/supplier/dashboard", tags=["supplier-portal"])
src/main.py:5773:@app.get("/api/v1/supplier/purchase-orders", tags=["supplier-portal"])
src/main.py:5798:@app.get("/api/v1/supplier/rfqs", tags=["supplier-portal"])
src/main.py:5821:@app.post("/api/v1/supplier/quotes", tags=["supplier-portal"])
src/main.py:5854:@app.get("/api/v1/supplier/invoices", tags=["supplier-portal"])
src/main.py:5873:@app.get("/api/v1/supplier/profile", tags=["supplier-portal"])
src/main.py:5913:@app.get("/api/v1/pm-schedule/assets", tags=["maintenance"])
src/main.py:5964:@app.post("/api/v1/pm-schedule/generate", tags=["maintenance"])
src/main.py:6050:@app.get("/api/v1/pm-schedule/calendar", tags=["maintenance"])
src/main.py:6092:@app.get("/api/v1/pm-schedule/stats", tags=["maintenance"])
src/main.py:6121:@app.get("/api/v1/qr/asset/{asset_id}", tags=["qr"])
src/main.py:6200:@app.get("/api/v1/qr/asset/{asset_id}/data", tags=["qr"])
src/main.py:6255:@app.get("/api/v1/qr/assets/list", tags=["qr"])
src/main.py:6282:@app.get("/api/v1/qr/asset/{asset_id}/print-sheet", tags=["qr"])
src/main.py:6398:@app.get("/api/v1/sla/dashboard", tags=["sla"])
src/main.py:6511:@app.get("/api/v1/sla/breaches", tags=["sla"])
src/main.py:6545:@app.post("/api/v1/time-entries/", tags=["time-tracking"])
src/main.py:6598:@app.get("/api/v1/time-entries/", tags=["time-tracking"])
src/main.py:6622:@app.get("/api/v1/time-entries/summary", tags=["time-tracking"])
src/main.py:666:@app.get("/api/v1/platform/summary", tags=["system"])
src/main.py:6692:@app.get("/health", tags=["platform"], include_in_schema=True)
src/main.py:6693:@app.get("/api/v1/health", tags=["platform"])
src/main.py:6716:@app.delete("/api/v1/platform-notif/cleanup", tags=["notifications"])
src/main.py:6758:@app.get("/api/v1/me", tags=["auth"])
src/main.py:6783:@app.get("/api/v1/users/", tags=["users"])
src/main.py:6805:@app.patch("/api/v1/users/{user_id}/role", tags=["users"])
src/main.py:6835:@app.get("/api/v1/security/audit", tags=["platform"])
src/main.py:7006:@app.patch("/api/v1/secure/rbac/users/{user_id}/role", tags=["security", "rbac"])
src/main.py:7047:@app.post("/api/v1/secure/auth/change-password", tags=["security", "auth"])
src/main.py:7086:@app.post("/api/v1/secure/scope-of-work/{sow_id}/approve", tags=["security", "supply-chain"])
src/main.py:7118:@app.post("/api/v1/secure/rfq/{rfq_id}/award", tags=["security", "supply-chain"])
src/main.py:7155:@app.post("/api/v1/secure/purchase-requests/{pr_id}/approve", tags=["security", "supply-chain"])
src/main.py:7186:@app.post("/api/v1/secure/contracts/{contract_id}/renew", tags=["security", "commercial"])
src/main.py:7222:@app.get("/api/v1/secure/security/status", tags=["security"])
src/main.py:7384:@app.get("/api/v1/tenants/current", tags=["saas"])
src/main.py:7408:@app.get("/api/v1/tenants/", tags=["saas"])
src/main.py:7426:@app.get("/api/v1/tenants/{tenant_id}/features", tags=["saas"])
src/main.py:7453:@app.get("/api/v1/health/triggers", tags=["health"])
src/main.py:7489:@app.get("/api/v1/health/typescript", tags=["health"])
src/main.py:7510:@app.get("/api/v1/health/routes", tags=["health"])
src/main.py:7545:@app.get("/api/v1/health/v2", tags=["health"])
src/main.py:761:@app.get("/api/v1/ai/signals/summary", tags=["ai-signals"])
src/main.py:793:@app.get("/api/v1/stock-balances/", tags=["inventory"])
src/main.py:794:@app.get("/api/v1/stock-balances", tags=["inventory"])
src/main.py:812:@app.get("/api/v1/suppliers/", tags=["suppliers"])
src/main.py:813:@app.get("/api/v1/suppliers", tags=["suppliers"])
src/main.py:821:@app.get("/api/v1/rfqs/", tags=["rfqs"])
src/main.py:822:@app.get("/api/v1/rfqs", tags=["rfqs"])
src/main.py:855:@app.get("/api/v1/maintenance/pm-plans/", tags=["maintenance"])
src/main.py:856:@app.get("/api/v1/maintenance/pm-plans", tags=["maintenance"])
src/main.py:870:@app.get("/api/v1/maintenance/pm-plans/{plan_id}", tags=["maintenance"])
src/main.py:882:@app.get("/api/v1/payment-tracking/", tags=["finance"])
src/main.py:883:@app.get("/api/v1/payment-tracking", tags=["finance"])
src/main.py:897:@app.post("/api/v1/work-orders/{wo_id}/complete", tags=["work-orders"])
src/main.py:923:@app.get("/api/v1/work-orders-sync/assets", tags=["work-orders"])
src/main.py:949:@app.get("/api/v1/service-requests/{sr_id}/work-order", tags=["service-requests"])
src/main.py:966:@app.post("/api/v1/service-requests/{sr_id}/create-work-order", tags=["service-requests"])
src/main.py:993:@app.get("/api/v1/dashboard/summary", tags=["dashboard"])
src/main.py:994:@app.get("/api/v1/dashboard/summary/", tags=["dashboard"])
src/maintenance_schedule_module/router.py:7:@router.get("/health")
src/mobile_api_for_field_technicians/router.py:7:@router.get("/health")
src/orchestrator/maintenance_schedule_router.py:14:@router.get('/maintenance_schedules/{schedule_id}', response_model=MaintenanceScheduleResponse)
src/orchestrator/maintenance_schedule_router.py:22:@router.put('/maintenance_schedules/{schedule_id}', response_model=MaintenanceScheduleResponse)
src/orchestrator/maintenance_schedule_router.py:27:@router.delete('/maintenance_schedules/{schedule_id}', status_code=204)
src/orchestrator/maintenance_schedule_router.py:9:@router.post('/maintenance_schedules/', response_model=MaintenanceScheduleResponse)
src/orchestrator/reload_router.py:6:@router.post('/tb/reload')
src/orchestrator/routers/sprint_plans.py:10:@router.post('/orchestrator/plan-sprint/{workspace_id}', response_model=SprintPlan)
src/payment_tracking_module/router.py:7:@router.get("/health")
src/project_management_module/router.py:7:@router.get("/health")
src/quotation_pdf_generator/router.py:7:@router.get("/health")
src/service_request_to_work_order_auto_routi/router.py:7:@router.get("/health")
src/sla_tracking/router.py:7:@router.get("/health")
src/vendor_portal_api/router.py:7:@router.get("/health")

## Frontend pages
admin-portal/app/(admin)/agents/page.tsx
admin-portal/app/(admin)/contracts/page.tsx
admin-portal/app/(admin)/dashboard/page.tsx
admin-portal/app/(admin)/system/page.tsx
admin-portal/app/(admin)/users/page.tsx
admin-portal/app/login/page.tsx
admin-portal/app/page.tsx
client-portal/app/(client)/activities/page.tsx
client-portal/app/(client)/contracts/[id]/page.tsx
client-portal/app/(client)/contracts/page.tsx
client-portal/app/(client)/dashboard/page.tsx
client-portal/app/(client)/invoices/[id]/page.tsx
client-portal/app/(client)/invoices/page.tsx
client-portal/app/(client)/quotes/[id]/page.tsx
client-portal/app/(client)/quotes/page.tsx
client-portal/app/login/page.tsx
client-portal/app/page.tsx
portal/app/(app)/(enterprise)/actions/center/page.tsx
portal/app/(app)/(enterprise)/admin/notification-rules/page.tsx
portal/app/(app)/(enterprise)/administration/audit/page.tsx
portal/app/(app)/(enterprise)/administration/hotels/[id]/page.tsx
portal/app/(app)/(enterprise)/administration/hotels/page.tsx
portal/app/(app)/(enterprise)/administration/page.tsx
portal/app/(app)/(enterprise)/administration/platform/exports/page.tsx
portal/app/(app)/(enterprise)/administration/platform/maturity/page.tsx
portal/app/(app)/(enterprise)/administration/platform/page.tsx
portal/app/(app)/(enterprise)/administration/technicians/page.tsx
portal/app/(app)/(enterprise)/administration/users/page.tsx
portal/app/(app)/(enterprise)/ai/page.tsx
portal/app/(app)/(enterprise)/alerts/page.tsx
portal/app/(app)/(enterprise)/analytics/costs/page.tsx
portal/app/(app)/(enterprise)/analytics/page.tsx
portal/app/(app)/(enterprise)/analytics/reports/page.tsx
portal/app/(app)/(enterprise)/analytics/scorecards/page.tsx
portal/app/(app)/(enterprise)/analytics/sla/page.tsx
portal/app/(app)/(enterprise)/analytics/trends/page.tsx
portal/app/(app)/(enterprise)/approvals/page.tsx
portal/app/(app)/(enterprise)/commercial/command/page.tsx
portal/app/(app)/(enterprise)/commercial/contracts/[id]/page.tsx
portal/app/(app)/(enterprise)/commercial/contracts/page.tsx
portal/app/(app)/(enterprise)/commercial/contracts/renewal/page.tsx
portal/app/(app)/(enterprise)/commercial/customers/page.tsx
portal/app/(app)/(enterprise)/commercial/invoices/[id]/page.tsx
portal/app/(app)/(enterprise)/commercial/invoices/page.tsx
portal/app/(app)/(enterprise)/commercial/leads/[id]/page.tsx
portal/app/(app)/(enterprise)/commercial/leads/page.tsx
portal/app/(app)/(enterprise)/commercial/page.tsx
portal/app/(app)/(enterprise)/commercial/payment-history/page.tsx
portal/app/(app)/(enterprise)/commercial/pipeline/page.tsx
portal/app/(app)/(enterprise)/commercial/review-intelligence/page.tsx
portal/app/(app)/(enterprise)/commercial/review/page.tsx
portal/app/(app)/(enterprise)/commercial/workbench/page.tsx
portal/app/(app)/(enterprise)/connect-signals/page.tsx
portal/app/(app)/(enterprise)/contracts/360/page.tsx
portal/app/(app)/(enterprise)/customers/360/page.tsx
portal/app/(app)/(enterprise)/customers/[id]/page.tsx
portal/app/(app)/(enterprise)/customers/page.tsx
portal/app/(app)/(enterprise)/customers/renewals/page.tsx
portal/app/(app)/(enterprise)/customers/review/page.tsx
portal/app/(app)/(enterprise)/customers/success/page.tsx
portal/app/(app)/(enterprise)/engineering/[section]/page.tsx
portal/app/(app)/(enterprise)/engineering/actions/page.tsx
portal/app/(app)/(enterprise)/engineering/ai/page.tsx
portal/app/(app)/(enterprise)/engineering/intelligence/page.tsx
portal/app/(app)/(enterprise)/engineering/maintenance-intelligence/page.tsx
portal/app/(app)/(enterprise)/engineering/new-work-order/page.tsx
portal/app/(app)/(enterprise)/engineering/page.tsx
portal/app/(app)/(enterprise)/engineering/pm-plans/page.tsx
portal/app/(app)/(enterprise)/engineering/review/page.tsx
portal/app/(app)/(enterprise)/executive/command/page.tsx
portal/app/(app)/(enterprise)/executive/daily-review/page.tsx
portal/app/(app)/(enterprise)/executive/dashboard/page.tsx
portal/app/(app)/(enterprise)/executive/exceptions/page.tsx
portal/app/(app)/(enterprise)/executive/intelligence/page.tsx
portal/app/(app)/(enterprise)/executive/page.tsx
portal/app/(app)/(enterprise)/executive/portfolio/page.tsx
portal/app/(app)/(enterprise)/executive/predictive/page.tsx
portal/app/(app)/(enterprise)/executive/reports/page.tsx
portal/app/(app)/(enterprise)/executive/risks/page.tsx
portal/app/(app)/(enterprise)/executive/scorecard/page.tsx
portal/app/(app)/(enterprise)/executive/workbench/page.tsx
portal/app/(app)/(enterprise)/financial/page.tsx
portal/app/(app)/(enterprise)/graph/page.tsx
portal/app/(app)/(enterprise)/inbox/page.tsx
portal/app/(app)/(enterprise)/inbox/presets/page.tsx
portal/app/(app)/(enterprise)/integration/backend/page.tsx
portal/app/(app)/(enterprise)/integration/entities/page.tsx
portal/app/(app)/(enterprise)/maintenance/[section]/page.tsx
portal/app/(app)/(enterprise)/maintenance/actions/page.tsx
portal/app/(app)/(enterprise)/maintenance/asset-tree/page.tsx
portal/app/(app)/(enterprise)/maintenance/assets/360/page.tsx
portal/app/(app)/(enterprise)/maintenance/assets/[id]/page.tsx
portal/app/(app)/(enterprise)/maintenance/assets/page.tsx
portal/app/(app)/(enterprise)/maintenance/costs/review/page.tsx
portal/app/(app)/(enterprise)/maintenance/downtime/review/page.tsx
portal/app/(app)/(enterprise)/maintenance/inspection-dashboard/page.tsx
portal/app/(app)/(enterprise)/maintenance/intelligence/page.tsx
portal/app/(app)/(enterprise)/maintenance/page.tsx
portal/app/(app)/(enterprise)/maintenance/pm-plans/360/page.tsx
portal/app/(app)/(enterprise)/maintenance/pm-plans/[id]/page.tsx
portal/app/(app)/(enterprise)/maintenance/pm-plans/page.tsx
portal/app/(app)/(enterprise)/maintenance/qr-codes/page.tsx
portal/app/(app)/(enterprise)/maintenance/review/page.tsx
portal/app/(app)/(enterprise)/maintenance/review/schedules/page.tsx
portal/app/(app)/(enterprise)/maintenance/work-history/page.tsx
portal/app/(app)/(enterprise)/notifications/page.tsx
portal/app/(app)/(enterprise)/operations/assets/qr/page.tsx
portal/app/(app)/(enterprise)/operations/bulk/page.tsx
portal/app/(app)/(enterprise)/operations/calendar/page.tsx
portal/app/(app)/(enterprise)/operations/command/page.tsx
portal/app/(app)/(enterprise)/operations/contracts/page.tsx
portal/app/(app)/(enterprise)/operations/dispatch/page.tsx
portal/app/(app)/(enterprise)/operations/maintenance/page.tsx
portal/app/(app)/(enterprise)/operations/page.tsx
portal/app/(app)/(enterprise)/operations/schedule/page.tsx
portal/app/(app)/(enterprise)/operations/service-requests/[id]/page.tsx
portal/app/(app)/(enterprise)/operations/service-requests/page.tsx
portal/app/(app)/(enterprise)/operations/sites/[id]/page.tsx
portal/app/(app)/(enterprise)/operations/sites/page.tsx
portal/app/(app)/(enterprise)/operations/sla-review/page.tsx
portal/app/(app)/(enterprise)/operations/sla/page.tsx
portal/app/(app)/(enterprise)/operations/technicians/[id]/page.tsx
portal/app/(app)/(enterprise)/operations/technicians/my-day/page.tsx
portal/app/(app)/(enterprise)/operations/technicians/page.tsx
portal/app/(app)/(enterprise)/operations/time-tracking/page.tsx
portal/app/(app)/(enterprise)/operations/work-orders/360/page.tsx
portal/app/(app)/(enterprise)/operations/work-orders/[id]/page.tsx
portal/app/(app)/(enterprise)/operations/work-orders/new/page.tsx
portal/app/(app)/(enterprise)/operations/work-orders/page.tsx
portal/app/(app)/(enterprise)/operations/workbench/page.tsx
portal/app/(app)/(enterprise)/operations/workflows/approvals/page.tsx
portal/app/(app)/(enterprise)/operations/workflows/designer/page.tsx
portal/app/(app)/(enterprise)/operations/workflows/instances/page.tsx
portal/app/(app)/(enterprise)/operations/workflows/page.tsx
portal/app/(app)/(enterprise)/payment-tracking/page.tsx
portal/app/(app)/(enterprise)/projects-center/[id]/page.tsx
portal/app/(app)/(enterprise)/projects-center/actions/page.tsx
portal/app/(app)/(enterprise)/projects-center/intelligence/page.tsx
portal/app/(app)/(enterprise)/projects-center/list/page.tsx
portal/app/(app)/(enterprise)/projects-center/page.tsx
portal/app/(app)/(enterprise)/projects-center/review/page.tsx
portal/app/(app)/(enterprise)/projects-center/review/schedule/page.tsx
portal/app/(app)/(enterprise)/projects-center/section/[section]/page.tsx
portal/app/(app)/(enterprise)/projects-center/timeline/page.tsx
portal/app/(app)/(enterprise)/recommendations/page.tsx
portal/app/(app)/(enterprise)/reports/page.tsx
portal/app/(app)/(enterprise)/schedule-review/page.tsx
portal/app/(app)/(enterprise)/settings/profile/page.tsx
portal/app/(app)/(enterprise)/settings/users/page.tsx
portal/app/(app)/(enterprise)/stock-levels/page.tsx
portal/app/(app)/(enterprise)/supply-chain/agreements/page.tsx
portal/app/(app)/(enterprise)/supply-chain/approvals-center/page.tsx
portal/app/(app)/(enterprise)/supply-chain/command/page.tsx
portal/app/(app)/(enterprise)/supply-chain/comparison/page.tsx
portal/app/(app)/(enterprise)/supply-chain/goods-receipts/[id]/page.tsx
portal/app/(app)/(enterprise)/supply-chain/goods-receipts/new/page.tsx
portal/app/(app)/(enterprise)/supply-chain/goods-receipts/page.tsx
portal/app/(app)/(enterprise)/supply-chain/intake/page.tsx
portal/app/(app)/(enterprise)/supply-chain/intelligence/page.tsx
portal/app/(app)/(enterprise)/supply-chain/inventory/[id]/page.tsx
portal/app/(app)/(enterprise)/supply-chain/inventory/page.tsx
portal/app/(app)/(enterprise)/supply-chain/invoice-matching/page.tsx
portal/app/(app)/(enterprise)/supply-chain/invoices/[id]/page.tsx
portal/app/(app)/(enterprise)/supply-chain/invoices/new/page.tsx
portal/app/(app)/(enterprise)/supply-chain/invoices/page.tsx
portal/app/(app)/(enterprise)/supply-chain/page.tsx
portal/app/(app)/(enterprise)/supply-chain/procurement-dashboard/page.tsx
portal/app/(app)/(enterprise)/supply-chain/procurement/page.tsx
portal/app/(app)/(enterprise)/supply-chain/purchase-orders-v2/[id]/page.tsx
portal/app/(app)/(enterprise)/supply-chain/purchase-orders-v2/page.tsx
portal/app/(app)/(enterprise)/supply-chain/purchase-orders/[id]/page.tsx
portal/app/(app)/(enterprise)/supply-chain/purchase-orders/page.tsx
portal/app/(app)/(enterprise)/supply-chain/purchase-requests/[id]/page.tsx
portal/app/(app)/(enterprise)/supply-chain/purchase-requests/page.tsx
portal/app/(app)/(enterprise)/supply-chain/queue/page.tsx
portal/app/(app)/(enterprise)/supply-chain/quotations/page.tsx
portal/app/(app)/(enterprise)/supply-chain/reorder/page.tsx
portal/app/(app)/(enterprise)/supply-chain/review/page.tsx
portal/app/(app)/(enterprise)/supply-chain/rfq-management/[id]/page.tsx
portal/app/(app)/(enterprise)/supply-chain/rfq-management/page.tsx
portal/app/(app)/(enterprise)/supply-chain/rfqs/[id]/page.tsx
portal/app/(app)/(enterprise)/supply-chain/rfqs/page.tsx
portal/app/(app)/(enterprise)/supply-chain/risk/page.tsx
portal/app/(app)/(enterprise)/supply-chain/scope-of-work/[id]/page.tsx
portal/app/(app)/(enterprise)/supply-chain/scope-of-work/new/page.tsx
portal/app/(app)/(enterprise)/supply-chain/scope-of-work/page.tsx
portal/app/(app)/(enterprise)/supply-chain/spend/page.tsx
portal/app/(app)/(enterprise)/supply-chain/stock-balances/page.tsx
portal/app/(app)/(enterprise)/supply-chain/stock-levels/page.tsx
portal/app/(app)/(enterprise)/supply-chain/supplier-invoices/page.tsx
portal/app/(app)/(enterprise)/supply-chain/suppliers/[id]/page.tsx
portal/app/(app)/(enterprise)/supply-chain/suppliers/page.tsx
portal/app/(app)/(enterprise)/supply-chain/transfers/page.tsx
portal/app/(app)/(enterprise)/supply-chain/vendor-management/[id]/page.tsx
portal/app/(app)/(enterprise)/supply-chain/vendor-management/page.tsx
portal/app/(app)/(enterprise)/supply-chain/vendors/360/page.tsx
portal/app/(app)/(enterprise)/supply-chain/vendors/analytics/page.tsx
portal/app/(app)/(enterprise)/supply-chain/vendors/page.tsx
portal/app/(app)/(enterprise)/supply-chain/warehouses/[id]/page.tsx
portal/app/(app)/(enterprise)/supply-chain/warehouses/page.tsx
portal/app/(app)/(enterprise)/supply-chain/workbench/page.tsx
portal/app/(app)/(enterprise)/tasks/page.tsx
portal/app/(app)/(enterprise)/workflow-designer/page.tsx
portal/app/(app)/(enterprise)/workflows/launcher/page.tsx
portal/app/(app)/(enterprise)/workflows/page.tsx
portal/app/(app)/(enterprise)/workspace/all-modules/page.tsx
portal/app/(app)/(enterprise)/workspace/my-day/page.tsx
portal/app/(app)/(enterprise)/workspace/page.tsx
portal/app/(app)/admin/page.tsx
portal/app/(app)/agents/page.tsx
portal/app/(app)/assets/[id]/page.tsx
portal/app/(app)/assets/page.tsx
portal/app/(app)/contracts/[id]/page.tsx
portal/app/(app)/contracts/page.tsx
portal/app/(app)/dashboard/page.tsx
portal/app/(app)/hub/page.tsx
portal/app/(app)/inventory/items/page.tsx
portal/app/(app)/inventory/page.tsx
portal/app/(app)/inventory/purchase-orders/page.tsx
portal/app/(app)/inventory/purchase-requests/page.tsx
portal/app/(app)/inventory/vendors/page.tsx
portal/app/(app)/inventory/warehouses/page.tsx
portal/app/(app)/invoices/[id]/page.tsx
portal/app/(app)/invoices/page.tsx
portal/app/(app)/leads/[id]/edit/page.tsx
portal/app/(app)/leads/[id]/page.tsx
portal/app/(app)/leads/new/page.tsx
portal/app/(app)/leads/page.tsx
portal/app/(app)/profile/page.tsx
portal/app/(app)/purchase-orders/[id]/page.tsx
portal/app/(app)/purchase-requests/[id]/page.tsx
portal/app/(app)/purchase-requests/page.tsx
portal/app/(app)/quotes/[id]/page.tsx
portal/app/(app)/quotes/new/page.tsx
portal/app/(app)/quotes/page.tsx
portal/app/(app)/settings/page.tsx
portal/app/(app)/technicians/[id]/page.tsx
portal/app/(app)/technicians/page.tsx
portal/app/(app)/warehouses/page.tsx
portal/app/(app)/work-orders/[id]/page.tsx
portal/app/(app)/work-orders/page.tsx
portal/app/asset/[id]/page.tsx
portal/app/client-portal/approvals/page.tsx
portal/app/client-portal/dashboard/page.tsx
portal/app/client-portal/page.tsx
portal/app/client-portal/projects/page.tsx
portal/app/client-portal/request/page.tsx
portal/app/client-portal/work-orders/page.tsx
portal/app/login/page.tsx
portal/app/page.tsx
portal/app/supplier-portal/dashboard/page.tsx
portal/app/supplier-portal/invoices/page.tsx
portal/app/supplier-portal/page.tsx
portal/app/supplier-portal/profile/page.tsx
portal/app/supplier-portal/purchase-orders/page.tsx
portal/app/supplier-portal/rfqs/page.tsx

## Components
portal/components/Badge.tsx
portal/components/Button.tsx
portal/components/Card.tsx
portal/components/ClientInit.tsx
portal/components/Input.tsx
portal/components/Select.tsx
portal/components/Sidebar.tsx
portal/components/documents/DocumentsPanel.tsx
portal/components/shell/skeletons.tsx
portal/components/shell/utils.ts
portal/components/ui/ActionBar.tsx
portal/components/ui/ActivityFeed.tsx
portal/components/ui/AlertBanner.tsx
portal/components/ui/ApprovalModal.tsx
portal/components/ui/Avatar.tsx
portal/components/ui/Breadcrumb.tsx
portal/components/ui/Button.tsx
portal/components/ui/ClientKeyboardHandler.tsx
portal/components/ui/CommandBar.tsx
portal/components/ui/CommandPalette.tsx
portal/components/ui/ConfirmDialog.tsx
portal/components/ui/ContextRail.tsx
portal/components/ui/CreateModal.tsx
portal/components/ui/DataTable.tsx
portal/components/ui/Drawer.tsx
portal/components/ui/EmptyState.tsx
portal/components/ui/EntityShell.tsx
portal/components/ui/EntityTabs.tsx
portal/components/ui/ExportButton.tsx
portal/components/ui/FilterBar.tsx
portal/components/ui/GlobalSearch.tsx
portal/components/ui/Input.tsx
portal/components/ui/KeyboardShortcutsModal.tsx
portal/components/ui/KpiCard.tsx
portal/components/ui/LoadingSkeleton.tsx
portal/components/ui/LoadingState.tsx
portal/components/ui/MetricCard.tsx
portal/components/ui/MetricStrip.tsx
portal/components/ui/MobileNav.tsx
portal/components/ui/Modal.tsx
portal/components/ui/NotificationBell.tsx
portal/components/ui/NotificationDrawer.tsx
portal/components/ui/PageHeader.tsx
portal/components/ui/PageWrapper.tsx
portal/components/ui/Pagination.tsx
portal/components/ui/PriorityPill.tsx
portal/components/ui/Progress.tsx
portal/components/ui/RoleBadge.tsx
portal/components/ui/SearchInput.tsx
portal/components/ui/SectionCard.tsx
portal/components/ui/StatusBadge.tsx
portal/components/ui/StatusFilterTabs.tsx
portal/components/ui/StatusPill.tsx
portal/components/ui/Tabs.tsx
portal/components/ui/Textarea.tsx
portal/components/ui/Tooltip.tsx
portal/components/ui/WorkflowBar.tsx
portal/components/ui/index.ts
portal/components/workspace/AIInsightPanel.tsx
portal/components/workspace/ActionQueueList.tsx
portal/components/workspace/ActivityGraphSummary.tsx
portal/components/workspace/AlertCenterPanel.tsx
portal/components/workspace/BackendAlignmentPanel.tsx
portal/components/workspace/BrandMark.tsx
portal/components/workspace/CenterDashboard.tsx
portal/components/workspace/CenterModuleGrid.tsx
portal/components/workspace/CenterPlaceholderPage.tsx
portal/components/workspace/CenterSubNav.tsx
portal/components/workspace/CrossObjectActionCenter.tsx
portal/components/workspace/DetailStateBanner.tsx
portal/components/workspace/DispatchWorkspacePanel.tsx
portal/components/workspace/EnterpriseGraphNavigator.tsx
portal/components/workspace/EnterpriseHealthStrip.tsx
portal/components/workspace/EnterpriseScorecardGrid.tsx
portal/components/workspace/EnterpriseShell.tsx
portal/components/workspace/EnterpriseSidebar.tsx
portal/components/workspace/EnterpriseTopbar.tsx
portal/components/workspace/Entity360Hero.tsx
portal/components/workspace/EntityActionDock.tsx
portal/components/workspace/EntityContextDrawer.tsx
portal/components/workspace/EntityContextRail.tsx
portal/components/workspace/EntityDetailTabs.tsx
portal/components/workspace/EntityLinkDeck.tsx
portal/components/workspace/EntityPill.tsx
portal/components/workspace/EntitySummaryCards.tsx
portal/components/workspace/EscalationLane.tsx
portal/components/workspace/ExceptionDashboardPanel.tsx
portal/components/workspace/ExecutiveSignalBoard.tsx
portal/components/workspace/InboxPresetCards.tsx
portal/components/workspace/InsightStack.tsx
portal/components/workspace/IntegrationStatusPanel.tsx
portal/components/workspace/KnowledgePanel.tsx
portal/components/workspace/LinkedScenarioPanel.tsx
portal/components/workspace/MobileBottomBar.tsx
portal/components/workspace/MobileBottomNav.tsx
portal/components/workspace/MobileCenterDrawer.tsx
portal/components/workspace/NotificationInboxPanel.tsx
portal/components/workspace/NotificationRuleStudio.tsx
portal/components/workspace/ObjectJourneyRibbon.tsx
portal/components/workspace/ObjectLinkMap.tsx
portal/components/workspace/PinnedEntitiesPanel.tsx
portal/components/workspace/QueueBoard.tsx
portal/components/workspace/QueueBoardMatrix.tsx
portal/components/workspace/RecentEntitiesPanel.tsx
portal/components/workspace/RecordListCard.tsx
portal/components/workspace/RelatedRecordsPanel.tsx
portal/components/workspace/RelationshipGrid.tsx
portal/components/workspace/RelationshipTimeline.tsx
portal/components/workspace/ReviewBoardPanel.tsx
portal/components/workspace/ReviewSignalLane.tsx
portal/components/workspace/RoleWorkbenchHero.tsx
portal/components/workspace/RoleWorkspaceBanner.tsx
portal/components/workspace/SLARiskBoard.tsx
portal/components/workspace/SavedViewsPanel.tsx
portal/components/workspace/ServiceCalendarBoard.tsx
portal/components/workspace/SignalStrip.tsx
portal/components/workspace/SupplyReviewMatrix.tsx
portal/components/workspace/TrendSeriesPanel.tsx
portal/components/workspace/WatchlistPanel.tsx
portal/components/workspace/WorkbenchSummaryGrid.tsx
portal/components/workspace/WorkflowLauncherPanel.tsx
portal/components/workspace/WorkspaceHeader.tsx
portal/components/workspace/center-nav.ts
portal/components/workspace/nav.ts

## Hooks and API clients
admin-portal/lib/api.ts
client-portal/lib/api.ts
portal/lib/ai-assistant-api.ts
portal/lib/api-error.ts
portal/lib/api.ts
portal/lib/api/client.ts
portal/lib/api/tb-client.ts
portal/lib/approval-center-api.ts
portal/lib/archive/analytics-api.ts
portal/lib/archive/enterprise-api.ts
portal/lib/archive/entity-view-api.ts
portal/lib/archive/inbox-api.ts
portal/lib/asset-health-api.ts
portal/lib/contracts-api.ts
portal/lib/customer-success-api.ts
portal/lib/dashboard-api.ts
portal/lib/engineering-actions-api.ts
portal/lib/engineering-api.ts
portal/lib/engineering-intelligence-api.ts
portal/lib/executive-intelligence-api.ts
portal/lib/executive-report-api.ts
portal/lib/hooks/index.ts
portal/lib/hooks/useAnalytics.ts
portal/lib/hooks/useAnalytics.ts.p1bak
portal/lib/hooks/useApiData.ts
portal/lib/hooks/useAuth.ts
portal/lib/hooks/useAuth.ts.p1bak
portal/lib/hooks/useAuth.ts.q1bak
portal/lib/hooks/useAuthFetch.ts
portal/lib/hooks/useCommercial.ts
portal/lib/hooks/useCommercial.ts.p1bak
portal/lib/hooks/useCurrentUser.ts
portal/lib/hooks/useKeyboardShortcuts.ts
portal/lib/hooks/useMaintenance.ts
portal/lib/hooks/useMaintenance.ts.p1bak
portal/lib/hooks/usePagination.ts
portal/lib/hooks/useRole.ts
portal/lib/hooks/useSafeQuery.ts
portal/lib/hooks/useSearch.ts
portal/lib/hooks/useSupplyChain.ts
portal/lib/hooks/useSupplyChain.ts.p1bak
portal/lib/hooks/useTechnicians.ts
portal/lib/hooks/useTechnicians.ts.p1bak
portal/lib/hooks/useUserPreferences.ts
portal/lib/hooks/useWorkOrders.ts
portal/lib/hooks/useWorkOrders.ts.p1bak
portal/lib/hooks/useWorkflow.ts
portal/lib/hooks/useWorkflows.ts
portal/lib/hooks/useWorkflows.ts.p1bak
portal/lib/inventory-api.ts
portal/lib/maintenance-actions-api.ts
portal/lib/maintenance-api.ts
portal/lib/maintenance-detail-api.ts
portal/lib/ops-api.ts
portal/lib/procurement-intelligence-api.ts
portal/lib/projects-enterprise-api.ts
portal/lib/projects-review-api.ts
portal/lib/purchasing-api.ts
portal/lib/query-client.ts
portal/lib/safe-api.ts
portal/lib/service-requests-api.ts
portal/lib/sla-api.ts
portal/lib/sourcing-api.ts
portal/lib/stock-balances-api.ts
portal/lib/supplier-invoices-api.ts
portal/lib/suppliers-api.ts
portal/lib/supply-chain-api.ts
portal/lib/supply-intelligence-api.ts
portal/lib/technicians-api.ts
portal/lib/transfers-api.ts
portal/lib/vendor-analytics-api.ts
portal/lib/work-orders-api.ts

## Backend modules, models, schemas, repositories and services
src/admin_portal_foundation/router.py
src/analytics_api/router.py
src/application/services/commercial_service.py
src/application/services/invoice_service.py
src/application/services/item_service.py
src/application/services/maintenance_schedule_service.py
src/application/services/project_management_service.py
src/client_portal_api_complete/router.py
src/client_portal_api_layer/router.py
src/commercial/activity_tracking/models.py
src/commercial/activity_tracking/repository.py
src/commercial/activity_tracking/router.py
src/commercial/activity_tracking/schemas.py
src/commercial/agent_management/models.py
src/commercial/agent_management/repository.py
src/commercial/agent_management/router.py
src/commercial/agent_management/schemas.py
src/commercial/ai_assistant/router.py
src/commercial/ai_mentor/router.py
src/commercial/ai_scheduling/router.py
src/commercial/ai_signals/router.py
src/commercial/analytics_kpi/router.py
src/commercial/analytics_platform/router.py
src/commercial/approval_center/router.py
src/commercial/approval_chain/router.py
src/commercial/approval_requests/router.py
src/commercial/assets/models.py
src/commercial/assets/repository.py
src/commercial/assets/router.py
src/commercial/assets/schemas.py
src/commercial/audit_log/router.py
src/commercial/auth/models.py
src/commercial/auth/repository.py
src/commercial/auth/router.py
src/commercial/auth/schemas.py
src/commercial/bulk_operations/router.py
src/commercial/cache/models.py
src/commercial/cache/repository.py
src/commercial/cache/router.py
src/commercial/cache/schemas.py
src/commercial/contracts/models.py
src/commercial/contracts/repository.py
src/commercial/contracts/router.py
src/commercial/contracts/schemas.py
src/commercial/csv_export/router.py
src/commercial/customer360/router.py
src/commercial/customer_success/router.py
src/commercial/dashboard/models.py
src/commercial/dashboard/repository.py
src/commercial/dashboard/router.py
src/commercial/dashboard/schemas.py
src/commercial/digital_twin/router.py
src/commercial/documents/models.py
src/commercial/documents/repository.py
src/commercial/documents/router.py
src/commercial/documents/schemas.py
src/commercial/email_alert/router.py
src/commercial/email_notifications/models.py
src/commercial/email_notifications/repository.py
src/commercial/email_notifications/router.py
src/commercial/email_notifications/schemas.py
src/commercial/email_notifications/service.py
src/commercial/email_service/models.py
src/commercial/email_service/repository.py
src/commercial/email_service/router.py
src/commercial/email_service/schemas.py
src/commercial/email_service/service.py
src/commercial/executive_dashboard/models.py
src/commercial/executive_dashboard/repository.py
src/commercial/executive_dashboard/router.py
src/commercial/executive_dashboard/schemas.py
src/commercial/executive_intelligence/router.py
src/commercial/executive_kpi/router.py
src/commercial/global_search/router.py
src/commercial/goods_receipt_workflow/router.py
src/commercial/goods_receipts/models.py
src/commercial/goods_receipts/repository.py
src/commercial/goods_receipts/router.py
src/commercial/goods_receipts/schemas.py
src/commercial/hotels/models.py
src/commercial/hotels/repository.py
src/commercial/hotels/router.py
src/commercial/hotels/schemas.py
src/commercial/inventory_alerts/models.py
src/commercial/inventory_alerts/repository.py
src/commercial/inventory_alerts/router.py
src/commercial/inventory_alerts/schemas.py
src/commercial/inventory_items/models.py
src/commercial/inventory_items/repository.py
src/commercial/inventory_items/router.py
src/commercial/inventory_items/schemas.py
src/commercial/inventory_vendors/models.py
src/commercial/inventory_vendors/repository.py
src/commercial/inventory_vendors/router.py
src/commercial/inventory_vendors/schemas.py
src/commercial/invoices/models.py
src/commercial/invoices/repository.py
src/commercial/invoices/router.py
src/commercial/invoices/schemas.py
src/commercial/knowledge_graph/router.py
src/commercial/lead_management/models.py
src/commercial/lead_management/repository.py
src/commercial/lead_management/router.py
src/commercial/lead_management/schemas.py
src/commercial/maintenance_enterprise/router.py
src/commercial/notification_engine/router.py
src/commercial/notifications/models.py
src/commercial/notifications/repository.py
src/commercial/notifications/router.py
src/commercial/notifications/schemas.py
src/commercial/pagination/models.py
src/commercial/pagination/repository.py
src/commercial/pagination/router.py
src/commercial/pagination/schemas.py
src/commercial/payment_tracking/models.py
src/commercial/payment_tracking/repository.py
src/commercial/payment_tracking/router.py
src/commercial/payment_tracking/schemas.py
src/commercial/pdf_export/router.py
src/commercial/pdf_service/models.py
src/commercial/pdf_service/repository.py
src/commercial/pdf_service/router.py
src/commercial/pdf_service/schemas.py
src/commercial/performance_audit/router.py
src/commercial/pipeline_dashboard/models.py
src/commercial/pipeline_dashboard/repository.py
src/commercial/pipeline_dashboard/router.py
src/commercial/pipeline_dashboard/schemas.py
src/commercial/predictive_maintenance/router.py
src/commercial/procurement_events/models.py
src/commercial/procurement_intake/router.py
src/commercial/projects/models.py
src/commercial/projects/repository.py
src/commercial/projects/router.py
src/commercial/projects/schemas.py
src/commercial/purchase_orders/models.py
src/commercial/purchase_orders/repository.py
src/commercial/purchase_orders/router.py
src/commercial/purchase_orders/schemas.py
src/commercial/purchase_requests/models.py
src/commercial/purchase_requests/repository.py
src/commercial/purchase_requests/router.py
src/commercial/purchase_requests/schemas.py
src/commercial/quotation/models.py
src/commercial/quotation/repository.py
src/commercial/quotation/router.py
src/commercial/quotation/schemas.py
src/commercial/reporting/models.py
src/commercial/reporting/repository.py
src/commercial/reporting/router.py
src/commercial/reporting/schemas.py
src/commercial/rfqs/models.py
src/commercial/sales_pipeline/router.py
src/commercial/scheduler/jobs.py
src/commercial/scope_of_work/router.py
src/commercial/search_filters/models.py
src/commercial/search_filters/repository.py
src/commercial/search_filters/router.py
src/commercial/search_filters/schemas.py
src/commercial/service_reports/models.py
src/commercial/service_reports/repository.py
src/commercial/service_reports/router.py
src/commercial/service_reports/schemas.py
src/commercial/service_requests/models.py
src/commercial/service_requests/repository.py
src/commercial/service_requests/router.py
src/commercial/service_requests/schemas.py
src/commercial/sites/models.py
src/commercial/sites/repository.py
src/commercial/sites/router.py
src/commercial/sites/schemas.py
src/commercial/sla_dashboard/router.py
src/commercial/sse_notifications/router.py
src/commercial/stock_movements/models.py
src/commercial/stock_movements/repository.py
src/commercial/stock_movements/router.py
src/commercial/stock_movements/schemas.py
src/commercial/supplier_portal/router.py
src/commercial/system_notifications/models.py
src/commercial/system_notifications/repository.py
src/commercial/system_notifications/router.py
src/commercial/system_notifications/schemas.py
src/commercial/technicians/models.py
src/commercial/technicians/repository.py
src/commercial/technicians/router.py
src/commercial/technicians/schemas.py
src/commercial/tenant_audit/router.py
src/commercial/user_preferences/router.py
src/commercial/vendor_portal/models.py
src/commercial/vendor_portal/repository.py
src/commercial/vendor_portal/router.py
src/commercial/vendor_portal/schemas.py
src/commercial/vendor_scorecards/models.py
src/commercial/warehouse_intelligence/router.py
src/commercial/warehouses/models.py
src/commercial/warehouses/repository.py
src/commercial/warehouses/router.py
src/commercial/warehouses/schemas.py
src/commercial/warranty/router.py
src/commercial/webhook_notifications/models.py
src/commercial/webhook_notifications/repository.py
src/commercial/webhook_notifications/router.py
src/commercial/webhook_notifications/schemas.py
src/commercial/work_orders/models.py
src/commercial/work_orders/repository.py
src/commercial/work_orders/router.py
src/commercial/work_orders/schemas.py
src/contract_lifecycle_management/router.py
src/core/email_service.py
src/core/services/sprint_plan_service.py
src/maintenance_schedule_module/router.py
src/mobile_api_for_field_technicians/router.py
src/orchestrator/reload_service.py
src/payment_tracking_module/router.py
src/project_management_module/router.py
src/quotation_pdf_generator/router.py
src/service_request_to_work_order_auto_routi/router.py
src/sla_tracking/router.py
src/vendor_portal_api/router.py

## Migrations
alembic/env.py
alembic/versions/679ac109b765_full_schema_v2.py
alembic/versions/9540657cc92b_initial_schema.py
alembic/versions/add_invoices_table.py
alembic/versions/add_notifications_table.py
alembic/versions/mt002_multi_hotel_isolation.py

## Infrastructure and runtime manifests
./05-ENGINEERING/FOUNDATION/Dockerfiles.md
./Dockerfile.api
./admin-portal/.next/package.json
./admin-portal/next.config.ts
./admin-portal/package.json
./alembic.ini
./client-portal/.next/package.json
./client-portal/Dockerfile
./client-portal/next.config.ts
./client-portal/package.json
./docker-compose.production.yml
./docker-compose.yml
./frontend/.next/package.json
./nginx.conf
./portal/.next/package.json
./portal/Dockerfile
./portal/Dockerfile.portal
./portal/next.config.ts
./portal/package.json
./pytest.ini

## AI, knowledge and vector/graph artifacts
src/commercial/ai_assistant/__init__.py
src/commercial/ai_assistant/__pycache__/__init__.cpython-312.pyc
src/commercial/ai_assistant/__pycache__/analytics_router.cpython-312.pyc
src/commercial/ai_assistant/__pycache__/cost_engine.cpython-312.pyc
src/commercial/ai_assistant/__pycache__/dispatch_router.cpython-312.pyc
src/commercial/ai_assistant/__pycache__/dispatch_router.cpython-314.pyc
src/commercial/ai_assistant/__pycache__/document_router.cpython-312.pyc
src/commercial/ai_assistant/__pycache__/router.cpython-312.pyc
src/commercial/ai_assistant/__pycache__/signals_engine.cpython-312.pyc
src/commercial/ai_assistant/__pycache__/signals_engine.cpython-314.pyc
src/commercial/ai_assistant/__pycache__/signals_router.cpython-312.pyc
src/commercial/ai_assistant/__pycache__/signals_router.cpython-314.pyc
src/commercial/ai_assistant/__pycache__/supply_automation_router.cpython-312.pyc
src/commercial/ai_assistant/__pycache__/supply_automation_router.cpython-314.pyc
src/commercial/ai_assistant/analytics_router.py
src/commercial/ai_assistant/cost_engine.py
src/commercial/ai_assistant/dispatch_router.py
src/commercial/ai_assistant/document_router.py
src/commercial/ai_assistant/router.py
src/commercial/ai_assistant/signals_engine.py
src/commercial/ai_assistant/signals_router.py
src/commercial/ai_assistant/supply_automation_router.py
src/commercial/ai_mentor/__init__.py
src/commercial/ai_mentor/__pycache__/__init__.cpython-312.pyc
src/commercial/ai_mentor/__pycache__/router.cpython-312.pyc
src/commercial/ai_mentor/router.py
src/commercial/ai_scheduling/__init__.py
src/commercial/ai_scheduling/__pycache__/__init__.cpython-312.pyc
src/commercial/ai_scheduling/__pycache__/router.cpython-312.pyc
src/commercial/ai_scheduling/router.py
src/commercial/ai_signals/__init__.py
src/commercial/ai_signals/__pycache__/__init__.cpython-312.pyc
src/commercial/ai_signals/__pycache__/router.cpython-312.pyc
src/commercial/ai_signals/router.py
src/commercial/digital_twin/__init__.py
src/commercial/digital_twin/__pycache__/__init__.cpython-312.pyc
src/commercial/digital_twin/__pycache__/router.cpython-312.pyc
src/commercial/digital_twin/router.py
src/commercial/knowledge_graph/__init__.py
src/commercial/knowledge_graph/__pycache__/__init__.cpython-312.pyc
src/commercial/knowledge_graph/__pycache__/router.cpython-312.pyc
src/commercial/knowledge_graph/router.py
src/commercial/predictive_maintenance/__init__.py
src/commercial/predictive_maintenance/__pycache__/__init__.cpython-312.pyc
src/commercial/predictive_maintenance/__pycache__/router.cpython-312.pyc
src/commercial/predictive_maintenance/router.py
