# TRIANGLE BLACK — CURRENT IMPLEMENTATION STATUS
# As of v4.3.0 (2026-07-10)

## Services & Ports
API           → http://127.0.0.1:8020   (FastAPI)
Ops Portal    → http://127.0.0.1:3200   (portal/)
Client Portal → http://127.0.0.1:3201   (client-portal/)
Admin Portal  → http://127.0.0.1:3202   (admin-portal/)
Database      → 127.0.0.1:5432          (ai-postgres, pgvector:pg17)
               DB=triangle_black | user=ai | pass=ai123
Ollama        → http://localhost:11434

## Start Commands
API:
  cd /home/amr/AI-COMPANY-OS/11-WORKSPACES/triangle-black
  export TRIANGLE_BLACK_DB_URL="postgresql+psycopg2://ai:ai123@127.0.0.1:5432/triangle_black"
  export PYTHONPATH="/home/amr/AI-COMPANY-OS/11-WORKSPACES/triangle-black"
  .venv/bin/uvicorn src.main:app --host 0.0.0.0 --port 8020 --reload

OPS:    cd portal && npm run dev -- --port 3200
CLIENT: cd client-portal && npm run dev -- --port 3201
ADMIN:  cd admin-portal && npm run dev -- --port 3202

## Database Tables (24 total)
Core CRM:         users, leads, agents, quotes, contracts, invoices
Activity:         activities, notifications, lead_searches, pipelines, reports
Service Ops:      technicians, sites, assets, work_orders, service_requests, service_reports
Inventory:        inventory_items, warehouses, inventory_vendors, stock_movements,
                  stock_balances, purchase_requests, purchase_orders, goods_receipts
Procurement:      rfqs, rfq_vendor_quotes, vendor_scorecards, procurement_events
Misc:             webhookconfigs, email_notifications, cache_configs, paginated_responses
Meta:             alembic_version (current: b2c3d4e5f6a7)

## All ID Fields
All IDs are VARCHAR(36) UUID strings (NOT integers)
Default hotel: tb-default-hotel-000000000001

## Implemented ✅
- Full CRM: leads, agents, quotes, contracts, invoices
- JWT auth with role guards
- PDF generation (reportlab)
- Email service (SMTP, backgrounded)
- Notifications (5 trigger types)
- Activity tracking
- Reporting: revenue trend, lead funnel, agent leaderboard
- CSV exports: invoices, contracts
- Contract lifecycle: activate (auto-invoice), renew
- Service Ops: technicians, sites, assets, work orders, service requests, service reports
- Work order assignment + completion (capacity management)
- Inventory: items, warehouses, vendors, stock movements
- Procurement: PR → approve → PO → GRN → stock update
- RFQ: create → vendor quotes → compare → award → PO
- Vendor scorecards
- Procurement audit log (procurement_events)
- TB Agent CLI (agent/cli.py)
- Production Docker (docker-compose.production.yml, nginx.conf)
- 111 tests passing

## Frontend Pages ✅
Ops Portal (/):
  dashboard, leads, leads/[id], leads/[id]/edit, leads/new
  quotes, quotes/[id], quotes/new
  contracts, contracts/[id]
  invoices, invoices/[id]
  agents, reports, notifications
  inventory/ (dashboard)
  inventory/items
  inventory/vendors
  inventory/warehouses
  inventory/purchase-requests
  inventory/purchase-orders
  work-orders
  technicians

Client Portal (/):
  dashboard, quotes, quotes/[id]
  contracts, contracts/[id]
  invoices, invoices/[id]
  activities

Admin Portal (/):
  dashboard, users, agents, contracts, system

## Not Built Yet ❌
- Client portal: service requests page
- Admin portal: technicians config, inventory settings
- Webhook firing logic (table exists, no logic)
- Rate limiting
- WebSocket/SSE (polling only)
- Multi-tenancy (all data under one default hotel)
- SMTP not configured (SMTP_ENABLED=false)
- tb-agent index/analyze (ChromaDB indexing)
- Stock balance table updates (movements recorded but balances not computed)
- Service plan templates / PM scheduling
- SLA dashboard
