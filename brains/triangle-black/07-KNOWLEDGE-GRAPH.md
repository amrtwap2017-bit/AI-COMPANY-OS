# TRIANGLE BLACK — KNOWLEDGE GRAPH

## Business Capability → Implementation Map

### Lead Management
Capability: Capture hotel leads, qualify, assign to agents
Domain:     src/commercial/lead_management/
Model:      Lead (id, hotel_id, name, email, phone, company, source,
                  status, priority, score, notes, created_at, updated_at)
Status values: new → qualified → assigned → converted | lost
API CRUD:   GET/POST /api/v1/leads/  |  GET/PATCH/DELETE /api/v1/leads/{id}
Actions:    /api/v1/actions/leads/{id}/qualify | assign | quote | timeline
Frontend:   portal/app/(app)/leads/

### Quote Management
Model:      Quote (id, hotel_id, lead_id, title, description, items[JSON],
                   total, status, validity_date)
Status:     draft → review → sent → approved | rejected | expired
Actions:    /api/v1/actions/quotes/{id}/submit | send | approve | reject | pdf
Frontend:   portal/app/(app)/quotes/

### Contract Management
Model:      Contract (id, hotel_id, quote_id, lead_id, title, services[JSON],
                      total_value, monthly_value, status, start_date, end_date,
                      duration_months, renewal_count)
Status:     pending_signature → active → expired | cancelled
Actions:    POST /api/v1/contracts/{id}/activate (auto-creates invoice)
            POST /api/v1/contracts/{id}/renew
Frontend:   portal/app/(app)/contracts/

### Invoice Management
Model:      Invoice (id, hotel_id, invoice_number, contract_id, lead_id,
                     title, amount, tax_amount, total_amount, status,
                     issue_date, due_date, paid_date, renewal_number)
Number fmt: TB-INV-YYYYMM-XXXX
Status:     draft → sent → paid | overdue
Actions:    POST /api/v1/invoices/{id}/send | mark-paid
Frontend:   portal/app/(app)/invoices/

### Service Operations
Technician: (id, hotel_id, name, email, phone, specializations[JSON],
              max_work_orders, current_work_orders, is_active)
Site:       (id, hotel_id, contract_id, name, address, city, contact_person)
Asset:      (id, hotel_id, site_id, category, name, service_frequency, status)
WorkOrder:  (id, hotel_id, work_order_number, contract_id, site_id, asset_id,
              technician_id, type, priority, status, title, scheduled_date)
WO types:   preventive_maintenance | corrective_maintenance | emergency | inspection
WO status:  draft → scheduled → assigned → in_progress → completed → closed
Actions:    POST /api/v1/actions/work-orders/{id}/assign | complete
            GET  /api/v1/actions/dashboard/service-ops

### Inventory & Procurement
InventoryItem:    (item_code, name, category, unit_of_measure, item_type,
                   min_stock, reorder_qty, standard_cost, average_cost)
Warehouse:        (code, name, type: main|branch|project|technician|quarantine)
InventoryVendor:  (vendor_code, name, payment_terms, lead_time_days, rating)
StockMovement:    (movement_number, item_id, warehouse_id, movement_type, qty,
                   unit_cost, reference_type, reference_id)
PurchaseRequest:  (pr_number, requester, urgency, status, lines[JSON])
PurchaseOrder:    (po_number, vendor_id, pr_id, status, lines[JSON], total_amount)
GoodsReceipt:     (grn_number, po_id, warehouse_id, lines[JSON])
RFQ:              (rfq_number, pr_id, title, lines[JSON])
Number formats:   TB-PR-YYYYMM | TB-PO-YYYYMM | TB-GRN-YYYYMM | TB-MOV-YYYYMM
                  TB-RFQ-YYYYMM | TB-WO-YYYYMM

### Reporting
Endpoints:  GET /api/v1/actions/reports/revenue-trend?months=12
            GET /api/v1/actions/reports/lead-funnel
            GET /api/v1/actions/reports/agent-leaderboard
            GET /api/v1/actions/reports/export/invoices.csv
            GET /api/v1/actions/reports/export/contracts.csv
            GET /api/v1/actions/inventory/dashboard
            GET /api/v1/actions/procurement/dashboard
            GET /api/v1/actions/inventory/low-stock
