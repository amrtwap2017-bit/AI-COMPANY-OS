"""Platform Operations Status — T-015"""
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import text
from src.core.database import get_db
from src.core.tenant import get_hotel_id

router = APIRouter(prefix="/api/v1/platform", tags=["Platform Status"])


@router.get("/status")
def get_platform_status(
    hotel_id: str = Depends(get_hotel_id),
    db: Session = Depends(get_db)
):
    from src.core.cache import cache_get, cache_set, make_cache_key
    cache_key = make_cache_key("platform_status", hotel_id)
    cached = cache_get(cache_key)
    if cached:
        return cached

    res = {
        "hotel_id": hotel_id,
        "subsystems": {
            "database":     _db_health(db),
            "events":       _events_stats(db, hotel_id),
            "workflow":     _workflow_stats(db, hotel_id),
            "sla":          _sla_stats(db, hotel_id),
            "digital_twin": _twin_stats(db, hotel_id),
            "operations":   _operations_stats(db, hotel_id),
        }
    }
    cache_set(cache_key, res, ttl=15)
    return res


@router.get("/events")
def get_platform_events(
    hotel_id: str = Depends(get_hotel_id),
    db: Session = Depends(get_db),
    status: str = None,
    limit: int = 50,
    skip: int = 0
):
    try:
        q = "SELECT id, event_type, aggregate_type, aggregate_id, status, created_at, correlation_id FROM platform_events WHERE hotel_id = :hid"
        params = {"hid": hotel_id}
        if status:
            q += " AND status = :status"
            params["status"] = status
        q += " ORDER BY created_at DESC LIMIT :lim OFFSET :sk"
        params["lim"] = limit
        params["sk"] = skip
        rows = db.execute(text(q), params).fetchall()
        count_q = "SELECT COUNT(*) FROM platform_events WHERE hotel_id = :hid"
        if status:
            count_q += " AND status = :status"
        count = db.execute(text(count_q), params).fetchone()
        return {
            "hotel_id": hotel_id,
            "count": int(count[0]) if count else 0,
            "results": [dict(r._mapping) for r in rows]
        }
    except Exception as e:
        return {"hotel_id": hotel_id, "count": 0, "results": [], "error": str(e)}


@router.get("/events/stats")
def get_events_stats(
    hotel_id: str = Depends(get_hotel_id),
    db: Session = Depends(get_db)
):
    return _events_stats(db, hotel_id)


def _db_health(db: Session) -> dict:
    try:
        db.execute(text("SELECT 1")).fetchone()
        return {"status": "healthy", "connected": True}
    except Exception as e:
        return {"status": "unhealthy", "connected": False, "error": str(e)}


def _events_stats(db: Session, hotel_id: str) -> dict:
    try:
        row = db.execute(text("""
            SELECT COUNT(*) AS total,
                   SUM(CASE WHEN status='pending' THEN 1 ELSE 0 END) AS pending,
                   SUM(CASE WHEN status='dispatched' THEN 1 ELSE 0 END) AS dispatched,
                   SUM(CASE WHEN status='failed' THEN 1 ELSE 0 END) AS failed
            FROM platform_events WHERE hotel_id = :hid
        """), {"hid": hotel_id}).fetchone()
        d = dict(row._mapping) if row else {}
        failed = int(d.get("failed") or 0)
        return {
            "total": int(d.get("total") or 0),
            "pending": int(d.get("pending") or 0),
            "dispatched": int(d.get("dispatched") or 0),
            "failed": failed,
            "status": "healthy" if failed == 0 else "degraded",
        }
    except Exception as e:
        return {"status": "unknown", "error": str(e)}


def _workflow_stats(db: Session, hotel_id: str) -> dict:
    try:
        row = db.execute(text("""
            SELECT COUNT(*) AS total,
                   SUM(CASE WHEN status='active' THEN 1 ELSE 0 END) AS active,
                   SUM(CASE WHEN status='completed' THEN 1 ELSE 0 END) AS completed,
                   SUM(CASE WHEN status='failed' THEN 1 ELSE 0 END) AS failed
            FROM workflow_instances WHERE hotel_id = :hid
        """), {"hid": hotel_id}).fetchone()
        d = dict(row._mapping) if row else {}
        return {
            "total": int(d.get("total") or 0),
            "active": int(d.get("active") or 0),
            "completed": int(d.get("completed") or 0),
            "failed": int(d.get("failed") or 0),
            "status": "healthy",
        }
    except Exception as e:
        return {"status": "unknown", "error": str(e)}


def _sla_stats(db: Session, hotel_id: str) -> dict:
    try:
        row = db.execute(text("""
            SELECT COUNT(*) AS total,
                   SUM(CASE WHEN sla_status='met' THEN 1 ELSE 0 END) AS met,
                   SUM(CASE WHEN sla_status='breached' THEN 1 ELSE 0 END) AS breached,
                   SUM(CASE WHEN sla_status='on_track' THEN 1 ELSE 0 END) AS on_track
            FROM work_orders WHERE hotel_id = :hid AND deleted_at IS NULL
        """), {"hid": hotel_id}).fetchone()
        d = dict(row._mapping) if row else {}
        total = int(d.get("total") or 0)
        met = int(d.get("met") or 0)
        breached = int(d.get("breached") or 0)
        return {
            "total": total, "met": met, "breached": breached,
            "on_track": int(d.get("on_track") or 0),
            "compliance_pct": round(100.0 * met / total, 1) if total else 0.0,
            "status": "healthy" if breached == 0 else ("degraded" if breached < 5 else "critical"),
        }
    except Exception as e:
        return {"status": "unknown", "error": str(e)}


def _twin_stats(db: Session, hotel_id: str) -> dict:
    try:
        nodes = db.execute(text("SELECT COUNT(*) FROM twin_nodes WHERE hotel_id=:hid"), {"hid": hotel_id}).fetchone()
        edges = db.execute(text("SELECT COUNT(*) FROM twin_edges WHERE hotel_id=:hid"), {"hid": hotel_id}).fetchone()
        return {"nodes": int(nodes[0]) if nodes else 0, "edges": int(edges[0]) if edges else 0, "status": "healthy"}
    except Exception as e:
        return {"status": "unknown", "error": str(e)}


def _operations_stats(db: Session, hotel_id: str) -> dict:
    try:
        wo = db.execute(text("SELECT COUNT(*) FROM work_orders WHERE hotel_id=:hid AND status='open' AND deleted_at IS NULL"), {"hid": hotel_id}).fetchone()
        sr = db.execute(text("SELECT COUNT(*) FROM service_requests WHERE hotel_id=:hid AND status='open'"), {"hid": hotel_id}).fetchone()
        assets = db.execute(text("SELECT COUNT(*) FROM assets WHERE hotel_id=:hid AND status='operational' AND deleted_at IS NULL"), {"hid": hotel_id}).fetchone()
        return {
            "open_work_orders": int(wo[0]) if wo else 0,
            "open_service_requests": int(sr[0]) if sr else 0,
            "operational_assets": int(assets[0]) if assets else 0,
            "status": "healthy",
        }
    except Exception as e:
        return {"status": "unknown", "error": str(e)}

@router.post("/sla-scan")
def trigger_sla_scan(
    hotel_id: str = Depends(get_hotel_id),
    db: Session = Depends(get_db)
):
    """
    Manually trigger SLA breach scan for this tenant.
    Marks newly breached WOs and emits WO_SLA_BREACHED events.
    T-019
    """
    try:
        from src.core.sla_scanner import scan_and_emit_sla_breaches
        result = scan_and_emit_sla_breaches(db=db, hotel_id=hotel_id, actor="manual_scan")
        return result
    except Exception as e:
        return {"hotel_id": hotel_id, "error": str(e)}


@router.get("/sla-breach-summary")
def get_sla_breach_summary(
    hotel_id: str = Depends(get_hotel_id),
    db: Session = Depends(get_db)
):
    """SLA breach state summary for this tenant. T-019"""
    try:
        from src.core.sla_scanner import get_breach_summary
        return get_breach_summary(db=db, hotel_id=hotel_id)
    except Exception as e:
        return {"hotel_id": hotel_id, "error": str(e)}

@router.get("/procurement")
def get_procurement_dashboard(
    hotel_id: str = Depends(get_hotel_id),
    db: Session = Depends(get_db)
):
    """Procurement KPI read model — T-020"""
    from src.core.cache import cache_get, cache_set, make_cache_key
    cache_key = make_cache_key("platform_procurement", hotel_id)
    cached = cache_get(cache_key)
    if cached:
        return cached

    try:
        from src.commercial.executive_dashboard.procurement_read_models import ProcurementReadModel
        rm = ProcurementReadModel(db=db, hotel_id=hotel_id)
        res = rm.get_full_procurement_dashboard()
        cache_set(cache_key, res, ttl=30)
        return res
    except Exception as e:
        return {"hotel_id": hotel_id, "error": str(e)}

@router.get("/assets")
def get_asset_dashboard(
    hotel_id: str = Depends(get_hotel_id),
    db: Session = Depends(get_db)
):
    """Asset and maintenance KPI read model — T-022"""
    from src.core.cache import cache_get, cache_set, make_cache_key
    cache_key = make_cache_key("platform_assets", hotel_id)
    cached = cache_get(cache_key)
    if cached:
        return cached

    try:
        from src.commercial.executive_dashboard.asset_read_models import AssetReadModel
        rm = AssetReadModel(db=db, hotel_id=hotel_id)
        res = rm.get_full_asset_dashboard()
        cache_set(cache_key, res, ttl=30)
        return res
    except Exception as e:
        return {"hotel_id": hotel_id, "error": str(e)}


@router.get("/telemetry", tags=["Platform Status"])
def get_observability_telemetry(
    hotel_id: str = Depends(get_hotel_id)
):
    """Observability & Telemetry Platform — N-004"""
    from src.core.observability import telemetry_store
    report = telemetry_store.get_telemetry_report()
    report["hotel_id"] = hotel_id
    report["status"] = "operational"
    return report
