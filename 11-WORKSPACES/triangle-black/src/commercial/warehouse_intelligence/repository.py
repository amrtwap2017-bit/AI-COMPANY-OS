"""
Repository for Warehouse Intelligence Domain
"""
from typing import Dict, Any, List
from sqlalchemy.orm import Session
from sqlalchemy import text

class WarehouseIntelligenceRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_stock_health(self, hotel_id: str) -> Dict[str, Any]:
        row = self.db.execute(text("""
            SELECT
                COUNT(ii.id) AS total_skus,
                SUM(CASE WHEN COALESCE(sb.qty_on_hand, 0) <= 0 THEN 1 ELSE 0 END) AS out_of_stock,
                SUM(CASE WHEN COALESCE(sb.qty_on_hand, 0) > 0 AND COALESCE(sb.qty_on_hand, 0) < ii.min_stock THEN 1 ELSE 0 END) AS below_min,
                SUM(CASE WHEN COALESCE(sb.qty_on_hand, 0) > (ii.min_stock * 3) THEN 1 ELSE 0 END) AS overstocked,
                COALESCE(SUM(COALESCE(sb.qty_on_hand, 0) * COALESCE(ii.unit_price, 0)), 0) AS total_valuation
            FROM inventory_items ii
            LEFT JOIN stock_balances sb ON sb.item_id = ii.id
            WHERE ii.hotel_id = :hid
        """), {"hid": hotel_id}).fetchone()
        return dict(row._mapping) if row else {}

    def get_reorder_candidates(self, hotel_id: str, limit: int = 20) -> List[Dict[str, Any]]:
        rows = self.db.execute(text("""
            SELECT
                ii.id AS item_id,
                ii.name AS item_name,
                ii.category,
                ii.min_stock,
                ii.unit_price,
                COALESCE(sb.qty_on_hand, 0) AS qty_on_hand
            FROM inventory_items ii
            LEFT JOIN stock_balances sb ON sb.item_id = ii.id
            WHERE ii.hotel_id = :hid
              AND COALESCE(sb.qty_on_hand, 0) < ii.min_stock
            ORDER BY (ii.min_stock - COALESCE(sb.qty_on_hand, 0)) DESC
            LIMIT :lim
        """), {"hid": hotel_id, "lim": limit}).fetchall()
        return [dict(r._mapping) for r in rows]
