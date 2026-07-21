#!/bin/bash
# SPRINT 8: Qwen 2.5 7b Module Analysis and Upgrade
# Each task asks Qwen to analyze a weak module and produce upgrade spec
# Run: bash tasks/portal/sprint8_qwen_analysis.sh

PORTAL="/home/amr/AI-COMPANY-OS/11-WORKSPACES/triangle-black/portal"
OUT="/home/amr/AI-COMPANY-OS/tasks/portal/sprint8_results"
OLLAMA="http://localhost:11434/api/generate"
MODEL="qwen2.5-coder:7b"
mkdir -p "$OUT"

qwen() {
    local prompt="$1"
    local outfile="$2"
    curl -s -X POST "$OLLAMA" \
        -H "Content-Type: application/json" \
        -d "{\"model\":\"$MODEL\",\"stream\":false,\"prompt\":\"$prompt\",\"options\":{\"temperature\":0.1,\"num_predict\":2000}}" \
        | python3 -c "import json,sys; print(json.load(sys.stdin).get('response',''))" \
        > "$outfile"
    echo "  Saved: $outfile"
}

echo "======================================================"
echo "SPRINT 8: QWEN MODULE ANALYSIS"
echo "======================================================"
echo ""

# MODULE 1: Operations Center
echo "[1/12] Analyzing Operations Center..."
qwen "You are a senior enterprise software architect reviewing a hotel engineering operations portal built with Next.js 16, FastAPI, PostgreSQL. 

The Operations Center has these pages:
- /operations (hub page with module grid)
- /operations/work-orders (list, 50 records, PASS)
- /operations/work-orders/[id] (detail with assign/complete)
- /operations/work-orders/new (create form)
- /operations/dispatch (assign WOs to technicians)
- /operations/technicians (list, 25 records)
- /operations/service-requests (list, 5 records)
- /operations/calendar (placeholder)
- /operations/sla-review (placeholder)
- /operations/workbench (placeholder)
- /operations/workflows (placeholder)

Backend data available:
- work_orders: 72 records with hotel_id, title, type, priority, status, technician_id
- technicians: 25 records with specializations, max_work_orders, current_work_orders
- service_requests: 5 records
- assets: 46 records

Current issues:
1. Calendar page is a placeholder showing 'being built'
2. SLA review is a placeholder
3. Workbench is a placeholder
4. Workflows is a placeholder
5. Dispatch board exists but could be improved

For a world-class hotel engineering SaaS platform comparable to ServiceNow or SAP Fiori, provide:
1. Priority list of which placeholder pages to implement first
2. For each page: exact data model needed, API endpoints to call, component pattern to use
3. What SLA metrics should be calculated from existing work_orders data
4. How the calendar should display maintenance schedules
5. What the workbench should show for a field manager role

Be specific and actionable. Use the existing tech stack." \
"$OUT/module_01_operations.md"

# MODULE 2: Maintenance Center
echo "[2/12] Analyzing Maintenance Center..."
qwen "You are reviewing the Maintenance Center of a hotel engineering SaaS portal (Next.js 16, FastAPI, PostgreSQL).

Existing pages:
- /maintenance (hub with dashboard KPIs)
- /maintenance/assets (list, 46 records)
- /maintenance/asset-tree (expandable category tree)
- /maintenance/pm-plans (list, 30 records)
- /maintenance/schedule (placeholder)
- /maintenance/intelligence (placeholder)
- /maintenance/actions (placeholder)
- /maintenance/costs/review (placeholder)
- /maintenance/downtime/review (placeholder)

Database tables available:
- assets: id, hotel_id, category, name, manufacturer, model, serial_number, location_description, service_frequency, criticality, status
- maintenance_plans: id, asset_node_id, title, plan_type, frequency, next_due_date, status, owner
- maintenance_schedules: (empty table)
- maintenance_work_items: 5 records
- maintenance_cost_records: exists
- maintenance_downtime_records: exists

For a world-class maintenance management system:
1. What should the Schedule page show? What data to query?
2. What does Maintenance Intelligence mean in practice? What AI insights?
3. How should costs/review analyze maintenance expenditure?
4. What KPIs should the maintenance dashboard show that are NOT already there?
5. Which pages to implement first for maximum business value?

Provide exact page specifications with data sources." \
"$OUT/module_02_maintenance.md"

# MODULE 3: Supply Chain Center
echo "[3/12] Analyzing Supply Chain Center..."
qwen "You are reviewing the Supply Chain Center of a hotel engineering SaaS.

Working pages:
- /supply-chain (hub)
- /supply-chain/inventory (60 items, stock levels)
- /supply-chain/purchase-orders (21 records)
- /supply-chain/rfqs (8 records)
- /supply-chain/suppliers (list, using /api/v1/inventory/vendors/)
- /supply-chain/goods-receipts (0 records - empty)

Placeholder pages (show 'being built'):
- /supply-chain/purchase-requests
- /supply-chain/quotations
- /supply-chain/comparison
- /supply-chain/agreements
- /supply-chain/spend
- /supply-chain/risk
- /supply-chain/intelligence
- /supply-chain/review
- /supply-chain/queue
- /supply-chain/invoice-matching
- /supply-chain/supplier-invoices
- /supply-chain/transfers
- /supply-chain/vendor analytics

Database tables available:
- purchase_requests: 1 record
- rfqs with rfq_lines, rfq_suppliers, rfq_vendor_quotes
- supplier_quotations, quotation_comparisons
- supplier_invoices, invoice_matches
- stock_movements, stock_balances
- spend_analytics (empty)

For a world-class procurement module:
1. Which 5 pages give maximum business value to implement first?
2. What does the spend analysis page need to show?
3. How should the RFQ-to-PO workflow be visualized?
4. What risk signals should the risk page display?
5. How should invoice matching work with existing data?

Be specific about data queries and UI patterns." \
"$OUT/module_03_supply_chain.md"

# MODULE 4: Executive Center
echo "[4/12] Analyzing Executive Center..."
qwen "You are reviewing the Executive Center of a hotel engineering SaaS (serving hotel engineering companies in Egypt).

Working pages:
- /executive (hub with live KPIs from real data)
- /executive/intelligence (hot deals, signals)
- /executive/risks (risk score, risk items)
- /executive/exceptions (pending quotes, stale leads)
- /executive/daily-review (today's new leads/WOs)
- /executive/alerts/predictive (overdue invoices, low stock, open WOs)

Placeholder pages:
- /executive/portfolio (contract portfolio)
- /executive/reports (report suite)
- /executive/workbench (daily workbench)
- /executive/command (command center)

Real data available:
- 110 leads (statuses: new, qualified, negotiation, won, lost)
- 72 contracts (some active, some pending)
- 45 invoices
- 72 work orders (open, in_progress, completed)
- 12 projects

For a CEO/Director of Engineering at a hotel engineering company:
1. What does the executive portfolio page need to show?
2. What reports are most valuable (revenue trend, conversion, SLA)?
3. What is a daily executive workbench vs daily-review?
4. What should the command center look like?
5. What KPIs matter most for Egyptian hotel engineering market?

Currency: EGP. Hotels served: luxury 5-star Cairo, Sharm, Alexandria." \
"$OUT/module_04_executive.md"

# MODULE 5: Commercial Center
echo "[5/12] Analyzing Commercial Center..."
qwen "You are reviewing the Commercial Center (CRM) of a hotel engineering SaaS for Egypt market.

Working pages:
- /commercial (hub with live KPIs)
- /leads (110 leads, full CRUD)
- /leads/[id] (detail with timeline, qualify, generate quote)
- /contracts (72 contracts)
- /quotes (250 quotes)
- /invoices (45 invoices)
- /customers (11 customers derived from leads)

Placeholder pages:
- /commercial/pipeline (sales pipeline visualization)
- /commercial/review (review board)
- /commercial/review-intelligence (AI review)
- /commercial/workbench (daily sales workbench)
- /commercial/command (command center)
- /commercial/contracts/renewal (renewal pipeline)

Real data:
- Leads have: company, contact, email, phone, source, status, priority, score
- Quotes have: title, items (JSON), total, status (draft/review/sent/approved/rejected)
- Contracts have: title, status, monthly_value, total_value, duration_months

For Egyptian hotel engineering market CRM:
1. What does the pipeline visualization need to show?
2. What is the renewal pipeline for hotel maintenance contracts?
3. What does the daily sales workbench show?
4. What AI review intelligence means for this market?
5. Most valuable feature to implement next?

Context: Average contract EGP 1-5M/year. Clients are 5-star hotels." \
"$OUT/module_05_commercial.md"

# MODULE 6: Analytics Platform
echo "[6/12] Analyzing Analytics Platform..."
qwen "You are reviewing the Analytics Platform of a hotel engineering SaaS.

Working:
- /analytics (cross-center KPIs with real data)
- /analytics/scorecards (enterprise scorecards with progress bars)
- /analytics/sla (SLA compliance metrics)

Real data for analytics:
- 110 leads with statuses (conversion rate: 1.3% won)
- 72 work orders (completion rate: 18.8% - very low)
- 25 technicians, 46 assets
- 30 PM plans
- 72 contracts, 45 invoices

Current KPIs:
- Commercial: total_leads, won_leads, conversion_rate, active_contracts, revenue_collected
- Operations: total_work_orders, completed_work_orders, completion_rate, active_technicians
- SLA: compliance_rate, total_work_orders, critical_open, sla_target

Missing analytics (need to build):
1. Revenue trend (monthly EGP collected)
2. Lead funnel by stage
3. Asset reliability scores
4. Technician utilization
5. PM plan completion rates
6. Client satisfaction correlation

For a world-class analytics platform:
1. What charts are most important for hotel engineering operations?
2. How to calculate MTBF and MTTR from existing data?
3. What drill-down capability should scorecards have?
4. How to build a predictive maintenance score?
5. Which analytics page to build next?" \
"$OUT/module_06_analytics.md"

# MODULE 7: Projects Center
echo "[7/12] Analyzing Projects Center..."
qwen "You are reviewing the Projects Center of a hotel engineering SaaS.

Working:
- /projects-center (12 projects with KPI dashboard)
- /projects-center/[id] (phases, risks, milestones with progress)

Placeholder pages:
- /projects-center/actions
- /projects-center/intelligence
- /projects-center/review
- /projects-center/review/schedule

Real project data (12 projects):
- Grand Cairo Hotel Lobby Renovation: budget 500K EGP, 65% complete
- Sharm Resort MEP Overhaul: budget 1.2M EGP, 40% complete
- Four Seasons BMS Integration: budget 1.5M EGP, 60% complete
- Kempinski Solar 500kW: budget 4.5M EGP, 15% complete

Database tables: projects, project_phases, project_milestones, project_risks, project_budgets, project_tasks, project_documents, project_site_reports, project_variations

For hotel engineering project management:
1. What does project actions page need?
2. What is project intelligence for hotel engineering?
3. How should the review page aggregate multi-project signals?
4. Schedule review for phases and milestones?
5. What Gantt or timeline view is needed?" \
"$OUT/module_07_projects.md"

# MODULE 8: Customers/CS Center  
echo "[8/12] Analyzing Customer Success..."
qwen "You are reviewing the Customer Success center of a hotel engineering SaaS.

Working:
- /customers (11 customers from pipeline)
- /customers/360 (360 view)
- /customers/review (renewal signals)

Real customer data:
- Derived from leads marked 'won' or 'qualified' 
- Linked to contracts (active contracts)
- Linked to invoices (payment history)

Database tables available:
- customer_health_scores (has data)
- customer_meetings
- customer_renewals
- customer_satisfaction_records
- customer_tasks
- customer_audit_events

For hotel engineering B2B customer success:
1. What health score formula for hotel engineering clients?
2. What renewal pipeline signals are most important?
3. How to build 360 view for a hotel client?
4. What customer meetings data to track?
5. How to detect churn risk in hotel engineering contracts?

Context: Clients are hotels. Relationships are 1-5 year maintenance contracts." \
"$OUT/module_08_customers.md"

# MODULE 9: Administration
echo "[9/12] Analyzing Administration..."
qwen "You are reviewing the Administration center of a hotel engineering SaaS.

Existing pages:
- /administration (hub)
- /administration/users (user management UI, create/list)
- /administration/audit (activity log with filter)
- /administration/hotels (hotel properties)
- /admin/notification-rules (placeholder)
- /profile (user profile with password change)
- /settings (Tabs with General/Notifications/Security/System)

User roles in system: admin, manager, engineer, technician, viewer

For enterprise-grade administration:
1. What is missing from user management? (RBAC, permissions?)
2. What notification rules UI should look like?
3. What system settings are most important?
4. How should hotel/property management work?
5. What audit log improvements are needed?

The system serves a B2B hotel engineering company with 5-25 users." \
"$OUT/module_09_administration.md"

# MODULE 10: AI/Intelligence
echo "[10/12] Analyzing AI Module..."
qwen "You are reviewing the AI Assistant module of a hotel engineering SaaS with local Ollama running qwen2.5-coder:7b.

Current:
- /ai (placeholder showing 'being built')
- /engineering/ai (placeholder)
- AI Engine running on port 8001

Available AI infrastructure:
- Ollama running locally with qwen2.5-coder:7b
- Qdrant vector database (19 collections)
- Hub OS with AI agents

For a hotel engineering AI assistant:
1. What 5 most valuable AI queries for a hotel engineering manager?
2. How to implement natural language work order search?
3. What predictive maintenance AI looks like with existing data?
4. How to build an asset failure prediction model?
5. What AI reports make sense for this domain?

Context: Hotel engineering company maintains HVAC, electrical, plumbing, elevators for 5-star hotels in Egypt." \
"$OUT/module_10_ai.md"

# MODULE 11: Inbox/Notifications
echo "[11/12] Analyzing Inbox..."
qwen "Reviewing the inbox/notification system of a hotel engineering SaaS.

Current state:
- /notifications page (shows 50 notifications, working)
- /inbox (placeholder)
- /inbox/presets (placeholder)
- Bell icon in topbar shows unread count

479 notifications in database covering:
- Work order assignments
- Lead updates
- Quote approvals
- System alerts

For enterprise inbox:
1. Difference between notifications and inbox?
2. What are role-based inbox presets for: manager, engineer, technician?
3. How should notification priority work?
4. What real-time update pattern to use?
5. What notification actions (approve, dismiss, delegate) are needed?" \
"$OUT/module_11_inbox.md"

# MODULE 12: Engineering Center
echo "[12/12] Analyzing Engineering Center..."
qwen "Reviewing the Engineering Center of a hotel engineering SaaS.

Pages:
- /engineering (hub)
- /engineering/ai (AI workspace - placeholder)
- /engineering/intelligence (placeholder)
- /engineering/actions (placeholder)
- /engineering/review (placeholder)

Database tables available (with data):
- engineering_boqs (bill of quantities)
- engineering_documents
- engineering_drawings
- engineering_equipment
- engineering_inspections
- engineering_site_visits
- engineering_specifications
- engineering_quality_records
- engineering_safety_records

For hotel engineering operations (MEP, HVAC, civil works):
1. What does Engineering Intelligence mean in practice?
2. How to implement BOQ management for hotel projects?
3. What inspection workflow UI is needed?
4. How should site visit reports work?
5. What document management for engineering drawings?

Context: Company does MEP, HVAC, plumbing, electrical for hotels." \
"$OUT/module_12_engineering.md"

echo ""
echo "======================================================"
echo "SPRINT 8 ANALYSIS COMPLETE"
echo "======================================================"
echo ""
echo "Results saved to: $OUT/"
ls -la "$OUT/"
echo ""
echo "NEXT: Read results and execute upgrades"
echo "  cat $OUT/module_01_operations.md"

