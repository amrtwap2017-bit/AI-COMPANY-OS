# Triangle Black — Architecture

## Stack
Backend: FastAPI + Python 3.12 + SQLAlchemy + PostgreSQL
Cache: Redis
Auth: JWT (hotel_id in claims)
Frontend: Next.js 14 (App Router)
Server: port 8030 (API), port 3000 (portal)

## Module Pattern
src/commercial/{module}/
  __init__.py
  router.py    ← APIRouter with Depends(get_current_user)
  service.py   ← Business logic, reads DB directly

## Router Registration
Hotels router anchor: "app.include_router(hotels_router, prefix=API_PREFIX)"
New routers registered via try/except pattern:
  try:
      from src.commercial.{mod}.router import router as {mod}_router
      app.include_router({mod}_router, prefix=API_PREFIX)
      print('  OK: {mod}_router')
  except Exception as _e:
      logger.warning(...)

## Key Modules (V6)
  onboarding/ — POST /onboarding/provision + validate + status
  data_import/ — preview/validate/assets/suppliers/schema/history
  recommendations/ — generate/list/get/approve/reject/history/summary
  roi/ — snapshot/snapshots/delta/report
  digital_twin/ — state/graph/impact-chain/asset-impact/wo-impact
  ai_directors/ — maintenance/procurement/operations/executive/all/analyze

## Design System
  globals.css: tb- prefix classes
  Available: tb-canvas, tb-kpi, tb-section, tb-table, tb-badge
  Flex: tb-flex-between, tb-flex-col, tb-flex-gap-3
  New (V6-F04): tb-flex-col-gap-sm/md, tb-text-center, tb-mt-sm/md
