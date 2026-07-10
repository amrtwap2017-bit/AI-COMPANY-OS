"""
Triangle Black — Main FastAPI Application v1.4.0
Hotel Engineering Platform — Multi-hotel tenant isolation
"""
from __future__ import annotations
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
