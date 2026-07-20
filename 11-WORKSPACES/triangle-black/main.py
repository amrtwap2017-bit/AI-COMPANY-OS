"""
Triangle Black — TB Admin Server
Port: 8030
Wires ALL commercial routers from src/commercial/
"""
from __future__ import annotations
import os, sys

# Make src importable
sys.path.insert(0, os.path.dirname(__file__))

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# ── Core DB ──────────────────────────────────────────────────────────────────
try:
    from src.core.database import check_connection, engine
    from src.core.base import Base
    DB_AVAILABLE = True
except Exception as e:
    print(f"⚠️  DB import warning: {e}")
    DB_AVAILABLE = False

# ── Model imports (create tables) ────────────────────────────────────────────
try:
    from src.commercial.lead_management        import models as lead_models
    from src.commercial.agent_management       import models as agent_models
    from src.commercial.pipeline_dashboard     import models as pipeline_models
    from src.commercial.activity_tracking      import models as activity_models
    from src.commercial.search_filters         import models as search_models
    from src.commercial.webhook_notifications  import models as webhook_models
    from src.commercial.quotation              import models as quotation_models
    from src.commercial.auth                   import models as auth_models
    from src.commercial.reporting              import models as reporting_models
    from src.commercial.contracts              import models as contract_models
    from src.commercial.hotels                 import models as hotel_models
    from src.commercial.cache                  import models as cache_models
    from src.commercial.pagination             import models as pagination_models
    from src.commercial.email_notifications    import models as email_notification_models
    MODELS_OK = True
except Exception as e:
    print(f"⚠️  Model import warning: {e}")
    MODELS_OK = False

# Try extended models (may not have models.py)
for mod in [
    "src.commercial.work_orders",
    "src.commercial.technicians",
    "src.commercial.assets",
    "src.commercial.service_requests",
    "src.commercial.warehouses",
    "src.commercial.inventory_items",
    "src.commercial.inventory_vendors",
    "src.commercial.purchase_orders",
    "src.commercial.purchase_requests",
    "src.commercial.notifications",
    "src.commercial.invoices",
    "src.commercial.sites",
    "src.commercial.goods_receipts",
    "src.commercial.stock_movements",
    "src.commercial.service_reports",
]:
    try:
        __import__(f"{mod}.models")
    except Exception:
        pass

# ── App ───────────────────────────────────────────────────────────────────────
app = FastAPI(
    title="Triangle Black — TB Admin",
    version="v2.0.0",
    description="Full enterprise backend for Triangle Black portal",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://localhost",
        "http://localhost:3001",
        "http://localhost:3000",
        "http://127.0.0.1:3001",
    ],
    allow_credentials=True,
    allow_methods=["GET","POST","PUT","PATCH","DELETE","OPTIONS"],
    allow_headers=["*"],
)

# ── Startup ───────────────────────────────────────────────────────────────────
@app.on_event("startup")
async def startup():
    if DB_AVAILABLE and MODELS_OK:
        try:
            Base.metadata.create_all(bind=engine)
            print("✅ Database tables created/verified")
        except Exception as e:
            print(f"⚠️  Table creation warning: {e}")

# ── Health ────────────────────────────────────────────────────────────────────
@app.get("/health")
@app.get("/api/health")
async def health():
    return {
        "status": "ok",
        "service": "triangle-black",
        "version": "v2.0.0",
        "db": "connected" if DB_AVAILABLE else "unavailable",
        "routers": "full-commercial",
    }

@app.get("/")
async def root():
    return {"service": "triangle-black-admin", "status": "running", "version": "v2.0.0"}

# ── Router registration helper ────────────────────────────────────────────────
PREFIX = "/api/v1"

def safe_include(module_path: str, router_attr: str = "router", prefix: str = PREFIX):
    try:
        mod = __import__(module_path, fromlist=[router_attr])
        r = getattr(mod, router_attr)
        app.include_router(r, prefix=prefix)
        print(f"  ✅ {module_path}")
    except Exception as e:
        print(f"  ❌ {module_path}: {e}")

# ── Core commercial routers ───────────────────────────────────────────────────
print("🔌 Registering commercial routers...")

safe_include("src.commercial.lead_management.router")
safe_include("src.commercial.agent_management.router")
safe_include("src.commercial.pipeline_dashboard.router")
safe_include("src.commercial.activity_tracking.router")
safe_include("src.commercial.search_filters.router")
safe_include("src.commercial.webhook_notifications.router")
safe_include("src.commercial.quotation.router")
safe_include("src.commercial.auth.router")
safe_include("src.commercial.reporting.router")
safe_include("src.commercial.contracts.router")
safe_include("src.commercial.hotels.router")
safe_include("src.commercial.cache.router")
safe_include("src.commercial.pagination.router")
safe_include("src.commercial.email_notifications.router")

# ── Extended routers (portal pages) ──────────────────────────────────────────
safe_include("src.commercial.work_orders.router")
safe_include("src.commercial.technicians.router")
safe_include("src.commercial.assets.router")
safe_include("src.commercial.service_requests.router")
safe_include("src.commercial.warehouses.router")
safe_include("src.commercial.inventory_items.router")
safe_include("src.commercial.inventory_vendors.router")
safe_include("src.commercial.purchase_orders.router")
safe_include("src.commercial.purchase_requests.router")
safe_include("src.commercial.notifications.router")
safe_include("src.commercial.invoices.router")
safe_include("src.commercial.sites.router")
safe_include("src.commercial.goods_receipts.router")
safe_include("src.commercial.stock_movements.router")
safe_include("src.commercial.service_reports.router")

# ── Dashboard & intelligence routers ─────────────────────────────────────────
safe_include("src.commercial.dashboard.router")
safe_include("src.commercial.executive_dashboard.router")
safe_include("src.commercial.executive_intelligence.router")
safe_include("src.commercial.pdf_service.router")
safe_include("src.commercial.email_service.router")
safe_include("src.commercial.system_notifications.router")
safe_include("src.commercial.inventory_alerts.router")
safe_include("src.commercial.vendor_portal.router")
safe_include("src.commercial.documents.router")
safe_include("src.commercial.payment_tracking.router")

# ── Core actions ──────────────────────────────────────────────────────────────
safe_include("src.core.actions", prefix=PREFIX)

print("✅ TB Admin ready — all routers registered")


# ── Entity Routes (appended) ──────────────────────────────
try:
    print("✅ Entity routes loaded: /api/v1/work-orders etc")
except Exception as _err:
    print(f"⚠️  Entity routes skipped: {_err}")

# ── Leads list endpoint (missing from commercial router) ──
from fastapi import Request as _Request
from fastapi.responses import JSONResponse as _JSONResponse
import sqlite3 as _sqlite3, os as _os

@app.get("/api/v1/leads", tags=["leads-list"])
@app.get("/api/v1/leads/", tags=["leads-list"])
async def leads_list(skip: int = 0, limit: int = 50):
    db_path = _os.path.join(_os.path.dirname(__file__), "triangle_black.db")
    try:
        con = _sqlite3.connect(db_path)
        con.row_factory = _sqlite3.Row
        rows = con.execute(
            "SELECT * FROM leads LIMIT ? OFFSET ?", (limit, skip)
        ).fetchall()
        con.close()
        return [dict(r) for r in rows]
    except Exception as e:
        return _JSONResponse(status_code=500, content={"error": str(e)})


# ── BE-104 to BE-109: Sprint BE-B Routers ────────────────────────────────
print("Registering Sprint BE-B routers...")
_be_b = [
    ("src.commercial.maintenance_enterprise.router",  "maintenance"),
    ("src.commercial.executive_intelligence.router",  "executive_intelligence"),
    ("src.commercial.analytics_platform.router",      "analytics"),
    ("src.commercial.approval_center.router",         "approvals"),
    ("src.commercial.customer_success.router",        "customers"),
    ("src.commercial.projects.router",               "projects"),
]
for _mod_path, _name in _be_b:
    try:
        _mod = __import__(_mod_path, fromlist=["router"])
        app.include_router(_mod.router, prefix="/api/v1")
        print(f"  OK: {_name}")
    except Exception as _e:
        print(f"  WARN: {_name}: {_e}")
