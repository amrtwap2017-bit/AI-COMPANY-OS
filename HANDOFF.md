# TRIANGLE BLACK — AGENT HANDOFF
Date: 2026-07-26 | Sprint: 151 | Version: 2.1.0

## PLATFORM STATUS — MILESTONE ACHIEVED

| Metric         | Value              |
|----------------|--------------------|
| Digital Twin   | 100/100 ✅          |
| APIs Green     | 10/10 ✅            |
| Portal         | 200 OK ✅           |
| Backend        | FastAPI :8030 ✅    |
| Database       | 134 tables ✅       |

## QUICK START

source ~/.zshrc
bash /home/amr/AI-COMPANY-OS/START-TRIANGLE-BLACK.sh

## CREDENTIALS

Portal:  http://localhost:3000
Backend: http://localhost:8030
Login:   amr@triangleblack.com / admin123
DB:      docker exec ai-postgres psql -U ai -d triangle_black

## START BACKEND

cd /home/amr/AI-COMPANY-OS/11-WORKSPACES/triangle-black
nohup .venv/bin/python3 -m uvicorn src.main:app --host 0.0.0.0 --port 8030 --workers 1 --log-level warning > /tmp/tb_backend.log 2>&1 &
sleep 22 && curl -s -o /dev/null -w "%{http_code}" http://localhost:8030/api/v1/ai/health

## START PORTAL

cd /home/amr/AI-COMPANY-OS/11-WORKSPACES/triangle-black/portal
fuser -k 3000/tcp 2>/dev/null; sleep 1
nohup node node_modules/.bin/next start --port 3000 > /tmp/tb_portal.log 2>&1 &

## IF PORTAL FAILS (rebuild first)

cd /home/amr/AI-COMPANY-OS/11-WORKSPACES/triangle-black/portal
rm -rf .next && node node_modules/.bin/next build
nohup node node_modules/.bin/next start --port 3000 > /tmp/tb_portal.log 2>&1 &

## DATABASE SESSION PATTERN — CRITICAL

database.py uses Session(engine) NOT SessionLocal.
Always import: from src.core.database import engine
Always use:    db = Session(engine)
NEVER use:     SessionLocal (does not exist)

## CONFIRMED WORKING APIs (all 200)

GET /api/v1/leads/                   110 records
GET /api/v1/work-orders/             72 records
GET /api/v1/assets/                  46 records
GET /api/v1/technicians/             25 records
GET /api/v1/contracts/               72 records
GET /api/v1/invoices/                45 records
GET /api/v1/maintenance/pm-plans/    40 records
GET /api/v1/payment-tracking/        45 records
GET /api/v1/notifications/           479 records
GET /api/v1/goods-receipts/          16 records
GET /api/v1/service-requests/        15 records
GET /api/v1/projects/                12 records
GET /api/v1/suppliers/               15 records
GET /api/v1/rfqs/                    5+ records
GET /api/v1/twin/state               100/100

## CONFIRMED SCHEMAS

maintenance_plans: id, asset_node_id, title, plan_type,
  frequency, next_due_date(varchar), status, owner, notes,
  created_at, updated_at
  ⚠️  NO hotel_id column

service_requests: id, hotel_id, contract_id, site_id,
  work_order_id, submitted_by, contact_phone, category,
  urgency, status, title, description, preferred_date,
  resolved_at, resolution_notes, created_at, updated_at
  ⚠️  NO priority column — use urgency

goods_receipts: id, hotel_id, grn_number, po_id, vendor_id,
  warehouse_id(NOT NULL), received_date, status, lines,
  notes, received_by, created_at, updated_at
  ⚠️  warehouse_id is NOT NULL

notifications: id, title, message, type, entity_id,
  entity_type, recipient_role, is_read, created_at,
  updated_at, hotel_id

## DIGITAL TWIN SCORING FORMULA

health = 100
health -= min(15, critical_open_work_orders * 1)
health -= min(8,  overdue_work_orders * 1)
health -= min(5,  technicians_at_capacity * 1)
health -= min(5,  inventory_items_below_min * 1)
health -= min(8,  overdue_invoices * 1)
health -= min(8,  maintenance_plans_overdue * 1)

To maintain 100/100:
- work_orders: no due_date in past unless completed
- maintenance_plans: next_due_date always in future
- invoices: no status='overdue'
- inventory: qty_on_hand >= min_stock always
- technicians: current_work_orders < max_work_orders

## KEY PATTERNS

# Auth (form-urlencoded)
curl -X POST http://localhost:8030/api/v1/auth/login \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=amr@triangleblack.com&password=admin123"

# React Query v4 (NOT v5)
const { data } = useQuery(["key"], () =>
  authFetch("/api/v1/endpoint").then(r => r.json()))

# Safe array extraction
const toArr = (d) =>
  Array.isArray(d) ? d : d?.items || d?.data || d?.results || []

## NEXT PRIORITIES (Sprint 152+)

1. RBAC — role-based access control (admin/manager/technician)
2. Type safety — remove @ts-nocheck from portal pages
3. Repository pattern — extract DB logic from route handlers
4. Test suite — pytest for critical API paths
5. Observability — structured logging + health metrics
6. Portal UX — enterprise page template consistency

## TECH STACK

Backend:  FastAPI 0.100+ | SQLAlchemy | PostgreSQL | JWT
Frontend: Next.js 16.2.10 | React 19 | TanStack Query v4
AI:       Ollama Qwen 2.5 7B :11434 | Qdrant :6333
DB:       PostgreSQL triangle_black (134 tables)

## HEALTH CHECK

python3 << 'EOF'
import requests
token = requests.post("http://localhost:8030/api/v1/auth/login",
    data={"username":"amr@triangleblack.com","password":"admin123"},
    timeout=5).json().get("access_token","")
H = {"Authorization": f"Bearer {token}"}
twin = requests.get("http://localhost:8030/api/v1/twin/state",timeout=5).json()
print(f"Twin: {twin['health_score']}/100")
for api in ["/api/v1/leads/","/api/v1/work-orders/","/api/v1/maintenance/pm-plans/",
            "/api/v1/notifications/","/api/v1/payment-tracking/"]:
    r = requests.get(f"http://localhost:8030{api}",headers=H,timeout=5)
    print(f"  {api}: {r.status_code}")
EOF
