"""Stock Balances API Router — extracted from main.py A-007 batch 3"""
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import text
from src.core.database import get_db
from src.core.tenant import get_hotel_id

router = APIRouter(prefix="/stock-api", tags=["inventory"])

@router.get("/balances")
def get_stock_balances(hotel_id: str = Depends(get_hotel_id),
                       db: Session = Depends(get_db),
                       category: str = Query(None),
                       warehouse_id: str = Query(None),
                       limit: int = Query(100, le=500)):
    try:
        where = "WHERE ii.hotel_id = :hid"
        params: dict = {"hid": hotel_id, "limit": limit}
        if category:
            where += " AND LOWER(ii.category) = :cat"
            params["cat"] = category.lower()
        if warehouse_id:
            where += " AND sb.warehouse_id = :wid"
            params["wid"] = warehouse_id

        rows = db.execute(text(f"""
            SELECT ii.id, ii.name, ii.category, ii.unit_of_measure,
                   ii.min_stock, ii.max_stock,
                   COALESCE(sb.qty_on_hand, 0) AS qty_on_hand,
                   COALESCE(sb.qty_available, 0) AS qty_available,
                   CASE
                     WHEN COALESCE(sb.qty_on_hand, 0) = 0 THEN 'out_of_stock'
                     WHEN COALESCE(sb.qty_on_hand, 0) < ii.min_stock THEN 'below_minimum'
                     ELSE 'adequate'
                   END AS stock_status
            FROM inventory_items ii
            LEFT JOIN stock_balances sb ON sb.item_id = ii.id
            {where}
            ORDER BY stock_status, ii.name
            LIMIT :limit
        """), params).fetchall()

        items = [dict(r._mapping) for r in rows]
        return {
            "count": len(items),
            "hotel_id": hotel_id,
            "summary": {
                "out_of_stock": sum(1 for i in items if i.get("stock_status") == "out_of_stock"),
                "below_minimum": sum(1 for i in items if i.get("stock_status") == "below_minimum"),
                "adequate": sum(1 for i in items if i.get("stock_status") == "adequate"),
            },
            "items": items
        }
    except Exception as e:
        return {"count": 0, "items": [], "error": str(e)[:100]}

@router.get("/low-stock-alerts")
def get_low_stock_alerts(hotel_id: str = Depends(get_hotel_id),
                         db: Session = Depends(get_db)):
    try:
        rows = db.execute(text("""
            SELECT ii.id, ii.name, ii.category, ii.min_stock,
                   COALESCE(sb.qty_on_hand, 0) AS qty_on_hand,
                   ii.min_stock - COALESCE(sb.qty_on_hand, 0) AS shortage
            FROM inventory_items ii
            LEFT JOIN stock_balances sb ON sb.item_id = ii.id
            WHERE ii.hotel_id = :hid
              AND COALESCE(sb.qty_on_hand, 0) < ii.min_stock
            ORDER BY shortage DESC
            LIMIT 50
        """), {"hid": hotel_id}).fetchall()
        return {"alert_count": len(rows),
                "alerts": [dict(r._mapping) for r in rows]}
    except Exception as e:
        return {"alert_count": 0, "alerts": [], "error": str(e)[:100]}
