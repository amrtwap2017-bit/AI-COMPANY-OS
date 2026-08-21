"""
Repository for Maintenance Enterprise Domain
"""
from typing import Dict, Any, List, Optional
from sqlalchemy.orm import Session
from sqlalchemy import text

class MaintenanceEnterpriseRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_dashboard_metrics(self, hotel_id: str) -> Dict[str, Any]:
        row = self.db.execute(text("""
            SELECT
                COUNT(*) AS total_plans,
                SUM(CASE WHEN is_active = TRUE THEN 1 ELSE 0 END) AS active_plans,
                SUM(CASE WHEN next_due_ts < NOW() AND is_active = TRUE THEN 1 ELSE 0 END) AS overdue_plans
            FROM maintenance_plans
            WHERE hotel_id = :hid
        """), {"hid": hotel_id}).fetchone()
        return dict(row._mapping) if row else {}

    def list_pm_plans(self, hotel_id: str, limit: int = 50) -> List[Dict[str, Any]]:
        rows = self.db.execute(text("""
            SELECT id, name, asset_id, frequency_days, is_active, next_due_ts
            FROM maintenance_plans
            WHERE hotel_id = :hid
            ORDER BY next_due_ts ASC
            LIMIT :lim
        """), {"hid": hotel_id, "lim": limit}).fetchall()
        return [dict(r._mapping) for r in rows]
