"""
Repository for Predictive Maintenance Domain
"""
from typing import Dict, Any, List
from sqlalchemy.orm import Session
from sqlalchemy import text

class PredictiveMaintenanceRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_assets_telemetry(self, hotel_id: str) -> List[Dict[str, Any]]:
        rows = self.db.execute(text("""
            SELECT 
                a.id AS asset_id,
                a.name AS asset_name,
                a.category,
                a.criticality,
                a.status,
                COALESCE(EXTRACT(DAY FROM (NOW() - a.last_maintenance_date)), 90)::int AS days_since_maintenance,
                COALESCE(EXTRACT(DAY FROM (NOW() - a.installation_date)), 365)::int AS asset_age_days,
                (
                    SELECT COUNT(*)
                    FROM work_orders wo
                    WHERE wo.asset_id = a.id
                      AND wo.type = 'corrective'
                      AND wo.created_at >= NOW() - INTERVAL '90 days'
                ) AS corrective_wos_90d
            FROM assets a
            WHERE a.hotel_id = :hid
              AND (a.deleted_at IS NULL OR a.deleted_at > NOW())
            ORDER BY a.criticality DESC, a.name ASC
        """), {"hid": hotel_id}).fetchall()
        return [dict(r._mapping) for r in rows]
