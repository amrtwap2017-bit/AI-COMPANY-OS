"""
Repository for SLA Dashboard Queries
"""
from typing import Dict, Any, List, Optional
from sqlalchemy.orm import Session
from sqlalchemy import text

class SLADashboardRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_hotel_sla_metrics(self, hotel_id: str) -> Dict[str, Any]:
        row = self.db.execute(text("""
            SELECT
                COUNT(*) AS total_orders,
                SUM(CASE WHEN sla_status = 'met' THEN 1 ELSE 0 END) AS met_count,
                SUM(CASE WHEN sla_breached = TRUE OR sla_status = 'breached' THEN 1 ELSE 0 END) AS breached_count,
                SUM(CASE WHEN sla_status = 'on_track' THEN 1 ELSE 0 END) AS on_track_count,
                ROUND(
                    100.0 * SUM(CASE WHEN sla_status = 'met' THEN 1 ELSE 0 END)
                    / NULLIF(COUNT(*), 0), 1
                ) AS compliance_pct,
                AVG(EXTRACT(EPOCH FROM (updated_at - created_at))/3600)
                    FILTER (WHERE status IN ('completed', 'closed')) AS avg_resolution_hours
            FROM work_orders
            WHERE hotel_id = :hid
            AND (deleted_at IS NULL OR deleted_at > NOW())
        """), {"hid": hotel_id}).fetchone()
        
        data = dict(row._mapping) if row else {}
        data["hotel_id"] = hotel_id
        return data

    def get_priority_breakdown(self, hotel_id: str) -> List[Dict[str, Any]]:
        rows = self.db.execute(text("""
            SELECT
                priority,
                COUNT(*) AS total,
                SUM(CASE WHEN sla_status = 'met' THEN 1 ELSE 0 END) AS met,
                SUM(CASE WHEN sla_breached = TRUE OR sla_status = 'breached' THEN 1 ELSE 0 END) AS breached,
                ROUND(
                    100.0 * SUM(CASE WHEN sla_status = 'met' THEN 1 ELSE 0 END)
                    / NULLIF(COUNT(*), 0), 1
                ) AS compliance_pct
            FROM work_orders
            WHERE hotel_id = :hid
            AND (deleted_at IS NULL OR deleted_at > NOW())
            GROUP BY priority
        """), {"hid": hotel_id}).fetchall()
        
        return [dict(r._mapping) for r in rows]

    def get_recent_breaches(self, hotel_id: str, limit: int = 10) -> List[Dict[str, Any]]:
        rows = self.db.execute(text("""
            SELECT id, title, priority, status, sla_hours, sla_breach_at, created_at
            FROM work_orders
            WHERE hotel_id = :hid
            AND (sla_breached = TRUE OR sla_status = 'breached')
            AND (deleted_at IS NULL OR deleted_at > NOW())
            ORDER BY sla_breach_at DESC
            LIMIT :lim
        """), {"hid": hotel_id, "lim": limit}).fetchall()
        
        return [dict(r._mapping) for r in rows]
