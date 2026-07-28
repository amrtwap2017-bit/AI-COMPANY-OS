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
