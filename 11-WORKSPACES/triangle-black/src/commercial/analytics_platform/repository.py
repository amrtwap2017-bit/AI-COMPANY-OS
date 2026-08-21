"""
Repository for Analytics Platform Domain
"""
from typing import Dict, Any, List
from sqlalchemy.orm import Session
from sqlalchemy import text

class AnalyticsPlatformRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_scorecard_raw_data(self, hotel_id: str) -> Dict[str, Any]:
        # Aggregate across different domains to compute scorecards
        row = self.db.execute(text("""
            SELECT
                (SELECT COUNT(*) FROM work_orders WHERE hotel_id = :hid AND (deleted_at IS NULL OR deleted_at > NOW())) AS total_wos,
                (SELECT COUNT(*) FROM work_orders WHERE hotel_id = :hid AND status='completed' AND (deleted_at IS NULL OR deleted_at > NOW())) AS completed_wos,
                (SELECT COUNT(*) FROM work_orders WHERE hotel_id = :hid AND (sla_breached = TRUE OR sla_status='breached') AND (deleted_at IS NULL OR deleted_at > NOW())) AS breached_wos,
                (SELECT COUNT(*) FROM assets WHERE hotel_id = :hid AND status='operational' AND (deleted_at IS NULL OR deleted_at > NOW())) AS operational_assets,
                (SELECT COUNT(*) FROM assets WHERE hotel_id = :hid AND (deleted_at IS NULL OR deleted_at > NOW())) AS total_assets
            FROM (VALUES (1)) AS dummy
        """), {"hid": hotel_id}).fetchone()

        return dict(row._mapping) if row else {}

    def get_sla_trend_timeline(self, hotel_id: str) -> List[Dict[str, Any]]:
        rows = self.db.execute(text("""
            SELECT 
                TO_CHAR(created_at, 'YYYY-MM-DD') AS date_str,
                COUNT(*) AS total_orders,
                SUM(CASE WHEN sla_breached = TRUE OR sla_status = 'breached' THEN 1 ELSE 0 END) AS breach_count
            FROM work_orders
            WHERE hotel_id = :hid
            AND (deleted_at IS NULL OR deleted_at > NOW())
            GROUP BY TO_CHAR(created_at, 'YYYY-MM-DD')
            ORDER BY date_str DESC
            LIMIT 14
        """), {"hid": hotel_id}).fetchall()
        
        return [dict(r._mapping) for r in rows]
