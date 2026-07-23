from __future__ import annotations

"""
Triangle Black — Main FastAPI Application v1.4.0
Hotel Engineering Platform — Multi-hotel tenant isolation
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

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



app = FastAPI(
    title="Triangle Black API",
    description="Hotel Engineering Platform — Multi-Hotel",
    version="3.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

API_PREFIX = "/api/v1"

app.include_router(leads_router,         prefix=API_PREFIX)
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
app.include_router(warehouses_router, prefix="/api/v1")
app.include_router(inv_vendors_router, prefix="/api/v1")
app.include_router(stock_movements_router, prefix="/api/v1")
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
    from src.commercial.projects.router import router as projects_router
    from src.commercial.dashboard.router import router as dashboard_router
    from src.commercial.system_notifications.router import router as notifications_router

    app.include_router(payment_tracking_router, prefix="/api/v1")
    app.include_router(projects_router,          prefix="/api/v1")
    app.include_router(dashboard_router,         prefix="/api/v1")
    app.include_router(notifications_router,     prefix="/api/v1")
except ImportError as e:
    print(f"[WARN] Sprint 20 module import failed: {e}")

# ── Auto-wired Sprint 20-22 modules ──────────────────────────────────────
try:
    from src.commercial.activity_tracking.router import router as activity_tracking_router
    app.include_router(activity_tracking_router, prefix="/api/v1")
except Exception as e:
    print(f"[WARN] activity_tracking: {e}")
try:
    from src.commercial.agent_management.router import router as agent_management_router
    app.include_router(agent_management_router, prefix="/api/v1")
except Exception as e:
    print(f"[WARN] agent_management: {e}")
try:
    from src.commercial.documents.router import router as documents_router
    app.include_router(documents_router, prefix="/api/v1")
except Exception as e:
    print(f"[WARN] documents: {e}")
try:
    from src.commercial.email_notifications.router import router as email_notifications_router
    app.include_router(email_notifications_router, prefix="/api/v1")
except Exception as e:
    print(f"[WARN] email_notifications: {e}")
try:
    from src.commercial.email_service.router import router as email_service_router
    app.include_router(email_service_router, prefix="/api/v1")
except Exception as e:
    print(f"[WARN] email_service: {e}")
try:
    from src.commercial.inventory_alerts.router import router as inventory_alerts_router
    app.include_router(inventory_alerts_router, prefix="/api/v1")
except Exception as e:
    print(f"[WARN] inventory_alerts: {e}")
try:
    from src.commercial.inventory_items.router import router as inventory_items_router
    app.include_router(inventory_items_router, prefix="/api/v1")
except Exception as e:
    print(f"[WARN] inventory_items: {e}")
try:
    from src.commercial.inventory_vendors.router import router as inventory_vendors_router
    app.include_router(inventory_vendors_router, prefix="/api/v1")
except Exception as e:
    print(f"[WARN] inventory_vendors: {e}")
try:
    from src.commercial.lead_management.router import router as lead_management_router
    app.include_router(lead_management_router, prefix="/api/v1")
except Exception as e:
    print(f"[WARN] lead_management: {e}")
try:
    from src.commercial.pdf_service.router import router as pdf_service_router
    app.include_router(pdf_service_router, prefix="/api/v1")
except Exception as e:
    print(f"[WARN] pdf_service: {e}")
try:
    from src.commercial.pipeline_dashboard.router import router as pipeline_dashboard_router
    app.include_router(pipeline_dashboard_router, prefix="/api/v1")
except Exception as e:
    print(f"[WARN] pipeline_dashboard: {e}")
try:
    from src.commercial.search_filters.router import router as search_filters_router
    app.include_router(search_filters_router, prefix="/api/v1")
except Exception as e:
    print(f"[WARN] search_filters: {e}")
try:
    from src.commercial.system_notifications.router import router as system_notifications_router
    app.include_router(system_notifications_router, prefix="/api/v1")
except Exception as e:
    print(f"[WARN] system_notifications: {e}")
try:
    from src.commercial.vendor_portal.router import router as vendor_portal_router
    app.include_router(vendor_portal_router, prefix="/api/v1")
except Exception as e:
    print(f"[WARN] vendor_portal: {e}")
try:
    from src.commercial.webhook_notifications.router import router as webhook_notifications_router
    app.include_router(webhook_notifications_router, prefix="/api/v1")
except Exception as e:
    print(f"[WARN] webhook_notifications: {e}")

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
    print("  OK: analytics_router")
except Exception as e:
    print(f"  WARN: analytics_router: {e}")

# ── Sprint 62: Document Control ──────────────────────────────
try:
    from src.commercial.ai_assistant.document_router import router as ai_doc_router
    app.include_router(ai_doc_router, prefix="/api/v1")

    print("  OK: document_router")
except Exception as e:
    print(f"  WARN: document_router: {e}")

# ── Sprint 68 — Workflow + Finance + AI + Digital Twin ─────────────────────
try:
    from src.commercial.analytics_kpi.router import router as analytics_kpi_router
    app.include_router(analytics_kpi_router, prefix="/api/v1")
    print("  OK: analytics_kpi_router")
except Exception as e:
    print(f"  WARN analytics_kpi: {e}")

try:
    from src.commercial.ai_signals.router import router as ai_signals_v2_router
    app.include_router(ai_signals_v2_router, prefix="/api/v1")
    print("  OK: ai_signals_v2_router")
except Exception as e:
    print(f"  WARN ai_signals: {e}")

try:
    from src.commercial.digital_twin.router import router as digital_twin_router
    app.include_router(digital_twin_router, prefix="/api/v1")
    print("  OK: digital_twin_router")
except Exception as e:
    print(f"  WARN digital_twin: {e}")

# ── Sprint 69 — Project Workflow + Supplier Portal + Digital Twin Fix ─────────
try:
    from src.commercial.supplier_portal.router import router as supplier_portal_router
    app.include_router(supplier_portal_router, prefix="/api/v1")
    print("  OK: supplier_portal_router")
except Exception as e:
    print(f"  WARN supplier_portal: {e}")

# ── Sprint 70 — Customer Success + AI Scheduling + Earned Value ───────────────
try:
    from src.commercial.customer_success.router import router as customer_success_router
    app.include_router(customer_success_router, prefix="/api/v1")
    print("  OK: customer_success_router")
except Exception as e:
    print(f"  WARN customer_success: {e}")

try:
    from src.commercial.ai_scheduling.router import router as ai_scheduling_router
    app.include_router(ai_scheduling_router, prefix="/api/v1")
    print("  OK: ai_scheduling_router")
except Exception as e:
    print(f"  WARN ai_scheduling: {e}")

# ── Sprint 71 — Knowledge Graph + Payment Tracking + Warranty ─────────────────
try:
    from src.commercial.knowledge_graph.router import router as knowledge_graph_router
    app.include_router(knowledge_graph_router, prefix="/api/v1")
    print("  OK: knowledge_graph_router")
except Exception as e:
    print(f"  WARN knowledge_graph: {e}")

try:
    from src.commercial.warranty.router import router as warranty_router
    app.include_router(warranty_router, prefix="/api/v1")
    print("  OK: warranty_router")
except Exception as e:
    print(f"  WARN warranty: {e}")
