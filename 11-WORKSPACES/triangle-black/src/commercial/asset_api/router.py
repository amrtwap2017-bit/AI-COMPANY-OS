"""Asset API Router — extracted from main.py A-007 batch 5"""
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import text
from src.core.database import get_db
from src.core.tenant import get_hotel_id
import uuid, datetime
from datetime import datetime as _dt

router = APIRouter(prefix="/assets-v2", tags=["assets"])

@router.get("/critical-summary")
def get_critical_assets_summary(hotel_id: str = Depends(get_hotel_id),
                                  db: Session = Depends(get_db)):
    try:
        row = db.execute(text("""
            SELECT
                COUNT(*) AS total,
                COUNT(*) FILTER (WHERE criticality='critical') AS critical,
                COUNT(*) FILTER (WHERE criticality='high') AS high,
                COUNT(*) FILTER (WHERE LOWER(status) IN ('operational','active')) AS operational,
                COUNT(*) FILTER (WHERE LOWER(status) = 'maintenance') AS in_maintenance,
                COUNT(*) FILTER (WHERE LOWER(status) = 'failed') AS failed
            FROM assets WHERE hotel_id=:hid AND deleted_at IS NULL
        """), {"hid": hotel_id}).fetchone()
        result = dict(row._mapping) if row else {}
        result["hotel_id"] = hotel_id
        total = result.get("total", 1)
        result["health_pct"] = round(result.get("operational", 0) / max(total, 1) * 100, 1)
        return result
    except Exception as e:
        return {"hotel_id": hotel_id, "error": str(e)[:100]}

@router.post("/import-csv-row")
def import_asset_csv_row(data: dict,
                          hotel_id: str = Depends(get_hotel_id),
                          db: Session = Depends(get_db)):
    """
    Import a single asset row from CSV — A-009 domain rule fix.
    assets table has NO score column — do not pass score.
    """
    required = ["name", "category", "criticality"]
    for field in required:
        if not data.get(field):
            raise HTTPException(400, f"Missing required field: {field}")

    site_id = data.get("site_id")
    if not site_id:
        site = db.execute(text(
            "SELECT id FROM sites WHERE hotel_id=:hid LIMIT 1"
        ), {"hid": hotel_id}).fetchone()
        if not site:
            raise HTTPException(400, "No site found for this tenant. Create a site first.")
        site_id = site.id

    asset_id = str(uuid.uuid4())
    now = _dt.utcnow()
    try:
        db.execute(text("""
            INSERT INTO assets (id, hotel_id, site_id, name, category, criticality,
                status, manufacturer, model, serial_number, notes, created_at, updated_at)
            VALUES (:id, :hid, :site_id, :name, :cat, :crit,
                :status, :manufacturer, :model, :serial, :notes, :now, :now)
            ON CONFLICT (id) DO NOTHING
        """), {
            "id": asset_id, "hid": hotel_id, "site_id": site_id,
            "name": data["name"], "cat": data["category"],
            "crit": data["criticality"],
            "status": data.get("status", "operational"),
            "manufacturer": data.get("manufacturer", ""),
            "model": data.get("model", ""),
            "serial": data.get("serial_number", ""),
            "notes": data.get("notes", ""),
            "now": now
        })
        db.commit()
        return {"success": True, "asset_id": asset_id, "name": data["name"],
                "note": "score column does not exist — A-009 domain rule: no score field"}
    except Exception as e:
        db.rollback()
        raise HTTPException(500, str(e)[:200])
