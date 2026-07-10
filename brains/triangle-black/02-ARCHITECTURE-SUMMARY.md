# TRIANGLE BLACK — ARCHITECTURE SUMMARY

## Backend Layout
src/
├── main.py                    ← FastAPI entry point (version 3.0.0)
├── core/
│   ├── actions.py             ← ALL business endpoints (actions router, 100+ endpoints)
│   ├── auth.py                ← JWT + bcrypt + role guards
│   ├── base.py                ← SQLAlchemy Base
│   ├── business.py            ← Domain logic (qualify, assign, generate quote)
│   ├── database.py            ← get_db() dependency
│   ├── email_service.py       ← SMTP email with PDF attachment
│   ├── seed.py                ← Demo data (15 hotels)
│   ├── tenant.py              ← get_hotel_id() dependency
│   └── pdf/generator.py       ← Enterprise PDF (reportlab)
└── commercial/
    ├── auth/                  ← User model + JWT router
    ├── lead_management/       ← Lead CRUD
    ├── agent_management/      ← Agent CRUD
    ├── quotation/             ← Quote CRUD
    ├── contracts/             ← Contract lifecycle + activate + renew
    ├── invoices/              ← Invoice system
    ├── notifications/         ← Role-based notifications
    ├── activity_tracking/     ← Activity timeline
    ├── hotels/                ← Hotel model
    ├── sites/                 ← Physical service locations
    ├── assets/                ← Equipment registry
    ├── technicians/           ← Field technicians
    ├── work_orders/           ← Service work orders
    ├── service_requests/      ← Client issue requests
    ├── service_reports/       ← Visit completion reports
    ├── inventory_items/       ← Stock item catalog
    ├── warehouses/            ← Storage locations
    ├── inventory_vendors/     ← Procurement vendors
    ├── stock_movements/       ← Stock audit trail
    ├── purchase_requests/     ← PR workflow
    ├── purchase_orders/       ← PO workflow
    ├── goods_receipts/        ← Receiving workflow
    ├── rfqs/                  ← Request for Quotation
    ├── vendor_scorecards/     ← Vendor intelligence
    ├── procurement_events/    ← Procurement audit log
    ├── pipeline_dashboard/    ← Pipeline CRUD
    ├── reporting/             ← Reports
    ├── search_filters/        ← Saved searches
    └── webhook_notifications/ ← Webhook config

## Architecture Rules
1. All business endpoints go in src/core/actions.py (actions router)
2. New domain modules: src/commercial/<name>/{models,schemas,repository,router}.py
3. All models import Base ONLY from src.core.base
4. DB sessions: ALWAYS use get_db() from src.core.database
5. JWT required on ALL endpoints except /auth/login and /auth/register
6. NEVER use Base.metadata.create_all (Alembic handles schema)
7. Create tables via raw SQL + manual alembic_version update
8. Package install: uv pip install --python .venv/bin/python <package>

## Router Pattern
router = APIRouter(prefix="/actions", tags=["business-actions"])  ← actions router
router = APIRouter(prefix="/<domain>", tags=["<domain>"])         ← domain routers

## Role Guards
require_agent()   → agent, manager, admin
require_manager() → manager, admin only
require_admin()   → admin only

## Frontend Architecture
Stack:     Next.js 16.2.10 App Router, TypeScript, Tailwind CSS
State:     TanStack React Query (useQuery, useMutation)
API base:  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8020/api/v1"
Auth:      localStorage ("tb_token" ops/admin, "client_token" client portal)

## Key ZSH Rules
- ALWAYS quote bracket paths: 'app/(app)/quotes/[id]/page.tsx'
- ALWAYS use uv not pip
- NEVER use inline # comments as shell commands
- NEVER paste Python into zsh — use heredoc or .venv/bin/python - << 'EOF'
- For complex files use Python/Node scripts to write them
- For JSX files use cat > /tmp/file.js << 'EOF' then node /tmp/file.js
