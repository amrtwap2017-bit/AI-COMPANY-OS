# TRIANGLE BLACK — DEPENDENCY GRAPH

## Backend Dependencies
src.core.base          ← imported by ALL models
src.core.database      ← imported by ALL routers (get_db)
src.core.auth          ← imported by ALL routers (require_*)
src.core.tenant        ← imported by ALL routers (get_hotel_id)
src.core.actions       ← imports ALL domain models (for DB queries)
src.main               ← imports ALL routers + registers them

## Domain Module Structure (each follows this pattern)
src/commercial/<name>/
  __init__.py
  models.py      ← imports Base from src.core.base
  schemas.py     ← imports BaseModel from pydantic
  repository.py  ← imports Session from sqlalchemy.orm
  router.py      ← imports get_db, require_*, get_hotel_id, Repository, Schemas

## Actions.py Imports (critical — add new models here)
Currently imports: Lead, Agent, Quote, Activity, Contract, User,
                   Notification, Invoice, WorkOrder, Technician,
                   Site, Asset, ServiceRequest, ServiceReport,
                   InventoryItem, Warehouse, InventoryVendor,
                   StockMovement, PurchaseRequest, PurchaseOrder,
                   GoodsReceipt, RFQ, RFQVendorQuote,
                   VendorScorecard, ProcurementEvent

## Main.py Registration Pattern
# 1. Import model (for SQLAlchemy registration)
from src.commercial.<name>.models import <Model>  # noqa
# 2. Import router
from src.commercial.<name>.router import router as <name>_router
# 3. Register
app.include_router(<name>_router, prefix="/api/v1")

## Frontend API Dependencies
portal/lib/api.ts exports:
  leadsApi, agentsApi, quotesApi, contractsApi, invoicesApi
  notificationsApi, reportsApi, inventoryApi, serviceOpsApi
  (each uses localStorage.getItem("tb_token"))

client-portal/lib/api.ts exports:
  api (axios instance with client_token)
  invoicesApi (uses api instance)

## Docker Dependencies
ai-postgres (pgvector:pg17) → must be running for API to start
API → must be running for all portals to show data
Ollama → only needed for TB Agent commands

## Port Conflict Risk
5432 → ai-postgres (Triangle Black uses this)
5434 → triangle-black own container (NOT used by API — use 5432)
