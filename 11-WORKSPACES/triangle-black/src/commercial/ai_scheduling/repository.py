"""
Repository for AI Scheduling Domain
"""
from typing import Dict, Any, List
from sqlalchemy.orm import Session
from sqlalchemy import text

class AISchedulingRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_active_technicians_capacity(self, hotel_id: str) -> List[Dict[str, Any]]:
        rows = self.db.execute(text("""
            SELECT id, name, max_work_orders, current_work_orders, is_active
            FROM technicians
            WHERE is_active = true
              AND hotel_id = :hid
            ORDER BY current_work_orders ASC
        """), {"hid": hotel_id}).fetchall()
        return [dict(r._mapping) for r in rows]

    def get_unassigned_work_orders(self, hotel_id: str) -> List[Dict[str, Any]]:
        rows = self.db.execute(text("""
            SELECT id, title, priority, description, category
            FROM work_orders
            WHERE hotel_id = :hid
              AND status = 'open'
              AND technician_id IS NULL
              AND (deleted_at IS NULL OR deleted_at > NOW())
            ORDER BY priority DESC, created_at ASC
        """), {"hid": hotel_id}).fetchall()
        return [dict(r._mapping) for r in rows]
