from __future__ import annotations
import uuid, datetime
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import text
from src.core.database import get_db

router = APIRouter(prefix="/warranty", tags=["warranty"])

def row_to_dict(row):
    if row is None: return {}
    if hasattr(row, "_mapping"): return dict(row._mapping)
    return {}

def _ensure_warranty_table(db):
    db.execute(text("""
        CREATE TABLE IF NOT EXISTS asset_warranties (
            id              VARCHAR(36) PRIMARY KEY,
            asset_id        VARCHAR(36) NOT NULL,
            hotel_id        VARCHAR(36),
            contract_id     VARCHAR(36),
            warranty_type   VARCHAR(50) DEFAULT 'manufacturer',
            provider        VARCHAR(200),
            start_date      DATE NOT NULL,
            end_date        DATE NOT NULL,
            coverage_details TEXT,
            status          VARCHAR(20) DEFAULT 'active',
            created_at      TIMESTAMP NOT NULL
        )
    """))
    db.commit()

@router.get("/overview", summary="Warranty portfolio overview")
def warranty_overview(db: Session = Depends(get_db)):
    _ensure_warranty_table(db)
    try:
        row = db.execute(text("""
            SELECT
                count(*) as total,
                sum(CASE WHEN status='active' AND end_date >= CURRENT_DATE THEN 1 ELSE 0 END) as active,
                sum(CASE WHEN end_date < CURRENT_DATE THEN 1 ELSE 0 END) as expired,
                sum(CASE WHEN end_date BETWEEN CURRENT_DATE AND CURRENT_DATE + 30 THEN 1 ELSE 0 END) as expiring_30
            FROM asset_warranties
        """)).fetchone()
        d = row_to_dict(row)
    except Exception:
        d = {"total":0,"active":0,"expired":0,"expiring_30":0}
    return {
        "total_warranties":   int(d.get("total") or 0),
        "active":             int(d.get("active") or 0),
        "expired":            int(d.get("expired") or 0),
        "expiring_30_days":   int(d.get("expiring_30") or 0),
        "generated_at":       datetime.datetime.utcnow().isoformat(),
    }

@router.post("/", summary="Register asset warranty")
def create_warranty(data: dict, db: Session = Depends(get_db)):
    _ensure_warranty_table(db)
    asset_id = data.get("asset_id")
    if not asset_id:
        raise HTTPException(400, "asset_id required")
    now = datetime.datetime.utcnow()
    wid = str(uuid.uuid4())
    db.execute(text("""
        INSERT INTO asset_warranties
            (id, asset_id, hotel_id, contract_id, warranty_type, provider,
             start_date, end_date, coverage_details, status, created_at)
        VALUES (:id,:asset_id,:hotel_id,:contract_id,:wtype,:provider,
                :start,:end,:coverage,:status,:now)
    """), {
        "id": wid, "asset_id": asset_id,
        "hotel_id": data.get("hotel_id"),
        "contract_id": data.get("contract_id"),
        "wtype": data.get("warranty_type","manufacturer"),
        "provider": data.get("provider",""),
        "start": data.get("start_date", str(datetime.date.today())),
        "end": data.get("end_date", str(datetime.date.today() + datetime.timedelta(days=365))),
        "coverage": data.get("coverage_details",""),
        "status": "active",
        "now": now,
    })
    db.commit()
    return {"success": True, "warranty_id": wid, "message": "Warranty registered"}

@router.get("/asset/{asset_id}", summary="Warranties for an asset")
def asset_warranties(asset_id: str, db: Session = Depends(get_db)):
    _ensure_warranty_table(db)
    try:
        rows = db.execute(text("""
            SELECT w.*, a.name as asset_name, a.category
            FROM asset_warranties w
            LEFT JOIN assets a ON a.id = w.asset_id
            WHERE w.asset_id = :id
            ORDER BY w.end_date DESC
        """), {"id": asset_id}).fetchall()
        warranties = []
        for row in rows:
            r = row_to_dict(row)
            end = r.get("end_date")
            if end:
                if hasattr(end, "date"):
                    end = end.date()
                days_left = (end - datetime.date.today()).days if end else 0
                r["days_remaining"] = days_left
                r["is_expired"] = days_left < 0
                r["expiring_soon"] = 0 <= days_left <= 30
            warranties.append(r)
        return {"asset_id": asset_id, "warranties": warranties, "total": len(warranties)}
    except Exception as e:
        return {"asset_id": asset_id, "warranties": [], "total": 0, "error": str(e)}

@router.get("/expiring", summary="Warranties expiring in 60 days")
def expiring_warranties(days: int = 60, db: Session = Depends(get_db)):
    _ensure_warranty_table(db)
    try:
        rows = db.execute(text("""
            SELECT w.*, a.name as asset_name, a.criticality
            FROM asset_warranties w
            LEFT JOIN assets a ON a.id = w.asset_id
            WHERE w.end_date BETWEEN CURRENT_DATE AND CURRENT_DATE + :days
              AND w.status = 'active'
            ORDER BY w.end_date ASC
        """), {"days": days}).fetchall()
        return {
            "expiring_within_days": days,
            "warranties": [row_to_dict(r) for r in rows],
            "total": len(rows),
        }
    except Exception as e:
        return {"expiring_within_days": days, "warranties": [], "total": 0, "error": str(e)}
