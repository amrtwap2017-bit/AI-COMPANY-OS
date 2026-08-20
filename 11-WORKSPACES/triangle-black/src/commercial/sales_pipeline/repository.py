"""
Repository for Sales Pipeline Domain
"""
from typing import Dict, Any, List
from sqlalchemy.orm import Session
from sqlalchemy import text

class SalesPipelineRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_pipeline_stages(self, hotel_id: str) -> List[Dict[str, Any]]:
        rows = self.db.execute(text("""
            SELECT
                COALESCE(status, 'new') AS stage,
                COUNT(*) AS count
            FROM leads
            WHERE hotel_id = :hid
            AND (deleted_at IS NULL OR deleted_at > NOW())
            GROUP BY status
        """), {"hid": hotel_id}).fetchall()
        return [dict(r._mapping) for r in rows]

    def get_conversion_metrics(self, hotel_id: str) -> Dict[str, Any]:
        row = self.db.execute(text("""
            SELECT
                COUNT(*) AS total_leads,
                COUNT(*) FILTER (WHERE status = 'converted' OR status = 'qualified') AS won_leads,
                ROUND(
                    100.0 * COUNT(*) FILTER (WHERE status = 'converted' OR status = 'qualified')
                    / NULLIF(COUNT(*), 0), 1
                ) AS conversion_rate_pct
            FROM leads
            WHERE hotel_id = :hid
            AND (deleted_at IS NULL OR deleted_at > NOW())
        """), {"hid": hotel_id}).fetchone()
        return dict(row._mapping) if row else {"total_leads": 0, "won_leads": 0, "conversion_rate_pct": 0.0}
