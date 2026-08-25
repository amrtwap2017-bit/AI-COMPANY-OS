"""PM Plans API Router — extracted from main.py A-007"""
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import text
from src.core.database import get_db
from src.core.tenant import get_hotel_id

router = APIRouter(prefix="/maintenance/pm-plans-v2", tags=["maintenance"])

@router.get("/")
def list_pm_plans(hotel_id: str = Depends(get_hotel_id),
                  db: Session = Depends(get_db),
                  limit: int = Query(100, le=500),
                  asset_id: str = Query(None),
                  status: str = Query(None)):
    try:
        where = "WHERE hotel_id = :hid"
        params: dict = {"hid": hotel_id, "limit": limit}
        if asset_id:
            where += " AND asset_id = :asset_id"
            params["asset_id"] = asset_id
        if status:
            where += " AND LOWER(status) = :status"
            params["status"] = status.lower()
        rows = db.execute(text(
            f"SELECT * FROM pm_plans {where} ORDER BY next_due_date ASC LIMIT :limit"
        ), params).fetchall()
        return {"count":len(rows),"hotel_id":hotel_id,
                "results":[dict(r._mapping) for r in rows]}
    except Exception as e:
        return {"count":0,"results":[],"error":str(e)[:100]}

@router.get("/{plan_id}")
def get_pm_plan(plan_id: str, hotel_id: str = Depends(get_hotel_id),
                db: Session = Depends(get_db)):
    try:
        row = db.execute(text(
            "SELECT * FROM pm_plans WHERE id=:id AND hotel_id=:hid"
        ), {"id":plan_id,"hid":hotel_id}).fetchone()
        if not row:
            raise HTTPException(404, "PM plan not found")
        return dict(row._mapping)
    except HTTPException: raise
    except Exception as e:
        raise HTTPException(500, str(e)[:200])
