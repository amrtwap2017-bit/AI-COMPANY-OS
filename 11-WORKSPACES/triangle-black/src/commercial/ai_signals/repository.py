"""
Repository for AI Signals Domain
"""
from typing import Dict, Any, List
from sqlalchemy.orm import Session
from sqlalchemy import text

class AISignalsRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_repeated_failures(self, hotel_id: str) -> List[Dict[str, Any]]:
        rows = self.db.execute(text("""
            SELECT
                a.id AS asset_id,
                a.name AS asset_name,
                a.category AS asset_category,
                a.criticality,
                COUNT(w.id) AS wo_count
            FROM assets a
            JOIN work_orders w ON w.asset_id = a.id
            WHERE a.hotel_id = :hid
              AND w.type = 'corrective'
              AND w.created_at >= NOW() - INTERVAL '90 days'
              AND (a.deleted_at IS NULL OR a.deleted_at > NOW())
            GROUP BY a.id, a.name, a.category, a.criticality
            HAVING COUNT(w.id) >= 3
            ORDER BY wo_count DESC
        """), {"hid": hotel_id}).fetchall()
        return [dict(r._mapping) for r in rows]

    def get_overdue_work_orders(self, hotel_id: str) -> List[Dict[str, Any]]:
        rows = self.db.execute(text("""
            SELECT id, title, priority, due_date
            FROM work_orders
            WHERE hotel_id = :hid
              AND status NOT IN ('completed', 'closed', 'cancelled')
              AND due_date < NOW()
              AND (deleted_at IS NULL OR deleted_at > NOW())
            ORDER BY due_date ASC
            LIMIT 10
        """), {"hid": hotel_id}).fetchall()
        return [dict(r._mapping) for r in rows]
