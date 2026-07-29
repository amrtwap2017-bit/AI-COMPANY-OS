from __future__ import annotations
from pathlib import Path

"""
Triangle Black — Main FastAPI Application v1.4.0
Hotel Engineering Platform — Multi-hotel tenant isolation
"""
from fastapi import Depends, FastAPI, Form, HTTPException, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
import logging
logging.basicConfig(level=logging.WARNING, format='%(asctime)s %(levelname)s %(message)s')
logger = logging.getLogger('triangle_black')


from src.core.database import check_connection, engine
from src.core.base import Base

# Import all models — order matters for Base.metadata
from src.commercial.lead_management import models as lead_models
from src.commercial.agent_management import models as agent_models
from src.commercial.pipeline_dashboard import models as pipeline_models
from src.commercial.activity_tracking import models as activity_models
from src.commercial.search_filters import models as search_models
from src.commercial.webhook_notifications import models as webhook_models
from src.commercial.quotation import models as quotation_models
from src.commercial.auth import models as auth_models
from src.commercial.reporting import models as reporting_models
from src.commercial.contracts import models as contract_models
from src.commercial.hotels import models as hotel_models
from src.commercial.cache import models as cache_models
from src.commercial.pagination import models as pagination_models
from src.commercial.email_notifications import models as email_notification_models

# Import all routers
from src.commercial.lead_management.router import router as leads_router
from src.commercial.agent_management.router import router as agents_router
from src.commercial.pipeline_dashboard.router import router as pipeline_router
from src.commercial.activity_tracking.router import router as activity_router
from src.commercial.search_filters.router import router as search_router
from src.commercial.webhook_notifications.router import router as webhook_router
from src.commercial.quotation.router import router as quotation_router
from src.commercial.auth.router import router as auth_router
from src.commercial.reporting.router import router as reporting_router
from src.commercial.contracts.router import router as contracts_router
from src.core.actions import router as actions_router

# ── Service Operations OS — Sprint 15 ────────────────────────────────────────
from src.commercial.technicians.models import Technician  # noqa
from src.commercial.sites.models import Site  # noqa
from src.commercial.assets.models import Asset  # noqa
from src.commercial.work_orders.models import WorkOrder  # noqa
from src.commercial.service_requests.models import ServiceRequest  # noqa
from src.commercial.service_reports.models import ServiceReport  # noqa
from src.commercial.technicians.router import router as technicians_router
from src.commercial.sites.router import router as sites_router
from src.commercial.assets.router import router as assets_router
from src.commercial.work_orders.router import router as work_orders_router
from src.commercial.service_requests.router import router as service_requests_router
from src.commercial.service_reports.router import router as service_reports_router


# ── Inventory, Procurement & Stock Control OS — Sprint 16 ────────────────────
from src.commercial.inventory_items.models import InventoryItem  # noqa
from src.commercial.warehouses.models import Warehouse  # noqa
from src.commercial.inventory_vendors.models import InventoryVendor  # noqa
from src.commercial.stock_movements.models import StockMovement  # noqa
from src.commercial.purchase_requests.models import PurchaseRequest  # noqa
from src.commercial.purchase_orders.models import PurchaseOrder  # noqa
from src.commercial.goods_receipts.models import GoodsReceipt  # noqa
from src.commercial.inventory_items.router import router as inv_items_router
from src.commercial.warehouses.router import router as warehouses_router
from src.commercial.inventory_vendors.router import router as inv_vendors_router
from src.commercial.stock_movements.router import router as stock_movements_router
from src.commercial.purchase_requests.router import router as purchase_requests_router
from src.commercial.purchase_orders.router import router as purchase_orders_router
from src.commercial.goods_receipts.router import router as goods_receipts_router
from src.commercial.scope_of_work.router import router as scope_of_work_router
from src.commercial.approval_requests.router import router as approval_requests_router


# ── Procurement Workflow Models — Sprint 17 ───────────────────────────────────
from src.commercial.rfqs.models import RFQ, RFQVendorQuote  # noqa
from src.commercial.vendor_scorecards.models import VendorScorecard  # noqa
from src.commercial.procurement_events.models import ProcurementEvent  # noqa

from src.commercial.notifications.router import router as notifications_router
from src.commercial.invoices.router import router as invoices_router
from src.commercial.hotels.router import router as hotels_router
from src.commercial.cache.router import router as cache_router
from src.commercial.pagination.router import router as pagination_router
from src.commercial.email_notifications.router import router as email_notification_router




# Rate limiting
try:
    from slowapi import Limiter, _rate_limit_exceeded_handler
    from slowapi.util import get_remote_address
    from slowapi.errors import RateLimitExceeded
    limiter = Limiter(key_func=get_remote_address, default_limits=["200/minute"])
    RATE_LIMITING = True
except ImportError:
    RATE_LIMITING = False
    print("INFO: slowapi not installed — rate limiting disabled")

app = FastAPI(
    title="Triangle Black API",
    description="Hotel Engineering Platform — Multi-Hotel",
    version="3.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)


# ── SPRINT 237: REQUEST ID MIDDLEWARE ─────────────────────────────────────────
import uuid as _uuid
from starlette.middleware.base import BaseHTTPMiddleware as _BHTTP2

class RequestIDMiddleware(_BHTTP2):
    async def dispatch(self, request, call_next):
        req_id = request.headers.get("X-Request-ID") or str(_uuid.uuid4())[:8]
        response = await call_next(request)
        response.headers["X-Request-ID"] = req_id
        return response

app.add_middleware(RequestIDMiddleware)
# ─────────────────────────────────────────────────────────────────────────────


# ── SPRINT 232: RATE LIMITING ─────────────────────────────────────────────────
import time
from collections import defaultdict
from starlette.middleware.base import BaseHTTPMiddleware
from fastapi import Request
from fastapi.responses import JSONResponse

_req_counts: dict = defaultdict(list)
RATE_LIMIT_MAX = 200

class RateLimitMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        ip = request.client.host if request.client else "unknown"
        now = time.time()
        _req_counts[ip] = [t for t in _req_counts[ip] if t > now - 60]
        if len(_req_counts[ip]) >= RATE_LIMIT_MAX:
            return JSONResponse(status_code=429,
                content={"detail": f"Rate limit: {RATE_LIMIT_MAX} req/min exceeded"})
        _req_counts[ip].append(now)
        response = await call_next(request)
        remaining = max(0, RATE_LIMIT_MAX - len(_req_counts[ip]))
        response.headers["X-RateLimit-Limit"] = str(RATE_LIMIT_MAX)
        response.headers["X-RateLimit-Remaining"] = str(remaining)
        return response

app.add_middleware(RateLimitMiddleware)
# ─────────────────────────────────────────────────────────────────────────────


# Attach rate limiter if available
if RATE_LIMITING:
    app.state.limiter = limiter
    app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)


app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:3001",
        "http://127.0.0.1:3000",
        "https://triangleblack.com",
        "https://app.triangleblack.com",
        "https://portal.triangleblack.com",
    ],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)




# ── SPRINT 238: ROLE ENFORCEMENT HELPER ──────────────────────────────────────
import base64 as _b64_rbac
import json as _js_rbac

def _get_user_role_from_token(request: Request) -> str:
    """Extract role from JWT token via DB lookup"""
    try:
        auth = request.headers.get("Authorization", "")
        token = auth.replace("Bearer ", "").strip()
        if not token:
            return "anonymous"
        parts = token.split(".")
        if len(parts) < 2:
            return "viewer"
        seg = parts[1] + "=" * ((4 - len(parts[1]) % 4) % 4)
        payload = _js_rbac.loads(_b64_rbac.urlsafe_b64decode(seg))
        user_id = str(payload.get("sub", ""))
        if not user_id:
            return "viewer"
        from sqlalchemy import text as _text2, create_engine as _ce2
        from sqlalchemy.orm import Session as _S2
        import os as _os2
        eng = _ce2(_os2.environ.get("DATABASE_URL","postgresql+psycopg2://ai:ai123@localhost:5432/triangle_black"))
        with _S2(eng) as db:
            row = db.execute(_text2("SELECT role FROM user_roles WHERE user_id=:uid LIMIT 1"), {"uid": user_id}).fetchone()
            return str(row[0]).strip() if row else "viewer"
    except Exception:
        return "viewer"

ROLE_LEVELS = {"admin": 1, "manager": 2, "engineer": 3, "finance": 3, "technician": 4, "supplier": 4, "viewer": 5, "anonymous": 99}

def require_role(min_level: int = 2):
    """Dependency — raises 403 if user role level > min_level"""
    def checker(request: Request):
        role = _get_user_role_from_token(request)
        level = ROLE_LEVELS.get(role, 99)
        if level > min_level:
            from fastapi import HTTPException
            raise HTTPException(
                status_code=403,
                detail=f"Access denied. Required level: {min_level}, your role: {role} (level {level})"
            )
        return role
    return checker

def require_admin(request: Request):
    """Dependency — admin only"""
    role = _get_user_role_from_token(request)
    if role != "admin":
        from fastapi import HTTPException
        raise HTTPException(status_code=403, detail=f"Admin required. Your role: {role}")
    return role

# Role management endpoint
@app.post("/api/v1/rbac/users/{user_id}/role", tags=["rbac"])
def assign_user_role(user_id: str, role: str, _admin: str = Depends(require_admin), request: Request = None):
    """Admin only — assign role to user"""
    from sqlalchemy import text, create_engine
    from sqlalchemy.orm import Session
    import os
    valid_roles = ["admin","manager","engineer","technician","finance","supplier","viewer"]
    if role not in valid_roles:
        from fastapi import HTTPException
        raise HTTPException(status_code=400, detail=f"Invalid role. Choose from: {valid_roles}")
    eng = create_engine(os.environ.get("DATABASE_URL","postgresql+psycopg2://ai:ai123@localhost:5432/triangle_black"))
    with Session(eng) as db:
        try:
            existing = db.execute(text("SELECT id FROM user_roles WHERE user_id=:uid"), {"uid": user_id}).fetchone()
            if existing:
                db.execute(text("UPDATE user_roles SET role=:role WHERE user_id=:uid"), {"role": role, "uid": user_id})
            else:
                db.execute(text("INSERT INTO user_roles (id,user_id,role) VALUES (gen_random_uuid()::text,:uid,:role)"), {"uid": user_id, "role": role})
            db.commit()
            return {"user_id": user_id, "role": role, "status": "updated"}
        except Exception as e:
            db.rollback()
            return {"error": str(e)}

@app.get("/api/v1/rbac/users", tags=["rbac"])
def list_user_roles(_admin: str = Depends(require_admin)):
    """Admin only — list all user roles"""
    from sqlalchemy import text, create_engine
    from sqlalchemy.orm import Session
    import os
    eng = create_engine(os.environ.get("DATABASE_URL","postgresql+psycopg2://ai:ai123@localhost:5432/triangle_black"))
    with Session(eng) as db:
        try:
            rows = db.execute(text("SELECT ur.user_id, ur.role, ur.created_at FROM user_roles ur ORDER BY ur.created_at")).fetchall()
            return [dict(r._mapping) for r in rows]
        except Exception: db.rollback(); return []

# ─────────────────────────────────────────────────────────────────────────────


API_PREFIX = "/api/v1"

app.include_router(leads_router,         prefix=API_PREFIX + "/leads")
app.include_router(agents_router,        prefix=API_PREFIX)
app.include_router(pipeline_router,      prefix=API_PREFIX)
app.include_router(activity_router,      prefix=API_PREFIX)
app.include_router(search_router,        prefix=API_PREFIX)
app.include_router(webhook_router,       prefix=API_PREFIX)
app.include_router(quotation_router,     prefix=API_PREFIX)
app.include_router(auth_router,          prefix=API_PREFIX)
app.include_router(reporting_router,     prefix=API_PREFIX)
app.include_router(contracts_router,     prefix=API_PREFIX)
app.include_router(actions_router,       prefix=API_PREFIX)
app.include_router(notifications_router, prefix=API_PREFIX)
app.include_router(invoices_router,      prefix=API_PREFIX)
app.include_router(hotels_router,        prefix=API_PREFIX)
app.include_router(cache_router,              prefix=API_PREFIX)
app.include_router(pagination_router,         prefix=API_PREFIX)
app.include_router(email_notification_router, prefix=API_PREFIX)

# Inventory & Procurement
app.include_router(inv_items_router, prefix="/api/v1")
try:
    app.include_router(work_orders_router, prefix="/api/v1")
    logger.info("  OK: work_orders_router")
except Exception as e:
    logger.warning("WARN: work_orders_router: {e}")
try:
    from src.commercial.technicians.router import router as technicians_router
    app.include_router(technicians_router, prefix="/api/v1")
    logger.info("  OK: technicians_router")
except Exception as e:
    logger.warning("WARN: technicians_router: {e}")
try:
    from src.commercial.assets.router import router as assets_router
    app.include_router(assets_router, prefix="/api/v1")
    logger.info("  OK: assets_router")
except Exception as e:
    logger.warning("WARN: assets_router: {e}")
app.include_router(warehouses_router, prefix="/api/v1")
app.include_router(inv_vendors_router, prefix="/api/v1")
app.include_router(stock_movements_router, prefix="/api/v1")
app.include_router(sites_router, prefix="/api/v1")
app.include_router(service_requests_router, prefix="/api/v1")
app.include_router(purchase_requests_router, prefix="/api/v1")
app.include_router(purchase_orders_router, prefix="/api/v1")
app.include_router(goods_receipts_router, prefix="/api/v1")


@app.get("/health")
def health():
    db_ok = check_connection()
    return {
        "ok": db_ok,
        "service": "triangle-black-api",
        "version": "3.0.0",
        "database": "connected" if db_ok else "unreachable",
    }


@app.get("/")
def root():
    return {"service": "Triangle Black API", "version": "3.0.0", "docs": "/docs"}

# ── Sprint 20 Modules ─────────────────────────────────────────────────────────
try:
    from src.commercial.payment_tracking.router import router as payment_tracking_router
    app.include_router(payment_tracking_router, prefix="/api/v1")
except Exception as e:
    logger.warning("WARN: payment_tracking_router: {e}")
try:
    from src.commercial.projects.router import router as projects_router
    app.include_router(projects_router, prefix="/api/v1")
except Exception as e:
    logger.warning("WARN: projects_router: {e}")
try:
    from src.commercial.dashboard.router import router as dashboard_router
    app.include_router(dashboard_router, prefix="/api/v1")
except Exception as e:
    logger.warning("WARN: dashboard_router: {e}")
try:
    from src.commercial.system_notifications.router import router as notifications_router
except Exception as e:
    logger.warning("WARN: system_notifications_router: {e}")

# ── Auto-wired Sprint 20-22 modules ──────────────────────────────────────
try:
    from src.commercial.documents.router import router as documents_router
    app.include_router(documents_router, prefix="/api/v1")
except Exception as e:
    logger.warning("WARN: documents: {e}")
try:
    from src.commercial.email_service.router import router as email_service_router
    app.include_router(email_service_router, prefix="/api/v1")
except Exception as e:
    logger.warning("WARN: email_service: {e}")
try:
    from src.commercial.inventory_alerts.router import router as inventory_alerts_router
    app.include_router(inventory_alerts_router, prefix="/api/v1")
except Exception as e:
    logger.warning("WARN: inventory_alerts: {e}")
try:
    from src.commercial.pdf_service.router import router as pdf_service_router
    app.include_router(pdf_service_router, prefix="/api/v1")
except Exception as e:
    logger.warning("WARN: pdf_service: {e}")
try:
    from src.commercial.vendor_portal.router import router as vendor_portal_router
    app.include_router(vendor_portal_router, prefix="/api/v1")
except Exception as e:
    logger.warning("WARN: vendor_portal: {e}")
# ── Sprint 11: AI Operations Routers ──────────────────────────
try:
  from src.commercial.ai_assistant.signals_router import router as ai_signals_router
  app.include_router(ai_signals_router, prefix="/api/v1")
  print("  OK: signals_router")
except Exception as e:
  print(f"  WARN: signals_router: {e}")

try:
  from src.commercial.ai_assistant.dispatch_router import router as ai_dispatch_router
  app.include_router(ai_dispatch_router, prefix="/api/v1")
  print("  OK: dispatch_router")
except Exception as e:
  print(f"  WARN: dispatch_router: {e}")

try:
  from src.commercial.ai_assistant.supply_automation_router import router as ai_supply_router
  app.include_router(ai_supply_router, prefix="/api/v1")
  print("  OK: supply_automation_router")
except Exception as e:
  print(f"  WARN: supply_automation_router: {e}")

# ── Sprint 16: Analytics + KPI Endpoints ──────────────────────
try:
    from src.commercial.ai_assistant.analytics_router import router as ai_analytics_router
    app.include_router(ai_analytics_router, prefix="/api/v1")
    logger.info("  OK: analytics_router")
except Exception as e:
    logger.warning("WARN: analytics_router: {e}")

# ── Sprint 62: Document Control ──────────────────────────────
try:
    from src.commercial.ai_assistant.document_router import router as ai_doc_router
    app.include_router(ai_doc_router, prefix="/api/v1")

    logger.info("  OK: document_router")
except Exception as e:
    logger.warning("WARN: document_router: {e}")

# ── Sprint 68 — Workflow + Finance + AI + Digital Twin ─────────────────────
try:
    from src.commercial.analytics_kpi.router import router as analytics_kpi_router
    app.include_router(analytics_kpi_router, prefix="/api/v1")
    logger.info("  OK: analytics_kpi_router")
except Exception as e:
    logger.info("  WARN analytics_kpi: {e}")

try:
    from src.commercial.ai_signals.router import router as ai_signals_v2_router
    app.include_router(ai_signals_v2_router, prefix="/api/v1")
    logger.info("  OK: ai_signals_v2_router")
except Exception as e:
    logger.info("  WARN ai_signals: {e}")

try:
    from src.commercial.digital_twin.router import router as digital_twin_router
    app.include_router(digital_twin_router, prefix="/api/v1")
    logger.info("  OK: digital_twin_router")
except Exception as e:
    logger.info("  WARN digital_twin: {e}")

# ── Sprint 69 — Project Workflow + Supplier Portal + Digital Twin Fix ─────────
try:
    from src.commercial.supplier_portal.router import router as supplier_portal_router
    app.include_router(supplier_portal_router, prefix="/api/v1")
    logger.info("  OK: supplier_portal_router")
except Exception as e:
    logger.info("  WARN supplier_portal: {e}")

# ── Sprint 70 — Customer Success + AI Scheduling + Earned Value ───────────────
try:
    from src.commercial.customer_success.router import router as customer_success_router
    app.include_router(customer_success_router, prefix="/api/v1")
    logger.info("  OK: customer_success_router")
except Exception as e:
    logger.info("  WARN customer_success: {e}")

try:
    from src.commercial.ai_scheduling.router import router as ai_scheduling_router
    app.include_router(ai_scheduling_router, prefix="/api/v1")
    logger.info("  OK: ai_scheduling_router")
except Exception as e:
    logger.info("  WARN ai_scheduling: {e}")

# ── Sprint 71 — Knowledge Graph + Payment Tracking + Warranty ─────────────────
try:
    from src.commercial.knowledge_graph.router import router as knowledge_graph_router
    app.include_router(knowledge_graph_router, prefix="/api/v1")
    logger.info("  OK: knowledge_graph_router")
except Exception as e:
    logger.info("  WARN knowledge_graph: {e}")

try:
    from src.commercial.warranty.router import router as warranty_router
    app.include_router(warranty_router, prefix="/api/v1")
    logger.info("  OK: warranty_router")
except Exception as e:
    logger.info("  WARN warranty: {e}")

# ── Sprint 72 — Global Search + Notifications + Tenant Audit ─────────────────
try:
    from src.commercial.global_search.router import router as global_search_router
    app.include_router(global_search_router, prefix="/api/v1")
    logger.info("  OK: global_search_router")
except Exception as e:
    logger.info("  WARN global_search: {e}")

try:
    from src.commercial.notification_engine.router import router as notif_engine_router
    app.include_router(notif_engine_router, prefix="/api/v1")
    logger.info("  OK: notification_engine_router")
except Exception as e:
    logger.info("  WARN notification_engine: {e}")

try:
    from src.commercial.tenant_audit.router import router as tenant_audit_router
    app.include_router(tenant_audit_router, prefix="/api/v1")
    logger.info("  OK: tenant_audit_router")
except Exception as e:
    logger.info("  WARN tenant_audit: {e}")

# ── Sprint 73 — PDF Export + QR Codes ────────────────────────────────────────
try:
    from src.commercial.pdf_export.router import router as pdf_export_router
    app.include_router(pdf_export_router, prefix="/api/v1")
    logger.info("  OK: pdf_export_router")
except Exception as e:
    logger.info("  WARN pdf_export: {e}")

# ── Sprint 74 — SLA Dashboard + Executive KPI + Reorder Automation ───────────
try:
    from src.commercial.sla_dashboard.router import router as sla_dashboard_router
    app.include_router(sla_dashboard_router, prefix="/api/v1")
    logger.info("  OK: sla_dashboard_router")
except Exception as e:
    logger.info("  WARN sla_dashboard: {e}")

try:
    from src.commercial.executive_kpi.router import router as executive_kpi_router
    app.include_router(executive_kpi_router, prefix="/api/v1")
    logger.info("  OK: executive_kpi_router")
except Exception as e:
    logger.info("  WARN executive_kpi: {e}")

# ── Rate Limiting Middleware (Sprint 76) ──────────────────────────────────────
from collections import defaultdict
from fastapi import Request
from fastapi.responses import JSONResponse
import time as _time

_rl_store: dict = defaultdict(list)
_RL_WINDOW = 60   # seconds
_RL_MAX    = 120  # requests per window per IP

@app.middleware("http")
async def rate_limit_middleware(request: Request, call_next):
    ip  = (request.client.host if request.client else "unknown")
    now = _time.time()
    _rl_store[ip] = [t for t in _rl_store[ip] if t > now - _RL_WINDOW]
    if len(_rl_store[ip]) >= _RL_MAX:
        return JSONResponse(
            status_code=429,
            content={"detail": "Rate limit exceeded. Try again in 60 seconds."}
        )
    _rl_store[ip].append(now)
    return await call_next(request)

# ── Multi-Tenant Hotel Context (Sprint 76) ────────────────────────────────────
@app.middleware("http")
async def hotel_context_middleware(request: Request, call_next):
    hotel_id = request.headers.get("X-Hotel-ID") or request.query_params.get("hotel_id")
    request.state.hotel_id = hotel_id
    response = await call_next(request)
    if hotel_id:
        response.headers["X-Hotel-ID"] = hotel_id
    return response


# ── Sprint 76: Health + Version ───────────────────────────────────────────────
@app.get("/api/v1/health/detailed", tags=["system"])
async def detailed_health():
    import datetime as _dt
    from src.core.database import check_connection
    db_ok = check_connection()
    return {
        "status":    "ok" if db_ok else "degraded",
        "version":   "2.0.0-sprint76",
        "platform":  "Triangle Black Enterprise Operations Platform",
        "timestamp": _dt.datetime.utcnow().isoformat(),
        "checks":    {"database": "ok" if db_ok else "error", "api": "ok"},
    }

@app.get("/api/v1/version", tags=["system"])
async def get_version():
    return {
        "version": "2.0.1",
        "sprint": 92,
        "platform": "Triangle Black Enterprise Operations Platform",
        "programs": 14,
        "build":   "production-ready",
    }

# ── Sprint 77 — Bulk Operations + Predictive Maintenance ─────────────────────
try:
    from src.commercial.bulk_operations.router import router as bulk_ops_router
    app.include_router(bulk_ops_router, prefix="/api/v1")
    logger.info("  OK: bulk_operations_router")
except Exception as e:
    logger.info("  WARN bulk_operations: {e}")

try:
    from src.commercial.predictive_maintenance.router import router as pred_maint_router
    app.include_router(pred_maint_router, prefix="/api/v1")
    logger.info("  OK: predictive_maintenance_router")
except Exception as e:
    logger.info("  WARN predictive_maintenance: {e}")


# ── Sprint 78: Background Scheduler (safe startup) ───────────────────────────
try:
    from src.commercial.scheduler.jobs import start_scheduler, stop_scheduler
    @app.on_event("startup")
    async def tb_scheduler_startup():
        try:
            start_scheduler()
        except Exception as _e:
            logger.info("  WARN scheduler startup: {_e}")

    @app.on_event("shutdown")
    async def tb_scheduler_shutdown():
        try:
            stop_scheduler()
        except Exception:
            pass
except Exception as _e:
    logger.info("  WARN scheduler import: {_e}")

# ── Sprint 83 — Email Alerts ──────────────────────────────────────────────────
try:
    from src.commercial.email_alert.router import router as email_alert_router
    app.include_router(email_alert_router, prefix="/api/v1")
    logger.info("  OK: email_alert_router")
except Exception as e:
    logger.info("  WARN email_alert: {e}")

# ── Sprint 84 — User Preferences ─────────────────────────────────────────────
try:
    from src.commercial.user_preferences.router import router as user_prefs_router
    app.include_router(user_prefs_router, prefix="/api/v1")
    logger.info("  OK: user_preferences_router")
except Exception as e:
    logger.info("  WARN user_preferences: {e}")

# ── Sprint 85 — Performance Audit ────────────────────────────────────────────
try:
    from src.commercial.performance_audit.router import router as perf_audit_router
    app.include_router(perf_audit_router, prefix="/api/v1")
    logger.info("  OK: performance_audit_router")
except Exception as e:
    logger.info("  WARN performance_audit: {e}")

# ── Sprint 87 — Audit Log + SSE Notifications ─────────────────────────────────
try:
    from src.commercial.audit_log.router import router as audit_log_router
    app.include_router(audit_log_router, prefix="/api/v1")
    logger.info("  OK: audit_log_router")
except Exception as e:
    logger.info("  WARN audit_log: {e}")

try:
    from src.commercial.sse_notifications.router import router as sse_router
    app.include_router(sse_router, prefix="/api/v1")
    logger.info("  OK: sse_notifications_router")
except Exception as e:
    logger.info("  WARN sse_notifications: {e}")

# ── Sprint 89 — CSV Export ────────────────────────────────────────────────────
try:
    from src.commercial.csv_export.router import router as csv_export_router
    app.include_router(csv_export_router, prefix="/api/v1")
    logger.info("  OK: csv_export_router")
except Exception as e:
    logger.info("  WARN csv_export: {e}")


# ── Sprint 89: Platform Summary Endpoint ─────────────────────────────────────
@app.get("/api/v1/platform/summary", tags=["system"])
async def platform_summary():
    """Complete platform summary — all programs, routes, and capabilities."""
    from src.core.database import check_connection
    db_ok = check_connection()
    return {
        "platform":       "Triangle Black Enterprise Operations Platform",
        "version": "2.0.1",
        "sprint": 92,
        "status":         "production-ready",
        "database":       "ok" if db_ok else "error",
        "programs": {
            "A":  {"name": "UX Foundation",    "status": "complete", "pages": "179+"},
            "B":  {"name": "Operations",        "status": "complete", "features": ["SLA","dispatch","bulk ops","my-day","QR codes"]},
            "C":  {"name": "Workflow Engine",   "status": "complete", "state_machines": ["work_order","project","purchase_request"]},
            "D":  {"name": "Resources",         "status": "complete", "features": ["dispatch","crew","scheduling"]},
            "E":  {"name": "Projects",          "status": "complete", "features": ["phase_sm","earned_value","portfolio"]},
            "F":  {"name": "Cost Engine",       "status": "complete", "features": ["BOQ","margin","reorder"]},
            "G":  {"name": "Planning",          "status": "complete", "features": ["AI_scheduling","capacity"]},
            "H":  {"name": "Documents",         "status": "complete", "features": ["PDF_export","BOQ_templates"]},
            "I":  {"name": "Finance",           "status": "complete", "features": ["cash_flow","payments","KPI_trends"]},
            "J":  {"name": "Customer",          "status": "complete", "features": ["NPS","renewals","warranty","at_risk"]},
            "K":  {"name": "Supplier",          "status": "complete", "features": ["portal","RFQ","quotes"]},
            "L":  {"name": "AI Layer",          "status": "complete", "features": ["signals_v2","scheduling","notifications","predictive"]},
            "M":  {"name": "Digital Twin",      "status": "complete", "domains": 8},
            "N":  {"name": "Knowledge Graph",   "status": "complete", "engine": "Qdrant+PostgreSQL"},
        },
        "capabilities": [
            "Multi-hotel tenant isolation",
            "State machine workflows (WO + Project + PR)",
            "Predictive maintenance AI",
            "Real-time SSE notifications",
            "Global search (8 entity types)",
            "Command palette (/ key)",
            "Keyboard navigation (G+14 routes)",
            "PWA with offline cache",
            "Bulk operations (assign/approve/update)",
            "PDF/HTML export for WO + Invoice",
            "CSV export for all major entities",
            "User preference persistence",
            "Dashboard personalization",
            "Performance audit API",
            "Database index optimization",
            "CORS + rate limiting + tenant middleware",
            "Audit log with entity trail",
            "Email alerts (SMTP/log-only)",
            "API documentation browser",
            "Platform maturity report",
        ],
        "api_modules": 35,
        "frontend_pages": 179,
        "detail_pages": 15,
        "backend_routes": "210+",
        "generated_at": __import__("datetime").datetime.utcnow().isoformat(),
    }

# ── Sprint 90 - Complete Procurement Intelligence Workflow ─────────────────────
try:
    from src.commercial.procurement_intake.router import router as procurement_intake_router
    app.include_router(procurement_intake_router, prefix="/api/v1")
    logger.info("  OK: procurement_intake_router")
except Exception as e:
    logger.info("  WARN procurement_intake: {e}")

try:
    from src.commercial.approval_chain.router import router as approval_chain_router
    app.include_router(approval_chain_router, prefix="/api/v1")
    logger.info("  OK: approval_chain_router")
except Exception as e:
    logger.info("  WARN approval_chain: {e}")

try:
    from src.commercial.warehouse_intelligence.router import router as warehouse_intel_router
    app.include_router(warehouse_intel_router, prefix="/api/v1")
    logger.info("  OK: warehouse_intelligence_router")
except Exception as e:
    logger.info("  WARN warehouse_intelligence: {e}")

try:
    from src.commercial.ai_mentor.router import router as ai_mentor_router
    app.include_router(ai_mentor_router, prefix="/api/v1")
    logger.info("  OK: ai_mentor_router")
except Exception as e:
    logger.info("  WARN ai_mentor: {e}")

# Sprint 91 - Goods Receipt Workflow
try:
    from src.commercial.goods_receipt_workflow.router import router as gr_workflow_router
    app.include_router(gr_workflow_router, prefix="/api/v1")
    logger.info("  OK: goods_receipt_workflow_router")
except Exception as e:
    logger.info("  WARN goods_receipt_workflow: {e}")


# Sprint 94: signals/summary alias for compatibility
@app.get("/api/v1/ai/signals/summary", tags=["ai-signals"])
async def signals_summary_alias():
    """Alias for /api/v1/ai/signals/v2 — backward compatibility."""
    from fastapi import Request
    import httpx
    try:
        r = httpx.get("http://localhost:8030/api/v1/ai/signals/v2", timeout=10)
        return r.json()
    except Exception as e:
        return {"signals": [], "total": 0, "error": str(e)}

# ── Sprint 68: Additional missing routers

try:
    from src.commercial.maintenance_enterprise.router import router as maintenance_enterprise_router
    app.include_router(maintenance_enterprise_router, prefix="/api/v1")
    logger.info("  OK: maintenance_enterprise_router")
except Exception as e:
    logger.warning("WARN: maintenance_enterprise_router: {e}")
try:
    from src.maintenance_schedule_module.router import router as maintenance_schedule_module_router
    app.include_router(maintenance_schedule_module_router, prefix="/api/v1")
    logger.info("  OK: maintenance_schedule_module_router")
except Exception as e:
    logger.warning("WARN: maintenance_schedule_module_router: {e}")

# ── Stock Balances direct endpoint ──────────────────────────────────────────
from sqlalchemy import text as _text
from src.core.database import get_db as _get_db
from sqlalchemy.orm import Session as _Session
from fastapi import Depends as _Depends, Query as _Query

@app.get("/api/v1/stock-balances/", tags=["inventory"])
@app.get("/api/v1/stock-balances", tags=["inventory"])
def list_stock_balances(
    warehouse_id: str = _Query(default=None),
    item_id: str = _Query(default=None),
    limit: int = _Query(default=100, le=500),
    db: _Session = _Depends(_get_db)
):
    q = "SELECT sb.*, ii.name as item_name, ii.item_code, w.name as warehouse_name FROM stock_balances sb LEFT JOIN inventory_items ii ON sb.item_id=ii.id LEFT JOIN warehouses w ON sb.warehouse_id=w.id WHERE 1=1"
    p = {}
    if warehouse_id: q += " AND sb.warehouse_id=:wid"; p["wid"] = warehouse_id
    if item_id: q += " AND sb.item_id=:iid"; p["iid"] = item_id
    q += " ORDER BY sb.updated_at DESC LIMIT :limit"; p["limit"] = limit
    try:
        rows = db.execute(_text(q), p).fetchall()
        return [dict(r._mapping) for r in rows]
    except Exception:
        return []

@app.get("/api/v1/suppliers/", tags=["suppliers"])
@app.get("/api/v1/suppliers", tags=["suppliers"])
def list_suppliers(limit: int = _Query(default=100), db: _Session = _Depends(_get_db)):
    try:
        rows = db.execute(_text("SELECT * FROM suppliers ORDER BY company_name LIMIT :l"), {"l": limit}).fetchall()
        return [dict(r._mapping) for r in rows]
    except Exception:
        return []

@app.get("/api/v1/rfqs/", tags=["rfqs"])
@app.get("/api/v1/rfqs", tags=["rfqs"])
def list_rfqs(limit: int = _Query(default=100), db: _Session = _Depends(_get_db)):
    try:
        rows = db.execute(_text("SELECT * FROM rfqs ORDER BY created_at DESC LIMIT :l"), {"l": limit}).fetchall()
        return [dict(r._mapping) for r in rows]
    except Exception:
        return []

# ── Sprint 119: Data Architecture — Customer 360 + Sales Pipeline ──
try:
    from src.commercial.customer360.router import router as customer360_router
    app.include_router(customer360_router, prefix="/api/v1")
    logger.info("OK: customer360_router")
except Exception as e:
    logger.warning(f"WARN customer360: {e}")
try:
    from src.commercial.sales_pipeline.router import router as sales_pipeline_router
    app.include_router(sales_pipeline_router, prefix="/api/v1")
    logger.info("OK: sales_pipeline_router")
except Exception as e:
    logger.warning(f"WARN sales_pipeline: {e}")





# ── Sprint 149b: PM Plans + Payment Tracking (Session+engine pattern) ──────





# ── Sprint 149: PM Plans + Payment Tracking ──────────────────────────────────
@app.get("/api/v1/maintenance/pm-plans/", tags=["maintenance"])
@app.get("/api/v1/maintenance/pm-plans", tags=["maintenance"])
def get_pm_plans_v2(hotel_id: str = None, status: str = None, limit: int = 50):
    from sqlalchemy import text, create_engine
    from sqlalchemy.orm import Session as _S
    import os
    eng = create_engine(os.environ.get("DATABASE_URL","postgresql+psycopg2://ai:ai123@localhost:5432/triangle_black"))
    with _S(eng) as db:
        try:
            rows = db.execute(text("SELECT * FROM maintenance_plans ORDER BY created_at DESC LIMIT :l"), {"l": limit}).fetchall()
            return [dict(r._mapping) for r in rows]
        except Exception as e:
            print(f"pm-plans: {e}")
            return []

@app.get("/api/v1/maintenance/pm-plans/{plan_id}", tags=["maintenance"])
def get_pm_plan_by_id(plan_id: str):
    from sqlalchemy import text, create_engine
    from sqlalchemy.orm import Session as _S
    import os
    eng = create_engine(os.environ.get("DATABASE_URL","postgresql+psycopg2://ai:ai123@localhost:5432/triangle_black"))
    with _S(eng) as db:
        try:
            row = db.execute(text("SELECT * FROM maintenance_plans WHERE id=:id"), {"id": plan_id}).fetchone()
            return dict(row._mapping) if row else {}
        except: return {}

@app.get("/api/v1/payment-tracking/", tags=["finance"])
@app.get("/api/v1/payment-tracking", tags=["finance"])
def get_payment_tracking_v2(limit: int = 50):
    from sqlalchemy import text, create_engine
    from sqlalchemy.orm import Session as _Sess
    import os
    _eng = create_engine(os.environ.get("DATABASE_URL", "postgresql+psycopg2://ai:ai123@localhost:5432/triangle_black"))
    with _Sess(_eng) as db:
        try:
            rows = db.execute(text("SELECT id,invoice_number,amount,status,created_at FROM invoices ORDER BY created_at DESC LIMIT :l"), {"l": limit}).fetchall()
            return [dict(r._mapping) for r in rows]
        except: return []


# ── Sprint 150: WO Completion → Asset Sync ───────────────────────────────────
@app.post("/api/v1/work-orders/{wo_id}/complete", tags=["work-orders"])
def complete_work_order(wo_id: str, data: dict = {}):
    """Mark WO complete and sync to asset last_maintenance_date"""
    from sqlalchemy import text, create_engine
    from sqlalchemy.orm import Session
    import os, datetime
    eng = create_engine(os.environ.get("DATABASE_URL","postgresql+psycopg2://ai:ai123@localhost:5432/triangle_black"))
    with Session(eng) as db:
        try:
            now = datetime.datetime.utcnow()
            # Update WO status
            db.execute(text("""
                UPDATE work_orders SET status='completed', completed_at=:now,
                notes=:notes, updated_at=:now WHERE id=:id
            """), {"id": wo_id, "now": now, "notes": data.get("notes","Completed")})
            # Sync to asset
            db.execute(text("""
                UPDATE assets SET last_maintenance_date=:now,
                next_maintenance_date=:now + INTERVAL '90 days', updated_at=:now
                WHERE id=(SELECT asset_id FROM work_orders WHERE id=:id AND asset_id IS NOT NULL LIMIT 1)
            """), {"id": wo_id, "now": now})
            db.commit()
            return {"success": True, "wo_id": wo_id, "completed_at": now.isoformat()}
        except Exception as e:
            return {"success": False, "error": str(e)}

@app.get("/api/v1/work-orders-sync/assets", tags=["work-orders"])
def sync_wo_to_assets():
    """Sync all completed WOs to asset maintenance dates"""
    from sqlalchemy import text, create_engine
    from sqlalchemy.orm import Session
    import os
    eng = create_engine(os.environ.get("DATABASE_URL","postgresql+psycopg2://ai:ai123@localhost:5432/triangle_black"))
    with Session(eng) as db:
        try:
            result = db.execute(text("""
                UPDATE assets a SET
                    last_maintenance_date = wo.completed_at,
                    next_maintenance_date = wo.completed_at + INTERVAL '90 days'
                FROM (SELECT DISTINCT ON (asset_id) asset_id, completed_at
                      FROM work_orders WHERE status='completed' AND completed_at IS NOT NULL
                      ORDER BY asset_id, completed_at DESC) wo
                WHERE a.id = wo.asset_id
                RETURNING a.id
            """))
            db.commit()
            return {"synced": result.rowcount}
        except Exception as e:
            return {"error": str(e)}


# ── Sprint 156: Workflow Endpoints ───────────────────────────────────────────
@app.get("/api/v1/service-requests/{sr_id}/work-order", tags=["service-requests"])
def get_sr_work_order(sr_id: str):
    """Get work order linked to a service request"""
    from sqlalchemy import text, create_engine
    from sqlalchemy.orm import Session as _S
    import os
    eng = create_engine(os.environ.get("DATABASE_URL","postgresql+psycopg2://ai:ai123@localhost:5432/triangle_black"))
    with _S(eng) as db:
        try:
            row = db.execute(text("""
                SELECT wo.* FROM work_orders wo
                JOIN service_requests sr ON sr.work_order_id = wo.id
                WHERE sr.id = :id
            """), {"id": sr_id}).fetchone()
            return dict(row._mapping) if row else {}
        except: return {}

@app.post("/api/v1/service-requests/{sr_id}/create-work-order", tags=["service-requests"])
def create_wo_from_sr(sr_id: str, data: dict = {}):
    """Create a work order from a service request"""
    from sqlalchemy import text, create_engine
    from sqlalchemy.orm import Session as _S
    import os, uuid
    eng = create_engine(os.environ.get("DATABASE_URL","postgresql+psycopg2://ai:ai123@localhost:5432/triangle_black"))
    with _S(eng) as db:
        try:
            sr = db.execute(text("SELECT * FROM service_requests WHERE id=:id"), {"id": sr_id}).fetchone()
            if not sr: return {"error": "SR not found"}
            sr_dict = dict(sr._mapping)
            wo_id = str(uuid.uuid4())
            db.execute(text("""
                INSERT INTO work_orders(id,hotel_id,title,description,type,priority,status,created_at,updated_at)
                VALUES(:id,:hotel_id,:title,:desc,'corrective',:priority,'open',NOW(),NOW())
            """), {"id": wo_id, "hotel_id": sr_dict.get("hotel_id"),
                   "title": "WO: " + (sr_dict.get("title","")[:80]),
                   "desc": sr_dict.get("description","") or "",
                   "priority": sr_dict.get("priority","medium")})
            db.execute(text("UPDATE service_requests SET work_order_id=:wo WHERE id=:id"),
                      {"wo": wo_id, "id": sr_id})
            db.commit()
            return {"success": True, "work_order_id": wo_id}
        except Exception as e:
            return {"error": str(e)}

@app.get("/api/v1/dashboard/summary", tags=["dashboard"])
@app.get("/api/v1/dashboard/summary/", tags=["dashboard"])
def get_dashboard_summary():
    """Enhanced dashboard summary with all 8 domain sections."""
    from sqlalchemy import text, create_engine
    from sqlalchemy.orm import Session
    import os
    eng = create_engine(os.environ.get("DATABASE_URL",
        "postgresql+psycopg2://ai:ai123@localhost:5432/triangle_black"))
    with Session(eng) as db:
        def c(q, params=None):
            try:
                result = db.execute(text(q), params or {}).scalar()
                return result or 0
            except Exception:
                db.rollback()
                return 0

        return {
            "work_orders": {
                "total":       c("SELECT count(*) FROM work_orders"),
                "open":        c("SELECT count(*) FROM work_orders WHERE status='open'"),
                "in_progress": c("SELECT count(*) FROM work_orders WHERE status='in_progress'"),
                "completed":   c("SELECT count(*) FROM work_orders WHERE status='completed'"),
                "critical":    c("SELECT count(*) FROM work_orders WHERE priority='critical' AND status NOT IN ('completed','cancelled')"),
                "cancelled":   c("SELECT count(*) FROM work_orders WHERE status='cancelled'"),
            },
            "assets": {
                "total":        c("SELECT count(*) FROM assets"),
                "operational":  c("SELECT count(*) FROM assets WHERE status='Operational'"),
                "faulted":      c("SELECT count(*) FROM assets WHERE status='In Fault'"),
                "under_maintenance": c("SELECT count(*) FROM assets WHERE status='Under Maintenance'"),
                "with_history": c("SELECT count(*) FROM assets WHERE last_maintenance_date IS NOT NULL"),
            },
            "maintenance": {
                "pm_plans":      c("SELECT count(*) FROM maintenance_plans"),
                "overdue":       c("SELECT count(*) FROM maintenance_plans WHERE next_due_ts < NOW()"),
                "due_this_week": c("SELECT count(*) FROM maintenance_plans WHERE next_due_ts BETWEEN NOW() AND NOW() + INTERVAL '7 days'"),
                "due_this_month":c("SELECT count(*) FROM maintenance_plans WHERE next_due_ts BETWEEN NOW() AND NOW() + INTERVAL '30 days'"),
                "active":        c("SELECT count(*) FROM maintenance_plans WHERE status='active'"),
            },
            "service_requests": {
                "total":       c("SELECT count(*) FROM service_requests"),
                "open":        c("SELECT count(*) FROM service_requests WHERE status IN ('open','new')"),
                "in_progress": c("SELECT count(*) FROM service_requests WHERE status='in_progress'"),
                "linked_to_wo":c("SELECT count(*) FROM service_requests WHERE work_order_id IS NOT NULL"),
            },
            "procurement": {
                "purchase_orders":   c("SELECT count(*) FROM purchase_orders"),
                "purchase_requests": c("SELECT count(*) FROM purchase_requests"),
                "pending_pos":       c("SELECT count(*) FROM purchase_orders WHERE status IN ('pending','draft','submitted')"),
                "approved_prs":      c("SELECT count(*) FROM purchase_requests WHERE status='approved'"),
                "suppliers":         c("SELECT count(*) FROM suppliers"),
            },
            "commercial": {
                "active_contracts":    c("SELECT count(*) FROM contracts WHERE status='active'"),
                "expiring_30d":        c("SELECT count(*) FROM contracts WHERE status='active' AND end_date BETWEEN NOW() AND NOW() + INTERVAL '30 days'"),
                "open_leads":          c("SELECT count(*) FROM leads WHERE status NOT IN ('won','lost','closed')"),
                "total_leads":         c("SELECT count(*) FROM leads"),
                "unpaid_invoices":     c("SELECT count(*) FROM invoices WHERE status IN ('pending','overdue')"),
                "pending_signature":   c("SELECT count(*) FROM contracts WHERE status='pending_signature'"),
            },
            "finance": {
                "total_invoices":   c("SELECT count(*) FROM invoices"),
                "paid":             c("SELECT count(*) FROM invoices WHERE status='paid'"),
                "pending":          c("SELECT count(*) FROM invoices WHERE status='pending'"),
                "overdue":          c("SELECT count(*) FROM invoices WHERE status='overdue'"),
                "cancelled":        c("SELECT count(*) FROM invoices WHERE status='cancelled'"),
                "total_value":      c("SELECT COALESCE(SUM(amount),0) FROM invoices"),
                "paid_value":       c("SELECT COALESCE(SUM(amount),0) FROM invoices WHERE status='paid'"),
                "outstanding_value":c("SELECT COALESCE(SUM(amount),0) FROM invoices WHERE status IN ('pending','overdue')"),
            },
            "inventory": {
                "total_items":       c("SELECT count(*) FROM inventory_items"),
                "stock_records":     c("SELECT count(*) FROM stock_balances"),
                "warehouses":        c("SELECT count(*) FROM warehouses"),
                "low_stock_items":   c("SELECT count(*) FROM stock_balances WHERE qty_available < 10"),
                "total_stock_value": c("SELECT COALESCE(SUM(total_value),0) FROM stock_balances"),
            },
            "platform": {
                "technicians":    c("SELECT count(*) FROM technicians"),
                "projects":       c("SELECT count(*) FROM projects"),
                "notifications":  c("SELECT count(*) FROM notifications"),
                "sites":          c("SELECT count(*) FROM sites"),
                "hotels":         c("SELECT count(*) FROM hotels"),
            }
        }



# ── PROGRAM 2: WORKFLOW AUTOMATION ENGINE (Sprint 169) ─────────────────────────

@app.post("/api/v1/automation/run", tags=["automation"])
@app.get("/api/v1/automation/run", tags=["automation"])
def run_automation_engine():
    """
    Workflow Automation Engine — runs all 5 business workflows:
    WF-01: Overdue PM Plans → auto-create Work Orders
    WF-02: Contracts expiring in 30 days → create renewal notifications
    WF-03: Stock below minimum → auto-create Purchase Requests
    WF-04: Completed WOs → sync asset maintenance dates
    WF-05: Open Service Requests → link or create Work Orders
    Returns full report of all actions taken.
    """
    from sqlalchemy import text, create_engine
    from sqlalchemy.orm import Session
    import os, uuid
    from datetime import datetime, timedelta

    eng = create_engine(os.environ.get("DATABASE_URL",
        "postgresql+psycopg2://ai:ai123@localhost:5432/triangle_black"))

    HOTEL = "tb-default-hotel-000000000001"
    now = datetime.utcnow()
    report = {
        "ran_at": now.isoformat(),
        "wf01_pm_to_wo": {"created": [], "skipped": 0},
        "wf02_contract_renewals": {"notified": [], "skipped": 0},
        "wf03_stock_auto_pr": {"created": [], "skipped": 0},
        "wf04_wo_asset_sync": {"synced": 0},
        "wf05_sr_to_wo": {"linked": [], "skipped": 0},
        "total_actions": 0,
    }

    with Session(eng) as db:

        # ── WF-01: Overdue PM Plans → Work Orders ──────────────────────────────
        try:
            overdue_plans = db.execute(text("""
                SELECT mp.id, mp.title, mp.asset_node_id, mp.plan_type, mp.frequency
                FROM maintenance_plans mp
                WHERE mp.next_due_ts < NOW()
                AND mp.status = 'active'
                AND NOT EXISTS (
                    SELECT 1 FROM work_orders wo
                    WHERE wo.title = 'PM: ' || mp.title
                    AND wo.created_at > NOW() - INTERVAL '3 days'
                    AND wo.status NOT IN ('cancelled')
                )
                LIMIT 20
            """)).fetchall()

            for plan in overdue_plans:
                wo_id = str(uuid.uuid4())
                db.execute(text("""
                    INSERT INTO work_orders
                        (id, hotel_id, title, description, priority, status, type,
                         asset_id, due_date, created_at, updated_at)
                    VALUES
                        (:id, :hotel_id, :title, :desc, :priority, 'open', 'preventive',
                         :asset_id, :due_date, :now, :now)
                """), {
                    "id": wo_id,
                    "hotel_id": HOTEL,
                    "title": f"PM: {plan.title}",
                    "desc": f"Auto-created from overdue PM plan. Frequency: {plan.frequency}. Plan ID: {plan.id}",
                    "priority": "high",
                    "asset_id": plan.asset_node_id,
                    "due_date": now + timedelta(days=3),
                    "now": now,
                })

                # Create notification for the new WO
                db.execute(text("""
                    INSERT INTO notifications
                        (id, hotel_id, title, message, type, entity_id, entity_type,
                         recipient_role, is_read, created_at, updated_at)
                    VALUES
                        (:id, :hotel_id, :title, :msg, 'work_order_created', :entity_id,
                         'work_order', 'admin', false, :now, :now)
                """), {
                    "id": str(uuid.uuid4()),
                    "hotel_id": HOTEL,
                    "title": f"PM Work Order Created: {plan.title}",
                    "msg": f"Overdue PM plan '{plan.title}' has auto-generated a work order.",
                    "entity_id": wo_id,
                    "now": now,
                })

                report["wf01_pm_to_wo"]["created"].append({
                    "wo_id": wo_id,
                    "pm_plan": plan.title,
                    "asset_id": plan.asset_node_id,
                })

            db.commit()
        except Exception as e:
            db.rollback()
            report["wf01_pm_to_wo"]["error"] = str(e)

        # ── WF-02: Contracts Expiring → Renewal Notifications ──────────────────
        try:
            expiring = db.execute(text("""
                SELECT c.id, c.end_date
                FROM contracts c
                WHERE c.status = 'active'
                AND c.end_date BETWEEN NOW() AND NOW() + INTERVAL '30 days'
                AND NOT EXISTS (
                    SELECT 1 FROM notifications n
                    WHERE n.entity_id = c.id
                    AND n.type = 'contract_expiring'
                    AND n.created_at > NOW() - INTERVAL '7 days'
                )
                LIMIT 20
            """)).fetchall()

            for contract in expiring:
                days_left = (contract.end_date - now).days if contract.end_date else 0
                notif_id = str(uuid.uuid4())
                db.execute(text("""
                    INSERT INTO notifications
                        (id, hotel_id, title, message, type, entity_id, entity_type,
                         recipient_role, is_read, created_at, updated_at)
                    VALUES
                        (:id, :hotel_id, :title, :msg, 'contract_expiring', :entity_id,
                         'contract', 'admin', false, :now, :now)
                """), {
                    "id": notif_id,
                    "hotel_id": HOTEL,
                    "title": f"Contract Expiring in {days_left} Days",
                    "msg": f"Contract {contract.id[:8]} expires on {str(contract.end_date)[:10]}. Initiate renewal immediately.",
                    "entity_id": contract.id,
                    "now": now,
                })
                report["wf02_contract_renewals"]["notified"].append({
                    "contract_id": contract.id,
                    "days_left": days_left,
                    "notification_id": notif_id,
                })

            db.commit()
        except Exception as e:
            db.rollback()
            report["wf02_contract_renewals"]["error"] = str(e)

        # ── WF-03: Stock Below Minimum → Purchase Requests ─────────────────────
        try:
            low_stock = db.execute(text("""
                SELECT ii.id as item_id, ii.name as item_name,
                       sb.qty_on_hand, ii.min_stock,
                       (ii.min_stock - sb.qty_on_hand) as shortage
                FROM inventory_items ii
                JOIN stock_balances sb ON sb.item_id = ii.id
                WHERE sb.qty_on_hand < ii.min_stock
                AND ii.min_stock > 0
                AND NOT EXISTS (
                    SELECT 1 FROM purchase_requests pr
                    WHERE pr.title LIKE '%' || ii.name || '%'
                    AND pr.created_at > NOW() - INTERVAL '7 days'
                    AND pr.status NOT IN ('cancelled', 'rejected')
                )
                LIMIT 10
            """)).fetchall()

            for item in low_stock:
                pr_id = str(uuid.uuid4())
                pr_number = f"PR-AUTO-{now.strftime('%Y%m%d')}-{pr_id[:6].upper()}"
                shortage = max(1, int(item.shortage or item.min_stock))

                db.execute(text("""
                    INSERT INTO purchase_requests
                        (id, hotel_id, pr_number, title, justification, urgency,
                         status, department, requester, lines, created_at, updated_at)
                    VALUES
                        (:id, :hotel_id, :pr_number, :title, :justification, 'urgent',
                         'pending', 'Engineering', 'Automation Engine',
                         CAST(:lines AS json), :now, :now)
                """), {
                    "id": pr_id,
                    "hotel_id": HOTEL,
                    "pr_number": pr_number,
                    "title": f"Auto-PR: Restock {item.item_name}",
                    "justification": f"Stock level {item.qty_on_hand} is below minimum {item.min_stock}. Shortage: {shortage} units.",
                    "lines": f'[{{"item_id":"{item.item_id}","item_name":"{item.item_name}","qty":{shortage},"unit":"unit"}}]',
                    "now": now,
                })

                # Notification for low stock PR
                db.execute(text("""
                    INSERT INTO notifications
                        (id, hotel_id, title, message, type, entity_id, entity_type,
                         recipient_role, is_read, created_at, updated_at)
                    VALUES
                        (:id, :hotel_id, :title, :msg, 'purchase_request_created',
                         :entity_id, 'purchase_request', 'admin', false, :now, :now)
                """), {
                    "id": str(uuid.uuid4()),
                    "hotel_id": HOTEL,
                    "title": f"Auto-PR Created: {item.item_name}",
                    "msg": f"Stock alert: {item.item_name} has {item.qty_on_hand} units (min: {item.min_stock}). Purchase request {pr_number} auto-created.",
                    "entity_id": pr_id,
                    "now": now,
                })

                report["wf03_stock_auto_pr"]["created"].append({
                    "pr_id": pr_id,
                    "pr_number": pr_number,
                    "item": item.item_name,
                    "qty_on_hand": float(item.qty_on_hand),
                    "min_stock": float(item.min_stock),
                    "shortage": shortage,
                })

            db.commit()
        except Exception as e:
            db.rollback()
            report["wf03_stock_auto_pr"]["error"] = str(e)

        # ── WF-04: Completed WOs → Sync Asset Maintenance Dates ────────────────
        try:
            result = db.execute(text("""
                UPDATE assets a
                SET last_maintenance_date = wo.completed_at,
                    next_maintenance_date = wo.completed_at + INTERVAL '90 days',
                    updated_at = NOW()
                FROM (
                    SELECT DISTINCT ON (asset_id)
                        asset_id, completed_at
                    FROM work_orders
                    WHERE status = 'completed'
                    AND completed_at IS NOT NULL
                    AND asset_id IS NOT NULL
                    ORDER BY asset_id, completed_at DESC
                ) wo
                WHERE a.id = wo.asset_id
                AND (a.last_maintenance_date IS NULL OR a.last_maintenance_date < wo.completed_at)
            """))
            db.commit()
            report["wf04_wo_asset_sync"]["synced"] = result.rowcount
        except Exception as e:
            db.rollback()
            report["wf04_wo_asset_sync"]["error"] = str(e)

        # ── WF-05: Open Service Requests → Link to Work Orders ─────────────────
        try:
            unlinked_srs = db.execute(text("""
                SELECT sr.id, sr.title, sr.description, 'medium' as priority
                FROM service_requests sr
                WHERE sr.status IN ('open', 'new')
                AND (sr.work_order_id IS NULL OR sr.work_order_id = '')
                AND NOT EXISTS (
                    SELECT 1 FROM work_orders wo
                    WHERE wo.title = 'SR: ' || COALESCE(sr.title, sr.id)
                    AND wo.created_at > NOW() - INTERVAL '3 days'
                )
                LIMIT 10
            """)).fetchall()

            for sr in unlinked_srs:
                wo_id = str(uuid.uuid4())
                db.execute(text("""
                    INSERT INTO work_orders
                        (id, hotel_id, title, description, priority, status, type,
                         created_at, updated_at, due_date)
                    VALUES
                        (:id, :hotel_id, :title, :desc, :priority, 'open', 'corrective',
                         :now, :now, :due_date)
                """), {
                    "id": wo_id,
                    "hotel_id": HOTEL,
                    "title": f"SR: {sr.title or sr.id}",
                    "desc": sr.description or f"Auto-created from service request {sr.id}",
                    "priority": sr.priority or "medium",
                    "now": now,
                    "due_date": now + timedelta(days=2),
                })

                # Link SR to WO
                db.execute(text("""
                    UPDATE service_requests
                    SET work_order_id = :wo_id, updated_at = :now
                    WHERE id = :sr_id
                """), {"wo_id": wo_id, "sr_id": sr.id, "now": now})

                report["wf05_sr_to_wo"]["linked"].append({
                    "sr_id": sr.id,
                    "wo_id": wo_id,
                    "title": sr.title,
                })

            db.commit()
        except Exception as e:
            db.rollback()
            report["wf05_sr_to_wo"]["error"] = str(e)

    # Total actions
    report["total_actions"] = (
        len(report["wf01_pm_to_wo"]["created"]) +
        len(report["wf02_contract_renewals"]["notified"]) +
        len(report["wf03_stock_auto_pr"]["created"]) +
        report["wf04_wo_asset_sync"]["synced"] +
        len(report["wf05_sr_to_wo"]["linked"])
    )

    return report


@app.get("/api/v1/automation/status", tags=["automation"])
def automation_status():
    """Check what automation would do without running it."""
    from sqlalchemy import text, create_engine
    from sqlalchemy.orm import Session
    import os

    eng = create_engine(os.environ.get("DATABASE_URL",
        "postgresql+psycopg2://ai:ai123@localhost:5432/triangle_black"))
    with Session(eng) as db:
        def c(q):
            try: return db.execute(text(q)).scalar() or 0
            except: db.rollback(); return 0
        return {
            "pending_actions": {
                "wf01_overdue_pm_without_wo": c("""
                    SELECT count(*) FROM maintenance_plans mp
                    WHERE mp.next_due_ts < NOW() AND mp.status='active'
                    AND NOT EXISTS (
                        SELECT 1 FROM work_orders wo
                        WHERE wo.title = 'PM: ' || mp.title
                        AND wo.created_at > NOW() - INTERVAL '3 days'
                        AND wo.status NOT IN ('cancelled')
                    )"""),
                "wf02_contracts_expiring_30d": c("""
                    SELECT count(*) FROM contracts
                    WHERE status='active'
                    AND end_date BETWEEN NOW() AND NOW()+INTERVAL '30 days'
                    AND NOT EXISTS (
                        SELECT 1 FROM notifications n
                        WHERE n.entity_id=contracts.id
                        AND n.type='contract_expiring'
                        AND n.created_at > NOW()-INTERVAL '7 days'
                    )"""),
                "wf03_stock_below_min": c("""
                    SELECT count(*) FROM inventory_items ii
                    JOIN stock_balances sb ON sb.item_id=ii.id
                    WHERE sb.qty_on_hand < ii.min_stock AND ii.min_stock>0
                    AND NOT EXISTS (
                        SELECT 1 FROM purchase_requests pr
                        WHERE pr.title LIKE '%'||ii.name||'%'
                        AND pr.created_at > NOW()-INTERVAL '7 days'
                        AND pr.status NOT IN ('cancelled','rejected')
                    )"""),
                "wf04_assets_needing_sync": c("""
                    SELECT count(DISTINCT wo.asset_id) FROM work_orders wo
                    JOIN assets a ON a.id=wo.asset_id
                    WHERE wo.status='completed' AND wo.completed_at IS NOT NULL
                    AND (a.last_maintenance_date IS NULL OR a.last_maintenance_date < wo.completed_at)"""),
                "wf05_unlinked_service_requests": c("""
                    SELECT count(*) FROM service_requests sr
                    WHERE sr.status IN ('open','new')
                    AND (sr.work_order_id IS NULL OR sr.work_order_id='')"""),
            }
        }



# ── SPRINT 188: CREATE ACTION ENDPOINTS ────────────────────────────────────────

@app.post("/api/v1/work-orders/", tags=["work-orders"])
def create_work_order(body: dict):
    """Create a new work order"""
    from sqlalchemy import text, create_engine
    from sqlalchemy.orm import Session
    import os, uuid
    from datetime import datetime, timedelta
    eng = create_engine(os.environ.get("DATABASE_URL","postgresql+psycopg2://ai:ai123@localhost:5432/triangle_black"))
    with Session(eng) as db:
        wo_id = str(uuid.uuid4())
        now   = datetime.utcnow()
        priority = body.get("priority","medium")
        sla_hours = {"critical":4,"high":8,"medium":24,"low":72}.get(priority,24)
        due_date = body.get("due_date") or (now + timedelta(hours=sla_hours)).isoformat()
        db.execute(text("""
            INSERT INTO work_orders (id,hotel_id,title,description,priority,status,type,
                technician_id,asset_id,contract_id,due_date,created_at,updated_at)
            VALUES (:id,:hotel,:title,:desc,:priority,'open',:type,
                :tech_id,:asset_id,:contract_id,:due_date,:now,:now)
        """),{
            "id":wo_id, "hotel":body.get("hotel_id","tb-default-hotel-000000000001"),
            "title":body.get("title","New Work Order"),
            "desc":body.get("description",""),
            "priority":priority,
            "type":body.get("type","corrective"),
            "tech_id":body.get("technician_id") or None,
            "asset_id":body.get("asset_id") or None,
            "contract_id":body.get("contract_id") or None,
            "due_date":due_date, "now":now,
        })
        # Notification
        db.execute(text("""
            INSERT INTO notifications (id,hotel_id,title,message,type,entity_id,entity_type,recipient_role,is_read,created_at,updated_at)
            VALUES (:id,:hotel,:title,:msg,'work_order_created',:eid,'work_order','admin',false,:now,:now)
        """),{"id":str(uuid.uuid4()),"hotel":"tb-default-hotel-000000000001",
              "title":f"Work Order Created: {body.get('title','New WO')}",
              "msg":f"Priority: {priority}","eid":wo_id,"now":now})
        db.commit()
        return {"id":wo_id,"status":"open","priority":priority,"title":body.get("title"),"created_at":now.isoformat()}


@app.post("/api/v1/service-requests/", tags=["service-requests"])
def create_service_request(body: dict):
    """Create a new service request"""
    from sqlalchemy import text, create_engine
    from sqlalchemy.orm import Session
    import os, uuid
    from datetime import datetime
    eng = create_engine(os.environ.get("DATABASE_URL","postgresql+psycopg2://ai:ai123@localhost:5432/triangle_black"))
    with Session(eng) as db:
        sr_id = str(uuid.uuid4())
        now   = datetime.utcnow()
        db.execute(text("""
            INSERT INTO service_requests (id,hotel_id,title,description,category,urgency,
                status,submitted_by,contact_phone,created_at,updated_at)
            VALUES (:id,:hotel,:title,:desc,:category,:urgency,'open',:submitted_by,:phone,:now,:now)
        """),{
            "id":sr_id, "hotel":body.get("hotel_id","tb-default-hotel-000000000001"),
            "title":body.get("title","New Service Request"),
            "desc":body.get("description",""),
            "category":body.get("category","general"),
            "urgency":body.get("urgency","normal"),
            "submitted_by":body.get("submitted_by","Portal User"),
            "phone":body.get("contact_phone","") or None,
            "now":now,
        })
        db.execute(text("""
            INSERT INTO notifications (id,hotel_id,title,message,type,entity_id,entity_type,recipient_role,is_read,created_at,updated_at)
            VALUES (:id,:hotel,:title,:msg,'service_request_created',:eid,'service_request','admin',false,:now,:now)
        """),{"id":str(uuid.uuid4()),"hotel":"tb-default-hotel-000000000001",
              "title":f"Service Request: {body.get('title','New SR')}",
              "msg":f"Urgency: {body.get('urgency','normal')}","eid":sr_id,"now":now})
        db.commit()
        return {"id":sr_id,"status":"open","urgency":body.get("urgency"),"title":body.get("title"),"created_at":now.isoformat()}


@app.post("/api/v1/leads/", tags=["leads"])
def create_lead(body: dict):
    """Create a new lead"""
    from sqlalchemy import text, create_engine
    from sqlalchemy.orm import Session
    import os, uuid
    from datetime import datetime
    eng = create_engine(os.environ.get("DATABASE_URL","postgresql+psycopg2://ai:ai123@localhost:5432/triangle_black"))
    with Session(eng) as db:
        lead_id = str(uuid.uuid4())
        now     = datetime.utcnow()
        db.execute(text("""
            INSERT INTO leads (id,hotel_id,name,company,email,phone,source,status,priority,score,notes,created_at,updated_at)
            VALUES (:id,:hotel,:name,:company,:email,:phone,:source,'new',:priority,:score,:notes,:now,:now)
        """),{
            "id":lead_id, "hotel":body.get("hotel_id","tb-default-hotel-000000000001"),
            "name":body.get("name","New Lead"),
            "company":body.get("company","") or None,
            "email":body.get("email","") or None,
            "phone":body.get("phone","") or None,
            "source":body.get("source","manual"),
            "priority":body.get("priority","medium"),
            "score":int(body.get("score",50)),
            "notes":body.get("notes","") or None,
            "now":now,
        })
        db.execute(text("""
            INSERT INTO notifications (id,hotel_id,title,message,type,entity_id,entity_type,recipient_role,is_read,created_at,updated_at)
            VALUES (:id,:hotel,:title,:msg,'lead_created',:eid,'lead','admin',false,:now,:now)
        """),{"id":str(uuid.uuid4()),"hotel":"tb-default-hotel-000000000001",
              "title":f"New Lead: {body.get('name','Lead')}",
              "msg":f"Company: {body.get('company','—')} · Source: {body.get('source','manual')}",
              "eid":lead_id,"now":now})
        db.commit()
        return {"id":lead_id,"status":"new","name":body.get("name"),"company":body.get("company"),"created_at":now.isoformat()}


@app.post("/api/v1/purchase-requests/", tags=["procurement"])
def create_purchase_request(body: dict):
    """Create a new purchase request"""
    from sqlalchemy import text, create_engine
    from sqlalchemy.orm import Session
    import os, uuid
    from datetime import datetime, timedelta
    eng = create_engine(os.environ.get("DATABASE_URL","postgresql+psycopg2://ai:ai123@localhost:5432/triangle_black"))
    with Session(eng) as db:
        pr_id  = str(uuid.uuid4())
        now    = datetime.utcnow()
        pr_num = f"PR-{now.strftime('%Y%m%d')}-{pr_id[:6].upper()}"
        required = body.get("required_date") or (now + timedelta(days=7)).isoformat()
        requester = (body.get("requester") or body.get("submitted_by") or body.get("name") or "Portal User")
        title     = body.get("title") or f"Purchase Request {pr_num}"
        dept      = body.get("department") or "Engineering"
        urgency   = body.get("urgency") or "normal"
        db.execute(text("""
            INSERT INTO purchase_requests (id,hotel_id,pr_number,title,justification,urgency,
                status,department,requester,lines,required_date,created_at,updated_at)
            VALUES (:id,:hotel,:pr_num,:title,:justification,:urgency,'pending',:dept,:requester,
                :lines::json,:required,:now,:now)
        """),{
            "id":pr_id,
            "hotel":body.get("hotel_id","tb-default-hotel-000000000001"),
            "pr_num":pr_num,
            "title":title,
            "justification":body.get("justification") or "",
            "urgency":urgency,
            "dept":dept,
            "requester":requester,
            "lines":body.get("lines") or "[]",
            "required":required,
            "now":now,
        })
        db.execute(text("""
            INSERT INTO notifications (id,hotel_id,title,message,type,entity_id,entity_type,recipient_role,is_read,created_at,updated_at)
            VALUES (:id,:hotel,:title,:msg,'purchase_request_created',:eid,'purchase_request','admin',false,:now,:now)
        """),{"id":str(uuid.uuid4()),"hotel":"tb-default-hotel-000000000001",
              "title":f"New PR: {title}",
              "msg":f"Dept: {dept} · Urgency: {urgency} · By: {requester}",
              "eid":pr_id,"now":now})
        db.commit()
        return {"id":pr_id,"status":"pending","pr_number":pr_num,"title":title,"requester":requester,"created_at":now.isoformat()}


@app.post("/api/v1/work-orders/{wo_id}/status", tags=["work-orders"])
def update_wo_status(wo_id: str, body: dict):
    """Update work order status — open/in_progress/completed/cancelled"""
    from sqlalchemy import text, create_engine
    from sqlalchemy.orm import Session
    import os
    from datetime import datetime
    eng = create_engine(os.environ.get("DATABASE_URL","postgresql+psycopg2://ai:ai123@localhost:5432/triangle_black"))
    with Session(eng) as db:
        now    = datetime.utcnow()
        status = body.get("status","open")
        extra  = {}
        if status == "in_progress": extra["started_at"] = now
        if status == "completed":   extra["completed_at"] = now

        set_parts = ["status=:status","updated_at=:now"]
        params    = {"status":status,"now":now,"wo_id":wo_id}
        if "started_at"   in extra: set_parts.append("started_at=:started_at");   params["started_at"]   = extra["started_at"]
        if "completed_at" in extra: set_parts.append("completed_at=:completed_at"); params["completed_at"] = extra["completed_at"]

        db.execute(text(f"UPDATE work_orders SET {', '.join(set_parts)} WHERE id=:wo_id"), params)

        # Sync asset + create notification on completion
        if status == "completed":
            db.execute(text("""
                UPDATE assets SET last_maintenance_date=:now, next_maintenance_date=:next, updated_at=:now
                FROM work_orders wo WHERE assets.id=wo.asset_id AND wo.id=:wo_id AND wo.asset_id IS NOT NULL
            """),{"now":now,"next":now.replace(year=now.year+1 if now.month>9 else now.year, month=(now.month+3-1)%12+1),"wo_id":wo_id})
            # Get WO title for notification
            wo_row = db.execute(text("SELECT title FROM work_orders WHERE id=:id"),{"id":wo_id}).fetchone()
            wo_title = wo_row[0] if wo_row else wo_id[:12]
            db.execute(text("""
                INSERT INTO notifications (id,hotel_id,title,message,type,entity_id,entity_type,
                    recipient_role,is_read,created_at,updated_at)
                VALUES (:id,'tb-default-hotel-000000000001',:title,:msg,
                    'work_order_completed',:eid,'work_order','admin',false,:now,:now)
            """),{"id":str(uuid.uuid4()),"title":f"WO Completed: {wo_title}",
                  "msg":f"Work order completed at {now.strftime('%H:%M')}","eid":wo_id,"now":now})

        db.commit()
        return {"id":wo_id,"status":status,"updated_at":now.isoformat()}


@app.post("/api/v1/service-requests/{sr_id}/status", tags=["service-requests"])
def update_sr_status(sr_id: str, body: dict):
    """Update service request status"""
    from sqlalchemy import text, create_engine
    from sqlalchemy.orm import Session
    import os
    from datetime import datetime
    eng = create_engine(os.environ.get("DATABASE_URL","postgresql+psycopg2://ai:ai123@localhost:5432/triangle_black"))
    with Session(eng) as db:
        now    = datetime.utcnow()
        status = body.get("status","open")
        params = {"status":status,"now":now,"sr_id":sr_id}
        sets   = ["status=:status","updated_at=:now"]
        if status == "resolved":
            sets.append("resolved_at=:now")
            if body.get("resolution_notes"):
                sets.append("resolution_notes=:notes"); params["notes"] = body["resolution_notes"]
        db.execute(text(f"UPDATE service_requests SET {', '.join(sets)} WHERE id=:sr_id"), params)
        db.commit()
        return {"id":sr_id,"status":status,"updated_at":now.isoformat()}


@app.post("/api/v1/leads/{lead_id}/status", tags=["leads"])
def update_lead_status(lead_id: str, body: dict):
    """Move lead through pipeline stages"""
    from sqlalchemy import text, create_engine
    from sqlalchemy.orm import Session
    import os
    from datetime import datetime
    eng = create_engine(os.environ.get("DATABASE_URL","postgresql+psycopg2://ai:ai123@localhost:5432/triangle_black"))
    with Session(eng) as db:
        now    = datetime.utcnow()
        status = body.get("status","new")
        score  = body.get("score")
        sets   = ["status=:status","updated_at=:now"]
        params = {"status":status,"now":now,"lead_id":lead_id}
        if score is not None: sets.append("score=:score"); params["score"] = int(score)
        db.execute(text(f"UPDATE leads SET {', '.join(sets)} WHERE id=:lead_id"), params)
        db.commit()
        return {"id":lead_id,"status":status,"updated_at":now.isoformat()}


@app.post("/api/v1/purchase-requests/{pr_id}/approve", tags=["procurement"])
def approve_purchase_request(pr_id: str, body: dict):
    """Approve or reject a purchase request"""
    from sqlalchemy import text, create_engine
    from sqlalchemy.orm import Session
    import os
    from datetime import datetime
    eng = create_engine(os.environ.get("DATABASE_URL","postgresql+psycopg2://ai:ai123@localhost:5432/triangle_black"))
    with Session(eng) as db:
        now      = datetime.utcnow()
        action   = body.get("action","approve")
        new_status = "approved" if action == "approve" else "rejected"
        params   = {"status":new_status,"now":now,"pr_id":pr_id,"approver":body.get("approved_by","Manager")}
        sets     = ["status=:status","updated_at=:now","approved_by=:approver","approved_at=:now"]
        if action == "reject" and body.get("rejection_note"):
            sets.append("rejection_note=:note"); params["note"] = body["rejection_note"]
        db.execute(text(f"UPDATE purchase_requests SET {', '.join(sets)} WHERE id=:pr_id"), params)
        db.commit()
        return {"id":pr_id,"status":new_status,"updated_at":now.isoformat()}



# ── SPRINT 191: GLOBAL SEARCH ENDPOINT ──────────────────────────────────────

@app.get("/api/v1/search", tags=["search"])
def global_search(q: str = "", limit: int = 8):
    """Search across all entities — WOs, assets, leads, contracts, technicians"""
    if not q or len(q) < 2:
        return {"results": [], "total": 0, "query": q}
    
    from sqlalchemy import text, create_engine
    from sqlalchemy.orm import Session
    import os
    
    eng = create_engine(os.environ.get("DATABASE_URL",
        "postgresql+psycopg2://ai:ai123@localhost:5432/triangle_black"))
    
    results = []
    q_like = f"%{q}%"
    
    with Session(eng) as db:
        def safe_query(sql, params, entity_type, path_prefix):
            try:
                rows = db.execute(text(sql), params).fetchall()
                for row in rows:
                    r = dict(row._mapping)
                    results.append({
                        "type":  entity_type,
                        "id":    r.get("id",""),
                        "title": r.get("title") or r.get("name") or r.get("invoice_number") or r.get("pr_number") or r.get("id",""),
                        "sub":   r.get("status") or r.get("category") or r.get("company") or "",
                        "path":  f"{path_prefix}/{r.get('id','')}",
                    })
            except Exception as e:
                db.rollback()
        
        safe_query(
            "SELECT id,title,status,type FROM work_orders WHERE title ILIKE :q ORDER BY created_at DESC LIMIT :l",
            {"q":q_like,"l":limit//4+2}, "Work Order", "/operations/work-orders")
        
        safe_query(
            "SELECT id,name,status,company FROM leads WHERE name ILIKE :q OR company ILIKE :q ORDER BY updated_at DESC LIMIT :l",
            {"q":q_like,"l":limit//4+2}, "Lead", "/commercial/leads")
        
        safe_query(
            "SELECT id,name,category,status FROM assets WHERE name ILIKE :q OR serial_number ILIKE :q ORDER BY name LIMIT :l",
            {"q":q_like,"l":limit//4+2}, "Asset", "/maintenance/assets")
        
        safe_query(
            "SELECT id,title,status FROM contracts WHERE title ILIKE :q ORDER BY created_at DESC LIMIT :l",
            {"q":q_like,"l":limit//4+2}, "Contract", "/commercial/contracts")
        
        safe_query(
            "SELECT id,name,email FROM technicians WHERE name ILIKE :q OR email ILIKE :q ORDER BY name LIMIT :l",
            {"q":q_like,"l":3}, "Technician", "/operations/technicians")
        
        safe_query(
            "SELECT id,invoice_number as title,status FROM invoices WHERE invoice_number ILIKE :q ORDER BY created_at DESC LIMIT :l",
            {"q":q_like,"l":3}, "Invoice", "/invoices")
    
    results = results[:limit]
    return {"results": results, "total": len(results), "query": q}



# ── SPRINT 192: CONTRACT RENEWAL ENDPOINT ────────────────────────────────────

@app.post("/api/v1/contracts/{contract_id}/renew", tags=["contracts"])
def renew_contract(contract_id: str, body: dict = None):
    """Create a contract renewal — extends end_date and increments renewal_count"""
    from sqlalchemy import text, create_engine
    from sqlalchemy.orm import Session
    import os, uuid
    from datetime import datetime, timedelta
    
    body = body or {}
    eng  = create_engine(os.environ.get("DATABASE_URL",
        "postgresql+psycopg2://ai:ai123@localhost:5432/triangle_black"))
    
    with Session(eng) as db:
        now = datetime.utcnow()
        
        # Get current contract
        row = db.execute(text("SELECT * FROM contracts WHERE id=:id"), {"id":contract_id}).fetchone()
        if not row:
            from fastapi import HTTPException
            raise HTTPException(status_code=404, detail="Contract not found")
        
        c = dict(row._mapping)
        months   = int(body.get("duration_months") or c.get("duration_months") or 12)
        old_end  = c.get("end_date") or now
        if isinstance(old_end, str):
            old_end = datetime.fromisoformat(old_end.replace("Z",""))
        new_end  = old_end + timedelta(days=months*30)
        new_count = int(c.get("renewal_count") or 0) + 1
        
        db.execute(text("""
            UPDATE contracts
            SET end_date=:new_end, renewal_count=:count,
                status='active', updated_at=:now
            WHERE id=:id
        """), {"new_end":new_end,"count":new_count,"now":now,"id":contract_id})
        
        # Create renewal notification
        db.execute(text("""
            INSERT INTO notifications (id,hotel_id,title,message,type,entity_id,entity_type,
                recipient_role,is_read,created_at,updated_at)
            VALUES (:id,:hotel,:title,:msg,'contract_renewed',:eid,'contract','admin',false,:now,:now)
        """), {
            "id":str(uuid.uuid4()),
            "hotel":c.get("hotel_id","tb-default-hotel-000000000001"),
            "title":f"Contract Renewed: {c.get('title','Contract')}",
            "msg":f"Extended by {months} months. New end: {new_end.strftime('%d %b %Y')}. Renewal #{new_count}",
            "eid":contract_id, "now":now,
        })
        db.commit()
        
        return {
            "id":contract_id,
            "status":"active",
            "end_date":new_end.isoformat(),
            "renewal_count":new_count,
            "months_extended":months,
            "message":f"Contract renewed for {months} months",
        }



# ── SPRINT 202: ACTIVITY FEED ────────────────────────────────────────────────

@app.get("/api/v1/activity-feed", tags=["activity"])
def get_activity_feed(limit: int = 30, entity_id: str = None):
    """Get recent platform activity — WO updates, lead changes, notifications, automation actions"""
    from sqlalchemy import text, create_engine
    from sqlalchemy.orm import Session
    import os
    
    eng = create_engine(os.environ.get("DATABASE_URL",
        "postgresql+psycopg2://ai:ai123@localhost:5432/triangle_black"))
    
    activities = []
    
    with Session(eng) as db:
        def safe(q, p=None):
            try:
                return db.execute(text(q), p or {}).fetchall()
            except:
                db.rollback()
                return []
        
        # Recent WO status changes (completed ones)
        wo_filter = "AND wo.id = :eid" if entity_id else ""
        wo_params = {"l": limit // 4, "eid": entity_id} if entity_id else {"l": limit // 4}
        wos = safe(f"""
            SELECT wo.id, wo.title, wo.status, wo.priority,
                   wo.completed_at as event_time, wo.technician_id,
                   t.name as technician_name
            FROM work_orders wo
            LEFT JOIN technicians t ON t.id = wo.technician_id
            WHERE wo.completed_at IS NOT NULL {wo_filter}
            ORDER BY wo.completed_at DESC LIMIT :l
        """, wo_params)
        for w in wos:
            r = dict(w._mapping)
            activities.append({
                "id": r["id"], "type": "work_order_completed",
                "icon": "✅", "color": "#34D399",
                "title": f"WO Completed: {r['title']}",
                "description": f"Completed by {r.get('technician_name') or 'Unassigned'} · Priority: {r['priority']}",
                "entity_type": "work_order", "entity_id": r["id"],
                "path": f"/operations/work-orders/{r['id']}",
                "time": str(r["event_time"]),
            })
        
        # Recent notifications (last 20)
        notif_filter = "AND entity_id = :eid" if entity_id else ""
        notif_params = {"l": limit // 3, "eid": entity_id} if entity_id else {"l": limit // 3}
        notifs = safe(f"""
            SELECT id, title, message, type, entity_id, entity_type, created_at
            FROM notifications
            WHERE is_read = false {notif_filter}
            ORDER BY created_at DESC LIMIT :l
        """, notif_params)
        type_icons = {
            "work_order_created":"🔧","contract_expiring":"⏰","purchase_request_created":"🛒",
            "contract_renewed":"🔄","lead_created":"👤","work_order_completed":"✅",
        }
        for n in notifs:
            r = dict(n._mapping)
            activities.append({
                "id": r["id"], "type": r.get("type","notification"),
                "icon": type_icons.get(r.get("type",""),"🔔"), "color": "#A78BFA",
                "title": r["title"], "description": r.get("message",""),
                "entity_type": r.get("entity_type",""), "entity_id": r.get("entity_id",""),
                "path": f"/{r.get('entity_type','work_order').replace('_','-')}s/{r.get('entity_id','')}",
                "time": str(r["created_at"]),
            })
        
        # Recent PM plan WOs (auto-created)
        pm_wos = safe("""
            SELECT id, title, created_at, priority
            FROM work_orders
            WHERE title LIKE 'PM:%'
            ORDER BY created_at DESC LIMIT :l
        """, {"l": 5})
        for w in pm_wos:
            r = dict(w._mapping)
            activities.append({
                "id": r["id"], "type": "pm_auto_created",
                "icon": "📅", "color": "#60A5FA",
                "title": f"Auto-created: {r['title']}",
                "description": "Automatically created from overdue PM plan",
                "entity_type": "work_order", "entity_id": r["id"],
                "path": f"/operations/work-orders/{r['id']}",
                "time": str(r["created_at"]),
            })
    
    # Sort by time descending and limit
    activities.sort(key=lambda x: x.get("time",""), reverse=True)
    return {
        "activities": activities[:limit],
        "total": len(activities),
    }



# ── SPRINT 206: INVOICE DETAIL ENDPOINT ──────────────────────────────────────

@app.get("/api/v1/invoices/{invoice_id}", tags=["finance"])
def get_invoice_detail(invoice_id: str):
    """Get single invoice with all fields for PDF generation"""
    from sqlalchemy import text, create_engine
    from sqlalchemy.orm import Session
    import os
    eng = create_engine(os.environ.get("DATABASE_URL",
        "postgresql+psycopg2://ai:ai123@localhost:5432/triangle_black"))
    with Session(eng) as db:
        def safe(q, params=None):
            try:
                r = db.execute(text(q), params or {}).fetchone()
                return dict(r._mapping) if r else None
            except Exception:
                db.rollback()
                return None
        inv = safe("SELECT * FROM invoices WHERE id = :id", {"id": invoice_id})
        if not inv:
            from fastapi import HTTPException
            raise HTTPException(status_code=404, detail="Invoice not found")
        # Try to get contract/client info
        contract = None
        if inv.get("contract_id"):
            contract = safe("SELECT * FROM contracts WHERE id = :id", {"id": inv["contract_id"]})
        # Try to get work order info
        wo = None
        if inv.get("work_order_id"):
            wo = safe("SELECT * FROM work_orders WHERE id = :id", {"id": inv["work_order_id"]})
        return {
            **{k: str(v) if v is not None else None for k, v in inv.items()},
            "contract": {k: str(v) if v is not None else None for k, v in contract.items()} if contract else None,
            "work_order": {k: str(v) if v is not None else None for k, v in wo.items()} if wo else None,
        }



# ── SPRINT 207: DETAIL ENDPOINTS ─────────────────────────────────────────────

@app.get("/api/v1/work-orders/{wo_id}", tags=["operations"])
def get_work_order_detail(wo_id: str):
    from sqlalchemy import text, create_engine
    from sqlalchemy.orm import Session
    import os
    eng = create_engine(os.environ.get("DATABASE_URL",
        "postgresql+psycopg2://ai:ai123@localhost:5432/triangle_black"))
    with Session(eng) as db:
        def safe(q, params=None):
            try:
                r = db.execute(text(q), params or {}).fetchone()
                return dict(r._mapping) if r else None
            except Exception:
                db.rollback()
                return None
        def safe_list(q, params=None):
            try:
                rows = db.execute(text(q), params or {}).fetchall()
                return [dict(r._mapping) for r in rows]
            except Exception:
                db.rollback()
                return []
        wo = safe("SELECT * FROM work_orders WHERE id = :id", {"id": wo_id})
        if not wo:
            from fastapi import HTTPException
            raise HTTPException(status_code=404, detail="Work order not found")
        tech = None
        if wo.get("technician_id"):
            tech = safe("SELECT * FROM technicians WHERE id = :id", {"id": wo["technician_id"]})
        asset = None
        if wo.get("asset_id"):
            asset = safe("SELECT * FROM assets WHERE id = :id", {"id": wo["asset_id"]})
        sr = safe("SELECT * FROM service_requests WHERE work_order_id = :id LIMIT 1", {"id": wo_id})
        str_wo = {k: str(v) if v is not None else None for k, v in wo.items()}
        return {
            **str_wo,
            "technician": {k: str(v) if v is not None else None for k, v in tech.items()} if tech else None,
            "asset": {k: str(v) if v is not None else None for k, v in asset.items()} if asset else None,
            "service_request": {k: str(v) if v is not None else None for k, v in sr.items()} if sr else None,
        }

@app.get("/api/v1/contracts/{contract_id}", tags=["commercial"])
def get_contract_detail(contract_id: str):
    from sqlalchemy import text, create_engine
    from sqlalchemy.orm import Session
    import os
    eng = create_engine(os.environ.get("DATABASE_URL",
        "postgresql+psycopg2://ai:ai123@localhost:5432/triangle_black"))
    with Session(eng) as db:
        def safe(q, params=None):
            try:
                r = db.execute(text(q), params or {}).fetchone()
                return dict(r._mapping) if r else None
            except Exception:
                db.rollback()
                return None
        def safe_list(q, params=None):
            try:
                rows = db.execute(text(q), params or {}).fetchall()
                return [dict(r._mapping) for r in rows]
            except Exception:
                db.rollback()
                return []
        contract = safe("SELECT * FROM contracts WHERE id = :id", {"id": contract_id})
        if not contract:
            from fastapi import HTTPException
            raise HTTPException(status_code=404, detail="Contract not found")
        invoices = safe_list("SELECT id, invoice_number, total_amount, status, due_date, created_at FROM invoices WHERE contract_id = :id ORDER BY created_at DESC LIMIT 10", {"id": contract_id})
        wos = safe_list("SELECT id, title, status, priority, created_at FROM work_orders WHERE contract_id = :id ORDER BY created_at DESC LIMIT 10", {"id": contract_id})
        str_c = {k: str(v) if v is not None else None for k, v in contract.items()}
        return {
            **str_c,
            "invoices": [{k: str(v) if v is not None else None for k, v in i.items()} for i in invoices],
            "work_orders": [{k: str(v) if v is not None else None for k, v in w.items()} for w in wos],
        }

@app.get("/api/v1/projects/{project_id}", tags=["projects"])
def get_project_detail(project_id: str):
    from sqlalchemy import text, create_engine
    from sqlalchemy.orm import Session
    import os
    eng = create_engine(os.environ.get("DATABASE_URL",
        "postgresql+psycopg2://ai:ai123@localhost:5432/triangle_black"))
    with Session(eng) as db:
        def safe(q, params=None):
            try:
                r = db.execute(text(q), params or {}).fetchone()
                return dict(r._mapping) if r else None
            except Exception:
                db.rollback()
                return None
        def safe_list(q, params=None):
            try:
                rows = db.execute(text(q), params or {}).fetchall()
                return [dict(r._mapping) for r in rows]
            except Exception:
                db.rollback()
                return []
        project = safe("SELECT * FROM projects WHERE id = :id", {"id": project_id})
        if not project:
            from fastapi import HTTPException
            raise HTTPException(status_code=404, detail="Project not found")
        wos = safe_list("SELECT id, title, status, priority, created_at FROM work_orders WHERE project_id = :id ORDER BY created_at DESC LIMIT 10", {"id": project_id})
        str_p = {k: str(v) if v is not None else None for k, v in project.items()}
        return {
            **str_p,
            "work_orders": [{k: str(v) if v is not None else None for k, v in w.items()} for w in wos],
        }


# ── SPRINT 208: ASSET / PM / LEAD DETAIL ENDPOINTS ───────────────────────────

@app.get("/api/v1/assets/{asset_id}", tags=["maintenance"])
def get_asset_detail(asset_id: str):
    from sqlalchemy import text, create_engine
    from sqlalchemy.orm import Session
    import os
    eng = create_engine(os.environ.get("DATABASE_URL",
        "postgresql+psycopg2://ai:ai123@localhost:5432/triangle_black"))
    with Session(eng) as db:
        def safe(q, params=None):
            try:
                r = db.execute(text(q), params or {}).fetchone()
                return dict(r._mapping) if r else None
            except Exception:
                db.rollback()
                return None
        def safe_list(q, params=None):
            try:
                rows = db.execute(text(q), params or {}).fetchall()
                return [dict(r._mapping) for r in rows]
            except Exception:
                db.rollback()
                return []
        asset = safe("SELECT * FROM assets WHERE id = :id", {"id": asset_id})
        if not asset:
            from fastapi import HTTPException
            raise HTTPException(status_code=404, detail="Asset not found")
        wos  = safe_list("SELECT id, title, status, priority, created_at, completed_at FROM work_orders WHERE asset_id = :id ORDER BY created_at DESC LIMIT 10", {"id": asset_id})
        pms  = safe_list("SELECT id, title, plan_type, status, next_due_ts FROM maintenance_plans WHERE asset_node_id = :id ORDER BY next_due_ts ASC LIMIT 10", {"id": asset_id})
        str_a = {k: str(v) if v is not None else None for k, v in asset.items()}
        return {
            **str_a,
            "work_orders": [{k: str(v) if v is not None else None for k, v in w.items()} for w in wos],
            "pm_plans": [{k: str(v) if v is not None else None for k, v in pm.items()} for pm in pms],
        }

@app.get("/api/v1/maintenance/pm-plans/{plan_id}", tags=["maintenance"])
def get_pm_plan_detail(plan_id: str):
    from sqlalchemy import text, create_engine
    from sqlalchemy.orm import Session
    import os
    eng = create_engine(os.environ.get("DATABASE_URL",
        "postgresql+psycopg2://ai:ai123@localhost:5432/triangle_black"))
    with Session(eng) as db:
        def safe(q, params=None):
            try:
                r = db.execute(text(q), params or {}).fetchone()
                return dict(r._mapping) if r else None
            except Exception:
                db.rollback()
                return None
        def safe_list(q, params=None):
            try:
                rows = db.execute(text(q), params or {}).fetchall()
                return [dict(r._mapping) for r in rows]
            except Exception:
                db.rollback()
                return []
        plan = safe("SELECT * FROM maintenance_plans WHERE id = :id", {"id": plan_id})
        if not plan:
            from fastapi import HTTPException
            raise HTTPException(status_code=404, detail="PM plan not found")
        asset = None
        if plan.get("asset_node_id"):
            asset = safe("SELECT id, name, category, status, location FROM assets WHERE id = :id", {"id": plan["asset_node_id"]})
        wos = safe_list("SELECT id, title, status, priority, created_at FROM work_orders WHERE title LIKE :t ORDER BY created_at DESC LIMIT 5", {"t": f"%PM%{(plan.get('title') or '')[:20]}%"})
        str_p = {k: str(v) if v is not None else None for k, v in plan.items()}
        return {
            **str_p,
            "asset": {k: str(v) if v is not None else None for k, v in asset.items()} if asset else None,
            "recent_work_orders": [{k: str(v) if v is not None else None for k, v in w.items()} for w in wos],
        }

@app.get("/api/v1/leads/{lead_id}", tags=["commercial"])
def get_lead_detail(lead_id: str):
    from sqlalchemy import text, create_engine
    from sqlalchemy.orm import Session
    import os
    eng = create_engine(os.environ.get("DATABASE_URL",
        "postgresql+psycopg2://ai:ai123@localhost:5432/triangle_black"))
    with Session(eng) as db:
        def safe(q, params=None):
            try:
                r = db.execute(text(q), params or {}).fetchone()
                return dict(r._mapping) if r else None
            except Exception:
                db.rollback()
                return None
        def safe_list(q, params=None):
            try:
                rows = db.execute(text(q), params or {}).fetchall()
                return [dict(r._mapping) for r in rows]
            except Exception:
                db.rollback()
                return []
        lead = safe("SELECT * FROM leads WHERE id = :id", {"id": lead_id})
        if not lead:
            from fastapi import HTTPException
            raise HTTPException(status_code=404, detail="Lead not found")
        contracts = safe_list("SELECT id, title, status, total_value, start_date, end_date FROM contracts WHERE client_name = :n ORDER BY created_at DESC LIMIT 5", {"n": lead.get("company") or lead.get("name") or ""})
        str_l = {k: str(v) if v is not None else None for k, v in lead.items()}
        return {
            **str_l,
            "contracts": [{k: str(v) if v is not None else None for k, v in c.items()} for c in contracts],
        }


# ── SPRINT 209: TECHNICIAN + SUPPLIER DETAIL ENDPOINTS ───────────────────────

@app.get("/api/v1/technicians/{tech_id}", tags=["operations"])
def get_technician_detail(tech_id: str):
    from sqlalchemy import text, create_engine
    from sqlalchemy.orm import Session
    import os
    eng = create_engine(os.environ.get("DATABASE_URL",
        "postgresql+psycopg2://ai:ai123@localhost:5432/triangle_black"))
    with Session(eng) as db:
        def safe(q, params=None):
            try:
                r = db.execute(text(q), params or {}).fetchone()
                return dict(r._mapping) if r else None
            except Exception:
                db.rollback()
                return None
        def safe_list(q, params=None):
            try:
                rows = db.execute(text(q), params or {}).fetchall()
                return [dict(r._mapping) for r in rows]
            except Exception:
                db.rollback()
                return []
        tech = safe("SELECT * FROM technicians WHERE id = :id", {"id": tech_id})
        if not tech:
            from fastapi import HTTPException
            raise HTTPException(status_code=404, detail="Technician not found")
        wos = safe_list("""SELECT id, title, status, priority, created_at, completed_at
            FROM work_orders WHERE technician_id = :id
            ORDER BY created_at DESC LIMIT 15""", {"id": tech_id})
        completed = [w for w in wos if w.get("status") == "completed"]
        open_wos  = [w for w in wos if w.get("status") in ("open","in_progress")]
        str_t = {k: str(v) if v is not None else None for k, v in tech.items()}
        return {
            **str_t,
            "work_orders": [{k: str(v) if v is not None else None for k, v in w.items()} for w in wos],
            "stats": {
                "total_wos": len(wos),
                "completed": len(completed),
                "open": len(open_wos),
                "completion_rate": round(len(completed)/max(len(wos),1)*100),
            }
        }

@app.get("/api/v1/suppliers/{supplier_id}", tags=["supply-chain"])
def get_supplier_detail(supplier_id: str):
    from sqlalchemy import text, create_engine
    from sqlalchemy.orm import Session
    import os
    eng = create_engine(os.environ.get("DATABASE_URL",
        "postgresql+psycopg2://ai:ai123@localhost:5432/triangle_black"))
    with Session(eng) as db:
        def safe(q, params=None):
            try:
                r = db.execute(text(q), params or {}).fetchone()
                return dict(r._mapping) if r else None
            except Exception:
                db.rollback()
                return None
        def safe_list(q, params=None):
            try:
                rows = db.execute(text(q), params or {}).fetchall()
                return [dict(r._mapping) for r in rows]
            except Exception:
                db.rollback()
                return []
        supplier = safe("SELECT * FROM suppliers WHERE id = :id", {"id": supplier_id})
        if not supplier:
            from fastapi import HTTPException
            raise HTTPException(status_code=404, detail="Supplier not found")
        pos = safe_list("""SELECT id, po_number, status, total_amount, order_date, created_at
            FROM purchase_orders WHERE supplier_id = :id
            ORDER BY created_at DESC LIMIT 10""", {"id": supplier_id})
        prs = safe_list("""SELECT id, title, status, total_amount, created_at
            FROM purchase_requests WHERE supplier_id = :id
            ORDER BY created_at DESC LIMIT 10""", {"id": supplier_id})
        total_value = sum(float(p.get("total_amount") or 0) for p in pos)
        str_s = {k: str(v) if v is not None else None for k, v in supplier.items()}
        return {
            **str_s,
            "purchase_orders": [{k: str(v) if v is not None else None for k, v in po.items()} for po in pos],
            "purchase_requests": [{k: str(v) if v is not None else None for k, v in pr.items()} for pr in prs],
            "stats": {
                "total_pos": len(pos),
                "total_value": total_value,
                "total_prs": len(prs),
            }
        }

# ── SPRINT 226: PORTAL READ ENDPOINTS — use SELECT * to avoid column issues ──

@app.get("/api/v1/contracts-portal", tags=["portal"], include_in_schema=False)
def contracts_portal(limit: int = 200):
    from sqlalchemy import text, create_engine
    from sqlalchemy.orm import Session
    import os
    eng = create_engine(os.environ.get("DATABASE_URL","postgresql+psycopg2://ai:ai123@localhost:5432/triangle_black"))
    with Session(eng) as db:
        try:
            rows = db.execute(text("SELECT * FROM contracts ORDER BY created_at DESC LIMIT :l"), {"l": limit}).fetchall()
            return [dict(r._mapping) for r in rows]
        except Exception as e:
            db.rollback()
            return []

@app.get("/api/v1/leads-portal", tags=["portal"], include_in_schema=False)
def leads_portal(limit: int = 200):
    from sqlalchemy import text, create_engine
    from sqlalchemy.orm import Session
    import os
    eng = create_engine(os.environ.get("DATABASE_URL","postgresql+psycopg2://ai:ai123@localhost:5432/triangle_black"))
    with Session(eng) as db:
        try:
            rows = db.execute(text("SELECT * FROM leads ORDER BY created_at DESC LIMIT :l"), {"l": limit}).fetchall()
            return [dict(r._mapping) for r in rows]
        except Exception as e:
            db.rollback()
            return []

@app.get("/api/v1/purchase-orders-portal", tags=["portal"], include_in_schema=False)
def purchase_orders_portal(limit: int = 200):
    from sqlalchemy import text, create_engine
    from sqlalchemy.orm import Session
    import os
    eng = create_engine(os.environ.get("DATABASE_URL","postgresql+psycopg2://ai:ai123@localhost:5432/triangle_black"))
    with Session(eng) as db:
        try:
            rows = db.execute(text("SELECT * FROM purchase_orders ORDER BY created_at DESC LIMIT :l"), {"l": limit}).fetchall()
            return [dict(r._mapping) for r in rows]
        except Exception as e:
            db.rollback()
            return []

@app.get("/api/v1/purchase-requests-portal", tags=["portal"], include_in_schema=False)
def purchase_requests_portal(limit: int = 200):
    from sqlalchemy import text, create_engine
    from sqlalchemy.orm import Session
    import os
    eng = create_engine(os.environ.get("DATABASE_URL","postgresql+psycopg2://ai:ai123@localhost:5432/triangle_black"))
    with Session(eng) as db:
        try:
            rows = db.execute(text("SELECT * FROM purchase_requests ORDER BY created_at DESC LIMIT :l"), {"l": limit}).fetchall()
            return [dict(r._mapping) for r in rows]
        except Exception as e:
            db.rollback()
            return []

@app.get("/api/v1/notifications-portal", tags=["portal"], include_in_schema=False)
def notifications_portal(limit: int = 100):
    from sqlalchemy import text, create_engine
    from sqlalchemy.orm import Session
    import os
    eng = create_engine(os.environ.get("DATABASE_URL","postgresql+psycopg2://ai:ai123@localhost:5432/triangle_black"))
    with Session(eng) as db:
        try:
            rows = db.execute(text("SELECT * FROM notifications ORDER BY created_at DESC LIMIT :l"), {"l": limit}).fetchall()
            return [dict(r._mapping) for r in rows]
        except Exception as e:
            db.rollback()
            return []

@app.get("/api/v1/inventory-items-portal", tags=["portal"], include_in_schema=False)
def inventory_items_portal(limit: int = 200):
    from sqlalchemy import text, create_engine
    from sqlalchemy.orm import Session
    import os
    eng = create_engine(os.environ.get("DATABASE_URL","postgresql+psycopg2://ai:ai123@localhost:5432/triangle_black"))
    with Session(eng) as db:
        try:
            rows = db.execute(text("SELECT * FROM inventory_items ORDER BY created_at DESC LIMIT :l"), {"l": limit}).fetchall()
            return [dict(r._mapping) for r in rows]
        except Exception:
            db.rollback()
            return []

# ── SPRINT 230: SITES / WAREHOUSES / PROJECTS PORTAL ENDPOINTS ──

@app.get("/api/v1/sites-portal", tags=["portal"], include_in_schema=False)
def sites_portal(limit: int = 50):
    from sqlalchemy import text, create_engine
    from sqlalchemy.orm import Session
    import os
    eng = create_engine(os.environ.get("DATABASE_URL","postgresql+psycopg2://ai:ai123@localhost:5432/triangle_black"))
    with Session(eng) as db:
        try:
            rows = db.execute(text("SELECT * FROM sites ORDER BY created_at DESC LIMIT :l"), {"l": limit}).fetchall()
            return [dict(r._mapping) for r in rows]
        except Exception: db.rollback(); return []

@app.get("/api/v1/warehouses-portal", tags=["portal"], include_in_schema=False)
def warehouses_portal(limit: int = 50):
    from sqlalchemy import text, create_engine
    from sqlalchemy.orm import Session
    import os
    eng = create_engine(os.environ.get("DATABASE_URL","postgresql+psycopg2://ai:ai123@localhost:5432/triangle_black"))
    with Session(eng) as db:
        try:
            rows = db.execute(text("SELECT * FROM warehouses ORDER BY created_at DESC LIMIT :l"), {"l": limit}).fetchall()
            return [dict(r._mapping) for r in rows]
        except Exception: db.rollback(); return []

@app.get("/api/v1/projects-portal", tags=["portal"], include_in_schema=False)
def projects_portal(limit: int = 50):
    from sqlalchemy import text, create_engine
    from sqlalchemy.orm import Session
    import os
    eng = create_engine(os.environ.get("DATABASE_URL","postgresql+psycopg2://ai:ai123@localhost:5432/triangle_black"))
    with Session(eng) as db:
        try:
            rows = db.execute(text("SELECT * FROM projects ORDER BY created_at DESC LIMIT :l"), {"l": limit}).fetchall()
            return [dict(r._mapping) for r in rows]
        except Exception: db.rollback(); return []

@app.get("/api/v1/rfqs-portal", tags=["portal"], include_in_schema=False)
def rfqs_portal(limit: int = 50):
    from sqlalchemy import text, create_engine
    from sqlalchemy.orm import Session
    import os
    eng = create_engine(os.environ.get("DATABASE_URL","postgresql+psycopg2://ai:ai123@localhost:5432/triangle_black"))
    with Session(eng) as db:
        try:
            rows = db.execute(text("SELECT * FROM rfqs ORDER BY created_at DESC LIMIT :l"), {"l": limit}).fetchall()
            return [dict(r._mapping) for r in rows]
        except Exception: db.rollback(); return []

@app.get("/api/v1/goods-receipts-portal", tags=["portal"], include_in_schema=False)
def goods_receipts_portal(limit: int = 50):
    from sqlalchemy import text, create_engine
    from sqlalchemy.orm import Session
    import os
    eng = create_engine(os.environ.get("DATABASE_URL","postgresql+psycopg2://ai:ai123@localhost:5432/triangle_black"))
    with Session(eng) as db:
        try:
            rows = db.execute(text("SELECT * FROM goods_receipts ORDER BY created_at DESC LIMIT :l"), {"l": limit}).fetchall()
            return [dict(r._mapping) for r in rows]
        except Exception: db.rollback(); return []

@app.get("/api/v1/assets-portal", tags=["portal"], include_in_schema=False)
def assets_v2_portal(limit: int = 100):
    from sqlalchemy import text, create_engine
    from sqlalchemy.orm import Session
    import os
    eng = create_engine(os.environ.get("DATABASE_URL","postgresql+psycopg2://ai:ai123@localhost:5432/triangle_black"))
    with Session(eng) as db:
        try:
            rows = db.execute(text("SELECT * FROM assets ORDER BY created_at DESC LIMIT :l"), {"l": limit}).fetchall()
            return [dict(r._mapping) for r in rows]
        except Exception: db.rollback(); return []

# ── PHASE B SPRINT 233: RBAC ENDPOINTS ───────────────────────────────────────

@app.get("/api/v1/me", tags=["auth"])
def get_current_user_info(request: Request):
    """Return current user info including role and permissions"""
    import base64 as _b64
    import json as _js
    import os as _os
    from sqlalchemy import text as _text, create_engine as _ce
    from sqlalchemy.orm import Session as _Sess

    auth_header = request.headers.get("Authorization", "") or ""
    raw_token = auth_header.replace("Bearer ", "").replace("bearer ", "").strip()

    if not raw_token:
        from fastapi import HTTPException
        raise HTTPException(status_code=401, detail="Not authenticated")

    # Decode JWT payload (no verification needed — just read claims)
    user_id = ""
    email = ""
    try:
        parts = raw_token.split(".")
        if len(parts) >= 2:
            seg = parts[1]
            seg += "=" * ((4 - len(seg) % 4) % 4)
            payload_data = _js.loads(_b64.urlsafe_b64decode(seg))
            user_id = str(payload_data.get("sub") or "")
            email   = str(payload_data.get("email") or "")
    except Exception:
        pass

    # Query role and permissions from DB
    role = "admin"
    perms = []
    try:
        _eng = _ce(_os.environ.get("DATABASE_URL", "postgresql+psycopg2://ai:ai123@localhost:5432/triangle_black"))
        with _Sess(_eng) as _db:
            _row = _db.execute(
                _text("SELECT role FROM user_roles WHERE user_id = :uid LIMIT 1"),
                {"uid": user_id}
            ).fetchone()
            if _row:
                role = str(_row[0]).strip()

            _prows = _db.execute(
                _text(
                    "SELECT p.resource, p.action "
                    "FROM role_permissions rp "
                    "JOIN permissions p ON p.id = rp.permission_id "
                    "JOIN roles r ON r.id = rp.role_id "
                    "WHERE r.name = :rname"
                ),
                {"rname": role}
            ).fetchall()
            perms = [{"resource": str(r[0]), "action": str(r[1])} for r in _prows]
    except Exception as _e:
        pass

    _is_admin      = role == "admin"
    _can_write     = role in ("admin", "manager", "engineer", "finance")
    _can_finance   = role in ("admin", "manager", "finance")

    return {
        "user_id":          user_id,
        "email":            email,
        "role":             role,
        "is_admin":         bool(_is_admin),
        "can_write":        bool(_can_write),
        "can_read_finance": bool(_can_finance),
        "permissions":      perms,
        "permissions_count": len(perms),
    }


@app.get("/api/v1/rbac/roles", tags=["rbac"])
def list_roles():
    from sqlalchemy import text, create_engine
    from sqlalchemy.orm import Session
    import os
    eng = create_engine(os.environ.get("DATABASE_URL","postgresql+psycopg2://ai:ai123@localhost:5432/triangle_black"))
    with Session(eng) as db:
        try:
            rows = db.execute(text("SELECT * FROM roles ORDER BY level")).fetchall()
            return [dict(r._mapping) for r in rows]
        except Exception: db.rollback(); return []

@app.get("/api/v1/rbac/permissions", tags=["rbac"])
def list_permissions():
    from sqlalchemy import text, create_engine
    from sqlalchemy.orm import Session
    import os
    eng = create_engine(os.environ.get("DATABASE_URL","postgresql+psycopg2://ai:ai123@localhost:5432/triangle_black"))
    with Session(eng) as db:
        try:
            rows = db.execute(text("SELECT r.name as role, p.resource, p.action FROM role_permissions rp JOIN roles r ON r.id=rp.role_id JOIN permissions p ON p.id=rp.permission_id ORDER BY r.level, p.resource")).fetchall()
            return [dict(r._mapping) for r in rows]
        except Exception: db.rollback(); return []

# ── SPRINT 239: PASSWORD CHANGE ───────────────────────────────────────────────

@app.post("/api/v1/auth/change-password", tags=["auth"])
def change_password(request: Request, current_password: str, new_password: str):
    """Change password for authenticated user"""
    from sqlalchemy import text, create_engine
    from sqlalchemy.orm import Session
    import os
    from src.core.auth import verify_password, hash_password

    auth = request.headers.get("Authorization", "")
    token = auth.replace("Bearer ", "").strip()
    if not token:
        from fastapi import HTTPException
        raise HTTPException(status_code=401, detail="Not authenticated")

    import base64, json as _js
    try:
        parts = token.split(".")
        seg = parts[1] + "=" * ((4 - len(parts[1]) % 4) % 4)
        payload = _js.loads(base64.urlsafe_b64decode(seg))
        user_id = str(payload.get("sub",""))
        email = str(payload.get("email",""))
    except Exception:
        from fastapi import HTTPException
        raise HTTPException(status_code=401, detail="Invalid token")

    eng = create_engine(os.environ.get("DATABASE_URL","postgresql+psycopg2://ai:ai123@localhost:5432/triangle_black"))
    with Session(eng) as db:
        try:
            # Get current password hash
            user = db.execute(
                text("SELECT id, hashed_password FROM users WHERE id=:uid OR email=:email LIMIT 1"),
                {"uid": user_id, "email": email}
            ).fetchone()
            if not user:
                from fastapi import HTTPException
                raise HTTPException(status_code=404, detail="User not found")

            # Verify current password
            if not verify_password(current_password, str(user[1])):
                from fastapi import HTTPException
                raise HTTPException(status_code=400, detail="Current password incorrect")

            # Update password
            new_hash = hash_password(new_password)
            db.execute(
                text("UPDATE users SET hashed_password=:h WHERE id=:uid"),
                {"h": new_hash, "uid": str(user[0])}
            )
            db.commit()
            return {"status": "success", "message": "Password changed successfully"}
        except Exception as e:
            db.rollback()
            if "HTTP" in str(type(e)):
                raise
            return {"status": "error", "message": str(e)}

# ── SPRINT 244: ADVANCED REPORTING ENDPOINTS ─────────────────────────────────

@app.get("/api/v1/reports/work-orders", tags=["reports"])
def report_work_orders():
    """Work orders summary report data"""
    from sqlalchemy import text, create_engine
    from sqlalchemy.orm import Session
    import os
    eng = create_engine(os.environ.get("DATABASE_URL","postgresql+psycopg2://ai:ai123@localhost:5432/triangle_black"))
    with Session(eng) as db:
        def safe(q, params=None):
            try:
                rows = db.execute(text(q), params or {}).fetchall()
                return [dict(r._mapping) for r in rows]
            except Exception: db.rollback(); return []
        
        summary = safe("""
            SELECT 
                count(*) as total,
                count(*) FILTER (WHERE status='completed') as completed,
                count(*) FILTER (WHERE status='open') as open_count,
                count(*) FILTER (WHERE status='in_progress') as in_progress,
                count(*) FILTER (WHERE priority='critical') as critical,
                count(*) FILTER (WHERE priority='high') as high_priority,
                count(*) FILTER (WHERE created_at >= NOW() - INTERVAL '30 days') as last_30_days,
                avg(EXTRACT(EPOCH FROM (completed_at - created_at))/3600) FILTER (WHERE completed_at IS NOT NULL) as avg_resolution_hours
            FROM work_orders
        """)
        
        by_category = safe("""
            SELECT a.category, count(wo.id) as count, 
                   count(wo.id) FILTER (WHERE wo.priority='critical') as critical_count
            FROM work_orders wo
            LEFT JOIN assets a ON a.id = wo.asset_id
            WHERE a.category IS NOT NULL
            GROUP BY a.category ORDER BY count DESC LIMIT 8
        """)
        
        recent = safe("""
            SELECT wo.id, wo.title, wo.status, wo.priority, wo.created_at,
                   t.name as technician_name, a.name as asset_name
            FROM work_orders wo
            LEFT JOIN technicians t ON t.id = wo.technician_id
            LEFT JOIN assets a ON a.id = wo.asset_id
            ORDER BY wo.created_at DESC LIMIT 20
        """)
        
        return {
            "summary": summary[0] if summary else {},
            "by_category": by_category,
            "recent": recent,
            "report_type": "work_orders",
            "generated_at": __import__('datetime').datetime.now().isoformat(),
        }

@app.get("/api/v1/reports/assets", tags=["reports"])
def report_assets():
    """Asset register report data"""
    from sqlalchemy import text, create_engine
    from sqlalchemy.orm import Session
    import os
    eng = create_engine(os.environ.get("DATABASE_URL","postgresql+psycopg2://ai:ai123@localhost:5432/triangle_black"))
    with Session(eng) as db:
        def safe(q, params=None):
            try:
                rows = db.execute(text(q), params or {}).fetchall()
                return [dict(r._mapping) for r in rows]
            except Exception: db.rollback(); return []
        
        summary = safe("""
            SELECT count(*) as total,
                   count(*) FILTER (WHERE status='Operational') as operational,
                   count(*) FILTER (WHERE status='In Fault') as faulted,
                   count(*) FILTER (WHERE status='Under Maintenance') as under_maintenance,
                   count(DISTINCT category) as categories
            FROM assets
        """)
        
        by_category = safe("""
            SELECT category, count(*) as total,
                   count(*) FILTER (WHERE status='Operational') as operational,
                   count(*) FILTER (WHERE status='In Fault') as faulted
            FROM assets GROUP BY category ORDER BY total DESC
        """)
        
        all_assets = safe("""
            SELECT a.id, a.name, a.category, a.status, a.location,
                   a.manufacturer, a.model, a.last_maintenance_date,
                   count(wo.id) as total_wos,
                   count(wo.id) FILTER (WHERE wo.priority='critical') as critical_wos
            FROM assets a
            LEFT JOIN work_orders wo ON wo.asset_id = a.id
            GROUP BY a.id, a.name, a.category, a.status, a.location, a.manufacturer, a.model, a.last_maintenance_date
            ORDER BY a.category, a.name
        """)
        
        return {
            "summary": summary[0] if summary else {},
            "by_category": by_category,
            "assets": all_assets,
            "report_type": "assets",
            "generated_at": __import__('datetime').datetime.now().isoformat(),
        }

@app.get("/api/v1/reports/daily-summary", tags=["reports"])
def report_daily_summary():
    """Daily operational summary"""
    from sqlalchemy import text, create_engine
    from sqlalchemy.orm import Session
    import os
    from datetime import datetime, timedelta
    eng = create_engine(os.environ.get("DATABASE_URL","postgresql+psycopg2://ai:ai123@localhost:5432/triangle_black"))
    with Session(eng) as db:
        def safe(q, params=None):
            try:
                rows = db.execute(text(q), params or {}).fetchall()
                return [dict(r._mapping) for r in rows]
            except Exception: db.rollback(); return []
        def safe_one(q, params=None):
            try:
                r = db.execute(text(q), params or {}).fetchone()
                return dict(r._mapping) if r else {}
            except Exception: db.rollback(); return {}

        today = datetime.now().date()
        yesterday = today - timedelta(days=1)
        
        wo_today = safe_one("SELECT count(*) as created, count(*) FILTER (WHERE status='completed') as completed FROM work_orders WHERE DATE(created_at)=:d", {"d": str(today)})
        wo_open = safe_one("SELECT count(*) as total, count(*) FILTER (WHERE priority='critical') as critical FROM work_orders WHERE status IN ('open','in_progress')", {})
        pm_due = safe_one("SELECT count(*) as overdue, count(*) FILTER (WHERE next_due_ts BETWEEN NOW() AND NOW()+INTERVAL '7 days') as due_week FROM maintenance_plans WHERE next_due_ts IS NOT NULL", {})
        finance = safe_one("SELECT count(*) as total_invoices, sum(total_amount) FILTER (WHERE status='paid') as collected, sum(total_amount) FILTER (WHERE status='pending') as pending FROM invoices", {})
        alerts = safe("SELECT title, message, type FROM notifications WHERE is_read=false ORDER BY created_at DESC LIMIT 5", {})
        
        return {
            "date": str(today),
            "work_orders": {"created_today": wo_today.get("created",0), "completed_today": wo_today.get("completed",0), "open_total": wo_open.get("total",0), "critical_open": wo_open.get("critical",0)},
            "maintenance": {"overdue_pms": pm_due.get("overdue",0), "due_this_week": pm_due.get("due_week",0)},
            "finance": {"total_invoices": finance.get("total_invoices",0), "collected": float(finance.get("collected") or 0), "pending": float(finance.get("pending") or 0)},
            "alerts": alerts,
            "generated_at": datetime.now().isoformat(),
        }

@app.get("/api/v1/reports/contracts", tags=["reports"])
def report_contracts():
    """Contracts portfolio report"""
    from sqlalchemy import text, create_engine
    from sqlalchemy.orm import Session
    import os
    from datetime import datetime, timedelta
    eng = create_engine(os.environ.get("DATABASE_URL","postgresql+psycopg2://ai:ai123@localhost:5432/triangle_black"))
    with Session(eng) as db:
        def safe(q, params=None):
            try:
                rows = db.execute(text(q), params or {}).fetchall()
                return [dict(r._mapping) for r in rows]
            except Exception: db.rollback(); return []
        def safe_one(q, params=None):
            try:
                r = db.execute(text(q), params or {}).fetchone()
                return dict(r._mapping) if r else {}
            except Exception: db.rollback(); return {}
        
        summary = safe_one("""
            SELECT count(*) as total,
                   count(*) FILTER (WHERE status='active') as active,
                   count(*) FILTER (WHERE status='expired') as expired,
                   sum(total_value) FILTER (WHERE status='active') as active_value,
                   count(*) FILTER (WHERE end_date BETWEEN NOW() AND NOW()+INTERVAL '30 days' AND status='active') as expiring_30d
            FROM contracts
        """)
        
        contracts = safe("""
            SELECT id, title, client_name, status, total_value, start_date, end_date,
                   EXTRACT(DAY FROM (end_date - NOW())) as days_remaining
            FROM contracts ORDER BY status, end_date ASC LIMIT 50
        """)
        
        return {
            "summary": summary,
            "contracts": contracts,
            "report_type": "contracts",
            "generated_at": datetime.now().isoformat(),
        }

# ── PROCUREMENT LIST ENDPOINTS (GET) ─────────────────────────────────────────
# Added separately because Sprint 245 functions were never persisted

@app.get("/api/v1/scope-of-work/", tags=["procurement"])
def get_sow_list(limit: int = 50):
    from sqlalchemy import text, create_engine
    from sqlalchemy.orm import Session
    import os
    eng = create_engine(os.environ.get("DATABASE_URL","postgresql+psycopg2://ai:ai123@localhost:5432/triangle_black"))
    with Session(eng) as db:
        try:
            rows = db.execute(text("SELECT * FROM scope_of_work ORDER BY created_at DESC LIMIT :l"), {"l": limit}).fetchall()
            return [dict(r._mapping) for r in rows]
        except Exception: db.rollback(); return []

@app.get("/api/v1/vendors/", tags=["procurement"])
def get_vendors_list(limit: int = 100):
    from sqlalchemy import text, create_engine
    from sqlalchemy.orm import Session
    import os
    eng = create_engine(os.environ.get("DATABASE_URL","postgresql+psycopg2://ai:ai123@localhost:5432/triangle_black"))
    with Session(eng) as db:
        try:
            rows = db.execute(text("SELECT * FROM vendors WHERE blacklisted=false ORDER BY rating DESC, company_name LIMIT :l"), {"l": limit}).fetchall()
            return [dict(r._mapping) for r in rows]
        except Exception: db.rollback(); return []

@app.get("/api/v1/rfq/", tags=["procurement"])
def get_rfq_list(limit: int = 50):
    from sqlalchemy import text, create_engine
    from sqlalchemy.orm import Session
    import os
    eng = create_engine(os.environ.get("DATABASE_URL","postgresql+psycopg2://ai:ai123@localhost:5432/triangle_black"))
    with Session(eng) as db:
        try:
            rows = db.execute(text("SELECT * FROM rfq_headers ORDER BY created_at DESC LIMIT :l"), {"l": limit}).fetchall()
            return [dict(r._mapping) for r in rows]
        except Exception: db.rollback(); return []

@app.get("/api/v1/purchase-orders-v2/", tags=["procurement"])
def get_pos_v2_list(limit: int = 100):
    from sqlalchemy import text, create_engine
    from sqlalchemy.orm import Session
    import os
    eng = create_engine(os.environ.get("DATABASE_URL","postgresql+psycopg2://ai:ai123@localhost:5432/triangle_black"))
    with Session(eng) as db:
        try:
            rows = db.execute(text("""
                SELECT po.*, v.company_name as vendor_name
                FROM purchase_orders_v2 po
                LEFT JOIN vendors v ON v.id = po.vendor_id
                ORDER BY po.created_at DESC LIMIT :l
            """), {"l": limit}).fetchall()
            return [dict(r._mapping) for r in rows]
        except Exception: db.rollback(); return []

@app.get("/api/v1/approval-requests/", tags=["procurement"])
def get_approvals_list(limit: int = 50):
    from sqlalchemy import text, create_engine
    from sqlalchemy.orm import Session
    import os
    eng = create_engine(os.environ.get("DATABASE_URL","postgresql+psycopg2://ai:ai123@localhost:5432/triangle_black"))
    with Session(eng) as db:
        try:
            rows = db.execute(text("SELECT * FROM approval_requests ORDER BY created_at DESC LIMIT :l"), {"l": limit}).fetchall()
            return [dict(r._mapping) for r in rows]
        except Exception: db.rollback(); return []

@app.get("/api/v1/procurement/dashboard", tags=["procurement"])
def get_procurement_dashboard():
    from sqlalchemy import text, create_engine
    from sqlalchemy.orm import Session
    import os
    eng = create_engine(os.environ.get("DATABASE_URL","postgresql+psycopg2://ai:ai123@localhost:5432/triangle_black"))
    with Session(eng) as db:
        def safe(q, p=None):
            try:
                r = db.execute(text(q), p or {}).fetchone()
                return dict(r._mapping) if r else {}
            except:
                db.rollback(); return {}
        return {
            "sow": safe("SELECT count(*) as total, count(*) FILTER (WHERE status='pending_approval') as pending, count(*) FILTER (WHERE status='approved') as approved FROM scope_of_work"),
            "vendors": safe("SELECT count(*) as total, count(*) FILTER (WHERE is_approved=true) as approved FROM vendors"),
            "rfqs": safe("SELECT count(*) as total, count(*) FILTER (WHERE status='sent') as active, count(*) FILTER (WHERE status='responses_received') as with_quotes FROM rfq_headers"),
            "pos": safe("SELECT count(*) as total, count(*) FILTER (WHERE status='approved') as approved, COALESCE(sum(total_amount),0) as total_value FROM purchase_orders_v2"),
            "approvals": safe("SELECT count(*) as total, count(*) FILTER (WHERE status='pending') as pending FROM approval_requests"),
            "grns": safe("SELECT count(*) as total FROM goods_receipt_notes"),
        }

# ── SPRINT 247: DETAIL + CREATE + BID COMPARISON ENDPOINTS ───────────────────

@app.get("/api/v1/vendors/{vendor_id}", tags=["procurement"])
def get_vendor(vendor_id: str):
    from sqlalchemy import text, create_engine
    from sqlalchemy.orm import Session
    import os
    eng = create_engine(os.environ.get("DATABASE_URL","postgresql+psycopg2://ai:ai123@localhost:5432/triangle_black"))
    with Session(eng) as db:
        try:
            v = db.execute(text("SELECT * FROM vendors WHERE id=:id"), {"id": vendor_id}).fetchone()
            if not v:
                from fastapi import HTTPException; raise HTTPException(404, "Vendor not found")
            pos = db.execute(text("""
                SELECT po.id, po.po_number, po.title, po.status, po.total_amount, po.currency, po.created_at
                FROM purchase_orders_v2 po WHERE po.vendor_id=:id ORDER BY po.created_at DESC LIMIT 10
            """), {"id": vendor_id}).fetchall()
            return {**dict(v._mapping), "purchase_orders": [dict(r._mapping) for r in pos]}
        except Exception as e:
            if "404" in str(e): raise
            return {"error": str(e)}

@app.post("/api/v1/vendors/", tags=["procurement"])
async def create_vendor(request: Request):
    from sqlalchemy import text, create_engine
    from sqlalchemy.orm import Session
    import os
    body = await request.json()
    eng = create_engine(os.environ.get("DATABASE_URL","postgresql+psycopg2://ai:ai123@localhost:5432/triangle_black"))
    with Session(eng) as db:
        try:
            count = db.execute(text("SELECT count(*)+1 FROM vendors")).scalar()
            code = f"VND-{str(count).zfill(3)}"
            db.execute(text("""
                INSERT INTO vendors (id, vendor_code, company_name, category, contact_person, email, phone,
                    city, country, payment_terms, currency, is_approved, notes)
                VALUES (gen_random_uuid()::text, :code, :name, :cat, :contact, :email, :phone,
                    :city, :country, :terms, :currency, false, :notes)
            """), {
                "code": code, "name": body.get("company_name",""), "cat": body.get("category","General"),
                "contact": body.get("contact_person",""), "email": body.get("email",""),
                "phone": body.get("phone",""), "city": body.get("city","Cairo"),
                "country": body.get("country","Egypt"), "terms": body.get("payment_terms",30),
                "currency": body.get("currency","EGP"), "notes": body.get("notes","")
            })
            db.commit()
            row = db.execute(text("SELECT * FROM vendors WHERE vendor_code=:c"), {"c": code}).fetchone()
            return dict(row._mapping)
        except Exception as e:
            db.rollback(); return {"error": str(e)}

@app.patch("/api/v1/vendors/{vendor_id}", tags=["procurement"])
async def update_vendor(vendor_id: str, request: Request):
    from sqlalchemy import text, create_engine
    from sqlalchemy.orm import Session
    import os
    body = await request.json()
    eng = create_engine(os.environ.get("DATABASE_URL","postgresql+psycopg2://ai:ai123@localhost:5432/triangle_black"))
    with Session(eng) as db:
        try:
            allowed = ["company_name","category","contact_person","email","phone","city","country",
                       "payment_terms","currency","rating","is_approved","approved_by","notes",
                       "bank_name","bank_account","bank_iban","blacklisted","blacklist_reason"]
            updates = {k: v for k,v in body.items() if k in allowed}
            if updates:
                if body.get("is_approved") == True and "approved_by" not in updates:
                    updates["approved_by"] = "admin"
                    from datetime import datetime
                    updates["approved_at"] = datetime.utcnow().isoformat()
                set_clause = ", ".join([f"{k}=:{k}" for k in updates])
                updates["id"] = vendor_id
                db.execute(text(f"UPDATE vendors SET {set_clause}, updated_at=NOW() WHERE id=:id"), updates)
                db.commit()
            row = db.execute(text("SELECT * FROM vendors WHERE id=:id"), {"id": vendor_id}).fetchone()
            return dict(row._mapping) if row else {"error": "Not found"}
        except Exception as e:
            db.rollback(); return {"error": str(e)}


@app.get("/api/v1/scope-of-work/{sow_id}", tags=["procurement"])
def get_sow_detail(sow_id: str):
    from sqlalchemy import text, create_engine
    from sqlalchemy.orm import Session
    import os
    eng = create_engine(os.environ.get("DATABASE_URL","postgresql+psycopg2://ai:ai123@localhost:5432/triangle_black"))
    with Session(eng) as db:
        try:
            sow = db.execute(text("SELECT * FROM scope_of_work WHERE id=:id"), {"id": sow_id}).fetchone()
            if not sow:
                from fastapi import HTTPException; raise HTTPException(404, "SOW not found")
            items = db.execute(text("SELECT * FROM boq_items WHERE sow_id=:id ORDER BY item_number"), {"id": sow_id}).fetchall()
            return {**dict(sow._mapping), "boq_items": [dict(i._mapping) for i in items]}
        except Exception as e:
            if "404" in str(e): raise
            return {"error": str(e)}

@app.post("/api/v1/scope-of-work/{sow_id}/approve", tags=["procurement"])
async def approve_sow(sow_id: str, request: Request):
    from sqlalchemy import text, create_engine
    from sqlalchemy.orm import Session
    import os
    body = await request.json()
    eng = create_engine(os.environ.get("DATABASE_URL","postgresql+psycopg2://ai:ai123@localhost:5432/triangle_black"))
    with Session(eng) as db:
        try:
            action = body.get("action","approve")
            status = "approved" if action == "approve" else "rejected"
            db.execute(text("""
                UPDATE scope_of_work SET status=:s, approved_by=:by, approved_at=NOW(), updated_at=NOW()
                WHERE id=:id
            """), {"s": status, "by": body.get("approved_by","admin"), "id": sow_id})
            db.commit()
            row = db.execute(text("SELECT * FROM scope_of_work WHERE id=:id"), {"id": sow_id}).fetchone()
            return dict(row._mapping) if row else {"error": "Not found"}
        except Exception as e:
            db.rollback(); return {"error": str(e)}

@app.patch("/api/v1/scope-of-work/{sow_id}", tags=["procurement"])
async def update_sow(sow_id: str, request: Request):
    from sqlalchemy import text, create_engine
    from sqlalchemy.orm import Session
    import os
    body = await request.json()
    eng = create_engine(os.environ.get("DATABASE_URL","postgresql+psycopg2://ai:ai123@localhost:5432/triangle_black"))
    with Session(eng) as db:
        try:
            allowed = ["title","description","type","status","client_name","client_email","currency",
                       "estimated_days","labor_cost","materials_cost","overhead_pct","profit_margin_pct",
                       "total_cost","scope_details","exclusions","assumptions","notes","validity_days"]
            updates = {k: v for k,v in body.items() if k in allowed}
            if updates:
                set_clause = ", ".join([f"{k}=:{k}" for k in updates])
                updates["id"] = sow_id
                db.execute(text(f"UPDATE scope_of_work SET {set_clause}, updated_at=NOW() WHERE id=:id"), updates)
                db.commit()
            row = db.execute(text("SELECT * FROM scope_of_work WHERE id=:id"), {"id": sow_id}).fetchone()
            items = db.execute(text("SELECT * FROM boq_items WHERE sow_id=:id ORDER BY item_number"), {"id": sow_id}).fetchall()
            return {**dict(row._mapping), "boq_items": [dict(i._mapping) for i in items]} if row else {"error": "Not found"}
        except Exception as e:
            db.rollback(); return {"error": str(e)}

@app.post("/api/v1/scope-of-work/{sow_id}/boq-items", tags=["procurement"])
async def add_boq_item(sow_id: str, request: Request):
    from sqlalchemy import text, create_engine
    from sqlalchemy.orm import Session
    import os
    body = await request.json()
    eng = create_engine(os.environ.get("DATABASE_URL","postgresql+psycopg2://ai:ai123@localhost:5432/triangle_black"))
    with Session(eng) as db:
        try:
            count = db.execute(text("SELECT count(*)+1 FROM boq_items WHERE sow_id=:id"), {"id": sow_id}).scalar()
            db.execute(text("""
                INSERT INTO boq_items (id, sow_id, item_number, description, unit, quantity, unit_rate, category, notes)
                VALUES (gen_random_uuid()::text, :sow, :num, :desc, :unit, :qty, :rate, :cat, :notes)
            """), {
                "sow": sow_id, "num": count, "desc": body.get("description","Item"),
                "unit": body.get("unit","unit"), "qty": body.get("quantity",1),
                "rate": body.get("unit_rate",0), "cat": body.get("category","material"),
                "notes": body.get("notes","")
            })
            db.commit()
            items = db.execute(text("SELECT * FROM boq_items WHERE sow_id=:id ORDER BY item_number"), {"id": sow_id}).fetchall()
            return [dict(i._mapping) for i in items]
        except Exception as e:
            db.rollback(); return {"error": str(e)}

@app.get("/api/v1/rfq/{rfq_id}/bid-comparison", tags=["procurement"])
def bid_comparison(rfq_id: str):
    from sqlalchemy import text, create_engine
    from sqlalchemy.orm import Session
    import os
    eng = create_engine(os.environ.get("DATABASE_URL","postgresql+psycopg2://ai:ai123@localhost:5432/triangle_black"))
    with Session(eng) as db:
        try:
            rfq = db.execute(text("SELECT * FROM rfq_headers WHERE id=:id"), {"id": rfq_id}).fetchone()
            if not rfq:
                from fastapi import HTTPException; raise HTTPException(404, "RFQ not found")
            items = db.execute(text("SELECT * FROM rfq_items WHERE rfq_id=:id ORDER BY item_number"), {"id": rfq_id}).fetchall()
            quotations = db.execute(text("""
                SELECT vq.*, v.company_name as vendor_name, v.rating as vendor_rating,
                       v.payment_terms as vendor_payment_terms
                FROM vendor_quotations vq
                LEFT JOIN vendors v ON v.id = vq.vendor_id
                WHERE vq.rfq_id=:id ORDER BY vq.total_amount ASC
            """), {"id": rfq_id}).fetchall()
            q_details = []
            for q in quotations:
                q_items = db.execute(text("""
                    SELECT qi.*, ri.description as rfq_description
                    FROM quotation_items qi
                    LEFT JOIN rfq_items ri ON ri.id = qi.rfq_item_id
                    WHERE qi.quotation_id=:id
                """), {"id": q.id}).fetchall()
                q_details.append({**dict(q._mapping), "items": [dict(i._mapping) for i in q_items]})
            return {
                **dict(rfq._mapping),
                "rfq_items": [dict(i._mapping) for i in items],
                "quotations": q_details,
                "lowest_price": min([q.get("total_amount",0) for q in [dict(q._mapping) for q in quotations]], default=0),
                "quotation_count": len(quotations)
            }
        except Exception as e:
            if "404" in str(e): raise
            return {"error": str(e)}

@app.post("/api/v1/rfq/{rfq_id}/award", tags=["procurement"])
async def award_rfq(rfq_id: str, request: Request):
    from sqlalchemy import text, create_engine
    from sqlalchemy.orm import Session
    import os
    body = await request.json()
    eng = create_engine(os.environ.get("DATABASE_URL","postgresql+psycopg2://ai:ai123@localhost:5432/triangle_black"))
    with Session(eng) as db:
        try:
            vendor_id = body.get("vendor_id")
            quotation_id = body.get("quotation_id")
            db.execute(text("""
                UPDATE rfq_headers SET status='awarded', awarded_vendor_id=:vid,
                awarded_at=NOW(), approved_by=:by, updated_at=NOW() WHERE id=:id
            """), {"vid": vendor_id, "by": body.get("awarded_by","admin"), "id": rfq_id})
            if quotation_id:
                db.execute(text("UPDATE vendor_quotations SET is_selected=true WHERE id=:id"), {"id": quotation_id})
                db.execute(text("UPDATE vendor_quotations SET is_selected=false WHERE rfq_id=:rid AND id!=:id"), {"rid": rfq_id, "id": quotation_id})
            db.commit()
            return {"status": "awarded", "rfq_id": rfq_id, "vendor_id": vendor_id}
        except Exception as e:
            db.rollback(); return {"error": str(e)}

@app.post("/api/v1/purchase-orders-v2/", tags=["procurement"])
async def create_po_v2(request: Request):
    from sqlalchemy import text, create_engine
    from sqlalchemy.orm import Session
    import os
    body = await request.json()
    eng = create_engine(os.environ.get("DATABASE_URL","postgresql+psycopg2://ai:ai123@localhost:5432/triangle_black"))
    with Session(eng) as db:
        try:
            count = db.execute(text("SELECT count(*)+1 FROM purchase_orders_v2")).scalar()
            po_number = f"PO-{str(count).zfill(5)}"
            db.execute(text("""
                INSERT INTO purchase_orders_v2 (id, po_number, title, vendor_id, rfq_id, sow_id,
                    status, po_type, currency, payment_terms, delivery_address, subtotal,
                    vat_amount, total_amount, prepared_by, internal_notes)
                VALUES (gen_random_uuid()::text, :num, :title, :vendor, :rfq, :sow,
                    'draft', :ptype, :currency, :terms, :addr, :subtotal, :vat, :total, :by, :notes)
            """), {
                "num": po_number, "title": body.get("title","New PO"),
                "vendor": body.get("vendor_id"), "rfq": body.get("rfq_id"),
                "sow": body.get("sow_id"), "ptype": body.get("po_type","standard"),
                "currency": body.get("currency","EGP"), "terms": body.get("payment_terms",30),
                "addr": body.get("delivery_address",""), "subtotal": body.get("subtotal",0),
                "vat": body.get("vat_amount",0), "total": body.get("total_amount",0),
                "by": body.get("prepared_by",""), "notes": body.get("internal_notes","")
            })
            db.commit()
            row = db.execute(text("SELECT * FROM purchase_orders_v2 WHERE po_number=:n"), {"n": po_number}).fetchone()
            return dict(row._mapping)
        except Exception as e:
            db.rollback(); return {"error": str(e)}

@app.post("/api/v1/purchase-orders-v2/{po_id}/line-items", tags=["procurement"])
async def add_po_line_item(po_id: str, request: Request):
    from sqlalchemy import text, create_engine
    from sqlalchemy.orm import Session
    import os
    body = await request.json()
    eng = create_engine(os.environ.get("DATABASE_URL","postgresql+psycopg2://ai:ai123@localhost:5432/triangle_black"))
    with Session(eng) as db:
        try:
            count = db.execute(text("SELECT count(*)+1 FROM po_line_items WHERE po_id=:id"), {"id": po_id}).scalar()
            qty = float(body.get("quantity",1))
            price = float(body.get("unit_price",0))
            disc = float(body.get("discount_pct",0))
            vat = float(body.get("vat_pct",14))
            subtotal = qty * price * (1 - disc/100)
            vat_amt = subtotal * (vat/100)
            total = subtotal + vat_amt
            db.execute(text("""
                INSERT INTO po_line_items (id, po_id, line_number, description, specification,
                    unit, quantity, unit_price, currency, discount_pct, vat_pct,
                    total_before_vat, vat_amount, total_amount, notes)
                VALUES (gen_random_uuid()::text, :po, :num, :desc, :spec,
                    :unit, :qty, :price, :currency, :disc, :vat,
                    :subtotal, :vat_amt, :total, :notes)
            """), {
                "po": po_id, "num": count, "desc": body.get("description","Item"),
                "spec": body.get("specification",""), "unit": body.get("unit","unit"),
                "qty": qty, "price": price, "currency": body.get("currency","EGP"),
                "disc": disc, "vat": vat, "subtotal": subtotal, "vat_amt": vat_amt,
                "total": total, "notes": body.get("notes","")
            })
            new_total = db.execute(text("SELECT COALESCE(sum(total_amount),0) FROM po_line_items WHERE po_id=:id"), {"id": po_id}).scalar()
            db.execute(text("UPDATE purchase_orders_v2 SET total_amount=:t, updated_at=NOW() WHERE id=:id"), {"t": new_total, "id": po_id})
            db.commit()
            items = db.execute(text("SELECT * FROM po_line_items WHERE po_id=:id ORDER BY line_number"), {"id": po_id}).fetchall()
            return [dict(i._mapping) for i in items]
        except Exception as e:
            db.rollback(); return {"error": str(e)}

@app.patch("/api/v1/purchase-orders-v2/{po_id}/line-items/{line_id}", tags=["procurement"])
async def update_po_line_item(po_id: str, line_id: str, request: Request):
    from sqlalchemy import text, create_engine
    from sqlalchemy.orm import Session
    import os
    body = await request.json()
    eng = create_engine(os.environ.get("DATABASE_URL","postgresql+psycopg2://ai:ai123@localhost:5432/triangle_black"))
    with Session(eng) as db:
        try:
            qty = float(body.get("quantity",1))
            price = float(body.get("unit_price",0))
            disc = float(body.get("discount_pct",0))
            vat = float(body.get("vat_pct",14))
            subtotal = qty * price * (1 - disc/100)
            vat_amt = subtotal * (vat/100)
            total = subtotal + vat_amt
            db.execute(text("""
                UPDATE po_line_items SET description=:desc, unit=:unit, quantity=:qty,
                    unit_price=:price, discount_pct=:disc, vat_pct=:vat,
                    total_before_vat=:subtotal, vat_amount=:vat_amt, total_amount=:total,
                    notes=:notes
                WHERE id=:id AND po_id=:po
            """), {
                "desc": body.get("description",""), "unit": body.get("unit","unit"),
                "qty": qty, "price": price, "disc": disc, "vat": vat,
                "subtotal": subtotal, "vat_amt": vat_amt, "total": total,
                "notes": body.get("notes",""), "id": line_id, "po": po_id
            })
            new_total = db.execute(text("SELECT COALESCE(sum(total_amount),0) FROM po_line_items WHERE po_id=:id"), {"id": po_id}).scalar()
            db.execute(text("UPDATE purchase_orders_v2 SET total_amount=:t, updated_at=NOW() WHERE id=:id"), {"t": new_total, "id": po_id})
            db.commit()
            items = db.execute(text("SELECT * FROM po_line_items WHERE po_id=:id ORDER BY line_number"), {"id": po_id}).fetchall()
            return [dict(i._mapping) for i in items]
        except Exception as e:
            db.rollback(); return {"error": str(e)}

@app.post("/api/v1/goods-receipt-notes/", tags=["procurement"])
async def create_grn(request: Request):
    from sqlalchemy import text, create_engine
    from sqlalchemy.orm import Session
    import os
    body = await request.json()
    eng = create_engine(os.environ.get("DATABASE_URL","postgresql+psycopg2://ai:ai123@localhost:5432/triangle_black"))
    with Session(eng) as db:
        try:
            count = db.execute(text("SELECT count(*)+1 FROM goods_receipt_notes")).scalar()
            grn_number = f"GRN-{str(count).zfill(5)}"
            db.execute(text("""
                INSERT INTO goods_receipt_notes (id, grn_number, po_id, vendor_id, status,
                    received_by, delivery_note_no, vehicle_no, inspection_passed, warehouse_id, notes)
                VALUES (gen_random_uuid()::text, :num, :po, :vendor, 'received',
                    :by, :dn, :vehicle, :passed, :wh, :notes)
            """), {
                "num": grn_number, "po": body.get("po_id"), "vendor": body.get("vendor_id"),
                "by": body.get("received_by","admin"), "dn": body.get("delivery_note_no",""),
                "vehicle": body.get("vehicle_no",""), "passed": body.get("inspection_passed",True),
                "wh": body.get("warehouse_id",""), "notes": body.get("notes","")
            })
            db.commit()
            row = db.execute(text("SELECT * FROM goods_receipt_notes WHERE grn_number=:n"), {"n": grn_number}).fetchone()
            grn_id = row.id
            for item in body.get("items",[]):
                db.execute(text("""
                    INSERT INTO grn_items (id, grn_id, po_line_item_id, description,
                        ordered_qty, received_qty, accepted_qty, rejected_qty, unit_price, total_value, notes)
                    VALUES (gen_random_uuid()::text, :grn, :po_line, :desc,
                        :oqty, :rqty, :aqty, :rejqty, :price, :total, :notes)
                """), {
                    "grn": grn_id, "po_line": item.get("po_line_item_id"),
                    "desc": item.get("description",""), "oqty": item.get("ordered_qty",0),
                    "rqty": item.get("received_qty",0), "aqty": item.get("accepted_qty",0),
                    "rejqty": item.get("rejected_qty",0), "price": item.get("unit_price",0),
                    "total": item.get("total_value",0), "notes": item.get("notes","")
                })
            db.commit()
            return dict(row._mapping)
        except Exception as e:
            db.rollback(); return {"error": str(e)}

@app.get("/api/v1/goods-receipt-notes/", tags=["procurement"])
def list_grns(limit: int = 50):
    from sqlalchemy import text, create_engine
    from sqlalchemy.orm import Session
    import os
    eng = create_engine(os.environ.get("DATABASE_URL","postgresql+psycopg2://ai:ai123@localhost:5432/triangle_black"))
    with Session(eng) as db:
        try:
            rows = db.execute(text("""
                SELECT g.*, v.company_name as vendor_name, p.po_number
                FROM goods_receipt_notes g
                LEFT JOIN vendors v ON v.id = g.vendor_id
                LEFT JOIN purchase_orders_v2 p ON p.id = g.po_id
                ORDER BY g.created_at DESC LIMIT :l
            """), {"l": limit}).fetchall()
            return [dict(r._mapping) for r in rows]
        except Exception as e:
            db.rollback(); return []



@app.post("/api/v1/debug/upload-test", tags=["debug"], include_in_schema=False)
async def debug_upload(request: Request):
    """Debug endpoint to test multipart parsing"""
    try:
        ct = request.headers.get("content-type", "")
        form = await request.form()
        keys = list(form.keys())
        file_obj = form.get("file")
        return {
            "content_type": ct,
            "form_keys": keys,
            "has_file": bool(file_obj),
            "file_name": getattr(file_obj, "filename", None) if file_obj else None,
            "status": "form parsed OK"
        }
    except Exception as e:
        return {"error": str(e), "content_type": request.headers.get("content-type", "")}

# ── SPRINT 248: UNIVERSAL DOCUMENT ATTACHMENT SYSTEM ─────────────────────────

UPLOAD_BASE = "/home/amr/AI-COMPANY-OS/11-WORKSPACES/triangle-black/uploads"
ALLOWED_EXT   = {".pdf",".png",".jpg",".jpeg",".docx",".xlsx"}
MAX_FILE_SIZE = 10 * 1024 * 1024  # 10MB
REQUIRED_VENDOR_DOCS = {"trade_license", "tax_card"}
DOC_CATEGORIES = {
    "vendor": ["trade_license","commercial_reg","tax_card","bank_letter","iso_cert","insurance","portfolio","nda","other"],
    "purchase_request": ["technical_spec","quote","approval_email","delivery_note","inspection_report","invoice","other"],
    "purchase_orders_v2": ["technical_spec","quote","approval_email","delivery_note","inspection_report","invoice","po_document","other"],
    "sow": ["scope_document","client_approval","technical_drawing","other"],
    "grn": ["delivery_note","inspection_report","packing_list","other"],
}

@app.post("/api/v1/documents/v2/upload", tags=["documents"])
async def upload_document(request: Request):
    """Upload a document for any entity: vendor, purchase_orders_v2, sow, grn"""
    import os, uuid
    from sqlalchemy import text, create_engine
    from sqlalchemy.orm import Session
    from fastapi import HTTPException

    try:
        form = await request.form()
    except Exception as e:
        return {"error": f"Failed to parse form: {str(e)}"}

    entity_type  = str(form.get("entity_type") or "")
    entity_id    = str(form.get("entity_id") or "")
    doc_category = str(form.get("doc_category") or "other")
    doc_name     = str(form.get("doc_name") or "")
    uploaded_by  = str(form.get("uploaded_by") or "")
    notes        = str(form.get("notes") or "")
    hotel_id     = str(form.get("hotel_id") or "tb-default-hotel-000000000001")
    file_obj     = form.get("file")

    if not entity_type or not entity_id:
        return {"error": "entity_type and entity_id are required"}
    if not file_obj or not hasattr(file_obj, "filename"):
        return {"error": "No file provided or invalid file field"}

    ext = Path(file_obj.filename).suffix.lower()
    if ext not in ALLOWED_EXT:
        return {"error": f"File type {ext} not allowed. Allowed: {sorted(ALLOWED_EXT)}"}

    contents = await file_obj.read()
    if len(contents) > MAX_FILE_SIZE:
        return {"error": "File too large. Max 10MB."}

    folder_map = {
        "vendor": "vendors",
        "purchase_request": "purchase-requests",
        "purchase_orders_v2": "purchase-orders",
        "sow": "sow",
        "grn": "grn",
    }
    folder = folder_map.get(entity_type, entity_type)
    upload_dir = Path(UPLOAD_BASE) / hotel_id / folder / entity_id
    upload_dir.mkdir(parents=True, exist_ok=True)

    unique_name = f"{uuid.uuid4().hex[:8]}_{file_obj.filename}"
    file_path = upload_dir / unique_name
    file_path.write_bytes(contents)

    eng = create_engine(os.environ.get("DATABASE_URL","postgresql+psycopg2://ai:ai123@localhost:5432/triangle_black"))
    with Session(eng) as db:
        try:
            is_req = doc_category in REQUIRED_VENDOR_DOCS and entity_type == "vendor"
            doc_id = str(uuid.uuid4())
            db.execute(text("""
                INSERT INTO entity_documents
                  (id, hotel_id, entity_type, entity_id, doc_category, doc_name,
                   file_name, file_path, file_size_bytes, mime_type, is_required,
                   uploaded_by, notes)
                VALUES
                  (:id, :hotel_id, :et, :eid, :cat, :name,
                   :fname, :fpath, :fsize, :mime, :req,
                   :by, :notes)
            """), {
                "id": doc_id, "hotel_id": hotel_id,
                "et": entity_type, "eid": entity_id,
                "cat": doc_category,
                "name": doc_name or file_obj.filename,
                "fname": unique_name,
                "fpath": str(file_path),
                "fsize": len(contents),
                "mime": getattr(file_obj, "content_type", "application/octet-stream") or "application/octet-stream",
                "req": is_req,
                "by": uploaded_by,
                "notes": notes,
            })
            db.commit()
            return {
                "id": doc_id,
                "doc_name": doc_name or file_obj.filename,
                "file_name": unique_name,
                "file_size_bytes": len(contents),
                "file_size_kb": round(len(contents)/1024, 1),
                "doc_category": doc_category,
                "entity_type": entity_type,
                "entity_id": entity_id,
                "is_required": is_req,
                "url": f"/api/v1/documents/{doc_id}/view",
            }
        except Exception as e:
            db.rollback()
            if file_path.exists(): file_path.unlink()
            return {"error": str(e)}

@app.get("/api/v1/documents/", tags=["documents"])
def list_documents(entity_type: str, entity_id: str):
    import os
    from sqlalchemy import text, create_engine
    from sqlalchemy.orm import Session
    eng = create_engine(os.environ.get("DATABASE_URL","postgresql+psycopg2://ai:ai123@localhost:5432/triangle_black"))
    with Session(eng) as db:
        try:
            rows = db.execute(text("""
                SELECT id, doc_category, doc_name, file_name, file_size_bytes,
                       mime_type, is_required, is_verified, uploaded_by, notes, created_at
                FROM entity_documents
                WHERE entity_type=:et AND entity_id=:eid
                ORDER BY doc_category, created_at DESC
            """), {"et": entity_type, "eid": entity_id}).fetchall()
            docs = [dict(r._mapping) for r in rows]
            for d in docs:
                d["url"] = f"/api/v1/documents/{d['id']}/view"
                d["file_size_kb"] = round((d.get("file_size_bytes") or 0) / 1024, 1)
            return docs
        except Exception as e:
            db.rollback(); return []

@app.get("/api/v1/documents/{doc_id}/view", tags=["documents"])
def view_document(doc_id: str):
    import os
    from sqlalchemy import text, create_engine
    from sqlalchemy.orm import Session
    from fastapi.responses import FileResponse
    from fastapi import HTTPException
    eng = create_engine(os.environ.get("DATABASE_URL","postgresql+psycopg2://ai:ai123@localhost:5432/triangle_black"))
    with Session(eng) as db:
        try:
            row = db.execute(text("SELECT file_path, file_name, mime_type FROM entity_documents WHERE id=:id"), {"id": doc_id}).fetchone()
            if not row: raise HTTPException(404, "Document not found")
            fp = Path(row.file_path)
            if not fp.exists(): raise HTTPException(404, "File missing from disk")
            return FileResponse(
                path=str(fp),
                filename=row.file_name,
                media_type=row.mime_type or "application/octet-stream",
                headers={"Content-Disposition": f"inline; filename={row.file_name}"}
            )
        except HTTPException: raise
        except Exception as e: raise HTTPException(500, str(e))

@app.delete("/api/v1/documents/v2/{doc_id}", tags=["documents"])
def delete_document(doc_id: str):
    import os
    from sqlalchemy import text, create_engine
    from sqlalchemy.orm import Session
    eng = create_engine(os.environ.get("DATABASE_URL","postgresql+psycopg2://ai:ai123@localhost:5432/triangle_black"))
    with Session(eng) as db:
        try:
            row = db.execute(text("SELECT file_path FROM entity_documents WHERE id=:id"), {"id": doc_id}).fetchone()
            if not row:
                from fastapi import HTTPException; raise HTTPException(404, "Not found")
            fp = Path(row.file_path)
            if fp.exists(): fp.unlink()
            db.execute(text("DELETE FROM entity_documents WHERE id=:id"), {"id": doc_id})
            db.commit()
            return {"status": "deleted", "id": doc_id}
        except Exception as e:
            db.rollback(); return {"error": str(e)}

@app.get("/api/v1/vendors/{vendor_id}/doc-status", tags=["documents"])
def vendor_doc_status(vendor_id: str):
    import os
    from sqlalchemy import text, create_engine
    from sqlalchemy.orm import Session
    eng = create_engine(os.environ.get("DATABASE_URL","postgresql+psycopg2://ai:ai123@localhost:5432/triangle_black"))
    with Session(eng) as db:
        try:
            rows = db.execute(text("""
                SELECT doc_category, count(*) as cnt
                FROM entity_documents
                WHERE entity_type='vendor' AND entity_id=:id
                GROUP BY doc_category
            """), {"id": vendor_id}).fetchall()
            uploaded = {r.doc_category: r.cnt for r in rows}
            required = list(REQUIRED_VENDOR_DOCS)
            missing  = [c for c in required if c not in uploaded]
            return {
                "vendor_id": vendor_id,
                "required": required,
                "uploaded_categories": list(uploaded.keys()),
                "missing_required": missing,
                "approval_ready": len(missing) == 0,
                "total_documents": sum(uploaded.values()),
            }
        except Exception as e:
            db.rollback(); return {"error": str(e)}

@app.get("/api/v1/documents/categories", tags=["documents"])
def get_doc_categories(entity_type: str = "vendor"):
    return {"entity_type": entity_type, "categories": DOC_CATEGORIES.get(entity_type, ["other"])}

# ── SPRINT 249: INVOICE MATCHING SYSTEM ──────────────────────────────────────

@app.get("/api/v1/supplier-invoices/", tags=["invoices"])
def list_invoices(status: str = None, limit: int = 50):
    import os
    from sqlalchemy import text, create_engine
    from sqlalchemy.orm import Session
    eng = create_engine(os.environ.get("DATABASE_URL","postgresql+psycopg2://ai:ai123@localhost:5432/triangle_black"))
    with Session(eng) as db:
        try:
            where = "WHERE si.status=:s" if status else ""
            params = {"s": status} if status else {}
            params["l"] = limit
            rows = db.execute(text(f"""
                SELECT si.*, v.company_name as vendor_name, v.email as vendor_email,
                       po.po_number
                FROM supplier_invoices si
                LEFT JOIN vendors v ON v.id = si.vendor_id
                LEFT JOIN purchase_orders_v2 po ON po.id = si.po_id
                {where}
                ORDER BY si.created_at DESC LIMIT :l
            """), params).fetchall()
            return [dict(r._mapping) for r in rows]
        except Exception as e:
            db.rollback(); return []

@app.get("/api/v1/supplier-invoices/dashboard", tags=["invoices"])
def invoice_dashboard():
    import os
    from sqlalchemy import text, create_engine
    from sqlalchemy.orm import Session
    eng = create_engine(os.environ.get("DATABASE_URL","postgresql+psycopg2://ai:ai123@localhost:5432/triangle_black"))
    with Session(eng) as db:
        def safe(q):
            try: r = db.execute(text(q)).fetchone(); return dict(r._mapping) if r else {}
            except: db.rollback(); return {}
        return {
            "totals": safe("SELECT count(*) as total, COALESCE(sum(total_amount),0) as total_value, COALESCE(sum(balance_due),0) as total_outstanding FROM supplier_invoices"),
            "by_status": {
                "draft": safe("SELECT count(*) as n FROM supplier_invoices WHERE status='draft'").get("n",0),
                "submitted": safe("SELECT count(*) as n FROM supplier_invoices WHERE status='submitted'").get("n",0),
                "approved": safe("SELECT count(*) as n FROM supplier_invoices WHERE status='approved'").get("n",0),
                "paid": safe("SELECT count(*) as n FROM supplier_invoices WHERE status='paid'").get("n",0),
                "mismatch": safe("SELECT count(*) as n FROM supplier_invoices WHERE match_result='mismatch'").get("n",0),
            },
            "overdue": safe("SELECT count(*) as n, COALESCE(sum(balance_due),0) as amount FROM supplier_invoices WHERE due_date < CURRENT_DATE AND payment_status != 'paid'"),
        }


@app.get("/api/v1/supplier-invoices/{invoice_id}", tags=["invoices"])
def get_invoice(invoice_id: str):
    import os
    from sqlalchemy import text, create_engine
    from sqlalchemy.orm import Session
    from fastapi import HTTPException
    eng = create_engine(os.environ.get("DATABASE_URL","postgresql+psycopg2://ai:ai123@localhost:5432/triangle_black"))
    with Session(eng) as db:
        try:
            inv = db.execute(text("""
                SELECT si.*, v.company_name as vendor_name, v.email as vendor_email,
                       v.phone as vendor_phone, po.po_number, po.total_amount as po_total_amount
                FROM supplier_invoices si
                LEFT JOIN vendors v ON v.id = si.vendor_id
                LEFT JOIN purchase_orders_v2 po ON po.id = si.po_id
                WHERE si.id=:id
            """), {"id": invoice_id}).fetchone()
            if not inv: raise HTTPException(404, "Invoice not found")
            lines = db.execute(text("""
                SELECT il.*, pol.description as po_description
                FROM invoice_line_items il
                LEFT JOIN po_line_items pol ON pol.id = il.po_line_item_id
                WHERE il.invoice_id=:id ORDER BY il.line_number
            """), {"id": invoice_id}).fetchall()
            payments = db.execute(text("""
                SELECT * FROM invoice_payments WHERE invoice_id=:id ORDER BY created_at DESC
            """), {"id": invoice_id}).fetchall()
            return {
                **dict(inv._mapping),
                "line_items": [dict(l._mapping) for l in lines],
                "payments": [dict(p._mapping) for p in payments]
            }
        except HTTPException: raise
        except Exception as e: return {"error": str(e)}

@app.post("/api/v1/supplier-invoices/", tags=["invoices"])
async def create_invoice(request: Request):
    import os, uuid
    from sqlalchemy import text, create_engine
    from sqlalchemy.orm import Session
    body = await request.json()
    eng = create_engine(os.environ.get("DATABASE_URL","postgresql+psycopg2://ai:ai123@localhost:5432/triangle_black"))
    with Session(eng) as db:
        try:
            count = db.execute(text("SELECT count(*)+1 FROM supplier_invoices")).scalar()
            inv_number = f"INV-{str(count).zfill(5)}"
            subtotal = float(body.get("subtotal", 0))
            vat_pct = float(body.get("vat_pct", 14))
            wht_pct = float(body.get("withholding_tax_pct", 0))
            vat_amt = subtotal * (vat_pct / 100)
            wht_amt = subtotal * (wht_pct / 100)
            total = subtotal + vat_amt
            net_payable = total - wht_amt
            db.execute(text("""
                INSERT INTO supplier_invoices
                  (id, invoice_number, vendor_invoice_number, vendor_id, po_id, grn_id,
                   status, invoice_date, due_date, currency, exchange_rate,
                   subtotal, vat_pct, vat_amount, withholding_tax_pct, withholding_tax_amount,
                   total_amount, net_payable, po_total, grn_total,
                   submitted_by, payment_status, balance_due, notes)
                VALUES
                  (:id, :num, :vnum, :vendor, :po, :grn,
                   'submitted', :idate, :ddate, :currency, :xrate,
                   :subtotal, :vat_pct, :vat_amt, :wht_pct, :wht_amt,
                   :total, :net, :po_total, :grn_total,
                   :by, 'unpaid', :net, :notes)
            """), {
                "id": str(uuid.uuid4()), "num": inv_number,
                "vnum": body.get("vendor_invoice_number",""),
                "vendor": body.get("vendor_id"), "po": body.get("po_id"),
                "grn": body.get("grn_id"), "idate": body.get("invoice_date"),
                "ddate": body.get("due_date"), "currency": body.get("currency","EGP"),
                "xrate": body.get("exchange_rate",1), "subtotal": subtotal,
                "vat_pct": vat_pct, "vat_amt": vat_amt, "wht_pct": wht_pct,
                "wht_amt": wht_amt, "total": total, "net": net_payable,
                "po_total": body.get("po_total",0), "grn_total": body.get("grn_total",0),
                "by": body.get("submitted_by",""), "notes": body.get("notes","")
            })
            db.commit()
            row = db.execute(text("SELECT * FROM supplier_invoices WHERE invoice_number=:n"), {"n": inv_number}).fetchone()
            return dict(row._mapping)
        except Exception as e:
            db.rollback(); return {"error": str(e)}

@app.post("/api/v1/supplier-invoices/{invoice_id}/match", tags=["invoices"])
def run_three_way_match(invoice_id: str):
    """Run 3-way match: Invoice vs PO vs GRN"""
    import os
    from sqlalchemy import text, create_engine
    from sqlalchemy.orm import Session
    eng = create_engine(os.environ.get("DATABASE_URL","postgresql+psycopg2://ai:ai123@localhost:5432/triangle_black"))
    with Session(eng) as db:
        try:
            inv = db.execute(text("SELECT * FROM supplier_invoices WHERE id=:id"), {"id": invoice_id}).fetchone()
            if not inv:
                from fastapi import HTTPException; raise HTTPException(404, "Invoice not found")
            inv_dict = dict(inv._mapping)
            invoice_total = float(inv_dict.get("total_amount") or 0)
            po_total = float(inv_dict.get("po_total") or 0)
            grn_total = float(inv_dict.get("grn_total") or 0)
            TOLERANCE = 0.02  # 2%
            issues = []
            if po_total > 0:
                variance_po = abs(invoice_total - po_total) / po_total
                if variance_po > TOLERANCE:
                    issues.append(f"Invoice ({invoice_total:,.0f}) vs PO ({po_total:,.0f}): {variance_po*100:.1f}% variance")
            if grn_total > 0:
                variance_grn = abs(invoice_total - grn_total) / grn_total
                if variance_grn > TOLERANCE:
                    issues.append(f"Invoice ({invoice_total:,.0f}) vs GRN ({grn_total:,.0f}): {variance_grn*100:.1f}% variance")
            if not issues:
                match_result = "matched"
                match_notes = "3-way match passed — Invoice, PO, and GRN amounts within tolerance"
            elif len(issues) == 1 and po_total == 0:
                match_result = "partial"
                match_notes = "Partial match — no PO linked"
            else:
                match_result = "mismatch"
                match_notes = "; ".join(issues)
            variance_pct = 0
            if po_total > 0:
                variance_pct = round(abs(invoice_total - po_total) / po_total * 100, 2)
            db.execute(text("""
                UPDATE supplier_invoices
                SET match_result=:mr, match_notes=:mn, match_variance_pct=:vp,
                    status=CASE WHEN :mr='matched' THEN 'matching' ELSE 'mismatch' END,
                    updated_at=NOW()
                WHERE id=:id
            """), {"mr": match_result, "mn": match_notes, "vp": variance_pct, "id": invoice_id})
            db.commit()
            return {
                "invoice_id": invoice_id,
                "match_result": match_result,
                "match_notes": match_notes,
                "variance_pct": variance_pct,
                "invoice_total": invoice_total,
                "po_total": po_total,
                "grn_total": grn_total,
                "approved_for_payment": match_result == "matched"
            }
        except Exception as e:
            db.rollback(); return {"error": str(e)}

@app.post("/api/v1/supplier-invoices/{invoice_id}/approve", tags=["invoices"])
async def approve_invoice(invoice_id: str, request: Request):
    import os
    from sqlalchemy import text, create_engine
    from sqlalchemy.orm import Session
    body = await request.json()
    eng = create_engine(os.environ.get("DATABASE_URL","postgresql+psycopg2://ai:ai123@localhost:5432/triangle_black"))
    with Session(eng) as db:
        try:
            action = body.get("action","approve")
            status = "approved" if action == "approve" else "rejected"
            db.execute(text("""
                UPDATE supplier_invoices
                SET status=:s, approved_by=:by, approved_at=NOW(),
                    rejection_reason=:reason, updated_at=NOW()
                WHERE id=:id
            """), {"s": status, "by": body.get("approved_by","admin"),
                   "reason": body.get("rejection_reason",""), "id": invoice_id})
            db.commit()
            row = db.execute(text("SELECT * FROM supplier_invoices WHERE id=:id"), {"id": invoice_id}).fetchone()
            return dict(row._mapping) if row else {"error": "Not found"}
        except Exception as e:
            db.rollback(); return {"error": str(e)}

@app.post("/api/v1/supplier-invoices/{invoice_id}/pay", tags=["invoices"])
async def record_payment(invoice_id: str, request: Request):
    import os, uuid
    from sqlalchemy import text, create_engine
    from sqlalchemy.orm import Session
    body = await request.json()
    eng = create_engine(os.environ.get("DATABASE_URL","postgresql+psycopg2://ai:ai123@localhost:5432/triangle_black"))
    with Session(eng) as db:
        try:
            amount = float(body.get("amount", 0))
            db.execute(text("""
                INSERT INTO invoice_payments
                  (id, invoice_id, vendor_id, payment_date, amount, currency,
                   payment_method, reference_number, bank_account, notes, recorded_by)
                VALUES
                  (:id, :inv, :vendor, :pdate, :amount, :currency,
                   :method, :ref, :bank, :notes, :by)
            """), {
                "id": str(uuid.uuid4()), "inv": invoice_id,
                "vendor": body.get("vendor_id",""), "pdate": body.get("payment_date"),
                "amount": amount, "currency": body.get("currency","EGP"),
                "method": body.get("payment_method","bank_transfer"),
                "ref": body.get("reference_number",""),
                "bank": body.get("bank_account",""),
                "notes": body.get("notes",""), "by": body.get("recorded_by","admin")
            })
            total_paid_row = db.execute(text("""
                SELECT COALESCE(sum(amount),0) as total_paid
                FROM invoice_payments WHERE invoice_id=:id
            """), {"id": invoice_id}).fetchone()
            total_paid = float(total_paid_row.total_paid)
            inv_row = db.execute(text("SELECT net_payable FROM supplier_invoices WHERE id=:id"), {"id": invoice_id}).fetchone()
            net_payable = float(inv_row.net_payable) if inv_row else 0
            balance = max(0, net_payable - total_paid)
            pay_status = "paid" if balance <= 0 else "partial"
            db.execute(text("""
                UPDATE supplier_invoices
                SET amount_paid=:paid, balance_due=:balance,
                    payment_status=:ps, status=CASE WHEN :ps='paid' THEN 'paid' ELSE status END,
                    updated_at=NOW()
                WHERE id=:id
            """), {"paid": total_paid, "balance": balance, "ps": pay_status, "id": invoice_id})
            db.commit()
            return {
                "invoice_id": invoice_id, "amount_paid": amount,
                "total_paid": total_paid, "balance_due": balance,
                "payment_status": pay_status
            }
        except Exception as e:
            db.rollback(); return {"error": str(e)}

# ── LEADS PORTAL — Public endpoint (no auth required, used by commercial pages) ──
@app.get("/api/v1/leads-portal-v2", tags=["commercial"], include_in_schema=False)
def leads_portal_v2(limit: int = 100):
    """Public leads list for portal pages"""
    import os
    from sqlalchemy import text, create_engine
    from sqlalchemy.orm import Session
    eng = create_engine(os.environ.get("DATABASE_URL","postgresql+psycopg2://ai:ai123@localhost:5432/triangle_black"))
    with Session(eng) as db:
        try:
            rows = db.execute(text("""
                SELECT id, title, name, company, email, phone, status, stage,
                       value, currency, hotel_id, created_at, updated_at
                FROM leads
                ORDER BY created_at DESC LIMIT :l
            """), {"l": limit}).fetchall()
            return [dict(r._mapping) for r in rows]
        except Exception as e:
            db.rollback()
            return []

@app.get("/api/v1/leads-portal-v2/{lead_id}", tags=["commercial"], include_in_schema=False)
def get_lead_portal_v2(lead_id: str):
    """Public lead detail for portal pages"""
    import os
    from sqlalchemy import text, create_engine
    from sqlalchemy.orm import Session
    from fastapi import HTTPException
    eng = create_engine(os.environ.get("DATABASE_URL","postgresql+psycopg2://ai:ai123@localhost:5432/triangle_black"))
    with Session(eng) as db:
        try:
            row = db.execute(text("SELECT * FROM leads WHERE id=:id"), {"id": lead_id}).fetchone()
            if not row:
                raise HTTPException(404, "Lead not found")
            return dict(row._mapping)
        except HTTPException: raise
        except Exception as e:
            return {"error": str(e)}

# ── SPRINT 251: UNIVERSAL DELETE ENDPOINTS ────────────────────────────────────

@app.delete("/api/v1/work-orders/{wo_id}", tags=["operations"])
def delete_work_order(wo_id: str):
    import os
    from sqlalchemy import text, create_engine
    from sqlalchemy.orm import Session
    eng = create_engine(os.environ.get("DATABASE_URL","postgresql+psycopg2://ai:ai123@localhost:5432/triangle_black"))
    with Session(eng) as db:
        try:
            row = db.execute(text("SELECT id FROM work_orders WHERE id=:id"), {"id": wo_id}).fetchone()
            if not row:
                from fastapi import HTTPException; raise HTTPException(404, "Work order not found")
            db.execute(text("DELETE FROM work_orders WHERE id=:id"), {"id": wo_id})
            db.commit()
            return {"status": "deleted", "id": wo_id}
        except Exception as e:
            db.rollback(); return {"error": str(e)}

@app.delete("/api/v1/service-requests/{sr_id}", tags=["operations"])
def delete_service_request(sr_id: str):
    import os
    from sqlalchemy import text, create_engine
    from sqlalchemy.orm import Session
    eng = create_engine(os.environ.get("DATABASE_URL","postgresql+psycopg2://ai:ai123@localhost:5432/triangle_black"))
    with Session(eng) as db:
        try:
            db.execute(text("DELETE FROM service_requests WHERE id=:id"), {"id": sr_id})
            db.commit()
            return {"status": "deleted", "id": sr_id}
        except Exception as e:
            db.rollback(); return {"error": str(e)}

@app.delete("/api/v1/assets/{asset_id}", tags=["operations"])
def delete_asset(asset_id: str):
    import os
    from sqlalchemy import text, create_engine
    from sqlalchemy.orm import Session
    eng = create_engine(os.environ.get("DATABASE_URL","postgresql+psycopg2://ai:ai123@localhost:5432/triangle_black"))
    with Session(eng) as db:
        try:
            db.execute(text("DELETE FROM assets WHERE id=:id"), {"id": asset_id})
            db.commit()
            return {"status": "deleted", "id": asset_id}
        except Exception as e:
            db.rollback(); return {"error": str(e)}

@app.delete("/api/v1/vendors/v2/{vendor_id}", tags=["procurement"])
def delete_vendor(vendor_id: str):
    import os
    from sqlalchemy import text, create_engine
    from sqlalchemy.orm import Session
    eng = create_engine(os.environ.get("DATABASE_URL","postgresql+psycopg2://ai:ai123@localhost:5432/triangle_black"))
    with Session(eng) as db:
        try:
            db.execute(text("DELETE FROM vendors WHERE id=:id"), {"id": vendor_id})
            db.commit()
            return {"status": "deleted", "id": vendor_id}
        except Exception as e:
            db.rollback(); return {"error": str(e)}

@app.delete("/api/v1/scope-of-work/v2/{sow_id}", tags=["procurement"])
def delete_sow(sow_id: str):
    import os
    from sqlalchemy import text, create_engine
    from sqlalchemy.orm import Session
    eng = create_engine(os.environ.get("DATABASE_URL","postgresql+psycopg2://ai:ai123@localhost:5432/triangle_black"))
    with Session(eng) as db:
        try:
            db.execute(text("DELETE FROM scope_of_work WHERE id=:id"), {"id": sow_id})
            db.commit()
            return {"status": "deleted", "id": sow_id}
        except Exception as e:
            db.rollback(); return {"error": str(e)}

@app.delete("/api/v1/supplier-invoices/v2/{invoice_id}", tags=["invoices"])
def delete_invoice(invoice_id: str):
    import os
    from sqlalchemy import text, create_engine
    from sqlalchemy.orm import Session
    eng = create_engine(os.environ.get("DATABASE_URL","postgresql+psycopg2://ai:ai123@localhost:5432/triangle_black"))
    with Session(eng) as db:
        try:
            db.execute(text("DELETE FROM supplier_invoices WHERE id=:id"), {"id": invoice_id})
            db.commit()
            return {"status": "deleted", "id": invoice_id}
        except Exception as e:
            db.rollback(); return {"error": str(e)}

@app.delete("/api/v1/purchase-orders-v2/v2/{po_id}", tags=["procurement"])
def delete_po(po_id: str):
    import os
    from sqlalchemy import text, create_engine
    from sqlalchemy.orm import Session
    eng = create_engine(os.environ.get("DATABASE_URL","postgresql+psycopg2://ai:ai123@localhost:5432/triangle_black"))
    with Session(eng) as db:
        try:
            db.execute(text("DELETE FROM po_line_items WHERE po_id=:id"), {"id": po_id})
            db.execute(text("DELETE FROM purchase_orders_v2 WHERE id=:id"), {"id": po_id})
            db.commit()
            return {"status": "deleted", "id": po_id}
        except Exception as e:
            db.rollback(); return {"error": str(e)}

# ── SPRINT 252: EXECUTIVE DASHBOARD ──────────────────────────────────────────

@app.get("/api/v1/executive/dashboard", tags=["executive"])
def executive_dashboard():
    """Real-time executive KPIs for Triangle Black"""
    import os
    from sqlalchemy import text, create_engine
    from sqlalchemy.orm import Session
    from datetime import datetime
    eng = create_engine(os.environ.get("DATABASE_URL","postgresql+psycopg2://ai:ai123@localhost:5432/triangle_black"))
    with Session(eng) as db:
        def safe(q, p=None):
            try:
                r = db.execute(text(q), p or {}).fetchone()
                return dict(r._mapping) if r else {}
            except: db.rollback(); return {}
        def safe_list(q, p=None):
            try:
                rows = db.execute(text(q), p or {}).fetchall()
                return [dict(r._mapping) for r in rows]
            except: db.rollback(); return []

        # Work Orders KPIs
        wo_summary = safe("""
            SELECT
              count(*) as total,
              count(*) FILTER (WHERE status='open') as open_count,
              count(*) FILTER (WHERE status='in_progress') as in_progress,
              count(*) FILTER (WHERE status='completed') as completed,
              count(*) FILTER (WHERE priority='critical' AND status != 'completed') as critical_open,
              count(*) FILTER (WHERE due_date < NOW() AND status NOT IN ('completed','cancelled')) as overdue
            FROM work_orders
        """)

        # Service Requests KPIs
        sr_summary = safe("""
            SELECT
              count(*) as total,
              count(*) FILTER (WHERE status='open') as open_count,
              count(*) FILTER (WHERE urgency='critical') as critical,
              count(*) FILTER (WHERE urgency='high') as high_urgency
            FROM service_requests
        """)

        # Financial KPIs
        invoice_summary = safe("""
            SELECT
              count(*) as total,
              COALESCE(sum(total_amount),0) as total_value,
              COALESCE(sum(balance_due),0) as outstanding,
              COALESCE(sum(amount_paid),0) as collected,
              count(*) FILTER (WHERE payment_status='unpaid') as unpaid_count,
              count(*) FILTER (WHERE payment_status='paid') as paid_count,
              count(*) FILTER (WHERE due_date < CURRENT_DATE AND payment_status != 'paid') as overdue_count
            FROM supplier_invoices
        """)

        # Procurement KPIs
        vendor_summary = safe("""
            SELECT count(*) as total, count(*) FILTER (WHERE is_approved=true) as approved
            FROM vendors
        """)
        po_summary = safe("""
            SELECT
              count(*) as total,
              count(*) FILTER (WHERE status='pending_approval') as pending,
              COALESCE(sum(total_amount),0) as total_value
            FROM purchase_orders_v2
        """)

        # Project KPIs
        project_summary = safe("""
            SELECT
              count(*) as total,
              count(*) FILTER (WHERE status='active') as active,
              COALESCE(sum(budget),0) as total_budget,
              COALESCE(avg(completion_pct),0) as avg_completion
            FROM projects
        """)

        # Asset KPIs
        asset_summary = safe("""
            SELECT
              count(*) as total,
              count(*) FILTER (WHERE status='operational') as operational,
              count(*) FILTER (WHERE status='under_maintenance') as under_maintenance,
              count(*) FILTER (WHERE next_maintenance_date < NOW()) as overdue_maintenance
            FROM assets
        """)

        # Technician KPIs
        tech_summary = safe("""
            SELECT count(*) as total, count(*) FILTER (WHERE is_active=true) as active
            FROM technicians
        """)

        # Critical Work Orders (top 5)
        critical_wos = safe_list("""
            SELECT wo.id, wo.title, wo.priority, wo.status, wo.due_date,
                   t.name as technician_name, s.name as site_name
            FROM work_orders wo
            LEFT JOIN technicians t ON t.id = wo.technician_id
            LEFT JOIN sites s ON s.id = wo.site_id
            WHERE wo.priority = 'critical' AND wo.status != 'completed'
            ORDER BY wo.created_at DESC LIMIT 5
        """)

        # Outstanding Invoices (top 3)
        outstanding_invoices = safe_list("""
            SELECT id, invoice_number, vendor_invoice_number, balance_due, due_date, status
            FROM supplier_invoices
            WHERE payment_status != 'paid' AND balance_due > 0
            ORDER BY due_date ASC LIMIT 3
        """)

        # Recent Service Requests
        recent_srs = safe_list("""
            SELECT id, title, urgency, status, created_at,
                   site_id
            FROM service_requests
            WHERE status = 'open'
            ORDER BY CASE urgency WHEN 'critical' THEN 1 WHEN 'high' THEN 2 WHEN 'medium' THEN 3 ELSE 4 END,
                     created_at DESC
            LIMIT 5
        """)

        # Assets needing maintenance
        maintenance_due = safe_list("""
            SELECT id, name, category, status, next_maintenance_date, site_id
            FROM assets
            WHERE next_maintenance_date < NOW() + INTERVAL '7 days'
            ORDER BY next_maintenance_date ASC LIMIT 5
        """)

        # Revenue by month (last 6 months)
        revenue_trend = safe_list("""
            SELECT
              DATE_TRUNC('month', created_at) as month,
              COALESCE(sum(total_amount),0) as invoiced,
              COALESCE(sum(amount_paid),0) as collected
            FROM supplier_invoices
            WHERE created_at > NOW() - INTERVAL '6 months'
            GROUP BY DATE_TRUNC('month', created_at)
            ORDER BY month
        """)

        return {
            "generated_at": datetime.utcnow().isoformat(),
            "operations": {
                "work_orders": wo_summary,
                "service_requests": sr_summary,
                "assets": asset_summary,
                "technicians": tech_summary,
                "critical_work_orders": critical_wos,
                "recent_service_requests": recent_srs,
                "maintenance_due": maintenance_due,
            },
            "financial": {
                "invoices": invoice_summary,
                "vendors": vendor_summary,
                "purchase_orders": po_summary,
                "projects": project_summary,
                "outstanding_invoices": outstanding_invoices,
                "revenue_trend": revenue_trend,
            },
            "alerts": {
                "critical_wos": wo_summary.get("critical_open", 0),
                "overdue_wos": wo_summary.get("overdue", 0),
                "overdue_invoices": invoice_summary.get("overdue_count", 0),
                "maintenance_overdue": asset_summary.get("overdue_maintenance", 0),
                "total_alerts": (
                    (wo_summary.get("critical_open") or 0) +
                    (wo_summary.get("overdue") or 0) +
                    (invoice_summary.get("overdue_count") or 0)
                ),
            },
        }

# ── SPRINT 253: UNIVERSAL REPORT ENGINE ──────────────────────────────────────

@app.get("/api/v1/report-engine/catalog", tags=["reports"])
def reports_catalog():
    """List all available reports with metadata"""
    return {
        "reports": [
            {"id":"work_orders","category":"Operations","label":"Work Orders Report",
             "description":"All work orders with status, priority, technician, site, dates",
             "filters":["status","priority","site_id","technician_id","date_from","date_to"]},
            {"id":"service_requests","category":"Operations","label":"Service Requests Report",
             "description":"Service requests by urgency, category, status, site",
             "filters":["status","urgency","site_id","date_from","date_to"]},
            {"id":"asset_maintenance","category":"Operations","label":"Asset Maintenance Report",
             "description":"Assets with maintenance schedule, overdue, status",
             "filters":["site_id","category","status"]},
            {"id":"technician_productivity","category":"Operations","label":"Technician Productivity",
             "description":"Work orders completed per technician with status breakdown",
             "filters":["technician_id","date_from","date_to"]},
            {"id":"invoices","category":"Financial","label":"Invoice Report",
             "description":"All invoices with payment status, match result, vendor, amounts",
             "filters":["status","payment_status","vendor_id","date_from","date_to"]},
            {"id":"invoice_aging","category":"Financial","label":"Invoice Aging Report",
             "description":"Outstanding invoices grouped by aging bucket (current/30/60/90+ days)",
             "filters":["vendor_id"]},
            {"id":"purchase_orders","category":"Procurement","label":"Purchase Orders Report",
             "description":"POs with vendor, status, line items, totals, delivery status",
             "filters":["status","vendor_id","date_from","date_to"]},
            {"id":"vendor_performance","category":"Procurement","label":"Vendor Performance Report",
             "description":"Vendor ratings, PO count, invoice totals, approval status",
             "filters":["category","is_approved"]},
            {"id":"scope_of_work","category":"Engineering","label":"Scope of Work / BOQ Report",
             "description":"SOWs with BOQ breakdown, costs, approval status",
             "filters":["status","type","date_from","date_to"]},
            {"id":"rfq_comparison","category":"Procurement","label":"RFQ & Bid Comparison",
             "description":"RFQs with all quotations, lowest bid, awarded vendor",
             "filters":["status","date_from","date_to"]},
            {"id":"project_status","category":"Engineering","label":"Project Status Report",
             "description":"Projects with budget, completion %, manager, timeline",
             "filters":["status"]},
            {"id":"executive_summary","category":"Executive","label":"Executive Summary Report",
             "description":"KPIs across all modules — operations, financial, procurement",
             "filters":["date_from","date_to"]},
        ]
    }

@app.get("/api/v1/report-engine/{report_type}", tags=["reports"])
def generate_report(
    report_type: str,
    status: str = None,
    priority: str = None,
    urgency: str = None,
    site_id: str = None,
    technician_id: str = None,
    vendor_id: str = None,
    category: str = None,
    payment_status: str = None,
    is_approved: str = None,
    date_from: str = None,
    date_to: str = None,
    limit: int = 500
):
    """Universal report endpoint — returns structured data + summary stats"""
    import os
    from sqlalchemy import text, create_engine
    from sqlalchemy.orm import Session
    from datetime import datetime, timedelta
    eng = create_engine(os.environ.get("DATABASE_URL","postgresql+psycopg2://ai:ai123@localhost:5432/triangle_black"))
    with Session(eng) as db:
        def q(sql, params=None):
            try:
                rows = db.execute(text(sql), params or {}).fetchall()
                return [dict(r._mapping) for r in rows]
            except Exception as e:
                db.rollback(); return []
        def q1(sql, params=None):
            try:
                r = db.execute(text(sql), params or {}).fetchone()
                return dict(r._mapping) if r else {}
            except: db.rollback(); return {}

        # Date filter helper
        def date_filter(col, df=date_from, dt=date_to):
            parts = []
            p = {}
            if df:
                parts.append(f"{col} >= :df"); p["df"] = df
            if dt:
                parts.append(f"{col} <= :dt"); p["dt"] = dt
            return (" AND " + " AND ".join(parts)) if parts else "", p

        report_id = report_type.replace("-","_")

        # ── WORK ORDERS ────────────────────────────────────────────────────────
        if report_id == "work_orders":
            where, params = ["1=1"], {}
            if status: where.append("wo.status=:status"); params["status"]=status
            if priority: where.append("wo.priority=:priority"); params["priority"]=priority
            if site_id: where.append("wo.site_id=:site_id"); params["site_id"]=site_id
            if technician_id: where.append("wo.technician_id=:tech"); params["tech"]=technician_id
            if date_from: where.append("wo.created_at>=:df"); params["df"]=date_from
            if date_to: where.append("wo.created_at<=:dt"); params["dt"]=date_to
            params["l"] = limit
            data = q(f"""
                SELECT wo.id, wo.title, wo.type, wo.priority, wo.status,
                       wo.created_at, wo.due_date, wo.started_at, wo.completed_at,
                       t.name as technician_name, s.name as site_name,
                       a.name as asset_name, a.category as asset_category
                FROM work_orders wo
                LEFT JOIN technicians t ON t.id = wo.technician_id
                LEFT JOIN sites s ON s.id = wo.site_id
                LEFT JOIN assets a ON a.id = wo.asset_id
                WHERE {" AND ".join(where)}
                ORDER BY CASE wo.priority WHEN 'critical' THEN 1 WHEN 'high' THEN 2 WHEN 'medium' THEN 3 ELSE 4 END,
                         wo.created_at DESC
                LIMIT :l
            """, params)
            summary = q1("""
                SELECT count(*) as total,
                  count(*) FILTER (WHERE status='open') as open_count,
                  count(*) FILTER (WHERE status='in_progress') as in_progress,
                  count(*) FILTER (WHERE status='completed') as completed,
                  count(*) FILTER (WHERE priority='critical') as critical,
                  count(*) FILTER (WHERE priority='high') as high_priority
                FROM work_orders
            """)
            return {"report_type":report_id,"generated_at":datetime.utcnow().isoformat(),
                    "record_count":len(data),"summary":summary,"columns":["title","type","priority","status","technician_name","site_name","due_date","created_at"],"data":data}

        # ── SERVICE REQUESTS ───────────────────────────────────────────────────
        elif report_id == "service_requests":
            where, params = ["1=1"], {}
            if status: where.append("sr.status=:s"); params["s"]=status
            if urgency: where.append("sr.urgency=:u"); params["u"]=urgency
            if site_id: where.append("sr.site_id=:sid"); params["sid"]=site_id
            if date_from: where.append("sr.created_at>=:df"); params["df"]=date_from
            if date_to: where.append("sr.created_at<=:dt"); params["dt"]=date_to
            params["l"] = limit
            data = q(f"""
                SELECT sr.id, sr.title, sr.urgency, sr.status, sr.category,
                       sr.submitted_by, sr.contact_phone, sr.created_at, sr.resolved_at,
                       s.name as site_name
                FROM service_requests sr
                LEFT JOIN sites s ON s.id = sr.site_id
                WHERE {" AND ".join(where)}
                ORDER BY CASE sr.urgency WHEN 'critical' THEN 1 WHEN 'high' THEN 2 WHEN 'medium' THEN 3 ELSE 4 END,
                         sr.created_at DESC LIMIT :l
            """, params)
            summary = q1("SELECT count(*) as total, count(*) FILTER (WHERE status='open') as open_count, count(*) FILTER (WHERE urgency='critical') as critical FROM service_requests")
            return {"report_type":report_id,"generated_at":datetime.utcnow().isoformat(),
                    "record_count":len(data),"summary":summary,
                    "columns":["title","urgency","status","category","submitted_by","site_name","created_at","resolved_at"],"data":data}

        # ── ASSET MAINTENANCE ──────────────────────────────────────────────────
        elif report_id == "asset_maintenance":
            where, params = ["1=1"], {}
            if site_id: where.append("a.site_id=:sid"); params["sid"]=site_id
            if category: where.append("a.category=:cat"); params["cat"]=category
            if status: where.append("a.status=:s"); params["s"]=status
            params["l"] = limit
            data = q(f"""
                SELECT a.id, a.name, a.category, a.manufacturer, a.model,
                       a.status, a.criticality, a.location_description,
                       a.last_maintenance_date, a.next_maintenance_date,
                       s.name as site_name,
                       CASE WHEN a.next_maintenance_date < NOW() THEN 'OVERDUE'
                            WHEN a.next_maintenance_date < NOW()+INTERVAL '30 days' THEN 'DUE SOON'
                            ELSE 'OK' END as maintenance_status
                FROM assets a
                LEFT JOIN sites s ON s.id = a.site_id
                WHERE {" AND ".join(where)}
                ORDER BY a.next_maintenance_date ASC LIMIT :l
            """, params)
            summary = q1("""SELECT count(*) as total,
                count(*) FILTER (WHERE next_maintenance_date < NOW()) as overdue,
                count(*) FILTER (WHERE next_maintenance_date BETWEEN NOW() AND NOW()+INTERVAL '30 days') as due_soon,
                count(*) FILTER (WHERE status='operational') as operational,
                count(*) FILTER (WHERE status='under_maintenance') as under_maintenance
                FROM assets""")
            return {"report_type":report_id,"generated_at":datetime.utcnow().isoformat(),
                    "record_count":len(data),"summary":summary,
                    "columns":["name","category","manufacturer","status","criticality","site_name","last_maintenance_date","next_maintenance_date","maintenance_status"],"data":data}

        # ── TECHNICIAN PRODUCTIVITY ────────────────────────────────────────────
        elif report_id == "technician_productivity":
            params = {}
            if date_from: params["df"]=date_from
            if date_to: params["dt"]=date_to
            date_clause = ""
            if date_from: date_clause += " AND wo.created_at >= :df"
            if date_to: date_clause += " AND wo.created_at <= :dt"
            data = q(f"""
                SELECT t.id, t.name, t.specializations, t.is_active,
                       count(wo.id) as total_work_orders,
                       count(wo.id) FILTER (WHERE wo.status='completed') as completed,
                       count(wo.id) FILTER (WHERE wo.status='in_progress') as in_progress,
                       count(wo.id) FILTER (WHERE wo.status='open') as open_orders,
                       count(wo.id) FILTER (WHERE wo.priority='critical') as critical_handled
                FROM technicians t
                LEFT JOIN work_orders wo ON wo.technician_id = t.id {date_clause}
                GROUP BY t.id, t.name, t.specializations, t.is_active
                ORDER BY completed DESC
            """, params)
            return {"report_type":report_id,"generated_at":datetime.utcnow().isoformat(),
                    "record_count":len(data),"summary":{"total_technicians":len(data)},
                    "columns":["name","specializations","total_work_orders","completed","in_progress","open_orders","critical_handled"],"data":data}

        # ── INVOICES ───────────────────────────────────────────────────────────
        elif report_id == "invoices":
            where, params = ["1=1"], {}
            if status: where.append("si.status=:s"); params["s"]=status
            if payment_status: where.append("si.payment_status=:ps"); params["ps"]=payment_status
            if vendor_id: where.append("si.vendor_id=:vid"); params["vid"]=vendor_id
            if date_from: where.append("si.invoice_date>=:df"); params["df"]=date_from
            if date_to: where.append("si.invoice_date<=:dt"); params["dt"]=date_to
            params["l"] = limit
            data = q(f"""
                SELECT si.id, si.invoice_number, si.vendor_invoice_number,
                       si.status, si.payment_status, si.match_result,
                       si.invoice_date, si.due_date, si.currency,
                       si.subtotal, si.vat_amount, si.total_amount,
                       si.amount_paid, si.balance_due, si.net_payable,
                       si.vat_pct, si.withholding_tax_pct,
                       si.approved_by, si.match_variance_pct,
                       v.company_name as vendor_name, v.vendor_code,
                       po.po_number
                FROM supplier_invoices si
                LEFT JOIN vendors v ON v.id = si.vendor_id
                LEFT JOIN purchase_orders_v2 po ON po.id = si.po_id
                WHERE {" AND ".join(where)}
                ORDER BY si.invoice_date DESC LIMIT :l
            """, params)
            summary = q1("""SELECT count(*) as total,
                COALESCE(sum(total_amount),0) as total_value,
                COALESCE(sum(balance_due),0) as total_outstanding,
                COALESCE(sum(amount_paid),0) as total_collected,
                count(*) FILTER (WHERE payment_status='paid') as paid_count,
                count(*) FILTER (WHERE payment_status='unpaid') as unpaid_count,
                count(*) FILTER (WHERE due_date < CURRENT_DATE AND payment_status!='paid') as overdue_count
                FROM supplier_invoices""")
            return {"report_type":report_id,"generated_at":datetime.utcnow().isoformat(),
                    "record_count":len(data),"summary":summary,
                    "columns":["invoice_number","vendor_name","status","payment_status","match_result","invoice_date","due_date","total_amount","amount_paid","balance_due"],"data":data}

        # ── INVOICE AGING ──────────────────────────────────────────────────────
        elif report_id == "invoice_aging":
            data = q("""
                SELECT si.id, si.invoice_number, si.invoice_date, si.due_date,
                       si.total_amount, si.balance_due, si.payment_status,
                       v.company_name as vendor_name, v.vendor_code,
                       CURRENT_DATE - si.due_date::date as days_overdue,
                       CASE
                         WHEN si.payment_status = 'paid' THEN 'Paid'
                         WHEN si.due_date::date >= CURRENT_DATE THEN 'Current'
                         WHEN CURRENT_DATE - si.due_date::date <= 30 THEN '1-30 Days'
                         WHEN CURRENT_DATE - si.due_date::date <= 60 THEN '31-60 Days'
                         WHEN CURRENT_DATE - si.due_date::date <= 90 THEN '61-90 Days'
                         ELSE '90+ Days'
                       END as aging_bucket
                FROM supplier_invoices si
                LEFT JOIN vendors v ON v.id = si.vendor_id
                WHERE si.payment_status != 'paid' AND si.balance_due > 0
                ORDER BY si.due_date ASC
            """)
            aging_summary = q("""
                SELECT
                  CASE
                    WHEN due_date::date >= CURRENT_DATE THEN 'Current'
                    WHEN CURRENT_DATE - due_date::date <= 30 THEN '1-30 Days'
                    WHEN CURRENT_DATE - due_date::date <= 60 THEN '31-60 Days'
                    WHEN CURRENT_DATE - due_date::date <= 90 THEN '61-90 Days'
                    ELSE '90+ Days'
                  END as bucket,
                  count(*) as invoice_count,
                  COALESCE(sum(balance_due),0) as amount
                FROM supplier_invoices
                WHERE payment_status != 'paid' AND balance_due > 0
                GROUP BY bucket ORDER BY bucket
            """)
            return {"report_type":report_id,"generated_at":datetime.utcnow().isoformat(),
                    "record_count":len(data),"aging_summary":aging_summary,
                    "columns":["invoice_number","vendor_name","invoice_date","due_date","balance_due","days_overdue","aging_bucket"],"data":data}

        # ── PURCHASE ORDERS ────────────────────────────────────────────────────
        elif report_id == "purchase_orders":
            where, params = ["1=1"], {}
            if status: where.append("po.status=:s"); params["s"]=status
            if vendor_id: where.append("po.vendor_id=:vid"); params["vid"]=vendor_id
            if date_from: where.append("po.created_at>=:df"); params["df"]=date_from
            if date_to: where.append("po.created_at<=:dt"); params["dt"]=date_to
            params["l"] = limit
            data = q(f"""
                SELECT po.id, po.po_number, po.title, po.status, po.po_type,
                       po.currency, po.subtotal, po.vat_amount, po.total_amount,
                       po.payment_terms, po.delivery_date, po.created_at,
                       po.approved_by, po.approved_at,
                       v.company_name as vendor_name, v.vendor_code,
                       v.category as vendor_category,
                       (SELECT count(*) FROM po_line_items WHERE po_id=po.id) as line_item_count
                FROM purchase_orders_v2 po
                LEFT JOIN vendors v ON v.id = po.vendor_id
                WHERE {" AND ".join(where)}
                ORDER BY po.created_at DESC LIMIT :l
            """, params)
            summary = q1("""SELECT count(*) as total,
                COALESCE(sum(total_amount),0) as total_value,
                count(*) FILTER (WHERE status='approved') as approved,
                count(*) FILTER (WHERE status='pending_approval') as pending,
                count(*) FILTER (WHERE status='received') as received,
                count(*) FILTER (WHERE status='paid') as paid
                FROM purchase_orders_v2""")
            return {"report_type":report_id,"generated_at":datetime.utcnow().isoformat(),
                    "record_count":len(data),"summary":summary,
                    "columns":["po_number","vendor_name","status","currency","total_amount","payment_terms","delivery_date","approved_by","created_at"],"data":data}

        # ── VENDOR PERFORMANCE ─────────────────────────────────────────────────
        elif report_id == "vendor_performance":
            where, params = ["1=1"], {}
            if category: where.append("v.category=:cat"); params["cat"]=category
            if is_approved: where.append("v.is_approved=:ia"); params["ia"]=(is_approved.lower()=="true")
            data = q(f"""
                SELECT v.id, v.vendor_code, v.company_name, v.category,
                       v.is_approved, v.rating, v.payment_terms, v.currency, v.city,
                       v.contact_person, v.email,
                       count(DISTINCT po.id) as total_pos,
                       COALESCE(sum(po.total_amount),0) as total_po_value,
                       count(DISTINCT si.id) as total_invoices,
                       COALESCE(sum(si.total_amount),0) as total_invoiced,
                       COALESCE(sum(si.balance_due),0) as outstanding_amount
                FROM vendors v
                LEFT JOIN purchase_orders_v2 po ON po.vendor_id = v.id
                LEFT JOIN supplier_invoices si ON si.vendor_id = v.id
                WHERE {" AND ".join(where)}
                GROUP BY v.id, v.vendor_code, v.company_name, v.category,
                         v.is_approved, v.rating, v.payment_terms, v.currency, v.city,
                         v.contact_person, v.email
                ORDER BY v.rating DESC, total_pos DESC
            """, params)
            return {"report_type":report_id,"generated_at":datetime.utcnow().isoformat(),
                    "record_count":len(data),
                    "summary":{"total_vendors":len(data),"approved":sum(1 for d in data if d.get("is_approved"))},
                    "columns":["vendor_code","company_name","category","is_approved","rating","total_pos","total_po_value","total_invoices","outstanding_amount"],"data":data}

        # ── SCOPE OF WORK ──────────────────────────────────────────────────────
        elif report_id == "scope_of_work":
            where, params = ["1=1"], {}
            if status: where.append("s.status=:st"); params["st"]=status
            if date_from: where.append("s.created_at>=:df"); params["df"]=date_from
            if date_to: where.append("s.created_at<=:dt"); params["dt"]=date_to
            params["l"] = limit
            data = q(f"""
                SELECT s.id, s.sow_number, s.title, s.type, s.status,
                       s.client_name, s.currency, s.total_cost,
                       s.labor_cost, s.materials_cost, s.overhead_pct, s.profit_margin_pct,
                       s.estimated_days, s.prepared_by, s.approved_by,
                       s.created_at, s.approved_at,
                       (SELECT count(*) FROM boq_items WHERE sow_id=s.id) as boq_item_count,
                       (SELECT COALESCE(sum(total_amount),0) FROM boq_items WHERE sow_id=s.id) as boq_subtotal
                FROM scope_of_work s
                WHERE {" AND ".join(where)}
                ORDER BY s.created_at DESC LIMIT :l
            """, params)
            summary = q1("""SELECT count(*) as total,
                COALESCE(sum(total_cost),0) as total_value,
                count(*) FILTER (WHERE status='approved') as approved,
                count(*) FILTER (WHERE status='pending_approval') as pending
                FROM scope_of_work""")
            return {"report_type":report_id,"generated_at":datetime.utcnow().isoformat(),
                    "record_count":len(data),"summary":summary,
                    "columns":["sow_number","title","type","status","client_name","total_cost","boq_item_count","boq_subtotal","estimated_days","approved_by","created_at"],"data":data}

        # ── RFQ COMPARISON ─────────────────────────────────────────────────────
        elif report_id == "rfq_comparison":
            where, params = ["1=1"], {}
            if status: where.append("rfq.status=:s"); params["s"]=status
            if date_from: where.append("rfq.created_at>=:df"); params["df"]=date_from
            if date_to: where.append("rfq.created_at<=:dt"); params["dt"]=date_to
            params["l"] = limit
            data = q(f"""
                SELECT rfq.id, rfq.rfq_number, rfq.title, rfq.status,
                       rfq.rfq_type, rfq.total_budget, rfq.currency,
                       rfq.submission_deadline, rfq.created_at,
                       rfq.prepared_by, rfq.awarded_vendor_id,
                       (SELECT count(*) FROM vendor_quotations WHERE rfq_id=rfq.id) as quotation_count,
                       (SELECT min(total_amount) FROM vendor_quotations WHERE rfq_id=rfq.id) as lowest_bid,
                       (SELECT max(total_amount) FROM vendor_quotations WHERE rfq_id=rfq.id) as highest_bid,
                       av.company_name as awarded_vendor_name
                FROM rfq_headers rfq
                LEFT JOIN vendors av ON av.id = rfq.awarded_vendor_id
                WHERE {" AND ".join(where)}
                ORDER BY rfq.created_at DESC LIMIT :l
            """, params)
            return {"report_type":report_id,"generated_at":datetime.utcnow().isoformat(),
                    "record_count":len(data),
                    "summary":{"total_rfqs":len(data),"awarded":sum(1 for d in data if d.get("awarded_vendor_id"))},
                    "columns":["rfq_number","title","status","rfq_type","total_budget","quotation_count","lowest_bid","highest_bid","awarded_vendor_name","submission_deadline"],"data":data}

        # ── PROJECT STATUS ─────────────────────────────────────────────────────
        elif report_id == "project_status":
            where, params = ["1=1"], {}
            if status: where.append("p.status=:s"); params["s"]=status
            data = q(f"""
                SELECT p.id, p.title, p.status, p.start_date, p.end_date,
                       p.budget, p.completion_pct,
                       t.name as manager_name,
                       CASE WHEN p.end_date < NOW() AND p.status != 'completed' THEN 'Overdue'
                            WHEN p.end_date < NOW()+INTERVAL '30 days' THEN 'Due Soon'
                            ELSE 'On Track' END as timeline_status
                FROM projects p
                LEFT JOIN technicians t ON t.id = p.manager_id::varchar
                WHERE {" AND ".join(where)}
                ORDER BY p.start_date DESC
            """, params)
            return {"report_type":report_id,"generated_at":datetime.utcnow().isoformat(),
                    "record_count":len(data),
                    "summary":{"total_projects":len(data),"active":sum(1 for d in data if d.get("status")=="active"),
                               "total_budget":sum(float(d.get("budget",0) or 0) for d in data)},
                    "columns":["title","status","start_date","end_date","budget","completion_pct","manager_name","timeline_status"],"data":data}

        # ── EXECUTIVE SUMMARY ──────────────────────────────────────────────────
        elif report_id == "executive_summary":
            params = {}
            if date_from: params["df"]=date_from
            if date_to: params["dt"]=date_to
            date_clause = ""
            if date_from: date_clause += " AND created_at >= :df"
            if date_to: date_clause += " AND created_at <= :dt"
            return {
                "report_type":report_id,
                "generated_at":datetime.utcnow().isoformat(),
                "operations": q1(f"SELECT count(*) as total_wos, count(*) FILTER (WHERE status='open') as open_wos, count(*) FILTER (WHERE priority='critical' AND status!='completed') as critical_wos FROM work_orders WHERE 1=1 {date_clause}", params),
                "service_requests": q1(f"SELECT count(*) as total, count(*) FILTER (WHERE status='open') as open_count FROM service_requests WHERE 1=1 {date_clause}", params),
                "financial": q1("SELECT count(*) as total_invoices, COALESCE(sum(total_amount),0) as total_invoiced, COALESCE(sum(balance_due),0) as outstanding, COALESCE(sum(amount_paid),0) as collected FROM supplier_invoices"),
                "procurement": q1("SELECT count(*) as total_pos, COALESCE(sum(total_amount),0) as total_po_value, count(*) FILTER (WHERE status='approved') as approved_pos FROM purchase_orders_v2"),
                "vendors": q1("SELECT count(*) as total, count(*) FILTER (WHERE is_approved=true) as approved FROM vendors"),
                "assets": q1("SELECT count(*) as total, count(*) FILTER (WHERE status='operational') as operational, count(*) FILTER (WHERE next_maintenance_date < NOW()) as overdue_maintenance FROM assets"),
                "projects": q1("SELECT count(*) as total, COALESCE(sum(budget),0) as total_budget, COALESCE(avg(completion_pct),0) as avg_completion FROM projects WHERE status='active'"),
                "record_count": 1,
                "data": []
            }

        else:
            from fastapi import HTTPException
            raise HTTPException(404, f"Report type '{report_type}' not found. Use /api/v1/reports/catalog to see available reports.")

# ── SPRINT 254: PDF REPORT EXPORT ENGINE ─────────────────────────────────────

def _tb_pdf_header(c, doc_title, doc_subtitle="", doc_number=""):
    """Draw Triangle Black branded header on PDF page"""
    from reportlab.lib import colors
    from reportlab.lib.units import mm
    W = 210*mm
    # Dark header bar
    c.setFillColor(colors.HexColor("#0F172A"))
    c.rect(0, 267*mm, W, 30*mm, fill=1, stroke=0)
    # Company name
    c.setFillColor(colors.HexColor("#F59E0B"))
    c.setFont("Helvetica-Bold", 16)
    c.drawString(15*mm, 281*mm, "TRIANGLE BLACK")
    c.setFillColor(colors.HexColor("#94A3B8"))
    c.setFont("Helvetica", 8)
    c.drawString(15*mm, 275*mm, "Engineering Services — MEP & Facilities Management")
    # Doc number top right
    if doc_number:
        c.setFillColor(colors.HexColor("#60A5FA"))
        c.setFont("Helvetica-Bold", 10)
        c.drawRightString(W-15*mm, 281*mm, doc_number)
    # Document title bar
    c.setFillColor(colors.HexColor("#1E293B"))
    c.rect(0, 253*mm, W, 14*mm, fill=1, stroke=0)
    c.setFillColor(colors.white)
    c.setFont("Helvetica-Bold", 13)
    c.drawString(15*mm, 257*mm, doc_title)
    if doc_subtitle:
        c.setFillColor(colors.HexColor("#94A3B8"))
        c.setFont("Helvetica", 9)
        c.drawRightString(W-15*mm, 257*mm, doc_subtitle)

def _tb_pdf_footer(c, page_num=1):
    """Draw footer on PDF page"""
    from reportlab.lib import colors
    from reportlab.lib.units import mm
    from datetime import datetime
    W = 210*mm
    c.setFillColor(colors.HexColor("#1E293B"))
    c.rect(0, 0, W, 12*mm, fill=1, stroke=0)
    c.setFillColor(colors.HexColor("#94A3B8"))
    c.setFont("Helvetica", 7)
    c.drawString(15*mm, 4*mm, f"Generated: {datetime.utcnow().strftime('%d/%m/%Y %H:%M')} UTC — Triangle Black Engineering Services")
    c.drawRightString(W-15*mm, 4*mm, f"Page {page_num} | CONFIDENTIAL")

def _draw_kv_row(c, y, label, value, label_w=60, page_w=210, mm=None):
    """Draw a key-value row"""
    from reportlab.lib import colors
    from reportlab.lib.units import mm as _mm
    mm = mm or _mm
    c.setFillColor(colors.HexColor("#94A3B8"))
    c.setFont("Helvetica", 8)
    c.drawString(15*mm, y, label)
    c.setFillColor(colors.HexColor("#E2E8F0"))
    c.setFont("Helvetica-Bold", 8)
    c.drawString((15+label_w)*mm, y, str(value) if value else "—")

def _draw_table(c, headers, rows, col_widths, y_start, row_h=7, mm=None):
    """Draw a data table, returns final y position"""
    from reportlab.lib import colors
    from reportlab.lib.units import mm as _mm
    mm = mm or _mm
    x_start = 15*mm
    # Header row
    c.setFillColor(colors.HexColor("#1E3A5F"))
    c.rect(x_start, y_start, sum(w*mm for w in col_widths), row_h*mm, fill=1, stroke=0)
    x = x_start
    for i, (hdr, w) in enumerate(zip(headers, col_widths)):
        c.setFillColor(colors.HexColor("#60A5FA"))
        c.setFont("Helvetica-Bold", 7)
        c.drawString(x+2*mm, y_start+2*mm, str(hdr)[:int(w*1.4)])
        x += w*mm
    y = y_start - row_h*mm
    for ri, row in enumerate(rows):
        if y < 20*mm:
            break
        bg = "#0F172A" if ri%2==0 else "#1E293B"
        c.setFillColor(colors.HexColor(bg))
        c.rect(x_start, y, sum(w*mm for w in col_widths), row_h*mm, fill=1, stroke=0)
        x = x_start
        for val, w in zip(row, col_widths):
            c.setFillColor(colors.HexColor("#E2E8F0"))
            c.setFont("Helvetica", 7)
            s = str(val) if val is not None else "—"
            if len(s) > int(w*1.4): s = s[:int(w*1.4)-1]+"…"
            c.drawString(x+2*mm, y+2*mm, s)
            x += w*mm
        y -= row_h*mm
    return y


@app.get("/api/v1/pdf/purchase-order/{po_id}", tags=["pdf"])
def pdf_purchase_order(po_id: str):
    """Generate PDF for a Purchase Order"""
    import os, io
    from sqlalchemy import text, create_engine
    from sqlalchemy.orm import Session
    from fastapi import HTTPException
    from fastapi.responses import Response
    from reportlab.pdfgen import canvas
    from reportlab.lib.units import mm
    from reportlab.lib import colors
    from datetime import datetime
    eng = create_engine(os.environ.get("DATABASE_URL","postgresql+psycopg2://ai:ai123@localhost:5432/triangle_black"))
    with Session(eng) as db:
        po = db.execute(text("""
            SELECT po.*, v.company_name as vendor_name, v.email as vendor_email,
                   v.phone as vendor_phone, v.city as vendor_city
            FROM purchase_orders_v2 po LEFT JOIN vendors v ON v.id=po.vendor_id
            WHERE po.id=:id
        """), {"id": po_id}).fetchone()
        if not po: raise HTTPException(404, "PO not found")
        lines = db.execute(text("SELECT * FROM po_line_items WHERE po_id=:id ORDER BY line_number"), {"id": po_id}).fetchall()
    buf = io.BytesIO()
    c = canvas.Canvas(buf, pagesize=(210*mm, 297*mm))
    po = dict(po._mapping)
    line_list = [dict(l._mapping) for l in lines]
    _tb_pdf_header(c, "PURCHASE ORDER", f"Status: {po.get('status','').upper()}", po.get('po_number','—'))
    _tb_pdf_footer(c)
    # PO Details
    y = 248*mm
    details = [
        ("PO Number:", po.get('po_number','—')),
        ("Title:", po.get('title','—')),
        ("Vendor:", po.get('vendor_name','—')),
        ("Vendor Email:", po.get('vendor_email','—')),
        ("Currency:", po.get('currency','EGP')),
        ("Payment Terms:", f"{po.get('payment_terms',30)} days"),
        ("Status:", po.get('status','—')),
        ("Approved By:", po.get('approved_by','—')),
        ("Created:", str(po.get('created_at','—'))[:10]),
        ("Delivery Date:", str(po.get('delivery_date','—'))[:10]),
    ]
    for label, val in details:
        _draw_kv_row(c, y, label, val)
        y -= 7*mm
    # Line Items Table
    y -= 5*mm
    c.setFillColor(colors.HexColor("#F59E0B"))
    c.setFont("Helvetica-Bold", 10)
    c.drawString(15*mm, y, "LINE ITEMS")
    y -= 5*mm
    headers = ["#","Description","Unit","Qty","Unit Price","VAT%","Total"]
    col_widths = [10,65,15,15,20,15,20]
    rows = []
    for l in line_list:
        rows.append([l.get('line_number','—'), l.get('description','—')[:45], l.get('unit','unit'),
                     f"{float(l.get('quantity',0)):,.3f}", f"EGP {float(l.get('unit_price',0)):,.2f}",
                     f"{float(l.get('vat_pct',14))}%", f"EGP {float(l.get('total_amount',0)):,.2f}"])
    y = _draw_table(c, headers, rows, col_widths, y)
    # Totals
    y -= 5*mm
    totals = [
        ("Subtotal:", f"EGP {float(po.get('subtotal',0)):,.2f}"),
        ("VAT:", f"EGP {float(po.get('vat_amount',0)):,.2f}"),
        ("GRAND TOTAL:", f"EGP {float(po.get('total_amount',0)):,.2f}"),
    ]
    for label, val in totals:
        c.setFillColor(colors.HexColor("#1E293B"))
        c.rect(130*mm, y-1*mm, 65*mm, 7*mm, fill=1, stroke=0)
        c.setFillColor(colors.HexColor("#94A3B8"))
        c.setFont("Helvetica-Bold", 8)
        c.drawString(132*mm, y+1*mm, label)
        c.setFillColor(colors.HexColor("#34D399") if label=="GRAND TOTAL:" else colors.HexColor("#E2E8F0"))
        c.drawRightString(193*mm, y+1*mm, val)
        y -= 8*mm
    c.save()
    buf.seek(0)
    fname = f"PO_{po.get('po_number','unknown')}_{datetime.utcnow().strftime('%Y%m%d')}.pdf"
    return Response(content=buf.getvalue(), media_type="application/pdf",
                    headers={"Content-Disposition": f"inline; filename={fname}"})


@app.get("/api/v1/pdf/invoice/{invoice_id}", tags=["pdf"])
def pdf_invoice(invoice_id: str):
    """Generate PDF for a Supplier Invoice"""
    import os, io
    from sqlalchemy import text, create_engine
    from sqlalchemy.orm import Session
    from fastapi import HTTPException
    from fastapi.responses import Response
    from reportlab.pdfgen import canvas
    from reportlab.lib.units import mm
    from reportlab.lib import colors
    from datetime import datetime
    eng = create_engine(os.environ.get("DATABASE_URL","postgresql+psycopg2://ai:ai123@localhost:5432/triangle_black"))
    with Session(eng) as db:
        inv = db.execute(text("""
            SELECT si.*, v.company_name as vendor_name, v.email as vendor_email, v.vendor_code
            FROM supplier_invoices si LEFT JOIN vendors v ON v.id=si.vendor_id WHERE si.id=:id
        """), {"id": invoice_id}).fetchone()
        if not inv: raise HTTPException(404, "Invoice not found")
        payments = db.execute(text("SELECT * FROM invoice_payments WHERE invoice_id=:id ORDER BY payment_date"), {"id": invoice_id}).fetchall()
    buf = io.BytesIO()
    c = canvas.Canvas(buf, pagesize=(210*mm, 297*mm))
    inv = dict(inv._mapping)
    pmts = [dict(p._mapping) for p in payments]
    mc = {"matched":"#34D399","mismatch":"#F87171","partial":"#FBBF24","pending":"#94A3B8"}.get(inv.get("match_result","pending"),"#94A3B8")
    _tb_pdf_header(c, "SUPPLIER INVOICE", f"Match: {inv.get('match_result','pending').upper()}", inv.get('invoice_number','—'))
    _tb_pdf_footer(c)
    y = 248*mm
    details = [
        ("Invoice No.:", inv.get('invoice_number','—')),
        ("Vendor Invoice:", inv.get('vendor_invoice_number','—')),
        ("Vendor:", inv.get('vendor_name','—')),
        ("Invoice Date:", str(inv.get('invoice_date','—'))[:10]),
        ("Due Date:", str(inv.get('due_date','—'))[:10]),
        ("Currency:", inv.get('currency','EGP')),
        ("Status:", inv.get('status','—')),
        ("Payment Status:", inv.get('payment_status','—')),
        ("Match Result:", inv.get('match_result','—')),
        ("Approved By:", inv.get('approved_by','—')),
    ]
    for label, val in details:
        _draw_kv_row(c, y, label, val)
        y -= 7*mm
    y -= 5*mm
    c.setFillColor(colors.HexColor("#F59E0B"))
    c.setFont("Helvetica-Bold", 10)
    c.drawString(15*mm, y, "FINANCIAL SUMMARY")
    y -= 5*mm
    fin = [
        ("Subtotal:", f"EGP {float(inv.get('subtotal',0) or 0):,.2f}"),
        (f"VAT ({inv.get('vat_pct',14)}%):", f"EGP {float(inv.get('vat_amount',0) or 0):,.2f}"),
        ("Total Amount:", f"EGP {float(inv.get('total_amount',0) or 0):,.2f}"),
        ("Amount Paid:", f"EGP {float(inv.get('amount_paid',0) or 0):,.2f}"),
        ("Balance Due:", f"EGP {float(inv.get('balance_due',0) or 0):,.2f}"),
    ]
    for label, val in fin:
        is_total = "Balance" in label or "Total Amount" in label
        c.setFillColor(colors.HexColor("#1E293B"))
        c.rect(15*mm, y-1*mm, 180*mm, 7*mm, fill=1, stroke=0)
        c.setFillColor(colors.HexColor("#94A3B8"))
        c.setFont("Helvetica-Bold", 8)
        c.drawString(17*mm, y+1*mm, label)
        c.setFillColor(colors.HexColor("#34D399") if is_total else colors.HexColor("#E2E8F0"))
        c.setFont("Helvetica-Bold" if is_total else "Helvetica", 8)
        c.drawRightString(193*mm, y+1*mm, val)
        y -= 8*mm
    if pmts:
        y -= 5*mm
        c.setFillColor(colors.HexColor("#F59E0B"))
        c.setFont("Helvetica-Bold", 10)
        c.drawString(15*mm, y, "PAYMENT HISTORY")
        y -= 5*mm
        ph = ["Date","Method","Reference","Amount"]
        pw = [30,40,60,30]
        pr = [[str(p.get('payment_date','—'))[:10], p.get('payment_method','—').replace('_',' '),
               p.get('reference_number','—'), f"EGP {float(p.get('amount',0)):,.2f}"] for p in pmts]
        _draw_table(c, ph, pr, pw, y)
    c.save()
    buf.seek(0)
    fname = f"INV_{inv.get('invoice_number','unknown')}_{datetime.utcnow().strftime('%Y%m%d')}.pdf"
    return Response(content=buf.getvalue(), media_type="application/pdf",
                    headers={"Content-Disposition": f"inline; filename={fname}"})


@app.get("/api/v1/pdf/scope-of-work/{sow_id}", tags=["pdf"])
def pdf_sow(sow_id: str):
    """Generate PDF for a Scope of Work / BOQ"""
    import os, io
    from sqlalchemy import text, create_engine
    from sqlalchemy.orm import Session
    from fastapi import HTTPException
    from fastapi.responses import Response
    from reportlab.pdfgen import canvas
    from reportlab.lib.units import mm
    from reportlab.lib import colors
    from datetime import datetime
    eng = create_engine(os.environ.get("DATABASE_URL","postgresql+psycopg2://ai:ai123@localhost:5432/triangle_black"))
    with Session(eng) as db:
        sow = db.execute(text("SELECT * FROM scope_of_work WHERE id=:id"), {"id": sow_id}).fetchone()
        if not sow: raise HTTPException(404, "SOW not found")
        items = db.execute(text("SELECT * FROM boq_items WHERE sow_id=:id ORDER BY item_number"), {"id": sow_id}).fetchall()
    buf = io.BytesIO()
    c = canvas.Canvas(buf, pagesize=(210*mm, 297*mm))
    sow = dict(sow._mapping)
    boq = [dict(i._mapping) for i in items]
    _tb_pdf_header(c, "SCOPE OF WORK", f"Type: {sow.get('type','—').upper()}", sow.get('sow_number','—'))
    _tb_pdf_footer(c)
    y = 248*mm
    for label, val in [
        ("SOW Number:", sow.get('sow_number','—')),
        ("Title:", sow.get('title','—')),
        ("Client:", sow.get('client_name','—')),
        ("Type:", sow.get('type','—')),
        ("Status:", sow.get('status','—')),
        ("Currency:", sow.get('currency','EGP')),
        ("Estimated Days:", str(sow.get('estimated_days',0))),
        ("Prepared By:", sow.get('prepared_by','—')),
        ("Approved By:", sow.get('approved_by','—')),
    ]:
        _draw_kv_row(c, y, label, val)
        y -= 7*mm
    y -= 5*mm
    c.setFillColor(colors.HexColor("#F59E0B"))
    c.setFont("Helvetica-Bold", 10)
    c.drawString(15*mm, y, "BILL OF QUANTITIES")
    y -= 5*mm
    bh = ["#","Description","Unit","Qty","Unit Rate","Total"]
    bw = [10,70,15,15,25,25]
    br = []
    boq_subtotal = 0
    for item in boq:
        t_amt = float(item.get('total_amount',0) or 0)
        boq_subtotal += t_amt
        br.append([item.get('item_number','—'), item.get('description','—')[:50],
                   item.get('unit','unit'), f"{float(item.get('quantity',0)):,.3f}",
                   f"EGP {float(item.get('unit_rate',0)):,.2f}", f"EGP {t_amt:,.2f}"])
    y = _draw_table(c, bh, br, bw, y)
    y -= 5*mm
    overhead = boq_subtotal * (float(sow.get('overhead_pct',15) or 15)/100)
    profit = (boq_subtotal+overhead) * (float(sow.get('profit_margin_pct',10) or 10)/100)
    labor = float(sow.get('labor_cost',0) or 0)
    grand_total = float(sow.get('total_cost',0) or (boq_subtotal+overhead+profit+labor))
    for label, val in [
        ("BOQ Subtotal:", f"EGP {boq_subtotal:,.2f}"),
        (f"Labor Cost:", f"EGP {labor:,.2f}"),
        (f"Overhead ({sow.get('overhead_pct',15)}%):", f"EGP {overhead:,.2f}"),
        (f"Profit ({sow.get('profit_margin_pct',10)}%):", f"EGP {profit:,.2f}"),
        ("GRAND TOTAL:", f"EGP {grand_total:,.2f}"),
    ]:
        c.setFillColor(colors.HexColor("#1E293B"))
        c.rect(130*mm, y-1*mm, 65*mm, 7*mm, fill=1, stroke=0)
        c.setFillColor(colors.HexColor("#94A3B8"))
        c.setFont("Helvetica-Bold", 8)
        c.drawString(132*mm, y+1*mm, label)
        c.setFillColor(colors.HexColor("#34D399") if "TOTAL" in label else colors.HexColor("#E2E8F0"))
        c.drawRightString(193*mm, y+1*mm, val)
        y -= 8*mm
    c.save()
    buf.seek(0)
    fname = f"SOW_{sow.get('sow_number','unknown')}_{datetime.utcnow().strftime('%Y%m%d')}.pdf"
    return Response(content=buf.getvalue(), media_type="application/pdf",
                    headers={"Content-Disposition": f"inline; filename={fname}"})


@app.get("/api/v1/pdf/work-order/{wo_id}", tags=["pdf"])
def pdf_work_order(wo_id: str):
    """Generate PDF for a Work Order"""
    import os, io
    from sqlalchemy import text, create_engine
    from sqlalchemy.orm import Session
    from fastapi import HTTPException
    from fastapi.responses import Response
    from reportlab.pdfgen import canvas
    from reportlab.lib.units import mm
    from reportlab.lib import colors
    from datetime import datetime
    eng = create_engine(os.environ.get("DATABASE_URL","postgresql+psycopg2://ai:ai123@localhost:5432/triangle_black"))
    with Session(eng) as db:
        wo = db.execute(text("""
            SELECT wo.*, t.name as technician_name, t.specializations,
                   s.name as site_name, s.address as site_address,
                   a.name as asset_name, a.category as asset_category, a.model as asset_model
            FROM work_orders wo
            LEFT JOIN technicians t ON t.id=wo.technician_id
            LEFT JOIN sites s ON s.id=wo.site_id
            LEFT JOIN assets a ON a.id=wo.asset_id
            WHERE wo.id=:id
        """), {"id": wo_id}).fetchone()
        if not wo: raise HTTPException(404, "Work order not found")
    buf = io.BytesIO()
    c = canvas.Canvas(buf, pagesize=(210*mm, 297*mm))
    wo = dict(wo._mapping)
    pc = {"critical":"#F87171","high":"#FB923C","medium":"#FBBF24","low":"#34D399"}.get(wo.get("priority","medium"),"#94A3B8")
    _tb_pdf_header(c, "WORK ORDER", f"Priority: {wo.get('priority','—').upper()}", wo.get('id','—')[:12].upper())
    _tb_pdf_footer(c)
    y = 248*mm
    for label, val in [
        ("Title:", wo.get('title','—')),
        ("Type:", wo.get('type','—')),
        ("Priority:", wo.get('priority','—')),
        ("Status:", wo.get('status','—')),
        ("Site:", wo.get('site_name','—')),
        ("Site Address:", wo.get('site_address','—')),
        ("Asset:", wo.get('asset_name','—')),
        ("Asset Category:", wo.get('asset_category','—')),
        ("Technician:", wo.get('technician_name','—')),
        ("Created:", str(wo.get('created_at','—'))[:16]),
        ("Due Date:", str(wo.get('due_date','—'))[:16]),
        ("Started:", str(wo.get('started_at','—'))[:16] if wo.get('started_at') else '—'),
        ("Completed:", str(wo.get('completed_at','—'))[:16] if wo.get('completed_at') else '—'),
    ]:
        _draw_kv_row(c, y, label, val)
        y -= 7*mm
    if wo.get('description'):
        y -= 5*mm
        c.setFillColor(colors.HexColor("#F59E0B"))
        c.setFont("Helvetica-Bold", 10)
        c.drawString(15*mm, y, "DESCRIPTION")
        y -= 5*mm
        c.setFillColor(colors.HexColor("#1E293B"))
        c.rect(15*mm, y-25*mm, 180*mm, 28*mm, fill=1, stroke=0)
        c.setFillColor(colors.HexColor("#E2E8F0"))
        c.setFont("Helvetica", 8)
        desc = wo.get('description','')
        words = desc.split()
        line_str = ""
        ly = y - 5*mm
        for word in words:
            test = (line_str + " " + word).strip()
            if len(test) > 85:
                c.drawString(17*mm, ly, line_str)
                ly -= 5*mm
                line_str = word
                if ly < y-23*mm: break
            else:
                line_str = test
        if line_str:
            c.drawString(17*mm, ly, line_str)
    c.save()
    buf.seek(0)
    fname = f"WO_{wo_id[:8].upper()}_{datetime.utcnow().strftime('%Y%m%d')}.pdf"
    return Response(content=buf.getvalue(), media_type="application/pdf",
                    headers={"Content-Disposition": f"inline; filename={fname}"})


@app.get("/api/v1/pdf/report/{report_type}", tags=["pdf"])
def pdf_report(report_type: str, status: str=None, priority: str=None,
               payment_status: str=None, date_from: str=None, date_to: str=None,
               vendor_id: str=None, site_id: str=None, limit: int=200):
    """Generate PDF for any report type"""
    import os, io, requests as req_lib
    from fastapi.responses import Response
    from reportlab.pdfgen import canvas
    from reportlab.lib.units import mm
    from reportlab.lib import colors
    from datetime import datetime
    params = {}
    if status: params["status"]=status
    if priority: params["priority"]=priority
    if payment_status: params["payment_status"]=payment_status
    if date_from: params["date_from"]=date_from
    if date_to: params["date_to"]=date_to
    if vendor_id: params["vendor_id"]=vendor_id
    if site_id: params["site_id"]=site_id
    params["limit"] = limit
    API_BASE = os.environ.get("REPORT_ENGINE_URL","http://localhost:8030")
    try:
        resp = req_lib.get(f"{API_BASE}/api/v1/report-engine/{report_type}", params=params, timeout=30)
        report_data = resp.json()
    except Exception as e:
        from fastapi import HTTPException
        raise HTTPException(500, f"Failed to fetch report data: {str(e)}")
    rows = report_data.get("data",[])
    columns = report_data.get("columns",[])
    summary = report_data.get("summary",{})
    buf = io.BytesIO()
    c = canvas.Canvas(buf, pagesize=(297*mm, 210*mm))  # Landscape A4
    W, H = 297*mm, 210*mm
    # Header
    c.setFillColor(colors.HexColor("#0F172A"))
    c.rect(0, H-20*mm, W, 20*mm, fill=1, stroke=0)
    c.setFillColor(colors.HexColor("#F59E0B"))
    c.setFont("Helvetica-Bold", 14)
    c.drawString(10*mm, H-13*mm, "TRIANGLE BLACK")
    c.setFillColor(colors.HexColor("#94A3B8"))
    c.setFont("Helvetica", 8)
    c.drawString(10*mm, H-18*mm, "Engineering Services — Report Export")
    title = report_type.replace("_"," ").title() + " Report"
    c.setFillColor(colors.white)
    c.setFont("Helvetica-Bold", 11)
    c.drawString(80*mm, H-14*mm, title)
    c.setFillColor(colors.HexColor("#94A3B8"))
    c.setFont("Helvetica", 8)
    c.drawRightString(W-10*mm, H-13*mm, f"Generated: {datetime.utcnow().strftime('%d/%m/%Y %H:%M')} UTC")
    c.drawRightString(W-10*mm, H-18*mm, f"Records: {report_data.get('record_count', len(rows))}")
    # Summary bar
    if summary and isinstance(summary, dict):
        c.setFillColor(colors.HexColor("#1E293B"))
        c.rect(0, H-32*mm, W, 12*mm, fill=1, stroke=0)
        sx = 10*mm
        for key, val in list(summary.items())[:6]:
            label = key.replace("_"," ").title()[:15]
            value = f"EGP {float(val):,.0f}" if isinstance(val,(int,float)) and ("amount" in key or "value" in key or "outstanding" in key or "collected" in key) else str(val) if val is not None else "—"
            c.setFillColor(colors.HexColor("#94A3B8"))
            c.setFont("Helvetica", 6)
            c.drawString(sx, H-24*mm, label)
            c.setFillColor(colors.HexColor("#60A5FA"))
            c.setFont("Helvetica-Bold", 8)
            c.drawString(sx, H-28*mm, value[:18])
            sx += 45*mm
            if sx > W-40*mm: break
    # Data table
    if columns and rows:
        y = H-35*mm
        col_count = min(len(columns), 10)
        visible_cols = columns[:col_count]
        col_w = (W-20*mm) / col_count
        c.setFillColor(colors.HexColor("#1E3A5F"))
        c.rect(10*mm, y, W-20*mm, 7*mm, fill=1, stroke=0)
        x = 10*mm
        for col in visible_cols:
            c.setFillColor(colors.HexColor("#60A5FA"))
            c.setFont("Helvetica-Bold", 6)
            c.drawString(x+1*mm, y+2*mm, col.replace("_"," ").title()[:int(col_w/mm*1.2)])
            x += col_w
        y -= 6*mm
        for ri, row in enumerate(rows[:25]):
            if y < 15*mm: break
            bg = "#0F172A" if ri%2==0 else "#1E293B"
            c.setFillColor(colors.HexColor(bg))
            c.rect(10*mm, y, W-20*mm, 6*mm, fill=1, stroke=0)
            x = 10*mm
            for col in visible_cols:
                val = row.get(col)
                s = str(val)[:int(col_w/mm*1.3)] if val is not None else "—"
                c.setFillColor(colors.HexColor("#E2E8F0"))
                c.setFont("Helvetica", 6)
                c.drawString(x+1*mm, y+1.5*mm, s)
                x += col_w
            y -= 6*mm
        if len(rows) > 25:
            c.setFillColor(colors.HexColor("#94A3B8"))
            c.setFont("Helvetica", 7)
            c.drawString(10*mm, y-3*mm, f"... and {len(rows)-25} more records. Export CSV for complete data.")
    # Footer
    c.setFillColor(colors.HexColor("#1E293B"))
    c.rect(0, 0, W, 8*mm, fill=1, stroke=0)
    c.setFillColor(colors.HexColor("#94A3B8"))
    c.setFont("Helvetica", 6)
    c.drawString(10*mm, 2.5*mm, "Triangle Black Engineering Services — CONFIDENTIAL")
    c.drawRightString(W-10*mm, 2.5*mm, "Generated by Triangle Black Platform")
    c.save()
    buf.seek(0)
    fname = f"Report_{report_type}_{datetime.utcnow().strftime('%Y%m%d_%H%M')}.pdf"
    return Response(content=buf.getvalue(), media_type="application/pdf",
                    headers={"Content-Disposition": f"inline; filename={fname}"})

# ── SPRINT 256: NOTIFICATIONS + DISPATCH ─────────────────────────────────────

@app.get("/api/v1/platform-notif/", tags=["notifications"])
def list_notifications(limit: int = 50, unread_only: bool = False):
    import os
    from sqlalchemy import text, create_engine
    from sqlalchemy.orm import Session
    eng = create_engine(os.environ.get("DATABASE_URL","postgresql+psycopg2://ai:ai123@localhost:5432/triangle_black"))
    with Session(eng) as db:
        try:
            where = "WHERE is_read=false" if unread_only else ""
            rows = db.execute(text(f"""
                SELECT * FROM notifications {where}
                ORDER BY created_at DESC LIMIT :l
            """), {"l": limit}).fetchall()
            unread = db.execute(text("SELECT count(*) FROM notifications WHERE is_read=false")).scalar()
            return {
                "notifications": [dict(r._mapping) for r in rows],
                "unread_count": unread,
                "total": len(rows)
            }
        except Exception as e:
            db.rollback(); return {"notifications":[],"unread_count":0,"total":0}

@app.post("/api/v1/platform-notif/{notif_id}/read", tags=["notifications"])
def mark_notification_read(notif_id: str):
    import os
    from sqlalchemy import text, create_engine
    from sqlalchemy.orm import Session
    eng = create_engine(os.environ.get("DATABASE_URL","postgresql+psycopg2://ai:ai123@localhost:5432/triangle_black"))
    with Session(eng) as db:
        try:
            db.execute(text("UPDATE notifications SET is_read=true WHERE id=:id"), {"id": notif_id})
            db.commit()
            return {"status": "read", "id": notif_id}
        except Exception as e:
            db.rollback(); return {"error": str(e)}

@app.post("/api/v1/platform-notif/mark-all-read", tags=["notifications"])
def mark_all_read():
    import os
    from sqlalchemy import text, create_engine
    from sqlalchemy.orm import Session
    eng = create_engine(os.environ.get("DATABASE_URL","postgresql+psycopg2://ai:ai123@localhost:5432/triangle_black"))
    with Session(eng) as db:
        try:
            result = db.execute(text("UPDATE notifications SET is_read=true WHERE is_read=false"))
            db.commit()
            return {"status": "all read", "updated": result.rowcount}
        except Exception as e:
            db.rollback(); return {"error": str(e)}

@app.post("/api/v1/platform-notif/generate", tags=["notifications"])
def generate_notifications():
    """Auto-generate notifications from live platform data"""
    import os, uuid
    from sqlalchemy import text, create_engine
    from sqlalchemy.orm import Session
    from datetime import datetime
    eng = create_engine(os.environ.get("DATABASE_URL","postgresql+psycopg2://ai:ai123@localhost:5432/triangle_black"))
    with Session(eng) as db:
        try:
            created = 0
            def add_notif(ntype, title, message, entity_type=None, entity_id=None, entity_url=None, priority="medium"):
                nonlocal created
                # Check if similar notification exists in last 24h
                existing = db.execute(text("""
                    SELECT id FROM notifications
                    WHERE title=:t AND entity_id=:eid AND entity_type=:et
                    AND created_at > NOW()-INTERVAL '24 hours'
                """), {"t": title, "eid": entity_id or "", "et": entity_type or ""}).fetchone()
                if not existing:
                    db.execute(text("""
                        INSERT INTO notifications (id, type, title, message, entity_type, entity_id, entity_url, priority)
                        VALUES (:id, :type, :title, :msg, :et, :eid, :url, :pri)
                    """), {
                        "id": str(uuid.uuid4()), "type": ntype,
                        "title": title, "msg": message,
                        "et": entity_type, "eid": entity_id, "url": entity_url, "pri": priority
                    })
                    created += 1

            # 1. Critical work orders
            critical_wos = db.execute(text("""
                SELECT wo.id, wo.title, s.name as site_name
                FROM work_orders wo LEFT JOIN sites s ON s.id=wo.site_id
                WHERE wo.priority='critical' AND wo.status='open'
                ORDER BY wo.created_at DESC LIMIT 5
            """)).fetchall()
            for wo in critical_wos:
                add_notif("alert", f"Critical WO: {wo.title[:40]}", f"Critical work order at {wo.site_name or 'Unknown site'} requires immediate attention.",
                          "work_order", wo.id, f"/operations/work-orders/{wo.id}", "critical")

            # 2. Overdue work orders
            overdue_wos = db.execute(text("""
                SELECT wo.id, wo.title, wo.due_date
                FROM work_orders wo
                WHERE wo.due_date < NOW() AND wo.status NOT IN ('completed','cancelled')
                ORDER BY wo.due_date ASC LIMIT 5
            """)).fetchall()
            for wo in overdue_wos:
                add_notif("warning", f"Overdue WO: {wo.title[:40]}",
                          f"Work order was due {str(wo.due_date)[:10]} and is not yet completed.",
                          "work_order", wo.id, f"/operations/work-orders/{wo.id}", "high")

            # 3. Overdue invoices
            overdue_inv = db.execute(text("""
                SELECT si.id, si.invoice_number, si.balance_due, v.company_name
                FROM supplier_invoices si LEFT JOIN vendors v ON v.id=si.vendor_id
                WHERE si.due_date < CURRENT_DATE AND si.payment_status != 'paid' AND si.balance_due > 0
                LIMIT 5
            """)).fetchall()
            for inv in overdue_inv:
                add_notif("alert", f"Invoice Overdue: {inv.invoice_number}",
                          f"Invoice from {inv.company_name or 'vendor'} — EGP {float(inv.balance_due or 0):,.0f} outstanding.",
                          "invoice", inv.id, f"/supply-chain/invoices/{inv.id}", "high")

            # 4. Matched invoices ready for approval
            matched_inv = db.execute(text("""
                SELECT id, invoice_number FROM supplier_invoices
                WHERE match_result='matched' AND status='matching' LIMIT 3
            """)).fetchall()
            for inv in matched_inv:
                add_notif("info", f"Invoice Ready: {inv.invoice_number}",
                          "3-way match passed. Invoice is ready for approval.",
                          "invoice", inv.id, f"/supply-chain/invoices/{inv.id}", "medium")

            # 5. Critical service requests
            critical_srs = db.execute(text("""
                SELECT sr.id, sr.title, s.name as site_name
                FROM service_requests sr LEFT JOIN sites s ON s.id=sr.site_id
                WHERE sr.urgency='critical' AND sr.status='open'
                ORDER BY sr.created_at DESC LIMIT 3
            """)).fetchall()
            for sr in critical_srs:
                add_notif("alert", f"Critical SR: {sr.title[:40]}",
                          f"Critical service request at {sr.site_name or 'site'} needs immediate response.",
                          "service_request", sr.id, f"/operations/service-requests/{sr.id}", "critical")

            db.commit()
            unread = db.execute(text("SELECT count(*) FROM notifications WHERE is_read=false")).scalar()
            return {"status": "generated", "created": created, "unread_count": unread}
        except Exception as e:
            db.rollback(); return {"error": str(e)}

@app.patch("/api/v1/work-orders/{wo_id}/assign", tags=["operations"])
async def assign_work_order(wo_id: str, request: Request):
    """Assign technician to work order (for Kanban dispatch)"""
    import os
    from sqlalchemy import text, create_engine
    from sqlalchemy.orm import Session
    body = await request.json()
    eng = create_engine(os.environ.get("DATABASE_URL","postgresql+psycopg2://ai:ai123@localhost:5432/triangle_black"))
    with Session(eng) as db:
        try:
            technician_id = body.get("technician_id")
            db.execute(text("""
                UPDATE work_orders SET technician_id=:tid, updated_at=NOW() WHERE id=:id
            """), {"tid": technician_id, "id": wo_id})
            db.commit()
            wo = db.execute(text("""
                SELECT wo.*, t.name as technician_name
                FROM work_orders wo LEFT JOIN technicians t ON t.id=wo.technician_id
                WHERE wo.id=:id
            """), {"id": wo_id}).fetchone()
            return dict(wo._mapping) if wo else {"error": "Not found"}
        except Exception as e:
            db.rollback(); return {"error": str(e)}

@app.patch("/api/v1/work-orders/{wo_id}/status", tags=["operations"])
async def update_wo_status(wo_id: str, request: Request):
    """Update work order status (for Kanban dispatch)"""
    import os
    from sqlalchemy import text, create_engine
    from sqlalchemy.orm import Session
    from datetime import datetime
    body = await request.json()
    eng = create_engine(os.environ.get("DATABASE_URL","postgresql+psycopg2://ai:ai123@localhost:5432/triangle_black"))
    with Session(eng) as db:
        try:
            new_status = body.get("status")
            updates = {"status": new_status, "id": wo_id}
            extra = ""
            if new_status == "in_progress":
                extra = ", started_at=NOW()"
            elif new_status == "completed":
                extra = ", completed_at=NOW()"
            db.execute(text(f"""
                UPDATE work_orders SET status=:status{extra}, updated_at=NOW() WHERE id=:id
            """), updates)
            db.commit()
            return {"status": "updated", "wo_id": wo_id, "new_status": new_status}
        except Exception as e:
            db.rollback(); return {"error": str(e)}

@app.get("/api/v1/dispatch/board", tags=["operations"])
def dispatch_board(site_id: str = None, priority: str = None, technician_id: str = None):
    """Get Kanban board data grouped by status"""
    import os
    from sqlalchemy import text, create_engine
    from sqlalchemy.orm import Session
    eng = create_engine(os.environ.get("DATABASE_URL","postgresql+psycopg2://ai:ai123@localhost:5432/triangle_black"))
    with Session(eng) as db:
        try:
            where, params = ["1=1"], {}
            if site_id: where.append("wo.site_id=:sid"); params["sid"]=site_id
            if priority: where.append("wo.priority=:pri"); params["pri"]=priority
            if technician_id: where.append("wo.technician_id=:tid"); params["tid"]=technician_id
            params["l"] = 100
            rows = db.execute(text(f"""
                SELECT wo.id, wo.title, wo.priority, wo.status, wo.type,
                       wo.due_date, wo.created_at, wo.started_at, wo.completed_at,
                       t.name as technician_name, t.specializations,
                       s.name as site_name
                FROM work_orders wo
                LEFT JOIN technicians t ON t.id=wo.technician_id
                LEFT JOIN sites s ON s.id=wo.site_id
                WHERE {" AND ".join(where)}
                ORDER BY CASE wo.priority WHEN 'critical' THEN 1 WHEN 'high' THEN 2 WHEN 'medium' THEN 3 ELSE 4 END,
                         wo.created_at DESC
                LIMIT :l
            """), params).fetchall()
            all_wos = [dict(r._mapping) for r in rows]
            # Group by status
            board = {
                "open": [w for w in all_wos if w["status"]=="open"],
                "in_progress": [w for w in all_wos if w["status"]=="in_progress"],
                "completed": [w for w in all_wos if w["status"]=="completed"],
            }
            # Technicians list for assignment dropdown
            techs = db.execute(text("SELECT id, name, specializations, is_active FROM technicians WHERE is_active=true ORDER BY name")).fetchall()
            return {
                "board": board,
                "counts": {k: len(v) for k,v in board.items()},
                "technicians": [dict(t._mapping) for t in techs]
            }
        except Exception as e:
            db.rollback(); return {"board":{},"counts":{},"technicians":[]}

# ── SPRINT 257: FINANCIAL P&L DASHBOARD ──────────────────────────────────────

@app.get("/api/v1/financial/dashboard", tags=["financial"])
def financial_dashboard():
    """Complete financial KPIs for P&L dashboard"""
    import os
    from sqlalchemy import text, create_engine
    from sqlalchemy.orm import Session
    from datetime import datetime
    eng = create_engine(os.environ.get("DATABASE_URL","postgresql+psycopg2://ai:ai123@localhost:5432/triangle_black"))
    with Session(eng) as db:
        def safe(q, p=None):
            try:
                r = db.execute(text(q), p or {}).fetchone()
                return dict(r._mapping) if r else {}
            except: db.rollback(); return {}
        def safe_list(q, p=None):
            try:
                rows = db.execute(text(q), p or {}).fetchall()
                return [dict(r._mapping) for r in rows]
            except: db.rollback(); return []

        # Revenue KPIs
        revenue = safe("""
            SELECT
              COALESCE(sum(total_amount),0) as total_invoiced,
              COALESCE(sum(amount_paid),0) as total_collected,
              COALESCE(sum(balance_due),0) as total_outstanding,
              count(*) as invoice_count,
              count(*) FILTER (WHERE payment_status='paid') as paid_count,
              count(*) FILTER (WHERE payment_status='unpaid') as unpaid_count,
              COALESCE(avg(CASE WHEN total_amount > 0 THEN amount_paid/total_amount*100 ELSE 0 END),0) as collection_rate_pct
            FROM supplier_invoices
        """)

        # Cost KPIs (from SOWs)
        cost = safe("""
            SELECT
              COALESCE(sum(total_cost),0) as total_sow_value,
              COALESCE(sum(labor_cost),0) as total_labor,
              COALESCE(sum(materials_cost),0) as total_materials,
              COALESCE(sum(total_cost - labor_cost - materials_cost),0) as total_overhead_profit,
              count(*) as sow_count
            FROM scope_of_work
        """)

        # PO spend
        po_spend = safe("""
            SELECT
              COALESCE(sum(total_amount),0) as total_po_value,
              count(*) as po_count,
              count(*) FILTER (WHERE status='paid') as paid_pos
            FROM purchase_orders_v2
        """)

        # Project P&L
        projects_pl = safe_list("""
            SELECT p.id, p.title, p.status, p.budget,
                   p.completion_pct,
                   COALESCE(p.budget * p.completion_pct / 100, 0) as earned_value,
                   COALESCE((SELECT sum(si.total_amount) FROM supplier_invoices si WHERE si.po_id IN
                     (SELECT id FROM purchase_orders_v2 WHERE sow_id IN
                       (SELECT id FROM scope_of_work WHERE contract_id = p.id))), 0) as actual_cost
            FROM projects p
            ORDER BY p.budget DESC
        """)

        # Aged receivables
        aged = safe_list("""
            SELECT
              CASE
                WHEN due_date::date >= CURRENT_DATE THEN 'Current'
                WHEN CURRENT_DATE - due_date::date <= 30 THEN '1-30 Days'
                WHEN CURRENT_DATE - due_date::date <= 60 THEN '31-60 Days'
                WHEN CURRENT_DATE - due_date::date <= 90 THEN '61-90 Days'
                ELSE '90+ Days'
              END as bucket,
              count(*) as count,
              COALESCE(sum(balance_due),0) as amount
            FROM supplier_invoices
            WHERE payment_status != 'paid' AND balance_due > 0
            GROUP BY bucket
            ORDER BY CASE bucket WHEN 'Current' THEN 1 WHEN '1-30 Days' THEN 2
                     WHEN '31-60 Days' THEN 3 WHEN '61-90 Days' THEN 4 ELSE 5 END
        """)

        # Monthly revenue trend (last 6 months)
        monthly = safe_list("""
            SELECT
              TO_CHAR(DATE_TRUNC('month', created_at), 'Mon YYYY') as month,
              DATE_TRUNC('month', created_at) as month_date,
              COALESCE(sum(total_amount),0) as invoiced,
              COALESCE(sum(amount_paid),0) as collected,
              COALESCE(sum(balance_due),0) as outstanding
            FROM supplier_invoices
            WHERE created_at > NOW() - INTERVAL '6 months'
            GROUP BY DATE_TRUNC('month', created_at), TO_CHAR(DATE_TRUNC('month', created_at), 'Mon YYYY')
            ORDER BY month_date
        """)

        # Vendor spend by category
        vendor_spend = safe_list("""
            SELECT v.category,
                   count(DISTINCT v.id) as vendor_count,
                   count(DISTINCT po.id) as po_count,
                   COALESCE(sum(po.total_amount),0) as total_spend
            FROM vendors v
            LEFT JOIN purchase_orders_v2 po ON po.vendor_id=v.id
            WHERE v.category IS NOT NULL
            GROUP BY v.category
            ORDER BY total_spend DESC
        """)

        # Net position
        net_profit_potential = float(revenue.get("total_invoiced") or 0) - float(po_spend.get("total_po_value") or 0)
        collection_rate = float(revenue.get("collection_rate_pct") or 0)

        return {
            "generated_at": datetime.utcnow().isoformat(),
            "revenue": revenue,
            "costs": cost,
            "po_spend": po_spend,
            "projects_pl": projects_pl,
            "aged_receivables": aged,
            "monthly_trend": monthly,
            "vendor_spend": vendor_spend,
            "summary": {
                "net_profit_potential": net_profit_potential,
                "collection_rate_pct": round(collection_rate, 1),
                "total_sow_pipeline": float(cost.get("total_sow_value") or 0),
                "cash_at_risk": float(revenue.get("total_outstanding") or 0),
            }
        }

@app.get("/api/v1/financial/project-pl", tags=["financial"])
def project_pl():
    """P&L breakdown per project"""
    import os
    from sqlalchemy import text, create_engine
    from sqlalchemy.orm import Session
    eng = create_engine(os.environ.get("DATABASE_URL","postgresql+psycopg2://ai:ai123@localhost:5432/triangle_black"))
    with Session(eng) as db:
        try:
            rows = db.execute(text("""
                SELECT p.id, p.title, p.status, p.start_date, p.end_date,
                       p.budget, p.completion_pct,
                       COALESCE(p.budget * p.completion_pct / 100, 0) as earned_value,
                       t.name as manager_name
                FROM projects p
                LEFT JOIN technicians t ON t.id=p.manager_id::varchar
                ORDER BY p.budget DESC
            """)).fetchall()
            result = []
            for r in rows:
                d = dict(r._mapping)
                budget = float(d.get("budget") or 0)
                completion = float(d.get("completion_pct") or 0)
                earned = budget * completion / 100
                d["earned_value"] = earned
                d["remaining_budget"] = budget - earned
                d["profit_margin_pct"] = round((earned / budget * 100) if budget > 0 else 0, 1)
                result.append(d)
            return result
        except Exception as e:
            db.rollback(); return []

@app.get("/api/v1/financial/cash-flow", tags=["financial"])
def cash_flow():
    """Monthly cash flow — inflows vs outflows"""
    import os
    from sqlalchemy import text, create_engine
    from sqlalchemy.orm import Session
    eng = create_engine(os.environ.get("DATABASE_URL","postgresql+psycopg2://ai:ai123@localhost:5432/triangle_black"))
    with Session(eng) as db:
        try:
            inflows = db.execute(text("""
                SELECT TO_CHAR(DATE_TRUNC('month',payment_date),'Mon YYYY') as month,
                       DATE_TRUNC('month',payment_date) as month_dt,
                       COALESCE(sum(amount),0) as amount
                FROM invoice_payments
                WHERE payment_date > NOW()-INTERVAL '6 months'
                GROUP BY DATE_TRUNC('month',payment_date), TO_CHAR(DATE_TRUNC('month',payment_date),'Mon YYYY')
                ORDER BY month_dt
            """)).fetchall()
            outflows = db.execute(text("""
                SELECT TO_CHAR(DATE_TRUNC('month',created_at),'Mon YYYY') as month,
                       DATE_TRUNC('month',created_at) as month_dt,
                       COALESCE(sum(total_amount),0) as amount
                FROM purchase_orders_v2
                WHERE created_at > NOW()-INTERVAL '6 months'
                AND status IN ('approved','sent','received','paid')
                GROUP BY DATE_TRUNC('month',created_at), TO_CHAR(DATE_TRUNC('month',created_at),'Mon YYYY')
                ORDER BY month_dt
            """)).fetchall()
            return {
                "inflows": [dict(r._mapping) for r in inflows],
                "outflows": [dict(r._mapping) for r in outflows]
            }
        except Exception as e:
            db.rollback(); return {"inflows":[],"outflows":[]}

# ── SPRINT 258: CUSTOMER PORTAL API ──────────────────────────────────────────

@app.post("/api/v1/client/login", tags=["client-portal"])
async def client_login(request: Request):
    """Client portal login with email + PIN"""
    import os, uuid
    from sqlalchemy import text, create_engine
    from sqlalchemy.orm import Session
    from datetime import datetime, timedelta
    import jwt as pyjwt
    body = await request.json()
    email = body.get("email","").lower().strip()
    pin = str(body.get("pin","")).strip()
    eng = create_engine(os.environ.get("DATABASE_URL","postgresql+psycopg2://ai:ai123@localhost:5432/triangle_black"))
    with Session(eng) as db:
        try:
            client = db.execute(text("""
                SELECT ca.*, s.name as site_name, s.address as site_address
                FROM client_accounts ca
                LEFT JOIN sites s ON s.id=ca.site_id
                WHERE ca.email=:email AND ca.is_active=true
            """), {"email": email}).fetchone()
            if not client:
                from fastapi import HTTPException
                raise HTTPException(401, "Invalid email or PIN")
            c = dict(client._mapping)
            if c.get("pin_hash") != pin:
                from fastapi import HTTPException
                raise HTTPException(401, "Invalid email or PIN")
            db.execute(text("UPDATE client_accounts SET last_login=NOW() WHERE id=:id"), {"id": c["id"]})
            db.commit()
            secret = os.environ.get("JWT_SECRET_KEY","tb-jwt-secret-2026")
            token_data = {
                "sub": c["id"], "email": email, "role": "client",
                "site_id": c["site_id"], "company": c["company_name"],
                "exp": datetime.utcnow() + timedelta(hours=24)
            }
            token = pyjwt.encode(token_data, secret, algorithm="HS256")
            return {
                "access_token": token, "token_type": "bearer",
                "client": {"id":c["id"],"name":c["name"],"email":email,
                           "company_name":c["company_name"],"site_id":c["site_id"],
                           "site_name":c.get("site_name",""),"role":"client"}
            }
        except Exception as e:
            if "401" in str(e) or "Invalid" in str(e):
                from fastapi import HTTPException
                raise HTTPException(401, "Invalid email or PIN")
            db.rollback()
            return {"error": str(e)}

@app.get("/api/v1/client/dashboard", tags=["client-portal"])
def client_dashboard(site_id: str):
    """Client dashboard — their site KPIs only"""
    import os
    from sqlalchemy import text, create_engine
    from sqlalchemy.orm import Session
    eng = create_engine(os.environ.get("DATABASE_URL","postgresql+psycopg2://ai:ai123@localhost:5432/triangle_black"))
    with Session(eng) as db:
        def safe(q, p=None):
            try: r=db.execute(text(q),p or {}).fetchone(); return dict(r._mapping) if r else {}
            except: db.rollback(); return {}
        wo = safe("SELECT count(*) as total, count(*) FILTER (WHERE status='open') as open_count, count(*) FILTER (WHERE status='in_progress') as in_progress, count(*) FILTER (WHERE status='completed') as completed, count(*) FILTER (WHERE priority='critical') as critical FROM work_orders WHERE site_id=:s", {"s": site_id})
        sr = safe("SELECT count(*) as total, count(*) FILTER (WHERE status='open') as open_count FROM service_requests WHERE site_id=:s", {"s": site_id})
        assets = safe("SELECT count(*) as total, count(*) FILTER (WHERE status='operational') as operational FROM assets WHERE site_id=:s", {"s": site_id})
        projects_q = safe("SELECT count(*) as total, count(*) FILTER (WHERE status='active') as active FROM projects WHERE site_id=:s", {"s": site_id})
        # Recent activity
        recent_wos = db.execute(text("""
            SELECT wo.id, wo.title, wo.priority, wo.status, wo.type, wo.created_at, wo.due_date,
                   t.name as technician_name
            FROM work_orders wo LEFT JOIN technicians t ON t.id=wo.technician_id
            WHERE wo.site_id=:s ORDER BY wo.created_at DESC LIMIT 5
        """), {"s": site_id}).fetchall()
        return {
            "site_id": site_id,
            "work_orders": wo, "service_requests": sr,
            "assets": assets, "projects": projects_q,
            "recent_work_orders": [dict(r._mapping) for r in recent_wos]
        }

@app.get("/api/v1/client/work-orders", tags=["client-portal"])
def client_work_orders(site_id: str, status: str = None, limit: int = 50):
    """Client's work orders — their site only"""
    import os
    from sqlalchemy import text, create_engine
    from sqlalchemy.orm import Session
    eng = create_engine(os.environ.get("DATABASE_URL","postgresql+psycopg2://ai:ai123@localhost:5432/triangle_black"))
    with Session(eng) as db:
        try:
            where = ["wo.site_id=:s"]
            params = {"s": site_id, "l": limit}
            if status: where.append("wo.status=:st"); params["st"] = status
            rows = db.execute(text(f"""
                SELECT wo.id, wo.title, wo.type, wo.priority, wo.status,
                       wo.created_at, wo.due_date, wo.started_at, wo.completed_at,
                       t.name as technician_name, a.name as asset_name
                FROM work_orders wo
                LEFT JOIN technicians t ON t.id=wo.technician_id
                LEFT JOIN assets a ON a.id=wo.asset_id
                WHERE {" AND ".join(where)}
                ORDER BY CASE wo.priority WHEN 'critical' THEN 1 WHEN 'high' THEN 2 ELSE 3 END, wo.created_at DESC
                LIMIT :l
            """), params).fetchall()
            return [dict(r._mapping) for r in rows]
        except Exception as e:
            db.rollback(); return []

@app.post("/api/v1/client/service-requests", tags=["client-portal"])
async def client_create_sr(request: Request):
    """Client raises a new service request"""
    import os, uuid
    from sqlalchemy import text, create_engine
    from sqlalchemy.orm import Session
    body = await request.json()
    eng = create_engine(os.environ.get("DATABASE_URL","postgresql+psycopg2://ai:ai123@localhost:5432/triangle_black"))
    with Session(eng) as db:
        try:
            db.execute(text("""
                INSERT INTO service_requests
                  (id, hotel_id, site_id, title, description, urgency, status, category, submitted_by, contact_phone, updated_at)
                VALUES
                  (:id, 'tb-default-hotel-000000000001', :site, :title, :desc, :urgency, 'open', :cat, :by, :phone, NOW())
            """), {
                "id": str(uuid.uuid4()), "site": body.get("site_id"),
                "title": body.get("title",""), "desc": body.get("description",""),
                "urgency": body.get("urgency","medium"), "cat": body.get("category","fault"),
                "by": body.get("submitted_by",""), "phone": body.get("contact_phone","")
            })
            db.commit()
            return {"status": "created", "message": "Your service request has been submitted. Our team will respond shortly."}
        except Exception as e:
            db.rollback(); return {"error": str(e)}

@app.get("/api/v1/client/sow-approvals", tags=["client-portal"])
def client_sow_approvals(site_id: str = None, client_name: str = None):
    """SOWs waiting for client approval"""
    import os
    from sqlalchemy import text, create_engine
    from sqlalchemy.orm import Session
    eng = create_engine(os.environ.get("DATABASE_URL","postgresql+psycopg2://ai:ai123@localhost:5432/triangle_black"))
    with Session(eng) as db:
        try:
            where = ["s.status IN ('approved','sent_to_client','pending_approval')"]
            params = {"l": 20}
            if client_name: where.append("s.client_name ILIKE :cn"); params["cn"] = f"%{client_name}%"
            rows = db.execute(text(f"""
                SELECT s.id, s.sow_number, s.title, s.type, s.status, s.client_name,
                       s.total_cost, s.currency, s.estimated_days, s.scope_details,
                       s.created_at, s.approved_at,
                       (SELECT count(*) FROM boq_items WHERE sow_id=s.id) as boq_count
                FROM scope_of_work s
                WHERE {" AND ".join(where)}
                ORDER BY s.created_at DESC LIMIT :l
            """), params).fetchall()
            return [dict(r._mapping) for r in rows]
        except Exception as e:
            db.rollback(); return []

@app.get("/api/v1/client/projects", tags=["client-portal"])
def client_projects(site_id: str):
    """Active projects at client site"""
    import os
    from sqlalchemy import text, create_engine
    from sqlalchemy.orm import Session
    eng = create_engine(os.environ.get("DATABASE_URL","postgresql+psycopg2://ai:ai123@localhost:5432/triangle_black"))
    with Session(eng) as db:
        try:
            rows = db.execute(text("""
                SELECT p.id, p.title, p.status, p.start_date, p.end_date,
                       p.completion_pct, t.name as manager_name
                FROM projects p
                LEFT JOIN technicians t ON t.id=p.manager_id::varchar
                WHERE p.site_id=:sid
                ORDER BY p.start_date DESC
            """), {"sid": site_id}).fetchall()
            return [dict(r._mapping) for r in rows]
        except Exception as e:
            db.rollback(); return []

# ── SPRINT 259: SUPPLIER PORTAL API ──────────────────────────────────────────

@app.post("/api/v1/supplier/login", tags=["supplier-portal"])
async def supplier_login(request: Request):
    """Supplier portal login with email + PIN"""
    import os
    from sqlalchemy import text, create_engine
    from sqlalchemy.orm import Session
    from datetime import datetime, timedelta
    import jwt as pyjwt
    body = await request.json()
    email = body.get("email","").lower().strip()
    pin = str(body.get("pin","")).strip()
    eng = create_engine(os.environ.get("DATABASE_URL","postgresql+psycopg2://ai:ai123@localhost:5432/triangle_black"))
    with Session(eng) as db:
        try:
            supplier = db.execute(text("""
                SELECT sa.*, v.company_name, v.category, v.rating, v.vendor_code,
                       v.email as vendor_email, v.phone as vendor_phone
                FROM supplier_accounts sa
                LEFT JOIN vendors v ON v.id=sa.vendor_id
                WHERE sa.email=:email AND sa.is_active=true
            """), {"email": email}).fetchone()
            if not supplier:
                from fastapi import HTTPException; raise HTTPException(401, "Invalid email or PIN")
            s = dict(supplier._mapping)
            if s.get("pin_hash") != pin:
                from fastapi import HTTPException; raise HTTPException(401, "Invalid email or PIN")
            db.execute(text("UPDATE supplier_accounts SET last_login=NOW() WHERE id=:id"), {"id": s["id"]})
            db.commit()
            secret = os.environ.get("JWT_SECRET_KEY","tb-jwt-secret-2026")
            token_data = {
                "sub": s["id"], "email": email, "role": "supplier",
                "vendor_id": s["vendor_id"], "company": s["company_name"],
                "exp": datetime.utcnow() + timedelta(hours=24)
            }
            token = pyjwt.encode(token_data, secret, algorithm="HS256")
            return {
                "access_token": token, "token_type": "bearer",
                "supplier": {
                    "id": s["id"], "name": s["name"], "email": email,
                    "vendor_id": s["vendor_id"], "company_name": s["company_name"],
                    "category": s["category"], "vendor_code": s["vendor_code"],
                    "rating": s["rating"], "role": "supplier"
                }
            }
        except Exception as e:
            if "401" in str(e):
                from fastapi import HTTPException; raise HTTPException(401, "Invalid email or PIN")
            db.rollback(); return {"error": str(e)}

@app.get("/api/v1/supplier/dashboard", tags=["supplier-portal"])
def supplier_dashboard(vendor_id: str):
    """Supplier dashboard — their KPIs"""
    import os
    from sqlalchemy import text, create_engine
    from sqlalchemy.orm import Session
    eng = create_engine(os.environ.get("DATABASE_URL","postgresql+psycopg2://ai:ai123@localhost:5432/triangle_black"))
    with Session(eng) as db:
        def safe(q, p=None):
            try: r=db.execute(text(q),p or {}).fetchone(); return dict(r._mapping) if r else {}
            except: db.rollback(); return {}
        po = safe("SELECT count(*) as total, count(*) FILTER (WHERE status='approved') as approved, count(*) FILTER (WHERE status='pending_approval') as pending, COALESCE(sum(total_amount),0) as total_value FROM purchase_orders_v2 WHERE vendor_id=:v", {"v": vendor_id})
        inv = safe("SELECT count(*) as total, COALESCE(sum(total_amount),0) as total_invoiced, COALESCE(sum(balance_due),0) as outstanding FROM supplier_invoices WHERE vendor_id=:v", {"v": vendor_id})
        rfq = safe("SELECT count(*) as total, count(*) FILTER (WHERE status='sent') as active FROM rfq_headers WHERE awarded_vendor_id=:v OR id IN (SELECT rfq_id FROM vendor_quotations WHERE vendor_id=:v)", {"v": vendor_id})
        vendor = safe("SELECT company_name, category, rating, vendor_code, payment_terms, city, is_approved FROM vendors WHERE id=:v", {"v": vendor_id})
        recent_pos = db.execute(text("""
            SELECT id, po_number, title, status, total_amount, currency, created_at
            FROM purchase_orders_v2 WHERE vendor_id=:v ORDER BY created_at DESC LIMIT 5
        """), {"v": vendor_id}).fetchall()
        return {
            "vendor_id": vendor_id,
            "vendor": vendor,
            "purchase_orders": po,
            "invoices": inv,
            "rfqs": rfq,
            "recent_pos": [dict(r._mapping) for r in recent_pos]
        }

@app.get("/api/v1/supplier/purchase-orders", tags=["supplier-portal"])
def supplier_purchase_orders(vendor_id: str, status: str = None, limit: int = 50):
    """Supplier's POs"""
    import os
    from sqlalchemy import text, create_engine
    from sqlalchemy.orm import Session
    eng = create_engine(os.environ.get("DATABASE_URL","postgresql+psycopg2://ai:ai123@localhost:5432/triangle_black"))
    with Session(eng) as db:
        try:
            where = ["po.vendor_id=:v"]
            params = {"v": vendor_id, "l": limit}
            if status: where.append("po.status=:s"); params["s"]=status
            rows = db.execute(text(f"""
                SELECT po.id, po.po_number, po.title, po.status, po.po_type,
                       po.currency, po.total_amount, po.payment_terms,
                       po.delivery_date, po.created_at, po.approved_at,
                       (SELECT count(*) FROM po_line_items WHERE po_id=po.id) as line_count
                FROM purchase_orders_v2 po
                WHERE {" AND ".join(where)}
                ORDER BY po.created_at DESC LIMIT :l
            """), params).fetchall()
            return [dict(r._mapping) for r in rows]
        except Exception as e:
            db.rollback(); return []

@app.get("/api/v1/supplier/rfqs", tags=["supplier-portal"])
def supplier_rfqs(vendor_id: str, limit: int = 20):
    """RFQs where supplier is invited or has submitted quote"""
    import os
    from sqlalchemy import text, create_engine
    from sqlalchemy.orm import Session
    eng = create_engine(os.environ.get("DATABASE_URL","postgresql+psycopg2://ai:ai123@localhost:5432/triangle_black"))
    with Session(eng) as db:
        try:
            rows = db.execute(text("""
                SELECT rfq.id, rfq.rfq_number, rfq.title, rfq.status, rfq.rfq_type,
                       rfq.total_budget, rfq.currency, rfq.submission_deadline, rfq.created_at,
                       vq.id as my_quote_id, vq.total_amount as my_quote_amount,
                       vq.status as quote_status, vq.is_selected
                FROM rfq_headers rfq
                LEFT JOIN vendor_quotations vq ON vq.rfq_id=rfq.id AND vq.vendor_id=:v
                WHERE rfq.awarded_vendor_id=:v OR vq.vendor_id=:v OR rfq.status='sent'
                ORDER BY rfq.created_at DESC LIMIT :l
            """), {"v": vendor_id, "l": limit}).fetchall()
            return [dict(r._mapping) for r in rows]
        except Exception as e:
            db.rollback(); return []

@app.post("/api/v1/supplier/quotes", tags=["supplier-portal"])
async def submit_quote(request: Request):
    """Supplier submits quotation for an RFQ"""
    import os, uuid
    from sqlalchemy import text, create_engine
    from sqlalchemy.orm import Session
    body = await request.json()
    eng = create_engine(os.environ.get("DATABASE_URL","postgresql+psycopg2://ai:ai123@localhost:5432/triangle_black"))
    with Session(eng) as db:
        try:
            qn = f"QT-{body.get('vendor_id','VND')[:4].upper()}-{uuid.uuid4().hex[:6].upper()}"
            db.execute(text("""
                INSERT INTO vendor_quotations
                  (id, rfq_id, vendor_id, quotation_number, status, submitted_at,
                   currency, payment_terms, delivery_days, total_amount, notes)
                VALUES
                  (:id, :rfq, :vendor, :qn, 'submitted', NOW(),
                   :currency, :terms, :days, :amount, :notes)
                ON CONFLICT (id) DO NOTHING
            """), {
                "id": str(uuid.uuid4()), "rfq": body.get("rfq_id"),
                "vendor": body.get("vendor_id"), "qn": qn,
                "currency": body.get("currency","EGP"),
                "terms": body.get("payment_terms",30),
                "days": body.get("delivery_days",7),
                "amount": float(body.get("total_amount",0)),
                "notes": body.get("notes","")
            })
            db.commit()
            return {"status": "submitted", "quotation_number": qn, "message": "Your quotation has been submitted successfully."}
        except Exception as e:
            db.rollback(); return {"error": str(e)}

@app.get("/api/v1/supplier/invoices", tags=["supplier-portal"])
def supplier_invoices(vendor_id: str, limit: int = 30):
    """Supplier's invoices"""
    import os
    from sqlalchemy import text, create_engine
    from sqlalchemy.orm import Session
    eng = create_engine(os.environ.get("DATABASE_URL","postgresql+psycopg2://ai:ai123@localhost:5432/triangle_black"))
    with Session(eng) as db:
        try:
            rows = db.execute(text("""
                SELECT id, invoice_number, vendor_invoice_number, status, payment_status,
                       match_result, invoice_date, due_date, currency,
                       total_amount, amount_paid, balance_due, created_at
                FROM supplier_invoices WHERE vendor_id=:v ORDER BY created_at DESC LIMIT :l
            """), {"v": vendor_id, "l": limit}).fetchall()
            return [dict(r._mapping) for r in rows]
        except Exception as e:
            db.rollback(); return []

@app.get("/api/v1/supplier/profile", tags=["supplier-portal"])
def supplier_profile(vendor_id: str):
    """Supplier profile and documents"""
    import os
    from sqlalchemy import text, create_engine
    from sqlalchemy.orm import Session
    eng = create_engine(os.environ.get("DATABASE_URL","postgresql+psycopg2://ai:ai123@localhost:5432/triangle_black"))
    with Session(eng) as db:
        try:
            vendor = db.execute(text("SELECT * FROM vendors WHERE id=:v"), {"v": vendor_id}).fetchone()
            if not vendor:
                from fastapi import HTTPException; raise HTTPException(404, "Vendor not found")
            docs = db.execute(text("""
                SELECT id, doc_category, doc_name, file_name, file_size_bytes,
                       is_required, is_verified, created_at,
                       '/api/v1/documents/' || id || '/view' as url
                FROM entity_documents WHERE entity_type='vendor' AND entity_id=:v
                ORDER BY doc_category, created_at DESC
            """), {"v": vendor_id}).fetchall()
            doc_status = db.execute(text("""
                SELECT doc_category, count(*) as count FROM entity_documents
                WHERE entity_type='vendor' AND entity_id=:v GROUP BY doc_category
            """), {"v": vendor_id}).fetchall()
            uploaded_cats = {r.doc_category for r in doc_status}
            required = {"trade_license","tax_card"}
            return {
                **dict(vendor._mapping),
                "documents": [dict(r._mapping) for r in docs],
                "doc_status": {
                    "uploaded_categories": list(uploaded_cats),
                    "missing_required": list(required - uploaded_cats),
                    "approval_ready": required.issubset(uploaded_cats),
                    "total_documents": len(docs)
                }
            }
        except HTTPException: raise
        except Exception as e: return {"error": str(e)}

# ── SPRINT 260: PREVENTIVE MAINTENANCE SCHEDULER ─────────────────────────────

@app.get("/api/v1/pm-schedule/assets", tags=["maintenance"])
def maintenance_schedule(site_id: str = None, status: str = None, limit: int = 100):
    """All assets with maintenance schedule status"""
    import os
    from sqlalchemy import text, create_engine
    from sqlalchemy.orm import Session
    eng = create_engine(os.environ.get("DATABASE_URL","postgresql+psycopg2://ai:ai123@localhost:5432/triangle_black"))
    with Session(eng) as db:
        try:
            where = ["a.next_maintenance_date IS NOT NULL"]
            params = {"l": limit}
            if site_id: where.append("a.site_id=:sid"); params["sid"]=site_id
            rows = db.execute(text(f"""
                SELECT a.id as asset_id, a.name as asset_name, a.category,
                       a.manufacturer, a.model, a.criticality, a.status,
                       a.last_maintenance_date, a.next_maintenance_date,
                       a.location_description,
                       s.name as site_name,
                       CURRENT_DATE - a.next_maintenance_date::date as overdue_days,
                       CASE
                         WHEN a.next_maintenance_date::date < CURRENT_DATE THEN 'overdue'
                         WHEN a.next_maintenance_date::date <= CURRENT_DATE + INTERVAL '7 days' THEN 'due_soon'
                         WHEN a.next_maintenance_date::date <= CURRENT_DATE + INTERVAL '30 days' THEN 'upcoming'
                         ELSE 'scheduled'
                       END as schedule_status,
                       (SELECT count(*) FROM work_orders wo
                        WHERE wo.asset_id=a.id AND wo.type='preventive'
                        AND wo.created_at > NOW()-INTERVAL '60 days'
                        AND wo.status NOT IN ('cancelled')) as recent_wo_count
                FROM assets a
                LEFT JOIN sites s ON s.id=a.site_id
                WHERE {" AND ".join(where)}
                ORDER BY a.next_maintenance_date ASC LIMIT :l
            """), params).fetchall()
            data = [dict(r._mapping) for r in rows]
            overdue = [d for d in data if d["schedule_status"]=="overdue"]
            due_soon = [d for d in data if d["schedule_status"]=="due_soon"]
            upcoming = [d for d in data if d["schedule_status"]=="upcoming"]
            return {
                "assets": data,
                "summary": {
                    "total": len(data),
                    "overdue": len(overdue),
                    "due_soon": len(due_soon),
                    "upcoming": len(upcoming),
                    "scheduled": len(data)-len(overdue)-len(due_soon)-len(upcoming)
                }
            }
        except Exception as e:
            db.rollback(); return {"assets":[],"summary":{}}

@app.post("/api/v1/pm-schedule/generate", tags=["maintenance"])
async def generate_pm_work_orders(request: Request):
    """Auto-generate preventive maintenance WOs for overdue/due-soon assets"""
    import os, uuid
    from sqlalchemy import text, create_engine
    from sqlalchemy.orm import Session
    from datetime import datetime, timedelta
    body = await request.json()
    eng = create_engine(os.environ.get("DATABASE_URL","postgresql+psycopg2://ai:ai123@localhost:5432/triangle_black"))
    with Session(eng) as db:
        try:
            # Get assets due for maintenance (overdue + due in 7 days)
            assets = db.execute(text("""
                SELECT a.id, a.name, a.category, a.site_id, a.criticality,
                       a.next_maintenance_date, a.last_maintenance_date,
                       s.name as site_name
                FROM assets a
                LEFT JOIN sites s ON s.id=a.site_id
                WHERE a.next_maintenance_date IS NOT NULL
                AND a.next_maintenance_date::date <= CURRENT_DATE + INTERVAL '7 days'
                AND NOT EXISTS (
                    SELECT 1 FROM work_orders wo
                    WHERE wo.asset_id=a.id AND wo.type='preventive'
                    AND wo.status NOT IN ('completed','cancelled')
                    AND wo.created_at > NOW()-INTERVAL '30 days'
                )
                ORDER BY a.next_maintenance_date ASC
                LIMIT 20
            """)).fetchall()

            # Find best available technician per category
            def get_tech(category):
                tech = db.execute(text("""
                    SELECT id, name FROM technicians
                    WHERE is_active=true
                    AND specializations::text ILIKE :cat
                    AND current_work_orders < max_work_orders
                    ORDER BY current_work_orders ASC LIMIT 1
                """), {"cat": f"%{category}%"}).fetchone()
                return dict(tech._mapping) if tech else None

            created = []
            for asset in assets:
                a = dict(asset._mapping)
                tech = get_tech(a["category"]) or get_tech("HVAC")
                priority = "high" if a["criticality"] in ["critical"] else "medium"
                wo_id = str(uuid.uuid4())
                wo_title = f"Preventive Maintenance — {a['name']}"
                due = (datetime.utcnow() + timedelta(days=3)).isoformat()
                db.execute(text("""
                    INSERT INTO work_orders
                      (id, hotel_id, title, description, priority, status, type,
                       technician_id, site_id, asset_id, due_date, created_at, updated_at)
                    VALUES
                      (:id, 'tb-default-hotel-000000000001', :title,
                       :desc, :pri, 'open', 'preventive',
                       :tech, :site, :asset, :due, NOW(), NOW())
                """), {
                    "id": wo_id, "title": wo_title,
                    "desc": f"Scheduled preventive maintenance for {a['name']} at {a.get('site_name','')}. Last maintenance: {str(a.get('last_maintenance_date','Never'))[:10]}",
                    "pri": priority,
                    "tech": tech["id"] if tech else None,
                    "site": a["site_id"], "asset": a["id"], "due": due
                })
                # Update asset next maintenance date (+90 days)
                db.execute(text("""
                    UPDATE assets SET
                      last_maintenance_date=CURRENT_DATE,
                      next_maintenance_date=CURRENT_DATE+INTERVAL '90 days'
                    WHERE id=:id
                """), {"id": a["id"]})
                created.append({
                    "wo_id": wo_id, "asset": a["name"],
                    "site": a.get("site_name",""), "priority": priority,
                    "technician": tech["name"] if tech else "Unassigned"
                })
            db.commit()
            return {
                "status": "generated",
                "created_count": len(created),
                "work_orders": created,
                "message": f"Created {len(created)} preventive maintenance work orders"
            }
        except Exception as e:
            db.rollback(); return {"error": str(e)}

@app.get("/api/v1/pm-schedule/calendar", tags=["maintenance"])
def maintenance_calendar():
    """Next 30 days maintenance calendar grouped by week"""
    import os
    from sqlalchemy import text, create_engine
    from sqlalchemy.orm import Session
    eng = create_engine(os.environ.get("DATABASE_URL","postgresql+psycopg2://ai:ai123@localhost:5432/triangle_black"))
    with Session(eng) as db:
        try:
            rows = db.execute(text("""
                SELECT a.id, a.name, a.category, a.criticality,
                       a.next_maintenance_date,
                       s.name as site_name,
                       DATE_TRUNC('week', a.next_maintenance_date::timestamp) as week_start,
                       EXTRACT(DOW FROM a.next_maintenance_date::timestamp) as day_of_week
                FROM assets a
                LEFT JOIN sites s ON s.id=a.site_id
                WHERE a.next_maintenance_date IS NOT NULL
                AND a.next_maintenance_date::date BETWEEN CURRENT_DATE AND CURRENT_DATE+INTERVAL '30 days'
                ORDER BY a.next_maintenance_date ASC
            """)).fetchall()
            weeks = {}
            for r in rows:
                d = dict(r._mapping)
                week = str(d["week_start"])[:10] if d["week_start"] else "unknown"
                if week not in weeks: weeks[week] = []
                weeks[week].append(d)
            # Also get overdue
            overdue = db.execute(text("""
                SELECT a.id, a.name, a.category, a.next_maintenance_date, s.name as site_name
                FROM assets a LEFT JOIN sites s ON s.id=a.site_id
                WHERE a.next_maintenance_date::date < CURRENT_DATE
                ORDER BY a.next_maintenance_date ASC
            """)).fetchall()
            return {
                "weeks": weeks,
                "overdue": [dict(r._mapping) for r in overdue],
                "total_assets": len(rows)
            }
        except Exception as e:
            db.rollback(); return {"weeks":{},"overdue":[]}

@app.get("/api/v1/pm-schedule/stats", tags=["maintenance"])
def maintenance_stats():
    """Maintenance KPI stats"""
    import os
    from sqlalchemy import text, create_engine
    from sqlalchemy.orm import Session
    eng = create_engine(os.environ.get("DATABASE_URL","postgresql+psycopg2://ai:ai123@localhost:5432/triangle_black"))
    with Session(eng) as db:
        try:
            return {
                "assets": db.execute(text("""
                    SELECT count(*) as total,
                      count(*) FILTER (WHERE next_maintenance_date::date < CURRENT_DATE) as overdue,
                      count(*) FILTER (WHERE next_maintenance_date::date BETWEEN CURRENT_DATE AND CURRENT_DATE+7) as due_week,
                      count(*) FILTER (WHERE next_maintenance_date::date BETWEEN CURRENT_DATE+8 AND CURRENT_DATE+30) as due_month,
                      count(*) FILTER (WHERE status='operational') as operational
                    FROM assets WHERE next_maintenance_date IS NOT NULL
                """)).fetchone()._mapping,
                "wos_this_month": db.execute(text("""
                    SELECT count(*) as created,
                      count(*) FILTER (WHERE status='completed') as completed
                    FROM work_orders WHERE type='preventive' AND created_at > NOW()-INTERVAL '30 days'
                """)).fetchone()._mapping,
            }
        except Exception as e:
            db.rollback(); return {}

# ── SPRINT 261: ASSET QR CODE SYSTEM ─────────────────────────────────────────

@app.get("/api/v1/qr/asset/{asset_id}", tags=["qr"])
def get_asset_qr(asset_id: str, size: int = 300):
    """Generate QR code PNG for an asset — links to /asset/{asset_id} scan page"""
    import os, io
    from sqlalchemy import text, create_engine
    from sqlalchemy.orm import Session
    from fastapi import HTTPException
    from fastapi.responses import Response
    try:
        import qrcode
        from qrcode.image.pil import PilImage
        from PIL import Image, ImageDraw, ImageFont
    except ImportError:
        raise HTTPException(500, "qrcode/Pillow not installed. Run: pip install qrcode[pil] Pillow")

    eng = create_engine(os.environ.get("DATABASE_URL","postgresql+psycopg2://ai:ai123@localhost:5432/triangle_black"))
    with Session(eng) as db:
        asset = db.execute(text("""
            SELECT a.id, a.name, a.category, a.location_description, a.manufacturer, a.model,
                   a.serial_number, s.name as site_name
            FROM assets a LEFT JOIN sites s ON s.id=a.site_id WHERE a.id=:id
        """), {"id": asset_id}).fetchone()
        if not asset:
            raise HTTPException(404, "Asset not found")
        a = dict(asset._mapping)

    portal_url = os.environ.get("PORTAL_URL", "http://localhost:3000")
    scan_url = f"{portal_url}/asset/{asset_id}"

    qr = qrcode.QRCode(
        version=1,
        error_correction=qrcode.constants.ERROR_CORRECT_H,
        box_size=10, border=2
    )
    qr.add_data(scan_url)
    qr.make(fit=True)
    qr_img = qr.make_image(fill_color="#0F172A", back_color="white")

    # Create label card
    card_w, card_h = 400, 520
    card = Image.new("RGB", (card_w, card_h), "white")
    draw = ImageDraw.Draw(card)

    # Header bar
    draw.rectangle([0, 0, card_w, 50], fill="#0F172A")
    draw.text((card_w//2, 25), "TRIANGLE BLACK", fill="#F59E0B", anchor="mm")

    # QR code centered
    qr_size = 240
    qr_img = qr_img.resize((qr_size, qr_size), Image.LANCZOS)
    qr_x = (card_w - qr_size) // 2
    card.paste(qr_img, (qr_x, 60))

    # Asset info
    draw.rectangle([0, 310, card_w, 520], fill="#F8FAFC")
    name = a["name"][:28] if len(a["name"]) > 28 else a["name"]
    draw.text((card_w//2, 330), name, fill="#0F172A", anchor="mm")
    draw.text((card_w//2, 360), a.get("category","") or "", fill="#64748B", anchor="mm")
    loc = (a.get("location_description","") or "")[:35]
    draw.text((card_w//2, 385), loc, fill="#64748B", anchor="mm")
    site = (a.get("site_name","") or "")[:35]
    draw.text((card_w//2, 410), site, fill="#94A3B8", anchor="mm")

    # Footer instruction
    draw.rectangle([0, 440, card_w, 480], fill="#059669")
    draw.text((card_w//2, 460), "Scan to view asset & create work order", fill="white", anchor="mm")

    # ID small
    draw.text((card_w//2, 500), f"ID: {asset_id[:16]}", fill="#94A3B8", anchor="mm")

    buf = io.BytesIO()
    card.save(buf, format="PNG", dpi=(300,300))
    buf.seek(0)

    fname = f"QR_{a['name'][:20].replace(' ','_')}.png"
    return Response(content=buf.getvalue(), media_type="image/png",
                    headers={"Content-Disposition": f"inline; filename={fname}"})


@app.get("/api/v1/qr/asset/{asset_id}/data", tags=["qr"])
def get_asset_scan_data(asset_id: str):
    """Get asset data for QR scan landing page — includes open WOs + maintenance history"""
    import os
    from sqlalchemy import text, create_engine
    from sqlalchemy.orm import Session
    from fastapi import HTTPException
    eng = create_engine(os.environ.get("DATABASE_URL","postgresql+psycopg2://ai:ai123@localhost:5432/triangle_black"))
    with Session(eng) as db:
        try:
            asset = db.execute(text("""
                SELECT a.*, s.name as site_name, s.address as site_address, s.contact_person, s.contact_phone
                FROM assets a LEFT JOIN sites s ON s.id=a.site_id WHERE a.id=:id
            """), {"id": asset_id}).fetchone()
            if not asset:
                raise HTTPException(404, "Asset not found")

            # Open work orders for this asset
            open_wos = db.execute(text("""
                SELECT wo.id, wo.title, wo.priority, wo.status, wo.type, wo.created_at, wo.due_date,
                       t.name as technician_name
                FROM work_orders wo LEFT JOIN technicians t ON t.id=wo.technician_id
                WHERE wo.asset_id=:id AND wo.status NOT IN ('completed','cancelled')
                ORDER BY CASE wo.priority WHEN 'critical' THEN 1 WHEN 'high' THEN 2 ELSE 3 END,
                         wo.created_at DESC LIMIT 5
            """), {"id": asset_id}).fetchall()

            # Recent completed WOs
            history = db.execute(text("""
                SELECT wo.id, wo.title, wo.type, wo.status, wo.completed_at, wo.created_at,
                       t.name as technician_name
                FROM work_orders wo LEFT JOIN technicians t ON t.id=wo.technician_id
                WHERE wo.asset_id=:id AND wo.status='completed'
                ORDER BY wo.completed_at DESC LIMIT 5
            """), {"id": asset_id}).fetchall()

            a = dict(asset._mapping)
            return {
                "asset": a,
                "qr_url": f"/api/v1/qr/asset/{asset_id}",
                "open_work_orders": [dict(r._mapping) for r in open_wos],
                "maintenance_history": [dict(r._mapping) for r in history],
                "stats": {
                    "open_wos": len(open_wos),
                    "history_count": len(history),
                    "is_overdue": bool(
                        a.get("next_maintenance_date") and
                        str(a.get("next_maintenance_date",""))[:10] < str(__import__("datetime").date.today())
                    )
                }
            }
        except HTTPException: raise
        except Exception as e: return {"error": str(e)}


@app.get("/api/v1/qr/assets/list", tags=["qr"])
def list_asset_qr_links(site_id: str = None, limit: int = 100):
    """List all assets with their QR code URLs"""
    import os
    from sqlalchemy import text, create_engine
    from sqlalchemy.orm import Session
    eng = create_engine(os.environ.get("DATABASE_URL","postgresql+psycopg2://ai:ai123@localhost:5432/triangle_black"))
    with Session(eng) as db:
        try:
            where = "WHERE a.id IS NOT NULL"
            params = {"l": limit}
            if site_id: where += " AND a.site_id=:sid"; params["sid"]=site_id
            rows = db.execute(text(f"""
                SELECT a.id, a.name, a.category, a.status, a.criticality,
                       a.location_description, a.next_maintenance_date,
                       s.name as site_name,
                       '/api/v1/qr/asset/' || a.id as qr_url,
                       '/asset/' || a.id as scan_url
                FROM assets a LEFT JOIN sites s ON s.id=a.site_id
                {where}
                ORDER BY s.name, a.category, a.name LIMIT :l
            """), params).fetchall()
            return [dict(r._mapping) for r in rows]
        except Exception as e:
            db.rollback(); return []


@app.get("/api/v1/qr/asset/{asset_id}/print-sheet", tags=["qr"])
def print_asset_qr_sheet(asset_id: str):
    """Generate A4 PDF print sheet with QR code + asset info"""
    import os, io
    from sqlalchemy import text, create_engine
    from sqlalchemy.orm import Session
    from fastapi import HTTPException
    from fastapi.responses import Response
    from reportlab.pdfgen import canvas
    from reportlab.lib.units import mm
    from reportlab.lib import colors
    from datetime import datetime
    try:
        import qrcode
        from PIL import Image
        import tempfile
    except ImportError:
        raise HTTPException(500, "qrcode/Pillow not installed")

    eng = create_engine(os.environ.get("DATABASE_URL","postgresql+psycopg2://ai:ai123@localhost:5432/triangle_black"))
    with Session(eng) as db:
        asset = db.execute(text("""
            SELECT a.*, s.name as site_name FROM assets a
            LEFT JOIN sites s ON s.id=a.site_id WHERE a.id=:id
        """), {"id": asset_id}).fetchone()
        if not asset:
            raise HTTPException(404, "Asset not found")
        a = dict(asset._mapping)

    portal_url = os.environ.get("PORTAL_URL","http://localhost:3000")
    scan_url = f"{portal_url}/asset/{asset_id}"

    # Generate QR
    qr = qrcode.QRCode(error_correction=qrcode.constants.ERROR_CORRECT_H, box_size=8, border=2)
    qr.add_data(scan_url)
    qr.make(fit=True)
    qr_img = qr.make_image(fill_color="#0F172A", back_color="white")
    tmp = tempfile.NamedTemporaryFile(suffix=".png", delete=False)
    qr_img.save(tmp.name)
    tmp.close()

    buf = io.BytesIO()
    c = canvas.Canvas(buf, pagesize=(210*mm, 297*mm))
    W, H = 210*mm, 297*mm

    # Header
    c.setFillColor(colors.HexColor("#0F172A"))
    c.rect(0, H-30*mm, W, 30*mm, fill=1, stroke=0)
    c.setFillColor(colors.HexColor("#F59E0B"))
    c.setFont("Helvetica-Bold", 18)
    c.drawCentredString(W/2, H-16*mm, "TRIANGLE BLACK ENGINEERING SERVICES")
    c.setFillColor(colors.HexColor("#94A3B8"))
    c.setFont("Helvetica", 9)
    c.drawCentredString(W/2, H-24*mm, "Asset Identification & Maintenance QR Code")

    # QR Code
    qr_size = 100*mm
    qr_x = (W - qr_size) / 2
    c.drawImage(tmp.name, qr_x, H-145*mm, qr_size, qr_size)

    # Scan instruction
    c.setFillColor(colors.HexColor("#059669"))
    c.rect(30*mm, H-160*mm, W-60*mm, 12*mm, fill=1, stroke=0)
    c.setFillColor(colors.white)
    c.setFont("Helvetica-Bold", 11)
    c.drawCentredString(W/2, H-153*mm, "📱 Scan with phone camera to view asset & create work order")

    # Asset Details Box
    c.setFillColor(colors.HexColor("#F8FAFC"))
    c.rect(20*mm, H-240*mm, W-40*mm, 75*mm, fill=1, stroke=1)

    details = [
        ("Asset Name", a.get("name","—")),
        ("Category", a.get("category","—")),
        ("Manufacturer", f"{a.get('manufacturer','—')} {a.get('model','') or ''}"),
        ("Location", a.get("location_description","—") or "—"),
        ("Site", a.get("site_name","—")),
        ("Criticality", (a.get("criticality","—") or "—").upper()),
        ("Serial No.", a.get("serial_number","—") or "—"),
        ("Last Maintenance", str(a.get("last_maintenance_date","—") or "—")[:10]),
        ("Next Maintenance", str(a.get("next_maintenance_date","—") or "—")[:10]),
        ("Asset ID", asset_id[:20]),
    ]
    y = H-175*mm
    for i, (label, value) in enumerate(details):
        col = 0 if i % 2 == 0 else (W/2)
        if i % 2 == 0 and i > 0: y -= 9*mm
        c.setFillColor(colors.HexColor("#64748B"))
        c.setFont("Helvetica", 7)
        c.drawString(25*mm + col, y, label + ":")
        c.setFillColor(colors.HexColor("#0F172A"))
        c.setFont("Helvetica-Bold", 8)
        val = str(value)[:35] if value else "—"
        c.drawString(25*mm + col, y-4*mm, val)

    # Footer
    c.setFillColor(colors.HexColor("#1E293B"))
    c.rect(0, 0, W, 15*mm, fill=1, stroke=0)
    c.setFillColor(colors.HexColor("#94A3B8"))
    c.setFont("Helvetica", 7)
    c.drawCentredString(W/2, 6*mm, f"Generated: {datetime.utcnow().strftime('%d/%m/%Y')} | Triangle Black Engineering Services | MEP & Facilities Management")

    c.save()
    buf.seek(0)
    import os as _os
    _os.unlink(tmp.name)
    fname = f"QR_Sheet_{(a.get('name','asset'))[:20].replace(' ','_')}.pdf"
    return Response(content=buf.getvalue(), media_type="application/pdf",
                    headers={"Content-Disposition": f"inline; filename={fname}"})

# ── SPRINT 264+265: SLA DASHBOARD + TIME TRACKING ────────────────────────────

# SLA response time targets (hours) by urgency
SLA_RESPONSE = {"critical":2,"high":4,"medium":8,"low":24}
SLA_RESOLUTION = {"critical":8,"high":24,"medium":48,"low":72}

@app.get("/api/v1/sla/dashboard", tags=["sla"])
def sla_dashboard():
    """SLA compliance dashboard — response + resolution rates per site"""
    import os
    from sqlalchemy import text, create_engine
    from sqlalchemy.orm import Session
    from datetime import datetime
    eng = create_engine(os.environ.get("DATABASE_URL","postgresql+psycopg2://ai:ai123@localhost:5432/triangle_black"))
    with Session(eng) as db:
        def safe_list(q, p=None):
            try: return [dict(r._mapping) for r in db.execute(text(q),p or {}).fetchall()]
            except: db.rollback(); return []
        def safe(q, p=None):
            try: r=db.execute(text(q),p or {}).fetchone(); return dict(r._mapping) if r else {}
            except: db.rollback(); return {}

        # Overall SLA summary from service requests
        overall = safe("""
            SELECT
              count(*) as total_requests,
              count(*) FILTER (WHERE status='resolved' OR resolved_at IS NOT NULL) as resolved,
              count(*) FILTER (WHERE urgency='critical') as critical_count,
              count(*) FILTER (WHERE urgency='high') as high_count,
              ROUND(AVG(CASE WHEN resolved_at IS NOT NULL
                THEN EXTRACT(EPOCH FROM (resolved_at - created_at))/3600
                ELSE NULL END)::numeric, 2) as avg_resolution_hours
            FROM service_requests
        """)

        # Per-site SLA performance
        site_sla = safe_list("""
            SELECT
              s.id as site_id, s.name as site_name,
              count(sr.id) as total_requests,
              count(sr.id) FILTER (WHERE sr.status IN ('resolved','completed')) as resolved,
              count(sr.id) FILTER (WHERE sr.urgency='critical') as critical,
              count(sr.id) FILTER (WHERE sr.urgency='high') as high_urgency,
              count(sr.id) FILTER (WHERE sr.status='open') as open_count,
              count(sr.id) FILTER (WHERE sr.status='in_progress') as in_progress,
              ROUND(AVG(CASE WHEN sr.resolved_at IS NOT NULL
                THEN EXTRACT(EPOCH FROM (sr.resolved_at - sr.created_at))/3600
                ELSE NULL END)::numeric, 2) as avg_resolution_hours,
              ROUND(
                100.0 * count(sr.id) FILTER (WHERE sr.status IN ('resolved','completed')) /
                NULLIF(count(sr.id), 0)
              , 1) as resolution_rate_pct
            FROM sites s
            LEFT JOIN service_requests sr ON sr.site_id=s.id
            GROUP BY s.id, s.name
            ORDER BY s.name
        """)

        # Work order response SLA (time from created to started)
        wo_sla = safe_list("""
            SELECT
              wo.priority,
              count(*) as total,
              count(*) FILTER (WHERE wo.started_at IS NOT NULL) as started,
              ROUND(AVG(CASE WHEN wo.started_at IS NOT NULL
                THEN EXTRACT(EPOCH FROM (wo.started_at - wo.created_at))/3600
                ELSE NULL END)::numeric, 2) as avg_response_hours,
              count(*) FILTER (WHERE wo.started_at IS NOT NULL AND
                EXTRACT(EPOCH FROM (wo.started_at - wo.created_at))/3600 >
                CASE wo.priority WHEN 'critical' THEN 2 WHEN 'high' THEN 4
                WHEN 'medium' THEN 8 ELSE 24 END
              ) as breached_response
            FROM work_orders wo
            WHERE wo.created_at > NOW()-INTERVAL '30 days'
            GROUP BY wo.priority
            ORDER BY CASE wo.priority WHEN 'critical' THEN 1 WHEN 'high' THEN 2
                     WHEN 'medium' THEN 3 ELSE 4 END
        """)

        # Current SLA breaches (open items past SLA deadline)
        breaches = safe_list("""
            SELECT sr.id, sr.title, sr.urgency, sr.status, sr.created_at,
                   s.name as site_name,
                   ROUND(EXTRACT(EPOCH FROM (NOW()-sr.created_at))/3600::numeric, 1) as hours_open,
                   CASE sr.urgency
                     WHEN 'critical' THEN 8 WHEN 'high' THEN 24
                     WHEN 'medium' THEN 48 ELSE 72
                   END as sla_target_hours,
                   ROUND(EXTRACT(EPOCH FROM (NOW()-sr.created_at))/3600 -
                     CASE sr.urgency WHEN 'critical' THEN 8 WHEN 'high' THEN 24
                     WHEN 'medium' THEN 48 ELSE 72 END, 1) as hours_overdue
            FROM service_requests sr
            LEFT JOIN sites s ON s.id=sr.site_id
            WHERE sr.status NOT IN ('resolved','completed','cancelled')
            AND EXTRACT(EPOCH FROM (NOW()-sr.created_at))/3600 >
              CASE sr.urgency WHEN 'critical' THEN 8 WHEN 'high' THEN 24
              WHEN 'medium' THEN 48 ELSE 72 END
            ORDER BY hours_overdue DESC LIMIT 10
        """)

        # SLA compliance score per site (0-100)
        for site in site_sla:
            total = site.get("total_requests") or 1
            resolved = site.get("resolved") or 0
            open_critical = (site.get("critical") or 0) - resolved
            score = max(0, min(100, int(resolved/total*100) - open_critical*5))
            site["sla_score"] = score
            site["sla_grade"] = "A" if score>=90 else "B" if score>=75 else "C" if score>=60 else "D"

        return {
            "generated_at": datetime.utcnow().isoformat(),
            "overall": overall,
            "site_sla": site_sla,
            "work_order_sla": wo_sla,
            "active_breaches": breaches,
            "breach_count": len(breaches),
            "sla_targets": SLA_RESOLUTION
        }

@app.get("/api/v1/sla/breaches", tags=["sla"])
def sla_breaches(site_id: str = None, urgency: str = None):
    """All active SLA breaches"""
    import os
    from sqlalchemy import text, create_engine
    from sqlalchemy.orm import Session
    eng = create_engine(os.environ.get("DATABASE_URL","postgresql+psycopg2://ai:ai123@localhost:5432/triangle_black"))
    with Session(eng) as db:
        try:
            where = ["sr.status NOT IN ('resolved','completed','cancelled')"]
            params = {}
            if site_id: where.append("sr.site_id=:sid"); params["sid"]=site_id
            if urgency: where.append("sr.urgency=:u"); params["u"]=urgency
            rows = db.execute(text(f"""
                SELECT sr.id, sr.title, sr.urgency, sr.status, sr.created_at, sr.submitted_by,
                       s.name as site_name,
                       ROUND(EXTRACT(EPOCH FROM (NOW()-sr.created_at))/3600, 1) as hours_open,
                       CASE sr.urgency WHEN 'critical' THEN 8 WHEN 'high' THEN 24
                         WHEN 'medium' THEN 48 ELSE 72 END as sla_target_hours
                FROM service_requests sr LEFT JOIN sites s ON s.id=sr.site_id
                WHERE {" AND ".join(where)}
                ORDER BY CASE sr.urgency WHEN 'critical' THEN 1 WHEN 'high' THEN 2
                         WHEN 'medium' THEN 3 ELSE 4 END, sr.created_at ASC
            """), params).fetchall()
            result = []
            for r in rows:
                d = dict(r._mapping)
                d["is_breached"] = float(d.get("hours_open") or 0) > float(d.get("sla_target_hours") or 72)
                d["hours_overdue"] = max(0, float(d.get("hours_open") or 0) - float(d.get("sla_target_hours") or 72))
                result.append(d)
            return sorted(result, key=lambda x: x.get("hours_overdue",0), reverse=True)
        except Exception as e:
            db.rollback(); return []

@app.post("/api/v1/time-entries/", tags=["time-tracking"])
async def log_time(request: Request):
    """Log time entry for a work order"""
    import os, uuid
    from sqlalchemy import text, create_engine
    from sqlalchemy.orm import Session
    from datetime import datetime
    body = await request.json()
    eng = create_engine(os.environ.get("DATABASE_URL","postgresql+psycopg2://ai:ai123@localhost:5432/triangle_black"))
    with Session(eng) as db:
        try:
            start = body.get("start_time")
            end = body.get("end_time")
            hours = float(body.get("hours_logged", 0))
            if not hours and start and end:
                from datetime import datetime as dt
                s = dt.fromisoformat(str(start).replace("Z",""))
                e = dt.fromisoformat(str(end).replace("Z",""))
                hours = round((e-s).total_seconds()/3600, 2)

            # Get technician hourly rate
            tech = db.execute(text("SELECT id FROM technicians WHERE id=:id"), {"id": body.get("technician_id","")}).fetchone()
            hourly_rate = float(body.get("hourly_rate") or 150)
            labor_cost = round(hours * hourly_rate, 2)

            entry_id = str(uuid.uuid4())
            db.execute(text("""
                INSERT INTO time_entries
                  (id, hotel_id, work_order_id, technician_id, work_type,
                   start_time, end_time, hours_logged, hourly_rate, labor_cost,
                   notes, is_billable)
                VALUES
                  (:id, 'tb-default-hotel-000000000001', :wo, :tech, :wtype,
                   :start, :end, :hours, :rate, :cost,
                   :notes, :billable)
            """), {
                "id": entry_id, "wo": body.get("work_order_id"),
                "tech": body.get("technician_id"), "wtype": body.get("work_type","on_site"),
                "start": start or __import__("datetime").datetime.utcnow().isoformat(), "end": end, "hours": hours,
                "rate": hourly_rate, "cost": labor_cost,
                "notes": body.get("notes",""), "billable": body.get("is_billable",True)
            })
            # Update WO labor cost total
            db.execute(text("""
                UPDATE work_orders SET updated_at=NOW()
                WHERE id=:id
            """), {"id": body.get("work_order_id")})
            db.commit()
            return {"id":entry_id,"hours_logged":hours,"labor_cost":labor_cost,"status":"logged"}
        except Exception as e:
            db.rollback(); return {"error": str(e)}

@app.get("/api/v1/time-entries/", tags=["time-tracking"])
def list_time_entries(work_order_id: str = None, technician_id: str = None, limit: int = 50):
    """List time entries"""
    import os
    from sqlalchemy import text, create_engine
    from sqlalchemy.orm import Session
    eng = create_engine(os.environ.get("DATABASE_URL","postgresql+psycopg2://ai:ai123@localhost:5432/triangle_black"))
    with Session(eng) as db:
        try:
            where, params = ["1=1"], {"l": limit}
            if work_order_id: where.append("te.work_order_id=:wo"); params["wo"]=work_order_id
            if technician_id: where.append("te.technician_id=:tid"); params["tid"]=technician_id
            rows = db.execute(text(f"""
                SELECT te.*, t.name as technician_name, wo.title as wo_title
                FROM time_entries te
                LEFT JOIN technicians t ON t.id=te.technician_id
                LEFT JOIN work_orders wo ON wo.id=te.work_order_id
                WHERE {" AND ".join(where)}
                ORDER BY te.start_time DESC LIMIT :l
            """), params).fetchall()
            return [dict(r._mapping) for r in rows]
        except Exception as e:
            db.rollback(); return []

@app.get("/api/v1/time-entries/summary", tags=["time-tracking"])
def time_tracking_summary():
    """Time tracking summary — utilization, costs, by technician"""
    import os
    from sqlalchemy import text, create_engine
    from sqlalchemy.orm import Session
    eng = create_engine(os.environ.get("DATABASE_URL","postgresql+psycopg2://ai:ai123@localhost:5432/triangle_black"))
    with Session(eng) as db:
        def safe_list(q, p=None):
            try: return [dict(r._mapping) for r in db.execute(text(q),p or {}).fetchall()]
            except: db.rollback(); return []
        def safe(q, p=None):
            try: r=db.execute(text(q),p or {}).fetchone(); return dict(r._mapping) if r else {}
            except: db.rollback(); return {}

        totals = safe("""
            SELECT count(*) as total_entries,
              COALESCE(sum(hours_logged),0) as total_hours,
              COALESCE(sum(labor_cost),0) as total_labor_cost,
              COALESCE(avg(hours_logged),0) as avg_hours_per_entry
            FROM time_entries
        """)

        by_tech = safe_list("""
            SELECT t.id, t.name, t.specializations,
              count(te.id) as entries,
              COALESCE(sum(te.hours_logged),0) as total_hours,
              COALESCE(sum(te.labor_cost),0) as total_cost,
              COALESCE(avg(te.hours_logged),0) as avg_hours
            FROM technicians t
            LEFT JOIN time_entries te ON te.technician_id=t.id
            WHERE t.id LIKE 'tech-%'
            GROUP BY t.id, t.name, t.specializations
            ORDER BY total_hours DESC
        """)

        by_work_type = safe_list("""
            SELECT work_type,
              count(*) as entries,
              COALESCE(sum(hours_logged),0) as total_hours,
              COALESCE(sum(labor_cost),0) as total_cost
            FROM time_entries
            GROUP BY work_type ORDER BY total_hours DESC
        """)

        by_wo = safe_list("""
            SELECT te.work_order_id, wo.title, wo.priority, wo.status,
              count(te.id) as entries,
              COALESCE(sum(te.hours_logged),0) as total_hours,
              COALESCE(sum(te.labor_cost),0) as total_cost
            FROM time_entries te
            LEFT JOIN work_orders wo ON wo.id=te.work_order_id
            GROUP BY te.work_order_id, wo.title, wo.priority, wo.status
            ORDER BY total_hours DESC LIMIT 10
        """)

        return {
            "totals": totals,
            "by_technician": by_tech,
            "by_work_type": by_work_type,
            "top_work_orders": by_wo
        }
